/**
 * DryRun — Chaos Fault Injection Engine
 * Fault Propagator
 *
 * Implements step-by-step fault simulation across the dependency graph.
 *
 * Algorithm (per scenario):
 *   1. Inject initial fault at the origin node.
 *   2. BFS forward along dependency edges, applying the chosen decay function
 *      per hop.
 *   3. Account for resilience mechanisms: retries attenuate error rate,
 *      circuit breakers cap failure propagation, timeouts bound latency impact.
 *   4. Merge results across scenarios (per-node max probability wins).
 *   5. Emit discrete SimulationStep[] for UI timeline scrubbing.
 *
 * The propagator returns:
 *   - Per-node NodeSimResult (failure probability, latency multiplier, etc.)
 *   - Ordered SimulationStep[] for playback
 *   - Critical failure chain (highest-probability path to a service boundary)
 */

import type {
  BlastRadiusReport,
  FaultScenario,
  NodeId,
  NodeSimResult,
  DependencyGraph,
  GraphEdge,
} from '@/types';

import { getDecayFunction } from './decay-functions';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Failure probability above which a node is considered FAILED. */
const FAILED_THRESHOLD = 0.7;

/** Failure probability above which a node is considered DEGRADED (but not FAILED). */
const DEGRADED_THRESHOLD = 0.3;

/** Base latency multiplier for a fully failed node. */
const MAX_LATENCY_MULTIPLIER = 8.0;

/**
 * Resilience attenuation factors.
 *
 * When a node has resilience annotations in metadata, the raw failure
 * probability is multiplied by these constants before being stored.
 */
const RESILIENCE_RETRY_FACTOR = 0.7;
const RESILIENCE_CIRCUIT_BREAKER_FACTOR = 0.5;
const RESILIENCE_TIMEOUT_FACTOR = 0.8;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type NodeStatus = 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'ISOLATED';

export interface NodeSimState {
  nodeId: NodeId;
  failureProbability: number;
  estimatedLatencyMultiplier: number;
  status: NodeStatus;
  affectedByScenarios: string[];
}

/**
 * A single discrete step in the simulation timeline.
 * Each BFS wave (hop depth) from a scenario origin becomes one step,
 * enabling the ScenarioTimeline UI to scrub through propagation.
 */
