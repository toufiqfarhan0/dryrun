/**
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
