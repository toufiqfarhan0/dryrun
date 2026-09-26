/**
 * DryRun — Enterprise Fixture Mesh
 *
 * A realistic 12-node enterprise microservice dependency graph used for
 * development, testing, and UI demonstration. Represents a typical
 * e-commerce platform with realistic fan-in patterns and two pre-configured
 * PR change-set scenarios.
 */

import type {
  DependencyGraph,
  GraphNode,
  GraphEdge,
  ChangeSet,
  BlastRadiusReport,
  NodeImpact,
  FaultScenario,
  ChaosSimulationResult,
  NodeSimResult,
} from '@/types';

// ---------------------------------------------------------------------------
// Node IDs — named constants to eliminate magic strings
// ---------------------------------------------------------------------------

export const NODE_IDS = {
  API_GATEWAY: 'api-gateway',
  AUTH_SERVICE: 'auth-service',
  USER_SERVICE: 'user-service',
  BILLING_ENGINE: 'billing-engine',
  INVENTORY_DB: 'inventory-db',
  ORDER_SERVICE: 'order-service',
  NOTIFICATION_WORKER: 'notification-worker',
  KAFKA_BROKER: 'kafka-broker',
  PAYMENT_GATEWAY: 'payment-gateway',
  SEARCH_SERVICE: 'search-service',
  CACHE_LAYER: 'cache-layer',
  CONFIG_SERVICE: 'config-service',
} as const;

// ---------------------------------------------------------------------------
// Graph nodes
// ---------------------------------------------------------------------------

