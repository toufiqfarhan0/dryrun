# Review the pipeline visual animation system, dark/light mode token architecture, and timeline scrubber keyframes in `src/app/globals.css`.

CRITICAL CONSTRAINT: Do NOT run any commands, do NOT run tests or builds (no npm test, no npm run build, no next build). Do NOT modify existing source code. This is an advisory review and documentation session.

Please audit `src/app/globals.css` and verify:
1. CSS Keyframe definitions: `pipelinePulse`, `pipelineFlow`, `scannerLine`, `neuralGlow`, and `decayWave` (lines 940–969). Confirm timing functions, iteration behavior, and performance considerations (GPU-accelerated transforms vs width/opacity animations).
2. Pipeline visual classes: `.pipeline-card`, `.pipeline-badge-pulse`, `.pipeline-connector-line`, `.scanner-beam`, `.neural-glow`, and `.decay-bar` (lines 970–1019). Confirm dark mode and light mode hover states and contrast boundaries.
3. Timeline scrubber & play/pause button contrast: verify that control button active/hover states maintain WCAG AA contrast across both light (`--background: 40 8% 97%`) and dark (`--background: 240 10% 4%`) modes.
4. Neo-brutalist scrollbar styling and utility classes.

Provide an architectural audit summary highlighting verification findings and confirm whether `src/app/globals.css` meets production-ready enterprise standards for DryRun.

---

**Status:** active  **Date:** 2026-09-26

---

### 👤 User

Review the pipeline visual animation system, dark/light mode token architecture, and timeline scrubber keyframes in `src/app/globals.css`.

CRITICAL CONSTRAINT: Do NOT run any commands, do NOT run tests or builds (no npm test, no npm run build, no next build). Do NOT modify existing source code. This is an advisory review and documentation session.

Please audit `src/app/globals.css` and verify:
1. CSS Keyframe definitions: `pipelinePulse`, `pipelineFlow`, `scannerLine`, `neuralGlow`, and `decayWave` (lines 940–969). Confirm timing functions, iteration behavior, and performance considerations (GPU-accelerated transforms vs width/opacity animations).
2. Pipeline visual classes: `.pipeline-card`, `.pipeline-badge-pulse`, `.pipeline-connector-line`, `.scanner-beam`, `.neural-glow`, and `.decay-bar` (lines 970–1019). Confirm dark mode and light mode hover states and contrast boundaries.
3. Timeline scrubber & play/pause button contrast: verify that control button active/hover states maintain WCAG AA contrast across both light (`--background: 40 8% 97%`) and dark (`--background: 240 10% 4%`) modes.
4. Neo-brutalist scrollbar styling and utility classes.

Provide an architectural audit summary highlighting verification findings and confirm whether `src/app/globals.css` meets production-ready enterprise standards for DryRun.

---

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/app/globals.css

### 🤖 Assistant

> 🔧 called: read_file, read_file, read_file



> 🔧 **read_file** — src/app/globals.css

> 🔧 **read_file** — src/app/globals.css

> 🔧 **read_file** — src/app/globals.css

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — src/app/globals.css

> 🔧 **read_file** — src/app/globals.css

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/app/globals.css

### 🤖 Assistant

> 🔧 called: read_file

Now I have a complete picture of the file. Let me do the WCAG contrast math mentally and compile the full audit.

> 🔧 **read_file** — src/app/globals.css

### 🤖 Assistant

> 🔧 called: create_html_artifact

Now I have everything needed. Let me compile the full architectural audit.

> 🔧 **create_html_artifact** — dryrun_css_audit

### 🤖 Assistant

Here is the full advisory audit. Key findings organized by the four areas you requested:

---

## 1 · Keyframe Analysis (Lines 941–968)

| Keyframe | Animated Properties | Composited? | Verdict |
|---|---|---|---|
| `pipelinePulse` | `transform: scale`, `opacity` | ✅ Yes | **Pass** |
| `pipelineFlow` | `background-position` | ⚠ Paint-only | **Warn** |
| `scannerLine` | `transform: translateY`, `opacity` | ✅ Yes | **Pass** |
| `neuralGlow` | `box-shadow` | ⚠ Paint-only | **Warn** |
| `decayWave` | `width`, `opacity` | ❌ Layout reflow | **Fail** |

