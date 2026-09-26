# DryRun — System Architecture

> Version 1.0 · IBM Bob 2.0 Hackathon  
> Category: Release Readiness and Deployment Processes

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Component Hierarchy](#2-component-hierarchy)
3. [Data Contracts](#3-data-contracts)
4. [Simulation Pipeline](#4-simulation-pipeline)
5. [API Surface](#5-api-surface)
6. [watsonx Integration](#6-watsonx-integration)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Infrastructure & Deployment](#8-infrastructure--deployment)
9. [Error Handling & Observability](#9-error-handling--observability)
10. [Security Boundaries](#10-security-boundaries)

---

## 1. System Overview

DryRun is a Next.js 15 (App Router) full-stack application with a unified server-side analysis pipeline and a rich interactive client. It operates on a target codebase supplied by the user (via public GitHub URL, uploaded `.zip` archive, or pre-configured scenarios) and simulates release failure modes before code touches production.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Client                        │
│     SystemMap (ReactFlow) · Timeline · RiskReport (Gates)   │
└────────────────────────┬────────────────────────────────────┘
                         │  HTTP POST / JSON
┌────────────────────────▼────────────────────────────────────┐
│              Next.js 15 App Router (/api/analyze)           │
│        Multipart ZIP Extractor · GitHub Tarball Streamer    │
└──────┬──────────────────────────────────────────────┬───────┘
       │                                              │
  ┌────▼───────────────────────┐            ┌─────────▼──────────────┐
  │  watsonx.ai Granite 3.3 8B │            │  Deterministic Static  │
  │    (Live AI Synthesis)     │            │    Analysis Engine     │
  └────┬───────────────────────┘            └─────────┬──────────────┘
       │                                              │
       └───────────────────────┬──────────────────────┘
                               │  Normalized AIResult Payload
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Command Center Dashboard State               │
│    Microservice Topology · Cascade Timeline · Risk Dossier  │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 15 + React 19 App Router | Modern streaming capabilities, server routes, zero legacy baggage |
| Topology Graph | `@xyflow/react` v12 with custom nodes | Smooth hardware-accelerated interactive service topology |
| Dual-Engine Execution | watsonx.ai Granite 3.3 + Deterministic Fallback | Live AI synthesis when configured; zero-fail offline guarantee |
| Design System | Neo-brutalist GitDiagram-inspired UI | High-contrast readability, 2px borders, dark & light mode |
| Package Manager | Standard `npm` | Broad compatibility, predictable lockfile resolution |

---

## 2. Component Hierarchy

### Server-side (`src/lib/`)

```
src/lib/
├── ingester/
│   ├── index.ts                 ← public API: ingestRepository(config) → DependencyGraph
│   ├── file-walker.ts           ← recursive file tree traversal
│   ├── ast-parser.ts            ← TypeScript / Babel AST visitor
│   ├── import-resolver.ts       ← resolves relative/aliased imports to canonical paths
│   └── service-boundary.ts      ← heuristic detection of service entry points
│
├── blast-radius/
│   ├── index.ts                 ← public API: evaluateBlastRadius(graph, changeSet) → BlastRadiusReport
│   ├── reachability.ts          ← BFS/DFS reachability from changed nodes
│   ├── impact-scorer.ts         ← weighted scoring: depth, fan-in, criticality flags
│   └── critical-path.ts         ← identifies paths to service boundaries / high-fanin nodes
│
├── chaos/
│   ├── index.ts                 ← public API: runSimulation(report, scenarios) → ChaosSimulationResult
│   ├── fault-propagator.ts      ← propagates failure probability through edges
│   ├── decay-functions.ts       ← exponential / linear / step decay models
│   └── scenario-presets.ts      ← built-in fault scenario definitions
│
└── watsonx/
    ├── index.ts                 ← public API: synthesizeGate(result, report, prMeta) → AsyncIterable<string>
    ├── prompt-builder.ts        ← constructs structured prompt from simulation data
    └── response-parser.ts       ← extracts severity + gate decision from streamed text
```

### Client-side (`src/components/`)

```
src/components/
└── visualizer/
    ├── GraphCanvas.tsx          ← force-directed D3 / Canvas graph render
    ├── NodeCard.tsx             ← node tooltip / hover detail
    ├── NodeDetailPanel.tsx      ← slide-in drawer with full node metadata
    ├── EdgeLayer.tsx            ← SVG overlay for animated fault propagation
    ├── ControlPanel.tsx         ← scenario selector, run button, filters
    ├── ScenarioTimeline.tsx     ← scrubber for simulation playback
    ├── GateReport.tsx           ← watsonx narrative + APPROVED/BLOCKED badge
    ├── ImpactLegend.tsx         ← colour-coded severity legend
    └── context/
        ├── SimulationContext.tsx ← React context + useReducer for global graph state
        └── simulation-reducer.ts ← pure reducer: actions for graph load, sim run, gate result
```

### App Router (`src/app/`)

```
src/app/
├── layout.tsx                   ← root layout: dark theme, fonts
├── page.tsx                     ← landing / repository input form
├── analyze/
│   └── page.tsx                 ← main workspace: graph + control panel
└── api/
    ├── analyze/
    │   └── route.ts             ← POST: ingest repo → return DependencyGraph
    ├── simulate/
    │   └── route.ts             ← POST: run chaos simulation → return ChaosSimulationResult
    └── gate/
        └── route.ts             ← POST: call watsonx → SSE stream ReleaseGateDecision
```

---

## 3. Data Contracts

All types live in `src/types/`. Every external payload is additionally validated by a matching Zod schema.

### 3.1 Graph Primitives

```typescript
/** Canonical identifier for a node — normalised file path relative to repo root */
type NodeId = string;

interface GraphNode {
  id: NodeId;
  label: string;                // display name (module name or service label)
  filePath: string;             // relative path in the repository
  nodeType: NodeType;
  exports: string[];            // exported symbol names
  isEntryPoint: boolean;        // true for service boundaries, CLI entry points
  loc: number;                  // lines of code (heuristic weight)
  metadata: Record<string, unknown>;
}

type NodeType =
  | "MODULE"          // ordinary TypeScript/JavaScript module
  | "SERVICE"         // detected service boundary (e.g. Express app, Next.js route)
  | "EXTERNAL"        // third-party package node
  | "CONFIG"          // environment config / secrets file
  | "TEST";           // test file (excluded from blast radius by default)

interface GraphEdge {
  source: NodeId;
  target: NodeId;
  edgeType: EdgeType;
  weight: number;               // call frequency heuristic (1 = static import, >1 = runtime call)
}

type EdgeType =
  | "STATIC_IMPORT"
  | "DYNAMIC_IMPORT"
  | "HTTP_CALL"
  | "RE_EXPORT"
  | "ENV_READ";

interface DependencyGraph {
  id: string;                   // uuid — ties graph to an analysis run
  repoUrl?: string;
  analyzedAt: string;           // ISO 8601
  nodes: Record<NodeId, GraphNode>;
  edges: GraphEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    maxDepth: number;
    serviceCount: number;
  };
}
```

### 3.2 Change Set

```typescript
interface ChangeSet {
  runId: string;                // links to DependencyGraph.id
  changedFiles: string[];       // relative file paths modified in the PR
  addedFiles: string[];
  deletedFiles: string[];
  prMetadata?: PullRequestMetadata;
}

interface PullRequestMetadata {
  title: string;
  description: string;
  author: string;
  targetBranch: string;
  url?: string;
}
```

### 3.3 Blast-Radius Report

```typescript
interface NodeImpact {
  nodeId: NodeId;
  impactScore: number;          // 0–100
  blastDepth: number;           // hops from nearest changed node
  dependentCount: number;       // nodes that transitively depend on this node
  onCriticalPath: boolean;
  reachableFromChanged: boolean;
}

interface BlastRadiusReport {
  runId: string;
  graph: DependencyGraph;
  changeSet: ChangeSet;
  impacts: Record<NodeId, NodeImpact>;
  criticalPaths: NodeId[][];    // ordered paths from changed nodes to service boundaries
  topRiskyNodes: NodeId[];      // top-10 by impactScore
  overallBlastScore: number;    // 0–100, aggregate
  computedAt: string;
}
```

### 3.4 Fault Scenarios & Chaos Simulation

```typescript
type FaultType =
  | "SERVICE_OUTAGE"
  | "LATENCY_P99_SPIKE"
  | "ERROR_RATE_BREACH"
  | "NETWORK_PARTITION"
  | "DEPENDENCY_REMOVED";

interface FaultScenario {
  id: string;
  name: string;
  description: string;
  faultType: FaultType;
  targetNodeId: NodeId;         // fault origin
  params: {
    severity: number;           // 0–1: fraction of capacity lost
    spreadDecayModel: "EXPONENTIAL" | "LINEAR" | "STEP";
    decayFactor: number;        // per-hop decay (e.g. 0.7 = 70 % transmission)
  };
}

interface NodeSimResult {
  nodeId: NodeId;
  failureProbability: number;   // 0–1
  estimatedLatencyMultiplier: number;
  affectedByScenarios: string[];// scenario ids
}

interface ChaosSimulationResult {
  runId: string;
  blastRadiusReport: BlastRadiusReport;
  scenarios: FaultScenario[];
  nodeResults: Record<NodeId, NodeSimResult>;
  criticalFailureChain: NodeId[];  // highest-probability path to a service boundary
  aggregateRiskScore: number;   // 0–100
  simulatedAt: string;
}
```

### 3.5 Release Gate Decision

```typescript
type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type GateDecision = "APPROVED" | "BLOCKED";

interface Mitigation {
  nodeId: NodeId;
  description: string;
  priority: SeverityLevel;
}

interface ReleaseGateDecision {
  runId: string;
  severity: SeverityLevel;
  decision: GateDecision;
  narrative: string;            // full watsonx-generated markdown report
  mitigations: Mitigation[];
  confidenceScore: number;      // 0–1, from watsonx token logprobs if available
  generatedAt: string;
}
```

---

## 4. Simulation Pipeline

### Stage 1 — AST Ingestion

```
Input:  repository source files
Output: DependencyGraph

1. FileWalker recursively lists all .ts, .tsx, .js, .jsx files.
2. AstParser visits each file:
   a. Collect ImportDeclaration → STATIC_IMPORT edges
   b. Collect import() calls → DYNAMIC_IMPORT edges
   c. Collect fetch/axios/got call sites → HTTP_CALL edges
   d. Collect process.env reads → ENV_READ edges
3. ImportResolver normalises relative/tsconfig-alias paths to canonical NodeIds.
4. ServiceBoundaryDetector flags nodes matching: Next.js route.ts, Express listen(),
   top-level server files with no in-repo importers.
5. Stats computed; DependencyGraph emitted.
```

### Stage 2 — Blast-Radius Evaluation

```
Input:  DependencyGraph + ChangeSet
Output: BlastRadiusReport

1. Build reverse-adjacency map (target → sources).
2. For each changedFile, locate corresponding NodeId.
3. Forward BFS from each changed node → collect reachableFromChanged set.
4. Reverse BFS from each changed node → collect dependentCount per node.
5. ImpactScorer computes:
   impactScore = normalise(
     w_depth    × (1 / blastDepth)  +
     w_fanin    × dependentCount    +
     w_critical × isEntryPoint      +
     w_loc      × loc
   )
   where weights sum to 1 and are configurable via env vars.
6. CriticalPathFinder: DFS from changed nodes through high-impactScore nodes
   to service boundaries → emit criticalPaths.
7. overallBlastScore = mean(top-10 impactScores).
```

### Stage 3 — Chaos Fault Injection

```
Input:  BlastRadiusReport + FaultScenario[]
Output: ChaosSimulationResult

For each FaultScenario:
  1. Initialise failureProbability[targetNodeId] = scenario.params.severity.
  2. BFS from targetNodeId along forward edges:
       fp[child] = fp[parent] × decayFn(edge.weight, scenario.params.decayFactor)
     decayFn variants:
       EXPONENTIAL: fp × decayFactor^depth
       LINEAR:      fp - (decayFactor × depth)
       STEP:        fp if depth ≤ 3 else 0
  3. Merge per-scenario results: fp[node] = max(fp[node], newFp).
  4. latencyMultiplier derived from failure probability using a sigmoid curve.

aggregateRiskScore = weightedMean(
  nodeResults where node.onCriticalPath,
  weight = node.impactScore
)
```

### Stage 4 — watsonx Granite Synthesis

```
Input:  ChaosSimulationResult + BlastRadiusReport + PullRequestMetadata
Output: AsyncIterable<string> → ReleaseGateDecision

1. PromptBuilder constructs a structured prompt:
   SYSTEM: "You are a senior SRE. Analyse this pre-deployment risk report..."
   USER:   JSON summary of top-10 risky nodes, critical failure chain,
           aggregateRiskScore, PR title + description.

2. Call watsonx Granite via @ibm-cloud/watsonx-ai SDK with stream: true.

3. Stream tokens to client via Server-Sent Events.

4. ResponseParser extracts:
   - Severity tag: [[SEVERITY: HIGH]]
   - Gate decision: [[GATE: BLOCKED]]
   - Mitigation list: structured JSON block in model output.

5. Assemble ReleaseGateDecision; emit as final SSE event.
```

---

## 5. API Surface

### `POST /api/analyze`

**Request:**
```json
{
  "repoUrl": "https://github.com/org/repo",
  "changedFiles": ["src/services/payment.ts", "src/lib/db.ts"],
  "prMetadata": { "title": "Add retry logic", "author": "dev@example.com" }
}
```

**Response:** `DependencyGraph` (JSON, ~200–500 ms)

---

### `POST /api/simulate`

**Request:**
```json
{
  "graph": "<DependencyGraph>",
  "changeSet": "<ChangeSet>",
  "scenarios": ["SERVICE_OUTAGE", "LATENCY_P99_SPIKE"]
}
```

**Response:** `ChaosSimulationResult` (JSON, ~50–100 ms)

---

### `POST /api/gate`

**Request:**
```json
{
  "simulationResult": "<ChaosSimulationResult>",
  "blastRadiusReport": "<BlastRadiusReport>"
}
```

**Response:** `text/event-stream` — chunked watsonx tokens, final event contains full `ReleaseGateDecision` JSON.

---

## 6. watsonx Integration

### Model Selection

| Use case | Model | Reason |
|----------|-------|--------|
| Risk narrative + gate decision | `ibm/granite-13b-instruct-v2` | Best reasoning on structured JSON inputs |
| Short severity classification (fallback) | `ibm/granite-3-8b-instruct` | Lower latency when full context unnecessary |

### Prompt Structure

```
[SYSTEM]
You are a senior Site Reliability Engineer performing a pre-deployment risk assessment.
You will receive a structured JSON payload describing a dependency graph analysis and
chaos fault simulation. Your task is to:
1. Write a clear, actionable risk narrative in markdown (max 400 words).
2. Classify overall severity as one of: LOW, MEDIUM, HIGH, CRITICAL.
3. Provide up to 5 specific mitigations ordered by priority.
4. Emit a final gate decision: APPROVED or BLOCKED.

Format your response exactly as:
## Risk Narrative
<markdown text>

[[SEVERITY: <level>]]
[[GATE: <decision>]]

## Mitigations
<JSON array of {nodeId, description, priority}>

[USER]
<ChaosSimulationResult summary JSON>
```

### Streaming Pattern

The `/api/gate` route handler opens an SSE stream:
```
data: {"type":"token","value":"The payment service..."}
data: {"type":"token","value":" has a critical..."}
...
data: {"type":"complete","decision":{...ReleaseGateDecision...}}
```

---

## 7. Frontend Architecture

### State Machine (SimulationContext)

```
IDLE
  → ANALYZING   (user submits repo)
  → SIMULATING  (blast-radius + chaos running)
  → STREAMING   (watsonx gate streaming)
  → COMPLETE    (gate decision received)
  → ERROR       (any stage failure)
```

### GraphCanvas Rendering

- **Library:** D3.js force simulation for layout; `<canvas>` for node/edge drawing (performance at 500+ nodes).
- **Node colour mapping:**
  ```
  impactScore 0–20   → emerald-500
  impactScore 21–40  → sky-400
  impactScore 41–60  → yellow-400
  impactScore 61–80  → orange-500
  impactScore 81–100 → red-500
  ```
- **Edge animation:** during simulation playback, edges flash along the failure propagation path using `requestAnimationFrame`.
- **Interaction:** click node → open `NodeDetailPanel`; hover edge → show weight tooltip.

### Fault Propagation Playback

The `ScenarioTimeline` component drives a frame-by-frame replay:
- Each BFS level = one animation frame (configurable speed).
- `NodeSimResult.failureProbability` drives opacity of a pulsing red halo.
- Critical path edges rendered thicker and animated with dashed offset.

---

## 8. Infrastructure & Deployment

### Development

```bash
pnpm dev          # Next.js dev server on :3000
pnpm test         # Vitest unit suite
pnpm typecheck    # tsc --noEmit
pnpm lint         # ESLint
```

### Environment Variables

```
WATSONX_API_KEY=          # IBM Cloud API key
WATSONX_PROJECT_ID=       # watsonx.ai project GUID
WATSONX_REGION=us-south   # watsonx.ai region
BLAST_WEIGHT_DEPTH=0.3    # impact scorer tuning
BLAST_WEIGHT_FANIN=0.4
BLAST_WEIGHT_CRITICAL=0.2
BLAST_WEIGHT_LOC=0.1
```

### Deployment Target

- **Vercel** (primary): zero-config Next.js deployment.
- Route handlers run as Vercel Functions (Node.js runtime).
- Static assets CDN-cached; graph canvas is fully client-rendered.

---

## 9. Error Handling & Observability

- All API route handlers wrap logic in `try/catch`; errors return typed `{ error: string; code: ErrorCode }` JSON with appropriate HTTP status.
- Client displays inline error states per pipeline stage — never a blank screen.
- watsonx streaming errors: SSE `data: {"type":"error","message":"..."}` event; client transitions to ERROR state with retry option.
- `ErrorCode` enum: `PARSE_FAILED | GRAPH_EMPTY | SIMULATION_FAILED | WATSONX_UNAVAILABLE | RATE_LIMITED`.

---

## 10. Security Boundaries

| Concern | Mitigation |
|---------|------------|
| Arbitrary code execution | AST parsing is read-only; no `eval`, no subprocess spawn on user code |
| Secret leakage | `WATSONX_API_KEY` server-only (never in `NEXT_PUBLIC_*`) |
| Repo access | GitHub URLs fetched server-side only; no token stored client-side |
| Prompt injection | Simulation JSON is JSON-serialised and inserted as a data block, never interpolated as instructions |
| Large payload DoS | Max repo size: 50 MB; max nodes per graph: 2 000; enforced in ingester |
