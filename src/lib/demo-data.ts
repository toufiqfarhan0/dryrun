/**
 * DryRun — Preloaded Enterprise Demo Scenarios
 * Agent: Core Simulation Engine & Data Architect
 *
 * Three fully-populated enterprise scenarios with realistic module graphs,
 * issue catalogues, and chronological failure cascades for demo/onboarding.
 */

import type {
  Module,
  Issue,
  SimulationEvent,
  AIResult,
  ProjectData,
  RiskLevel,
} from '@/types';

// ---------------------------------------------------------------------------
// § 1. DemoScenario interface
// ---------------------------------------------------------------------------

export interface ProcessingStage {
  label: string;
  duration: number; // ms
}

export interface DemoScenario {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  badgeClass: string;
  data: ProjectData;
  stages: ProcessingStage[];
}

// ---------------------------------------------------------------------------
// § 2. Shared processing stage templates
// ---------------------------------------------------------------------------

export const PROCESSING_STAGES_DEMO: ProcessingStage[] = [
  { label: 'Loading scenario…', duration: 600 },
  { label: 'Parsing module graph…', duration: 800 },
  { label: 'Evaluating blast radius…', duration: 900 },
  { label: 'Running chaos simulation…', duration: 1200 },
  { label: 'Synthesising risk report…', duration: 700 },
];

export const PROCESSING_STAGES_UPLOAD: ProcessingStage[] = [
  { label: 'Extracting archive…', duration: 800 },
  { label: 'Detecting stack…', duration: 600 },
  { label: 'Walking file tree…', duration: 1000 },
  { label: 'Parsing import graph…', duration: 1400 },
  { label: 'Evaluating blast radius…', duration: 1100 },
  { label: 'Running chaos simulation…', duration: 1300 },
  { label: 'Calling watsonx Granite…', duration: 2000 },
  { label: 'Finalising release gate…', duration: 500 },
];

// ---------------------------------------------------------------------------
// § 3. Helper builders
// ---------------------------------------------------------------------------

function module_(
  name: string,
  risk: RiskLevel,
  files: number,
  x: number,
  y: number,
): Module {
  return { name, risk, files, x, y };
}

function issue(
  type: Issue['type'],
  severity: Issue['severity'],
  description: string,
  impact: string,
): Issue {
  return { type, severity, description, impact };
}

function event_(time: string, ev: string, type: SimulationEvent['type']): SimulationEvent {
  return { time, event: ev, type };
}

// ---------------------------------------------------------------------------
// § 4. Scenario 1 — PayStream Gateway
// ---------------------------------------------------------------------------

const PAYSTREAM_MODULES: Module[] = [
  module_('API Gateway', 'warn', 14, 300, 80),
  module_('Auth & Vault Service', 'danger', 22, 100, 220),
  module_('Ledger Engine', 'danger', 31, 500, 220),
  module_('Webhook Event Relay', 'warn', 18, 680, 120),
  module_('Redis Idempotency Store', 'danger', 9, 300, 340),
  module_('Audit Vault & Cold Store', 'ok', 11, 150, 400),
];

const PAYSTREAM_ISSUES: Issue[] = [
  issue(
    'security',
    'critical',
    'Missing HMAC signature verification on inbound Stripe webhooks',
    'Replay attacks can double-charge or cancel transactions without detection',
  ),
  issue(
    'performance',
    'critical',
    'Idempotency lock race condition under burst load (> 800 rps)',
    'Duplicate ledger entries corrupt account balances during peak settlement windows',
  ),
  issue(
    'architecture',
    'critical',
    'No circuit breaker to Stripe/ACH upstreams — unbounded retry storm',
    'Cascading timeout floods exhaust connection pool and take down the entire gateway',
  ),
  issue(
    'security',
    'high',
    'JWT signing secret stored in plaintext environment variable',
    'Token forgery risk if infrastructure is compromised',
  ),
  issue(
    'performance',
    'high',
    'Ledger Engine N+1 query on settlement reconciliation job',
    'Reconciliation latency spikes from 200ms to 8s under load',
  ),
  issue(
    'architecture',
    'medium',
    'Webhook Event Relay has no dead-letter queue',
    'Silent event loss during downstream outages; undetectable without manual audit',
  ),
  issue(
    'security',
    'medium',
    'Auth & Vault Service exposes full JWT claims in error responses',
    'Information disclosure allows privilege escalation reconnaissance',
  ),
];

