<!-- IBM Bob 2.0 Hackathon -->

<div align="center">

# DryRun — Pre-Flight Release Readiness & Deployment Gate Engine

### *Powered by IBM Bob 2.0 & watsonx.ai Granite 3.3 · Built for the IBM Bob 2.0 Hackathon*

[![IBM Bob 2.0](https://img.shields.io/badge/Built%20With-IBM%20Bob%202.0-8a3ffc?style=flat-square)](./BUILDING_WITH_BOB.md)
[![watsonx.ai](https://img.shields.io/badge/Powered%20By-watsonx.ai%20Granite%203.3-0f62fe?style=flat-square)](https://www.ibm.com/watsonx)
[![Track](https://img.shields.io/badge/Track-Release%20Readiness%20%26%20Deployment%20Assistant-e36b22?style=flat-square)](#track-requirement-matrix)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0f62fe?style=flat-square)](./LICENSE)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-dryrun--ten.vercel.app-00f0ff?style=for-the-badge&logo=vercel)](https://dryrun-ten.vercel.app/)

> **Track: Release readiness and deployment assistant** (Code Analysis · Dependency Review · Risk Summary · Release Notes · Deployment Validation · 3D Spatial Blast Radius)

🌐 **Live Application:** [https://dryrun-ten.vercel.app/](https://dryrun-ten.vercel.app/) • **Simulator Cockpit:** [https://dryrun-ten.vercel.app/simulator](https://dryrun-ten.vercel.app/simulator)

</div>

---

## ⚠️ Why Pre-Flight Gating Matters Now

> The cost of deploying without blast-radius analysis is no longer theoretical — it is measured in billions and mandated by law.

| Metric | Evidence |
| :--- | :--- |
| **82% of Enterprise Downtime** | Triggered by deployment and configuration changes — not code defects *(Gartner / DORA Metrics 2024–2025)* |
| **$5.4 Billion** | Global financial loss from the **July 19, 2024 CrowdStrike release failure**, where a configuration change passed internal validator checks but lacked pre-flight runtime blast-radius simulation |
| **January 17, 2025** | **EU DORA Enforcement** — The EU Digital Operational Resilience Act (Regulation 2022/2554) now legally fines financial entities that deploy software without audited change risk assessments and blast-radius controls |

DryRun answers the one question every on-call engineer dreads before a merge: _"If this service fails, what breaks with it?"_

---

## 🗺️ Track Requirement Matrix

| Track Requirement | DryRun Implementation | Source File |
| :--- | :--- | :--- |
| **Analyze Code Changes** | In-memory zero-disk AST & package deconstruction via `adm-zip` | `src/lib/codebase-analyzer.ts` |
| **Review Dependencies** | Interactive Architecture & System Map isolating single points of failure | `src/components/ArchitectureMap.tsx` |
| **3D Spatial Codebase City** | Isometric 3D skyline extruded from LOC & fan-in with district color grading | `src/components/CodebaseCity.tsx` |
| **Summarize Risks** | watsonx.ai Granite 3.3 failure mode reasoning + offline deterministic engine | `src/app/api/analyze/route.ts` |
| **Simulate Failure Modes** | Chronological chaos timeline (`T+0s` → `T+18m`) coupled with 3D structural decay | `src/components/SimulationTimeline.tsx` |
| **Generate Release Notes** | Multi-format **Release Flight Manifest** exported to Markdown & compliance PDF | `src/components/ReleaseReadinessReport.tsx` |
| **Validate Deployment** | Automated Deployment Gate verdict (`PASSED: CLEARED` vs `BLOCKED: HIGH RISK`) | `src/lib/simulation-helpers.ts` |

---

## 💡 The Problem

In modern software delivery, deployment failure is rarely caused by a single unit-level defect. Instead, production outages happen at the seams:
- **Cascading Microservice Degradation:** A slow downstream query or timeout triggers thread pool exhaustion across upstream gateways.
- **Architectural Breakage:** Hidden circular import paths, monolithic module boundaries, and untested dependency drift.
- **Unchecked Security CVEs & Secrets:** API keys and SQL injection paths that slip past linters and trigger costly remediation after promotion.

Traditional CI/CD pipelines tell you if code *compiles* and passes isolated unit tests. **They cannot tell you what happens when your release actually runs in a complex system topology.**

> **The CrowdStrike Lesson:** On July 19, 2024, a single configuration file update — one that passed all internal validation — caused 8.5 million Windows devices to blue-screen simultaneously. The missing layer: runtime blast-radius simulation before deployment.

**DryRun bridges this gap.** It acts as a pre-flight flight simulator for software releases—deconstructing your codebase, mapping dependencies, simulating failure propagation over time, and gating deployments before any code touches end users.

---

## 🤖 Deep IBM Bob 2.0 Integration

Bob is not just the development tool for DryRun — Bob **is** DryRun's release gatekeeper agent:

| Bob Role | Implementation |
| :--- | :--- |
| **Release Gatekeeper Agent** | Custom persona configured with DORA change-risk policies and EU compliance mandates (`.bob/modes/`) |
| **Custom Rules & Guardrails** | Strict TypeScript and architecture policies enforced via `.bobrules` and `.bob/rules/` |
| **Pre-Flight Skills** | `preflight-release-audit`, `audit-dependencies`, `simulate-blast-radius` (`.bob/skills/`) |
| **Scope Control** | Boundary access strictly controlled via `.bobignore` |
| **Zero Mock Data Guarantee** | Real ZIP buffer analysis, real dependency graphs, real watsonx API routes — no hardcoded fixture data |
| **Structured Agent Sessions** | 24 autonomous Bob sessions built every phase: spec → scanners → 3D Codebase City → Vitest suite → pre-flight release audit |

All prompt records, execution logs, and session summaries are preserved in the [`bob_sessions/`](./bob_sessions/) directory (see [Index](./bob_sessions/README.md)).  
Complete development story: [BUILDING_WITH_BOB.md](./BUILDING_WITH_BOB.md).

---

---

## 🖥️ How to Read a Release Flight Manifest

DryRun produces a synchronized 3-panel **Release Flight Manifest** for every codebase:

| Signal / Panel | Meaning |
|---|---|
| **3D Codebase City** | Interactive 60fps isometric 3D skyline with towers extruded from LOC, dynamic district zones, and real-time chaos decay |
| **System Topology Map** | Interactive React Flow service graph showing modules, dependencies, and service connections with risk halos (`ok` · `warn` · `danger`) |
| **Failure Cascade Timeline** | Chronological playback (`T+0s` → `T+18m`) simulating how network timeouts, errors, and contention propagate |
| **Blast Radius** | Percentage and visual map of downstream modules degraded or crashed by the release |
| **Deployment Risk Score** | Objective 0–100 risk rating (Low, Medium, High, Critical) with integrity damage tracking |
| **Identified Failure Modes** | Categorized vulnerability cards with affected endpoints, impact severity, and remediation advice |
| **Release Flight Manifest** | Auto-synthesized Markdown & compliance PDF dossier and deployment checklist generated by watsonx.ai Granite 3.3 |

---

## 🏙️ Interactive 3D Codebase City Engine

DryRun introduces **Spatial Code Intelligence**: an interactive 60fps HTML5 isometric canvas that transforms abstract dependency graphs into an explorable 3D metropolis.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CODEBASE CITY ENGINE                              │
├──────────────────────────┬─────────────────────────────────────────────┤
│ 🏢 Skyscraper Extrusion │ Tower height extruded from LOC & fan-in     │
│ 🎨 District Zoning       │ Microservices grouped into colored zones    │
│ ⚡ Energy Flight Arcs    │ Live animated pulses showing cross-calls   │
│ 💥 Real-Time Decay       │ Buildings shake, decay & smoke on failure   │
│ 🧭 Guided Walkthrough    │ Onboarding camera tour across key hubs     │
│ 📸 Blueprint PNG Export  │ Instant high-resolution snapshot download   │
└──────────────────────────┴─────────────────────────────────────────────┘
```

- **LOC vs Fan-In Modes:** Toggle between tower heights scaled by physical lines of code or architectural dependency centrality.
- **Single Point of Failure (SPOF) Spire:** Critical hub modules (e.g., `store.ts` or services with max downstream callers) are highlighted with an architectural rooftop mast and glowing warning beacon.
- **Bidirectional Chaos Physics:** As failure events trigger in the chaos timeline, affected services physically shake, decay structurally from 100% to critical, and project particle smoke into the isometric canvas.
- **Floating Neo-Brutalist Cockpit:** The canvas spans 100% of the viewport, with a floating operations deck on the right and an instant toggle (`[ Hide Overlay Cards ]`) for complete spatial immersion.

---

## ⚡ Live AI Synthesis vs. Offline Zero-Credential Mode

DryRun provides a resilient **dual-engine architecture**:

1. **Live AI Run (IBM watsonx.ai):** When credentials are provided, DryRun transmits codebase snapshots to the **IBM Granite 3.3 8B Instruct** foundation model for contextual risk reasoning, failure cascade synthesis, and deployment recommendations.
2. **Instant Offline Mode:** If IBM Cloud credentials are not configured, DryRun automatically falls back to its deterministic static analysis engine and built-in enterprise scenarios—ensuring 100% functionality without network dependencies or API keys.

---

## 🚀 Quickstart

### Prerequisites
- **Node.js**: v18.17.0+ or v20.x LTS
- **npm**: v9+ or v10+

### 1. Clone & Install

```bash
git clone https://github.com/toufiqfarhan0/dryrun.git
cd dryrun
npm install
```

### 2. Configure Environment (Optional for Live Run)

```bash
# .env.local — Required only for Live IBM watsonx.ai analysis
WATSONX_API_KEY=your_ibm_cloud_api_key_here
WATSONX_PROJECT_ID=your_watsonx_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-3-8b-instruct
```

> **Note:** If you skip this step, DryRun seamlessly operates in full offline simulation mode with zero setup required.

### 3. Launch Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔬 Pre-Configured Enterprise Scenarios

On the home upload screen, evaluate live candidates immediately:

1. **PayStream Gateway — *The Concurrency & Idempotency Split-Brain (FinTech)*** (`Risk 86 — Critical`): High-concurrency Go & Kafka payment pipeline. Idempotency lock exhaustion causes split-brain double-billing during payment network blips.
2. **CloudCommerce Platform — *The Black Friday N+1 Query Cascade (E-Commerce)*** (`Risk 78 — High`): Product catalog database lockup at 800+ concurrent users. N+1 query patterns under burst load trigger full PostgreSQL table scans.
3. **Sentinel Mesh Gateway — *The Hardened Canary Rollout (100% Release Ready)*** (`Risk 0 — Nominal`): Automated progressive delivery passing all compliance gates. Active circuit breakers, mTLS auth vault, zero critical vulnerabilities.
4. **Any Public GitHub Repo:** Enter an `owner/repo` string (e.g., `tiangolo/fastapi`, `expressjs/express`) to stream and inspect public repositories.
5. **Local Codebase Upload:** Drag-and-drop any `.zip` archive (up to 50 MB) for in-memory static pattern scanning.

---

## 🏗️ Architecture & Technology Stack

```mermaid
flowchart TD
    subgraph Ingestion ["1. In-Memory Archive Ingestion"]
        A["Codebase ZIP Archive"] -->|Buffer Read (adm-zip)| B["In-Memory Buffer (0 Disk Writes)"]
        C["Public GitHub URL"] -->|API Stream| B
    end

    subgraph Scanner ["2. Static AST & Security Scanner"]
        B --> D["AST Dependency Deconstruction"]
        D --> D1["Circular Dependency Detection"]
        D --> D2["Hardcoded Secret & SQLi Pattern Audit"]
        D --> D3["Single Point of Failure (SPOF) Isolation"]
    end

    subgraph DualEngine ["3. Dual-Engine AI Synthesis"]
        D --> E{"IBM Cloud Credentials Configured?"}
        E -->|Yes (Live Mode)| F["IBM watsonx.ai Granite 3.3 8B Instruct\n(Contextual Risk Reasoning)"]
        E -->|No / Timeout / Error| G["Deterministic Offline Fallback Engine\n(Air-Gapped Zero-Credential Mode)"]
    end

    subgraph Simulation ["4. Chaos Simulation Pipeline"]
        F --> H["Chaos Decay Propagation Engine"]
        G --> H
        H --> H1["Timeline Generation (T+0s → T+18m)"]
        H --> H2["Integrity Damage & Cascade Modeling"]
    end

    subgraph Gating ["5. Pre-Flight Release Gatekeeper"]
        H --> I["Deployment Gate Verdict Box"]
        I -->|Risk Score >= 40| I1["🛑 VERDICT: BLOCKED (High Risk)"]
        I -->|Risk Score < 40| I2["🟢 VERDICT: CLEARED (Nominal)"]
        I --> J["4-Point CAB Audit Checklist"]
    end

    subgraph Dashboard ["6. 3-Column Command Center & Export"]
        I1 --> K["System Topology Map (@xyflow/react)"]
        I2 --> K
        H1 --> L["Failure Cascade Timeline Scrubber"]
        J --> M["Pre-Flight Release Flight Manifest"]
        M --> N["Export Manifest (.MD & Compliance .PDF)"]
    end
```

| Layer | Technologies |
|---|---|
| **Framework & Engine** | Next.js 15.5 App Router, React 19, TypeScript 5 (Strict Mode) |
| **Spatial 3D Engine** | Custom 60fps HTML5 Isometric Canvas with procedural building extrusion, decay math, and dynamic energy pulse flight arcs |
| **AI Foundation Model** | IBM watsonx.ai SDK (`@ibm-cloud/watsonx-ai`) with `ibm/granite-3-8b-instruct` |
| **Visual Architecture Map** | `@xyflow/react` v12 with custom node rendering and bidirectional hover sync |
| **Chaos Playback & Motion** | Framer Motion with spring physics and timeline controls |
| **Document Synthesis** | jsPDF for client-side compliance PDF dossiers and Markdown export |
| **Archive Processing** | JSZip, AdmZip, server-side buffer streaming |
| **Design System** | Neo-brutalist styling, 2px borders, solid ink drop shadows, Geist typography, Dark/Light modes |
| **Automated Testing** | Vitest 4 with golden regression snapshots, unit math models, and route contract suites |

---

## 🧪 Verification & Test Suite

```bash
# Run all unit, integration, and regression golden snapshot tests
npm test

# Type-check with zero errors
npx tsc --noEmit
```

---

## 📄 License

MIT © [toufiqfarhan0](https://github.com/toufiqfarhan0)
