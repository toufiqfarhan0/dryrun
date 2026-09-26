# Role: AST Dependency Ingester Agent
Context: Refer to `AGENTS.md`, `.bobrules`, and `docs/architecture.md` (specifically §2 Component Hierarchy and §3 Data Contracts).

Build the AST Dependency Ingester in `src/lib/ingester/`:

1. `src/lib/ingester/file-walker.ts`:
   - Recursively traverse file paths, ignoring node_modules, .git, .next, dist, build, and coverage.
   - Filter for supported source files (.ts, .tsx, .js, .jsx, .mjs).
   - Return structured file records (relative path, extension, file size, line count).

2. `src/lib/ingester/ast-parser.ts`:
   - Parse source code into AST or regex-robust tokens to extract:
     * Static imports (`import { ... } from '...'`, `import defaultExport from '...'`, `import * as ...`)
     * Dynamic imports (`import('...')`)
     * CommonJS requires (`require('...')`)
     * Exported symbols and function names
   - Calculate node metadata: LOC, complexity weight, and exported API surface.

3. `src/lib/ingester/import-resolver.ts`:
   - Resolve relative import specifiers (`./`, `../`) and path aliases (such as `@/*`) to canonical node IDs relative to repo root.
   - Flag external package dependencies vs internal module dependencies.
   - Detect circular dependencies and tag offending edges with `{ isCircular: true }`.

4. `src/lib/ingester/service-boundary.ts`:
   - Heuristically detect service boundaries and entry points:
     * Next.js route handlers (`route.ts`, `page.tsx`)
     * Server actions / API endpoints
     * Microservice entry points / express/fastify listeners
     * Database clients / ORM models (Prisma, Drizzle, Mongoose)
     * External HTTP clients (fetch, axios, sdk)
   - Assign appropriate `node.type` ('service' | 'database' | 'api' | 'queue' | 'worker') and criticality rating.

5. `src/lib/ingester/index.ts`:
   - Implement the public API:
     `export async function ingestRepository(options: IngestOptions): Promise<DependencyGraph>`
   - Assemble `GraphNode[]` and `GraphEdge[]` into a validated `DependencyGraph` conforming to `@/types`.
   - Also provide a lightweight parser for mock/in-memory file maps so the engine can run both server-side and in client-side demos.

Ensure zero `any`, strict TypeScript types, and verify with `pnpm build` or `pnpm tsc --noEmit`.

---

**Status:** active  **Date:** 2026-09-26

---

### 👤 User

Role: AST Dependency Ingester Agent
Context: Refer to `AGENTS.md`, `.bobrules`, and `docs/architecture.md` (specifically §2 Component Hierarchy and §3 Data Contracts).

Build the AST Dependency Ingester in `src/lib/ingester/`:

1. `src/lib/ingester/file-walker.ts`:
   - Recursively traverse file paths, ignoring node_modules, .git, .next, dist, build, and coverage.
   - Filter for supported source files (.ts, .tsx, .js, .jsx, .mjs).
   - Return structured file records (relative path, extension, file size, line count).

2. `src/lib/ingester/ast-parser.ts`:
   - Parse source code into AST or regex-robust tokens to extract:
     * Static imports (`import { ... } from '...'`, `import defaultExport from '...'`, `import * as ...`)
     * Dynamic imports (`import('...')`)
     * CommonJS requires (`require('...')`)
     * Exported symbols and function names
   - Calculate node metadata: LOC, complexity weight, and exported API surface.

3. `src/lib/ingester/import-resolver.ts`:
   - Resolve relative import specifiers (`./`, `../`) and path aliases (such as `@/*`) to canonical node IDs relative to repo root.
   - Flag external package dependencies vs internal module dependencies.
   - Detect circular dependencies and tag offending edges with `{ isCircular: true }`.

4. `src/lib/ingester/service-boundary.ts`:
   - Heuristically detect service boundaries and entry points:
     * Next.js route handlers (`route.ts`, `page.tsx`)
     * Server actions / API endpoints
     * Microservice entry points / express/fastify listeners
     * Database clients / ORM models (Prisma, Drizzle, Mongoose)
     * External HTTP clients (fetch, axios, sdk)
   - Assign appropriate `node.type` ('service' | 'database' | 'api' | 'queue' | 'worker') and criticality rating.

