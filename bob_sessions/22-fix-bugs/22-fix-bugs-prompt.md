# Milestone 22 — Execution Prompt: Fix UI Bugs & Polish

> **Session:** 22 — Fix UI Bugs & Polish  
> **Role:** Frontend Systems Engineer & UI Polish Lead  
> **Target Files:** `src/components/ReleaseReadinessReport.tsx`, and subsequent bugfix targets

---

## Prompt for IBM Bob 2.0

```markdown
Role: Frontend Systems Engineer & UI Polish Lead

Task:
Fix the transparent background and overlapping bug on the Export Dropdown popover in `src/components/ReleaseReadinessReport.tsx`.

Problem:
At line 191 of `src/components/ReleaseReadinessReport.tsx`, the dropdown container uses:
`background: 'hsl(var(--card))'`
The CSS variable `--card` is undefined in `src/app/globals.css`, causing the popover background to evaluate as completely transparent. As a result, the risk score ("DEPLOYMENT RISK SCORE" and numerical score "55 / 100") bleeds through the dropdown menu options, making it unreadable.

Instructions:
1. Open `src/components/ReleaseReadinessReport.tsx`.
2. Locate the dropdown popover `<motion.div>` style block around lines 185–200.
3. Change `background: 'hsl(var(--card))'` to use a solid, opaque background:
   `background: 'hsl(var(--popover))'` (which is defined in `globals.css` as solid `#ffffff` in light mode and solid `#0e0e0d` in dark mode).
4. Update `zIndex: 80` to `zIndex: 100` so it always floats above the risk score and surrounding panels.
5. In the same motion.div style, ensure the background is fully opaque with:
   `backgroundColor: 'hsl(var(--popover))'`
   `backdropFilter: 'none'`
6. Verify that in both Light and Dark modes, the dropdown menu renders 100% opaque with no text or elements bleeding through from beneath.
```

---

## Files Targeted

| File | Status | Description |
|---|---|---|
| `src/components/ReleaseReadinessReport.tsx` | Fixed | Fixed dropdown background transparency to `hsl(var(--popover))` and set `zIndex: 100` |
| `bob_sessions/22-fix-bugs/22-fix-bugs-prompt.md` | Active | Milestone 22 bugfix execution tracking prompt |
