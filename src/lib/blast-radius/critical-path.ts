/**
 * DryRun — Critical Path Finder
 *
 * Extracts the most vulnerable dependency chains from changed nodes through to
 * service boundaries (entry points, databases, critical infrastructure).
 *
 * Two complementary analyses:
 *
 *  1. Path extraction — DFS from each changed node following forward-dependency
 *     edges, collecting every path that terminates at a high-risk boundary node.
 *     Paths are ranked by a composite path-risk score.
 *
 *  2. Betweenness centrality estimation — lightweight approximation using
 *     shortest-path sampling.  Nodes that sit on many shortest paths between
 *     changed nodes and boundary nodes are flagged as bottleneck amplifiers.
 */

import type { DependencyGraph, NodeId } from '@/types';
import type { AdjacencyMap } from './reachability';
import type { ScoredNode } from './impact-scorer';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum hops explored during DFS path extraction (prevents combinatorial explosion). */
const MAX_PATH_DEPTH = 12;

/** Maximum number of critical paths to return. */
const MAX_CRITICAL_PATHS = 20;

/**
 * Minimum impact score a terminal node must have for its path to be
 * considered "critical".  Paths ending at low-risk leaf nodes are ignored.
 */
const TERMINAL_MIN_IMPACT = 30;

// ---------------------------------------------------------------------------
// Boundary node detection
// ---------------------------------------------------------------------------

/**
 * A node is considered a "boundary" (path terminal) when it is:
 *   - a service entry point (`isEntryPoint === true`), OR
 *   - a DATABASE / CONFIG / EXTERNAL type node.
 */
function isBoundaryNode(graph: DependencyGraph, nodeId: NodeId): boolean {
  const node = graph.nodes[nodeId];
  if (node === undefined) return false;
  if (node.isEntryPoint) return true;
  return (
    node.nodeType === 'CONFIG' ||
    node.nodeType === 'EXTERNAL' ||
    node.nodeType === 'SERVICE'
  );
}

// ---------------------------------------------------------------------------
// Path risk scoring
// ---------------------------------------------------------------------------

/** Aggregate path risk = sum of impact scores of all nodes on the path. */
function pathRiskScore(path: NodeId[], scoreMap: Map<NodeId, number>): number {
  return path.reduce((sum, id) => sum + (scoreMap.get(id) ?? 0), 0);
}

// ---------------------------------------------------------------------------
// DFS path extraction
// ---------------------------------------------------------------------------

/**
 * DFS from a single origin node, following forward edges.
 * Yields every path that reaches a boundary node of sufficient impact.
 *
 * Cycle protection: a per-DFS visited stack prevents revisiting the same node
 * within a single path.  The same node may appear in *different* paths.
 */
function extractPathsFromOrigin(
  origin: NodeId,
  graph: DependencyGraph,
  forwardAdj: AdjacencyMap,
  scoreMap: Map<NodeId, number>,
): NodeId[][] {
  const paths: NodeId[][] = [];
  const stack: [NodeId, NodeId[]][] = [[origin, [origin]]];

  while (stack.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [current, currentPath] = stack.pop()!;

    // Terminate: too deep
    if (currentPath.length > MAX_PATH_DEPTH) continue;

    const neighbours = forwardAdj.get(current);
    const isLeaf = neighbours === undefined || neighbours.size === 0;

    // Record path if we hit a boundary node (or leaf) with meaningful impact
    if (current !== origin && isBoundaryNode(graph, current)) {
      const terminalScore = scoreMap.get(current) ?? 0;
      if (terminalScore >= TERMINAL_MIN_IMPACT) {
        paths.push(currentPath);
      }
      // Do NOT continue deeper past a boundary; treat it as a terminal
      continue;
    }

    // Also capture paths ending at unreachable leaves with high cumulative risk
    if (isLeaf && currentPath.length > 1) {
      const risk = pathRiskScore(currentPath, scoreMap);
      if (risk >= TERMINAL_MIN_IMPACT * 2) {
        paths.push(currentPath);
      }
      continue;
    }

    if (neighbours !== undefined) {
      for (const neighbour of neighbours) {
        // Cycle check within this path
        if (currentPath.includes(neighbour)) continue;
        stack.push([neighbour, [...currentPath, neighbour]]);
      }
    }
  }

  return paths;
}

// ---------------------------------------------------------------------------
// Betweenness centrality approximation
// ---------------------------------------------------------------------------

