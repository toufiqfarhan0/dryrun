# Milestone 20 — Execution Prompt

> **Session:** 20 — Landing Page Architecture Realignment & Technical Accuracy  
> **Role:** Senior Software Architect & Technical Accuracy Reviewer Agent  
> **Constraint:** CRITICAL — Do NOT run any commands, do NOT run tests or builds (no `npm test`, no `npm run build`, no `next build`). Do NOT modify any existing source code. This is an advisory review and documentation session.

---

## Prompt for IBM Bob 2.0

```
Role: Senior Software Architect & Technical Accuracy Reviewer Agent for IBM Bob 2.0 Hackathon

Context:
Refer to @src/app/page.tsx and @src/lib/simulation-scenarios.ts.
CRITICAL CONSTRAINT: Do NOT run any commands, do NOT run tests or builds (no npm test, no npm run build, no next build). Do NOT modify existing source code. This is a pure review and documentation session.

Objective:
Review and verify the architectural alignment of the landing page (src/app/page.tsx). Confirm that all capabilities presented on the homepage strictly reflect genuine codebase implementations:
1. In-memory archive extraction using adm-zip with zero disk persistence.
2. Dual-engine architecture: IBM watsonx.ai Granite 3.3 8B Instruct with automatic offline deterministic static analysis fallback.
3. Interactive architecture topology map powered by @xyflow/react with bidirectional status highlights.
4. Pre-configured enterprise failure scenarios matching simulation-scenarios.ts (PayStream Gateway, Cloud Commerce, Sentinel Gateway).

Tasks to execute:
1. Audit the capabilities and telemetry tabs in src/app/page.tsx against codebase realities.
2. Confirm the 3 enterprise simulation scenarios showcased on the landing page accurately reflect the scenario data structures.
3. Provide a brief architectural audit summary confirming 100% technical fidelity between the landing page and the underlying engine.
```

---

## Files Targeted

| File | Status | Description |
|---|---|---|
| `src/app/page.tsx` | Reviewed | Landing page capabilities, telemetry tabs, and enterprise scenario cards |
| `src/lib/simulation-scenarios.ts` | Reviewed | Enterprise failure scenarios definition source of truth |
| `bob_sessions/20-landing-page-architecture-realignment/20-realignment-prompt.md` | Created | Milestone 20 execution prompt |
