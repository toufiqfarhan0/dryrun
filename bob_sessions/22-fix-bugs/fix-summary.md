# Fix the transparent background and overlapping text bug on the Export Dropdown in `src/components/ReleaseReadinessReport.tsx`.

Problem:
Line 191 of `src/components/ReleaseReadinessReport.tsx` uses `background: 'hsl(var(--card))'`. The CSS variable `--card` is undefined in `src/app/globals.css`, causing the popover to render completely transparent, so the underlying risk score text bleeds through the menu.

Instructions:
1. In `src/components/ReleaseReadinessReport.tsx`, locate the dropdown popover `<motion.div>` style block around lines 185–195.
2. Replace `background: 'hsl(var(--card))'` with:
   `background: 'hsl(var(--popover))'` (which is defined in `globals.css` as solid `#ffffff` in light mode and solid `#0e0e0d` in dark mode).
3. Change `zIndex: 80` to `zIndex: 100` so it always sits above all adjacent cards.
4. Add `backdropFilter: 'none'` and ensure full solid opacity so that in both Light and Dark modes, no underlying text or numbers can bleed through.

---

**Status:** active  **Date:** 2026-09-27

---

### 👤 User

Fix the transparent background and overlapping text bug on the Export Dropdown in `src/components/ReleaseReadinessReport.tsx`.

Problem:
Line 191 of `src/components/ReleaseReadinessReport.tsx` uses `background: 'hsl(var(--card))'`. The CSS variable `--card` is undefined in `src/app/globals.css`, causing the popover to render completely transparent, so the underlying risk score text bleeds through the menu.

Instructions:
1. In `src/components/ReleaseReadinessReport.tsx`, locate the dropdown popover `<motion.div>` style block around lines 185–195.
2. Replace `background: 'hsl(var(--card))'` with:
   `background: 'hsl(var(--popover))'` (which is defined in `globals.css` as solid `#ffffff` in light mode and solid `#0e0e0d` in dark mode).
3. Change `zIndex: 80` to `zIndex: 100` so it always sits above all adjacent cards.
4. Add `backdropFilter: 'none'` and ensure full solid opacity so that in both Light and Dark modes, no underlying text or numbers can bleed through.

---

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/components/ReleaseReadinessReport.tsx

### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — src/components/ReleaseReadinessReport.tsx

### 🤖 Assistant

Three targeted changes applied to [`src/components/ReleaseReadinessReport.tsx`](src/components/ReleaseReadinessReport.tsx:189):

1. **`background`** — `hsl(var(--card))` → `hsl(var(--popover))`, which resolves to solid `#ffffff` (light) / `#0e0e0d` (dark) per `globals.css`.
2. **`zIndex`** — `80` → `100`, ensuring the dropdown floats above all adjacent risk-score cards.
3. **`backdropFilter: 'none'`** — explicitly disables any inherited backdrop blur so nothing behind the popover can bleed through.