const PAYSTREAM_SIMULATION: SimulationEvent[] = [
  event_('00:00', 'Deployment initiated — paystream-gateway@v2.4.0-rc1', 'normal'),
  event_('00:12', 'Stripe webhook burst triggers idempotency race — 3 duplicate txns logged', 'warn'),
  event_('00:31', 'Redis lock timeout flood: 847 concurrent lock attempts, 63% failure rate', 'danger'),
  event_('01:14', 'Ledger Engine connection pool exhausted (0/50 available)', 'danger'),
  event_('02:08', 'Auth & Vault Service HTTP 503 — circuit breaker absent, retry storm begins', 'danger'),
  event_('04:22', 'ACH upstream timeout cascade — 12 settlement batches failed silently', 'danger'),
  event_('09:15', 'Audit Vault write queue backed up 14,000 events — data integrity risk', 'warn'),
  event_('18:42', 'API Gateway health check fails — load balancer marks instance UNHEALTHY', 'danger'),
];

const PAYSTREAM_AI_RESULT: AIResult = {
  projectName: 'paystream-gateway',
  stack: ['Node.js', 'TypeScript', 'Redis', 'PostgreSQL', 'Stripe SDK', 'Docker'],
  modules: PAYSTREAM_MODULES,
  risk_score: 86,
  summary:
    'PayStream Gateway presents a CRITICAL blast radius. Three independent failure modes — ' +
    'HMAC bypass, idempotency race, and uncircuit-broken upstream retries — can co-trigger ' +
    'under any moderate load spike. A single Stripe webhook burst will exhaust Redis locks, ' +
    'fill the Ledger Engine connection pool, and cascade into a full gateway outage within ' +
    '18 minutes. Immediate deployment block recommended.',
  issues: PAYSTREAM_ISSUES,
  simulation: PAYSTREAM_SIMULATION,
};

const PAYSTREAM_DATA: ProjectData = {
  projectName: 'paystream-gateway@v2.4.0-rc1',
  modules: PAYSTREAM_MODULES,
  stack: PAYSTREAM_AI_RESULT.stack ?? [],
  aiResult: PAYSTREAM_AI_RESULT,
};

// ---------------------------------------------------------------------------
// § 5. Scenario 2 — Nexus Health Core
// ---------------------------------------------------------------------------

const NEXUS_MODULES: Module[] = [
  module_('FHIR Ingestion Gateway', 'warn', 19, 300, 80),
  module_('EHR Sync Engine', 'danger', 28, 130, 220),
  module_('Patient Identity Vault', 'warn', 16, 490, 220),
  module_('Audit Pipeline', 'ok', 12, 680, 130),
  module_('PostgreSQL Primary', 'danger', 7, 300, 350),
  module_('S3 Archival', 'ok', 8, 500, 380),
];

const NEXUS_ISSUES: Issue[] = [
  issue(
    'performance',
    'critical',
    'DB connection leak in EHR Sync Engine — pool drained after ~2000 requests',
    'FHIR ingestion stalls for all patients once pool is exhausted; manual restart required',
  ),
  issue(
    'performance',
    'high',
    'Unindexed foreign key on patient_records.provider_id (14M rows)',
    'Full sequential scans on every admission query — p99 latency 4.2 s',
  ),
  issue(
    'performance',
    'high',
    'EHR Sync unbounded in-memory queue causes OOM under HL7 burst',
    'Node.js heap exhausted at ~1.8 GB, process killed by OOM — data loss window 30–90 s',
  ),
  issue(
    'security',
    'medium',
    'Patient Identity Vault returns full SSN in error stack traces',
    'HIPAA PHI exposure risk in application logs and downstream error aggregators',
  ),
  issue(
    'architecture',
    'medium',
    'Audit Pipeline silently drops events when Kinesis shard limit exceeded',
    'Compliance audit trail incomplete during peak admission hours',
  ),
  issue(
    'security',
    'low',
    'S3 bucket versioning disabled — accidental overwrites are unrecoverable',
    'Loss of archival data if a bulk ingest job writes malformed records',
  ),
];