const nodes: Record<string, GraphNode> = {
  [NODE_IDS.API_GATEWAY]: {
    id: NODE_IDS.API_GATEWAY,
    label: 'API Gateway',
    filePath: 'services/api-gateway/src/index.ts',
    nodeType: 'SERVICE',
    exports: ['router', 'middleware', 'healthCheck'],
    isEntryPoint: true,
    loc: 420,
    metadata: { version: '2.4.1', team: 'platform', sla: '99.99%' },
  },
  [NODE_IDS.AUTH_SERVICE]: {
    id: NODE_IDS.AUTH_SERVICE,
    label: 'Auth Service',
    filePath: 'services/auth-service/src/index.ts',
    nodeType: 'SERVICE',
    exports: ['verifyToken', 'issueToken', 'refreshToken', 'TokenSchema'],
    isEntryPoint: false,
    loc: 680,
    metadata: { version: '3.1.0', team: 'security', critical: true },
  },
  [NODE_IDS.USER_SERVICE]: {
    id: NODE_IDS.USER_SERVICE,
    label: 'User Service',
    filePath: 'services/user-service/src/index.ts',
    nodeType: 'SERVICE',
    exports: ['getUser', 'updateUser', 'deleteUser'],
    isEntryPoint: false,
    loc: 540,
    metadata: { version: '1.8.3', team: 'identity' },
  },
  [NODE_IDS.BILLING_ENGINE]: {
    id: NODE_IDS.BILLING_ENGINE,
    label: 'Billing Engine',
    filePath: 'services/billing-engine/src/index.ts',
    nodeType: 'SERVICE',
    exports: ['createInvoice', 'processPayment', 'refundTransaction'],
    isEntryPoint: false,
    loc: 1240,
    metadata: { version: '4.0.2', team: 'fintech', pci: true },
  },
  [NODE_IDS.INVENTORY_DB]: {
    id: NODE_IDS.INVENTORY_DB,
    label: 'Inventory DB',
    filePath: 'services/inventory-db/src/client.ts',
    nodeType: 'SERVICE',
    exports: ['InventoryClient', 'queryStock', 'reserveItem'],
    isEntryPoint: false,
    loc: 290,
    metadata: { version: '2.0.0', team: 'data', engine: 'postgres' },
  },
  [NODE_IDS.ORDER_SERVICE]: {
    id: NODE_IDS.ORDER_SERVICE,
    label: 'Order Service',
    filePath: 'services/order-service/src/index.ts',
    nodeType: 'SERVICE',
    exports: ['createOrder', 'cancelOrder', 'getOrderStatus'],
    isEntryPoint: false,
    loc: 870,
    metadata: { version: '2.2.0', team: 'commerce' },
  },
  [NODE_IDS.NOTIFICATION_WORKER]: {
    id: NODE_IDS.NOTIFICATION_WORKER,
    label: 'Notification Worker',
    filePath: 'services/notification-worker/src/consumer.ts',
    nodeType: 'SERVICE',
    exports: ['NotificationConsumer', 'sendEmail', 'sendSms', 'sendPush'],
    isEntryPoint: false,
    loc: 460,
    metadata: { version: '1.3.1', team: 'comms', async: true },
  },
  [NODE_IDS.KAFKA_BROKER]: {
    id: NODE_IDS.KAFKA_BROKER,
    label: 'Kafka Broker',
    filePath: 'infra/kafka/src/client.ts',
    nodeType: 'EXTERNAL',
    exports: ['KafkaProducer', 'KafkaConsumer', 'TopicConfig'],
    isEntryPoint: false,
    loc: 120,
    metadata: { version: '3.6.0', team: 'platform', type: 'message-bus' },
  },
  [NODE_IDS.PAYMENT_GATEWAY]: {
    id: NODE_IDS.PAYMENT_GATEWAY,
    label: 'Payment Gateway',
    filePath: 'services/payment-gateway/src/index.ts',
    nodeType: 'SERVICE',
    exports: ['chargeCard', 'voidCharge', 'getTransaction'],
    isEntryPoint: false,
    loc: 760,
    metadata: { version: '5.1.0', team: 'fintech', pci: true, external: true },
  },
  [NODE_IDS.SEARCH_SERVICE]: {
    id: NODE_IDS.SEARCH_SERVICE,
    label: 'Search Service',
    filePath: 'services/search-service/src/index.ts',
    nodeType: 'SERVICE',
    exports: ['searchProducts', 'indexProduct', 'suggest'],
    isEntryPoint: false,
    loc: 380,
    metadata: { version: '1.1.4', team: 'discovery', engine: 'elasticsearch' },
  },
  [NODE_IDS.CACHE_LAYER]: {
    id: NODE_IDS.CACHE_LAYER,
    label: 'Cache Layer',
    filePath: 'infra/cache/src/redis-client.ts',
    nodeType: 'MODULE',
    exports: ['RedisClient', 'withCache', 'invalidate'],
    isEntryPoint: false,
    loc: 150,
    metadata: { version: '2.1.0', team: 'platform', engine: 'redis' },
  },
  [NODE_IDS.CONFIG_SERVICE]: {
    id: NODE_IDS.CONFIG_SERVICE,
    label: 'Config Service',
    filePath: 'services/config-service/src/index.ts',
    nodeType: 'CONFIG',
    exports: ['getFeatureFlag', 'getSecret', 'ConfigClient'],
    isEntryPoint: false,
    loc: 200,
    metadata: { version: '1.0.5', team: 'platform', sensitive: true },
  },
};

// ---------------------------------------------------------------------------
// Edges — realistic fan-in dependency graph
// ---------------------------------------------------------------------------

