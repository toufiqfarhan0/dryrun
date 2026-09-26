<div align="center">

# DryRun

### Pre-Flight Release Simulation Engine
**Watch your code break here. Not in production.**

Built with purpose using **IBM Bob 2.0** and **watsonx.ai Granite 3.3 8B**.

[![IBM Bob 2.0](https://img.shields.io/badge/Built%20With-IBM%20Bob%202.0-8a3ffc?style=flat-square)](./BUILDING_WITH_BOB.md)
[![watsonx.ai](https://img.shields.io/badge/Powered%20By-watsonx.ai%20Granite%203.3-0f62fe?style=flat-square)](https://www.ibm.com/watsonx)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0f62fe?style=flat-square)](./LICENSE)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-dryrun--ten.vercel.app-00f0ff?style=for-the-badge&logo=vercel)](https://dryrun-ten.vercel.app/)

🌐 **Live Cloud Demo:** [https://dryrun-ten.vercel.app/](https://dryrun-ten.vercel.app/) *(Instant evaluation with zero setup)*

</div>

---

## 📈 Developer Workflow Impact (Before vs. After)

DryRun eliminates the most expensive moments in modern software delivery—the moments *after* a bad deployment lands in production.

| Capability | ❌ Before DryRun | ✅ After DryRun |
|---|---|---|
| **Blast-Radius Tracing** | 45–60 min manual code & log review across services | < 4 seconds — automated AST dependency mapping (**92% faster triage**) |
| **Cascading Failure Detection** | Discovered post-deploy during P1/P2 outages | Pre-deployment chaos decay timeline simulation (`T+0s` → `T+24h`) — preventing Sev-1 outages before merge |
| **Release Gate Decision** | Subjective peer review guesswork, no audit trail | Objective **watsonx.ai Granite 3.3** automated risk dossier — audit-ready, reproducible gating |
| **MTTR** | 2–4 hours during live rollback emergencies | Immediate inline remediation suggestions before merge — **zero customer-facing downtime** |

---

## 💡 The Problem

In modern software delivery, deployment failure is rarely caused by a single unit-level defect. Instead, production outages happen at the seams:
- **Cascading Microservice Degradation:** A slow downstream query or timeout triggers thread pool exhaustion across upstream gateways.
- **Architectural Breakage:** Hidden circular import paths, monolithic module boundaries, and untested dependency drift.
- **Unchecked Security CVEs & Secrets:** API keys and SQL injection paths that slip past linters and trigger costly remediation after promotion.

Traditional CI/CD pipelines tell you if code *compiles* and passes isolated unit tests. **They cannot tell you what happens when your release actually runs in a complex system topology.**

**DryRun bridges this gap.** It acts as a pre-flight flight simulator for software releases—deconstructing your codebase, mapping dependencies, simulating failure propagation over time, and gating deployments before any code touches end users.

---

## 🖥️ Interactive Command Center

DryRun provides a synchronized 3-column operations dashboard:

| Signal / Panel | Functionality |
|---|---|
| **System Topology Map** | Interactive React Flow service graph displaying modules, dependencies, connection links, and visual risk halos (`ok` · `warn` · `danger`). |
| **Cascade Timeline** | Chronological playback scrubber (`T+0s` to `T+24h`) simulating the propagation of latency, circuit breaks, and outages with real-time integrity tracking. |
| **Risk & Gate Dossier** | Comprehensive deployment readiness report featuring animated risk scoring (0–100), categorized vulnerabilities, and one-click Markdown export. |

---

## ⚡ Live AI Synthesis vs. Offline Zero-Credential Mode

DryRun provides a resilient **dual-engine architecture**:

1. **Live AI Run (IBM watsonx.ai):** When credentials are provided, DryRun transmits codebase snapshots to the **IBM Granite 3.3 8B Instruct** foundation model for contextual risk reasoning, failure cascade synthesis, and deployment recommendations.
2. **Instant Offline Mode:** If IBM Cloud credentials are not configured, DryRun automatically falls back to its deterministic AST static analysis engine and built-in enterprise scenarios—ensuring 100% functionality without network dependencies or API keys.

---

## 🚀 Quickstart

### Prerequisites
- **Node.js**: v18.17.0+ or v20.x LTS
- **npm**: v9+ or v10+

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/toufiqfarhan0/dryrun.git
cd dryrun

# Install dependencies using npm
npm install
```

### 2. Configure Environment (Optional for Live Run)

To run in **Live Mode** with IBM watsonx.ai Granite 3.3, create a `.env.local` file in the root directory:

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

## 🔬 Testing Pre-Configured Scenarios

On the home upload screen, you can evaluate live candidates immediately:

1. **FinTech Payments Gateway (`Risk 86 — Critical`):** High-concurrency transaction pipeline under database deadlock and connection exhaustion.
2. **Cloud Commerce (`Risk 78 — High`):** Microservices mesh suffering cascading downstream auth token verification timeouts.
3. **Deploy-Ready Sentinel Gateway (`Risk 0 — Nominal`):** Fully sanitized microservice with clean architecture, passing all deployment gates.
4. **Any Public GitHub Repo:** Enter an `owner/repo` string (e.g., `tiangolo/fastapi`, `expressjs/express`) to stream and inspect public repositories.
5. **Local Codebase Upload:** Drag-and-drop any `.zip` archive (up to 50 MB) for in-memory AST pattern scanning.

---

## 🏗️ Architecture & Technology Stack

```
┌─────────────────┐      ┌───────────────────────────────┐      ┌────────────────────────┐
│  Codebase .ZIP  │ ───► │      Next.js 15 App Router    │ ───► │  Interactive 3-Column  │
│  or GitHub URL  │      │  (watsonx.ai + Static Engine) │      │  Simulation Dashboard  │
└─────────────────┘      └───────────────────────────────┘      └────────────────────────┘
```

| Layer | Technologies |
|---|---|
| **Framework & Engine** | Next.js 15.5 App Router, React 19, TypeScript 5 (Strict Mode) |
| **AI Foundation Model** | IBM watsonx.ai SDK (`@ibm-cloud/watsonx-ai`) with `ibm/granite-3-8b-instruct` |
| **Visual Architecture Map** | `@xyflow/react` v12 with custom node rendering and bidirectional hover sync |
| **Animation & Controls** | Framer Motion with physics-based transitions and playback scrubber |
| **Design System** | Neo-brutalist styling, 2px borders, solid ink drop shadows, Geist typography, Dark/Light modes |
| **Automated Testing** | Vitest 4 with golden regression snapshots, unit math models, and route contract suites |

---

## 🤖 Built with IBM Bob 2.0

DryRun was architected, scaffolded, and tested end-to-end using **IBM Bob 2.0**:
- **16 Structured Agent Sessions:** Every phase—from initial spec and AST scanners to 3-column command centers and Vitest suites—was built through autonomous Bob agent workflows.
- **Evidence Dossier:** All prompt records, execution logs, and session summaries are preserved in the [`bob_sessions/`](./bob_sessions/) directory.
- **Complete Development Story:** Read our detailed write-up in [BUILDING_WITH_BOB.md](./BUILDING_WITH_BOB.md).

---

## 🧪 Verification & Test Suite

Run the automated Vitest test suite:

```bash
# Run all unit, integration, and regression golden snapshot tests
npm test

# Test production build
npm run build
```

---

## 📄 License

MIT © [toufiqfarhan0](https://github.com/toufiqfarhan0)
