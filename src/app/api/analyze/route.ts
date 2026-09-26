/**
 * DryRun — POST /api/analyze
 * App Router Route Handler
 *
 * Two operating modes, selected by request body shape:
 *
 * MODE A — Static Analysis (new)
 *   Input:  { repoUrl: string }  — fetches GitHub zipball
 *       OR  { base64Data: string } — decodes uploaded zip
 *   Output: { projectName, stack, modules, aiResult }
 *
 * MODE B — Blast-Radius Graph (existing, preserved)
 *   Input:  { fileTree?, preset?, changedFiles?, ... }
 *   Output: { graph, report }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';

import type { ChangeSet, ProjectData } from '@/types';
import { ingestRepository } from '@/lib/ingester';
import { evaluateBlastRadius } from '@/lib/blast-radius';
import { ENTERPRISE_MESH } from '@/lib/fixtures/enterprise-mesh';
import { extractFileTree, generateDeterministicAnalysis } from '@/lib/analysis';

// ---------------------------------------------------------------------------
// § 1. Mode A — Static analysis request schema
// ---------------------------------------------------------------------------

const StaticAnalysisBodySchema = z.object({
  repoUrl: z.string().url().optional(),
  base64Data: z.string().min(1).optional(),
});

type StaticAnalysisBody = z.infer<typeof StaticAnalysisBodySchema>;

// ---------------------------------------------------------------------------
// § 2. Mode B — Blast-radius graph request schema (original)
// ---------------------------------------------------------------------------

const BlastRadiusBodySchema = z.object({
  repoUrl: z.string().url().optional(),
  fileTree: z.record(z.string(), z.string()).optional(),
  preset: z.enum(['enterprise-mesh']).optional(),
  changedFiles: z.array(z.string()).optional(),
  addedFiles: z.array(z.string()).optional(),
  deletedFiles: z.array(z.string()).optional(),
  prMetadata: z
    .object({
      title: z.string(),
      description: z.string().optional(),
      author: z.string(),
      targetBranch: z.string(),
      url: z.string().url().optional(),
    })
    .optional(),
});

type BlastRadiusBody = z.infer<typeof BlastRadiusBodySchema>;

// ---------------------------------------------------------------------------
// § 3. GitHub zipball fetch helpers
// ---------------------------------------------------------------------------

const GITHUB_ZIPBALL_RE =
  /^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:\/.*)?$/;

/** Converts a github.com repo URL to the REST API zipball endpoint. */
function toZipballUrl(repoUrl: string): string | null {
  const match = GITHUB_ZIPBALL_RE.exec(repoUrl);
  if (!match) return null;
  const owner = match[1];
  const repo = match[2];
  return `https://api.github.com/repos/${owner}/${repo}/zipball`;
}

interface FetchZipResult {
  buffer: Buffer;
  projectName: string;
}

