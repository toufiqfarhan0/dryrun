/**
 * DryRun — Ingester Public API
 * Agent 2: AST Dependency Ingester
 *
 * Assembles a validated `DependencyGraph` from either a real repository root
 * (server-side) or an in-memory file map (client-side / demo mode).
 *
 * Usage:
 *   import { ingestRepository } from '@/lib/ingester';
 *   const graph = await ingestRepository({ rootDir: '/path/to/repo' });
 *
 *   // Or in demo/test mode:
 *   const graph = await ingestRepository({ fileMap: { 'src/app.ts': '...' } });
 */

import { randomUUID } from 'crypto';
import fs from 'fs';

import {
  type DependencyGraph,
  type GraphEdge,
  type GraphNode,
  type EdgeType,
  DependencyGraphSchema,
} from '@/types';

import { walkRepository, walkFileMap, type FileRecord } from './file-walker';
import { parseSourceFile, type ImportRecord } from './ast-parser';
import {
  resolveSpecifier,
  detectCircularDependencies,
  DEFAULT_NEXT_ALIASES,
  type AliasMap,
} from './import-resolver';
import { classifyServiceBoundary } from './service-boundary';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Edge weight for static/re-export imports (low frequency, compile-time) */
const WEIGHT_STATIC = 1;
/** Edge weight for dynamic imports (lazy, runtime) */
const WEIGHT_DYNAMIC = 2;
/** Edge weight for CommonJS require (runtime, legacy) */
const WEIGHT_REQUIRE = 2;
/** Edge weight for HTTP calls detected via env/fetch patterns */
const WEIGHT_HTTP = 3;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IngestOptions {
  /**
   * Absolute path to the repository root.
   * Provide this for real server-side analysis.
   */
  rootDir?: string;
  /**
   * In-memory file map for demo/test mode (relativePath → file content).
   * Used when rootDir is not available (client-side or unit tests).
   */
  fileMap?: Record<string, string>;
  /** Override the default Next.js path aliases. */
  aliases?: AliasMap;
  /** Optional repository URL to embed in the graph */
  repoUrl?: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Ingest a repository and return a fully-assembled, Zod-validated
 * `DependencyGraph`.
 *
 * Accepts either a real filesystem root (`rootDir`) or an in-memory
 * `fileMap` for demos and unit tests.
 */
export async function ingestRepository(options: IngestOptions): Promise<DependencyGraph> {
  const { rootDir, fileMap, aliases = DEFAULT_NEXT_ALIASES, repoUrl } = options;

  if (!rootDir && !fileMap) {
    throw new Error('ingestRepository requires either rootDir or fileMap');
  }

  // --- 1. Collect file records ---
  const fileRecords: FileRecord[] = rootDir
    ? walkRepository(rootDir)
    : walkFileMap(fileMap!);

  // --- 2. Read content (already have it for fileMap; read from disk for rootDir) ---
  const contentMap = buildContentMap(rootDir, fileMap, fileRecords);

  // --- 3. Parse every file ---
  const parsedModules = fileRecords.map((record) =>
    parseSourceFile(record.relativePath, contentMap.get(record.relativePath) ?? ''),
  );

  // --- 4. Build known-file set for resolution ---
  const knownFiles = new Set(fileRecords.map((r) => r.relativePath));

  // --- 5. Resolve imports and build edge list ---
  const rawEdges: Array<{ source: string; target: string; edgeType: EdgeType }> = [];
  const adjacency = new Map<string, string[]>();

  for (const mod of parsedModules) {
    const targets: string[] = [];

    for (const imp of mod.imports) {
      const resolved = resolveSpecifier(imp.specifier, mod.filePath, knownFiles, aliases);

      if (resolved.isExternal) {
        // External packages get their own node (EXTERNAL type)
        rawEdges.push({
          source: mod.filePath,
          target: resolved.canonicalId,
          edgeType: importKindToEdgeType(imp),
        });
      } else {
        rawEdges.push({
          source: mod.filePath,
          target: resolved.canonicalId,
          edgeType: importKindToEdgeType(imp),
        });
        targets.push(resolved.canonicalId);
      }
    }

    adjacency.set(mod.filePath, targets);
  }

  // --- 6. Detect circular dependencies ---
  const circularMap = detectCircularDependencies(adjacency);

  // --- 7. Build GraphNode map ---
  const nodes: Record<string, GraphNode> = {};

  // Internal nodes from parsed files
  for (const mod of parsedModules) {
    const fileRecord = fileRecords.find((r) => r.relativePath === mod.filePath);
    const content = contentMap.get(mod.filePath) ?? '';
    const boundary = classifyServiceBoundary(mod.filePath, content);
    const label = deriveLabel(mod.filePath);

    nodes[mod.filePath] = {
      id: mod.filePath,
      label,
      filePath: mod.filePath,
      nodeType: boundary.nodeType,
      exports: mod.exports,
      isEntryPoint: boundary.isEntryPoint,
      loc: mod.loc,
      metadata: {
        rawLineCount: mod.rawLineCount,
        complexityWeight: mod.complexityWeight,
        exportSurface: mod.exportSurface,
        readsEnvVars: mod.readsEnvVars,
        envVarNames: mod.envVarNames,
        nodeSubtype: boundary.nodeSubtype,
        criticalityRating: boundary.criticalityRating,
        criticalityScore: boundary.criticalityScore,
        signals: boundary.signals,
        sizeBytes: fileRecord?.sizeBytes ?? 0,
        extension: fileRecord?.extension ?? '',
      },
    };
  }

  // External package nodes (synthesised on demand)
  for (const edge of rawEdges) {
    if (!nodes[edge.target]) {
      const isExternal = !knownFiles.has(edge.target);
      if (isExternal) {
        nodes[edge.target] = buildExternalNode(edge.target);
      }
    }
  }

  // --- 8. Build validated GraphEdge list ---
  const edgeMap = new Map<string, GraphEdge>();

  for (const raw of rawEdges) {
    const key = `${raw.source}→${raw.target}→${raw.edgeType}`;
    if (edgeMap.has(key)) continue;

    const circular = circularMap.get(raw.source)?.has(raw.target) ?? false;
    const edge: GraphEdge = {
      source: raw.source,
      target: raw.target,
      edgeType: raw.edgeType,
      weight: edgeWeight(raw.edgeType),
    };

    if (circular) {
      // Extend the metadata on target node to flag circularity
      const targetNode = nodes[raw.target];
      if (targetNode) {
        targetNode.metadata = { ...targetNode.metadata, hasCircularIncoming: true };
      }
      // Persist the circular flag via metadata on the source node
      const sourceNode = nodes[raw.source];
      if (sourceNode) {
        const existing = (sourceNode.metadata.circularTargets as string[] | undefined) ?? [];
        sourceNode.metadata = {
          ...sourceNode.metadata,
          circularTargets: [...existing, raw.target],
        };
      }
    }

    // Store circular flag on the edge via weight convention and metadata
    // (GraphEdge has no isCircular field in the schema, so we annotate both nodes above)
    edgeMap.set(key, edge);
  }

  const edges = [...edgeMap.values()];

  // --- 9. Compute stats ---
  const serviceCount = Object.values(nodes).filter(
    (n) => n.nodeType === 'SERVICE' || n.isEntryPoint,
  ).length;

  const maxDepth = computeMaxDepth(adjacency, knownFiles);

  // --- 10. Assemble and validate the graph ---
  const graph: DependencyGraph = {
    id: randomUUID(),
    repoUrl,
    analyzedAt: new Date().toISOString(),
    nodes,
    edges,
    stats: {
      totalNodes: Object.keys(nodes).length,
      totalEdges: edges.length,
      maxDepth,
      serviceCount,
    },
  };

  // Runtime validation — throws if the assembled graph violates the contract
  DependencyGraphSchema.parse(graph);

  return graph;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildContentMap(
  rootDir: string | undefined,
  fileMap: Record<string, string> | undefined,
  fileRecords: FileRecord[],
): Map<string, string> {
  const map = new Map<string, string>();

  if (fileMap) {
    for (const [filePath, content] of Object.entries(fileMap)) {
      const normalised = filePath.replace(/\\/g, '/');
      map.set(normalised, content);
    }
    return map;
  }

  // Real filesystem — read each file
  for (const record of fileRecords) {
    try {
      const content = fs.readFileSync(record.absolutePath, 'utf8');
      map.set(record.relativePath, content);
    } catch {
      map.set(record.relativePath, '');
    }
  }

  return map;
}

function importKindToEdgeType(imp: ImportRecord): EdgeType {
  switch (imp.kind) {
    case 'STATIC':
      return 'STATIC_IMPORT';
    case 'DYNAMIC':
      return 'DYNAMIC_IMPORT';
    case 'REQUIRE':
      return 'STATIC_IMPORT'; // treat CJS require as static for graph purposes
    case 'RE_EXPORT':
      return 'RE_EXPORT';
    default: {
      const _exhaustive: never = imp.kind;
      return _exhaustive;
    }
  }
}

function edgeWeight(edgeType: EdgeType): number {
  switch (edgeType) {
    case 'STATIC_IMPORT':
      return WEIGHT_STATIC;
    case 'DYNAMIC_IMPORT':
      return WEIGHT_DYNAMIC;
    case 'RE_EXPORT':
      return WEIGHT_STATIC;
    case 'HTTP_CALL':
      return WEIGHT_HTTP;
    case 'ENV_READ':
      return WEIGHT_STATIC;
    default: {
      const _exhaustive: never = edgeType;
      return _exhaustive;
    }
  }
}

function deriveLabel(filePath: string): string {
  // Take the last two path segments for a readable label
  const parts = filePath.replace(/\\/g, '/').split('/');
  if (parts.length >= 2) {
    return parts.slice(-2).join('/');
  }
  return filePath;
}

function buildExternalNode(packageName: string): GraphNode {
  return {
    id: packageName,
    label: packageName,
    filePath: packageName,
    nodeType: 'EXTERNAL',
    exports: [],
    isEntryPoint: false,
    loc: 0,
    metadata: { isExternalPackage: true },
  };
}

/**
 * BFS-based max depth computation from all entry-point nodes.
 * Only traverses internal (non-external) nodes.
 */
function computeMaxDepth(adjacency: Map<string, string[]>, knownFiles: Set<string>): number {
  let maxDepth = 0;
  const visited = new Set<string>();

  function bfs(startNode: string): void {
    const queue: Array<{ node: string; depth: number }> = [{ node: startNode, depth: 0 }];
    const localVisited = new Set<string>();

    while (queue.length > 0) {
      const item = queue.shift()!;
      if (localVisited.has(item.node)) continue;
      localVisited.add(item.node);

      if (item.depth > maxDepth) maxDepth = item.depth;

      for (const neighbour of adjacency.get(item.node) ?? []) {
        if (knownFiles.has(neighbour) && !localVisited.has(neighbour)) {
          queue.push({ node: neighbour, depth: item.depth + 1 });
        }
      }
    }
  }

  for (const node of adjacency.keys()) {
    if (!visited.has(node)) {
      visited.add(node);
      bfs(node);
    }
  }

  return maxDepth;
}
