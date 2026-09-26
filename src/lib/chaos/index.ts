/**
 * DryRun — Chaos Fault Injection Engine
 * Agent 4: Public API
 *
 * Orchestrates the full chaos simulation pipeline:
 *
 *   BlastRadiusReport + FaultScenario[]
 *     → Fault Propagation (BFS across dependency graph)
 *     → Per-node NodeSimResult computation
 *     → Summary metrics (availability, resilience score, cascade steps)
 *     → ChaosSimulationResult (Zod-validated)
 *
 * Public surface:
 *   runSimulation(graph, report, scenarios) → ChaosSimulationResult
 */

import type {
  DependencyGraph,
  BlastRadiusReport,
  FaultScenario,
  ChaosSimulationResult,
  NodeId,
  NodeSimResult,
} from '@/types';
import { ChaosSimulationResultSchema } from '@/types';

import { propagateFaults } from './fault-propagator';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Failure probability above which a node counts as "failed" for metrics. */
const FAILED_THRESHOLD = 0.7;

/** Failure probability above which a node counts as "degraded" for metrics. */
const DEGRADED_THRESHOLD = 0.3;

/** Baseline node availability assumed for nodes not touched by any scenario. */
const BASELINE_AVAILABILITY = 1.0;

// ---------------------------------------------------------------------------
// Summary metric helpers
// ---------------------------------------------------------------------------

/**
 * System availability percentage.
 *
 * Models each node as independently available with probability
 * (1 − failureProbability). System availability is the mean of per-node
 * availabilities, expressed as a percentage (0–100).
 *
 * Nodes not present in nodeResults are treated as fully available.
 */
function computeSystemAvailabilityPct(
  nodeResults: Record<NodeId, NodeSimResult>,
  allNodeIds: NodeId[],
): number {
  if (allNodeIds.length === 0) {
    return 100;
  }

  let totalAvailability = 0;
  for (const nodeId of allNodeIds) {
    const result = nodeResults[nodeId];
    const fp = result?.failureProbability ?? 0;
    totalAvailability += BASELINE_AVAILABILITY - fp;
  }

  return Math.min(100, Math.max(0, (totalAvailability / allNodeIds.length) * 100));
}

/**
 * Resilience score (0–100).
 *
 * A composite heuristic that rewards systems that:
 *   - Have a high system availability percentage
 *   - Have fewer nodes on the critical failure chain relative to total nodes
 *   - Have a low overall blast score coming in from the blast-radius report
 *
 * Score = 0.5 × availability  +
 *         0.3 × (1 − chainRatio)  +
 *         0.2 × (1 − blastRatio)
 *
 * All terms normalised to 0–100 before weighting.
 */
function computeResilienceScore(
  systemAvailabilityPct: number,
  criticalFailureChain: NodeId[],
  allNodeIds: NodeId[],
  overallBlastScore: number,
): number {
  const chainRatio =
    allNodeIds.length > 0 ? criticalFailureChain.length / allNodeIds.length : 0;

  const blastRatio = overallBlastScore / 100;

  const score =
    0.5 * systemAvailabilityPct +
    0.3 * (1 - chainRatio) * 100 +
    0.2 * (1 - blastRatio) * 100;

  return Math.min(100, Math.max(0, score));
}

/**
 * Weighted-mean aggregate risk score for the simulation (0–100).
 *
 * Weights failure probability by the node's impact score from the
 * blast-radius report, focusing the score on high-impact nodes.
 * Nodes on a critical path are double-weighted.
 *
 * Nodes without impact data default to weight 1.0.
 */
function computeAggregateRiskScore(
  nodeResults: Record<NodeId, NodeSimResult>,
  report: BlastRadiusReport,
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [nodeId, result] of Object.entries(nodeResults)) {
    const impact = report.impacts[nodeId];
    const baseWeight = impact !== undefined ? impact.impactScore / 100 : 1.0;
    const weight = impact?.onCriticalPath === true ? baseWeight * 2 : baseWeight;
    weightedSum += result.failureProbability * weight * 100;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, weightedSum / totalWeight));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run all fault scenarios against the dependency graph and blast-radius context,
 * producing a fully-validated `ChaosSimulationResult`.
 *
 * @param graph     - The dependency graph (re-used from BlastRadiusReport for
 *                    convenience; also available as `report.graph`).
 * @param report    - Blast-radius report supplying impact weights and critical paths.
 * @param scenarios - Fault scenarios to simulate. Must be non-empty.
 *
 * @throws {Error}  If the assembled result fails Zod schema validation
 *                  (indicates a bug in the propagator, not invalid user input).
 */
