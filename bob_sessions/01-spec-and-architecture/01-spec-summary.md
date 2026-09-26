# We are building DryRun (repository: https://github.com/toufiqfarhan0/dryrun.git) for the IBM Bob 2.0 Hackathon.

Category: Release Readiness and Deployment Processes
Theme: Build with purpose using IBM Bob 2.0

Please initialize our project context:
1. Create an `AGENTS.md` file that defines:
   - Project Vision: Pre-Deployment Blast-Radius & Chaos Simulator
   - The Core Problem: Teams release without knowing cascading failure risks
   - The Solution: Static AST dependency analysis + Chaos fault injection + watsonx Granite risk synthesis
   - Agent Roles:
     * Architecture & Contract Specifier
     * AST Dependency Ingester
     * Blast-Radius Risk Evaluator
     * Chaos Fault Injection Engine
     * Interactive System Visualizer
     * watsonx Release Gate Synthesizer
2. Create a `.bobrules` file setting coding standards:
   - TypeScript strict mode
   - Next.js App Router
   - Zero console errors / strict type hygiene
   - High-contrast developer-first aesthetic (slate/dark palette with danger/warning telemetry colors)
3. Produce a complete system architecture document in `docs/architecture.md` outlining the data contracts, component hierarchy, and simulation pipeline.

---

**Status:** active  **Date:** 2026-09-26

---

### 👤 User

We are building DryRun (repository: https://github.com/toufiqfarhan0/dryrun.git) for the IBM Bob 2.0 Hackathon.

Category: Release Readiness and Deployment Processes
Theme: Build with purpose using IBM Bob 2.0

Please initialize our project context:
1. Create an `AGENTS.md` file that defines:
   - Project Vision: Pre-Deployment Blast-Radius & Chaos Simulator
   - The Core Problem: Teams release without knowing cascading failure risks
   - The Solution: Static AST dependency analysis + Chaos fault injection + watsonx Granite risk synthesis
   - Agent Roles:
     * Architecture & Contract Specifier
     * AST Dependency Ingester
     * Blast-Radius Risk Evaluator
     * Chaos Fault Injection Engine
     * Interactive System Visualizer
     * watsonx Release Gate Synthesizer
2. Create a `.bobrules` file setting coding standards:
   - TypeScript strict mode
   - Next.js App Router
   - Zero console errors / strict type hygiene
   - High-contrast developer-first aesthetic (slate/dark palette with danger/warning telemetry colors)
3. Produce a complete system architecture document in `docs/architecture.md` outlining the data contracts, component hierarchy, and simulation pipeline.

---

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[-] Create AGENTS.md with project vision, problem, solution, and agent roles
[ ] Create .bobrules with coding standards
[ ] Create docs/architecture.md with system architecture


### 🤖 Assistant

> 🔧 called: list_files



> 🔧 **list_files** — .

### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — AGENTS.md

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Create AGENTS.md with project vision, problem, solution, and agent roles
[-] Create .bobrules with coding standards
[ ] Create docs/architecture.md with system architecture


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — .bobrules

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Create AGENTS.md with project vision, problem, solution, and agent roles
[x] Create .bobrules with coding standards
[-] Create docs/architecture.md with system architecture


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — docs/architecture.md

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Create AGENTS.md with project vision, problem, solution, and agent roles
[x] Create .bobrules with coding standards
[x] Create docs/architecture.md with system architecture


### 🤖 Assistant

All three foundation files are in place. Here's what was created:

---

### [`AGENTS.md`](AGENTS.md)
Defines the full project identity and all six agent roles with clear ownership boundaries:

| Agent | Owns | Produces |
|---|---|---|
| Architecture & Contract Specifier | `src/types/` | All shared TypeScript interfaces + Zod schemas |
| AST Dependency Ingester | `src/lib/ingester/` | `DependencyGraph` |
| Blast-Radius Risk Evaluator | `src/lib/blast-radius/` | `BlastRadiusReport` with impact scores |
| Chaos Fault Injection Engine | `src/lib/chaos/` | `ChaosSimulationResult` with per-node failure probabilities |
| Interactive System Visualizer | `src/components/visualizer/` | D3 force graph, timeline scrubber, drill-down panels |
| watsonx Release Gate Synthesizer | `src/lib/watsonx/` | Streaming `ReleaseGateDecision` via SSE |

---

### [`.bobrules`](.bobrules)
Enforces every agent to produce consistent, high-quality code:
- TypeScript strict mode, zero `any`, zero console errors, `tsc --noEmit` gates every commit
- Next.js App Router only — no `pages/`, server components by default
- Dark-first telemetry palette: `slate-950` background, `red-500 → orange → yellow → emerald` severity spectrum, `violet-500` for controls
- Inter-agent coupling rule: agents may only import from each other's public `index.ts` barrel, never internal files

---

### [`docs/architecture.md`](docs/architecture.md)
Complete system spec across 10 sections:
- **Full TypeScript type definitions** for all 5 data contracts (`DependencyGraph`, `ChangeSet`, `BlastRadiusReport`, `ChaosSimulationResult`, `ReleaseGateDecision`)
- **4-stage simulation pipeline** with pseudocode: AST walk → BFS impact scoring with tunable weights → fault propagation with exponential/linear/step decay → watsonx Granite prompt + SSE stream
- **API surface** for all 3 route handlers with request/response shapes
- **Frontend state machine** (`IDLE → ANALYZING → SIMULATING → STREAMING → COMPLETE → ERROR`)
- **Security boundaries** covering prompt injection, payload DoS limits, and secret isolation