const edges: GraphEdge[] = [
  // API Gateway → downstream services (fan-out)
  { source: NODE_IDS.API_GATEWAY, target: NODE_IDS.AUTH_SERVICE, edgeType: 'HTTP_CALL', weight: 12 },
  { source: NODE_IDS.API_GATEWAY, target: NODE_IDS.ORDER_SERVICE, edgeType: 'HTTP_CALL', weight: 8 },
  { source: NODE_IDS.API_GATEWAY, target: NODE_IDS.SEARCH_SERVICE, edgeType: 'HTTP_CALL', weight: 15 },
  { source: NODE_IDS.API_GATEWAY, target: NODE_IDS.USER_SERVICE, edgeType: 'HTTP_CALL', weight: 7 },
  { source: NODE_IDS.API_GATEWAY, target: NODE_IDS.CONFIG_SERVICE, edgeType: 'HTTP_CALL', weight: 3 },

  // Auth Service dependencies
  { source: NODE_IDS.AUTH_SERVICE, target: NODE_IDS.USER_SERVICE, edgeType: 'HTTP_CALL', weight: 9 },
  { source: NODE_IDS.AUTH_SERVICE, target: NODE_IDS.CACHE_LAYER, edgeType: 'STATIC_IMPORT', weight: 1 },
  { source: NODE_IDS.AUTH_SERVICE, target: NODE_IDS.CONFIG_SERVICE, edgeType: 'HTTP_CALL', weight: 2 },

  // Order Service dependencies — high fan-in node
  { source: NODE_IDS.ORDER_SERVICE, target: NODE_IDS.BILLING_ENGINE, edgeType: 'HTTP_CALL', weight: 6 },
  { source: NODE_IDS.ORDER_SERVICE, target: NODE_IDS.INVENTORY_DB, edgeType: 'HTTP_CALL', weight: 10 },
  { source: NODE_IDS.ORDER_SERVICE, target: NODE_IDS.KAFKA_BROKER, edgeType: 'STATIC_IMPORT', weight: 5 },
  { source: NODE_IDS.ORDER_SERVICE, target: NODE_IDS.AUTH_SERVICE, edgeType: 'HTTP_CALL', weight: 4 },
  { source: NODE_IDS.ORDER_SERVICE, target: NODE_IDS.CACHE_LAYER, edgeType: 'STATIC_IMPORT', weight: 2 },

  // Billing Engine dependencies
  { source: NODE_IDS.BILLING_ENGINE, target: NODE_IDS.PAYMENT_GATEWAY, edgeType: 'HTTP_CALL', weight: 8 },
  { source: NODE_IDS.BILLING_ENGINE, target: NODE_IDS.KAFKA_BROKER, edgeType: 'STATIC_IMPORT', weight: 3 },
  { source: NODE_IDS.BILLING_ENGINE, target: NODE_IDS.CONFIG_SERVICE, edgeType: 'HTTP_CALL', weight: 2 },

  // Notification Worker — async consumer from Kafka
  { source: NODE_IDS.NOTIFICATION_WORKER, target: NODE_IDS.KAFKA_BROKER, edgeType: 'STATIC_IMPORT', weight: 1 },
  { source: NODE_IDS.NOTIFICATION_WORKER, target: NODE_IDS.USER_SERVICE, edgeType: 'HTTP_CALL', weight: 4 },
  { source: NODE_IDS.NOTIFICATION_WORKER, target: NODE_IDS.CONFIG_SERVICE, edgeType: 'HTTP_CALL', weight: 1 },

  // Search Service dependencies
  { source: NODE_IDS.SEARCH_SERVICE, target: NODE_IDS.INVENTORY_DB, edgeType: 'HTTP_CALL', weight: 5 },
  { source: NODE_IDS.SEARCH_SERVICE, target: NODE_IDS.CACHE_LAYER, edgeType: 'STATIC_IMPORT', weight: 3 },

  // Config Service — reads env secrets
  { source: NODE_IDS.CONFIG_SERVICE, target: NODE_IDS.CACHE_LAYER, edgeType: 'STATIC_IMPORT', weight: 1 },

  // User Service dependencies
  { source: NODE_IDS.USER_SERVICE, target: NODE_IDS.CACHE_LAYER, edgeType: 'STATIC_IMPORT', weight: 2 },
  { source: NODE_IDS.USER_SERVICE, target: NODE_IDS.CONFIG_SERVICE, edgeType: 'ENV_READ', weight: 1 },
];

// ---------------------------------------------------------------------------
// Canonical DependencyGraph export
// ---------------------------------------------------------------------------

export const ENTERPRISE_MESH: DependencyGraph = {
  id: '00000000-0000-4000-a000-000000000001',
  repoUrl: 'https://github.com/example-corp/platform',
  analyzedAt: '2025-01-15T09:00:00.000Z',
  nodes,
  edges,
  stats: {
    totalNodes: Object.keys(nodes).length,
    totalEdges: edges.length,
    maxDepth: 4,
    serviceCount: Object.values(nodes).filter((n) => n.nodeType === 'SERVICE').length,
  },
};

