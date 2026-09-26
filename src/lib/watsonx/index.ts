/**
 * DryRun — watsonx Release Gate Synthesizer
 * Agent 6: Public API
 *
 * Calls IBM watsonx Granite to produce a streaming risk narrative and
 * release gate decision from a chaos simulation result.
 *
 * Public surface:
 *   synthesizeGateStream(result, report, prMeta?) → AsyncGenerator<string, ReleaseGateDecision>
 *
 * Behaviour:
 *   - When WATSONX_API_KEY and WATSONX_PROJECT_ID are set, calls the
 *     watsonx.ai REST text-generation streaming endpoint.
 *   - When credentials are absent, falls back to a high-fidelity local
 *     streaming simulator that generates a realistic narrative without
 *     requiring IBM Cloud access (useful for demos and hackathon judging).
 */

import type {
  ChaosSimulationResult,
  BlastRadiusReport,
  PullRequestMetadata,
  ReleaseGateDecision,
} from '@/types';

import { buildGatePrompt } from './prompt-builder';
import { TokenAccumulator, parseGateDecision, buildFallbackDecision } from './response-parser';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WATSONX_API_VERSION = '2024-05-31';
const WATSONX_BASE_URL = 'https://us-south.ml.cloud.ibm.com';
const GRANITE_MODEL_ID = 'ibm/granite-3-8b-instruct';

/** Token generation parameters for Granite. */
const GENERATION_PARAMS = {
  max_new_tokens: 1200,
  temperature: 0.1,
  top_p: 0.9,
  repetition_penalty: 1.05,
} as const;

/** Delay between simulated token chunks in the local fallback (ms). */
const FALLBACK_TOKEN_DELAY_MS = 18;

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

function getWatsonxCredentials(): { apiKey: string; projectId: string } | null {
  const apiKey = process.env['WATSONX_API_KEY'];
  const projectId = process.env['WATSONX_PROJECT_ID'];
  if (apiKey && projectId) return { apiKey, projectId };
  return null;
}

// ---------------------------------------------------------------------------
// IBM Cloud IAM token fetch
// ---------------------------------------------------------------------------

interface IamTokenResponse {
  access_token: string;
  expiration: number;
}

/** Cached IAM token to avoid a round-trip on every request. */
let cachedIamToken: { token: string; expiresAt: number } | null = null;

