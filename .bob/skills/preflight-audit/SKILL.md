---
name: preflight-release-audit
description: Autonomous workflow to parse repository AST, compute cascading blast radius, inject chaos failure modes, and evaluate release readiness with IBM watsonx.ai Granite.
---

# Pre-Flight Release Audit Skill

## Purpose
Enables IBM Bob to conduct automated pre-deployment assessments on any JavaScript, TypeScript, Python, or Go codebase before code is merged or pushed to production.

## Workflow Steps
1. **Archive Deconstruction:** Ingest the `.zip` archive or Git diff in-memory via `src/lib/codebase-analyzer.ts`.
2. **AST Dependency Extraction:** Construct the directed acyclic graph (DAG) identifying cross-service API boundaries and database access layers.
3. **Chaos Fault Simulation:** Model failure scenarios:
   - Upstream rate limits and latency spikes.
   - Downstream service outages (`503 Service Unavailable`).
   - Database connection pool exhaustion.
4. **Risk Scoring & Decision:**
   - Synthesize findings via IBM watsonx.ai Granite 3.3.
   - Output binary gate verdict: `PASSED (CLEARED)` or `BLOCKED (CRITICAL RISK)`.
   - Export full Markdown and PDF Release Flight Manifest.
