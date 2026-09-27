# Milestone 25 — 3D Codebase City & Spatial Chaos Simulation

> **Session:** 25 — 3D Codebase City & Spatial Chaos Simulation  
> **Role:** Lead Systems Architect & 3D Spatial Visualization Engineer  
> **Target Files:**  
> - `.bobignore`  
> - `.bob/rules/coding-standards.md`, `.bob/rules/architecture-constraints.md`, `.bob/rules/release-gating.md`  
> - `.bob/modes/release-gatekeeper.json`  
> - `src/lib/city-data.ts`  
> - `src/components/CodebaseCity.tsx`  
> - `src/lib/codebase-analyzer.ts`  
> - `src/lib/simulation-scenarios.ts`  
> - `src/components/SimulatorDashboard.tsx`  
> - `src/components/ReleaseReadinessReport.tsx`  
> - `src/app/page.tsx`  
> **Constraint:** MINIMAL TOKEN FOOTPRINT — Exact targeted changes only. Pure Neo-Brutalist Light Mode everywhere. Zero disk writes during ZIP ingestion. Zero regressions across the 74-test Vitest suite and Next.js 15 production build.

---

## Prompt for IBM Bob 2.0

```markdown
Role: Lead Systems Architect & 3D Spatial Visualization Engineer for IBM Bob 2.0 Hackathon

Context:
You are developing "DryRun", a pre-flight release simulation engine powered by IBM Bob 2.0 and watsonx.ai Granite 3.3.
To give release engineering teams instant architectural intuition before approving a deployment, transform the 2D graph view into an interactive 3D Codebase City canvas rendered as the full-viewport base layer with floating telemetry overlays, backed by in-memory AST metrics and real-time failure simulation physics.

CRITICAL CONSTRAINTS:
1. Pure Neo-Brutalist Light Mode: #f6f5f2 stone canvas, #ffffff card surfaces, 1.5px–2px hard black borders (#000), 2px–3px solid offset drop shadows. Absolutely zero dark-mode toggles or conditional dark overrides.
2. In-Memory Only: Process codebases via adm-zip buffer with 0 disk writes.
3. Test & Build Integrity: All 74 Vitest tests must pass (`npm test`) and Next.js production build must compile with 0 errors (`npm run build`).

Execute the following implementation steps across the codebase:

### Step 1: Configure IBM Bob 2.0 IDE Standard Rules & Release Gatekeeper Mode
1. Create `.bobignore` to prevent indexing `node_modules`, `.next`, build caches, coverage reports, and sensitive files (*.key, *.pem, .env*).
2. Create `.bob/rules/`:
   - `coding-standards.md`: Enforce Neo-Brutalist Light Mode, TypeScript strict types, and in-memory ZIP processing.
   - `architecture-constraints.md`: Enforce dual-engine pattern (watsonx.ai Granite 3.3 8B primary + deterministic offline fallback) with zero disk extraction.
   - `release-gating.md`: Enforce DORA metrics evaluation and score < 40 clearance threshold.
3. Create `.bob/modes/release-gatekeeper.json` registering the 'Release Gatekeeper' custom agent persona.

### Step 2: In-Memory AST File-Level Metrics Extraction
In `src/lib/codebase-analyzer.ts`:
- Extend the in-memory archive extraction pass over `adm-zip` buffer entries to compute per-file metrics:
  - Lines of Code (LOC): `content.split('\n').length`.
  - Fan-in Dependencies: Count how many other project files import each file.
- Populate `SystemSnapshot.files` with `{ path, loc, dependents, risk, module }` so the 3D city generator receives normalized dimensional factors.

### Step 3: 3D Codebase City Spatial Layout Engine
In `src/lib/city-data.ts`:
- Implement `getCityDataForProject(snapshot)` to convert AST file metrics and module clusters into 3D isometric city geometry:
  - Building Heights: Dynamically scale building heights by LOC (`heightFactorLoc`) and fan-in gravity (`heightFactorDep`).
  - Spatial District Grid: Cluster files into districts based on architectural modules (e.g., API Gateway, Auth, Database, UI).
  - Building Footprint & Coordinates: Calculate normalized grid coordinates `(gx, gy)`, base sizes, and street network layouts.
  - Risk Categorization: Map risk scores to status indicators (Green = Stable, Amber = High Fan-In Warning, Red = Single Point of Failure / CVE).

### Step 4: High-Performance Isometric HTML5 Canvas Renderer
In `src/components/CodebaseCity.tsx`:
- Render the 3D Codebase City using an HTML5 2D Canvas with isometric projection:
  - Isometric Math: Project 3D points `(x, y, z)` onto 2D canvas coordinates `(isoX, isoY)`.
  - Orbit & Rotation: Implement interactive drag-to-rotate camera angle (`orbitAngle`) and zoom controls.
  - Architectural Hatching: Render technical drafting cross-hatching and edge outlines.
  - Chaos Physics & Decay: When `damagePercent > 0`, apply physical building shake vibrations, structural decay discoloration, and particle fallout smoke over affected module towers.
  - Live Flight Arcs: Render curved energy pulses between calling modules to trace active service traffic.
  - Blueprint Export: Implement high-resolution PNG export capturing the current 3D city state.

### Step 5: Simulator Dashboard Integration with Floating Telemetry Overlays
1. In `src/components/SimulatorDashboard.tsx`:
   - Set the 3D Codebase City canvas as the full-viewport base layer.
   - Position two floating overlay cards with backdrop blur:
     - Left Floating Overlay: `SimulationTimeline` (failure event log, playback controls, step scrubber).
     - Right Floating Overlay: `ReleaseReadinessReport` (flight manifest, risk score badge, and Markdown/PDF export).
   - Wire `handleSimStepChange` so scrubbing through the timeline immediately propagates `damagePercent` and `activeSimEvent` into the 3D canvas and telemetry cards.
2. In `src/components/ReleaseReadinessReport.tsx`:
   - Enhance the flight manifest card with real-time risk scores, CAB release gating checklist, and 1-click Markdown / PDF export.
3. In `src/app/page.tsx`:
   - Add the "Spatial 3D Engine" capability showcase card with tabs for 3D City Preview, Architecture Map, and Module Telemetry, with a direct launcher button to `/simulator`.

### Step 6: Verification
- Run `npm test` and verify that all 11 test suites and 74 tests pass.
- Run `npm run build` and verify that the Next.js production build succeeds with 0 errors.
```

