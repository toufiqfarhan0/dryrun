/**
 * DryRun — watsonx Response Parser
 * Agent 6: watsonx Release Gate Synthesizer
 *
 * Parses and validates raw text output from IBM Granite into a
 * typed `ReleaseGateDecision`. Handles streaming token accumulation,
 * schema extraction via Zod, and error-recovery fallbacks.
 */

import { z } from 'zod';
import type { ReleaseGateDecision, ChaosSimulationResult } from '@/types';
import {
  SeverityLevelSchema,
  GateDecisionSchema,
  MitigationSchema,
} from '@/types';

// ---------------------------------------------------------------------------
// Internal schema for raw model output
// ---------------------------------------------------------------------------

/**
 * Zod schema for the raw JSON envelope the model emits.
 * More permissive than `ReleaseGateDecisionSchema` to allow for minor
 * model deviations; we normalise values before producing the final type.
 */
const RawModelOutputSchema = z.object({
  decision: z.string(),
  blastScore: z.number().min(0).max(100).optional(),
  severity: z.string().optional(),
  rationale: z.string().optional(),
  riskFactors: z.array(z.string()).optional(),
  recommendedActions: z.array(z.string()).optional(),
  rollbackRunbook: z.array(z.string()).optional(),
  mitigations: z
    .array(
      z.object({
        nodeId: z.string(),
        description: z.string(),
        priority: z.string(),
      }),
    )
    .optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
});

type RawModelOutput = z.infer<typeof RawModelOutputSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_CONFIDENCE = 0.75;
const FALLBACK_ROLLBACK_STEPS = [
  'Halt the deployment pipeline immediately.',
  'Revert the commit or feature flag to the last known-good state.',
  'Verify downstream service health via runbook dashboards.',
  'Notify the on-call engineer and open a severity incident ticket.',
  'Monitor error rates for 15 minutes before declaring recovery complete.',
];

/** Patterns to extract a JSON object from potentially noisy model output. */
const JSON_EXTRACT_PATTERNS: RegExp[] = [
  /```json\s*([\s\S]+?)\s*```/,
  /```\s*([\s\S]+?)\s*```/,
  /(\{[\s\S]+\})/,
];

// ---------------------------------------------------------------------------
// Token accumulation
// ---------------------------------------------------------------------------

/**
 * Stateful accumulator for streaming model tokens.
 * Call `push` for each token chunk; call `flush` when the stream ends.
 */
export class TokenAccumulator {
  private buffer = '';

  push(token: string): void {
    this.buffer += token;
  }

  flush(): string {
    return this.buffer;
  }

  reset(): void {
    this.buffer = '';
  }
}

// ---------------------------------------------------------------------------
// Extraction helpers
// ---------------------------------------------------------------------------

/**
 * Attempt to extract a JSON object string from raw text.
 * Tries fenced code-block patterns first, then a bare object match.
 */
