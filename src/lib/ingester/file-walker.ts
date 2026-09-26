/**
 * DryRun — File Walker
 * Agent 2: AST Dependency Ingester
 *
 * Recursively traverses a repository root, filtering to supported source files
 * and returning structured file records. Runs on the Node.js `fs` module so it
 * is server-only code.
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.cache',
  'out',
]);

const SUPPORTED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FileRecord {
  /** Relative path from repo root, normalised with forward slashes */
  relativePath: string;
  /** Absolute path on disk */
  absolutePath: string;
  /** File extension including the dot */
  extension: string;
  /** File size in bytes */
  sizeBytes: number;
  /** Line count (newline-split heuristic) */
  lineCount: number;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Recursively walk `rootDir` and return a `FileRecord` for every supported
 * source file, skipping ignored directories.
 */
export function walkRepository(rootDir: string): FileRecord[] {
  const results: FileRecord[] = [];
  visitDir(rootDir, rootDir, results);
  return results;
}

/**
 * Build a `FileRecord` for a synthetic in-memory file map.
 * Keys are relative paths; values are file content strings.
 * Used for client-side demos where the real filesystem is unavailable.
 */
export function walkFileMap(fileMap: Record<string, string>): FileRecord[] {
  return Object.entries(fileMap)
    .filter(([filePath]) => {
      const ext = path.extname(filePath).toLowerCase();
      return SUPPORTED_EXTENSIONS.has(ext);
    })
    .map(([filePath, content]) => {
      const ext = path.extname(filePath).toLowerCase();
      const normalised = filePath.replace(/\\/g, '/');
      const lineCount = content.split('\n').length;
      return {
        relativePath: normalised,
        absolutePath: normalised,
        extension: ext,
        sizeBytes: Buffer.byteLength(content, 'utf8'),
        lineCount,
      };
    });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function visitDir(rootDir: string, currentDir: string, results: FileRecord[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch {
    // Permission errors or missing dirs — silently skip
    return;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      visitDir(rootDir, path.join(currentDir, entry.name), results);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

      const absolutePath = path.join(currentDir, entry.name);
      const relativePath = path.relative(rootDir, absolutePath).replace(/\\/g, '/');
      const stat = fs.statSync(absolutePath);
      const content = fs.readFileSync(absolutePath, 'utf8');
      const lineCount = content.split('\n').length;

      results.push({
        relativePath,
        absolutePath,
        extension: ext,
        sizeBytes: stat.size,
        lineCount,
      });
    }
  }
}