const NEXUS_SIMULATION: SimulationEvent[] = [
  event_('00:00', 'Deployment initiated — nexus-health-core@v1.9.4', 'normal'),
  event_('00:08', 'EHR Sync Engine: connection pool at 78% under morning admission surge', 'warn'),
  event_('00:44', 'PostgreSQL Primary: slow query alert — provider_id scan on 14M rows (3.8 s)', 'warn'),
  event_('01:30', 'EHR Sync: connection pool fully exhausted — new HL7 messages queued in memory', 'danger'),
  event_('03:12', 'Node.js heap at 1.6 GB — GC stall cascades into FHIR Gateway 504 errors', 'danger'),
  event_('05:00', 'Patient Identity Vault timeout — FHIR admission flow fully blocked', 'danger'),
  event_('08:20', 'OOM kill: EHR Sync process terminated — 312 unprocessed HL7 messages lost', 'danger'),
  event_('12:00', 'Audit Pipeline drops 4,200 events: Kinesis PutRecords throttled', 'warn'),
];

const NEXUS_AI_RESULT: AIResult = {
  projectName: 'nexus-health-core',
  stack: ['Node.js', 'TypeScript', 'PostgreSQL', 'AWS Kinesis', 'S3', 'HL7 FHIR'],
  modules: NEXUS_MODULES,
  risk_score: 74,
  summary:
    'Nexus Health Core has a HIGH blast radius driven by a slow DB connection leak and ' +
    'unbounded memory growth in the EHR Sync Engine. Under any admission surge, these two ' +
    'issues co-trigger and kill the FHIR ingestion pipeline within 5 minutes. HIPAA compliance ' +
    'is additionally at risk from PHI leakage in error traces. Deployment should be blocked ' +
    'pending connection-pool fix and index migration.',
  issues: NEXUS_ISSUES,
  simulation: NEXUS_SIMULATION,
};

const NEXUS_DATA: ProjectData = {
  projectName: 'nexus-health-core@v1.9.4',
  modules: NEXUS_MODULES,
  stack: NEXUS_AI_RESULT.stack ?? [],
  aiResult: NEXUS_AI_RESULT,
};

// ---------------------------------------------------------------------------
// § 6. Scenario 3 — CloudScale Ingress
// ---------------------------------------------------------------------------

const CLOUDSCALE_MODULES: Module[] = [
  module_('Edge Envoy Mesh', 'warn', 16, 300, 80),
  module_('WAF Rule Engine', 'ok', 21, 120, 210),
  module_('Rate Limiter Cache', 'warn', 11, 480, 210),
  module_('Upstream Router', 'ok', 14, 680, 130),
  module_('TLS Cert Manager', 'danger', 9, 300, 340),
  module_('Metric Telemetry', 'ok', 8, 500, 370),
];