async function fetchGitHubZip(repoUrl: string): Promise<FetchZipResult> {
  const zipUrl = toZipballUrl(repoUrl);
  if (!zipUrl) {
    throw new Error(`Cannot parse GitHub repository URL: ${repoUrl}`);
  }

  const headers: Record<string, string> = {
    'User-Agent': 'DryRun-Analyzer/1.0',
    Accept: 'application/vnd.github+json',
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(zipUrl, { headers });

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      'GitHub returned 401/403. The repository may be private. ' +
        'Set the GITHUB_TOKEN environment variable to access private repositories.',
    );
  }

  if (response.status === 429) {
    const resetHeader = response.headers.get('x-ratelimit-reset');
    const resetAt = resetHeader
      ? `Rate limit resets at ${new Date(parseInt(resetHeader, 10) * 1000).toISOString()}.`
      : 'Rate limit reset time unknown.';
    throw new Error(`GitHub API rate limit exceeded. ${resetAt}`);
  }

  if (!response.ok) {
    throw new Error(`GitHub returned HTTP ${response.status} for ${zipUrl}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Derive project name from the URL
  const match = GITHUB_ZIPBALL_RE.exec(repoUrl);
  const projectName = match ? `${match[1]}/${match[2]}` : repoUrl;

  return { buffer, projectName };
}

// ---------------------------------------------------------------------------
// § 4. Mode A handler
// ---------------------------------------------------------------------------

async function handleStaticAnalysis(body: StaticAnalysisBody): Promise<NextResponse> {
  let zipBuffer: Buffer;
  let projectName: string;

  if (body.base64Data) {
    try {
      zipBuffer = Buffer.from(body.base64Data, 'base64');
      projectName = 'uploaded-project';
    } catch {
      return NextResponse.json({ error: 'Invalid base64Data — could not decode buffer' }, { status: 400 });
    }
  } else if (body.repoUrl) {
    try {
      const result = await fetchGitHubZip(body.repoUrl);
      zipBuffer = result.buffer;
      projectName = result.projectName;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch repository';
      const isAuthError = message.includes('401/403') || message.includes('private');
      const isRateLimit = message.includes('rate limit');
      const status = isAuthError ? 403 : isRateLimit ? 429 : 502;
      return NextResponse.json({ error: message }, { status });
    }
  } else {
    return NextResponse.json(
      { error: 'Provide one of: repoUrl (GitHub URL) or base64Data (zip file)' },
      { status: 400 },
    );
  }

  let fileTree: ReturnType<typeof extractFileTree>;
  try {
    fileTree = extractFileTree(zipBuffer);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to extract zip archive';
    return NextResponse.json({ error: `Archive extraction failed: ${message}` }, { status: 422 });
  }

  if (Object.keys(fileTree).length === 0) {
    return NextResponse.json(
      { error: 'Zip archive contains no readable text files' },
      { status: 422 },
    );
  }

  const aiResult = generateDeterministicAnalysis(projectName, fileTree);

  const payload: ProjectData = {
    projectName,
    modules: aiResult.modules ?? [],
    stack: aiResult.stack ?? [],
    aiResult,
  };

  return NextResponse.json(payload, { status: 200 });
}

// ---------------------------------------------------------------------------
// § 5. Mode B handler (blast-radius graph — original behaviour)
// ---------------------------------------------------------------------------

async function handleBlastRadius(body: BlastRadiusBody): Promise<NextResponse> {
  const runId = randomUUID();

  const graph =
    body.preset === 'enterprise-mesh'
      ? ENTERPRISE_MESH
      : await ingestRepository({
          fileMap: body.fileTree,
          repoUrl: body.repoUrl,
        });

  const changeSet: ChangeSet = {
    runId,
    changedFiles: body.changedFiles ?? Object.keys(graph.nodes).slice(0, 1),
    addedFiles: body.addedFiles ?? [],
    deletedFiles: body.deletedFiles ?? [],
    prMetadata: body.prMetadata
      ? {
          title: body.prMetadata.title,
          description: body.prMetadata.description ?? '',
          author: body.prMetadata.author,
          targetBranch: body.prMetadata.targetBranch,
          url: body.prMetadata.url,
        }
      : undefined,
  };

  const report = evaluateBlastRadius(graph, changeSet);
  return NextResponse.json({ graph, report }, { status: 200 });
}

// ---------------------------------------------------------------------------
// § 6. Route dispatcher
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  // Detect mode: presence of `base64Data` unambiguously selects Mode A.
  // `repoUrl` alone could go to either mode — prefer Mode A when it is the only
  // non-standard field (i.e. no `fileTree`, `preset`, `changedFiles`, etc.).
  const isStaticAnalysisRequest =
    raw !== null &&
    typeof raw === 'object' &&
    !Array.isArray(raw) &&
    ('base64Data' in raw ||
      ('repoUrl' in raw &&
        !('fileTree' in raw) &&
        !('preset' in raw) &&
        !('changedFiles' in raw) &&
        !('addedFiles' in raw) &&
        !('deletedFiles' in raw)));

  if (isStaticAnalysisRequest) {
    const parsed = StaticAnalysisBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 },
      );
    }
    try {
      return await handleStaticAnalysis(parsed.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Mode B — blast-radius pipeline
  const parsed = BlastRadiusBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const body = parsed.data;
  if (!body.repoUrl && !body.fileTree && !body.preset) {
    return NextResponse.json(
      { error: 'Provide one of: repoUrl, fileTree, or preset' },
      { status: 400 },
    );
  }

  try {
    return await handleBlastRadius(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