[`decayWave`](src/app/globals.css:964) at line 964 is the critical issue — **`width` animation triggers a full layout reflow on every frame**, the worst-performing animation category. Replace with `transform: scaleX()` + `transform-origin: left center` for identical visual output with full GPU compositing.

[`pipelineFlow`](src/app/globals.css:947) and [`neuralGlow`](src/app/globals.css:959) trigger paint steps (not layout), which is acceptable for limited surface area but should be refactored for scalability on large graphs.

---

## 2 · Pipeline Visual Classes (Lines 970–1019)

All six classes are structurally sound. The two dual-mode hover overrides on [`.pipeline-card`](src/app/globals.css:976) correctly scope dark vs. light behavior. One contrast boundary concern: the dark-mode hover border `rgba(255,255,255,0.24)` resolves to ~3.1:1 against the obsidian body — technically meets SC 1.4.11's 3:1 floor but is borderline. Recommend bumping to `0.35` alpha.

---

## 3 · Timeline / Play-Pause Controls (`.pb-btn`, Lines 573–631)

**Light mode: all states pass WCAG AA** (`#141413` on white/warm-stone backgrounds, 13:1–20:1). **Dark mode text contrast: all states pass** (~13–16:1 white on dark-charcoal). 

**The critical defect here is visual, not contrast**: the [dark-mode `.pb-btn`](src/app/globals.css:611) retains `box-shadow: 2px 2px 0 0 #000` — a pure black shadow against a near-black `#0e0e0d` background. The neo-brutalist depth cue that signals "this is a button" is **completely invisible in dark mode**. Fix: change to `2px 2px 0 0 rgba(255,255,255,0.15)` in the `.dark .pb-btn` block.

---

## 4 · Scrollbar Styling (Lines 142–150)

The webkit scrollbar is clean and correctly uses the CSS Level 4 slash-alpha notation (`hsl(var(--muted-foreground) / 0.3)`). One gap: **Firefox is unstyled**. Add `scrollbar-width: thin; scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;` to the `*` selector for cross-browser parity.

---

## Production Readiness

**Conditional pass.** Two fixes are required before enterprise production deployment: (1) replace `width` animation in `decayWave` with `scaleX`, and (2) make the dark-mode `pb-btn` box-shadow visible. Everything else — token architecture, WCAG AA text contrast, dual-selector dark/light coverage, neo-brutalist consistency — is production quality.

---

### 👤 User

Audit `src/lib/report-exporter.ts`.
CRITICAL: Do NOT edit files and do NOT run commands/tests.
Verify in 2 sentences that `generateMarkdownReport` and `exportReportAsPDF` cleanly serialize architecture metrics and issues.

---

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/lib/report-exporter.ts

### 🤖 Assistant

[`generateMarkdownReport`](src/lib/report-exporter.ts:17) cleanly serializes all architecture metrics — it iterates `modules` into a pipe-delimited Markdown table (name, risk, files) and maps each `Issue` into a numbered heading block with finding, impact, and a `getRecommendation`-derived mitigation, with all optional fields guarded by `&&` length checks before rendering. [`exportPdf`](src/lib/report-exporter.ts:82) (the actual PDF implementation — note: there is no function named `exportReportAsPDF` in this file) replicates the same four-section structure via jsPDF, correctly using `doc.splitTextToSize` for long text, an `ensureSpace` page-break guard before every section, and a post-hoc footer loop over `getNumberOfPages()` — both serialization paths cover identical data fields with no fields dropped or silently omitted.

---

### 👤 User

Inspect `tests/unit/report-exporter.test.ts`.
CRITICAL: Do NOT edit files and do NOT run commands/tests.
Confirm in 1 sentence how the test asserts Markdown report generation and jsPDF instantiation.

---

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — tests/unit/report-exporter.test.ts

### 🤖 Assistant

The Markdown test calls [`generateMarkdownReport`](src/lib/report-exporter.ts:17) with a fixture and asserts six `toContain` checks against the returned string (title header, project name, score/risk label, cost, issue description, and impact text); the PDF test does **not** invoke [`exportPdf`](src/lib/report-exporter.ts:82) end-to-end — it only dynamic-imports `jspdf`, instantiates `new jsPDF()` directly, and asserts the instance is defined with a `text` method, meaning `exportPdf` itself is never exercised and a crash inside it would go undetected.

---

### 👤 User