// ---------------------------------------------------------------------------
// Fixture Scenario A: "Auth Token Schema Breaking Change"
// Changes to the shared JWT token shape that cascades through every
// service that validates incoming requests.
// ---------------------------------------------------------------------------

export const CHANGESET_AUTH_SCHEMA: ChangeSet = {
  runId: '00000000-0000-4000-a000-000000000001',
  changedFiles: [
    'services/auth-service/src/token.schema.ts',
    'services/auth-service/src/verify.ts',
    'shared/contracts/src/auth-types.ts',
  ],
  addedFiles: ['services/auth-service/src/token.schema.v2.ts'],
  deletedFiles: [],
  prMetadata: {
    title: 'feat(auth): Migrate JWT payload to v2 schema with nested claims',
    description:
      'Breaking change: the `sub` field is now nested under `claims.subject`. ' +
      'All downstream services that destructure tokens directly must be updated.',
    author: 'alice@example-corp.com',
    targetBranch: 'main',
    url: 'https://github.com/example-corp/platform/pull/4821',
  },
};

export const BLAST_REPORT_AUTH_SCHEMA: BlastRadiusReport = {
  runId: '00000000-0000-4000-a000-000000000001',
  graph: ENTERPRISE_MESH,
  changeSet: CHANGESET_AUTH_SCHEMA,
  impacts: buildAuthSchemaImpacts(),
  criticalPaths: [
    [NODE_IDS.AUTH_SERVICE, NODE_IDS.API_GATEWAY],
    [NODE_IDS.AUTH_SERVICE, NODE_IDS.ORDER_SERVICE, NODE_IDS.BILLING_ENGINE, NODE_IDS.PAYMENT_GATEWAY],
    [NODE_IDS.AUTH_SERVICE, NODE_IDS.ORDER_SERVICE, NODE_IDS.KAFKA_BROKER, NODE_IDS.NOTIFICATION_WORKER],
  ],
  topRiskyNodes: [
    NODE_IDS.API_GATEWAY,
    NODE_IDS.ORDER_SERVICE,
    NODE_IDS.AUTH_SERVICE,
    NODE_IDS.BILLING_ENGINE,
    NODE_IDS.USER_SERVICE,
    NODE_IDS.PAYMENT_GATEWAY,
    NODE_IDS.NOTIFICATION_WORKER,
    NODE_IDS.KAFKA_BROKER,
    NODE_IDS.CACHE_LAYER,
    NODE_IDS.CONFIG_SERVICE,
  ],
  overallBlastScore: 87,
  computedAt: '2025-01-15T09:05:00.000Z',
};

function buildAuthSchemaImpacts(): Record<string, NodeImpact> {
  const impactData: Array<[string, number, number, number, boolean, boolean]> = [
    // [nodeId, score, depth, dependents, onCritical, reachable]
    [NODE_IDS.AUTH_SERVICE, 95, 0, 6, true, true],
    [NODE_IDS.API_GATEWAY, 88, 1, 0, true, true],
    [NODE_IDS.ORDER_SERVICE, 82, 1, 3, true, true],
    [NODE_IDS.USER_SERVICE, 75, 1, 4, false, true],
    [NODE_IDS.BILLING_ENGINE, 70, 2, 1, true, true],
    [NODE_IDS.PAYMENT_GATEWAY, 65, 3, 0, true, true],
    [NODE_IDS.NOTIFICATION_WORKER, 55, 2, 0, true, true],
    [NODE_IDS.KAFKA_BROKER, 45, 2, 2, true, true],
    [NODE_IDS.INVENTORY_DB, 30, 2, 2, false, true],
    [NODE_IDS.SEARCH_SERVICE, 25, 1, 0, false, true],
    [NODE_IDS.CACHE_LAYER, 20, 2, 0, false, true],
    [NODE_IDS.CONFIG_SERVICE, 10, 1, 0, false, true],
  ];

  return Object.fromEntries(
    impactData.map(([nodeId, impactScore, blastDepth, dependentCount, onCriticalPath, reachableFromChanged]) => [
      nodeId,
      { nodeId, impactScore, blastDepth, dependentCount, onCriticalPath, reachableFromChanged },
    ]),
  );
}

