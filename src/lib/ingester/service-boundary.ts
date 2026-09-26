/**
 * DryRun — Service Boundary Detector
 * Agent 2: AST Dependency Ingester
 *
 * Heuristically classifies source files as service boundaries and assigns
 * NodeType + criticality based on naming conventions, content patterns,
 * and framework-specific markers.
 */

import type { NodeType } from '@/types';

// NOTE: NodeType does not include 'DATABASE' — database boundaries are classified
// as 'SERVICE' with a 'database' subtype stored in metadata.
type InternalNodeSubtype = 'database' | 'api' | 'queue' | 'worker' | 'module';

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
  /** Fine-grained subtype stored in node metadata */
  nodeSubtype: InternalNodeSubtype;
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
const PATH_SIGNALS: Array<{
  pattern: RegExp;
  nodeType: NodeType;
  nodeSubtype: InternalNodeSubtype;
  signal: string;
  weight: number;
}> = [
  // Next.js App Router route handlers
  {
    pattern: /(?:^|\/)route\.(ts|tsx|js|jsx)$/,
    nodeType: 'SERVICE',
    nodeSubtype: 'api',
    signal: 'Next.js route handler',
    weight: 3,
  },
  // Next.js page entries (potential SSR boundary)
  {
    pattern: /(?:^|\/)page\.(tsx|jsx|ts|js)$/,
    nodeType: 'SERVICE',
    nodeSubtype: 'api',
    signal: 'Next.js page entry',
    weight: 2,
  },
  // Next.js layout
  {
    pattern: /(?:^|\/)layout\.(tsx|jsx|ts|js)$/,
    nodeType: 'SERVICE',
    nodeSubtype: 'api',
    signal: 'Next.js layout entry',
    weight: 1,
  },
  // Next.js middleware
  {
    pattern: /(?:^|\/)middleware\.(ts|js)$/,
    nodeType: 'SERVICE',
    nodeSubtype: 'api',
    signal: 'Next.js middleware',
    weight: 3,
  },
  // Microservice / worker entry points
  {
    pattern: /(?:^|\/)(?:server|worker|daemon|listener|main|index)\.(ts|js|mjs)$/,
    nodeType: 'SERVICE',
    nodeSubtype: 'worker',
    signal: 'Service entry point',
    weight: 2,
  },
  // Prisma schema / client — classified as SERVICE with subtype database
  {
    pattern: /prisma(?:\/|\\)(?:schema|client|seed)/,
    nodeType: 'SERVICE',
    nodeSubtype: 'database',
    signal: 'Prisma ORM',
    weight: 4,
  },
  // Drizzle ORM
  {
    pattern: /drizzle(?:\/|\\)/,
    nodeType: 'SERVICE',
    nodeSubtype: 'database',
    signal: 'Drizzle ORM',
    weight: 4,
  },
  // Mongoose / MongoDB models
  {
    pattern: /(?:models?|schemas?)\/.*\.(ts|js)$/i,
    nodeType: 'SERVICE',
    nodeSubtype: 'database',
    signal: 'Database model',
    weight: 3,
  },
  // Test files → TEST type, low criticality
  {
    pattern: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
    nodeType: 'TEST',
    nodeSubtype: 'module',
    signal: 'Test file',
    weight: -2,
  },
  // Config / infrastructure files
  {
    pattern:
      /(?:^|\/)(?:next\.config|tailwind\.config|postcss\.config|vitest\.config|jest\.config|eslint\.config|tsconfig)\./,
    nodeType: 'CONFIG',
    nodeSubtype: 'module',
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
  let resolvedSubtype: InternalNodeSubtype = 'module';

  // --- Path-based signals ---
  for (const rule of PATH_SIGNALS) {
    if (rule.pattern.test(relativePath)) {
      signals.push(rule.signal);
      weightSum += rule.weight;
      if (rule.weight > 0) {
        const picked = pickNodeType(resolvedNodeType, rule.nodeType, rule.weight);
        if (picked !== resolvedNodeType) {
          resolvedNodeType = picked;
          resolvedSubtype = rule.nodeSubtype;
        }
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
    nodeSubtype: resolvedSubtype,
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
  if (score >= 6) return 'CRITICAL';
  if (nodeType === 'SERVICE' && score >= 3) return 'HIGH';
  if (score >= 4) return 'HIGH';
  if (score >= CRITICALITY_INCREMENT * 2) return 'MEDIUM';
  return 'LOW';
}