Inspect `src/lib/simulation-helpers.ts`.
CRITICAL: Do NOT edit files and do NOT run commands/tests.
Summarize in 1 sentence how `getRiskBadgeClass` and `getScoreColor` map numerical risk scores to status thresholds.

---

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/lib/simulation-helpers.ts

### 🤖 Assistant

[`getRiskBadgeClass`](src/lib/simulation-helpers.ts:32) uses descending threshold checks — `≥80` → Critical, `≥60` → High, `≥40` → Medium, `=0` → Zero Risk, else Low — and [`getScoreColor`](src/lib/simulation-helpers.ts:43) mirrors the same three upper thresholds to hex colors (`#ef4444`, `#f97316`, `#f59e0b`) with everything below 40 returning green `#22c55e`, meaning both functions share identical breakpoints but the badge function adds a special `score === 0` zero-risk branch that the color function does not.

---

### 👤 User

Inspect `tests/unit/simulation-helpers.test.ts`.
CRITICAL: Do NOT edit files and do NOT run commands/tests.
Confirm in 1 sentence which helper functions and boundary thresholds are validated.

---

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — tests/unit/simulation-helpers.test.ts

### 🤖 Assistant

The test suite validates [`getRiskBadgeClass`](src/lib/simulation-helpers.ts:32) at all seven boundary values (0, 39, 40, 59, 60, 79, 80, 100) confirming exact label/colorClass pairs, [`getScoreColor`](src/lib/simulation-helpers.ts:43) at the six threshold edges (39, 40, 59, 60, 79, 80) confirming exact hex returns, and [`formatFileSize`](src/lib/simulation-helpers.ts:50) across five byte values (0, 512, 1024, 1536, 1 MiB) confirming one-decimal-place KB formatting — but notably neither [`computeDamage`](src/lib/simulation-helpers.ts:57), [`estimateIncidentCost`](src/lib/simulation-helpers.ts:65), nor [`getRecommendation`](src/lib/simulation-helpers.ts:71) are tested at all.

---

### 👤 User

Inspect `src/components/Navbar.tsx`.
CRITICAL: Do NOT edit files and do NOT run commands/tests.
Confirm in 1 sentence how the component renders telemetry status badges and the theme toggle.

---

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/components/Navbar.tsx

### 🤖 Assistant

[`TopBar`](src/components/Navbar.tsx:20) renders **no telemetry status badges** — the `status`, `statusColor`, `riskScore`, `projectName`, `onOpenPrivateRepoHelp`, and `onSelectDemo` props are accepted in the interface but never consumed in the JSX — and the theme toggle renders conditionally only when `onToggleTheme` is provided, swapping a Lucide `Sun` / `Moon` icon based on the `isDark` boolean with correct `aria-label` inversion.

---

### 👤 User

Inspect `src/components/AnalysisScanningOverlay.tsx`.
CRITICAL: Do NOT edit files and do NOT run commands/tests.
Confirm in 1 sentence how the component handles motion opacity transitions and the rotating spinner.

---

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/components/AnalysisScanningOverlay.tsx

### 🤖 Assistant

The component wraps the entire overlay in a Framer Motion [`AnimatePresence`](src/components/AnalysisScanningOverlay.tsx:11) / [`motion.div`](src/components/AnalysisScanningOverlay.tsx:13) that transitions `opacity` from `0 → 1` on mount and back to `0` on unmount over `0.2s`, while the spinner is a separate inner [`motion.div`](src/components/AnalysisScanningOverlay.tsx:29) with a static track ring beneath it that continuously animates `rotate: 360` with `repeat: Infinity, ease: 'linear'` at `1.1s` per revolution — making the mount/unmount fade and the spin completely independent animations on separate elements.

---

### 👤 User

Inspect `src/components/AnalysisProgressScreen.tsx`.
CRITICAL: Do NOT edit files and do NOT run commands/tests.
Confirm in 1 sentence how the streaming log container auto-scrolls to the bottom upon new log entries.

---

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/components/AnalysisProgressScreen.tsx

### 🤖 Assistant

A [`useRef`](src/components/AnalysisProgressScreen.tsx:30) attaches to the log container `div`, and a [`useEffect`](src/components/AnalysisProgressScreen.tsx:32) with `[logs]` as its dependency calls `scrollTo({ top: scrollHeight, behavior: 'smooth' })` on the ref's current element whenever the `logs` array changes — driving a smooth scroll to the bottom on every new entry append.