export interface SimulationStep {
  stepIndex: number;
  scenarioId: string;
  /** Hop depth this step represents */
  depth: number;
  /** Node IDs whose state changed in this step */
  affectedNodes: NodeId[];
  /** Snapshot of every node's state at this point in the timeline */
  nodeStates: Record<NodeId, NodeSimState>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Build forward adjacency: nodeId → outgoing edges */
function buildForwardAdjacency(edges: GraphEdge[]): Map<NodeId, GraphEdge[]> {
  const adj = new Map<NodeId, GraphEdge[]>();
  for (const edge of edges) {
    const existing = adj.get(edge.source);
    if (existing !== undefined) {
      existing.push(edge);
    } else {
      adj.set(edge.source, [edge]);
    }
  }
  return adj;
}

/** Build reverse adjacency: nodeId → incoming edges (target → source) */
function buildReverseAdjacency(edges: GraphEdge[]): Map<NodeId, GraphEdge[]> {
  const adj = new Map<NodeId, GraphEdge[]>();
  for (const edge of edges) {
    const existing = adj.get(edge.target);
    if (existing !== undefined) {
      existing.push(edge);
    } else {
      adj.set(edge.target, [edge]);
    }
  }
  return adj;
}

/**
 * Apply resilience factor to the raw failure probability of a node.
 *
 * Reads resilience hints from `GraphNode.metadata`:
 *   - `hasRetries: true`        → RETRY_FACTOR attenuation
 *   - `hasCircuitBreaker: true` → CIRCUIT_BREAKER_FACTOR attenuation
 *   - `hasTimeout: true`        → TIMEOUT_FACTOR attenuation
 */
function applyResilience(
  rawProb: number,
  nodeId: NodeId,
  graph: DependencyGraph,
): number {
  const node = graph.nodes[nodeId];
  if (node === undefined) {
    return rawProb;
  }

  let prob = rawProb;
  const meta = node.metadata;

  if (meta['hasRetries'] === true) {
    prob *= RESILIENCE_RETRY_FACTOR;
  }
  if (meta['hasCircuitBreaker'] === true) {
    prob *= RESILIENCE_CIRCUIT_BREAKER_FACTOR;
  }
  if (meta['hasTimeout'] === true) {
    prob *= RESILIENCE_TIMEOUT_FACTOR;
  }

  return Math.min(1, Math.max(0, prob));
}

/**
 * Compute the latency multiplier from failure probability using a sigmoid
 * curve: low probability → near 1×; probability approaching 1 → MAX_LATENCY_MULTIPLIER.
 *
 * sigmoid(x) = 1 / (1 + e^(-k(x - 0.5)))
 * Scaled to [1, MAX_LATENCY_MULTIPLIER].
 */
function computeLatencyMultiplier(failureProbability: number): number {
  const SIGMOID_STEEPNESS = 10;
  const sigmoid = 1 / (1 + Math.exp(-SIGMOID_STEEPNESS * (failureProbability - 0.5)));
  return 1 + (MAX_LATENCY_MULTIPLIER - 1) * sigmoid;
}

/** Map failure probability to a qualitative NodeStatus. */
function classifyStatus(
  failureProbability: number,
  nodeId: NodeId,
  graph: DependencyGraph,
  forwardAdj: Map<NodeId, GraphEdge[]>,
  reverseAdj: Map<NodeId, GraphEdge[]>,
): NodeStatus {
  // ISOLATED: the node itself has no inbound or outbound edges in the graph
  const noIncoming = (reverseAdj.get(nodeId)?.length ?? 0) === 0;
  const noOutgoing = (forwardAdj.get(nodeId)?.length ?? 0) === 0;
  const nodeExists = graph.nodes[nodeId] !== undefined;

  if (nodeExists && noIncoming && noOutgoing) {
    return 'ISOLATED';
  }
  if (failureProbability >= FAILED_THRESHOLD) {
    return 'FAILED';
  }
  if (failureProbability >= DEGRADED_THRESHOLD) {
    return 'DEGRADED';
  }
  return 'HEALTHY';
}

// ---------------------------------------------------------------------------
// Per-scenario BFS propagation
// ---------------------------------------------------------------------------

interface PropagationResult {
  nodeStates: Map<NodeId, NodeSimState>;
  steps: SimulationStep[];
}

/**
 * Propagate a single fault scenario through the graph using BFS.
 *
 * Returns per-node states and the ordered list of SimulationSteps.
 */
function propagateScenario(
  scenario: FaultScenario,
  graph: DependencyGraph,
  report: BlastRadiusReport,
  forwardAdj: Map<NodeId, GraphEdge[]>,
  reverseAdj: Map<NodeId, GraphEdge[]>,
  existingStates: Map<NodeId, NodeSimState>,
): PropagationResult {
  const decayFn = getDecayFunction(scenario.params.spreadDecayModel);
  const nodeStates = new Map<NodeId, NodeSimState>(existingStates);
  const steps: SimulationStep[] = [];

  // BFS queue item: [nodeId, depth]
  const queue: Array<[NodeId, number]> = [[scenario.targetNodeId, 0]];
  // visited tracks (nodeId, depth) pairs to prevent re-processing
  const visited = new Map<NodeId, number>();
  visited.set(scenario.targetNodeId, 0);

  let stepIndex = 0;

  while (queue.length > 0) {
    // Process all nodes at the current depth as one wave (BFS level)
    const currentDepth = queue[0]?.[1] ?? 0;
    const wave: Array<[NodeId, number]> = [];

    while (queue.length > 0 && queue[0]?.[1] === currentDepth) {
      const item = queue.shift();
      if (item !== undefined) {
        wave.push(item);
      }
    }

    const affectedInStep: NodeId[] = [];

    for (const [nodeId, depth] of wave) {
      // Compute raw failure probability at this hop
      const rawProb = decayFn(scenario.params.severity, depth, scenario.params.decayFactor);
      const prob = applyResilience(rawProb, nodeId, graph);

      const existing = nodeStates.get(nodeId);
      const prevProb = existing?.failureProbability ?? 0;

      // Merge strategy: take the maximum probability across all scenarios
      const mergedProb = Math.max(prevProb, prob);
      const latencyMultiplier = computeLatencyMultiplier(mergedProb);
      const status = classifyStatus(mergedProb, nodeId, graph, forwardAdj, reverseAdj);

      const prevScenarios = existing?.affectedByScenarios ?? [];
      const affectedByScenarios = prevScenarios.includes(scenario.id)
        ? prevScenarios
        : [...prevScenarios, scenario.id];

      nodeStates.set(nodeId, {
        nodeId,
        failureProbability: mergedProb,
        estimatedLatencyMultiplier: latencyMultiplier,
        status,
        affectedByScenarios,
      });

      affectedInStep.push(nodeId);

      // Enqueue neighbours (forward direction — downstream callers)
      const outgoing = forwardAdj.get(nodeId) ?? [];
      for (const edge of outgoing) {
        const nextDepth = depth + 1;
        const alreadyAt = visited.get(edge.target);
        // Only visit if we have not visited at this depth or shallower
        if (alreadyAt === undefined || alreadyAt > nextDepth) {
          visited.set(edge.target, nextDepth);
          queue.push([edge.target, nextDepth]);
        }
      }
    }

    if (affectedInStep.length > 0) {
      // Snapshot all current node states for the timeline step
      const snapshot: Record<NodeId, NodeSimState> = {};
      for (const [id, state] of nodeStates.entries()) {
        snapshot[id] = { ...state };
      }

      steps.push({
        stepIndex,
        scenarioId: scenario.id,
        depth: currentDepth,
        affectedNodes: affectedInStep,
        nodeStates: snapshot,
      });

      stepIndex++;
    }
  }

  // Also compute impact for nodes on the blast-radius report's critical paths
  // that weren't directly visited — tag them as affected if they share a scenario
  // impact reference from the blastRadiusReport
  for (const nodeId of report.topRiskyNodes) {
    if (!nodeStates.has(nodeId)) {
      const impact = report.impacts[nodeId];
      if (impact !== undefined && impact.onCriticalPath) {
        const prob = applyResilience(
          decayFn(scenario.params.severity, impact.blastDepth, scenario.params.decayFactor),
          nodeId,
          graph,
        );
        if (prob > 0) {
          const latencyMultiplier = computeLatencyMultiplier(prob);
          const status = classifyStatus(prob, nodeId, graph, forwardAdj, reverseAdj);
          nodeStates.set(nodeId, {
            nodeId,
            failureProbability: prob,
            estimatedLatencyMultiplier: latencyMultiplier,
            status,
            affectedByScenarios: [scenario.id],
          });
        }
      }
    }
  }

  return { nodeStates, steps };
}

// ---------------------------------------------------------------------------
// Critical failure chain extraction
// ---------------------------------------------------------------------------

/**
 * Identify the highest-probability path from any fault origin to a service boundary.
 *
 * Greedy: at each step, follow the neighbour with the highest failureProbability
 * that has not yet been visited (prevents cycles).
 */
function findCriticalFailureChain(
  scenarios: FaultScenario[],
  graph: DependencyGraph,
  nodeStates: Map<NodeId, NodeSimState>,
  forwardAdj: Map<NodeId, GraphEdge[]>,
): NodeId[] {
  let bestChain: NodeId[] = [];
  let bestScore = -1;

  for (const scenario of scenarios) {
    const origin = scenario.targetNodeId;
    if (graph.nodes[origin] === undefined) {
      continue;
    }

    const chain: NodeId[] = [origin];
    const visited = new Set<NodeId>([origin]);
    let current = origin;

    for (;;) {
      const outgoing = forwardAdj.get(current) ?? [];
      let bestNeighbour: NodeId | undefined;
      let bestNeighbourProb = -1;

      for (const edge of outgoing) {
        if (!visited.has(edge.target)) {
          const state = nodeStates.get(edge.target);
          const prob = state?.failureProbability ?? 0;
          if (prob > bestNeighbourProb) {
            bestNeighbourProb = prob;
            bestNeighbour = edge.target;
          }
        }
      }

      if (bestNeighbour === undefined || bestNeighbourProb <= 0) {
        break;
      }

      chain.push(bestNeighbour);
      visited.add(bestNeighbour);
      current = bestNeighbour;

      // Stop when we reach a service boundary
      if (graph.nodes[bestNeighbour]?.isEntryPoint === true) {
        break;
      }
    }

    // Score the chain by the mean failure probability of its nodes
    const chainProb =
      chain.reduce((sum, id) => sum + (nodeStates.get(id)?.failureProbability ?? 0), 0) /
      chain.length;

    if (chainProb > bestScore) {
      bestScore = chainProb;
      bestChain = chain;
    }
  }

  return bestChain;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface PropagationOutput {
  nodeResults: Record<NodeId, NodeSimResult>;
  simulationSteps: SimulationStep[];
  criticalFailureChain: NodeId[];
}

/**
 * Run all fault scenarios against the blast-radius report's graph,
 * producing per-node simulation results and a full playback timeline.
 *
 * @param graph     - Dependency graph (from BlastRadiusReport).
 * @param report    - Blast-radius report providing impact context.
 * @param scenarios - One or more fault scenarios to simulate.
 * @returns         PropagationOutput with nodeResults, simulationSteps, and criticalFailureChain.
 */
export function propagateFaults(
  graph: DependencyGraph,
  report: BlastRadiusReport,
  scenarios: FaultScenario[],
): PropagationOutput {
  const forwardAdj = buildForwardAdjacency(graph.edges);
  const reverseAdj = buildReverseAdjacency(graph.edges);

  let mergedStates = new Map<NodeId, NodeSimState>();
  const allSteps: SimulationStep[] = [];

  for (const scenario of scenarios) {
    const { nodeStates, steps } = propagateScenario(
      scenario,
      graph,
      report,
      forwardAdj,
      reverseAdj,
      mergedStates,
    );
    mergedStates = nodeStates;
    allSteps.push(...steps);
  }

  // Convert internal state map → public NodeSimResult record
  const nodeResults: Record<NodeId, NodeSimResult> = {};
  for (const [nodeId, state] of mergedStates.entries()) {
    nodeResults[nodeId] = {
      nodeId: state.nodeId,
      failureProbability: state.failureProbability,
      estimatedLatencyMultiplier: state.estimatedLatencyMultiplier,
      affectedByScenarios: state.affectedByScenarios,
    };
  }

  const criticalFailureChain = findCriticalFailureChain(
    scenarios,
    graph,
    mergedStates,
    forwardAdj,
  );

  return { nodeResults, simulationSteps: allSteps, criticalFailureChain };
}
