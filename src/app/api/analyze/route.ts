import { NextRequest, NextResponse } from 'next/server'
import {
  buildSystemSnapshot,
  extractFirstJsonObject,
  generateDeterministicAnalysis,
  generateDeterministicRiskScore,
  simpleHash,
  type SystemSnapshot,
} from '@/lib/codebase-analyzer'

// adm-zip is a Node-only library, so this route cannot run on the Edge runtime.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Hobby tier caps this at 10 seconds. Raise on Pro if Watson calls run long.
export const maxDuration = 10

export async function POST(request: NextRequest) {
  try {
    const { fileSize, base64Data, repoUrl } = await request.json()

    let buffer: Buffer
    let resolvedFileSize = fileSize || '0'
    let customProjectName: string | undefined

    if (repoUrl) {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/i)
      if (!match) {
        return NextResponse.json(
          { error: 'Invalid GitHub repository URL. Expected format: https://github.com/owner/repo' },
          { status: 400 }
        )
      }
      const owner = match[1]
      const repo = match[2].replace(/\.git$/i, '')
      customProjectName = repo

      const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/zipball`, {
        headers: {
          'User-Agent': 'Sandbox-Deployment-Risk-Engine',
          Accept: 'application/vnd.github.v3+json',
        },
        redirect: 'follow',
      })

      if (!ghRes.ok) {
        let msg = `GitHub returned status ${ghRes.status} (${ghRes.statusText})`
        const isPrivate = ghRes.status === 404 || ghRes.status === 401
        if (ghRes.status === 404) msg = 'GitHub repository not found or is private.'
        if (ghRes.status === 403) msg = 'GitHub API rate limit exceeded. Please upload a .zip archive directly.'
        return NextResponse.json({ error: msg, isPrivateRepo: isPrivate }, { status: 400 })
      }

      const arrayBuffer = await ghRes.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      resolvedFileSize = (buffer.length / 1024).toFixed(1)
    } else if (base64Data) {
      buffer = Buffer.from(base64Data, 'base64')
    } else {
      return NextResponse.json(
        { error: 'Neither uploaded zip data nor a GitHub repository URL was provided.' },
        { status: 400 }
      )
    }

    let snapshot: SystemSnapshot
    try {
      snapshot = buildSystemSnapshot(buffer, resolvedFileSize)
      if (customProjectName) {
        snapshot.project_name = customProjectName
      }
    } catch (error: any) {
      return NextResponse.json(
        {
          error: `Uploaded repository could not be parsed: ${error?.message || 'invalid archive'}`,
        },
        { status: 400 }
      )
    }

    const fileHash = simpleHash(JSON.stringify(snapshot.folder_structure))
    const prompt = buildPrompt(snapshot)

    const hasWatsonConfig =
      process.env.WATSONX_API_KEY &&
      process.env.WATSONX_PROJECT_ID &&
      process.env.WATSONX_API_KEY !== 'your_api_key_here'

    let result
    let usedWatson = false

    if (hasWatsonConfig) {
      try {
        result = await analyzeWithWatson(prompt, fileHash)
        usedWatson = true

        // Only override if Watson returned no usable score at all. A legitimate
        // 0 (no risk detected) is preserved.
        if (typeof result.risk_score !== 'number' || Number.isNaN(result.risk_score)) {
          result.risk_score = generateDeterministicRiskScore(snapshot.findings)
        }
      } catch (error: any) {
        console.error('Watson analysis failed:', error?.message || error)
        result = generateDeterministicAnalysis(snapshot)
      }
    } else {
      result = generateDeterministicAnalysis(snapshot)
    }

    // Ensure modules are always populated with rich architectural modules
    if (!result.modules || !Array.isArray(result.modules) || result.modules.length === 0) {
      result.modules = generateDeterministicAnalysis(snapshot).modules
    }

    result._meta = {
      usedWatson,
      timestamp: new Date().toISOString(),
      fileHash,
      detectedStack: snapshot.stack,
      totalFiles: snapshot.file_stats.total_files,
      findingsCount: snapshot.findings.length,
      snapshot,
    }

    return NextResponse.json({ result })
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze project' },
      { status: 500 }
    )
  }
}

function buildPrompt(snapshot: SystemSnapshot): string {
  const findingsBlock =
    snapshot.findings.length === 0
      ? '- None detected by static analysis.'
      : snapshot.findings
          .map(
            f =>
              `- [${f.severity.toUpperCase()}] ${f.description} at ${f.file}:${f.line} — evidence: ${f.evidence}`
          )
          .join('\n')

  return `You are a deployment risk analyst. Given a system snapshot produced by static analysis of an uploaded codebase, return an HONEST risk assessment grounded only in evidence the snapshot contains.

GROUND RULES (read carefully):
- Only report issues you can directly evidence from the snapshot.
- An empty "issues" array is a valid and correct response when the snapshot has no risk signals.
- Do NOT fabricate problems to make the report look thorough.
- Do NOT invent dollar costs, latency numbers, or user counts unless they are clearly supported by the snapshot.
- "Tight coupling" requires real evidence of cyclic or excessive imports — not just two files referenced from the same composition root.
- Match risk_score to the evidence:
    * 0–19  = no detectable risk
    * 20–39 = minor, advisory
    * 40–59 = moderate, worth addressing pre-deploy
    * 60–79 = high, should block deploy until fixed
    * 80–100 = critical, multiple confirmed serious issues
- If the project is small or has no detectable issues, return risk_score < 20, issues: [], and a short normal-operation simulation.
- Severity scale: low | medium | high | critical. Reserve "critical" for confirmed exploitable issues.

=== SYSTEM SNAPSHOT ===

Project: ${snapshot.project_name}
Summary: ${snapshot.project_summary}
Stack: ${snapshot.stack.join(', ') || 'unknown'}
Entry Points: ${snapshot.entry_points.join(', ') || 'none detected'}
Total Files: ${snapshot.file_stats.total_files}
Code Files: ${snapshot.file_stats.code_files}
Size: ${snapshot.file_stats.size_kb} KB

Key Folders:
${snapshot.folder_structure.folders.slice(0, 10).map(folder => `- ${folder}`).join('\n') || '- (none)'}

Key Files:
${snapshot.folder_structure.key_files.map(file => `- ${file}`).join('\n') || '- (none)'}

Dependency Graph (sampled):
${snapshot.dependency_graph.relationships.slice(0, 8).map(relationship => `- ${relationship}`).join('\n') || '- (none)'}

Risk Findings Detected by Static Analysis:
${findingsBlock}

=== END SNAPSHOT ===

Return ONLY valid JSON, no markdown, with this exact shape:

{
  "projectName": "${snapshot.project_name}",
  "stack": ${JSON.stringify(snapshot.stack)},
  "modules": [
    {"name": "Module Name", "risk": "ok|warn|danger", "files": 10}
  ],
  "risk_score": 0-100,
  "summary": "2-3 sentence executive summary tied to evidence",
  "issues": [
    {
      "type": "performance|security|architecture",
      "severity": "low|medium|high|critical",
      "description": "specific issue with file/line reference if available",
      "impact": "concrete impact, no fabricated numbers"
    }
  ],
  "simulation": [
    {"time": "T+0s", "event": "what happens", "type": "normal|warn|danger"}
  ]
}

Keep the simulation short (3-6 events) and tied to the evidence. If the project is clean, the simulation should describe normal operation.`
}

async function analyzeWithWatson(prompt: string, fileHash: number): Promise<any> {
  const apiKey = process.env.WATSONX_API_KEY
  const projectId = process.env.WATSONX_PROJECT_ID
  const url = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com'
  const modelId = process.env.WATSONX_MODEL_ID || 'ibm/granite-4-h-small'

  const tokenResponse = await fetch('https://iam.cloud.ibm.com/identity/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${apiKey}`,
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    throw new Error(`IAM authentication failed: ${tokenResponse.status} - ${errorText}`)
  }

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token
  const seed = Math.abs(fileHash) % 10000

  const response = await fetch(`${url}/ml/v1/text/chat?version=2023-05-29`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      model_id: modelId,
      messages: [
        {
          role: 'system',
          content:
            'You are a deployment risk analyst. Produce HONEST risk assessments grounded only in evidence from the provided snapshot. An empty issues array is valid when no risks are detectable. Never fabricate findings. Respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      parameters: {
        max_tokens: 3000,
        temperature: 0.4,
        top_p: 0.9,
        random_seed: seed,
        stop_sequences: ['```\n\n', '\n\nHuman:', '\n\nUser:'],
      },
      project_id: projectId,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Watsonx API failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const generatedText = data.choices?.[0]?.message?.content || data.results?.[0]?.generated_text || ''
  return extractFirstJsonObject(generatedText)
}
