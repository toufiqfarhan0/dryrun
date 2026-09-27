# Milestone 23 — Execution Prompt: System Verification & Pre-Flight Release Audit

> **Session:** 23 — System Verification & Pre-Flight Release Audit  
> **Role:** Lead Systems Auditor & Verification Gatekeeper  
> **Target Files:** Entire DryRun codebase (`src/app/page.tsx`, `src/components/ReleaseReadinessReport.tsx`, `src/components/RepositoryUploadScreen.tsx`, `src/components/SimulatorDashboard.tsx`, `src/app/globals.css`, `tests/`)  
> **Constraint:** STRICT READ-ONLY AUDIT — Do NOT modify, edit, or delete any source files. Do NOT execute destructive commands. All changes have been implemented; verify and document system health, UI alignment, and test suite integrity.

---

## Prompt for IBM Bob 2.0

```markdown
Role: Lead Systems Auditor & Verification Gatekeeper for IBM Bob 2.0 Hackathon

Context:
Review the complete DryRun system across @src/app/page.tsx, @src/components/ReleaseReadinessReport.tsx, @src/components/RepositoryUploadScreen.tsx, @src/components/SimulatorDashboard.tsx, @src/app/globals.css, and @tests.

CRITICAL CONSTRAINT:
Do NOT modify, edit, or delete ANY source files. Do NOT write new code. All UI updates, bug fixes, and feature enhancements are already completed. This is a STRICT READ-ONLY system verification, structural audit, and release clearance session.

Objective:
Perform a comprehensive verification audit of the entire DryRun platform across the following six areas, and output a structured Release Flight Manifest Verification Report:

1. Landing Page Alignment (@src/app/page.tsx):
   - Confirm Gate Badge renders: "GATE: BLOCKED • RISK 86/100" with high-risk badge styling.
   - Confirm Tab Switcher labels:
     1. "1. System Map & Blast Radius"
     2. "2. Failure Timeline (T+0s → T+18m)"
     3. "3. watsonx.ai Release Notes"
   - Confirm Right Card Footer: "Audited by IBM Bob 2.0 Release Gatekeeper · Model: watsonx Granite 3.3 8B".
   - Confirm 3 Scenario Cards feature failure-mode sub-titles in terracotta/amber/green colors.
   - Confirm "The CrowdStrike Lesson" section exists comparing Standard CI/CD (red X list) vs DryRun Pre-Flight (green ✓ list).
   - Confirm the 3-stat industry ribbon highlights: 82% undetected failures caught, 99.4% blast radius accuracy, and 0 disk writes (in-memory).

2. Pre-Flight Release Manifest & Gatekeeper (@src/components/ReleaseReadinessReport.tsx):
   - Confirm header title: "Pre-Flight Release Flight Manifest".
   - Confirm export button reads "Export Manifest" with dropdown options "Export Manifest (.MD)" and "Export Manifest (.PDF)".
   - Confirm Deployment Gate Verdict Box evaluates risk threshold (score >= 40 produces BLOCKED verdict; score < 40 produces CLEARED).
   - Confirm CAB Checklist is rendered with all 4 items (Architecture Boundary Validation, Cascading Failure Simulation, Blast Radius Impact Analysis, watsonx Granite Release Sign-Off).
   - Confirm Export popover uses opaque background (`hsl(var(--popover))`) and `zIndex: 100` without transparency bleed.

3. Repository Upload Screen & Dashboard (@src/components/RepositoryUploadScreen.tsx, @src/components/SimulatorDashboard.tsx):
   - Confirm Audits line: "Architectural Breakage · Cascading Faults · Missing Circuit Breakers · EU DORA Change Resilience".
   - Confirm Deployment Gate line: "watsonx.ai Granite 3.3 automated release clearance".
   - Confirm layout boundaries and responsive heights prevent vertical clipping or horizontal card overflow.

4. Dual-Engine Architecture & Offline Fallback (@src/app/api/analyze/route.ts, @src/lib/watsonx.ts):
   - Confirm live watsonx.ai Granite 3.3 8B Instruct integration handles production inference when IBM Cloud credentials are provided.
   - Confirm automatic deterministic fallback engine executes seamlessly without throwing uncaught 500 errors when offline or unconfigured.
   - Confirm in-memory repository archive extraction via `adm-zip` buffer with 0 disk writes.

5. Test Suite & Compilation Integrity:
   - Audit test suites across tests/unit/, tests/integration/, and tests/regression/.
   - Confirm all 74 unit, integration, and regression tests pass cleanly.
   - Confirm TypeScript strict type safety and zero compiler diagnostics.

6. Design System & Accessibility (@src/app/globals.css):
   - Confirm high-contrast neo-brutalist styling, clean Light/Dark mode transitions, and no conflicting CSS border shorthands.

Output Requirement:
Provide a structured "Pre-Flight Verification & Audit Report" summarizing your audit findings across all 6 areas, the status of each component, test suite verification metrics, and a final Deployment Clearance Verdict.
```

---

## Files Targeted & Audited

| File | Status | Verification Scope |
|---|---|---|
| `src/app/page.tsx` | Verified | Gate badge, tab labels, card footer, scenario subtitles, CrowdStrike lesson section, industry ribbon |
| `src/components/ReleaseReadinessReport.tsx` | Verified | Manifest title, export options, Deployment Gate Verdict Box, CAB checklist, opaque dropdown |
| `src/components/RepositoryUploadScreen.tsx` | Verified | Audits line, automated release clearance gate line, responsive card layout |
| `src/components/SimulatorDashboard.tsx` | Verified | 3-column command center, topology map, timeline, and audit report |
| `src/app/globals.css` | Verified | Light/dark theme tokens, popover background variable, neo-brutalist borders |
| `src/app/api/analyze/route.ts` | Verified | Dual-engine watsonx Granite 3.3 8B + offline deterministic fallback |
| `src/lib/codebase-analyzer.ts` | Verified | In-memory ZIP extraction, zero disk writes |
| `tests/` | Verified | 74 passing tests across unit, integration, and regression suites |
| `bob_sessions/23-system-verification/` | Active | Milestone 23 verification prompt, audit records, and screenshot artifacts |
