/**
 * DryRun — Blast-Radius Impact Scorer
 *
 * Computes a deterministic per-node impact score (0–100) from four orthogonal
 * signals, then derives an impact tier and an aggregate system-wide blast score.
 *
 * Formula (§4 Stage 2 of architecture.md):
 *
 *   raw = w_depth    × depthDecay(blastDepth)
 *       + w_fanin    × normalisedFanIn
 *       + w_critical × criticalityMultiplier
 *       + w_loc      × normalisedLoc
 *
 *   impactScore = clamp(normalise(raw) × changeTypeSeverity × 100, 0, 100)
 *
 * All weights are named constants so they are easy to tune via env vars in the
 * route handler without touching library code.
 */

import type { DependencyGraph, GraphNode, NodeId, SeverityLevel } from '@/types';
import type { ReachabilityMap, AdjacencyMap } from './reachability';

// ---------------------------------------------------------------------------
// Configurable weight constants
// ---------------------------------------------------------------------------

const W_DEPTH = 0.30; // depth decay contribution
const W_FANIN = 0.35; // fan-in (dependent count) contribution
const W_CRITICAL = 0.25; // node criticality / entry-point contribution
const W_LOC = 0.10; // lines-of-code heuristic contribution

// Change-type severity multipliers
const SEVERITY_BREAKING = 1.0; // breaking schema / signature change
const SEVERITY_NONBREAKING = 0.5; // non-breaking internal logic change

const TOP_RISKY_NODE_COUNT = 10;

// Maximum realistic loc for normalisation ceiling (anything ≥ this is 1.0)
const LOC_CEILING = 2000;

// ---------------------------------------------------------------------------
// Change type
// ---------------------------------------------------------------------------

/**
 * Describes how disruptive the change is at the API/schema level.
 * Consumers of `evaluateBlastRadius` should infer this from the PR diff analysis.
 */
export type ChangeTypeSeverity = 'BREAKING' | 'NON_BREAKING';

// ---------------------------------------------------------------------------
// Criticality labels — keywords in node label/id that imply high criticality
// ---------------------------------------------------------------------------

const CRITICAL_LABEL_FRAGMENTS = [
  'gateway',
  'auth',
  'payment',
  'billing',
  'database',
  'db',
  'config',
  'kafka',
  'queue',
  'broker',
] as const;

/** Returns a 0–1 criticality multiplier based on node metadata and label. */
function criticalityMultiplier(node: GraphNode): number {
  if (node.isEntryPoint) return 1.0;

  const labelLower = node.label.toLowerCase();
  const idLower = node.id.toLowerCase();
  for (const fragment of CRITICAL_LABEL_FRAGMENTS) {
    if (labelLower.includes(fragment) || idLower.includes(fragment)) {
      return 0.85;
    }
  }

  // Explicit metadata flag set by the ingester
  if (node.metadata['critical'] === true || node.metadata['pci'] === true) {
    return 0.90;
  }

  return 0.40; // baseline for ordinary nodes
}

// ---------------------------------------------------------------------------
// Depth decay — returns a 0–1 value that drops with hop distance
// ---------------------------------------------------------------------------

/** Exponential decay: depth=1 → 1.0, depth=2 → 0.7, depth=3 → 0.49 … */
function depthDecay(depth: number): number {
  if (depth <= 0) return 1.0;
  return Math.pow(0.7, depth - 1);
}

// ---------------------------------------------------------------------------
// Per-node scoring
// ---------------------------------------------------------------------------

export interface ScoredNode {
  nodeId: NodeId;
  impactScore: number; // 0–100, integer-rounded
  impactTier: SeverityLevel;
  blastDepth: number;
  dependentCount: number;
}

/**
 * Compute impact scores for every node in the reachability map.
 *
 * @param graph          Full dependency graph (for node metadata).
 * @param reachability   BFS result: nodes reached from the change set.
 * @param reverseAdj     Reverse-adjacency map used to count dependents.
 * @param changeTypeSev  Whether the change is breaking or non-breaking.
 */
