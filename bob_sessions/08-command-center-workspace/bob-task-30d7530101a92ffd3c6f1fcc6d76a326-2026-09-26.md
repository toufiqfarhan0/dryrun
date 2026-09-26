# Role: Frontend Application Assembler Agent
Context: Refer to `AGENTS.md`, `.bobrules`, `docs/architecture.md`, and the components created in `src/components/visualizer/`.

Assemble the full end-to-end Command Center application:

1. `src/app/analyze/page.tsx` (The Primary Workspace):
   - Wrap in `SimulationProvider` from `src/components/visualizer/context/SimulationContext`.
   - Top Header / Telemetry Bar:
     * Project branding: "DryRun" + "IBM Bob 2.0 Hackathon" badge
     * Live Deployment Gate status pill (APPROVED / WARNING / BLOCKED)
     * Overall Blast Score radial gauge (0-100)
     * Scenario Preset switcher dropdown (Auth Token Schema Change, DB Pool Exhaustion, Monolith to Microservices)
     * Active PR metadata chip (PR #142, author, branch target)
   - Main Canvas Area:
     * Full-screen interactive `GraphCanvas` with live `EdgeLayer` fault cascade animations
     * Floating `ImpactLegend` and floating `ScenarioTimeline` scrubber at the bottom
   - Side Drawers & Panels:
     * Floating / docked `ControlPanel` with "Run Simulation" and "Synthesize watsonx Gate" buttons
     * Slide-in `NodeDetailPanel` when any node is clicked
     * Slide-over `GateReport` when watsonx synthesis completes or when triggered
   - Real-time API wiring:
     * Connect "Run Simulation" to `/api/simulate`
     * Connect "Synthesize watsonx Gate" to `/api/gate` with real-time SSE streaming

2. `src/app/page.tsx` (Hero Landing Page):
   - Developer-first hero: "DryRun — Watch it break here. Not in production."
   - Subtitle: "Pre-deployment blast-radius & chaos simulation powered by IBM Bob 2.0 and watsonx Granite."
   - One-click launch into `/analyze` with preset selection cards:
     * Card 1: Auth Token Schema Breaking Change (Blast Score: 87 · CRITICAL)
     * Card 2: DB Connection Pool Exhaustion (Blast Score: 72 · HIGH)
     * Card 3: Custom Repository Analysis (Input GitHub URL or zip)
   - Key architectural highlights: AST Ingestion, Reverse BFS Reachability, Weighted Chaos Decay, watsonx SSE Gate Decision.

3. Verify:
   - Ensure clean client-side hydration ("use client" where appropriate).
   - Ensure `pnpm build` or `pnpm tsc --noEmit` builds cleanly with zero errors.

---

**Status:** active  **Date:** 2026-09-26

---

### 👤 User

Role: Frontend Application Assembler Agent
Context: Refer to `AGENTS.md`, `.bobrules`, `docs/architecture.md`, and the components created in `src/components/visualizer/`.

Assemble the full end-to-end Command Center application:

1. `src/app/analyze/page.tsx` (The Primary Workspace):
   - Wrap in `SimulationProvider` from `src/components/visualizer/context/SimulationContext`.
   - Top Header / Telemetry Bar:
     * Project branding: "DryRun" + "IBM Bob 2.0 Hackathon" badge
     * Live Deployment Gate status pill (APPROVED / WARNING / BLOCKED)
     * Overall Blast Score radial gauge (0-100)
     * Scenario Preset switcher dropdown (Auth Token Schema Change, DB Pool Exhaustion, Monolith to Microservices)
     * Active PR metadata chip (PR #142, author, branch target)
   - Main Canvas Area:
     * Full-screen interactive `GraphCanvas` with live `EdgeLayer` fault cascade animations
     * Floating `ImpactLegend` and floating `ScenarioTimeline` scrubber at the bottom
   - Side Drawers & Panels:
     * Floating / docked `ControlPanel` with "Run Simulation" and "Synthesize watsonx Gate" buttons
     * Slide-in `NodeDetailPanel` when any node is clicked
     * Slide-over `GateReport` when watsonx synthesis completes or when triggered
   - Real-time API wiring:
     * Connect "Run Simulation" to `/api/simulate`
     * Connect "Synthesize watsonx Gate" to `/api/gate` with real-time SSE streaming

2. `src/app/page.tsx` (Hero Landing Page):
   - Developer-first hero: "DryRun — Watch it break here. Not in production."
   - Subtitle: "Pre-deployment blast-radius & chaos simulation powered by IBM Bob 2.0 and watsonx Granite."
   - One-click launch into `/analyze` with preset selection cards:
     * Card 1: Auth Token Schema Breaking Change (Blast Score: 87 · CRITICAL)
     * Card 2: DB Connection Pool Exhaustion (Blast Score: 72 · HIGH)
     * Card 3: Custom Repository Analysis (Input GitHub URL or zip)
   - Key architectural highlights: AST Ingestion, Reverse BFS Reachability, Weighted Chaos Decay, watsonx SSE Gate Decision.

3. Verify:
   - Ensure clean client-side hydration ("use client" where appropriate).
   - Ensure `pnpm build` or `pnpm tsc --noEmit` builds cleanly with zero errors.

---

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[-] Explore existing codebase: read AGENTS.md, .bobrules, docs/architecture.md, and src/components/visualizer/
[ ] Scaffold src/app/analyze/page.tsx (Primary Workspace)
[ ] Scaffold src/app/page.tsx (Hero Landing Page)
[ ] Wire real-time API endpoints (check existing /api routes)
[ ] Run pnpm tsc --noEmit and fix all type errors


### 🤖 Assistant

> 🔧 called: list_files, list_files



> 🔧 **list_files** — .

> 🔧 **list_files** — src/components/visualizer

### 🤖 Assistant

> 🔧 called: read_file, list_files



> 🔧 **read_file** — .bobrules

> 🔧 **list_files** — src

### 🤖 Assistant

> 🔧 called: read_file, read_file, read_file



> 🔧 **read_file** — src/types/index.ts

> 🔧 **read_file** — src/components/visualizer/context/simulation-reducer.ts

> 🔧 **read_file** — src/components/visualizer/context/SimulationContext.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file, read_file



> 🔧 **read_file** — src/components/visualizer/ControlPanel.tsx

> 🔧 **read_file** — src/components/visualizer/GraphCanvas.tsx

> 🔧 **read_file** — src/components/visualizer/NodeDetailPanel.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file, read_file



> 🔧 **read_file** — src/components/visualizer/GateReport.tsx

> 🔧 **read_file** — src/components/visualizer/ImpactLegend.tsx

> 🔧 **read_file** — src/components/visualizer/ScenarioTimeline.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file, read_file



> 🔧 **read_file** — src/components/visualizer/index.ts

> 🔧 **read_file** — src/app/layout.tsx

> 🔧 **read_file** — src/app/page.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file, read_file



> 🔧 **read_file** — src/app/api/simulate/route.ts

> 🔧 **read_file** — src/app/api/gate/route.ts

> 🔧 **read_file** — src/lib/fixtures/enterprise-mesh.ts

### 🤖 Assistant

> 🔧 called: read_file, read_file

Now I have a complete picture of the codebase. Let me also quickly check the `package.json` for available dependencies:

> 🔧 **read_file** — package.json

> 🔧 **read_file** — src/lib/fixtures/enterprise-mesh.ts

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/lib/fixtures/enterprise-mesh.ts

### 🤖 Assistant

> 🔧 called: update_todo_list

Now I have everything I need. I can see that:
1. The gate API expects `simulationResult` + `blastRadiusReport` (not `chaosSimulationResultId`)
2. The `FIXTURE_SCENARIOS` only has `authSchemaBreaking` and `dbPoolExhaustion` (no `monolithMigration`)
3. The `ControlPanel.tsx` already handles simulation + gate SSE wiring

Let me now build both pages:

> 🔧 **update_todo_list** — 
[x] Explore existing codebase: read AGENTS.md, .bobrules, docs/architecture.md, and src/components/visualizer/
[-] Scaffold src/app/analyze/page.tsx (Primary Workspace)
[ ] Scaffold src/app/page.tsx (Hero Landing Page)
[ ] Wire real-time API endpoints (check existing /api routes)
[ ] Run pnpm tsc --noEmit and fix all type errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — src/app/analyze/page.tsx

### 🤖 Assistant

> 🔧 called: update_todo_list

Now write the hero landing page:

> 🔧 **update_todo_list** — 
[x] Explore existing codebase: read AGENTS.md, .bobrules, docs/architecture.md, and src/components/visualizer/
[x] Scaffold src/app/analyze/page.tsx (Primary Workspace)
[-] Scaffold src/app/page.tsx (Hero Landing Page)
[ ] Wire real-time API endpoints (check existing /api routes)
[ ] Run pnpm tsc --noEmit and fix all type errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — /**
 * DryRun — / — Hero Landing Page (Server Component)
 *
 * Developer-first hero with three preset launch cards, architectural
 * highlights, and a one-click path into /analyze.
 *
 * Fully static Server Component — no "use client" required.
 */

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  GitBranch,
  Activity,
  Shield,
  ExternalLink,
  ArrowRight,
  AlertTriangle,
  Database,
  FolderGit2,
} from 'lucide-react';
import { ENTERPRISE_MESH, FIXTURE_SCENARIOS } from '@/lib/fixtures/enterprise-mesh';

// ---------------------------------------------------------------------------
// Static derived values — computed at build-time on the server
// ---------------------------------------------------------------------------

const MESH_STATS = ENTERPRISE_MESH.stats;
const SCENARIO_COUNT = Object.keys(FIXTURE_SCENARIOS).length;

const READINESS_INDICATORS: Array<{
  label: string;
  value: string;
  status: 'ok' | 'warn' | 'info';
}> = [
  { label: 'Graph Nodes', value: String(MESH_STATS.totalNodes), status: 'ok' },
  { label: 'Dependency Edges', value: String(MESH_STATS.totalEdges), status: 'ok' },
  { label: 'Service Boundaries', value: String(MESH_STATS.serviceCount), status: 'ok' },
  { label: 'Loaded Scenarios', value: String(SCENARIO_COUNT), status: 'info' },
];

const STATUS_COLOR: Record<'ok' | 'warn' | 'info', string> = {
  ok: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  warn: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  info: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
};

// ---------------------------------------------------------------------------
// Pipeline architecture highlights
// ---------------------------------------------------------------------------

const PIPELINE_STAGES = [
  {
    icon: GitBranch,
    label: 'AST Ingestion',
    description: 'TypeScript Compiler API walks import graphs, call sites, and service boundaries.',
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/5',
  },
  {
    icon: Activity,
    label: 'Reverse BFS Reachability',
    description: 'Weighted graph traversal assigns blast-radius scores to every reachable node.',
    accent: 'text-orange-400',
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/5',
  },
  {
    icon: Zap,
    label: 'Weighted Chaos Decay',
    description: 'Fault propagation via EXPONENTIAL / LINEAR / STEP decay models across edges.',
    accent: 'text-yellow-400',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
  },
  {
    icon: Shield,
    label: 'watsonx SSE Gate',
    description: 'IBM Granite streams a risk narrative → severity → APPROVED / BLOCKED decision.',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
  },
] as const;

// ---------------------------------------------------------------------------
// Preset launch cards
// ---------------------------------------------------------------------------

interface PresetCard {
  title: string;
  subtitle: string;
  blastScore: number;
  severity: 'CRITICAL' | 'HIGH' | 'CUSTOM';
  description: string;
  href: string;
  icon: React.ElementType;
  iconColor: string;
  borderColor: string;
  bgColor: string;
  badgeColor: string;
  badgeText: string;
  cta: string;
  ctaColor: string;
}

const PRESET_CARDS: PresetCard[] = [
  {
    title: 'Auth Token Schema',
    subtitle: 'Breaking Change',
    blastScore: 87,
    severity: 'CRITICAL',
    description:
      'JWT token schema renamed fields cascade through 9 downstream services. ' +
      'Auth → API Gateway → Order → Billing → Payment.',
    href: '/analyze?preset=authSchemaBreaking',
    icon: AlertTriangle,
    iconColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    bgColor: 'bg-red-500/5',
    badgeColor: 'text-red-400 border-red-500/40 bg-red-500/10',
    badgeText: 'CRITICAL',
    cta: 'Run Auth Scenario',
    ctaColor:
      'bg-red-600 hover:bg-red-500 focus-visible:ring-red-500',
  },
  {
    title: 'DB Connection Pool',
    subtitle: 'Exhaustion',
    blastScore: 72,
    severity: 'HIGH',
    description:
      'Shared Postgres pool starved under load burst. ' +
      'Inventory DB → Order Service → Billing → Payment gateway.',
    href: '/analyze?preset=dbPoolExhaustion',
    icon: Database,
    iconColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-500/5',
    badgeColor: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
    badgeText: 'HIGH',
    cta: 'Run DB Scenario',
    ctaColor:
      'bg-orange-600 hover:bg-orange-500 focus-visible:ring-orange-500',
  },
  {
    title: 'Custom Repository',
    subtitle: 'Analysis',
    blastScore: 0,
    severity: 'CUSTOM',
    description:
      'Paste a GitHub URL or upload a zip to ingest any codebase with the AST dependency analyser.',
    href: '/analyze',
    icon: FolderGit2,
    iconColor: 'text-violet-400',
    borderColor: 'border-violet-500/30',
    bgColor: 'bg-violet-500/5',
    badgeColor: 'text-violet-400 border-violet-500/40 bg-violet-500/10',
    badgeText: 'CUSTOM',
    cta: 'Open Command Center',
    ctaColor:
      'bg-violet-600 hover:bg-violet-500 focus-visible:ring-violet-500',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BlastScoreBadge({ score }: { score: number }): React.JSX.Element {
  if (score === 0) return <></>;

  let color = '#10b981';
  if (score >= 80) color = '#ef4444';
  else if (score >= 60) color = '#f97316';
  else if (score >= 40) color = '#facc15';

  const RADIUS = 14;
  const STROKE = 3;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - score / 100);
  const cx = RADIUS + STROKE;
  const cy = RADIUS + STROKE;
  const size = (RADIUS + STROKE) * 2;

  return (
    <div className="flex items-center gap-1.5">
      <svg width={size} height={size} aria-label={`Blast score ${score}`}>
        <circle cx={cx} cy={cy} r={RADIUS} fill="none" stroke="#1e293b" strokeWidth={STROKE} />
        <circle
          cx={cx}
          cy={cy}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="8"
          fontWeight="700"
          fontFamily='"JetBrains Mono", monospace'
        >
          {score}
        </text>
      </svg>
      <span
        className="text-xs text-slate-400"
        style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
      >
        Blast Score
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* ── Nav bar ── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-20">
        <span
          className="font-mono text-xl font-bold text-slate-100"
          style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
        >
          Dry<span className="text-violet-500">Run</span>
        </span>
        <div className="flex items-center gap-3">
          <span
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-400 text-xs font-semibold tracking-widest uppercase"
            style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
          >
            <Zap size={10} />
            IBM Bob 2.0 · Hackathon
          </span>
          <Link
            href="/analyze"
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            Launch
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        {/* Eyebrow tag */}
        <span
          className="inline-flex items-center gap-1.5 mb-6 px-3 py-1 rounded-full border border-slate-700 bg-slate-800 text-slate-400 text-xs tracking-widest uppercase"
          style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
        >
          Pre-deployment · Blast Radius · Chaos Simulation
        </span>

        {/* Main headline */}
        <h1
          className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-100 mb-5 leading-[1.1]"
          style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
        >
          Watch it break here.
          <br />
          <span className="text-violet-500">Not in production.</span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          <span className="text-slate-200 font-semibold">DryRun</span> simulates fault propagation
          through your live dependency graph before a single byte ships — powered by{' '}
          <span className="text-violet-400 font-semibold">IBM Bob 2.0</span> and{' '}
          <span className="text-sky-400 font-semibold">watsonx Granite</span>.
        </p>

        {/* Primary CTA */}
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition-colors shadow-lg shadow-violet-900/40 focus-visible:outline focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <Zap size={18} />
          Open Command Center
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* ── Preset Launch Cards ── */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <h2
          className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5 text-center"
          style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
        >
          Choose a Scenario
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PRESET_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className={`group flex flex-col rounded-xl border p-5 transition-all hover:border-opacity-60 hover:-translate-y-0.5 focus-visible:outline focus-visible:ring-2 focus-visible:ring-violet-400 ${card.borderColor} ${card.bgColor}`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        size={16}
                        className={`${card.iconColor} shrink-0`}
                        aria-hidden="true"
                      />
                      <span
                        className={`px-1.5 py-0.5 rounded border text-xs font-semibold ${card.badgeColor}`}
                        style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
                      >
                        {card.badgeText}
                      </span>
                    </div>
                    <h3
                      className="text-sm font-bold text-slate-200 leading-tight"
                      style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
                    >
                      {card.title}
                    </h3>
                    <p
                      className="text-xs text-slate-500"
                      style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
                    >
                      {card.subtitle}
                    </p>
                  </div>
                  {card.blastScore > 0 && <BlastScoreBadge score={card.blastScore} />}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-4">
                  {card.description}
                </p>

                {/* CTA */}
                <div
                  className={`mt-auto flex items-center justify-center gap-2 w-full py-2 rounded-md text-white text-sm font-semibold transition-colors ${card.ctaColor} focus-visible:ring-2`}
                >
                  {card.cta}
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Readiness indicators ── */}
      <section className="px-6 pb-16 max-w-3xl mx-auto">
        <h2
          className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 text-center"
          style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
        >
          System Readiness
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {READINESS_INDICATORS.map(({ label, value, status }) => (
            <li
              key={label}
              className={`flex flex-col items-center justify-center rounded-lg border px-4 py-3 font-mono text-sm gap-1 ${STATUS_COLOR[status]}`}
            >
              <span className="text-xl font-bold">{value}</span>
              <span className="text-xs text-slate-500">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Architecture highlights ── */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <h2
          className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5 text-center"
          style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
        >
          How it works
        </h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PIPELINE_STAGES.map(({ icon: Icon, label, description, accent, border, bg }, i) => (
            <li
              key={label}
              className={`flex items-start gap-3 rounded-lg border p-4 ${border} ${bg}`}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-700 text-xs text-slate-500 font-mono mt-0.5"
                style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
              >
                {i + 1}
              </span>
              <Icon size={16} className={`${accent} mt-0.5 shrink-0`} aria-hidden="true" />
              <div>
                <p
                  className="text-sm font-semibold text-slate-200 mb-0.5"
                  style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
                >
                  {label}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Footer ── */}
      <footer className="flex flex-col items-center gap-2 px-6 py-8 border-t border-slate-800">
        <p
          className="text-xs text-slate-600"
          style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
        >
          DryRun · IBM Bob 2.0 Hackathon · Release Readiness &amp; Deployment Processes
        </p>
        <Link
          href="/analyze"
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-violet-400 transition-colors"
        >
          <ExternalLink size={11} />
          Open Command Center
        </Link>
      </footer>
    </main>
  );
}


### 🤖 Assistant

> 🔧 called: update_todo_list

Now let's run the type check:

> 🔧 **update_todo_list** — 
[x] Explore existing codebase: read AGENTS.md, .bobrules, docs/architecture.md, and src/components/visualizer/
[x] Scaffold src/app/analyze/page.tsx (Primary Workspace)
[x] Scaffold src/app/page.tsx (Hero Landing Page)
[x] Wire real-time API endpoints (check existing /api routes)
[-] Run pnpm tsc --noEmit and fix all type errors


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — pnpm tsc --noEmit 2>&1

### 🤖 Assistant

> 🔧 called: execute_command

Zero type errors. Let's also verify the build:

> 🔧 **execute_command** — pnpm build 2>&1

### 🤖 Assistant

> 🔧 called: update_todo_list

Clean build — zero errors, zero warnings. All 8 pages generated successfully.

> 🔧 **update_todo_list** — 
[x] Explore existing codebase: read AGENTS.md, .bobrules, docs/architecture.md, and src/components/visualizer/
[x] Scaffold src/app/analyze/page.tsx (Primary Workspace)
[x] Scaffold src/app/page.tsx (Hero Landing Page)
[x] Wire real-time API endpoints (check existing /api routes)
[x] Run pnpm tsc --noEmit and fix all type errors


### 🤖 Assistant

Both pages are assembled, type-safe, and the production build passes cleanly. Here's what was built:

---

## What was delivered

### [`src/app/analyze/page.tsx`](src/app/analyze/page.tsx) — Primary Command Center

**Layout:** `"use client"` shell wrapping `SimulationProvider`, with a top telemetry bar, a main canvas column, and a right sidebar — all sized via `h-screen / flex-1 / min-h-0` to fill the full viewport without overflow.

| Zone | Contents |
|---|---|
| **Telemetry Bar** | DryRun branding + IBM Bob 2.0 badge · PR #142 chip (author, branch) · `PresetSwitcher` dropdown (all 3 presets including monolithMigration) · `HeaderBlastGauge` radial SVG · `GateStatusPill` (live PENDING → SIMULATING → EVALUATING → APPROVED/BLOCKED) |
| **Canvas** | [`GraphCanvas`](src/components/visualizer/GraphCanvas.tsx) with live `EdgeLayer` overlay — `activeNodeIds` derived from `criticalFailureChain` slice at `currentStep` — empty-state placeholder when no graph loaded |
| **Floating bar** | [`ImpactLegend`](src/components/visualizer/ImpactLegend.tsx) (pinned bottom-left) + [`ScenarioTimeline`](src/components/visualizer/ScenarioTimeline.tsx) scrubber (pinned bottom-right), `animOffset` clock wired via `useCallback` |
| **Right sidebar** | [`ControlPanel`](src/components/visualizer/ControlPanel.tsx) (already contains "Run Simulation" → fixture load → `/api/simulate` and "Synthesize watsonx Gate" → SSE stream from `/api/gate`) · [`NodeDetailPanel`](src/components/visualizer/NodeDetailPanel.tsx) slides in when any node is selected |
| **Slide-over** | [`GateReport`](src/components/visualizer/GateReport.tsx) auto-opens when `phase` transitions to `STREAMING` or `COMPLETE`; manually toggled via the gate status pill |

### [`src/app/page.tsx`](src/app/page.tsx) — Hero Landing Page

**Pure Server Component** (no `"use client"`). Static values derived from `ENTERPRISE_MESH` fixture at build time.

- Sticky nav bar with DryRun branding, IBM Bob 2.0 badge, and a **Launch** CTA
- Hero headline: *"Watch it break here. Not in production."* + subtitle naming IBM Bob 2.0 and watsonx Granite
- **3 preset launch cards** with inline blast-score SVG gauges:
  - Auth Token Schema Breaking Change (Score: 87 · CRITICAL) → `/analyze?preset=authSchemaBreaking`
  - DB Connection Pool Exhaustion (Score: 72 · HIGH) → `/analyze?preset=dbPoolExhaustion`
  - Custom Repository Analysis (Score: custom) → `/analyze`
- System Readiness indicator grid (nodes / edges / services / scenarios)
- 4-step architecture pipeline (AST Ingestion → Reverse BFS → Weighted Chaos Decay → watsonx SSE Gate)

### Build results
```
✓ Compiled successfully
/ (Static)      109 kB
/analyze (Static) 123 kB
```