const CLOUDSCALE_ISSUES: Issue[] = [
  issue(
    'security',
    'critical',
    'Certificate rotation race — TLS Cert Manager and Envoy Mesh read cert concurrently',
    'Rolling renewal window causes 30–90 s of TLS handshake failures for ~12% of traffic',
  ),
  issue(
    'performance',
    'high',
    'TLS handshake latency spike during SAN validation on wildcard certs (> 500 ms)',
    'P99 ingress latency exceeds SLA threshold; downstream services timeout cascade',
  ),
  issue(
    'architecture',
    'medium',
    'Rate Limiter Cache uses local Redis — no cluster mode, single point of failure',
    'Redis restart drops all rate-limit counters; burst traffic bypasses limits for 60 s',
  ),
  issue(
    'performance',
    'medium',
    'WAF Rule Engine linear scan on 3,400 rules per request (no trie/bloom optimisation)',
    'Adds ~18 ms per request at p50; 120 ms at p99 under load',
  ),
  issue(
    'architecture',
    'low',
    'Metric Telemetry agent buffers unbounded in memory if Prometheus scrape endpoint is down',
    'Memory growth of ~50 MB/hr; OOM possible after 12 hours of telemetry backpressure',
  ),
];

const CLOUDSCALE_SIMULATION: SimulationEvent[] = [
  event_('00:00', 'Deployment initiated — cloudscale-ingress@v3.1.0', 'normal'),
  event_('00:15', 'TLS Cert Manager begins scheduled certificate rotation', 'normal'),
  event_('00:22', 'Edge Envoy Mesh reads stale cert mid-rotation — TLS handshake error burst', 'warn'),
  event_('00:38', 'TLS handshake failure rate peaks at 12.4% — alerts triggered', 'danger'),
  event_('01:05', 'Rate Limiter Cache Redis restart (unrelated) — burst traffic bypasses rate limits', 'warn'),
  event_('01:50', 'Upstream Router connection pool degraded — downstream 504s from cert errors', 'danger'),
  event_('03:30', 'Certificate rotation completes — TLS error rate normalises', 'normal'),
  event_('06:00', 'WAF Rule Engine latency spike detected — p99 at 118 ms under load test', 'warn'),
];

const CLOUDSCALE_AI_RESULT: AIResult = {
  projectName: 'cloudscale-ingress',
  stack: ['Go', 'Envoy Proxy', 'Redis', 'Prometheus', 'Docker', 'Kubernetes'],
  modules: CLOUDSCALE_MODULES,
  risk_score: 62,
  summary:
    'CloudScale Ingress has a MEDIUM blast radius. The primary risk is the TLS certificate ' +
    'rotation race between the Cert Manager and Envoy Mesh, which creates a predictable ' +
    '30–90 second window of partial TLS failures on every renewal cycle. The Rate Limiter ' +
    'Redis single-point-of-failure and WAF linear scan are secondary risks. Deployment can ' +
    'proceed with a coordinated cert-rotation rollout and Redis sentinel configuration.',
  issues: CLOUDSCALE_ISSUES,
  simulation: CLOUDSCALE_SIMULATION,
};

const CLOUDSCALE_DATA: ProjectData = {
  projectName: 'cloudscale-ingress@v3.1.0',
  modules: CLOUDSCALE_MODULES,
  stack: CLOUDSCALE_AI_RESULT.stack ?? [],
  aiResult: CLOUDSCALE_AI_RESULT,
};

// ---------------------------------------------------------------------------
// § 7. Demo scenario registry
// ---------------------------------------------------------------------------

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'paystream-gateway',
    name: 'PayStream Gateway',
    subtitle: 'Payment processing — critical blast radius',
    tag: 'CRITICAL',
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40',
    data: PAYSTREAM_DATA,
    stages: PROCESSING_STAGES_DEMO,
  },
  {
    id: 'nexus-health-core',
    name: 'Nexus Health Core',
    subtitle: 'HIPAA-regulated EHR — high blast radius',
    tag: 'HIGH',
    badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    data: NEXUS_DATA,
    stages: PROCESSING_STAGES_DEMO,
  },
  {
    id: 'cloudscale-ingress',
    name: 'CloudScale Ingress',
    subtitle: 'API gateway mesh — medium blast radius',
    tag: 'MEDIUM',
    badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    data: CLOUDSCALE_DATA,
    stages: PROCESSING_STAGES_DEMO,
  },
];

/** Default demo data — PayStream Gateway (highest risk, most illustrative). */
export const DEMO_DATA: ProjectData = PAYSTREAM_DATA;
