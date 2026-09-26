# DryRun — Agent Manifest

> **IBM Bob 2.0 Hackathon** · Category: Release Readiness and Deployment Processes
> Theme: Build with purpose using IBM Bob 2.0

---

## Project Vision

**DryRun** is a pre-deployment blast-radius and chaos simulator.  
Before any line of code ships to production, DryRun answers the one question every on-call engineer dreads: _"If this service fails, what breaks with it?"_

---

## The Core Problem

Modern release pipelines are fast. Risk awareness is not.

Teams merge and deploy without a clear picture of:
- Which upstream/downstream services depend on the changed module
- What cascading failures a single bad deployment can trigger
- How fault conditions (latency spikes, error floods, network partitions) propagate through the dependency graph
- Whether the blast radius is acceptable _before_ the incident happens

Post-mortems are written after the fact. DryRun moves that analysis to _before_ the fact.

---

## The Solution

A three-stage pipeline executed on every PR or on-demand:

```
[Codebase] ──► AST Dependency Analysis ──► Blast-Radius Graph
                                                    │
                                          Chaos Fault Injection
                                                    │
                                     watsonx Granite Risk Synthesis
                                                    │
                                        Release Gate Decision
```

1. **Static AST Dependency Analysis** — parse the repository's import graph, API call sites, and service boundaries without running any code.
2. **Chaos Fault Injection** — simulate fault scenarios (service outage, timeout, error budget breach) across the dependency graph and propagate impact scores.
3. **watsonx Granite Risk Synthesis** — feed the annotated impact graph to IBM watsonx Granite to produce a human-readable risk report, severity rating, and a go/no-go release recommendation.

---

## Agent Roles

### 1 · Architecture & Contract Specifier
**Responsibility:** Owns the canonical data contracts shared across all agents. Defines TypeScript interfaces for every inter-agent payload, the graph node/edge schema, the fault scenario envelope, and the release-gate output shape.  
**Produces:** `src/types/` — all shared interfaces, Zod schemas for runtime validation.  
**Consumes:** nothing (source of truth).

---

### 2 · AST Dependency Ingester
**Responsibility:** Walks the target repository's source tree using an AST parser (TypeScript Compiler API / `@babel/parser`). Extracts module imports, re-exports, dynamic `require()` calls, HTTP client call sites, and environment variable reads. Emits a normalized `DependencyGraph` payload.  
**Produces:** `DependencyGraph` — nodes (modules/services), directed edges (import/call relationships), metadata (file path, export names, call frequency heuristic).  
**Consumes:** raw repository file tree.

---

### 3 · Blast-Radius Risk Evaluator
**Responsibility:** Accepts the `DependencyGraph` and a `ChangeSet` (list of modified files/modules). Computes reachability from each changed node, assigns raw blast-radius scores using weighted BFS/DFS, and annotates nodes with `impactScore`, `criticalPath: boolean`, and `dependentCount`.  
**Produces:** `BlastRadiusReport` — annotated graph with impact scores, critical paths highlighted, top-N highest-risk dependents ranked.  
**Consumes:** `DependencyGraph` + `ChangeSet`.

---

### 4 · Chaos Fault Injection Engine
**Responsibility:** Takes the `BlastRadiusReport` and runs configurable fault scenarios against the graph. Supported fault types: `SERVICE_OUTAGE`, `LATENCY_P99_SPIKE`, `ERROR_RATE_BREACH`, `NETWORK_PARTITION`, `DEPENDENCY_REMOVED`. Each scenario propagates failure probability through edges using configurable decay functions and produces per-node failure likelihood.  
**Produces:** `ChaosSimulationResult` — per-scenario, per-node failure probability, affected critical paths, estimated MTTR delta.  
**Consumes:** `BlastRadiusReport` + `FaultScenarioConfig[]`.

---

### 5 · Interactive System Visualizer
**Responsibility:** Renders the live dependency graph as a force-directed interactive canvas. Nodes are colour-coded by impact score (green → yellow → orange → red). Edges animate fault propagation during simulation playback. Exposes drill-down panels per node and a timeline scrubber for scenario replay.  
**Produces:** React component tree under `src/components/visualizer/` — graph canvas, control panel, node detail panel, scenario timeline.  
**Consumes:** `BlastRadiusReport` + `ChaosSimulationResult` (streamed updates via React context).

---

### 6 · watsonx Release Gate Synthesizer
**Responsibility:** Calls IBM watsonx Granite via the `@ibm-cloud/watsonx-ai` SDK. Constructs a structured prompt from the `ChaosSimulationResult`, the `BlastRadiusReport` summary, and the PR metadata. Streams back a risk narrative, a severity classification (`LOW | MEDIUM | HIGH | CRITICAL`), actionable mitigations, and a binary `APPROVED | BLOCKED` release gate decision.  
**Produces:** `ReleaseGateDecision` — structured JSON + streamed markdown narrative.  
**Consumes:** `ChaosSimulationResult` + `BlastRadiusReport` + PR metadata.

---

## Data Flow Summary

```
ChangeSet (PR diff / manual input)
        │
        ▼
[Agent 2] AST Dependency Ingester
        │  DependencyGraph
        ▼
[Agent 3] Blast-Radius Risk Evaluator
        │  BlastRadiusReport
        ├──────────────────────────────────► [Agent 5] Visualizer (live)
        ▼
[Agent 4] Chaos Fault Injection Engine
        │  ChaosSimulationResult
        ├──────────────────────────────────► [Agent 5] Visualizer (scenario overlay)
        ▼
[Agent 6] watsonx Release Gate Synthesizer
        │  ReleaseGateDecision
        ▼
    Release Gate UI (APPROVED / BLOCKED)
```

---

## Repository Layout (target)

```
dryrun/
├── AGENTS.md                  ← this file
├── .bobrules                  ← Bob coding standards
├── docs/
│   └── architecture.md        ← full system architecture
├── src/
│   ├── types/                 ← Agent 1: shared contracts
│   ├── lib/
│   │   ├── ingester/          ← Agent 2: AST analysis
│   │   ├── blast-radius/      ← Agent 3: risk evaluation
│   │   └── chaos/             ← Agent 4: fault injection
│   ├── components/
│   │   └── visualizer/        ← Agent 5: graph UI
│   └── app/
│       └── api/               ← Next.js route handlers
└── docs/
```