---

## Files Targeted & Implemented

| File | Status | Description |
|---|---|---|
| `.bobignore` | Created | Ignore rules covering `node_modules`, `.next`, build caches, coverage, and local secrets |
| `.bob/rules/coding-standards.md` | Created | Coding standard enforcing Neo-Brutalist Light Mode, TypeScript, and in-memory buffers |
| `.bob/rules/architecture-constraints.md` | Created | Dual-engine watsonx.ai Granite 3.3 + deterministic fallback architecture rule |
| `.bob/rules/release-gating.md` | Created | DORA release clearance guidelines (risk score < 40 gate threshold) |
| `.bob/modes/release-gatekeeper.json` | Created | Custom 'Release Gatekeeper' persona for autonomous CI/CD audits |
| `src/lib/city-data.ts` | Created | 3D spatial layout generator computing building heights, district coordinates, and street layouts |
| `src/components/CodebaseCity.tsx` | Created | Canvas-based isometric 3D city engine with camera orbit, chaos decay, and particle smoke |
| `src/lib/codebase-analyzer.ts` | Updated | Added in-memory AST extraction of file-level LOC and fan-in dependencies per file |
| `src/lib/simulation-scenarios.ts` | Updated | Step-based failure cascade logic calculating damage percentage and blast radius propagation |
| `src/components/SimulatorDashboard.tsx` | Updated | Re-architected viewport to host 3D City base layer with floating timeline & report overlay cards |
| `src/components/ReleaseReadinessReport.tsx` | Updated | Polished flight manifest overlay with live risk score badge and export dropdown |
| `src/app/page.tsx` | Updated | Added 3D Codebase City showcase card and interactive telemetry switcher on landing page |

---

## Verification & Test Results

```text
✓ tests/unit/simulation-helpers.test.ts (3 tests)
✓ tests/unit/derived-math.test.ts (6 tests)
✓ tests/unit/simple-hash.test.ts (4 tests)
✓ tests/unit/json-extractor.test.ts (7 tests)
✓ tests/unit/deterministic-analysis.test.ts (12 tests)
✓ tests/unit/build-system-snapshot.test.ts (18 tests)
✓ tests/unit/report-exporter.test.ts (2 tests)
✓ tests/integration/watson-contract.test.ts (11 tests | 2 todo)
✓ tests/integration/analyze-route.test.ts (8 tests | 2 todo)
✓ tests/regression/deterministic-golden.test.ts (4 tests)
✓ tests/regression/snapshot-golden.test.ts (3 tests)
↓ tests/integration/watson-live.smoke.test.ts (2 skipped)

Test Files  11 passed | 1 skipped (12)
     Tests  74 passed | 2 skipped | 4 todo (80)
  Duration  1.54s

Next.js Production Build:
✓ Compiled successfully in 10.9s
✓ Generating static pages (5/5)
✓ 0 errors, 0 warnings
```
