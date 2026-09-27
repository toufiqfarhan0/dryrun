# Milestone 24 — Default Light Mode & Architecture Diagram

> **Session:** 24 — Default Light Mode & Architecture Diagram  
> **Role:** Lead Full-Stack Architect & Quality Gatekeeper  
> **Target Files:** `src/app/layout.tsx`, `src/app/simulator/page.tsx`, `README.md`  
> **Constraint:** MINIMAL TOKEN FOOTPRINT — Exact targeted changes only. Verify compilation and test suite with zero regressions.

---

## Prompt for IBM Bob 2.0

```markdown
Role: Full-Stack Architect & Release Gatekeeper for IBM Bob 2.0 Hackathon

Task:
Perform two targeted improvements to DryRun to polish presentation aesthetics and documentation:

1. Make Light Mode the First-Load Default:
   - In `src/app/layout.tsx`:
     Update the inline theme script so that if no `dryrun-theme` or `breakwater-theme` key exists in localStorage, it sets `data-theme="light"` (currently falls back to dark).
     Change: `const theme = saved === 'dark' ? 'dark' : 'light';`
     And in catch block: `document.documentElement.setAttribute('data-theme', 'light');`
   - In `src/app/simulator/page.tsx`:
     Set `useState<'dark' | 'light'>('light')` (from 'dark').
     Set the localStorage fallback to `'light'` (from 'dark').
   - Verify that when a user first lands on the website or simulator with cleared localStorage, the interface opens immediately in clean Light Mode.

2. Add Mermaid Architecture Flowchart to `README.md`:
   - Under `## 🏗️ Architecture & Technology Stack`, replace the simple 3-box ASCII diagram with a full, professional Mermaid diagram showing the complete 6-stage DryRun engine pipeline:
     1. In-Memory Archive Ingestion (adm-zip buffer, 0 disk writes, GitHub stream API)
     2. Static AST & Security Scanner (imports, circular deps, secrets, SQLi)
     3. Dual-Engine AI Synthesis (watsonx.ai Granite 3.3 8B Instruct + Deterministic Offline Fallback)
     4. Chaos Simulation Pipeline (T+0s → T+18m failure cascade & decay math)
     5. Pre-Flight Release Gatekeeper (Deployment Gate Verdict Box, score >= 40 threshold, CAB checklist)
     6. 3-Column Command Center & Export (@xyflow/react topology map, timeline scrubber, Markdown & PDF export)

3. Verification:
   - Verify all 74 Vitest tests pass (`npm test`).
   - Verify 0 TypeScript compiler errors (`npx tsc --noEmit`).
```

---

## Files Targeted

| File | Status | Description |
|---|---|---|
| `src/app/layout.tsx` | Updated | Set initial inline theme script fallback to `light` |
| `src/app/simulator/page.tsx` | Updated | Set default theme state and fallback to `light` |
| `README.md` | Updated | Replaced ASCII box with 6-stage Mermaid architecture diagram |
| `bob_sessions/24-default-light-mode-and-architecture-diagram/` | Created | Milestone 24 prompt, verification records, and artifacts |