export function runSimulation(
  graph: DependencyGraph,
  report: BlastRadiusReport,
  scenarios: FaultScenario[],
): ChaosSimulationResult {
  if (scenarios.length === 0) {
    throw new Error('[chaos] runSimulation requires at least one FaultScenario.');
  }

  // ------------------------------------------------------------------
  // 1. Propagate all scenarios through the graph
  // ------------------------------------------------------------------
  const { nodeResults, simulationSteps, criticalFailureChain } = propagateFaults(
    graph,
    report,
    scenarios,
  );

  // ------------------------------------------------------------------
  // 2. Compute summary metrics
  // ------------------------------------------------------------------
  const allNodeIds = Object.keys(graph.nodes);

  const totalNodesFailed = Object.values(nodeResults).filter(
    (r) => r.failureProbability >= FAILED_THRESHOLD,
  ).length;

  const totalNodesDegraded = Object.values(nodeResults).filter(
    (r) =>
      r.failureProbability >= DEGRADED_THRESHOLD &&
      r.failureProbability < FAILED_THRESHOLD,
  ).length;

  const systemAvailabilityPct = computeSystemAvailabilityPct(nodeResults, allNodeIds);

  const resilienceScore = computeResilienceScore(
    systemAvailabilityPct,
    criticalFailureChain,
    allNodeIds,
    report.overallBlastScore,
  );

  const aggregateRiskScore = computeAggregateRiskScore(nodeResults, report);

  // cascadingSteps = number of distinct BFS wave steps across all scenarios
  const cascadingSteps = simulationSteps.length;

  // ------------------------------------------------------------------
  // 3. Assemble ChaosSimulationResult
  // ------------------------------------------------------------------
  const result: ChaosSimulationResult & {
    totalNodesFailed: number;
    totalNodesDegraded: number;
    systemAvailabilityPct: number;
    resilienceScore: number;
    cascadingSteps: number;
  } = {
    runId: crypto.randomUUID(),
    blastRadiusReport: report,
    scenarios,
    nodeResults,
    criticalFailureChain,
    aggregateRiskScore,
    simulatedAt: new Date().toISOString(),
    // Extended summary metrics (validated below)
    totalNodesFailed,
    totalNodesDegraded,
    systemAvailabilityPct,
    resilienceScore,
    cascadingSteps,
  };

  // ------------------------------------------------------------------
  // 4. Zod validation — catch contract violations early
  // ------------------------------------------------------------------
  const parsed = ChaosSimulationResultSchema.safeParse(result);
  if (!parsed.success) {
    throw new Error(
      `[chaos] ChaosSimulationResult validation failed: ${parsed.error.message}`,
    );
  }

  // Return the richer object (extended metrics pass through with the validated core)
  return result;
}

// ---------------------------------------------------------------------------
// Re-exports — consumers import chaos internals only via this barrel
// ---------------------------------------------------------------------------

export type { NodeStatus, NodeSimState, SimulationStep, PropagationOutput } from './fault-propagator';
export { propagateFaults } from './fault-propagator';
export type { DecayFn } from './decay-functions';
export {
  exponentialDecay,
  linearDecay,
  stepDecay,
  getDecayFunction,
} from './decay-functions';
export {
  DEFAULT_CHAOS_SCENARIOS,
  PLACEHOLDER_NODE_ID,
  SCENARIO_ID_DOWNSTREAM_500_CASCADE,
  SCENARIO_ID_NETWORK_LATENCY_SPIKE,
  SCENARIO_ID_DB_POOL_STARVATION,
  SCENARIO_ID_CONTRACT_SCHEMA_DRIFT,
} from './scenario-presets';
