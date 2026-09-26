# Milestone 18 — Execution Prompt

> **Session:** 18 — Open Source Governance & MIT License Compliance  
> **Role:** Open Source Governance & Compliance Specialist Agent  
> **Constraint:** CRITICAL — Do NOT run any tests, builds, or commands. Do NOT execute `npm test` or `npm run build`. Do NOT modify any existing application code. This is an advisory governance verification step.

---

## Prompt for IBM Bob 2.0

```
Role: Open Source Governance & Legal Compliance Agent for IBM Bob 2.0 Hackathon

Context:
Refer to @package.json, @LICENSE, and @README.md.
CRITICAL CONSTRAINT: Do NOT run any commands, do NOT run tests or builds (no npm test, no npm run build, no next build). Do NOT modify existing source code. This is a pure governance review and documentation session.

Objective:
Review and verify open-source compliance for the DryRun repository submission. Confirm that the MIT License file is established with copyright 2026 Toufiq Farhan and DryRun Contributors, package.json declares "license": "MIT", and open-source terms are accurately reflected for hackathon compliance.

Tasks to execute:
1. Verify the root LICENSE file content against standard OSI-approved MIT License provisions.
2. Confirm package.json includes "license": "MIT".
3. Provide a brief governance compliance summary verifying that DryRun is fully open-source compliant and ready for public evaluation.
```

---

## Files Targeted

| File | Status | Description |
|---|---|---|
| `LICENSE` | Verified | Standard MIT License (Copyright © 2026 Toufiq Farhan and DryRun Contributors) |
| `package.json` | Verified | `"license": "MIT"` metadata tag |
| `bob_sessions/18-mit-license-and-governance/18-license-prompt.md` | Created | Milestone 18 execution prompt |
