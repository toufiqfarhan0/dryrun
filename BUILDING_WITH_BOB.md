# 🤖 Building DryRun with IBM Bob 2.0 — Development Journey

> **IBM Bob 2.0 Hackathon Submission**  
> **Theme:** Build with purpose using IBM Bob 2.0  
> **Repository:** [toufiqfarhan0/dryrun](https://github.com/toufiqfarhan0/dryrun)  
> **Evidence Dossier:** [`bob_sessions/`](./bob_sessions/) (23 autonomous agent sessions with prompts, task logs, summaries, and screenshots)

---

## 📌 Executive Summary

**DryRun** was conceived, architected, and built in end-to-end partnership with **IBM Bob 2.0**. Using Bob IDE's **Agent Mode**, autonomous code generation, terminal execution, and context-aware file management, we built a production-grade, pre-flight release simulation engine in approximately 14 hours—a project that would otherwise require 50+ hours of full-stack engineering effort.

---

## 🎯 The Purpose & Workflow Challenge

In software delivery, deployment failure is rarely caused by a single compile error or unit test failure. Disastrous outages happen at the seams:
- **Cascading Microservice Degradation:** A slow downstream microservice query exhausts connection pools across upstream gateways.
- **Architectural Breakage:** Hidden circular dependencies, monolithic module boundaries, and unexpected dependency drifts.
- **Unchecked Security CVEs & Secrets:** Hardcoded credentials and SQL injection surfaces that slip past linters and trigger catastrophic breaches.

Traditional CI/CD pipelines tell developers if their code *compiles*. **They cannot tell developers what happens when the code runs in a live distributed system.**

**DryRun** acts as a pre-flight flight simulator for software releases. It ingests any codebase (via local `.zip` or public GitHub URL), synthesizes an interactive microservice topology, maps downstream blast radius, replays chronological failure cascades, and provides an objective deployment gate decision powered by **IBM watsonx.ai Granite 3.3 8B**.

---

## 📊 Development Impact & Bobcoins Budget

| Metric | With IBM Bob 2.0 | Traditional Manual Development | Productivity Gain |
|---|---|---|---|
| **Total Build Time** | ~14 hours | 50–60 hours | **~75% Time Saved** |
| **Agent Sessions** | 23 focused sessions | Multiple manual sprints | Systematic progression |
| **Components Built** | 8 complex React components | Manual drafting & debugging | Zero boilerplate fatigue |
| **Test Coverage** | 11 Vitest test suites (78 tests) | Often skipped or deferred | Comprehensive test coverage |
| **Bobcoins Budget** | 40 Bobcoins | N/A | High-leverage token efficiency |
| **Production Build** | Next.js 15 + React 19 (0 errors) | Multi-day type alignment | Instant compilation |

---

## 🛠️ How IBM Bob 2.0 Features Were Leveraged

### 1. Agent Mode (Autonomous Multi-File Orchestration)
Bob's Agent Mode acted as a lead system architect and software engineer. In each milestone, Bob autonomously:
- Analyzed existing project context via `AGENTS.md` and `.bobrules`.
- Created and modified multiple interdependent TypeScript files in parallel.
- Ran terminal diagnostics (`npm test`, `npm run build`, `tsc --noEmit`) to verify correctness before completing tasks.

### 2. Subagents (Isolated Context Execution) ✦ *Hackathon Rubric Core Capability*
Bob dispatched **independent subagents** for tasks that required strict context isolation—preventing unrelated implementation details from polluting the main conversation's working memory. Concrete examples:

- **AST Syntax Parser Isolation:** The TypeScript/Babel AST visitor logic (`src/lib/ingester/ast-parser.ts`) was built in an isolated subagent context, receiving only the `DependencyGraph` type contract and file-walker interface. This kept the intricate visitor pattern code completely separate from the risk-scoring logic being authored in parallel.
- **Risk Matrix Math Scoring:** The weighted impact formula (`impactScore = normalise(w_depth × 1/blastDepth + w_fanin × dependentCount + w_critical × isEntryPoint + w_loc × loc)`) was developed in an isolated subagent that consumed only `src/types/index.ts`—ensuring the math engine could not accidentally inherit stale graph state from earlier sessions.
- **React Flow Component State Machine:** The `SimulationContext` reducer and `GraphCanvas` rendering pipeline were architected in a dedicated subagent, receiving only the finalized `ChaosSimulationResult` and `BlastRadiusReport` shapes as input—guaranteeing that frontend state transitions remained decoupled from backend engine changes.

Each subagent returned a concise summary of its deliverable back to the orchestrating session, enabling clean integration with zero context bleed.

### 3. Parallel Tasks & Concurrency ✦ *Hackathon Rubric Core Capability*
Bob's parallel task execution enabled decoupled engine components to be developed **concurrently** rather than sequentially, compressing a 50+ hour build timeline into approximately 14 hours:

- **AST Dependency Graph Generator alongside Chaos Decay Math Models:** While one task thread explored `@babel/parser` visitor patterns for extracting `STATIC_IMPORT` and `HTTP_CALL` edges from TypeScript source files, a parallel task was independently developing the exponential/linear/step decay propagation functions in `src/lib/chaos/decay-functions.ts`. Neither thread blocked the other because both consumed only the frozen `GraphNode`/`GraphEdge` contracts from `src/types/`.
- **React Component Architecture alongside API Route Handlers:** The `SystemMap`, `Timeline`, and `RiskReport` React components were scaffolded in parallel with the Next.js `/api/analyze`, `/api/simulate`, and `/api/gate` route handlers. The shared `AIResult` payload type acted as the synchronization contract.
- **Vitest Test Suite alongside Final Documentation:** Milestone 15's 78-test QA suite and Milestone 16's architecture documentation were authored in parallel tasks—neither depending on the other's output, both referencing only the finalized type contracts.

### 4. Document Understanding & Deep Context ✦ *Hackathon Rubric Core Capability*
Bob's document-understanding capability was the architectural backbone that maintained 100% contract adherence across all 17 milestones:

- **`@docs/architecture.md` Ingestion:** Every agent session opened by referencing `docs/architecture.md`. Bob parsed the component hierarchy, API surface definitions, data flow diagrams, and simulation pipeline stages to ensure that each new file was scaffolded in precisely the right layer of the system—never placing server logic in client components or vice versa.
- **`.bobrules` Enforcement:** The project's coding standards file (`.bobrules`) was ingested at session start to enforce TypeScript strict mode, Zod validation on all external payloads, and the prohibition against `any` types. Bob surfaced rule violations inline and self-corrected before writing files.
- **`src/types/index.ts` as Single Source of Truth:** All 16 development milestones referenced the shared type contracts directly. Bob's document understanding ensured that `DependencyGraph`, `BlastRadiusReport`, `ChaosSimulationResult`, and `ReleaseGateDecision` interfaces were consumed identically across the AST ingester, chaos engine, watsonx synthesizer, and React visualizer—maintaining structural integrity without manual cross-referencing.

### 5. Context Mentions & File-Level Navigation
Using context mentions (`@file`, `@folder`), Bob was guided through complex architectural specifications (`docs/architecture.md`), reference test fixtures, and shared type contracts in `src/types/index.ts`. This ensured strict contract adherence across both client and server boundaries.

### 6. Literate Coding & Terminal Tool Integration
Bob did not just write static code; it actively validated its work through terminal execution:
- Resolved generic JSX function type incompatibilities between `@xyflow/react` v12 and React 19.
- Cleaned up PostCSS configurations during the migration to Tailwind CSS v4.
- Executed Vitest regression golden snapshot suites directly in the terminal to verify zero snapshot drift.

### 7. Code Review & Auto-Approvals
With auto-approve rules configured for safe read and test operations, Bob rapidly iterated through complex regex security patterns (AWS credential scanners, SQL injection detectors, and safe-suffix false-positive suppressions).

---

## 🗺️ Step-by-Step Bob Milestones (01 to 23)

Every phase of development is memorialized with genuine task logs, execution prompts, summaries, and screenshots in the [`bob_sessions/`](./bob_sessions/) directory:

```
bob_sessions/
├── 01-spec-and-architecture/          # System design, .bobrules, AGENTS.md
├── 02-core-engine-foundation/         # Next.js 15 App Router scaffold, shared types
├── 03-ast-dependency-scanner/         # AST parser, file tree discovery
├── 04-risk-scoring-matrix/            # Weighted vulnerability scoring formulas
├── 05-chaos-simulation-pipeline/      # Failure propagation & decay models
├── 06-watsonx-granite-engine/         # IBM watsonx.ai Granite 3.3 integration
├── 07-interactive-system-graph/       # React Flow canvas & telemetry state
├── 08-command-center-workspace/       # Dashboard workspace layout
├── 09-release-notes-and-telemetry/    # Automated dossier synthesis
├── 10-dependencies-and-contracts/     # Package configs, adm-zip, types
├── 11-utilities-and-scenarios/        # Real-world enterprise failure scenarios
├── 12-design-system-and-screens/      # Neo-brutalist theme, TopBar, UploadScreen
├── 13-dashboard-and-simulation-flow/  # 3-column command center & master flow
├── 14-core-analysis-and-engine/       # Unified engine, zip extraction & fallback
├── 15-test-suite-and-verification/    # 11 Vitest suites, golden snapshots, CLI smoke
├── 16-final-submission-and-docs/      # README, architecture dossier, build verification
├── 17-rubric-alignment-and-live-deployment/ # Rubric alignment, live Vercel deployment
├── 18-mit-license-and-governance/     # Open-source MIT license & governance docs
├── 19-input-validation-and-error-states/# Robust upload schema validation & boundary protection
├── 20-landing-page-architecture-realignment/ # Landing page realignment, gate stats, hero section
├── 21-pipeline-verification-and-engine-fallback/ # In-memory dual-engine fallback & pipeline review
├── 22-fix-bugs/                       # Popover transparency fix, styling, theme polish
└── 23-system-verification/            # End-to-end verification, pre-flight gate clearance & audit
```

### Detailed Milestone Highlights

#### Milestone 01–06: Architecture, Foundation & watsonx AI
- **Session 01–02:** Initialized project governance (`.bobrules`), agent roles (`AGENTS.md`), Next.js 15 scaffolding, and strict TypeScript contracts (`src/types/index.ts`).
- **Session 03–05:** Created the AST analysis scanner, weighted vulnerability matrix (critical=25, high=15, medium=8, low=3), and chronological failure decay modeling (`T+0s` to `T+24h`).
- **Session 06:** Built the client wrapper for IBM watsonx.ai foundation models (`ibm/granite-3-8b-instruct`), establishing prompt templates and JSON extraction logic.

#### Milestone 07–12: Interactive Visuals, Scenarios & Design System
- **Session 07–09:** Developed the interactive system graph using `@xyflow/react` with custom `ModuleNode` anchors, glow halos, and telemetry state reducers.
- **Session 10–11:** Implemented three built-in enterprise failure scenarios in `src/lib/demo-data.ts`:
  1. *FinTech Payments Gateway* (DB deadlock & connection pool exhaustion — Risk 86).
  2. *Cloud Commerce* (Cascading downstream auth timeouts — Risk 78).
  3. *Sentinel Gateway* (Clean deployment-ready release — Risk 0).
- **Session 12:** Established the GitDiagram-inspired neo-brutalist design system in `src/app/globals.css`, supporting both Dark Mode and Light Mode with 2px ink borders, solid drop shadows, and high-contrast typography.

#### Milestone 13: 3-Column Command Center & Master App Flow
- Built `src/components/Dashboard.tsx`, `SystemMap.tsx`, `Timeline.tsx`, and `RiskReport.tsx`.
- Implemented bidirectional hover synchronization: hovering over a module card highlights its corresponding node and connected edges in the React Flow graph.
- Created the master state controller in `src/app/page.tsx` managing transitions between `upload`, `processing`, and `dashboard` states.

#### Milestone 14: Engine Consolidation & Zero-Fail Resilience
- Consolidated all analysis logic into [src/lib/analysis.ts](file:///c:/Users/toufi/Desktop/dryrun/src/lib/analysis.ts) using `adm-zip` for in-memory buffer processing.
- Implemented pattern scanners for hardcoded credentials, SQL injection, dynamic `eval()`, and risky dependencies (`vm2`, `node-serialize`).
- Built the live API endpoint at [src/app/api/analyze/route.ts](file:///c:/Users/toufi/Desktop/dryrun/src/app/api/analyze/route.ts) with streaming public GitHub repository support and automated fallback from watsonx.ai to deterministic static analysis.

#### Milestone 15: Vitest QA Suite & Golden Snapshots
- Built 11 automated test suites in `tests/`:
  - Archive extraction and file discovery (`build-system-snapshot.test.ts`).
  - Risk score calculation and bounds (`deterministic-analysis.test.ts`).
  - Golden regression snapshot testing (`deterministic-golden.test.ts`).
  - Route contract validation (`analyze-route.test.ts`).
- Created CLI smoke tools (`scripts/smoke-analyze.ts`, `test-api.js`).

#### Milestone 16–17: Submission Readiness & Live Deployment
- Synthesized full user documentation, architecture specifications, and setup instructions.
- Confirmed zero build errors via `npm run build` and verified clean working tree state.
- Deployed live to Vercel at [dryrun-ten.vercel.app](https://dryrun-ten.vercel.app/).

#### Milestone 18–23: Production Hardening, DORA Compliance & Pre-Flight Gating
- **Session 18–19:** Standardized open-source MIT licensing, added robust schema boundaries, and created defensive empty/corrupt archive error states.
- **Session 20–21:** Realignment of the landing page hero, stats ribbon, CrowdStrike lesson comparison section, and verification of zero-disk in-memory fallback guarantees.
- **Session 22–23:** Resolved UI popover opacity bugs, polished Light/Dark contrast, and conducted comprehensive read-only pre-flight verification across all 74 automated tests with zero defects.

---

## 💡 Key Architectural Takeaways

1. **Dual-Engine Resilience:** By pairing **IBM watsonx.ai Granite 3.3** with a local deterministic static analysis engine, DryRun guarantees that developers can simulate releases anywhere—even in air-gapped or zero-credential environments.
2. **Visual Blast Radius over Raw Logs:** Instead of wading through hundreds of lines of stack traces, developers instantly visualize failure propagation across microservice boundaries on an interactive topology graph.
3. **Built with Purpose:** Every single line of code in DryRun serves a single unified objective: eliminating deployment surprises before code reaches production users.

---

## 🏆 Conclusion

IBM Bob 2.0 was not simply an auto-complete assistant; it was an active pair programmer, system architect, and reliability engineer throughout the creation of DryRun. The speed, accuracy, and structural consistency of this codebase stand as a testament to the power of agentic AI development.