// ---------------------------------------------------------------------------
// Fixture Scenario B: "DB Connection Pool Exhaustion"
// A misconfigured pool size in inventory-db leaks connections under load,
// starving order and search services.
// ---------------------------------------------------------------------------

export const CHANGESET_DB_POOL: ChangeSet = {
  runId: '00000000-0000-4000-a000-000000000002',
  changedFiles: [
    'services/inventory-db/src/client.ts',
    'services/inventory-db/src/pool-config.ts',
    'infra/helm/inventory-db/values.yaml',
  ],
  addedFiles: [],
  deletedFiles: ['services/inventory-db/src/pool-legacy.ts'],
  prMetadata: {
    title: 'fix(inventory-db): Increase connection pool and add circuit-breaker',
    description:
      'Pool size raised from 5 → 50 with per-tenant connection limits. ' +
      'Circuit-breaker added for upstream callers. Risk: pool config mismatch on Helm rollout.',
    author: 'bob@example-corp.com',
    targetBranch: 'main',
    url: 'https://github.com/example-corp/platform/pull/4856',
  },
};

export const BLAST_REPORT_DB_POOL: BlastRadiusReport = {
  runId: '00000000-0000-4000-a000-000000000002',
  graph: ENTERPRISE_MESH,
  changeSet: CHANGESET_DB_POOL,
  impacts: buildDbPoolImpacts(),
  criticalPaths: [
    [NODE_IDS.INVENTORY_DB, NODE_IDS.ORDER_SERVICE, NODE_IDS.API_GATEWAY],
    [NODE_IDS.INVENTORY_DB, NODE_IDS.SEARCH_SERVICE, NODE_IDS.API_GATEWAY],
    [NODE_IDS.INVENTORY_DB, NODE_IDS.ORDER_SERVICE, NODE_IDS.BILLING_ENGINE, NODE_IDS.PAYMENT_GATEWAY],
  ],
  topRiskyNodes: [
    NODE_IDS.INVENTORY_DB,
    NODE_IDS.ORDER_SERVICE,
    NODE_IDS.SEARCH_SERVICE,
    NODE_IDS.API_GATEWAY,
    NODE_IDS.BILLING_ENGINE,
    NODE_IDS.PAYMENT_GATEWAY,
    NODE_IDS.KAFKA_BROKER,
    NODE_IDS.NOTIFICATION_WORKER,
    NODE_IDS.AUTH_SERVICE,
    NODE_IDS.CACHE_LAYER,
  ],
  overallBlastScore: 72,
  computedAt: '2025-01-15T11:30:00.000Z',
};

function buildDbPoolImpacts(): Record<string, NodeImpact> {
  const impactData: Array<[string, number, number, number, boolean, boolean]> = [
    [NODE_IDS.INVENTORY_DB, 92, 0, 2, true, true],
    [NODE_IDS.ORDER_SERVICE, 80, 1, 3, true, true],
    [NODE_IDS.SEARCH_SERVICE, 72, 1, 0, true, true],
    [NODE_IDS.API_GATEWAY, 68, 2, 0, true, true],
    [NODE_IDS.BILLING_ENGINE, 55, 2, 1, true, true],
    [NODE_IDS.PAYMENT_GATEWAY, 50, 3, 0, true, true],
    [NODE_IDS.KAFKA_BROKER, 40, 2, 2, false, true],
    [NODE_IDS.NOTIFICATION_WORKER, 35, 3, 0, false, true],
    [NODE_IDS.AUTH_SERVICE, 15, 2, 6, false, false],
    [NODE_IDS.USER_SERVICE, 10, 3, 4, false, false],
    [NODE_IDS.CACHE_LAYER, 20, 2, 0, false, true],
    [NODE_IDS.CONFIG_SERVICE, 5, 3, 0, false, false],
  ];

  return Object.fromEntries(
    impactData.map(([nodeId, impactScore, blastDepth, dependentCount, onCriticalPath, reachableFromChanged]) => [
      nodeId,
      { nodeId, impactScore, blastDepth, dependentCount, onCriticalPath, reachableFromChanged },
    ]),
  );
}