function extractJsonString(raw: string): string | null {
  for (const pattern of JSON_EXTRACT_PATTERNS) {
    const match = pattern.exec(raw);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Parse raw text as JSON, returning null on failure.
 */
function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Normalise a decision string to a valid `GateDecision`.
 * Accepts common model deviations like "WARNING" or "APPROVE".
 */
function normaliseDecision(raw: string): ReleaseGateDecision['decision'] {
  const upper = raw.toUpperCase().trim();
  if (upper === 'APPROVED' || upper === 'APPROVE') return 'APPROVED';
  return 'BLOCKED';
}

/**
 * Normalise a severity string to a valid `SeverityLevel`.
 */
function normaliseSeverity(
  raw: string | undefined,
  blastScore: number,
): ReleaseGateDecision['severity'] {
  if (raw) {
    const upper = raw.toUpperCase().trim();
    const parsed = SeverityLevelSchema.safeParse(upper);
    if (parsed.success) return parsed.data;
  }
  // Derive from blast score when the model doesn't provide a valid value
  if (blastScore >= 80) return 'CRITICAL';
  if (blastScore >= 60) return 'HIGH';
  if (blastScore >= 40) return 'MEDIUM';
  return 'LOW';
}

/**
 * Validate and normalise the mitigations array.
 * Filters out entries that don't conform to `MitigationSchema`.
 */
function normaliseMitigations(
  raw: RawModelOutput['mitigations'],
): ReleaseGateDecision['mitigations'] {
  if (!raw || raw.length === 0) return [];

  return raw
    .map((m) => {
      const priorityResult = SeverityLevelSchema.safeParse(m.priority.toUpperCase());
      return MitigationSchema.safeParse({
        nodeId: m.nodeId,
        description: m.description,
        priority: priorityResult.success ? priorityResult.data : 'MEDIUM',
      });
    })
    .filter((r) => r.success)
    .map((r) => r.data);
}

// ---------------------------------------------------------------------------
// Fallback decision builder
// ---------------------------------------------------------------------------

/**
 * Build a conservative fallback `ReleaseGateDecision` when the model
 * output cannot be parsed at all.
 *
 * Uses the chaos simulation's aggregate risk score to infer severity
 * and a conservative BLOCKED decision to protect production.
 */
export function buildFallbackDecision(
  runId: string,
  aggregateRiskScore: number,
  parseError: string,
): ReleaseGateDecision {
  const blastScore = aggregateRiskScore;
  const severity = normaliseSeverity(undefined, blastScore);

  const decision: ReleaseGateDecision['decision'] =
    blastScore >= 40 ? 'BLOCKED' : 'APPROVED';

  return {
    runId,
    severity,
    decision,
    narrative: `## ⚠️ Parse Error — Conservative Fallback\n\n` +
      `The watsonx model response could not be parsed. ` +
      `A conservative **${decision}** gate has been applied based on the ` +
      `aggregate risk score of **${blastScore.toFixed(1)}**.\n\n` +
      `**Parse error:** ${parseError}`,
    mitigations: [],
    confidenceScore: DEFAULT_CONFIDENCE * 0.5,
    generatedAt: new Date().toISOString(),
    blastScore,
    rollbackRunbook: FALLBACK_ROLLBACK_STEPS,
  };
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

/**
 * Parse the accumulated model output text into a validated
 * `ReleaseGateDecision`.
 *
 * Performs multi-stage extraction:
 *   1. Extract JSON from raw text (handles code fences, bare JSON)
 *   2. Validate against `RawModelOutputSchema`
 *   3. Normalise values to `ReleaseGateDecision`
 *   4. Fall back gracefully if any stage fails
 *
 * @param rawText          - Full accumulated text from the model stream.
 * @param simulationResult - The chaos result used to derive fallback values.
 * @param runId            - UUID tying this decision to the pipeline run.
 */
export function parseGateDecision(
  rawText: string,
  simulationResult: ChaosSimulationResult,
  runId: string,
): ReleaseGateDecision {
  const { aggregateRiskScore } = simulationResult;

  // Stage 1: Extract JSON string
  const jsonStr = extractJsonString(rawText) ?? rawText.trim();

  // Stage 2: Parse JSON
  const parsed = tryParseJson(jsonStr);
  if (parsed === null) {
    return buildFallbackDecision(runId, aggregateRiskScore, 'Response is not valid JSON');
  }

  // Stage 3: Validate against raw schema
  const validated = RawModelOutputSchema.safeParse(parsed);
  if (!validated.success) {
    return buildFallbackDecision(
      runId,
      aggregateRiskScore,
      validated.error.issues.map((i) => i.message).join('; '),
    );
  }

  const raw = validated.data;

  // Stage 4: Normalise decision — fall back to BLOCKED on invalid values
  const decisionResult = GateDecisionSchema.safeParse(raw.decision.toUpperCase());
  const decision: ReleaseGateDecision['decision'] = decisionResult.success
    ? decisionResult.data
    : normaliseDecision(raw.decision);

  const blastScore = raw.blastScore ?? aggregateRiskScore;
  const severity = normaliseSeverity(raw.severity, blastScore);

  const rollbackRunbook =
    raw.rollbackRunbook && raw.rollbackRunbook.length >= 1
      ? raw.rollbackRunbook
      : FALLBACK_ROLLBACK_STEPS;

  const narrative =
    raw.rationale ??
    `## Risk Assessment\n\nAggregate risk score: **${blastScore.toFixed(1)}**\n` +
      (raw.riskFactors?.map((f) => `- ${f}`).join('\n') ?? '');

  return {
    runId,
    severity,
    decision,
    narrative,
    mitigations: normaliseMitigations(raw.mitigations),
    confidenceScore: raw.confidenceScore ?? DEFAULT_CONFIDENCE,
    generatedAt: new Date().toISOString(),
    blastScore,
    rollbackRunbook,
  };
}