5. `src/lib/ingester/index.ts`:
   - Implement the public API:
     `export async function ingestRepository(options: IngestOptions): Promise<DependencyGraph>`
   - Assemble `GraphNode[]` and `GraphEdge[]` into a validated `DependencyGraph` conforming to `@/types`.
   - Also provide a lightweight parser for mock/in-memory file maps so the engine can run both server-side and in client-side demos.

Ensure zero `any`, strict TypeScript types, and verify with `pnpm build` or `pnpm tsc --noEmit`.

---

### 🤖 Assistant

> 🔧 called: spawn_subagent



> 🔧 **spawn_subagent** — explore

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — src/types/index.ts

> 🔧 **read_file** — docs/architecture.md

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — .bobrules

> 🔧 **read_file** — package.json

### 🤖 Assistant

> 🔧 called: update_todo_list

Now I have a clear picture. Let me plan the work and build all five files.

> 🔧 **update_todo_list** — [-] Write src/lib/ingester/file-walker.ts
[ ] Write src/lib/ingester/ast-parser.ts
[ ] Write src/lib/ingester/import-resolver.ts
[ ] Write src/lib/ingester/service-boundary.ts
[ ] Write src/lib/ingester/index.ts
[ ] Run pnpm tsc --noEmit and fix any errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — src/lib/ingester/file-walker.ts

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — [x] Write src/lib/ingester/file-walker.ts
[-] Write src/lib/ingester/ast-parser.ts
[ ] Write src/lib/ingester/import-resolver.ts
[ ] Write src/lib/ingester/service-boundary.ts
[ ] Write src/lib/ingester/index.ts
[ ] Run pnpm tsc --noEmit and fix any errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — /**
 * DryRun — AST Parser
 * Agent 2: AST Dependency Ingester
 *
 * Parses TypeScript/JavaScript source files using regex-robust token extraction
 * (no external AST dependency required at runtime). Extracts static imports,
 * dynamic imports, CommonJS requires, re-exports, and exported symbols.
 * Also derives per-file metadata: LOC, complexity weight, exported API surface.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Complexity increment per control-flow keyword found in the file */
const COMPLEXITY_PER_BRANCH = 1;

/** Base complexity for every file */
const BASE_COMPLEXITY = 1;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ImportKind = 'STATIC' | 'DYNAMIC' | 'REQUIRE' | 'RE_EXPORT';

export interface ImportRecord {
  kind: ImportKind;
  /** Raw specifier string as written in the source */
  specifier: string;
  /** Named bindings, or ['default'] for default import, or ['*'] for namespace */
  bindings: string[];
}

export interface ParsedModule {
  /** Relative file path from repo root */
  filePath: string;
  imports: ImportRecord[];
  /** Exported symbol names (functions, classes, variables, types) */
  exports: string[];
  /** Lines of code (non-blank, non-comment lines) */
  loc: number;
  /** Raw line count */
  rawLineCount: number;
  /** McCabe-style cyclomatic complexity heuristic */
  complexityWeight: number;
  /** Number of unique exported symbols */
  exportSurface: number;
  /** True if the file reads any `process.env.*` variable */
  readsEnvVars: boolean;
  /** Names of env vars read, if detectable */
  envVarNames: string[];
}

// ---------------------------------------------------------------------------
// Regex patterns
// ---------------------------------------------------------------------------

// import { a, b } from '...'
// import defaultExport from '...'
// import * as ns from '...'
// import type { ... } from '...'
const STATIC_IMPORT_RE =
  /^[ \t]*import\s+(?:type\s+)?(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))?)\s+from\s+['"]([^'"]+)['"]/gm;

// import '...' (side-effect import)
const SIDE_EFFECT_IMPORT_RE = /^[ \t]*import\s+['"]([^'"]+)['"]/gm;

// dynamic import('...')
const DYNAMIC_IMPORT_RE = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

// require('...')
const REQUIRE_RE = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

// export { a, b } from '...'  (re-export with source)
const RE_EXPORT_FROM_RE =
  /^[ \t]*export\s+(?:type\s+)?\{[^}]*\}\s+from\s+['"]([^'"]+)['"]/gm;

// export * from '...'
// export * as ns from '...'
const RE_EXPORT_STAR_RE = /^[ \t]*export\s+\*(?:\s+as\s+\w+)?\s+from\s+['"]([^'"]+)['"]/gm;