---

### 👤 User

Inspect `src/components/ArchitectureMap.tsx`.
CRITICAL: Do NOT edit files and do NOT run commands/tests.
Confirm in 1 sentence how ReactFlow nodes and edges map module risk levels to visual glow styles and animated strokes.

---

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/components/ArchitectureMap.tsx

### 🤖 Assistant

Each [`ModuleNode`](src/components/ArchitectureMap.tsx:18) reads its `risk` field and looks up both `riskColors` and `riskGlows` from [`simulation-helpers`](src/lib/simulation-helpers.ts:5) to set the node's `border` color, `background` as the same color at `18` hex alpha, and `boxShadow` glow; edges are built in [`useMemo`](src/components/ArchitectureMap.tsx:85) by pairing consecutive module indices and applying `riskColors[mod.risk]` as `stroke` with `strokeDasharray: '4 4'` and ReactFlow's `animated: true` flag — which drives the marching-ants dash animation natively — so both glow intensity and edge stroke color are fully determined by the source module's `RiskLevel` token.

---

### 👤 User

Inspect `src/components/SimulationTimeline.tsx`.
CRITICAL: Do NOT edit files and do NOT run commands/tests.
Confirm in 1 sentence how playback step progression calculates system damage percentage and notifies `onStatusChange`.

---

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/components/SimulationTimeline.tsx

### 🤖 Assistant

Each 1800ms timer tick increments [`visibleCount`](src/components/SimulationTimeline.tsx:28) by one, and `damagePercent` is derived synchronously as [`computeDamage(events, visibleCount - 1)`](src/components/SimulationTimeline.tsx:33) — which tallies `danger` events at 18 points and `warn` events at 8 points across the visible slice, capped at 100 — then a separate [`useEffect`](src/components/SimulationTimeline.tsx:45) keyed on `damagePercent` immediately calls [`onStatusChange`](src/components/SimulationTimeline.tsx:18) with `'CRITICAL FAILURE'`/`#ef4444` above 70, `'DEGRADING'`/`#f59e0b` above 40, or `'SYSTEM NOMINAL'`/`#22c55e` otherwise.

---

### 👤 User

Inspect `src/components/ReleaseReadinessReport.tsx`, `src/components/SimulatorDashboard.tsx`, and `src/app/simulator/page.tsx`.
CRITICAL: Do NOT edit files and do NOT run commands/tests.
Confirm in 2 sentences that the 3-column layout integrates the report export dropdown, topology map, and timeline scrubber into the `/simulator` route.

---

### 🤖 Assistant

> 🔧 called: read_file, read_file, read_file



> 🔧 **read_file** — src/components/SimulatorDashboard.tsx

> 🔧 **read_file** — src/app/simulator/page.tsx

> 🔧 **read_file** — src/components/ReleaseReadinessReport.tsx

### 🤖 Assistant

[`SimulatorDashboard`](src/components/SimulatorDashboard.tsx:59) owns the three-column `dashboard-grid` layout: the left `dashboard-col` holds [`ArchitectureMap`](src/components/ArchitectureMap.tsx) (topology map, SSR-disabled via `next/dynamic`) stacked above the module list, the center `dash-panel-timeline` mounts [`SimulationTimeline`](src/components/SimulationTimeline.tsx) with its playback scrubber and `onStatusChange` wired up to the page-level `handleStatusChange`, and the right `dash-panel-report` renders [`ReleaseReadinessReport`](src/components/ReleaseReadinessReport.tsx) which owns the export dropdown toggle internally at line 145. The `/simulator` route's [`SimulatorContent`](src/app/simulator/page.tsx:21) gates the entire dashboard behind `screen === 'dashboard' && dashboardData` within an `AnimatePresence` switcher, passing `dashboardData`, `isDemo`, `onStatusChange`, and `onReset` down to `SimulatorDashboard` as the single source of truth for all three columns.

---

### 👤 User

Audit the simulator architecture across `src/components/ReleaseReadinessReport.tsx`, `src/components/SimulatorDashboard.tsx`, and `src/app/simulator/page.tsx`.

CRITICAL: Do NOT edit any files and do NOT run any commands, tests, or builds. Provide an advisory architectural review only.

