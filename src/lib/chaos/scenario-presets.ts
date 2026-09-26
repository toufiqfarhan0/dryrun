/**
 * DryRun — Chaos Fault Injection Engine
 * Scenario Presets
 *
 * Built-in enterprise fault scenarios with realistic parameters.
 * Each scenario uses a sentinel `targetNodeId` of '__PLACEHOLDER__' —
 * callers MUST replace this with the actual origin node before running
 * the simulation (the `runSimulation` API does this automatically when
 * a concrete targetNodeId is provided at call time).
 *
 * These presets are exported as FaultScenario[] so they can be offered
 * directly in the ControlPanel UI's scenario selector.
 */

import type { FaultScenario } from '@/types';

// ---------------------------------------------------------------------------
// Scenario IDs — stable references for consumers
// ---------------------------------------------------------------------------

export const SCENARIO_ID_DOWNSTREAM_500_CASCADE = 'b1a2c3d4-0000-4000-8000-000000000001';
export const SCENARIO_ID_NETWORK_LATENCY_SPIKE = 'b1a2c3d4-0000-4000-8000-000000000002';
export const SCENARIO_ID_DB_POOL_STARVATION = 'b1a2c3d4-0000-4000-8000-000000000003';
export const SCENARIO_ID_CONTRACT_SCHEMA_DRIFT = 'b1a2c3d4-0000-4000-8000-000000000004';

// ---------------------------------------------------------------------------
// Sentinel — replaced at runtime by the caller's chosen origin node
// ---------------------------------------------------------------------------

export const PLACEHOLDER_NODE_ID = '__PLACEHOLDER__';

// ---------------------------------------------------------------------------
// Preset definitions
// ---------------------------------------------------------------------------

/**
 * Downstream 500 Cascade
 *
 * A hard service failure (HTTP 5xx storm) at the origin propagates upstream
 * through all callers. Severity is total (1.0); exponential decay models
 * circuit-breaker attenuation across hops.
 */
const DOWNSTREAM_500_CASCADE: FaultScenario = {
  id: SCENARIO_ID_DOWNSTREAM_500_CASCADE,
  name: 'Downstream 500 Cascade',
  description:
    'Hard service failure at the origin node returns HTTP 5xx to all callers. ' +
    'Error floods propagate upstream, exhausting retry budgets and triggering ' +
    'cascading failures across dependent services.',
  faultType: 'SERVICE_OUTAGE',
  targetNodeId: PLACEHOLDER_NODE_ID,
  params: {
    severity: 1.0,
    spreadDecayModel: 'EXPONENTIAL',
    decayFactor: 0.65,
  },
};

/**
 * Network Latency Spike
 *
 * A 4500 ms tail-latency spike causes gateway request queues to saturate.
 * Upstream services block on slow responses, exhausting thread/connection pools.
 * Step decay models the fact that intelligent timeouts limit blast radius beyond
 * a few hops — but everything within timeout reach is severely degraded.
 */
const NETWORK_LATENCY_SPIKE: FaultScenario = {
  id: SCENARIO_ID_NETWORK_LATENCY_SPIKE,
  name: 'Network Latency Spike (4500 ms P99)',
  description:
    'P99 response time at the origin spikes to 4 500 ms, causing API gateway ' +
    'request queues to saturate. Upstream services block on slow responses, ' +
    'thread pools exhaust, and upstream timeout cascades begin within 2–3 hops.',
  faultType: 'LATENCY_P99_SPIKE',
  targetNodeId: PLACEHOLDER_NODE_ID,
  params: {
    severity: 0.85,
    spreadDecayModel: 'STEP',
    decayFactor: 0.5,
  },
};

/**
 * Database Connection Pool Starvation
 *
 * The shared database connection pool at the origin is fully exhausted.
 * All transactional API paths that depend on the pool become unavailable.
 * Linear decay models gradual degradation: services with connection pooling
 * of their own absorb some impact, but the effect reaches several hops out.
 */
const DB_POOL_STARVATION: FaultScenario = {
  id: SCENARIO_ID_DB_POOL_STARVATION,
  name: 'Database Connection Pool Starvation',
  description:
    'Backend database connection pool exhausted at origin. All transactional ' +
    'API paths block on pool acquisition. Write paths fail immediately; read ' +
    'paths degrade as cached data ages. Effect dissipates linearly with service ' +
    'boundaries that maintain their own pools.',
  faultType: 'ERROR_RATE_BREACH',
  targetNodeId: PLACEHOLDER_NODE_ID,
  params: {
    severity: 0.9,
    spreadDecayModel: 'LINEAR',
    decayFactor: 0.75,
  },
};

/**
 * Contract / Schema Drift
 *
 * A breaking serialization change (renamed field, removed required property,
 * type mismatch) causes silent data corruption or hard deserialization failures
 * between microservices. Exponential decay with a high retention factor models
 * that bad data can propagate far before failing loudly.
 */
const CONTRACT_SCHEMA_DRIFT: FaultScenario = {
  id: SCENARIO_ID_CONTRACT_SCHEMA_DRIFT,
  name: 'Contract / Schema Drift',
  description:
    'Breaking serialization change at origin (renamed field, removed required ' +
    'property, or type mismatch). Downstream consumers receive malformed payloads, ' +
    'triggering deserialization failures or silent data corruption across the ' +
    'integration surface.',
  faultType: 'DEPENDENCY_REMOVED',
  targetNodeId: PLACEHOLDER_NODE_ID,
  params: {
    severity: 0.75,
    spreadDecayModel: 'EXPONENTIAL',
    decayFactor: 0.8,
  },
};

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

export const DEFAULT_CHAOS_SCENARIOS: FaultScenario[] = [
  DOWNSTREAM_500_CASCADE,
  NETWORK_LATENCY_SPIKE,
  DB_POOL_STARVATION,
  CONTRACT_SCHEMA_DRIFT,
];
