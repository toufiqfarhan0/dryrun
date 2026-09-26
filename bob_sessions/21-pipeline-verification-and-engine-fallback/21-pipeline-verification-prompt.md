# Milestone 21 — Execution Prompt

> **Session:** 21 — Pipeline Verification, Dual-Engine Fallback & Test Architecture  
> **Role:** Principal Systems Architect & Reliability Engineering Lead  
> **Constraint:** CRITICAL — Do NOT run any commands, do NOT run tests or builds (no `npm test`, no `npm run build`, no `next build`). Do NOT modify any existing source code. This is an advisory review and documentation session.

---

## Prompt for IBM Bob 2.0

```
Role: Principal Systems Architect & Reliability Engineering Lead for IBM Bob 2.0 Hackathon

Context:
Refer to @src/lib/codebase-analyzer.ts, @src/app/api/analyze/route.ts, @src/app/globals.css, and @tests.
CRITICAL CONSTRAINT: Do NOT run any commands, do NOT run tests or builds (no npm test, no npm run build, no next build). Do NOT modify existing source code. This is a pure review and documentation session.

Objective:
Review and verify the pipeline architecture, test coverage, build system integrity, and offline deterministic fallback mechanisms of DryRun:

1. In-Memory Archive Ingestion:
   - Verify that src/lib/codebase-analyzer.ts and src/app/api/analyze/route.ts unpack repository ZIP archives entirely within Node.js memory buffers via adm-zip with zero disk writes.
   - Confirm runtime safety and memory lifecycle isolation.

2. Dual-Engine Architecture & Offline Fallback:
   - Inspect the dual-path execution in src/app/api/analyze/route.ts.
   - Verify the gating logic: analyzeWithWatson() for live IBM Cloud watsonx.ai Granite 3.3 8B Instruct inference when credentials exist, and generateDeterministicAnalysis() for automatic fallback when offline or unconfigured.
   - Confirm that Watson exception catch blocks cleanly route to the deterministic path without throwing uncaught 500 errors to client callers.

3. Build System & Compilation Integrity:
   - Verify Next.js App Router configuration and SSR boundaries.
   - Confirm dynamic imports with ssr: false for client-only graph libraries (@xyflow/react).
   - Confirm TypeScript strict type safety across all interfaces (SystemSnapshot, Module, Issue, SimulationEvent).

4. Test Suite & Verification:
   - Audit test suites in tests/unit/, tests/integration/, and tests/regression/.
   - Verify golden deterministic snapshot tests (deterministic-golden.test.ts, snapshot-golden.test.ts).
   - Verify math and hashing functions (derived-math.test.ts, simple-hash.test.ts).
   - Verify Watson API contract validation (watson-contract.test.ts).

Provide an architectural verification report confirming the reliability, fallback guarantees, and production readiness of the complete system.
```

---

## Files Targeted

| File | Status | Description |
|---|---|---|
| `src/lib/codebase-analyzer.ts` | Reviewed | In-memory archive extraction and static AST pattern analysis |
| `src/app/api/analyze/route.ts` | Reviewed | Dual-engine API route: watsonx.ai Granite 3.3 8B with offline deterministic fallback |
| `src/app/globals.css` | Reviewed | Pipeline animations, neo-brutalist dark mode tokens, and WCAG AA contrast |
| `src/lib/report-exporter.ts` | Reviewed | Client-side Markdown and PDF release report generation |
| `src/lib/simulation-helpers.ts` | Reviewed | Risk score breakpoints, color mapping, and incident cost estimation |
| `src/components/SimulatorDashboard.tsx` | Reviewed | 3-column command center integrating topology map, timeline, and audit report |
| `src/app/simulator/page.tsx` | Reviewed | Dedicated App Router simulation page with scenario query routing |
| `tests/unit/` | Reviewed | Unit test suites covering build snapshots, math derivation, and hash integrity |
| `tests/integration/watson-contract.test.ts` | Reviewed | Contract testing for IBM watsonx.ai request and response schemas |
| `tests/regression/` | Reviewed | Golden snapshot tests for deterministic analysis reproducibility |
| `bob_sessions/21-pipeline-verification-and-engine-fallback/` | Created | Milestone 21 prompt, summary, and verification records |