// Named exports: export function foo, export class Foo, export const foo, export type Foo
const NAMED_EXPORT_RE =
  /^[ \t]*export\s+(?:default\s+)?(?:async\s+)?(?:function\s*\*?\s*|class\s+|const\s+|let\s+|var\s+|type\s+|interface\s+|enum\s+)(\w+)/gm;

// export { a, b, c }  (local exports)
const EXPORT_BLOCK_RE = /^[ \t]*export\s+\{([^}]+)\}/gm;

// export default identifier
const DEFAULT_EXPORT_RE = /^[ \t]*export\s+default\s+(\w+)/gm;

// Named bindings inside  import { ... }
const BINDING_NAMES_RE = /\{([^}]+)\}/;

// Branches that increase cyclomatic complexity
const BRANCH_KEYWORDS_RE =
  /\b(if|else|for|while|do|switch|case|catch|\?\?|&&|\|\||ternary)\b/g;

// process.env.VAR_NAME
const ENV_VAR_RE = /process\.env\.([A-Z_][A-Z0-9_]*)/g;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a single source file's content and return a `ParsedModule` record.
 */
export function parseSourceFile(filePath: string, content: string): ParsedModule {
  const imports: ImportRecord[] = [];
  const seenSpecifiers = new Set<string>();

  // --- Static imports ---
  for (const match of content.matchAll(STATIC_IMPORT_RE)) {
    const specifier = match[1];
    const raw = match[0];
    const bindings = extractBindings(raw);
    addImport(imports, seenSpecifiers, { kind: 'STATIC', specifier, bindings });
  }

  // --- Side-effect imports ---
  for (const match of content.matchAll(SIDE_EFFECT_IMPORT_RE)) {
    addImport(imports, seenSpecifiers, { kind: 'STATIC', specifier: match[1], bindings: [] });
  }

  // --- Re-exports with source ---
  for (const match of content.matchAll(RE_EXPORT_FROM_RE)) {
    addImport(imports, seenSpecifiers, {
      kind: 'RE_EXPORT',
      specifier: match[1],
      bindings: extractBindingsFromBlock(match[0]),
    });
  }

  for (const match of content.matchAll(RE_EXPORT_STAR_RE)) {
    addImport(imports, seenSpecifiers, {
      kind: 'RE_EXPORT',
      specifier: match[1],
      bindings: ['*'],
    });
  }

  // --- Dynamic imports ---
  for (const match of content.matchAll(DYNAMIC_IMPORT_RE)) {
    addImport(imports, seenSpecifiers, {
      kind: 'DYNAMIC',
      specifier: match[1],
      bindings: [],
    });
  }

  // --- CommonJS require ---
  for (const match of content.matchAll(REQUIRE_RE)) {
    addImport(imports, seenSpecifiers, {
      kind: 'REQUIRE',
      specifier: match[1],
      bindings: [],
    });
  }

  // --- Exports ---
  const exports = extractExports(content);

  // --- LOC: count non-blank, non-comment lines ---
  const lines = content.split('\n');
  const rawLineCount = lines.length;
  const loc = lines.filter((l) => {
    const trimmed = l.trim();
    return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('*');
  }).length;

  // --- Complexity ---
  const branchMatches = content.match(BRANCH_KEYWORDS_RE);
  const complexityWeight = BASE_COMPLEXITY + (branchMatches?.length ?? 0) * COMPLEXITY_PER_BRANCH;

  // --- Env vars ---
  const envVarNames: string[] = [];
  for (const match of content.matchAll(ENV_VAR_RE)) {
    if (!envVarNames.includes(match[1])) envVarNames.push(match[1]);
  }

  return {
    filePath,
    imports,
    exports,
    loc,
    rawLineCount,
    complexityWeight,
    exportSurface: exports.length,
    readsEnvVars: envVarNames.length > 0,
    envVarNames,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function addImport(
  list: ImportRecord[],
  seen: Set<string>,
  record: ImportRecord,
): void {
  const key = `${record.kind}:${record.specifier}`;
  if (seen.has(key)) return;
  seen.add(key);
  list.push(record);
}

/**
 * Extract named bindings from a full import statement line.
 * Returns ['default'] for default-only imports, ['*'] for namespace imports,
 * and the individual names for named imports.
 */
function extractBindings(importStatement: string): string[] {
  // Namespace import: import * as ns from '...'
  if (/\*\s+as\s+\w+/.test(importStatement)) return ['*'];

  // Named bindings: { a, b as c }
  const blockMatch = BINDING_NAMES_RE.exec(importStatement);
  if (blockMatch) {
    return blockMatch[1]
      .split(',')
      .map((b) => b.trim().split(/\s+as\s+/)[0].trim())
      .filter(Boolean);
  }

  // Default import only: import Foo from '...'
  // Matches the identifier before "from"
  const defaultMatch = /import\s+(\w+)\s+from/.exec(importStatement);
  if (defaultMatch) return ['default'];

  return [];
}

function extractBindingsFromBlock(reExportStatement: string): string[] {
  const blockMatch = BINDING_NAMES_RE.exec(reExportStatement);
  if (!blockMatch) return [];
  return blockMatch[1]
    .split(',')
    .map((b) => b.trim().split(/\s+as\s+/)[0].trim())
    .filter(Boolean);
}

function extractExports(content: string): string[] {
  const names = new Set<string>();

  // export function/class/const/let/var/type/interface/enum Name
  for (const match of content.matchAll(NAMED_EXPORT_RE)) {
    names.add(match[1]);
  }

  // export { a, b, c }
  for (const match of content.matchAll(EXPORT_BLOCK_RE)) {
    for (const name of match[1].split(',')) {
      const clean = name.trim().split(/\s+as\s+/).pop()?.trim();
      if (clean) names.add(clean);
    }
  }

  // export default identifier
  for (const match of content.matchAll(DEFAULT_EXPORT_RE)) {
    names.add(match[1]);
  }

  return [...names];
}


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — [x] Write src/lib/ingester/file-walker.ts
[x] Write src/lib/ingester/ast-parser.ts
[-] Write src/lib/ingester/import-resolver.ts
[ ] Write src/lib/ingester/service-boundary.ts
[ ] Write src/lib/ingester/index.ts
[ ] Run pnpm tsc --noEmit and fix any errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — /**
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


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — [x] Write src/lib/ingester/file-walker.ts
[x] Write src/lib/ingester/ast-parser.ts
[x] Write src/lib/ingester/import-resolver.ts
[-] Write src/lib/ingester/service-boundary.ts
[ ] Write src/lib/ingester/index.ts
[ ] Run pnpm tsc --noEmit and fix any errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — /**
 * DryRun — Service Boundary Detector
 * Agent 2: AST Dependency Ingester
 *
 * Heuristically classifies source files as service boundaries and assigns
 * NodeType + criticality based on naming conventions, content patterns,
 * and framework-specific markers.
 */

import type { NodeType } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Weight added to criticality for each matching signal */
const CRITICALITY_INCREMENT = 1;

const MAX_CRITICALITY = 10;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CriticalityRating =
  | 'CRITICAL'  // database, auth, payment, external API gateway
  | 'HIGH'      // service entry points, queue consumers
  | 'MEDIUM'    // server actions, internal API handlers
  | 'LOW';      // ordinary modules, utilities

export interface BoundaryClassification {
  nodeType: NodeType;
  isEntryPoint: boolean;
  criticalityRating: CriticalityRating;
  /** 1–10, higher = more critical */
  criticalityScore: number;
  /** Human-readable signals that drove this classification */
  signals: string[];
}

// ---------------------------------------------------------------------------
// File-path heuristics
// ---------------------------------------------------------------------------

/** Patterns on the relative file path that indicate a service boundary */
const PATH_SIGNALS: Array<{ pattern: RegExp; nodeType: NodeType; signal: string; weight: number }> =
  [
    // Next.js App Router route handlers
    {
      pattern: /(?:^|\/)route\.(ts|tsx|js|jsx)$/,
      nodeType: 'SERVICE',
      signal: 'Next.js route handler',
      weight: 3,
    },
    // Next.js page entries (potential SSR boundary)
    {
      pattern: /(?:^|\/)page\.(tsx|jsx|ts|js)$/,
      nodeType: 'SERVICE',
      signal: 'Next.js page entry',
      weight: 2,
    },
    // Next.js layout
    {
      pattern: /(?:^|\/)layout\.(tsx|jsx|ts|js)$/,
      nodeType: 'SERVICE',
      signal: 'Next.js layout entry',
      weight: 1,
    },
    // Next.js middleware
    {
      pattern: /(?:^|\/)middleware\.(ts|js)$/,
      nodeType: 'SERVICE',
      signal: 'Next.js middleware',
      weight: 3,
    },
    // Microservice / worker entry points
    {
      pattern: /(?:^|\/)(?:server|worker|daemon|listener|main|index)\.(ts|js|mjs)$/,
      nodeType: 'SERVICE',
      signal: 'Service entry point',
      weight: 2,
    },
    // Prisma schema / client
    {
      pattern: /prisma(?:\/|\\)(?:schema|client|seed)/,
      nodeType: 'DATABASE',
      signal: 'Prisma ORM',
      weight: 4,
    },
    // Drizzle ORM
    {
      pattern: /drizzle(?:\/|\\)/,
      nodeType: 'DATABASE',
      signal: 'Drizzle ORM',
      weight: 4,
    },
    // Mongoose / MongoDB models
    {
      pattern: /(?:models?|schemas?)\/.*\.(ts|js)$/i,
      nodeType: 'DATABASE',
      signal: 'Database model',
      weight: 3,
    },
    // Test files → TEST type, low criticality
    {
      pattern: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      nodeType: 'TEST',
      signal: 'Test file',
      weight: -2,
    },
    // Config / infrastructure files
    {
      pattern:
        /(?:^|\/)(?:next\.config|tailwind\.config|postcss\.config|vitest\.config|jest\.config|eslint\.config|tsconfig)\./,
      nodeType: 'CONFIG',
      signal: 'Configuration file',
      weight: 0,
    },
  ];

// ---------------------------------------------------------------------------
// Content heuristics
// ---------------------------------------------------------------------------

/** Patterns on the file content that indicate a service boundary */
const CONTENT_SIGNALS: Array<{ pattern: RegExp; signal: string; weight: number }> = [
  // Express / Fastify listeners
  { pattern: /\.listen\s*\(/, signal: 'HTTP server listen()', weight: 4 },
  // Next.js server actions
  { pattern: /'use server'|"use server"/, signal: 'Next.js server action', weight: 3 },
  // External HTTP clients
  { pattern: /\bfetch\s*\(|axios\.|got\.|ky\./, signal: 'External HTTP client', weight: 2 },
  // Prisma client instantiation
  { pattern: /new\s+PrismaClient\b/, signal: 'Prisma client instantiation', weight: 4 },
  // Mongoose connection
  { pattern: /mongoose\.connect\b/, signal: 'Mongoose connection', weight: 4 },
  // Drizzle connection
  { pattern: /drizzle\s*\(/, signal: 'Drizzle connection', weight: 4 },
  // Queue / message broker
  {
    pattern: /\bconsumeMessages?\b|\bsubscribe\s*\(|\bpublish\s*\(|\bsendMessage\b/,
    signal: 'Queue consumer/producer',
    weight: 3,
  },
  // Environment variable reads (configures boundaries)
  { pattern: /process\.env\.[A-Z_]+/, signal: 'Environment variable reads', weight: 1 },
  // SDK imports (AWS, Stripe, Twilio, etc.)
  {
    pattern: /from\s+['"](?:@aws-sdk|stripe|twilio|sendgrid|openai|@anthropic|@ibm-cloud)/,
    signal: 'External SDK import',
    weight: 3,
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Classify a source file as a service boundary and assign a criticality rating.
 *
 * @param relativePath  - Relative path from repo root (forward slashes)
 * @param content       - Full source content of the file
 */
export function classifyServiceBoundary(
  relativePath: string,
  content: string,
): BoundaryClassification {
  const signals: string[] = [];
  let weightSum = 0;
  let resolvedNodeType: NodeType = 'MODULE';

  // --- Path-based signals ---
  for (const rule of PATH_SIGNALS) {
    if (rule.pattern.test(relativePath)) {
      signals.push(rule.signal);
      weightSum += rule.weight;
      if (rule.weight > 0) {
        // Higher-weight nodeType takes precedence
        resolvedNodeType = pickNodeType(resolvedNodeType, rule.nodeType, rule.weight);
      }
    }
  }

  // --- Content-based signals ---
  for (const rule of CONTENT_SIGNALS) {
    if (rule.pattern.test(content)) {
      signals.push(rule.signal);
      weightSum += rule.weight;
    }
  }

  const isEntryPoint = isEntryPointFile(relativePath, content);
  const criticalityScore = Math.min(Math.max(weightSum, 0), MAX_CRITICALITY);
  const criticalityRating = scoreToCriticality(criticalityScore, resolvedNodeType);

  return {
    nodeType: resolvedNodeType,
    isEntryPoint,
    criticalityRating,
    criticalityScore,
    signals,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * A file is an entry point when it is a route handler, server entry, or worker.
 */
function isEntryPointFile(relativePath: string, content: string): boolean {
  const entryPathRe =
    /(?:^|\/)(?:route|middleware|server|worker|daemon|main|index)\.(ts|tsx|js|jsx|mjs)$/;
  const serverListenRe = /\.listen\s*\(/;
  const serverActionRe = /'use server'|"use server"/;

  return (
    entryPathRe.test(relativePath) ||
    serverListenRe.test(content) ||
    serverActionRe.test(content)
  );
}

/**
 * Pick the higher-priority NodeType. Priority order:
 * DATABASE > SERVICE > CONFIG > TEST > MODULE
 */
const NODE_TYPE_PRIORITY: Record<NodeType, number> = {
  DATABASE: 5,
  SERVICE: 4,
  EXTERNAL: 3,
  CONFIG: 2,
  TEST: 1,
  MODULE: 0,
};

function pickNodeType(current: NodeType, candidate: NodeType, _weight: number): NodeType {
  return NODE_TYPE_PRIORITY[candidate] > NODE_TYPE_PRIORITY[current] ? candidate : current;
}

function scoreToCriticality(score: number, nodeType: NodeType): CriticalityRating {
  if (nodeType === 'DATABASE') return 'CRITICAL';
  if (score >= 6) return 'CRITICAL';
  if (score >= 4) return 'HIGH';
  if (score >= CRITICALITY_INCREMENT * 2) return 'MEDIUM';
  return 'LOW';
}


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — [x] Write src/lib/ingester/file-walker.ts
[x] Write src/lib/ingester/ast-parser.ts
[x] Write src/lib/ingester/import-resolver.ts
[x] Write src/lib/ingester/service-boundary.ts
[-] Write src/lib/ingester/index.ts
[ ] Run pnpm tsc --noEmit and fix any errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — /**
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


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — [x] Write src/lib/ingester/file-walker.ts
[x] Write src/lib/ingester/ast-parser.ts
[x] Write src/lib/ingester/import-resolver.ts
[x] Write src/lib/ingester/service-boundary.ts
[x] Write src/lib/ingester/index.ts
[-] Run pnpm tsc --noEmit and fix any errors


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — pnpm tsc --noEmit 2>&1

### 🤖 Assistant

> 🔧 called: apply_diff

`NodeType` in the shared types doesn't include `'DATABASE'` — it's `'MODULE' | 'SERVICE' | 'EXTERNAL' | 'CONFIG' | 'TEST'`. I need to map database signals to `'SERVICE'` and carry the database classification in metadata instead.

> 🔧 **apply_diff** — src/lib/ingester/service-boundary.ts

### 🤖 Assistant

> 🔧 called: read_file

Good, the service-boundary fix was applied. Now I need to check where the `NODE_TYPE_PRIORITY` map still has the old stale entries. Let me also check if the `index.ts` references `nodeSubtype`:

> 🔧 **read_file** — src/lib/ingester/service-boundary.ts

### 🤖 Assistant

> 🔧 called: apply_diff

The `NODE_TYPE_PRIORITY` still has `DATABASE: 5` which will cause a TS error. Let me fix it and also update `index.ts` to pass `nodeSubtype` into metadata:

> 🔧 **apply_diff** — src/lib/ingester/service-boundary.ts

### 🤖 Assistant

> 🔧 called: apply_diff

Now update [`index.ts`](src/lib/ingester/index.ts) to pass `nodeSubtype` into metadata:

> 🔧 **apply_diff** — src/lib/ingester/index.ts

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — pnpm tsc --noEmit 2>&1

### 🤖 Assistant

> 🔧 called: execute_command

Zero errors. Let me do a final review of each file to confirm everything is coherent:

> 🔧 **execute_command** — Get-ChildItem src/lib/ingester/ | Select-Object Name, Length

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — [x] Write src/lib/ingester/file-walker.ts
[x] Write src/lib/ingester/ast-parser.ts
[x] Write src/lib/ingester/import-resolver.ts
[x] Write src/lib/ingester/service-boundary.ts
[x] Write src/lib/ingester/index.ts
[x] Run pnpm tsc --noEmit and fix any errors


### 🤖 Assistant

All five files are written, strictly typed, and `pnpm tsc --noEmit` passes clean. Here's what was built:

---

## [`src/lib/ingester/`](src/lib/ingester/) — what was built

### [`file-walker.ts`](src/lib/ingester/file-walker.ts)
- [`walkRepository(rootDir)`](src/lib/ingester/file-walker.ts:57) — recursive real-FS traversal skipping `node_modules`, `.git`, `.next`, `dist`, `build`, `coverage`, `.turbo`, `out`
- [`walkFileMap(fileMap)`](src/lib/ingester/file-walker.ts:68) — in-memory variant for demos/tests
- Returns [`FileRecord[]`](src/lib/ingester/file-walker.ts:28) with `relativePath`, `absolutePath`, `extension`, `sizeBytes`, `lineCount`; filters to `.ts .tsx .js .jsx .mjs`

### [`ast-parser.ts`](src/lib/ingester/ast-parser.ts)
- [`parseSourceFile(filePath, content)`](src/lib/ingester/ast-parser.ts:96) — regex-token extraction (zero AST runtime dep)
- Captures: static/side-effect imports, dynamic `import()`, CJS `require()`, `export * from`, `export { } from` re-exports
- Extracts exported symbol names (`export function`, `export class`, `export const`, `export { }`, `export default`)
- Computes LOC (non-blank/non-comment), raw line count, cyclomatic complexity weight, env-var reads, export surface count

### [`import-resolver.ts`](src/lib/ingester/import-resolver.ts)
- [`resolveSpecifier(specifier, importerPath, knownFiles, aliases)`](src/lib/ingester/import-resolver.ts:62) — resolves relative paths, `@/` aliases, and external packages; probes extensions and `index.*` files
- [`detectCircularDependencies(adjacency)`](src/lib/ingester/import-resolver.ts:105) — DFS with 3-colour marking; returns `Map<source, Set<circular-targets>>`
- [`DEFAULT_NEXT_ALIASES`](src/lib/ingester/import-resolver.ts:136) — `{ '@/': 'src/', '@': 'src' }` baked in

### [`service-boundary.ts`](src/lib/ingester/service-boundary.ts)
- [`classifyServiceBoundary(relativePath, content)`](src/lib/ingester/service-boundary.ts:184) — runs both path-pattern and content-pattern signal sets
- Path signals: Next.js `route.ts`, `page.tsx`, `middleware.ts`, `layout.ts`, Prisma/Drizzle/Mongoose models, test/config files
- Content signals: `.listen()`, `'use server'`, `fetch`/`axios`, `new PrismaClient`, `mongoose.connect`, queue patterns, SDK imports
- Returns `nodeType` (`SERVICE | MODULE | TEST | CONFIG | EXTERNAL`), `nodeSubtype` (`api | database | worker | queue | module`), `criticalityRating`, `criticalityScore`, `signals[]`; database boundaries map to `SERVICE` + `nodeSubtype: 'database'` in metadata (respects the canonical `NodeType` union)

### [`index.ts`](src/lib/ingester/index.ts) — public API
- [`ingestRepository(options: IngestOptions): Promise<DependencyGraph>`](src/lib/ingester/index.ts:79) — full pipeline:
  1. Walk files (real FS or in-memory map)
  2. Parse each file via `parseSourceFile`
  3. Resolve all imports with `resolveSpecifier`; synthesise `EXTERNAL` nodes for npm packages
  4. Run `detectCircularDependencies`; circular edges annotate both source and target node `metadata`
  5. Classify every file with `classifyServiceBoundary`
  6. Assemble `GraphNode[]` + `GraphEdge[]` (de-duplicated), compute stats
  7. Validate the assembled graph against [`DependencyGraphSchema`](src/types/index.ts:97) at runtime