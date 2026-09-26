/**
 * DryRun — Blast-Radius Risk Evaluator
 * Agent 3: Public API
 *
 * Orchestrates the full blast-radius evaluation pipeline:
 *
 *   ChangeSet + DependencyGraph
 *     → Reachability BFS
 *     → Impact Scoring
 *     → Critical Path Extraction
 *     → BlastRadiusReport (Zod-validated)
 *
 * Public surface:
 *   evaluateBlastRadius(graph, changeSet, options?) → BlastRadiusReport
 */

import type {
  DependencyGraph,
  ChangeSet,
  BlastRadiusReport,
  NodeImpact,
  NodeId,
} from '@/types';
import { BlastRadiusReportSchema } from '@/types';

import {
  buildForwardAdjacency,
  buildReverseAdjacency,
  bfsReachability,
  resolveChangedNodes,
} from './reachability';

import {
  scoreNodes,
  computeOverallBlastScore,
  topRiskyNodes,
} from './impact-scorer';

import type { ChangeTypeSeverity } from './impact-scorer';

import { findCriticalPaths } from './critical-path';

// ---------------------------------------------------------------------------
// Public options
// ---------------------------------------------------------------------------

export interface EvaluateBlastRadiusOptions {
  /**
   * Whether the change is a breaking API/schema change.
   * Defaults to 'BREAKING' (conservative) when omitted.
   */
  changeTypeSeverity?: ChangeTypeSeverity;

  /**
   * Node types to exclude from blast-radius analysis.
   * Defaults to ['TEST'] — test files don't produce production impact.
   */
  excludeNodeTypes?: DependencyGraph['nodes'][string]['nodeType'][];
}

const DEFAULT_OPTIONS: Required<EvaluateBlastRadiusOptions> = {
  changeTypeSeverity: 'BREAKING',
  excludeNodeTypes: ['TEST'],
};

// ---------------------------------------------------------------------------
// Main evaluator
// ---------------------------------------------------------------------------

/**
 * Evaluate the blast radius of a `ChangeSet` against a `DependencyGraph`.
 *
 * @throws {Error} if the assembled report fails Zod schema validation
 *                 (this signals a bug in the scorer, not invalid user input).
 */
export function evaluateBlastRadius(
  graph: DependencyGraph,
  changeSet: ChangeSet,
  options: EvaluateBlastRadiusOptions = {},
): BlastRadiusReport {
  const opts: Required<EvaluateBlastRadiusOptions> = { ...DEFAULT_OPTIONS, ...options };

  // ------------------------------------------------------------------
  // 1. Build adjacency maps
  // ------------------------------------------------------------------
  const forwardAdj = buildForwardAdjacency(graph.edges);
  const reverseAdj = buildReverseAdjacency(graph.edges);

  // ------------------------------------------------------------------
  // 2. Resolve changed files → graph NodeIds
  //    All three change categories (modified, added, deleted) are seeds
  // ------------------------------------------------------------------
  const allChangedFiles = [
    ...changeSet.changedFiles,
    ...changeSet.addedFiles,
    ...changeSet.deletedFiles,
  ];
  const changedNodes = resolveChangedNodes(graph, allChangedFiles);

  // ------------------------------------------------------------------
  // 3. Forward BFS: which nodes are reachable (directly or transitively)
  //    from the changed set through the forward dependency graph
  // ------------------------------------------------------------------
  const forwardReachability = bfsReachability(changedNodes, forwardAdj);

  // ------------------------------------------------------------------
  // 4. Also include nodes that DEPEND ON the changed set (reverse BFS)
  //    These are the "upstream callers" that will be affected
  // ------------------------------------------------------------------
  const reverseReachability = bfsReachability(changedNodes, reverseAdj);

  // Merge both reachability maps; forward direction wins for depth
  // (forward edges represent the blast propagation direction)
  for (const [nodeId, entry] of reverseReachability.entries()) {
    if (!forwardReachability.has(nodeId)) {
      forwardReachability.set(nodeId, entry);
    }
  }

  // Remove nodes of excluded types
  for (const nodeId of forwardReachability.keys()) {
    const node = graph.nodes[nodeId];
    if (node !== undefined && opts.excludeNodeTypes.includes(node.nodeType)) {
      forwardReachability.delete(nodeId);
    }
  }

  // ------------------------------------------------------------------
  // 5. Score every reachable node
  // ------------------------------------------------------------------
  const scored = scoreNodes(
    graph,
    forwardReachability,
    reverseAdj,
    opts.changeTypeSeverity,
  );

  // ------------------------------------------------------------------
  // 6. Extract critical paths & bottleneck nodes
  // ------------------------------------------------------------------
  const { paths: criticalPaths, bottleneckNodes } = findCriticalPaths(
    changedNodes,
    graph,
    forwardAdj,
    scored,
  );

  // Set of node IDs that appear on at least one critical path
  const onCriticalPathSet = new Set<NodeId>(criticalPaths.flat());
  for (const id of bottleneckNodes) {
    onCriticalPathSet.add(id);
  }

  // ------------------------------------------------------------------
  // 7. Assemble NodeImpact record
  // ------------------------------------------------------------------
  const impacts: Record<NodeId, NodeImpact> = {};
  for (const s of scored) {
    impacts[s.nodeId] = {
      nodeId: s.nodeId,
      impactScore: s.impactScore,
      blastDepth: s.blastDepth,
      dependentCount: s.dependentCount,
      onCriticalPath: onCriticalPathSet.has(s.nodeId),
      reachableFromChanged: true,
    };
  }

  // ------------------------------------------------------------------
  // 8. Compute aggregates
  // ------------------------------------------------------------------
  const overallBlastScore = computeOverallBlastScore(scored);
  const riskyNodes = topRiskyNodes(scored);

  // ------------------------------------------------------------------
  // 9. Assemble and validate the report
  // ------------------------------------------------------------------
  const report: BlastRadiusReport = {
    runId: changeSet.runId,
    graph,
    changeSet,
    impacts,
    criticalPaths,
    topRiskyNodes: riskyNodes,
    overallBlastScore,
    computedAt: new Date().toISOString(),
  };

  // Runtime validation — catches scorer bugs early (fails loudly in CI)
  const parsed = BlastRadiusReportSchema.safeParse(report);
  if (!parsed.success) {
    throw new Error(
      `[blast-radius] BlastRadiusReport validation failed: ${parsed.error.message}`,
    );
  }

  return parsed.data;
}

// ---------------------------------------------------------------------------
// Re-exports — consumers should import internals only from this barrel
// ---------------------------------------------------------------------------

export type { ChangeTypeSeverity } from './impact-scorer';
export type { CriticalPathResult } from './critical-path';
export type { ReachabilityMap, AdjacencyMap } from './reachability';
export {
  buildForwardAdjacency,
  buildReverseAdjacency,
  bfsReachability,
  resolveChangedNodes,
} from './reachability';
export {
  scoreNodes,
  classifyTier,
  computeOverallBlastScore,
  topRiskyNodes,
} from './impact-scorer';
export { findCriticalPaths } from './critical-path';