export function scoreNodes(
  graph: DependencyGraph,
  reachability: ReachabilityMap,
  reverseAdj: AdjacencyMap,
  changeTypeSev: ChangeTypeSeverity,
): ScoredNode[] {
  // Pre-compute fan-in counts for normalisation
  const fanInMap = new Map<NodeId, number>();
  for (const [nodeId, neighbours] of reverseAdj.entries()) {
    fanInMap.set(nodeId, neighbours.size);
  }
  const maxFanIn = Math.max(1, ...fanInMap.values());

  // Pre-compute max loc for normalisation
  const allLocs = Object.values(graph.nodes).map((n) => n.loc);
  const maxLoc = Math.max(LOC_CEILING, ...allLocs);

  const severityMultiplier =
    changeTypeSev === 'BREAKING' ? SEVERITY_BREAKING : SEVERITY_NONBREAKING;

  const scored: ScoredNode[] = [];

  for (const [nodeId, entry] of reachability.entries()) {
    const node = graph.nodes[nodeId];
    if (node === undefined) continue; // defensive: node not in graph snapshot

    const fanIn = fanInMap.get(nodeId) ?? 0;
    const loc = node.loc;

    // Compute how many nodes transitively depend on this node
    const dependentCount = countTransitiveDependents(nodeId, reverseAdj);

    // Raw weighted sum in [0, 1]
    const raw =
      W_DEPTH * depthDecay(entry.minDepth) +
      W_FANIN * (fanIn / maxFanIn) +
      W_CRITICAL * criticalityMultiplier(node) +
      W_LOC * Math.min(loc / maxLoc, 1.0);

    const impactScore = clamp(Math.round(raw * severityMultiplier * 100), 0, 100);
    const impactTier = classifyTier(impactScore);

    scored.push({
      nodeId,
      impactScore,
      impactTier,
      blastDepth: entry.minDepth,
      dependentCount,
    });
  }

  return scored;
}

// ---------------------------------------------------------------------------
// Transitive dependent count (reverse BFS)
// ---------------------------------------------------------------------------

/** Count all nodes that transitively depend on `nodeId` via reverse edges. */
function countTransitiveDependents(nodeId: NodeId, reverseAdj: AdjacencyMap): number {
  const visited = new Set<NodeId>([nodeId]);
  const queue: NodeId[] = [nodeId];
  let head = 0;

  while (head < queue.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const current = queue[head]!;
    head++;

    const dependents = reverseAdj.get(current);
    if (dependents !== undefined) {
      for (const dep of dependents) {
        if (!visited.has(dep)) {
          visited.add(dep);
          queue.push(dep);
        }
      }
    }
  }

  return visited.size - 1; // exclude the node itself
}

// ---------------------------------------------------------------------------
// Tier classification
// ---------------------------------------------------------------------------

/** Maps a 0–100 impact score to a severity tier. */
export function classifyTier(score: number): SeverityLevel {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

// ---------------------------------------------------------------------------
// System-wide blast score
// ---------------------------------------------------------------------------

/**
 * Compute the composite overall blast score (0–100).
 *
 * Per architecture.md §4 Stage 2:
 *   overallBlastScore = mean(top-10 impactScores)
 *
 * Falls back to the mean of all scored nodes when fewer than 10 exist.
 */
export function computeOverallBlastScore(scored: ScoredNode[]): number {
  if (scored.length === 0) return 0;

  const sorted = [...scored].sort((a, b) => b.impactScore - a.impactScore);
  const topN = sorted.slice(0, TOP_RISKY_NODE_COUNT);
  const mean = topN.reduce((sum, n) => sum + n.impactScore, 0) / topN.length;
  return clamp(Math.round(mean), 0, 100);
}

// ---------------------------------------------------------------------------
// Top-risky node list
// ---------------------------------------------------------------------------

/** Return the top-N NodeIds sorted descending by impactScore. */
export function topRiskyNodes(scored: ScoredNode[], n = TOP_RISKY_NODE_COUNT): NodeId[] {
  return [...scored]
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, n)
    .map((s) => s.nodeId);
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
