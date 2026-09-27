<!-- IBM Bob 2.0 Hackathon -->

# DryRun — Agent Manifest & Architecture Specification

> **IBM Bob 2.0 Hackathon** · Track: Release Readiness and Deployment Assistant  
> **Theme:** Build with purpose using IBM Bob 2.0  
> **Evidence Dossier:** [`bob_sessions/`](./bob_sessions/) (24 autonomous agent sessions with prompts, task logs, summaries, and consumption screenshots)  
> **Live Demo:** [https://dryrun-ten.vercel.app/](https://dryrun-ten.vercel.app/) • **Simulator:** [https://dryrun-ten.vercel.app/simulator](https://dryrun-ten.vercel.app/simulator)

---

## 🎯 Project Vision

**DryRun** is a pre-flight blast-radius and chaos simulation engine for software releases.  
Before any line of code ships to production, DryRun answers the one question every on-call engineer dreads:  
**_"If this service fails, what breaks with it?"_**

---

## ⚡ The Core Problem

Modern release pipelines are fast, but risk awareness is not. Engineering teams merge pull requests without clear visibility into:
1. **Hidden Dependency Coupling:** Which upstream and downstream microservices depend on changed modules.
2. **Cascading Failure Propagation:** How latency spikes, connection pool exhaustion, or circuit-breaker trips cascade through the topology.
3. **Single Points of Failure (SPOF):** Undetected bottleneck modules whose failure takes down the entire system.
4. **Regulatory Non-Compliance:** Lack of automated blast-radius auditing required by regulations like the **EU Digital Operational Resilience Act (DORA)**.

Post-mortems are written after outages occur. **DryRun moves the post-mortem to before the deployment.**

---

## 🏗️ The 4-Stage Pre-Flight Pipeline

```
[Repository Archive / Git Diff]
            │
            ▼
┌───────────────────────────────────────────────┐
│ 1. AST Deconstruction & Ingestion             │
│    • Zero-disk in-memory ZIP buffer stream    │
│    • Module boundaries, imports & call sites  │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│ 2. Dual-Engine Blast Radius Synthesis         │
│    • Primary: IBM watsonx.ai Granite 3.3 8B   │
│    • Fallback: Deterministic static analyzer  │
│    • SPOF detection & vulnerability scoring   │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│ 3. 3D Spatial & Topological Visualization     │
│    • Isometric 3D Codebase City (LOC/Fan-In)  │
│    • 2D Force-Directed ReactFlow Graph        │
│    • Chronological Chaos Playback (T+0s→T+18m)│
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│ 4. Pre-Flight Release Gate Decision           │
│    • Binary Gate: PASSED (CLEARED) vs BLOCKED │
│    • Multi-format Release Flight Manifest     │
│    • Markdown & Audit PDF export              │
└───────────────────────────────────────────────┘
```

---

## 🤖 IBM Bob 2.0 Agent Roles & Subagents

DryRun was architected and built using IBM Bob 2.0's **Agent Mode**, leveraging specialized subagents with isolated context boundaries:

### 1 · Architecture & Contract Specifier
- **Responsibility:** Owns the canonical data contracts shared across all system components. Defines TypeScript interfaces and Zod validation schemas for AST payloads, graph node/edge schemas, fault scenario events, and release-gate output shapes.
- **Produces:** `src/types/index.ts` — shared type definitions and runtime validators.
- **Rules & Guardrails:** `.bobrules`, `.bob/rules/coding-standards.md`.

### 2 · AST Dependency Ingester
- **Responsibility:** Ingests repository archives (`.zip`) in memory with `adm-zip`. Extracts module imports, dynamic calls, HTTP client call sites, route definitions, and security patterns (credentials, SQL injection, dynamic `eval()`).
- **Produces:** `src/lib/codebase-analyzer.ts` — in-memory AST discovery and system snapshot builder.
- **Scope Control:** Enforced via `.bobignore`.

### 3 · Blast-Radius Risk Evaluator
- **Responsibility:** Computes reachability and dependency fan-in across the directed graph. Calculates weighted risk scores using:
  $$\text{Risk Score} = 0.35 \times \text{Depth} + 0.30 \times \text{FanIn} + 0.20 \times \text{Vulnerabilities} + 0.15 \times \text{Complexity}$$
- **Produces:** Single Points of Failure (SPOF) classification, critical-path tagging, and quantitative risk metrics.
- **Rules & Guardrails:** `.bob/rules/release-gating.md`.

### 4 · Chaos Fault Injection Engine
- **Responsibility:** Runs chronological failure scenarios (`SERVICE_OUTAGE`, `DATABASE_EXHAUSTION`, `RATE_LIMIT_SPIKE`, `NETWORK_PARTITION`). Propagates failure states along dependency edges across timeline intervals (`T+0s` → `T+18m`).
- **Produces:** `src/lib/simulation-scenarios.ts`, `src/lib/simulation-helpers.ts` — deterministic event sequences with failure telemetry.
- **Skill:** `.bob/skills/preflight-audit/SKILL.md`.

### 5 · 3D Spatial Engine & System Visualizer
- **Responsibility:** Renders the codebase in both 2D and 3D:
  - **3D Codebase City:** Procedurally extruded isometric skyline where building heights represent LOC or fan-in, with real-time structural decay, fire particles, and blackout effects during simulated failures.
  - **2D ReactFlow System Topology:** Interactive microservice graph highlighting blast radius nodes.
  - **Timeline Scrubber:** Interactive player controlling simulation step, speed, and real-time failure progression.
- **Produces:** `src/components/CodebaseCity.tsx`, `src/lib/city-data.ts`, `src/components/ArchitectureMap.tsx`, `src/components/SimulationTimeline.tsx`.

### 6 · watsonx.ai Release Gate Synthesizer
- **Responsibility:** Synthesizes release risk narratives and actionable mitigations via **IBM watsonx.ai Granite 3.3 8B** (`ibm/granite-3-8b-instruct`) using IAM authentication. Employs automated zero-credential fallback to the deterministic offline engine.
- **Produces:** `src/app/api/analyze/route.ts`, `src/components/ReleaseReadinessReport.tsx`.
- **Mode:** `.bob/modes/release-gatekeeper.json`.

---

## 📁 Repository Structure

```
dryrun/
├── .bob/                               # IBM Bob 2.0 Configuration
│   ├── mcp_config.json                 # Model Context Protocol server configuration
│   ├── modes/                          # Custom personas (Release Gatekeeper)
│   ├── rules/                          # Modular custom rules & constraints
│   │   ├── architecture-constraints.md # App Router & in-memory zero-disk rules
│   │   ├── coding-standards.md         # Strict TypeScript 5 & light mode standards
│   │   └── release-gating.md           # DORA compliance & risk formula policies
│   └── skills/                         # Reusable specialized workflows
│       └── preflight-audit/SKILL.md    # Pre-flight release audit instructions
├── .bobrules                           # Project-wide Bob coding standards
├── .bobignore                          # Files ignored by Bob IDE agents
├── AGENTS.md                           # Agent manifest & architecture spec (this file)
├── BUILDING_WITH_BOB.md                # 24-session development journey & metrics
├── bob_sessions/                       # Mandatory hackathon submission evidence
│   ├── README.md                       # Comprehensive 24-session catalog & index
│   ├── 01-spec-and-architecture/       # Prompts, logs, summaries, screenshots
│   ├── ...                             # Sessions 02 through 23
│   └── 24-default-light-mode-.../      # 3D City & light mode session
├── docs/
│   └── architecture.md                 # Technical architecture whitepaper
├── src/
│   ├── app/
│   │   ├── api/analyze/route.ts        # watsonx Granite 3.3 & static analysis API
│   │   ├── globals.css                 # Neo-brutalist light mode design system
│   │   ├── layout.tsx                  # Root layout with metadata
│   │   ├── page.tsx                    # Landing page & pre-flight cockpit preview
│   │   └── simulator/                  # Main simulation cockpit & loading states
│   ├── components/
│   │   ├── ArchitectureMap.tsx         # 2D ReactFlow microservice graph
│   │   ├── CodebaseCity.tsx            # Isometric 3D Canvas Codebase City
│   │   ├── DeploymentCity.tsx          # Deployment blast-radius visualizer
│   │   ├── Navbar.tsx                  # Floating navigation header
│   │   ├── ReleaseReadinessReport.tsx  # Flight manifest & markdown/PDF exporter
│   │   ├── RepositoryUploadScreen.tsx  # In-memory drag-and-drop ingestion
│   │   ├── SimulationTimeline.tsx      # Chronological failure scrubber & controller
│   │   ├── SimulatorDashboard.tsx      # Multi-column telemetry command center
│   │   └── SimulatorLoadingSkeleton.tsx# Light-mode shimmer loading skeleton
│   ├── lib/
│   │   ├── city-data.ts                # LOC & fan-in procedural city layout generator
│   │   ├── codebase-analyzer.ts        # In-memory AST walker & vulnerability regexes
│   │   ├── report-exporter.ts          # Markdown & PDF export utilities
│   │   ├── simulation-helpers.ts       # Timing, formatting & gate logic
│   │   └── simulation-scenarios.ts     # Pre-packaged failure scenarios
│   └── types/
│       └── index.ts                    # Shared TypeScript contracts & schemas
└── tests/                              # Vitest automated test suite (78 tests)
```

---

## 🎨 Visual Design System: Pure Light Mode

DryRun exclusively adheres to a **Neo-Brutalist Light Mode Design System**:
- **Canvas Base:** `#f6f5f2` (Warm Neutral Stone with subtle micro-dots)
- **Panels & Surfaces:** `#ffffff` with solid `#000` 1.5px–2px borders
- **Drop Shadows:** Crisp hard shadows (`3px 3px 0 0 #000`, `6px 6px 0 0 #000`)
- **Typography:** Geist Sans (Interface) & Geist Mono (Telemetry & Metrics)
- **Status Badges:** 
  - `PASSED / LOW RISK:` `#16a34a` (green) on `#dcfce7`
  - `WARN / REVIEW:` `#d97706` (amber) on `#fef3c7`
  - `BLOCKED / CRITICAL:` `#dc2626` (red) on `#fee2e2`