async function fetchIamToken(apiKey: string): Promise<string> {
  const now = Date.now() / 1000;
  if (cachedIamToken && cachedIamToken.expiresAt > now + 60) {
    return cachedIamToken.token;
  }

  const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: apiKey,
    }),
  });

  if (!response.ok) {
    throw new Error(`[watsonx] IAM token fetch failed: ${response.status} ${response.statusText}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- external IAM API boundary
  const data = (await response.json()) as IamTokenResponse;
  cachedIamToken = { token: data.access_token, expiresAt: data.expiration };
  return data.access_token;
}

// ---------------------------------------------------------------------------
// watsonx streaming request
// ---------------------------------------------------------------------------

interface WatsonxStreamEvent {
  results?: Array<{
    generated_text: string;
    stop_reason?: string;
  }>;
}

/**
 * Open a streaming connection to the watsonx.ai text-generation endpoint
 * and yield raw token strings.
 */
async function* streamFromWatsonx(
  system: string,
  user: string,
  credentials: { apiKey: string; projectId: string },
): AsyncGenerator<string, void, unknown> {
  const iamToken = await fetchIamToken(credentials.apiKey);

  const url =
    `${WATSONX_BASE_URL}/ml/v1/text/generation_stream` +
    `?version=${WATSONX_API_VERSION}`;

  const body = JSON.stringify({
    model_id: GRANITE_MODEL_ID,
    input: `<|system|>\n${system}\n<|user|>\n${user}\n<|assistant|>\n`,
    parameters: GENERATION_PARAMS,
    project_id: credentials.projectId,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${iamToken}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`[watsonx] Generation stream failed: ${response.status} — ${errText}`);
  }

  if (!response.body) {
    throw new Error('[watsonx] Response body is null');
  }

  const decoder = new TextDecoder();
  const reader = response.body.getReader();

  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const jsonStr = trimmed.slice(5).trim();
        if (jsonStr === '[DONE]') return;

        try {
          const event = JSON.parse(jsonStr) as WatsonxStreamEvent;
          const text = event.results?.[0]?.generated_text;
          if (text) yield text;
        } catch {
          // skip malformed SSE data lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Local fallback simulator
// ---------------------------------------------------------------------------

/** Delay helper */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build a realistic simulated narrative and decision JSON based on the
 * actual simulation data — no IBM Cloud required.
 */
function buildSimulatedOutput(
  result: ChaosSimulationResult,
  report: BlastRadiusReport,
  prMeta?: PullRequestMetadata,
): string {
  const score = result.aggregateRiskScore;
  const blastScore = report.overallBlastScore;

  const decision: 'APPROVED' | 'BLOCKED' = score >= 70 ? 'BLOCKED' : 'APPROVED';

  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (score >= 80) severity = 'CRITICAL';
  else if (score >= 60) severity = 'HIGH';
  else if (score >= 40) severity = 'MEDIUM';
  else severity = 'LOW';

  const topNode = report.topRiskyNodes[0] ?? 'unknown';
  const chainDisplay = result.criticalFailureChain.slice(0, 4).join(' → ');
  const prTitle = prMeta?.title ?? 'Unnamed PR';

  const rationale =
    `## Release Risk Assessment\n\n` +
    `**PR:** ${prTitle}\n\n` +
    `Analysis of ${Object.keys(report.impacts).length} impacted nodes reveals an ` +
    `aggregate risk score of **${score.toFixed(1)}/100** with a blast radius score ` +
    `of **${blastScore.toFixed(1)}**.\n\n` +
    (result.criticalFailureChain.length > 0
      ? `### Critical Failure Chain\n\`${chainDisplay}\`\n\n`
      : '') +
    `The highest-risk node **\`${topNode}\`** has an impact score of ` +
    `${(report.impacts[topNode]?.impactScore ?? 0).toFixed(1)} and failure ` +
    `probability of ${((result.nodeResults[topNode]?.failureProbability ?? 0) * 100).toFixed(1)}%.\n\n` +
    (decision === 'BLOCKED'
      ? `⛔ **BLOCKED**: Risk exceeds acceptable threshold. ` +
        `Recommend immediate review before merging.`
      : `✅ **APPROVED**: Risk is within acceptable bounds. ` +
        `Standard monitoring protocols apply post-deploy.`);

  const riskFactors = [
    `Aggregate risk score ${score.toFixed(1)} (threshold: 70)`,
    `${result.criticalFailureChain.length} nodes on critical failure chain`,
    `${Object.keys(report.impacts).length} nodes within blast radius`,
    `${result.scenarios.length} fault scenario(s) simulated`,
  ];

  const recommendedActions =
    decision === 'BLOCKED'
      ? [
          `Review and harden \`${topNode}\` before deployment`,
          'Add circuit breakers to all critical-path service calls',
          'Ensure feature flags are in place for incremental rollout',
          'Schedule deployment during low-traffic window with on-call present',
        ]
      : [
          'Enable enhanced monitoring for the first 30 minutes post-deploy',
          `Watch error rates on \`${topNode}\` closely`,
          'Confirm rollback procedure is documented and tested',
        ];

  const mitigations = report.topRiskyNodes.slice(0, 3).map((nodeId, i) => ({
    nodeId,
    description: `Validate ${nodeId} handles partial failures gracefully`,
    priority: i === 0 ? severity : 'MEDIUM',
  }));

  const rollbackRunbook = [
    `1. Trigger feature flag OFF for the changed service(s): ${report.changeSet.changedFiles.slice(0, 2).join(', ')}`,
    '2. Revert the deployment via: `kubectl rollout undo deployment/<service-name>`',
    '3. Verify all health checks return 200 via `/health` endpoints',
    '4. Check Kafka consumer lag returns to baseline within 5 minutes',
    '5. Open a P1 incident ticket and notify affected service owners',
    '6. Conduct a 15-minute post-rollback stability window before declaring recovery',
  ];

  return JSON.stringify({
    decision,
    blastScore: Math.round(blastScore),
    severity,
    rationale,
    riskFactors,
    recommendedActions,
    rollbackRunbook,
    mitigations,
    confidenceScore: 0.92,
  });
}

/**
 * Stream the simulated output token by token to mimic real model streaming.
 */
async function* streamFallbackSimulator(
  result: ChaosSimulationResult,
  report: BlastRadiusReport,
  prMeta?: PullRequestMetadata,
): AsyncGenerator<string, void, unknown> {
  const fullText = buildSimulatedOutput(result, report, prMeta);

  // Emit in small chunks to simulate streaming
  const CHUNK_SIZE = 12;
  for (let i = 0; i < fullText.length; i += CHUNK_SIZE) {
    yield fullText.slice(i, i + CHUNK_SIZE);
    await sleep(FALLBACK_TOKEN_DELAY_MS);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Synthesize a release gate decision by streaming tokens from IBM watsonx
 * Granite (or the local fallback simulator when credentials are absent).
 *
 * Yields: raw token strings as they arrive.
 * Returns: the fully-parsed and validated `ReleaseGateDecision`.
 *
 * @example
 * ```ts
 * const gen = synthesizeGateStream(result, report, prMeta);
 * let chunk = await gen.next();
 * while (!chunk.done) {
 *   sendSSE(chunk.value);
 *   chunk = await gen.next();
 * }
 * const decision = chunk.value;
 * ```
 */
export async function* synthesizeGateStream(
  result: ChaosSimulationResult,
  report: BlastRadiusReport,
  prMeta?: PullRequestMetadata,
): AsyncGenerator<string, ReleaseGateDecision, unknown> {
  const runId = result.runId;
  const accumulator = new TokenAccumulator();
  const credentials = getWatsonxCredentials();

  const tokenStream =
    credentials !== null
      ? streamFromWatsonx(
          buildGatePrompt(result, report, prMeta).system,
          buildGatePrompt(result, report, prMeta).user,
          credentials,
        )
      : streamFallbackSimulator(result, report, prMeta);

  try {
    for await (const token of tokenStream) {
      accumulator.push(token);
      yield token;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return buildFallbackDecision(runId, result.aggregateRiskScore, message);
  }

  const rawText = accumulator.flush();
  return parseGateDecision(rawText, result, runId);
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export { buildGatePrompt } from './prompt-builder';
export type { PromptMessages } from './prompt-builder';
export {
  parseGateDecision,
  buildFallbackDecision,
  TokenAccumulator,
} from './response-parser';