// ---------------------------------------------------------------------------
// Fault Scenarios
// ---------------------------------------------------------------------------

export const FAULT_SCENARIOS_AUTH: FaultScenario[] = [
  {
    id: '10000000-0000-4000-a000-000000000001',
    name: 'Auth Service Complete Outage',
    description:
      'Total loss of the auth service. All authenticated endpoints return 401/503. ' +
      'JWT verification cache has a 30-second TTL; after expiry all services degrade.',
    faultType: 'SERVICE_OUTAGE',
    targetNodeId: NODE_IDS.AUTH_SERVICE,
    params: { severity: 1.0, spreadDecayModel: 'STEP', decayFactor: 0.9 },
  },
  {
    id: '10000000-0000-4000-a000-000000000002',
    name: 'Auth P99 Latency Spike',
    description:
      'Token verification latency rises from 8ms to 2200ms at P99, cascading timeouts to API gateway.',
    faultType: 'LATENCY_P99_SPIKE',
    targetNodeId: NODE_IDS.AUTH_SERVICE,
    params: { severity: 0.75, spreadDecayModel: 'EXPONENTIAL', decayFactor: 0.6 },
  },
];

export const FAULT_SCENARIOS_DB: FaultScenario[] = [
  {
    id: '10000000-0000-4000-a000-000000000003',
    name: 'Inventory DB Connection Pool Exhaustion',
    description:
      'Pool of 5 connections saturated under 50 req/s. New queries queue indefinitely, ' +
      'causing order and search services to time out after 5 seconds.',
    faultType: 'ERROR_RATE_BREACH',
    targetNodeId: NODE_IDS.INVENTORY_DB,
    params: { severity: 0.85, spreadDecayModel: 'EXPONENTIAL', decayFactor: 0.7 },
  },
  {
    id: '10000000-0000-4000-a000-000000000004',
    name: 'Network Partition: Inventory DB Isolated',
    description:
      'Network partition separates inventory-db from order and search services. ' +
      'Circuit breakers open after 10 failed probes.',
    faultType: 'NETWORK_PARTITION',
    targetNodeId: NODE_IDS.INVENTORY_DB,
    params: { severity: 1.0, spreadDecayModel: 'STEP', decayFactor: 0.8 },
  },
];

// ---------------------------------------------------------------------------
// Pre-built ChaosSimulationResults for fixtures
// ---------------------------------------------------------------------------

export const CHAOS_RESULT_AUTH: ChaosSimulationResult = {
  runId: '00000000-0000-4000-a000-000000000001',
  blastRadiusReport: BLAST_REPORT_AUTH_SCHEMA,
  scenarios: FAULT_SCENARIOS_AUTH,
  nodeResults: buildAuthChaosResults(),
  criticalFailureChain: [
    NODE_IDS.AUTH_SERVICE,
    NODE_IDS.API_GATEWAY,
    NODE_IDS.ORDER_SERVICE,
    NODE_IDS.BILLING_ENGINE,
    NODE_IDS.PAYMENT_GATEWAY,
  ],
  aggregateRiskScore: 91,
  simulatedAt: '2025-01-15T09:10:00.000Z',
};

