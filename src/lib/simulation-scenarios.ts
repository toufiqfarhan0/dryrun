import type { ProjectData } from '@/types'

export interface DemoScenario {
  id: string
  name: string
  subtitle: string
  tag: string
  badgeClass: string
  data: ProjectData
  stages: Array<{
    msg: string
    logs: Array<{ text: string; type: 'ok' | 'warn' | 'info' }>
  }>
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'fintech',
    name: 'PayStream Gateway',
    subtitle: 'High-throughput payment orchestration & ledger engine',
    tag: 'FinTech',
    badgeClass: 'critical',
    data: {
      projectName: 'paystream-gateway@v2.4.0-rc1',
      stack: ['Go', 'Kafka', 'Redis', 'PostgreSQL', 'Stripe SDK', 'Docker'],
      modules: [
        { name: 'API Gateway', risk: 'warn', files: 34, x: 20, y: 20 },
        { name: 'Auth & Vault Service', risk: 'danger', files: 16, x: 140, y: 20 },
        { name: 'Ledger Engine', risk: 'danger', files: 28, x: 20, y: 100 },
        { name: 'Webhook Event Relay', risk: 'warn', files: 19, x: 140, y: 100 },
        { name: 'Redis Idempotency Store', risk: 'danger', files: 7, x: 80, y: 60 },
        { name: 'Audit Vault & Cold Store', risk: 'ok', files: 11, x: 20, y: 185 },
      ],
      aiResult: {
        risk_score: 86,
        summary:
          'Missing distributed lock leases on idempotency keys combined with unhandled Kafka consumer group rebalances and absent upstream circuit breakers will trigger split-brain double-billing under burst volume. Estimated 18-minute window to total settlement halt.',
        issues: [
          {
            type: 'security',
            severity: 'critical',
            description:
              'Missing HMAC signature verification on incoming payment webhooks allows forged settlement events.',
            impact: 'Unauthorized funds disbursement and account manipulation via fabricated payloads.',
          },
          {
            type: 'performance',
            severity: 'critical',
            description:
              'Idempotency keys lack distributed lock leases in Redis. Concurrent retries bypass duplicate-check windows.',
            impact: 'Split-brain ledger state; double debit transactions during network blips.',
          },
          {
            type: 'architecture',
            severity: 'critical',
            description:
              'No circuit breaker between Transaction Engine and Stripe/ACH upstreams. Upstream latency locks worker goroutines.',
            impact: 'Thread and connection exhaustion halts all outbound settlements within minutes.',
          },
          {
            type: 'architecture',
            severity: 'high',
            description:
              'Unbounded Kafka consumer group rebalances during horizontal autoscaling stalls message ingestion for 120s+.',
            impact: 'Backlog of 75,000+ pending payouts during peak traffic spikes.',
          },
          {
            type: 'performance',
            severity: 'medium',
            description:
              'Ledger database isolation level configured as Read Committed instead of Serializable on high-concurrency balance updates.',
            impact: 'Race condition risks on simultaneous balance deductions.',
          },
          {
            type: 'architecture',
            severity: 'low',
            description:
              'Asynchronous webhook dispatchers lack trace correlation IDs.',
            impact: 'Post-incident reconciliation debugging delayed by 6–8 hours.',
          },
        ],
        simulation: [
          {
            time: 'T+0s',
            event: 'SYSTEM NOMINAL — Settlement pipeline active. 4,200 tx/sec throughput.',
            type: 'normal',
          },
          {
            time: 'T+6m',
            event: 'TRANSACTION SURGE — Flash payout event triggers 450% traffic spike.',
            type: 'normal',
          },
          {
            time: 'T+10m',
            event: 'IDEMPOTENCY LOCK SATURATION — Concurrent duplicate requests bypass lock window.',
            type: 'warn',
          },
          {
            time: 'T+13m',
            event: 'KAFKA CONSUMER LAG — Offset lag crosses 65,000 unread settlement messages.',
            type: 'warn',
          },
          {
            time: 'T+16m',
            event: 'UPSTREAM LATENCY — Partner API latency spikes to 14.8s. Goroutine pool saturated.',
            type: 'danger',
          },
          {
            time: 'T+18m',
            event: 'SPLIT-BRAIN CONFLICT — Duplicate ledger write detected: $34,200 in phantom debits.',
            type: 'danger',
          },
          {
            time: 'T+22m',
            event: 'LEDGER RECONCILIATION HALT — Automated deadlock halts all outbound disbursements.',
            type: 'danger',
          },
          {
            time: 'T+27m',
            event: 'TOTAL SETTLEMENT OUTAGE — Payout pipeline disabled. Gateway returning 503.',
            type: 'danger',
          },
        ],
      },
    },
    stages: [
      {
        msg: '📦 LOADING DEMO SYSTEM...',
        logs: [
          { text: 'Loading paystream-gateway@v2.4.0-rc1.zip', type: 'info' as const },
          { text: '115 files detected across 6 microservices', type: 'ok' as const },
          { text: 'Reading go.mod and Dockerfile configs', type: 'ok' as const },
        ],
      },
      {
        msg: '🔍 SCANNING REPO CODEBASE...',
        logs: [
          { text: 'Language: Go 1.22 + Kafka 3.6 detected', type: 'ok' as const },
          { text: 'Ledger Engine: PostgreSQL 16 + Redis 7', type: 'ok' as const },
          { text: 'Risky pattern: Missing distributed lock lease', type: 'warn' as const },
        ],
      },
      {
        msg: '🗺️ BUILDING SYSTEM MAP...',
        logs: [
          { text: 'Mapped 6 microservice topologies', type: 'ok' as const },
          { text: '34 API endpoints & 18 Kafka topics verified', type: 'ok' as const },
          { text: 'Stripe integration: No circuit breaker fallback', type: 'warn' as const },
        ],
      },
      {
        msg: '🤖 RUNNING AI SIMULATION...',
        logs: [
          { text: 'Evaluating settlement concurrency limits...', type: 'info' as const },
          { text: 'Simulating traffic burst & split-brain risk...', type: 'warn' as const },
          { text: 'Risk assessment & readiness report generated', type: 'ok' as const },
        ],
      },
      {
        msg: '🏙️ ANALYZING CODE INTO 3D CITY...',
        logs: [
          { text: 'Projecting microservice modules into 3D isometric districts...', type: 'info' as const },
          { text: 'Extruding skyscraper towers from Lines of Code (11,330 LOC)...', type: 'ok' as const },
          { text: 'Constructing 3D Codebase City & architectural fault lines...', type: 'ok' as const },
        ],
      },
    ],
  },
  {
    id: 'ecommerce',
    name: 'Cloud Commerce',
    subtitle: 'Next.js storefront, Node.js API & multi-region inventory',
    tag: 'E-Commerce',
    badgeClass: 'critical',
    data: {
      projectName: 'cloud-commerce-platform@v3.2.0',
      stack: ['Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe API', 'AWS S3'],
      modules: [
        { name: 'Frontend (Next.js)', risk: 'warn', files: 47, x: 20, y: 20 },
        { name: 'Auth Service', risk: 'danger', files: 12, x: 140, y: 20 },
        { name: 'Payment API', risk: 'danger', files: 8, x: 20, y: 100 },
        { name: 'Database Layer', risk: 'warn', files: 23, x: 140, y: 100 },
        { name: 'Cache (Redis)', risk: 'ok', files: 5, x: 80, y: 60 },
        { name: 'S3 Storage', risk: 'ok', files: 3, x: 20, y: 185 },
      ],
      aiResult: {
        risk_score: 78,
        summary:
          'Critical security vulnerabilities in auth layer combined with N+1 query patterns and missing circuit breakers will cause cascading failure under peak promotion load. Estimated 23-minute window to total outage.',
        issues: [
          {
            type: 'security',
            severity: 'critical',
            description:
              'JWT secret stored in .env without rotation strategy. Session tokens never invalidated on logout.',
            impact: 'Full account takeover possible; zero-day exploit window.',
          },
          {
            type: 'performance',
            severity: 'critical',
            description:
              'N+1 query pattern in product catalog. Each page load fires 47+ unindexed DB queries.',
            impact: 'Database will collapse at ~800 concurrent users.',
          },
          {
            type: 'architecture',
            severity: 'high',
            description:
              'No circuit breaker between Payment API and Stripe. Single point of failure with no retry strategy.',
            impact: 'Any Stripe degradation causes 100% checkout failure.',
          },
          {
            type: 'performance',
            severity: 'high',
            description:
              'Redis cache has no TTL strategy. Cache will grow unbounded and exhaust memory within 72 hours.',
            impact: '$2,400/mo in unexpected Redis scaling costs and memory eviction.',
          },
          {
            type: 'architecture',
            severity: 'medium',
            description:
              'No rate limiting on auth endpoints. Brute-force attacks fully unmitigated.',
            impact: 'Account enumeration and credential stuffing attack surface.',
          },
          {
            type: 'performance',
            severity: 'medium',
            description:
              'Static assets not CDN-distributed. All image requests hitting origin server.',
            impact: '3.2s average LCP on mobile. 40% bounce rate increase.',
          },
          {
            type: 'architecture',
            severity: 'low',
            description:
              'Logging lacks structured format. No correlation IDs between services.',
            impact: 'Incident response time increased by 4–6 hours.',
          },
        ],
        simulation: [
          {
            time: 'T+0s',
            event: 'SYSTEM NOMINAL — All services healthy. 200 concurrent users.',
            type: 'normal',
          },
          {
            time: 'T+12m',
            event: 'TRAFFIC SPIKE — Flash sale promotion triggers 3,400% user surge.',
            type: 'normal',
          },
          {
            time: 'T+14m',
            event: 'DB DEGRADATION — N+1 queries create query queue. P95 latency: 2.4s.',
            type: 'warn',
          },
          {
            time: 'T+17m',
            event: 'CACHE THRASH — Redis memory spikes. TTL-less keys filling capacity.',
            type: 'warn',
          },
          {
            time: 'T+19m',
            event: 'AUTH OVERLOAD — Login endpoint rate-limit absent. Bot traffic joins spike.',
            type: 'danger',
          },
          {
            time: 'T+21m',
            event: 'PAYMENT TIMEOUT — Stripe latency triggers 30s request loops.',
            type: 'danger',
          },
          {
            time: 'T+23m',
            event: 'CASCADE FAILURE — DB connections maxed. New requests rejected. Checkout: 0% success.',
            type: 'danger',
          },
          {
            time: 'T+25m',
            event: 'REDIS OOM — Cache server out of memory. Auth sessions lost.',
            type: 'danger',
          },
          {
            time: 'T+31m',
            event: 'TOTAL OUTAGE — Frontend returns 503. Revenue loss: $4,800/minute.',
            type: 'danger',
          },
        ],
      },
    },
    stages: [
      {
        msg: '📦 LOADING DEMO SYSTEM...',
        logs: [
          { text: 'Loading cloud-commerce-platform@v3.2.0.zip', type: 'info' as const },
          { text: '137 files detected', type: 'ok' as const },
          { text: 'Reading package.json and Prisma schema', type: 'ok' as const },
        ],
      },
      {
        msg: '🔍 SCANNING DEMO CODEBASE...',
        logs: [
          { text: 'Framework: Next.js 14 + Node.js 20 detected', type: 'ok' as const },
          { text: 'Database: PostgreSQL + Prisma ORM', type: 'ok' as const },
          { text: 'Risky pattern: N+1 queries in catalog', type: 'warn' as const },
        ],
      },
      {
        msg: '🗺️ BUILDING SYSTEM MAP...',
        logs: [
          { text: '47 frontend modules mapped', type: 'ok' as const },
          { text: '12 API endpoints detected', type: 'ok' as const },
          { text: 'Auth service: JWT, no token rotation', type: 'warn' as const },
        ],
      },
      {
        msg: '🤖 RUNNING AI SIMULATION...',
        logs: [
          { text: 'Simulating Black Friday concurrent load...', type: 'info' as const },
          { text: 'Analyzing database connection pool exhaustion...', type: 'warn' as const },
          { text: 'Readiness evaluation completed', type: 'ok' as const },
        ],
      },
      {
        msg: '🏙️ ANALYZING CODE INTO 3D CITY...',
        logs: [
          { text: 'Mapping storefront & API modules to 3D urban grid...', type: 'info' as const },
          { text: 'Extruding building heights from Lines of Code & dependencies...', type: 'ok' as const },
          { text: 'Constructing 3D Codebase City skyscraper mesh...', type: 'ok' as const },
        ],
      },
    ],
  },
  {
    id: 'zero-risk',
    name: 'Sentinel Gateway',
    subtitle: 'Automated canary gates, mTLS auth mesh & zero CVE vulnerabilities',
    tag: 'Deploy Ready',
    badgeClass: 'low',
    data: {
      projectName: 'sentinel-mesh-gateway@v3.0.0',
      stack: ['Go', 'Kubernetes', 'Envoy Proxy', 'Redis', 'PostgreSQL', 'Vault'],
      modules: [
        { name: 'Ingress Envoy Mesh', risk: 'ok', files: 32, x: 20, y: 20 },
        { name: 'mTLS Auth Vault', risk: 'ok', files: 18, x: 140, y: 20 },
        { name: 'Canary Routing Engine', risk: 'ok', files: 24, x: 20, y: 100 },
        { name: 'Circuit Breaker Layer', risk: 'ok', files: 15, x: 140, y: 100 },
        { name: 'Redis Cache Cluster', risk: 'ok', files: 9, x: 80, y: 60 },
        { name: 'Audit Vault Storage', risk: 'ok', files: 12, x: 20, y: 185 },
      ],
      aiResult: {
        risk_score: 0,
        summary:
          '100% deployment ready. Zero critical or moderate vulnerabilities identified. Multi-region automated failover, active circuit breakers, and canary progressive rollout validated. All deployment gates passed.',
        issues: [],
        simulation: [
          {
            time: 'T+0s',
            event: 'CANARY INITIATED — Progressive rollout starts at 5% traffic split.',
            type: 'normal',
          },
          {
            time: 'T+4m',
            event: 'HEALTH GATES NOMINAL — Error budget 100%, P99 latency: 14ms. Autoscaling ready.',
            type: 'normal',
          },
          {
            time: 'T+8m',
            event: 'STEP TRAFFIC UP — 25% traffic routed to v3.0.0. Zero error rate observed.',
            type: 'normal',
          },
          {
            time: 'T+12m',
            event: 'SYNTHETIC SUITE PASSED — 1,200 end-to-end integration tests validated.',
            type: 'normal',
          },
          {
            time: 'T+17m',
            event: 'STEP TRAFFIC UP — 75% traffic routed. Database connection pool healthy.',
            type: 'normal',
          },
          {
            time: 'T+22m',
            event: 'PEAK STRESS NOMINAL — Burst load test handled with zero dropped connections.',
            type: 'normal',
          },
          {
            time: 'T+26m',
            event: 'PROMOTION COMPLETE — 100% traffic shifted to v3.0.0. Previous revision cleanly drained.',
            type: 'normal',
          },
          {
            time: 'T+30m',
            event: 'PRODUCTION CERTIFIED — Release candidate stable in production. SLO: 99.99%.',
            type: 'normal',
          },
        ],
      },
    },
    stages: [
      {
        msg: '📦 LOADING DEMO SYSTEM...',
        logs: [
          { text: 'Loading sentinel-mesh-gateway@v3.0.0.zip', type: 'info' as const },
          { text: '110 files detected across 6 microservices', type: 'ok' as const },
          { text: 'Reading Kubernetes manifests and Helm charts', type: 'ok' as const },
        ],
      },
      {
        msg: '🔍 SCANNING REPO CODEBASE...',
        logs: [
          { text: 'Language: Go 1.22 + Envoy mesh detected', type: 'ok' as const },
          { text: 'Security audit: 0 CVEs detected in dependencies', type: 'ok' as const },
          { text: 'Circuit breakers and mTLS validated', type: 'ok' as const },
        ],
      },
      {
        msg: '🗺️ BUILDING SYSTEM MAP...',
        logs: [
          { text: '6 verified service meshes mapped', type: 'ok' as const },
          { text: 'Automated health endpoints responding < 5ms', type: 'ok' as const },
          { text: 'Canary progressive rollout rules active', type: 'ok' as const },
        ],
      },
      {
        msg: '🤖 RUNNING AI SIMULATION...',
        logs: [
          { text: 'Validating zero-risk canary deployment profile...', type: 'info' as const },
          { text: 'Simulating stress burst & automated failover...', type: 'ok' as const },
          { text: 'Readiness check: 100% DEPLOYMENT READY', type: 'ok' as const },
        ],
      },
      {
        msg: '🏙️ ANALYZING CODE INTO 3D CITY...',
        logs: [
          { text: 'Projecting verified service mesh into pristine 3D urban districts...', type: 'info' as const },
          { text: 'Extruding 39 skyscraper towers with architectural hatching...', type: 'ok' as const },
          { text: 'Constructing 3D Codebase City visualization...', type: 'ok' as const },
        ],
      },
    ],
  },
]

