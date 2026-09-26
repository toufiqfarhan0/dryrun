/**
 * DryRun — Import Resolver
 * Agent 2: AST Dependency Ingester
 *
 * Resolves raw import specifiers to canonical node IDs:
 *  - Relative specifiers (./foo, ../bar) → normalised path relative to repo root
 *  - Path aliases (@/*) → resolved through the alias map
 *  - External packages → flagged as EXTERNAL with the package name as node ID
 *
 * Also performs cycle detection across the entire import graph via DFS,
 * tagging offending edges with { isCircular: true }.
 */

import path from 'path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Extensions tried in order when a bare specifier has no extension */
const RESOLUTION_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

/** Index file basenames tried when a specifier resolves to a directory */
const INDEX_BASENAMES = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AliasMap {
  /** e.g. { '@': 'src', '@/': 'src/' } */
  [prefix: string]: string;
}

export interface ResolvedImport {
  /** Canonical node ID (relative path from repo root, forward slashes, no leading dot) */
  canonicalId: string;
  /** True when this refers to an npm package, not an internal module */
  isExternal: boolean;
  /** True when this edge forms part of a cycle */
  isCircular: boolean;
}

export interface EdgeEntry {
  source: string;
  target: string;
  isCircular: boolean;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolve a single import specifier from the perspective of `importerPath`.
 *
 * @param specifier     - The raw string from the import statement
 * @param importerPath  - The file that contains the import (relative to repo root)
 * @param knownFiles    - Set of all relative paths in the repository (for extension probing)
 * @param aliases       - Path alias configuration (from tsconfig / next.config)
 */
export function resolveSpecifier(
  specifier: string,
  importerPath: string,
  knownFiles: Set<string>,
  aliases: AliasMap = DEFAULT_NEXT_ALIASES,
): ResolvedImport {
  // External: does not start with '.', '/', or a known alias prefix
  if (isExternalSpecifier(specifier, aliases)) {
    const packageName = extractPackageName(specifier);
    return { canonicalId: packageName, isExternal: true, isCircular: false };
  }

  // Alias resolution: e.g. '@/lib/foo' → 'src/lib/foo'
  const dealiased = applyAliases(specifier, aliases);

  // Normalise to a repo-root-relative path
  const importerDir = path.dirname(importerPath).replace(/\\/g, '/');
  let candidate: string;

  if (dealiased.startsWith('/')) {
    // Absolute-from-root (after alias expansion)
    candidate = dealiased.replace(/^\//, '');
  } else if (dealiased.startsWith('.')) {
    // Relative import
    candidate = path.posix.normalize(path.posix.join(importerDir, dealiased));
  } else {
    // Alias resolved to a non-relative path without leading slash
    candidate = dealiased;
  }

  // Strip leading './' artifact
  candidate = candidate.replace(/^\.\//, '');

  // Probe for exact match first, then with extensions, then as directory/index
  const resolved = probeFile(candidate, knownFiles);
  if (resolved !== null) {
    return { canonicalId: resolved, isExternal: false, isCircular: false };
  }

  // Unresolvable internal specifier — treat as opaque external to avoid graph pollution
  return { canonicalId: specifier, isExternal: true, isCircular: false };
}

/**
 * Detect circular dependencies across the full import graph.
 * Returns the same edge list with `isCircular` set on every edge that
 * participates in a cycle.
 *
 * @param adjacency - Map of nodeId → list of target nodeIds it imports
 */
export function detectCircularDependencies(
  adjacency: Map<string, string[]>,
): Map<string, Set<string>> {
  // Returns a map of source → set of targets that are circular
  const circularEdges = new Map<string, Set<string>>();

  const WHITE = 0; // unvisited
  const GRAY = 1;  // in current DFS stack
  const BLACK = 2; // fully processed

  const color = new Map<string, number>();

  function dfs(node: string, stack: string[]): void {
    color.set(node, GRAY);
    stack.push(node);

    for (const neighbour of adjacency.get(node) ?? []) {
      const neighbourColor = color.get(neighbour) ?? WHITE;
      if (neighbourColor === GRAY) {
        // Back-edge → cycle detected
        markCircular(circularEdges, node, neighbour);
      } else if (neighbourColor === WHITE) {
        dfs(neighbour, stack);
      }
    }

    stack.pop();
    color.set(node, BLACK);
  }

  for (const node of adjacency.keys()) {
    if ((color.get(node) ?? WHITE) === WHITE) {
      dfs(node, []);
    }
  }

  return circularEdges;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

/** Standard Next.js / tsconfig path aliases */
export const DEFAULT_NEXT_ALIASES: AliasMap = {
  '@/': 'src/',
  '@': 'src',
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isExternalSpecifier(specifier: string, aliases: AliasMap): boolean {
  if (specifier.startsWith('.') || specifier.startsWith('/')) return false;
  for (const prefix of Object.keys(aliases)) {
    if (specifier.startsWith(prefix)) return false;
  }
  return true;
}

function applyAliases(specifier: string, aliases: AliasMap): string {
  // Sort longest prefix first to avoid partial matches
  const prefixes = Object.keys(aliases).sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    if (specifier.startsWith(prefix)) {
      return aliases[prefix] + specifier.slice(prefix.length);
    }
  }
  return specifier;
}

function extractPackageName(specifier: string): string {
  // Scoped packages: @scope/name/deep → @scope/name
  if (specifier.startsWith('@')) {
    const parts = specifier.split('/');
    return parts.slice(0, 2).join('/');
  }
  // Regular packages: lodash/fp → lodash
  return specifier.split('/')[0];
}

/**
 * Try to resolve `candidate` to a known file path by probing extensions and
 * index files. Returns the canonical ID or null if nothing matches.
 */
function probeFile(candidate: string, knownFiles: Set<string>): string | null {
  // 1. Exact match (already has an extension)
  if (knownFiles.has(candidate)) return candidate;

  // 2. Append extension
  for (const ext of RESOLUTION_EXTENSIONS) {
    const withExt = candidate + ext;
    if (knownFiles.has(withExt)) return withExt;
  }

  // 3. Directory index file
  for (const index of INDEX_BASENAMES) {
    const indexPath = `${candidate}/${index}`;
    if (knownFiles.has(indexPath)) return indexPath;
  }

  return null;
}

function markCircular(
  map: Map<string, Set<string>>,
  source: string,
  target: string,
): void {
  if (!map.has(source)) map.set(source, new Set());
  map.get(source)!.add(target);
}
