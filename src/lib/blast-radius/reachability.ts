/**
 * DryRun — Blast-Radius Reachability Traversal
 *
 * Builds reverse-adjacency maps and performs BFS traversals to determine which
 * nodes are affected when a set of nodes changes.  Two traversal directions:
 *
 *  - Forward (dependency direction):  changed node → its dependencies
 *  - Reverse (dependent direction):   changed node → nodes that depend on it
 *
 * Cycle detection is handled by a visited set at traversal time — no infinite loops.
 */

import type { DependencyGraph, GraphEdge, NodeId } from '@/types';

// ---------------------------------------------------------------------------
// Adjacency map helpers
// ---------------------------------------------------------------------------

/** Forward adjacency: nodeId → set of nodes it depends on */
export type AdjacencyMap = Map<NodeId, Set<NodeId>>;

/**
 * Build a forward adjacency map: source → targets.
 * Edges represent "source depends on target."
 */
export function buildForwardAdjacency(edges: GraphEdge[]): AdjacencyMap {
  const map: AdjacencyMap = new Map();
  for (const edge of edges) {
    let targets = map.get(edge.source);
    if (targets === undefined) {
      targets = new Set();
      map.set(edge.source, targets);
    }
    targets.add(edge.target);
  }
  return map;
}

/**
 * Build a reverse adjacency map: target → sources.
 * Edges represent "target is depended upon by source."
 * Used to find all nodes that would be *impacted* by a change to the key node.
 */
export function buildReverseAdjacency(edges: GraphEdge[]): AdjacencyMap {
  const map: AdjacencyMap = new Map();
  for (const edge of edges) {
    let sources = map.get(edge.target);
    if (sources === undefined) {
      sources = new Set();
      map.set(edge.target, sources);
    }
    sources.add(edge.source);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Traversal result
// ---------------------------------------------------------------------------

export interface ReachabilityEntry {
  /** Minimum number of hops from any changed node to reach this node */
  minDepth: number;
  /** True if the node is a direct (depth-1) dependent of a changed node */
  isDirect: boolean;
}

/** Map of every node reachable from the changed set, with traversal metadata */
export type ReachabilityMap = Map<NodeId, ReachabilityEntry>;

// ---------------------------------------------------------------------------
// BFS traversal
// ---------------------------------------------------------------------------

const MAX_TRAVERSAL_DEPTH = 50; // hard cap — prevents runaway on pathological graphs

/**
 * BFS from a set of origin nodes over the supplied adjacency map.
 *
 * Returns every node reachable from any origin (excluding the origins themselves),
 * along with the minimum hop-depth at which it was first discovered.
 *
 * Safe against cycles: each node is only enqueued once.
 */
export function bfsReachability(
  origins: ReadonlySet<NodeId>,
  adjacency: AdjacencyMap,
): ReachabilityMap {
  const result: ReachabilityMap = new Map();
  // Queue entries: [nodeId, depth]
  const queue: [NodeId, number][] = [];
  const visited = new Set<NodeId>(origins);

  // Seed the queue with direct neighbours of every origin
  for (const origin of origins) {
    const neighbours = adjacency.get(origin);
    if (neighbours !== undefined) {
      for (const neighbour of neighbours) {
        if (!visited.has(neighbour)) {
          visited.add(neighbour);
          queue.push([neighbour, 1]);
        }
      }
    }
  }

  let head = 0;
  while (head < queue.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [current, depth] = queue[head]!;
    head++;

    result.set(current, {
      minDepth: depth,
      isDirect: depth === 1,
    });

    if (depth >= MAX_TRAVERSAL_DEPTH) continue;

    const neighbours = adjacency.get(current);
    if (neighbours !== undefined) {
      for (const neighbour of neighbours) {
        if (!visited.has(neighbour)) {
          visited.add(neighbour);
          queue.push([neighbour, depth + 1]);
        }
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Graph-scoped helpers used by the index assembler
// ---------------------------------------------------------------------------

/**
 * Resolve a set of changed file paths to the canonical NodeIds present in the graph.
 * Files that do not map to any node are silently ignored (they may be test/config files
 * excluded from the graph, or truly net-new files with no existing dependents).
 */
export function resolveChangedNodes(
  graph: DependencyGraph,
  changedFiles: string[],
): Set<NodeId> {
  const fileToNodeId = new Map<string, NodeId>();
  for (const node of Object.values(graph.nodes)) {
    fileToNodeId.set(node.filePath, node.id);
  }

  const result = new Set<NodeId>();
  for (const filePath of changedFiles) {
    const nodeId = fileToNodeId.get(filePath);
    if (nodeId !== undefined) {
      result.add(nodeId);
    }
  }
  return result;
}
