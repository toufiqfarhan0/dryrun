/**
 * DryRun — Static Analysis Engine
 * Agent: Core Simulation Engine & Data Architect
 *
 * Extracts a file tree from a zip buffer (via adm-zip), detects the technology
 * stack, applies regex-based security/reliability signal scanning, and produces
 * a deterministic `AIResult` with a risk score, module graph, and simulation
 * timeline — all without a live LLM call (used as the fallback/offline path).
 *
 * The `generateDeterministicAnalysis` export is also consumed by the watsonx
 * route when the LLM call fails or when running in demo mode.
 */

import AdmZip from 'adm-zip';
import type { Module, Issue, SimulationEvent, AIResult, RiskLevel } from '@/types';

// ---------------------------------------------------------------------------
// § 1. Public types
// ---------------------------------------------------------------------------

export interface FileTree {
  /** Maps relative path → file content (UTF-8 text; binary files omitted). */
  [path: string]: string;
}

export interface SystemSnapshot {
  projectName: string;
  fileTree: FileTree;
  stack: string[];
  totalFiles: number;
  totalLines: number;
}

// ---------------------------------------------------------------------------
// § 2. Stack detection patterns
// ---------------------------------------------------------------------------

interface StackSignal {
  tech: string;
  files: RegExp[];
  content: RegExp[];
}