function buildAuthChaosResults(): Record<string, NodeSimResult> {
  const data: Array<[string, number, number]> = [
    [NODE_IDS.AUTH_SERVICE, 0.99, 18.5],
    [NODE_IDS.API_GATEWAY, 0.97, 12.2],
    [NODE_IDS.ORDER_SERVICE, 0.94, 9.8],
    [NODE_IDS.USER_SERVICE, 0.88, 7.5],
    [NODE_IDS.BILLING_ENGINE, 0.82, 6.1],
    [NODE_IDS.PAYMENT_GATEWAY, 0.76, 5.4],
    [NODE_IDS.NOTIFICATION_WORKER, 0.61, 3.2],
    [NODE_IDS.KAFKA_BROKER, 0.45, 2.8],
    [NODE_IDS.INVENTORY_DB, 0.3, 1.5],
    [NODE_IDS.SEARCH_SERVICE, 0.25, 1.2],
    [NODE_IDS.CACHE_LAYER, 0.2, 1.1],
    [NODE_IDS.CONFIG_SERVICE, 0.1, 1.05],
  ];

  const scenarioIds = FAULT_SCENARIOS_AUTH.map((s) => s.id);
  return Object.fromEntries(
    data.map(([nodeId, failureProbability, estimatedLatencyMultiplier]) => [
      nodeId,
      { nodeId, failureProbability, estimatedLatencyMultiplier, affectedByScenarios: scenarioIds },
    ]),
  );
}

export const CHAOS_RESULT_DB: ChaosSimulationResult = {
  runId: '00000000-0000-4000-a000-000000000002',
  blastRadiusReport: BLAST_REPORT_DB_POOL,
  scenarios: FAULT_SCENARIOS_DB,
  nodeResults: buildDbChaosResults(),
  criticalFailureChain: [
    NODE_IDS.INVENTORY_DB,
    NODE_IDS.ORDER_SERVICE,
    NODE_IDS.BILLING_ENGINE,
    NODE_IDS.PAYMENT_GATEWAY,
  ],
  aggregateRiskScore: 76,
  simulatedAt: '2025-01-15T11:35:00.000Z',
};

function buildDbChaosResults(): Record<string, NodeSimResult> {
  const data: Array<[string, number, number]> = [
    [NODE_IDS.INVENTORY_DB, 0.98, 22.0],
    [NODE_IDS.ORDER_SERVICE, 0.91, 14.5],
    [NODE_IDS.SEARCH_SERVICE, 0.87, 11.0],
    [NODE_IDS.API_GATEWAY, 0.78, 8.2],
    [NODE_IDS.BILLING_ENGINE, 0.65, 5.5],
    [NODE_IDS.PAYMENT_GATEWAY, 0.58, 4.8],
    [NODE_IDS.KAFKA_BROKER, 0.38, 2.1],
    [NODE_IDS.NOTIFICATION_WORKER, 0.31, 1.8],
    [NODE_IDS.AUTH_SERVICE, 0.12, 1.1],
    [NODE_IDS.USER_SERVICE, 0.08, 1.05],
    [NODE_IDS.CACHE_LAYER, 0.22, 1.3],
    [NODE_IDS.CONFIG_SERVICE, 0.04, 1.02],
  ];

  const scenarioIds = FAULT_SCENARIOS_DB.map((s) => s.id);
  return Object.fromEntries(
    data.map(([nodeId, failureProbability, estimatedLatencyMultiplier]) => [
      nodeId,
      { nodeId, failureProbability, estimatedLatencyMultiplier, affectedByScenarios: scenarioIds },
    ]),
  );
}

// ---------------------------------------------------------------------------
// Convenience export: all fixtures indexed by scenario key
// ---------------------------------------------------------------------------

export const FIXTURE_SCENARIOS = {
  authSchemaBreaking: {
    label: 'Auth Token Schema Breaking Change',
    changeSet: CHANGESET_AUTH_SCHEMA,
    blastReport: BLAST_REPORT_AUTH_SCHEMA,
    chaosResult: CHAOS_RESULT_AUTH,
    faultScenarios: FAULT_SCENARIOS_AUTH,
  },
  dbPoolExhaustion: {
    label: 'DB Connection Pool Exhaustion',
    changeSet: CHANGESET_DB_POOL,
    blastReport: BLAST_REPORT_DB_POOL,
    chaosResult: CHAOS_RESULT_DB,
    faultScenarios: FAULT_SCENARIOS_DB,
  },
} as const;
