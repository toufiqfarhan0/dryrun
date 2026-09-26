# Milestone 19 — Execution Prompt

> **Session:** 19 — Input Validation & Empty URL Error State Handling  
> **Role:** Frontend UX & Input Validation Specialist Agent  
> **Constraint:** CRITICAL — Do NOT run any commands, do NOT run tests or builds (no `npm test`, no `npm run build`, no `next build`). Do NOT modify any existing source code. This is an advisory review and documentation session.

---

## Prompt for IBM Bob 2.0

```
Role: Frontend UX & Input Validation Specialist Agent for IBM Bob 2.0 Hackathon

Context:
Refer to @src/components/RepositoryUploadScreen.tsx.
CRITICAL CONSTRAINT: Do NOT run any commands, do NOT run tests or builds (no npm test, no npm run build, no next build). Do NOT modify existing source code. This is a pure review and documentation session.

Objective:
Review and document the input validation flow for repository intake. Verify that the "Simulate Release" button handles empty input states gracefully by displaying an actionable guidance alert ("Please paste a GitHub URL to simulate release"), applying a visible validation focus state, and automatically resetting the error when the user begins typing or selects a sample scenario chip.

Tasks to execute:
1. Review the validation handler in RepositoryUploadScreen.tsx for empty input detection.
2. Confirm the user guidance message ("Please paste a GitHub URL to simulate release") and automatic error clearance logic on keystroke/chip click.
3. Provide a brief UX validation summary confirming that empty submission edge cases are handled cleanly without unhandled exceptions or broken states.
```

---

## Files Targeted

| File | Status | Description |
|---|---|---|
| `src/components/RepositoryUploadScreen.tsx` | Reviewed | Empty input validation and error feedback banner |
| `bob_sessions/19-input-validation-and-error-states/19-input-validation-prompt.md` | Created | Milestone 19 execution prompt |
