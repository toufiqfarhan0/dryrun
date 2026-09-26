# Milestone 17 — Execution Prompt

> **Session:** 17 — Rubric Alignment & Live Deployment Documentation  
> **Role:** Lead Hackathon Strategist & Technical Documentation Architect Agent  
> **Date:** 2025  
> **Constraint:** CRITICAL — Do NOT modify any application code in `src/` or `tests/`. All source code, contracts, and tests are verified and frozen. Only update markdown documentation files.

---

## Prompt

```
Role: Lead Hackathon Strategist & Technical Documentation Architect Agent

Context:
Refer to @README.md, @BUILDING_WITH_BOB.md, @AGENTS.md, and @docs/architecture.md.
CRITICAL CONSTRAINT: Do NOT modify any application code in src/ or tests/. All source code,
contracts, and tests are verified and frozen. Only update markdown documentation files.

Objective:
Align our project documentation with the official IBM Bob 2.0 Hackathon judging rubric
("Agent mode, parallel tasks, subagents, and document understanding" + "Workflow Impact"),
highlight our live Vercel deployment (https://dryrun-ten.vercel.app/), and document
Milestone 17 in bob_sessions/.

Tasks to execute:

1. Update @README.md:
   - Below the title and badges (around line 16), add the Live Vercel Demo badge and direct link:
     [![Live Demo](https://img.shields.io/badge/Live%20Demo-dryrun--ten.vercel.app-00f0ff?style=for-the-badge&logo=vercel)](https://dryrun-ten.vercel.app/)
     🌐 **Live Cloud Demo:** [https://dryrun-ten.vercel.app/](https://dryrun-ten.vercel.app/) *(Instant evaluation with zero setup)*
   - Add a high-visibility section: "## 📈 Developer Workflow Impact (Before vs. After)" showing
     a concrete comparison table covering:
     - Blast-Radius Tracing, Cascading Failure Detection, Release Gate Decision, MTTR.

2. Update @BUILDING_WITH_BOB.md:
   - In the section "## 🛠️ How IBM Bob 2.0 Features Were Leveraged", explicitly document the
     hackathon rubric core capabilities:
     - Subagents (Isolated Context Execution)
     - Parallel Tasks & Concurrency
     - Document Understanding & Deep Context

3. Update @docs/architecture.md:
   - Add section "11. Heuristics & Simulation Boundaries" explaining:
     - Static AST Dependency Graphs (deterministic vs. simulated topologies)
     - Chaos decay functions (T+0s to T+24h) — exponential, linear, step models
     - Accuracy vs. Feedback Speed trade-off table

4. Create Milestone 17 Dossier:
   - Create directory bob_sessions/17-rubric-alignment-and-live-deployment/
   - Create 17-rubric-prompt.md (this file)
   - Create 17-rubric-summary.md

5. Verification:
   - Run npm test to confirm all 78 tests continue to pass.
   - Run npm run build to confirm clean compilation with 0 errors.
```

---

## Files Targeted

| File | Change Type |
|---|---|
| `README.md` | Added Live Demo badge + `## 📈 Developer Workflow Impact` section |
| `BUILDING_WITH_BOB.md` | Added Subagents, Parallel Tasks, Document Understanding subsections |
| `docs/architecture.md` | Added `## 11. Heuristics & Simulation Boundaries` section |
| `bob_sessions/17-rubric-alignment-and-live-deployment/17-rubric-prompt.md` | Created (this file) |
| `bob_sessions/17-rubric-alignment-and-live-deployment/17-rubric-summary.md` | Created |