Please verify:
1. Component Hierarchy: How `SimulatorDashboard.tsx` structures the 3-column command center layout (Architecture Map & logs on the left, Simulation Timeline in the center, Release Readiness Report on the right).
2. Report Export Flow: How `ReleaseReadinessReport.tsx` implements the multi-format export dropdown (Markdown & PDF) using client-side generation.
3. Route Orchestration: How `src/app/simulator/page.tsx` parses scenario URL query parameters (`?scenario=fintech`, `commerce`, `sentinel`) and coordinates upload and demo simulation states.

Provide a concise, 3-paragraph architectural audit confirming component boundaries, data flow, and production readiness.

---

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/components/ReleaseReadinessReport.tsx

### 🤖 Assistant

I have all the information needed from the prior reads plus this export handler section. Here is the architectural audit:

---

**Component Hierarchy — 3-Column Command Center**

[`SimulatorDashboard`](src/components/SimulatorDashboard.tsx:59) is the sole layout owner of the three-column `dashboard-grid`. The left `dashboard-col` stacks two panels: `dash-panel-map` hosting [`ArchitectureMap`](src/components/ArchitectureMap.tsx) (SSR-disabled via `next/dynamic` to guard against ReactFlow's browser-API dependency) above `dash-panel-modules` hosting an interactive module list with hover tooltips and click-to-select state. If the API returns fewer than 3 modules, a `useMemo` heuristic at lines 29–46 synthesizes a canonical 6-node display graph derived from `risk_score` thresholds — this is a reasonable graceful-degradation strategy but conflates display data with source-of-truth data, meaning the topology map and the module list can show synthesized nodes that do not correspond to actual analyzed files. The center `dash-panel-timeline` and right `dash-panel-report` are full-height single-component panels with no internal sub-splitting, producing a clean, non-overlapping column boundary. The overall boundary is well-enforced: `SimulatorDashboard` owns layout and `displayModules` derivation; it owns no export logic, no playback state, and no route state.

**Report Export Flow — Multi-Format Client-Side Generation**

[`ReleaseReadinessReport`](src/components/ReleaseReadinessReport.tsx:23) self-contains the entire export lifecycle. It assembles a `reportPayload` object at lines 73–81 from its props, then delegates to [`exportMarkdown`](src/lib/report-exporter.ts:65) (synchronous Blob + anchor click) and [`exportPdf`](src/lib/report-exporter.ts:82) (async dynamic import of `jspdf`) through thin handler wrappers at lines 83–98. The dropdown itself is robustly dismissed via both `mousedown` outside-click detection (using a `dropdownRef`) and an `Escape` keydown listener, with both listeners correctly registered only while `isExportOpen` is true and cleaned up on effect return — no listener leak. The PDF handler wraps `exportPdf` in try/finally with an `isExportingPdf` loading state that drives a `Loader2` spinner on the button, preventing double-submission. One gap: `console.error` is the sole error surface for a failed PDF export — there is no user-visible error toast or fallback messaging, so a jsPDF failure is silent to the end user.

**Route Orchestration — Scenario Params and State Machine**

[`SimulatorContent`](src/app/simulator/page.tsx:21) functions as a 4-screen state machine (`upload → processing → dashboard`, with reset returning to `upload`) coordinated entirely through a `screen` string enum and `AnimatePresence` keyed switching. The `?scenario=` URL parameter is parsed via `useSearchParams` and handled in a `useEffect` gated on `mounted` to avoid SSR/hydration mismatches — the gate is correct and the `Suspense` wrapper at the export default correctly defers `useSearchParams` to the client. Three scenario aliases are supported: `fintech`, `commerce`/`cloud-commerce`/`ecommerce`, and `sentinel`/`sentinel-gateway`/`zero-risk`, each mapping to a `handleDemo` call with the canonical scenario ID. The `handleStatusChange` callback at line 364 accepts the string emitted by `SimulationTimeline` and casts it to `StatusType` — this cast is unchecked (`text as StatusType`), meaning a malformed string from the timeline would silently corrupt the status without a type error. Overall the route is production-ready for the happy path; the two items to resolve before enterprise release are: (1) add a user-visible error state for failed PDF exports in `ReleaseReadinessReport`, and (2) replace the unsafe `as StatusType` cast in `handleStatusChange` with an explicit validation or exhaustive union check.