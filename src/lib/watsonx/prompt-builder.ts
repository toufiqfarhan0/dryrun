/**
 * DryRun — watsonx Prompt Builder
 * Agent 6: watsonx Release Gate Synthesizer
 *
 * Constructs structured prompts for IBM Granite foundation models.
 * Produces a system + user message pair consumed by the watsonx
 * text-generation API.
 */

import type {
  ChaosSimulationResult,
  BlastRadiusReport,
  PullRequestMetadata,
  NodeId,
} from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_RISKY_NODES_IN_PROMPT = 5;
const MAX_CRITICAL_PATH_DEPTH = 8;
const MAX_FAILURE_CHAIN_DISPLAY = 6;

/** Expected JSON envelope the model must return. */
export const EXPECTED_JSON_KEYS = [
  'decision',
  'blastScore',
  'severity',
  'rationale',
  'riskFactors',
  'recommendedActions',
  'rollbackRunbook',
  'mitigations',
  'confidenceScore',
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PromptMessages {
  system: string;
  user: string;
}

interface RiskyNodeSummary {
  nodeId: NodeId;
  impactScore: number;
  failureProbability: number;
  onCriticalPath: boolean;
}

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

/**
 * Build the system prompt that establishes the model's role and
 * enforces the strict JSON output contract.
 */
function buildSystemPrompt(): string {
  return `You are an elite Principal Site Reliability Engineer and Release Auditor with deep expertise \
in distributed systems, failure analysis, and production risk management.

Your task is to perform a rigorous pre-deployment blast-radius and chaos simulation review.
You will receive structured JSON data describing a dependency graph analysis and chaos fault simulation.

You MUST respond with a single, valid JSON object — no markdown fences, no preamble, no trailing text.
The JSON object must conform exactly to this schema:

{
  "decision": "APPROVED" | "BLOCKED",
  "blastScore": <number 0-100>,
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "rationale": "<markdown string, max 400 words — clear narrative of the risk>",
  "riskFactors": ["<string>", ...],
  "recommendedActions": ["<string>", ...],
  "rollbackRunbook": ["<step string>", ...],
  "mitigations": [
    { "nodeId": "<string>", "description": "<string>", "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }
  ],
  "confidenceScore": <number 0.0-1.0>
}

Decision rules:
- BLOCKED: aggregateRiskScore ≥ 70, OR any node failureProbability ≥ 0.9, OR severity is CRITICAL or HIGH with critical-path nodes failing
- APPROVED: aggregateRiskScore < 40 AND no CRITICAL severity nodes on the critical path
- WARNING falls back to BLOCKED when gate decision is binary
- Severity mapping: score 0-39 → LOW, 40-59 → MEDIUM, 60-79 → HIGH, 80-100 → CRITICAL
- confidenceScore: your own confidence in the assessment (0.85–0.99 for deterministic data)
- rollbackRunbook: ordered list of concrete rollback steps, minimum 3
- mitigations: up to 5 items, ordered by priority descending`;
}

/**
 * Extract the top risky nodes with their simulation data merged in.
 */
function extractRiskyNodeSummaries(
  report: BlastRadiusReport,
  result: ChaosSimulationResult,
): RiskyNodeSummary[] {
  return report.topRiskyNodes.slice(0, MAX_RISKY_NODES_IN_PROMPT).map((nodeId) => {
    const impact = report.impacts[nodeId];
    const simResult = result.nodeResults[nodeId];
    return {
      nodeId,
      impactScore: impact?.impactScore ?? 0,
      failureProbability: simResult?.failureProbability ?? 0,
      onCriticalPath: impact?.onCriticalPath ?? false,
    };
  });
}

/**
 * Build the user message containing the structured simulation payload.
 */
function buildUserMessage(
  result: ChaosSimulationResult,
  report: BlastRadiusReport,
  prMeta?: PullRequestMetadata,
): string {
  const riskyNodes = extractRiskyNodeSummaries(report, result);

  const criticalPathsDisplay = report.criticalPaths
    .slice(0, 3)
    .map((path) => path.slice(0, MAX_CRITICAL_PATH_DEPTH).join(' → '))
    .join('\n');

  const failureChainDisplay = result.criticalFailureChain
    .slice(0, MAX_FAILURE_CHAIN_DISPLAY)
    .join(' → ');

  const scenarioSummaries = result.scenarios.map((s) => ({
    name: s.name,
    faultType: s.faultType,
    targetNode: s.targetNodeId,
    severity: s.params.severity,
  }));

  const payload = {
    runId: result.runId,
    prMetadata: prMeta ?? null,
    blastRadiusSummary: {
      overallBlastScore: report.overallBlastScore,
      totalImpactedNodes: Object.keys(report.impacts).length,
      topRiskyNodes: riskyNodes,
      criticalPaths: criticalPathsDisplay,
      changedFiles: report.changeSet.changedFiles,
    },
    chaosSimulationSummary: {
      aggregateRiskScore: result.aggregateRiskScore,
      criticalFailureChain: failureChainDisplay,
      scenarios: scenarioSummaries,
      highestFailureProbabilityNodes: Object.entries(result.nodeResults)
        .sort((a, b) => b[1].failureProbability - a[1].failureProbability)
        .slice(0, MAX_RISKY_NODES_IN_PROMPT)
        .map(([nodeId, r]) => ({
          nodeId,
          failureProbability: r.failureProbability,
          estimatedLatencyMultiplier: r.estimatedLatencyMultiplier,
        })),
    },
  };

  return JSON.stringify(payload, null, 2);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Construct the system and user prompt messages for IBM Granite.
 *
 * @param result  - Chaos simulation result with per-node failure probabilities.
 * @param report  - Blast-radius report with impact scores and critical paths.
 * @param prMeta  - Optional PR metadata for additional context.
 */
export function buildGatePrompt(
  result: ChaosSimulationResult,
  report: BlastRadiusReport,
  prMeta?: PullRequestMetadata,
): PromptMessages {
  return {
    system: buildSystemPrompt(),
    user: buildUserMessage(result, report, prMeta),
  };
}