/**
 * Returns an approximation of betweenness centrality for each node.
 *
 * Full betweenness centrality is O(V·E) — too expensive for large graphs.
 * We use a focused variant: for each (source, target) pair where source is a
 * changed node and target is a boundary node, run BFS to find the shortest
 * path, then increment the count of every intermediate node on that path.
 *
 * Result: Map<NodeId, centrality count>
 */
function approximateBetweennessCentrality(
  origins: ReadonlySet<NodeId>,
  graph: DependencyGraph,
  forwardAdj: AdjacencyMap,
): Map<NodeId, number> {
  const centrality = new Map<NodeId, number>();
  const boundaryNodes = Object.keys(graph.nodes).filter((id) =>
    isBoundaryNode(graph, id),
  ) as NodeId[];

  for (const origin of origins) {
    for (const boundary of boundaryNodes) {
      if (origin === boundary) continue;
      const path = bfsShortestPath(origin, boundary, forwardAdj);
      if (path === null) continue;
      // Increment every intermediate node (exclude origin and terminal)
      for (let i = 1; i < path.length - 1; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nodeId = path[i]!;
        centrality.set(nodeId, (centrality.get(nodeId) ?? 0) + 1);
      }
    }
  }

  return centrality;
}

/** BFS shortest-path between two nodes. Returns null if no path exists. */
function bfsShortestPath(
  source: NodeId,
  target: NodeId,
  adjacency: AdjacencyMap,
): NodeId[] | null {
  if (source === target) return [source];

  const visited = new Set<NodeId>([source]);
  const queue: [NodeId, NodeId[]][] = [[source, [source]]];
  let head = 0;

  while (head < queue.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [current, path] = queue[head]!;
    head++;

    const neighbours = adjacency.get(current);
    if (neighbours !== undefined) {
      for (const neighbour of neighbours) {
        if (neighbour === target) return [...path, neighbour];
        if (!visited.has(neighbour)) {
          visited.add(neighbour);
          queue.push([neighbour, [...path, neighbour]]);
        }
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CriticalPathResult {
  /** Ordered list of critical paths (each is an ordered NodeId sequence). */
  paths: NodeId[][];
  /**
   * Nodes with high betweenness centrality — they sit on many paths between
   * changed nodes and service boundaries and act as cascade amplifiers.
   */
  bottleneckNodes: NodeId[];
}

/**
 * Extract critical paths and identify bottleneck nodes.
 *
 * @param origins      NodeIds of the changed nodes (ChangeSet seeds).
 * @param graph        Full dependency graph.
 * @param forwardAdj   Forward-adjacency map (source → dependencies).
 * @param scoredNodes  Impact-scored nodes from `scoreNodes()`.
 */
export function findCriticalPaths(
  origins: ReadonlySet<NodeId>,
  graph: DependencyGraph,
  forwardAdj: AdjacencyMap,
  scoredNodes: ScoredNode[],
): CriticalPathResult {
  // Build a quick-lookup map: nodeId → impactScore
  const scoreMap = new Map<NodeId, number>();
  for (const s of scoredNodes) {
    scoreMap.set(s.nodeId, s.impactScore);
  }

  // 1. Collect all paths from every origin
  const allPaths: NodeId[][] = [];
  for (const origin of origins) {
    const paths = extractPathsFromOrigin(origin, graph, forwardAdj, scoreMap);
    allPaths.push(...paths);
  }

  // 2. Rank paths by aggregate risk score and deduplicate
  const ranked = allPaths
    .map((path) => ({ path, risk: pathRiskScore(path, scoreMap) }))
    .sort((a, b) => b.risk - a.risk);

  const seen = new Set<string>();
  const uniquePaths: NodeId[][] = [];
  for (const { path } of ranked) {
    const key = path.join('→');
    if (!seen.has(key)) {
      seen.add(key);
      uniquePaths.push(path);
    }
    if (uniquePaths.length >= MAX_CRITICAL_PATHS) break;
  }

  // 3. Approximate betweenness centrality for bottleneck identification
  const centrality = approximateBetweennessCentrality(origins, graph, forwardAdj);

  // Identify nodes with above-median centrality
  const centralityValues = [...centrality.values()];
  const median = computeMedian(centralityValues);
  const bottleneckNodes: NodeId[] = [...centrality.entries()]
    .filter(([, count]) => count > median && count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id);

  return { paths: uniquePaths, bottleneckNodes };
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ((sorted[mid - 1]! + sorted[mid]!) / 2)
    : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      sorted[mid]!;
}