const STACK_SIGNALS: StackSignal[] = [
  { tech: 'TypeScript', files: [/\.tsx?$/], content: [/\btsconfig\b/] },
  { tech: 'JavaScript', files: [/\.jsx?$/], content: [] },
  { tech: 'React', files: [/\.tsx$/, /\.jsx$/], content: [/from ['"]react['"]/] },
  { tech: 'Next.js', files: [/next\.config\./], content: [/from ['"]next['"]/] },
  { tech: 'Go', files: [/\.go$/], content: [/^package\s+\w+/m] },
  { tech: 'Python', files: [/\.py$/], content: [] },
  { tech: 'Rust', files: [/\.rs$/], content: [] },
  { tech: 'Java', files: [/\.java$/], content: [] },
  { tech: 'PostgreSQL', files: [/\.sql$/], content: [/postgres|psql|pg_/i] },
  { tech: 'MySQL', files: [], content: [/mysql|MariaDB/i] },
  { tech: 'Redis', files: [], content: [/redis\.create|ioredis|from ['"]redis['"]/] },
  { tech: 'Docker', files: [/Dockerfile/, /docker-compose\.ya?ml$/], content: [] },
  { tech: 'Kubernetes', files: [/\.ya?ml$/], content: [/apiVersion:\s*apps\//] },
  { tech: 'Terraform', files: [/\.tf$/], content: [] },
  { tech: 'GraphQL', files: [/\.graphql$/, /\.gql$/], content: [/from ['"]graphql['"]/] },
  { tech: 'gRPC', files: [/\.proto$/], content: [/syntax = "proto/] },
  { tech: 'AWS SDK', files: [], content: [/from ['"]@aws-sdk\//] },
  { tech: 'Kafka', files: [], content: [/kafkajs|confluent-kafka|KafkaProducer/] },
  { tech: 'Stripe SDK', files: [], content: [/from ['"]stripe['"]/] },
];

// ---------------------------------------------------------------------------
// § 3. Security / reliability signal patterns
// ---------------------------------------------------------------------------

interface SignalPattern {
  id: string;
  pattern: RegExp;
  type: Issue['type'];
  severity: Issue['severity'];
  description: string;
  impact: string;
}

const SIGNAL_PATTERNS: SignalPattern[] = [
  {
    id: 'hardcoded-secret',
    pattern: /(?:password|secret|api_key|apikey|token|passwd)\s*[:=]\s*['"][^'"]{8,}['"]/i,
    type: 'security',
    severity: 'critical',
    description: 'Hardcoded credential detected in source file',
    impact: 'Immediate secret exposure if repository is compromised or logs are leaked',
  },
  {
    id: 'eval-dynamic',
    pattern: /\beval\s*\(|\bnew Function\s*\(/,
    type: 'security',
    severity: 'high',
    description: 'Dynamic code execution via eval() or new Function()',
    impact: 'Remote code execution vector if any user-controlled input reaches this call',
  },
  {
    id: 'insecure-http',
    pattern: /https?:\/\/(?!localhost|127\.0\.0\.1)[^'"]+['"].*(?:fetch|axios|got|request)\b/,
    type: 'security',
    severity: 'medium',
    description: 'HTTP (non-TLS) outbound call to external host',
    impact: 'Data in transit is unencrypted; susceptible to MITM interception',
  },
  {
    id: 'missing-timeout',
    pattern: /(?:fetch|axios\.(?:get|post|put|delete|patch))\s*\([^)]*\)(?![^{]*timeout)/,
    type: 'performance',
    severity: 'medium',
    description: 'HTTP client call without explicit timeout configuration',
    impact: 'Unbounded wait time can exhaust connection pools under slow upstream conditions',
  },
  {
    id: 'sql-injection',
    pattern: /(?:query|execute|raw)\s*\(`[^`]*\$\{/,
    type: 'security',
    severity: 'critical',
    description: 'Potential SQL injection via template-literal query construction',
    impact: 'Attacker-controlled SQL can exfiltrate or destroy the entire database',
  },
  {
    id: 'no-error-handling',
    pattern: /\.then\s*\([^)]+\)(?!\s*\.catch)/,
    type: 'architecture',
    severity: 'low',
    description: 'Unhandled Promise rejection — .then() without .catch()',
    impact: 'Silent failures cause data inconsistency and undetectable errors in production',
  },
  {
    id: 'console-log-production',
    pattern: /console\.log\s*\(/,
    type: 'architecture',
    severity: 'low',
    description: 'console.log() present in source (potential production log noise)',
    impact: 'Sensitive data may leak into log aggregators; log volume overhead at scale',
  },
  {
    id: 'disabled-ssl-verify',
    pattern: /rejectUnauthorized\s*:\s*false|ssl_verify\s*=\s*false|verify\s*=\s*False/,
    type: 'security',
    severity: 'high',
    description: 'SSL/TLS certificate verification explicitly disabled',
    impact: 'All TLS connections are vulnerable to MITM attacks — certificate pinning bypassed',
  },
  {
    id: 'unbounded-buffer',
    pattern: /new\s+(?:Array|Buffer)\s*\(\s*(?:\w+\.length|\d{7,})\s*\)/,
    type: 'performance',
    severity: 'medium',
    description: 'Potentially unbounded array or buffer allocation',
    impact: 'Memory exhaustion under high load; OOM kills process and drops in-flight requests',
  },
  {
    id: 'todo-fixme',
    pattern: /\/\/\s*(?:TODO|FIXME|HACK|XXX):/,
    type: 'architecture',
    severity: 'low',
    description: 'Unresolved TODO/FIXME comment found in production path',
    impact: 'Indicates known technical debt that may manifest as a bug under production load',
  },
];

// ---------------------------------------------------------------------------
// § 4. File-tree extraction from zip buffer
// ---------------------------------------------------------------------------

const MAX_TEXT_FILE_BYTES = 512 * 1024; // 512 KB per file
const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'svg',
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  'zip', 'tar', 'gz', 'bz2', 'xz',
  'pdf', 'doc', 'docx', 'xls', 'xlsx',
  'exe', 'dll', 'so', 'dylib',
  'mp3', 'mp4', 'wav', 'ogg',
  'lock', 'bin', 'dat',
]);

function isBinaryExtension(filePath: string): boolean {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  return BINARY_EXTENSIONS.has(ext);
}

/**
 * Extracts a normalised `FileTree` from a zip-format `Buffer`.
 * Non-text and oversized files are silently skipped.
 */
export function extractFileTree(zipBuffer: Buffer): FileTree {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();
  const tree: FileTree = {};

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    const rawPath = entry.entryName;
    // Strip GitHub's top-level directory prefix (e.g. "owner-repo-abc123/")
    const path = rawPath.replace(/^[^/]+\//, '');

    if (!path || isBinaryExtension(path)) continue;
    if (entry.header.size > MAX_TEXT_FILE_BYTES) continue;

    try {
      const content = entry.getData().toString('utf-8');
      tree[path] = content;
    } catch {
      // Skip files that can't be decoded as UTF-8
    }
  }

  return tree;
}

// ---------------------------------------------------------------------------
// § 5. Stack detection
// ---------------------------------------------------------------------------

function detectStack(tree: FileTree): string[] {
  const paths = Object.keys(tree);
  const contents = Object.values(tree);
  const detected = new Set<string>();

  for (const signal of STACK_SIGNALS) {
    const matchesFile = signal.files.some((pat) => paths.some((p) => pat.test(p)));
    const matchesContent = signal.content.some((pat) => contents.some((c) => pat.test(c)));
    if (matchesFile || matchesContent) {
      detected.add(signal.tech);
    }
  }

  return Array.from(detected);
}

// ---------------------------------------------------------------------------
// § 6. Module inference
// ---------------------------------------------------------------------------

/** Directory names that represent infrastructure glue rather than service modules. */
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', 'coverage',
  'vendor', '__pycache__', '.cache', 'tmp',
]);

/** Well-known top-level directory → module name overrides. */
const DIR_LABELS: Record<string, string> = {
  api: 'API Layer',
  auth: 'Auth Service',
  db: 'Database Layer',
  database: 'Database Layer',
  services: 'Service Layer',
  lib: 'Core Library',
  utils: 'Utilities',
  components: 'UI Components',
  pages: 'Page Routes',
  app: 'Application Core',
  config: 'Configuration',
  middleware: 'Middleware',
  routes: 'Route Handlers',
  controllers: 'Controllers',
  models: 'Data Models',
  handlers: 'Event Handlers',
  workers: 'Background Workers',
  jobs: 'Scheduled Jobs',
  queues: 'Message Queues',
  cache: 'Cache Layer',
  storage: 'Storage Layer',
  events: 'Event Bus',
  gateway: 'API Gateway',
};

function inferRisk(paths: string[], contents: string[]): RiskLevel {
  const allContent = contents.join('\n');
  let score = 0;
  for (const sig of SIGNAL_PATTERNS) {
    if (sig.severity === 'critical' && sig.pattern.test(allContent)) score += 3;
    if (sig.severity === 'high' && sig.pattern.test(allContent)) score += 2;
    if (sig.severity === 'medium' && sig.pattern.test(allContent)) score += 1;
  }
  // Auth/payment/db paths carry inherent risk weight
  const sensitivePathMatch = paths.some((p) =>
    /auth|payment|billing|credential|secret|password|db|database|sql/i.test(p),
  );
  if (sensitivePathMatch) score += 2;
  if (score >= 4) return 'danger';
  if (score >= 2) return 'warn';
  return 'ok';
}

function buildModules(tree: FileTree): Module[] {
  // Group files by their top-level directory
  const dirMap = new Map<string, { paths: string[]; contents: string[] }>();

  for (const [filePath, content] of Object.entries(tree)) {
    const parts = filePath.split('/');
    const topDir = parts.length > 1 ? (parts[0] ?? 'root') : 'root';
    if (SKIP_DIRS.has(topDir)) continue;

    if (!dirMap.has(topDir)) {
      dirMap.set(topDir, { paths: [], contents: [] });
    }
    const entry = dirMap.get(topDir)!;
    entry.paths.push(filePath);
    entry.contents.push(content);
  }

  // Cap at 8 modules for visual clarity
  const MAX_MODULES = 8;
  const dirs = Array.from(dirMap.entries())
    .sort((a, b) => b[1].paths.length - a[1].paths.length)
    .slice(0, MAX_MODULES);

  const LAYOUT_COLS = 3;
  const H_SPACING = 220;
  const V_SPACING = 140;

  return dirs.map(([dir, { paths, contents }], idx) => {
    const col = idx % LAYOUT_COLS;
    const row = Math.floor(idx / LAYOUT_COLS);
    const label = DIR_LABELS[dir.toLowerCase()] ?? capitalise(dir);
    return {
      name: label,
      risk: inferRisk(paths, contents),
      files: paths.length,
      x: 80 + col * H_SPACING,
      y: 80 + row * V_SPACING,
    };
  });
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// § 7. Signal scanning
// ---------------------------------------------------------------------------

function scanIssues(tree: FileTree): Issue[] {
  const allContent = Object.values(tree).join('\n\n---FILE_BOUNDARY---\n\n');
  const found: Issue[] = [];
  const seen = new Set<string>();

  for (const sig of SIGNAL_PATTERNS) {
    if (seen.has(sig.id)) continue;
    if (sig.pattern.test(allContent)) {
      seen.add(sig.id);
      found.push({
        type: sig.type,
        severity: sig.severity,
        description: sig.description,
        impact: sig.impact,
      });
    }
  }

  return found;
}

// ---------------------------------------------------------------------------
// § 8. System snapshot builder
// ---------------------------------------------------------------------------

export function buildSystemSnapshot(
  projectName: string,
  tree: FileTree,
): SystemSnapshot {
  const stack = detectStack(tree);
  const totalFiles = Object.keys(tree).length;
  const totalLines = Object.values(tree).reduce(
    (acc, content) => acc + content.split('\n').length,
    0,
  );

  return { projectName, fileTree: tree, stack, totalFiles, totalLines };
}

// ---------------------------------------------------------------------------
// § 9. Deterministic risk score
// ---------------------------------------------------------------------------

const RISK_WEIGHT_CRITICAL = 15;
const RISK_WEIGHT_HIGH = 8;
const RISK_WEIGHT_MEDIUM = 4;
const RISK_WEIGHT_LOW = 1;
const RISK_BASE = 30;
const RISK_MAX = 100;
const RISK_FILE_SCALE = 50; // divide totalFiles by this to add a size factor
const RISK_FILE_CAP = 15;   // max contribution from file size

/**
 * Produces a stable 0–100 risk score from issues and snapshot metrics.
 * No randomness — same inputs always produce the same score.
 */
export function generateDeterministicRiskScore(
  issues: Issue[],
  snapshot: SystemSnapshot,
): number {
  let score = RISK_BASE;

  for (const issue of issues) {
    if (issue.severity === 'critical') score += RISK_WEIGHT_CRITICAL;
    else if (issue.severity === 'high') score += RISK_WEIGHT_HIGH;
    else if (issue.severity === 'medium') score += RISK_WEIGHT_MEDIUM;
    else score += RISK_WEIGHT_LOW;
  }

  // Larger codebases have more blast radius
  const fileFactor = Math.min(snapshot.totalFiles / RISK_FILE_SCALE, RISK_FILE_CAP);
  score += Math.round(fileFactor);

  return Math.min(Math.round(score), RISK_MAX);
}

// ---------------------------------------------------------------------------
// § 10. Simulation timeline generator
// ---------------------------------------------------------------------------

const BASE_SIMULATION_EVENTS: SimulationEvent[] = [
  { time: '00:00', event: 'Deployment initiated — static analysis complete', type: 'normal' },
  { time: '00:08', event: 'Dependency graph traversal started — resolving transitive imports', type: 'normal' },
  { time: '00:22', event: 'First blast-radius wave computed — direct dependents flagged', type: 'warn' },
  { time: '00:45', event: 'Chaos fault injection: SERVICE_OUTAGE on entry-point module', type: 'danger' },
  { time: '01:12', event: 'Error rate breaches 5% threshold — downstream health checks failing', type: 'danger' },
  { time: '02:30', event: 'Circuit breaker state: OPEN on 2 critical paths', type: 'warn' },
  { time: '04:00', event: 'Recovery probe initiated — retry budget at 40%', type: 'normal' },
  { time: '06:15', event: 'Simulation complete — blast radius report finalised', type: 'normal' },
];

function buildSimulation(issues: Issue[], score: number): SimulationEvent[] {
  const events: SimulationEvent[] = [...BASE_SIMULATION_EVENTS];

  // Inject issue-specific events
  for (const issue of issues) {
    if (issue.severity === 'critical') {
      events.splice(3, 0, {
        time: '00:31',
        event: `CRITICAL: ${issue.description} — blast propagation begins`,
        type: 'danger',
      });
      break;
    }
  }

  // Add a score-based outcome event
  if (score >= 75) {
    events.push({
      time: '08:00',
      event: `Release gate: BLOCKED — aggregate risk score ${score}/100 exceeds threshold`,
      type: 'danger',
    });
  } else if (score >= 50) {
    events.push({
      time: '08:00',
      event: `Release gate: WARNING — risk score ${score}/100, manual review required`,
      type: 'warn',
    });
  } else {
    events.push({
      time: '08:00',
      event: `Release gate: APPROVED — risk score ${score}/100 within acceptable bounds`,
      type: 'normal',
    });
  }

  return events;
}

// ---------------------------------------------------------------------------
// § 11. Summary text generator
// ---------------------------------------------------------------------------

function buildSummary(snapshot: SystemSnapshot, issues: Issue[], score: number): string {
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const highCount = issues.filter((i) => i.severity === 'high').length;
  const gateLabel = score >= 75 ? 'BLOCKED' : score >= 50 ? 'WARNING' : 'APPROVED';

  const stackSummary = snapshot.stack.length > 0
    ? `Built on ${snapshot.stack.slice(0, 4).join(', ')}${snapshot.stack.length > 4 ? ' and more' : ''}.`
    : 'Stack detected from file tree.';

  const issuesSummary =
    criticalCount > 0
      ? `${criticalCount} critical and ${highCount} high-severity issue${highCount !== 1 ? 's' : ''} identified.`
      : highCount > 0
        ? `${highCount} high-severity issue${highCount !== 1 ? 's' : ''} identified, no critical findings.`
        : 'No critical or high-severity issues detected.';

  return (
    `${snapshot.projectName} — ${snapshot.totalFiles} files analysed across ${snapshot.stack.length} detected technologies. ` +
    `${stackSummary} ${issuesSummary} ` +
    `Aggregate blast-radius risk score: ${score}/100. Release gate: ${gateLabel}.`
  );
}

// ---------------------------------------------------------------------------
// § 12. Master analysis entry point
// ---------------------------------------------------------------------------

/**
 * Produces a fully deterministic `AIResult` from a parsed file tree.
 * No external calls — suitable for offline use and as a watsonx fallback.
 */
export function generateDeterministicAnalysis(
  projectName: string,
  tree: FileTree,
): AIResult {
  const snapshot = buildSystemSnapshot(projectName, tree);
  const modules = buildModules(tree);
  const issues = scanIssues(tree);
  const riskScore = generateDeterministicRiskScore(issues, snapshot);
  const simulation = buildSimulation(issues, riskScore);
  const summary = buildSummary(snapshot, issues, riskScore);

  return {
    projectName,
    stack: snapshot.stack,
    modules,
    risk_score: riskScore,
    summary,
    issues,
    simulation,
  };
}
