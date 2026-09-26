/**
 * DryRun — POST /api/analyze
 * App Router Route Handler
 *
 * Accepts a repository URL, in-memory file tree, or preset name.
 * Ingests the repository via the AST dependency ingester, evaluates the
 * blast radius, and returns { graph, report }.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';

import type { ChangeSet } from '@/types';
import { ingestRepository } from '@/lib/ingester';
import { evaluateBlastRadius } from '@/lib/blast-radius';
import { ENTERPRISE_MESH } from '@/lib/fixtures/enterprise-mesh';

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------

const AnalyzeBodySchema = z.object({
  /**
   * A remote repository URL to clone and ingest (optional — server must have
   * filesystem access and git available).
   */
  repoUrl: z.string().url().optional(),
  /**
   * In-memory file tree mapping relative path → file content.
   * Use for demos, tests, and client-side analysis.
   */
  fileTree: z.record(z.string(), z.string()).optional(),
  /**
   * Use a named preset fixture instead of a live repo or file tree.
   * Currently supported: "enterprise-mesh"
   */
  preset: z.enum(['enterprise-mesh']).optional(),
  /** Files modified in the PR (used to seed the change set). */
  changedFiles: z.array(z.string()).optional(),
  /** Files added in the PR. */
  addedFiles: z.array(z.string()).optional(),
  /** Files deleted in the PR. */
  deletedFiles: z.array(z.string()).optional(),
  /** PR metadata for context. */
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

type AnalyzeBody = z.infer<typeof AnalyzeBodySchema>;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // --- Parse & validate request body ---
  let body: AnalyzeBody;
  try {
    const raw: unknown = await request.json();
    const parsed = AnalyzeBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 },
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  if (!body.repoUrl && !body.fileTree && !body.preset) {
    return NextResponse.json(
      { error: 'Provide one of: repoUrl, fileTree, or preset' },
      { status: 400 },
    );
  }

  try {
    const runId = randomUUID();

    // --- Ingest graph ---
    let graph = body.preset === 'enterprise-mesh'
      ? ENTERPRISE_MESH
      : await ingestRepository({
          fileMap: body.fileTree,
          repoUrl: body.repoUrl,
        });

    // --- Build change set ---
    const changeSet: ChangeSet = {
      runId,
      changedFiles: body.changedFiles ?? (
        // When no changed files specified, seed with the first node as a default
        Object.keys(graph.nodes).slice(0, 1)
      ),
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

    // --- Evaluate blast radius ---
    const report = evaluateBlastRadius(graph, changeSet);

    return NextResponse.json({ graph, report }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