/** Default demo data for backward compatibility */
export const DEMO_DATA: ProjectData = DEMO_SCENARIOS[0].data

/** Default demo processing stages */
export const PROCESSING_STAGES_DEMO = DEMO_SCENARIOS[0].stages

export const PROCESSING_STAGES_UPLOAD = [
  {
    msg: '📦 EXTRACTING ARCHIVE...',
    logs: [
      { text: 'Decompressing archive...', type: 'info' as const },
      { text: 'Reading file tree...', type: 'ok' as const },
    ],
  },
  {
    msg: '🔍 SCANNING CODEBASE...',
    logs: [
      { text: 'Scanning file types...', type: 'info' as const },
      { text: 'Detecting framework...', type: 'info' as const },
      { text: 'Parsing package.json / requirements.txt...', type: 'ok' as const },
    ],
  },
  {
    msg: '🗺️ BUILDING SYSTEM MAP...',
    logs: [
      { text: 'Mapping module dependencies...', type: 'info' as const },
      { text: 'Detecting API routes...', type: 'ok' as const },
      { text: 'Analyzing DB patterns...', type: 'warn' as const },
    ],
  },
  {
    msg: '🤖 AI SIMULATION ENGINE...',
    logs: [
      { text: 'Preparing architecture summary...', type: 'info' as const },
      { text: 'Sending to IBM WatsonX AI...', type: 'info' as const },
      { text: 'Awaiting risk report...', type: 'warn' as const },
    ],
  },
  {
    msg: '🏙️ ANALYZING CODE INTO 3D CITY...',
    logs: [
      { text: 'Projecting parsed codebase into 3D isometric districts...', type: 'info' as const },
      { text: 'Constructing building skyscrapers from file sizes & LOC...', type: 'ok' as const },
      { text: 'Generating interactive 3D Codebase City...', type: 'ok' as const },
    ],
  },
]
