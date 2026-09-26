# Role: Frontend Design System & UI Components Agent
Context: Refer to `AGENTS.md`, `.bobrules`, `src/types/index.ts`, and `src/lib/demo-data.ts`.

We are implementing the complete high-impact design system and onboarding screens for DryRun:

1. Global Styles & Design System (`src/app/globals.css`):
   - Define CSS custom properties for dark and light themes:
     * Dark theme: `--background: 240 10% 3.9%`, `--foreground: 0 0% 98%`, `--neo-button: 262 83% 58%`, `--neo-button-hover: 262 83% 65%`, `--border: 240 3.7% 15.9%`
     * Status tokens: `--status-ok: 142 71% 45%`, `--status-warn: 38 92% 50%`, `--status-danger: 0 84% 60%`
   - Setup retro-brutalist / De Stijl geometric borders, micro-grid backgrounds, scanline effects, custom glassmorphic panels, and glowing status pills.
   - Include custom utility classes for badges, cards, buttons, and animations.

2. Navigation Header (`src/components/TopBar.tsx`):
   - Wordmark: "DryRun" with branded colors + "IBM Bob 2.0" pill badge.
   - Live system status dot with pulse animation (`resolveStatusClass`).
   - Project name indicator chip with click-to-reset.
   - Dynamic Risk Score pill (Critical, High, Medium, Low, Zero Risk).
   - Theme toggle button (Dark / Light mode) with Sun/Moon icons.

3. Onboarding & Upload Screen (`src/components/UploadScreen.tsx`):
   - Hero Section:
     * Headline: "Watch it break here. Not in production."
     * Subtitle: "Simulate failure modes, calculate blast radius, and enforce deployment gates before code hits staging."
   - Target Codebase Ingestion:
     * GitHub repository URL input with "Inspect Repo" action.
     * Drag-and-drop ZIP file upload zone with particle hover effect and file size validator.
   - Quick Demo Scenarios (Interactive Cards):
     * PayStream Gateway (FinTech, score: 86, critical)
     * Nexus Health Core (HealthTech, score: 74, high)
     * CloudScale Ingress (DevOps, score: 62, medium)
     * One-click click-through to immediately load scenario into simulation.
   - Architecture highlights grid showcasing static AST parsing, reverse BFS reachability, chaos fault injection, and watsonx Granite gates.

4. Intermediate Analysis Screen (`src/components/ProcessingScreen.tsx`):
   - Multi-stage progress indicator:
     * Stage 1: Reading Manifest & Package Signatures
     * Stage 2: Parsing AST & Traversing Dependency Tree
     * Stage 3: Calculating Blast Radius & Simulating Cascading Failures
     * Stage 4: Synthesizing watsonx.ai Granite Deployment Gate
   - Auto-scrolling terminal event logs with timestamped diagnostics.
   - Detected tech stack chip badges (Go, Kafka, Redis, PostgreSQL, TypeScript, etc.).

5. Re-simulation Loading Overlay (`src/components/AnalyzingOverlay.tsx`):
   - Full-screen glassmorphic loading overlay with dual-ring spinning loader and simulation status message.

Ensure zero `any`, strict TypeScript types, and verify with `pnpm tsc --noEmit`.

---

**Status:** active  **Date:** 2026-09-26

---

### 👤 User

Role: Frontend Design System & UI Components Agent
Context: Refer to `AGENTS.md`, `.bobrules`, `src/types/index.ts`, and `src/lib/demo-data.ts`.

We are implementing the complete high-impact design system and onboarding screens for DryRun:

1. Global Styles & Design System (`src/app/globals.css`):
   - Define CSS custom properties for dark and light themes:
     * Dark theme: `--background: 240 10% 3.9%`, `--foreground: 0 0% 98%`, `--neo-button: 262 83% 58%`, `--neo-button-hover: 262 83% 65%`, `--border: 240 3.7% 15.9%`
     * Status tokens: `--status-ok: 142 71% 45%`, `--status-warn: 38 92% 50%`, `--status-danger: 0 84% 60%`
   - Setup retro-brutalist / De Stijl geometric borders, micro-grid backgrounds, scanline effects, custom glassmorphic panels, and glowing status pills.
   - Include custom utility classes for badges, cards, buttons, and animations.

2. Navigation Header (`src/components/TopBar.tsx`):
   - Wordmark: "DryRun" with branded colors + "IBM Bob 2.0" pill badge.
   - Live system status dot with pulse animation (`resolveStatusClass`).
   - Project name indicator chip with click-to-reset.
   - Dynamic Risk Score pill (Critical, High, Medium, Low, Zero Risk).
   - Theme toggle button (Dark / Light mode) with Sun/Moon icons.

3. Onboarding & Upload Screen (`src/components/UploadScreen.tsx`):
   - Hero Section:
     * Headline: "Watch it break here. Not in production."
     * Subtitle: "Simulate failure modes, calculate blast radius, and enforce deployment gates before code hits staging."
   - Target Codebase Ingestion:
     * GitHub repository URL input with "Inspect Repo" action.
     * Drag-and-drop ZIP file upload zone with particle hover effect and file size validator.
   - Quick Demo Scenarios (Interactive Cards):
     * PayStream Gateway (FinTech, score: 86, critical)
     * Nexus Health Core (HealthTech, score: 74, high)
     * CloudScale Ingress (DevOps, score: 62, medium)
     * One-click click-through to immediately load scenario into simulation.
   - Architecture highlights grid showcasing static AST parsing, reverse BFS reachability, chaos fault injection, and watsonx Granite gates.

4. Intermediate Analysis Screen (`src/components/ProcessingScreen.tsx`):
   - Multi-stage progress indicator:
     * Stage 1: Reading Manifest & Package Signatures
     * Stage 2: Parsing AST & Traversing Dependency Tree
     * Stage 3: Calculating Blast Radius & Simulating Cascading Failures
     * Stage 4: Synthesizing watsonx.ai Granite Deployment Gate
   - Auto-scrolling terminal event logs with timestamped diagnostics.
   - Detected tech stack chip badges (Go, Kafka, Redis, PostgreSQL, TypeScript, etc.).

5. Re-simulation Loading Overlay (`src/components/AnalyzingOverlay.tsx`):
   - Full-screen glassmorphic loading overlay with dual-ring spinning loader and simulation status message.

Ensure zero `any`, strict TypeScript types, and verify with `pnpm tsc --noEmit`.

---

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[-] Read existing project files (AGENTS.md, .bobrules, src/types/index.ts, src/lib/demo-data.ts, existing globals.css)
[ ] Implement Global Styles & Design System (src/app/globals.css)
[ ] Implement Navigation Header (src/components/TopBar.tsx)
[ ] Implement Onboarding & Upload Screen (src/components/UploadScreen.tsx)
[ ] Implement Intermediate Analysis Screen (src/components/ProcessingScreen.tsx)
[ ] Implement Re-simulation Loading Overlay (src/components/AnalyzingOverlay.tsx)
[ ] Run TypeScript type check (pnpm tsc --noEmit)


### 🤖 Assistant

> 🔧 called: read_file, read_file, read_file, read_file



> 🔧 **read_file** — .bobrules

> 🔧 **read_file** — src/types/index.ts

> 🔧 **read_file** — src/lib/demo-data.ts

> 🔧 **read_file** — src/app/globals.css

### 🤖 Assistant

> 🔧 called: list_files, read_file

Now let me check existing components and project structure:

> 🔧 **list_files** — src/components

> 🔧 **read_file** — src/app/page.tsx

### 🤖 Assistant

> 🔧 called: glob, read_file



> 🔧 **read_file** — package.json

> 🔧 **glob** — src/app/analyze/**/*.tsx

### 🤖 Assistant

> 🔧 called: glob, read_file



> 🔧 **read_file** — tsconfig.json

> 🔧 **glob** — src/app/**/*.tsx

### 🤖 Assistant

> 🔧 called: glob, glob



> 🔧 **glob** — src/**/*.tsx

> 🔧 **glob** — src/**/*.ts

### 🤖 Assistant

> 🔧 called: list_files



> 🔧 **list_files** — src

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/app/analyze/page.tsx

### 🤖 Assistant

> 🔧 called: update_todo_list

Now I have a thorough understanding of the codebase. Let me implement all the files:

> 🔧 **update_todo_list** — 
[x] Read existing project files (AGENTS.md, .bobrules, src/types/index.ts, src/lib/demo-data.ts, existing globals.css)
[-] Implement Global Styles & Design System (src/app/globals.css)
[ ] Implement Navigation Header (src/components/TopBar.tsx)
[ ] Implement Onboarding & Upload Screen (src/components/UploadScreen.tsx)
[ ] Implement Intermediate Analysis Screen (src/components/ProcessingScreen.tsx)
[ ] Implement Re-simulation Loading Overlay (src/components/AnalyzingOverlay.tsx)
[ ] Run TypeScript type check (pnpm tsc --noEmit)


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — src/app/globals.css

### 🤖 Assistant

> 🔧 called: update_todo_list

Now implement all four components simultaneously:

> 🔧 **update_todo_list** — 
[x] Read existing project files (AGENTS.md, .bobrules, src/types/index.ts, src/lib/demo-data.ts, existing globals.css)
[x] Implement Global Styles & Design System (src/app/globals.css)
[-] Implement Navigation Header (src/components/TopBar.tsx)
[-] Implement Onboarding & Upload Screen (src/components/UploadScreen.tsx)
[-] Implement Intermediate Analysis Screen (src/components/ProcessingScreen.tsx)
[-] Implement Re-simulation Loading Overlay (src/components/AnalyzingOverlay.tsx)
[ ] Run TypeScript type check (pnpm tsc --noEmit)


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — src/components/TopBar.tsx

### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — 'use client';

/**
 * DryRun — UploadScreen
 * Onboarding & codebase ingestion screen.
 *
 * Hero → GitHub URL input → ZIP drop-zone → Quick Demo scenarios → Architecture highlights.
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  Github,
  Upload,
  Zap,
  GitBranch,
  Activity,
  Shield,
  ArrowRight,
  FolderArchive,
  AlertTriangle,
  Heart,
  Server,
} from 'lucide-react';
import type { DemoScenario } from '@/lib/demo-data';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT_MONO: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
};

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB

interface ArchHighlight {
  icon: React.ElementType;
  label: string;
  body: string;
  accent: string;
  border: string;
  bg: string;
}

const ARCH_HIGHLIGHTS: ArchHighlight[] = [
  {
    icon: GitBranch,
    label: 'Static AST Parsing',
    body: 'TypeScript Compiler API extracts every import, re-export, and HTTP call site without executing code.',
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/5',
  },
  {
    icon: Activity,
    label: 'Reverse BFS Reachability',
    body: 'Weighted reverse BFS assigns blast-radius scores to every node reachable from your changed files.',
    accent: 'text-orange-400',
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/5',
  },
  {
    icon: Zap,
    label: 'Chaos Fault Injection',
    body: 'SERVICE_OUTAGE, LATENCY_P99_SPIKE, ERROR_RATE_BREACH and more — propagated via exponential decay.',
    accent: 'text-yellow-400',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
  },
  {
    icon: Shield,
    label: 'watsonx Granite Gate',
    body: 'IBM Granite streams a risk narrative and issues a binary APPROVED / BLOCKED release decision.',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
  },
];

// Scenario severity → icon mapping
const SEVERITY_ICON: Record<string, React.ElementType> = {
  CRITICAL: AlertTriangle,
  HIGH: Heart,
  MEDIUM: Server,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScenarioCard({
  scenario,
  onSelect,
}: {
  scenario: DemoScenario;
  onSelect: (scenario: DemoScenario) => void;
}): React.JSX.Element {
  const score = scenario.data.aiResult.risk_score;
  const Icon = SEVERITY_ICON[scenario.tag] ?? Zap;

  let ringColor = 'text-emerald-400';
  if (score >= 80) ringColor = 'text-red-400';
  else if (score >= 60) ringColor = 'text-orange-400';
  else if (score >= 35) ringColor = 'text-yellow-400';

  const RADIUS = 16;
  const STROKE = 3;
  const CIRC = 2 * Math.PI * RADIUS;
  const offset = CIRC * (1 - score / 100);
  const cx = RADIUS + STROKE;
  const cy = RADIUS + STROKE;
  const size = (RADIUS + STROKE) * 2;

  return (
    <button
      type="button"
      onClick={() => onSelect(scenario)}
      className="group w-full text-left rounded-xl border border-slate-700 bg-slate-800/60
                 hover:border-violet-500/50 hover:bg-slate-800
                 transition-all duration-200 hover:-translate-y-0.5
                 focus-visible:outline focus-visible:ring-2 focus-visible:ring-violet-500
                 p-4 card-surface-hover corner-cut"
      aria-label={`Load scenario: ${scenario.name}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Icon size={15} className={ringColor} aria-hidden="true" />
          <span
            className={`px-1.5 py-0.5 rounded border text-[10px] font-bold tracking-wide ${scenario.badgeClass}`}
            style={FONT_MONO}
          >
            {scenario.tag}
          </span>
        </div>

        {/* Circular score gauge */}
        <svg
          width={size}
          height={size}
          aria-label={`Blast score ${score}`}
          className="shrink-0"
        >
          <circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            stroke="#1e293b"
            strokeWidth={STROKE}
          />
          <circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            className={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill="currentColor"
            className={ringColor}
            fontSize="8"
            fontWeight="700"
            fontFamily='"JetBrains Mono", monospace'
          >
            {score}
          </text>
        </svg>
      </div>

      {/* Title + subtitle */}
      <p
        className="text-sm font-bold text-slate-200 mb-0.5 group-hover:text-white transition-colors"
        style={FONT_MONO}
      >
        {scenario.name}
      </p>
      <p className="text-xs text-slate-500 leading-relaxed mb-3">{scenario.subtitle}</p>

      {/* CTA row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium" style={FONT_MONO}>
          {scenario.data.stack.slice(0, 3).join(' · ')}
        </span>
        <span className="flex items-center gap-1 text-xs text-violet-400 font-semibold group-hover:text-violet-300">
          Load Scenario
          <ArrowRight
            size={11}
            className="group-hover:translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
        </span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface UploadScreenProps {
  scenarios: DemoScenario[];
  onSelectScenario: (scenario: DemoScenario) => void;
  onSubmitUrl: (url: string) => void;
  onUploadFile: (file: File) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function UploadScreen({
  scenarios,
  onSelectScenario,
  onSubmitUrl,
  onUploadFile,
}: UploadScreenProps): React.JSX.Element {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── URL submit ──
  const handleUrlSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      const trimmed = repoUrl.trim();
      if (!trimmed) {
        setUrlError('Repository URL cannot be empty.');
        return;
      }
      try {
        new URL(trimmed);
      } catch {
        setUrlError('Please enter a valid URL (e.g. https://github.com/org/repo).');
        return;
      }
      setUrlError(null);
      onSubmitUrl(trimmed);
    },
    [repoUrl, onSubmitUrl],
  );

  // ── File validation + upload ──
  const handleFile = useCallback(
    (file: File): void => {
      if (!file.name.endsWith('.zip')) {
        setFileError('Only .zip archives are supported.');
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setFileError(`File exceeds the 50 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
        return;
      }
      setFileError(null);
      onUploadFile(file);
    },
    [onUploadFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setDragActive(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((): void => {
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const selected = e.target.files?.[0];
      if (selected) handleFile(selected);
    },
    [handleFile],
  );

  return (
    <div className="min-h-screen bg-slate-950 bg-micro-grid overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-5 pt-14 pb-20">

        {/* ── Hero ── */}
        <section className="text-center mb-14 animate-fade-up">
          <span
            className="inline-flex items-center gap-1.5 mb-5 px-3 py-1 rounded-full
                       border border-slate-700 bg-slate-900 text-slate-400
                       text-[10px] tracking-widest uppercase"
            style={FONT_MONO}
          >
            Pre-deployment · Blast Radius · Chaos Simulation
          </span>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight
                       text-slate-100 leading-[1.1] mb-5"
            style={FONT_MONO}
          >
            Watch it break here.
            <br />
            <span className="text-violet-500">Not in production.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Simulate failure modes, calculate blast radius, and enforce deployment gates
            before code hits staging.
          </p>
        </section>

        {/* ── Target Codebase Ingestion ── */}
        <section
          className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/70
                     p-6 sm:p-8 glass-panel"
          aria-label="Target codebase ingestion"
        >
          <h2
            className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5"
            style={FONT_MONO}
          >
            Target Codebase
          </h2>

          {/* GitHub URL */}
          <form onSubmit={handleUrlSubmit} className="mb-6" noValidate>
            <label
              htmlFor="repo-url"
              className="block text-xs font-semibold text-slate-400 mb-1.5"
              style={FONT_MONO}
            >
              GitHub Repository URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Github
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  id="repo-url"
                  type="url"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    setUrlError(null);
                  }}
                  placeholder="https://github.com/org/repo"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700
                             text-slate-200 text-sm placeholder-slate-600
                             focus:outline-none focus:border-violet-500
                             transition-colors"
                  style={FONT_MONO}
                  aria-describedby={urlError ? 'url-error' : undefined}
                  aria-invalid={urlError !== null}
                />
              </div>
              <button
                type="submit"
                className="neo-btn px-5 py-2.5 rounded-lg text-sm shrink-0"
              >
                Inspect Repo
              </button>
            </div>
            {urlError !== null && (
              <p
                id="url-error"
                className="mt-1.5 text-xs text-red-400"
                style={FONT_MONO}
                role="alert"
              >
                {urlError}
              </p>
            )}
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600" style={FONT_MONO}>
              OR
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Drop .zip archive here or click to browse"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
            }}
            className={`drop-zone relative rounded-xl p-10 flex flex-col items-center
                        justify-center gap-3 cursor-pointer select-none
                        ${dragActive ? 'drag-active' : ''}`}
          >
            {/* Floating particle dots */}
            {dragActive && (
              <>
                <span
                  className="absolute top-4 left-8 w-1.5 h-1.5 rounded-full bg-violet-500/60 animate-particle"
                  style={{ animationDelay: '0s' }}
                  aria-hidden="true"
                />
                <span
                  className="absolute top-6 right-12 w-1 h-1 rounded-full bg-violet-400/50 animate-particle"
                  style={{ animationDelay: '0.4s' }}
                  aria-hidden="true"
                />
                <span
                  className="absolute bottom-5 left-1/3 w-1.5 h-1.5 rounded-full bg-violet-500/40 animate-particle"
                  style={{ animationDelay: '0.8s' }}
                  aria-hidden="true"
                />
              </>
            )}

            <FolderArchive
              size={32}
              className={`transition-colors ${dragActive ? 'text-violet-400' : 'text-slate-600'}`}
              aria-hidden="true"
            />
            <div className="text-center">
              <p
                className={`text-sm font-semibold mb-0.5 transition-colors ${dragActive ? 'text-violet-300' : 'text-slate-400'}`}
                style={FONT_MONO}
              >
                {dragActive ? 'Release to upload' : 'Drag & drop .zip archive'}
              </p>
              <p className="text-xs text-slate-600" style={FONT_MONO}>
                or click to browse · max 50 MB
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700">
              <Upload size={12} className="text-slate-500" aria-hidden="true" />
              <span className="text-xs text-slate-500" style={FONT_MONO}>
                .zip only
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              className="sr-only"
              onChange={handleInputChange}
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>

          {fileError !== null && (
            <p
              className="mt-2 text-xs text-red-400"
              style={FONT_MONO}
              role="alert"
            >
              {fileError}
            </p>
          )}
        </section>

        {/* ── Quick Demo Scenarios ── */}
        <section className="mb-12" aria-label="Quick demo scenarios">
          <h2
            className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4"
            style={FONT_MONO}
          >
            Quick Demo Scenarios
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {scenarios.map((s) => (
              <ScenarioCard key={s.id} scenario={s} onSelect={onSelectScenario} />
            ))}
          </div>
        </section>

        {/* ── Architecture Highlights ── */}
        <section aria-label="Architecture highlights">
          <h2
            className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4"
            style={FONT_MONO}
          >
            How It Works
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ARCH_HIGHLIGHTS.map(({ icon: Icon, label, body, accent, border, bg }, idx) => (
              <li
                key={label}
                className={`flex items-start gap-3 rounded-xl border p-4 ${border} ${bg}`}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                             border border-slate-700 text-xs text-slate-500 mt-0.5"
                  style={FONT_MONO}
                  aria-hidden="true"
                >
                  {idx + 1}
                </span>
                <Icon
                  size={15}
                  className={`${accent} mt-0.5 shrink-0`}
                  aria-hidden="true"
                />
                <div>
                  <p
                    className="text-sm font-semibold text-slate-200 mb-1"
                    style={FONT_MONO}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — 'use client';

/**
 * DryRun — ProcessingScreen
 * Multi-stage analysis progress display with:
 * - 4-stage indicator bar
 * - Auto-scrolling timestamped terminal event log
 * - Detected tech-stack chip badges
 */

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Circle, Terminal } from 'lucide-react';
import type { SimulationEvent, EventType } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT_MONO: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
};

// Four canonical pipeline stages
const PIPELINE_STAGES = [
  'Reading Manifest & Package Signatures',
  'Parsing AST & Traversing Dependency Tree',
  'Calculating Blast Radius & Simulating Cascading Failures',
  'Synthesizing watsonx.ai Granite Deployment Gate',
] as const;

type PipelineStage = (typeof PIPELINE_STAGES)[number];

// ---------------------------------------------------------------------------
// Helper — event type → colour
// ---------------------------------------------------------------------------

function eventTypeClass(type: EventType): string {
  switch (type) {
    case 'danger':
      return 'text-red-400';
    case 'warn':
      return 'text-amber-400';
    case 'normal':
    default:
      return 'text-slate-400';
  }
}

function eventTypePrefix(type: EventType): string {
  switch (type) {
    case 'danger':
      return '✖';
    case 'warn':
      return '⚠';
    case 'normal':
    default:
      return '›';
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StageIndicator({
  stages,
  activeIndex,
  completedCount,
}: {
  stages: readonly PipelineStage[];
  activeIndex: number;
  completedCount: number;
}): React.JSX.Element {
  return (
    <ol className="space-y-2.5" aria-label="Analysis pipeline stages">
      {stages.map((label, idx) => {
        const isDone = idx < completedCount;
        const isActive = idx === activeIndex;
        const isPending = !isDone && !isActive;

        return (
          <li
            key={label}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 border transition-all duration-300 ${
              isActive
                ? 'border-violet-500/40 bg-violet-500/8'
                : isDone
                  ? 'border-emerald-500/25 bg-emerald-500/5'
                  : 'border-slate-800 bg-transparent opacity-50'
            }`}
          >
            {/* Status icon */}
            {isDone ? (
              <CheckCircle2
                size={15}
                className="text-emerald-500 shrink-0"
                aria-hidden="true"
              />
            ) : isActive ? (
              <Loader2
                size={15}
                className="text-violet-400 shrink-0 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Circle
                size={15}
                className="text-slate-700 shrink-0"
                aria-hidden="true"
              />
            )}

            {/* Stage number */}
            <span
              className={`text-[10px] font-bold w-5 shrink-0 ${isDone ? 'text-emerald-500' : isActive ? 'text-violet-400' : 'text-slate-700'}`}
              style={FONT_MONO}
              aria-hidden="true"
            >
              {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
            </span>

            {/* Label */}
            <span
              className={`text-xs font-medium leading-tight ${isDone ? 'text-emerald-400' : isActive ? 'text-slate-200' : 'text-slate-600'}`}
              style={FONT_MONO}
            >
              {label}
            </span>

            {/* Active progress bar */}
            {isActive && (
              <div className="ml-auto h-1 w-20 rounded-full bg-slate-800 overflow-hidden shrink-0">
                <div className="h-full bg-violet-500 rounded-full animate-shimmer" />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------

function TerminalLog({ events }: { events: SimulationEvent[] }): React.JSX.Element {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div
      className="terminal-pane rounded-xl h-52 overflow-y-auto p-4"
      role="log"
      aria-live="polite"
      aria-label="Analysis event log"
    >
      {events.length === 0 ? (
        <p className="text-slate-700 text-xs" style={FONT_MONO}>
          Waiting for events…
        </p>
      ) : (
        events.map((ev, idx) => (
          <div
            key={idx}
            className={`flex gap-2 mb-1 text-xs leading-relaxed ${eventTypeClass(ev.type)}`}
            style={FONT_MONO}
          >
            <span className="text-slate-700 shrink-0">[{ev.time}]</span>
            <span
              className={`shrink-0 ${eventTypeClass(ev.type)}`}
              aria-hidden="true"
            >
              {eventTypePrefix(ev.type)}
            </span>
            <span>{ev.event}</span>
          </div>
        ))
      )}
      {/* Blinking cursor */}
      <div className="flex items-center gap-1 mt-1">
        <span className="text-xs text-slate-700" style={FONT_MONO}>
          $
        </span>
        <span
          className="inline-block w-2 h-3.5 bg-violet-500 animate-blink"
          aria-hidden="true"
        />
      </div>
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}

// ---------------------------------------------------------------------------

function StackChips({ stack }: { stack: string[] }): React.JSX.Element {
  const CHIP_COLORS: Record<string, string> = {
    Go: 'text-sky-400 border-sky-500/30 bg-sky-500/8',
    Kafka: 'text-orange-400 border-orange-500/30 bg-orange-500/8',
    Redis: 'text-red-400 border-red-500/30 bg-red-500/8',
    PostgreSQL: 'text-blue-400 border-blue-500/30 bg-blue-500/8',
    TypeScript: 'text-blue-300 border-blue-400/30 bg-blue-400/8',
    'Node.js': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/8',
    Kubernetes: 'text-violet-400 border-violet-500/30 bg-violet-500/8',
    Docker: 'text-sky-400 border-sky-500/30 bg-sky-500/8',
    Prometheus: 'text-orange-300 border-orange-400/30 bg-orange-400/8',
    'AWS Kinesis': 'text-amber-400 border-amber-500/30 bg-amber-500/8',
    S3: 'text-amber-300 border-amber-400/30 bg-amber-400/8',
  };

  const fallback = 'text-slate-400 border-slate-600/40 bg-slate-700/20';

  return (
    <div
      className="flex flex-wrap gap-2"
      role="list"
      aria-label="Detected technology stack"
    >
      {stack.map((tech) => (
        <span
          key={tech}
          role="listitem"
          className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-semibold tracking-wide ${CHIP_COLORS[tech] ?? fallback}`}
          style={FONT_MONO}
        >
          {tech}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ProcessingScreenProps {
  /** Label shown at the top (e.g. project name or repo URL) */
  targetLabel: string;
  /** 0-based index of the currently running stage */
  activeStageIndex: number;
  /** How many stages are fully done */
  completedStageCount: number;
  /** Live event feed emitted by the analysis pipeline */
  events: SimulationEvent[];
  /** Detected tech stack — shown as coloured chips */
  detectedStack: string[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProcessingScreen({
  targetLabel,
  activeStageIndex,
  completedStageCount,
  events,
  detectedStack,
}: ProcessingScreenProps): React.JSX.Element {
  // Elapsed timer (seconds)
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const overallProgress = Math.round(
    ((completedStageCount + (activeStageIndex >= completedStageCount ? 0.5 : 0)) /
      PIPELINE_STAGES.length) *
      100,
  );

  return (
    <div
      className="min-h-screen bg-slate-950 bg-micro-grid flex flex-col items-center
                 justify-start px-5 pt-12 pb-20"
    >
      <div className="w-full max-w-2xl animate-fade-up">
        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full border-2 border-violet-500/30 flex items-center
                          justify-center bg-violet-500/10"
            >
              <Terminal size={18} className="text-violet-400" aria-hidden="true" />
            </div>
            {/* Outer pulse ring */}
            <span
              className="absolute inset-0 rounded-full border border-violet-500/20 animate-ping opacity-60"
              aria-hidden="true"
            />
          </div>
          <div>
            <h1
              className="text-base font-bold text-slate-100 leading-tight"
              style={FONT_MONO}
            >
              Analyzing codebase…
            </h1>
            <p
              className="text-xs text-slate-500 truncate max-w-xs"
              style={FONT_MONO}
              title={targetLabel}
            >
              {targetLabel}
            </p>
          </div>

          {/* Elapsed timer */}
          <span
            className="ml-auto text-xs text-slate-600 tabular-nums"
            style={FONT_MONO}
            aria-live="off"
          >
            {elapsed}s
          </span>
        </div>

        {/* ── Overall progress bar ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-600 uppercase tracking-widest" style={FONT_MONO}>
              Overall Progress
            </span>
            <span className="text-[10px] text-slate-500 tabular-nums" style={FONT_MONO}>
              {overallProgress}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
              role="progressbar"
              aria-valuenow={overallProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall analysis progress"
            />
          </div>
        </div>

        {/* ── Stage indicator ── */}
        <div className="mb-6">
          <StageIndicator
            stages={PIPELINE_STAGES}
            activeIndex={activeStageIndex}
            completedCount={completedStageCount}
          />
        </div>

        {/* ── Tech stack chips ── */}
        {detectedStack.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p
              className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-3"
              style={FONT_MONO}
            >
              Detected Stack
            </p>
            <StackChips stack={detectedStack} />
          </div>
        )}

        {/* ── Terminal log ── */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/60">
            <Terminal size={12} className="text-slate-600" aria-hidden="true" />
            <span
              className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest"
              style={FONT_MONO}
            >
              Event Log
            </span>
            <span
              className="ml-auto text-[10px] text-slate-700 tabular-nums"
              style={FONT_MONO}
            >
              {events.length} events
            </span>
          </div>
          <TerminalLog events={events} />
        </div>
      </div>
    </div>
  );
}


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — 'use client';

/**
 * DryRun — AnalyzingOverlay
 * Full-screen glassmorphic re-simulation loading overlay.
 *
 * Shown while a new chaos simulation run is in flight.
 * Renders over the existing dashboard — use position:fixed + z-index.
 */

import React from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT_MONO: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
};

// ---------------------------------------------------------------------------
// Dual-ring spinner
// ---------------------------------------------------------------------------

function DualRingSpinner(): React.JSX.Element {
  return (
    <div
      className="relative w-16 h-16"
      role="img"
      aria-label="Loading spinner"
    >
      {/* Outer ring */}
      <span
        className="absolute inset-0 rounded-full border-2 border-transparent
                   border-t-violet-500 animate-spin-slow"
        aria-hidden="true"
      />
      {/* Inner ring (counter-spin) */}
      <span
        className="absolute inset-2.5 rounded-full border-2 border-transparent
                   border-b-violet-400/60 animate-spin-reverse"
        aria-hidden="true"
      />
      {/* Centre dot */}
      <span
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse-dot" />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AnalyzingOverlayProps {
  /** Primary message (e.g. "Re-running chaos simulation…") */
  message: string;
  /** Optional secondary detail line */
  detail?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AnalyzingOverlay({
  message,
  detail,
}: AnalyzingOverlayProps): React.JSX.Element {
  return (
    <div
      role="status"
      aria-live="assertive"
      aria-label={message}
      className="fixed inset-0 z-50 flex items-center justify-center glass-panel-dark scanlines"
    >
      {/* Micro-grid texture behind the panel */}
      <div className="absolute inset-0 bg-micro-grid opacity-30" aria-hidden="true" />

      {/* Content card */}
      <div
        className="relative z-10 flex flex-col items-center gap-5
                   rounded-2xl border border-violet-500/20 bg-slate-950/80
                   backdrop-blur-xl px-10 py-10 shadow-2xl shadow-violet-900/20
                   max-w-sm w-full mx-4 text-center"
      >
        {/* Glow ring behind spinner */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full bg-violet-500/10 blur-xl scale-150"
            aria-hidden="true"
          />
          <DualRingSpinner />
        </div>

        {/* Message */}
        <div>
          <p
            className="text-sm font-bold text-slate-200 leading-snug mb-1"
            style={FONT_MONO}
          >
            {message}
          </p>
          {detail !== undefined && detail.length > 0 && (
            <p
              className="text-xs text-slate-500"
              style={FONT_MONO}
            >
              {detail}
            </p>
          )}
        </div>

        {/* Animated progress stripe */}
        <div className="w-full h-0.5 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full animate-shimmer" />
        </div>

        {/* Subtle label */}
        <p
          className="text-[10px] text-slate-700 uppercase tracking-widest"
          style={FONT_MONO}
        >
          DryRun · Chaos Engine
        </p>
      </div>
    </div>
  );
}


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Read existing project files (AGENTS.md, .bobrules, src/types/index.ts, src/lib/demo-data.ts, existing globals.css)
[x] Implement Global Styles & Design System (src/app/globals.css)
[x] Implement Navigation Header (src/components/TopBar.tsx)
[x] Implement Onboarding & Upload Screen (src/components/UploadScreen.tsx)
[x] Implement Intermediate Analysis Screen (src/components/ProcessingScreen.tsx)
[x] Implement Re-simulation Loading Overlay (src/components/AnalyzingOverlay.tsx)
[-] Run TypeScript type check (pnpm tsc --noEmit)


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — pnpm tsc --noEmit 2>&1

### 🤖 Assistant

> 🔧 called: execute_command

Zero errors. Let me do a quick sanity-read of the key parts to confirm everything looks clean:

> 🔧 **execute_command** — pnpm tsc --noEmit --diagnostics 2>&1 | Select-String -Pattern "error|Error|warning" | Select-Object -First 20

### 🤖 Assistant

> 🔧 called: execute_command

Clean. Let me verify the files are all present and well-formed:

> 🔧 **execute_command** — Get-ChildItem src/components/TopBar.tsx, src/components/UploadScreen.tsx, src/components/ProcessingScreen.tsx, src/components/AnalyzingOverlay.tsx | Select-Object Name, Length

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Read existing project files (AGENTS.md, .bobrules, src/types/index.ts, src/lib/demo-data.ts, existing globals.css)
[x] Implement Global Styles & Design System (src/app/globals.css)
[x] Implement Navigation Header (src/components/TopBar.tsx)
[x] Implement Onboarding & Upload Screen (src/components/UploadScreen.tsx)
[x] Implement Intermediate Analysis Screen (src/components/ProcessingScreen.tsx)
[x] Implement Re-simulation Loading Overlay (src/components/AnalyzingOverlay.tsx)
[x] Run TypeScript type check (pnpm tsc --noEmit)


### 🤖 Assistant

`pnpm tsc --noEmit` exits clean — zero errors, zero warnings. Here's a summary of everything delivered:

---

## Delivered

### [`src/app/globals.css`](src/app/globals.css)
Extended the design system with:
- **HSL CSS custom properties** (`--background`, `--foreground`, `--neo-button`, `--neo-button-hover`, `--border`, `--status-ok/warn/danger`)  
- **Retro-brutalist borders** — `.border-brutalist`, `.border-brutalist-accent`, `.border-brutalist-danger`, `.corner-cut` (De Stijl clip-path)
- **Micro-grid backgrounds** — `.bg-micro-grid` (24px) and `.bg-micro-grid-dense` (12px)
- **Scanline overlay** — `.scanlines::after` repeating gradient
- **Glassmorphic panels** — `.glass-panel` and `.glass-panel-dark` with `backdrop-filter`
- **Glowing status pills** — `.status-pill-ok/warn/danger` with `hsl()` box-shadows
- **`.neo-btn`** — violet glow button matching `--neo-button` token
- **Animations** — `pulse-dot`, `spin-slow`, `spin-reverse`, `shimmer`, `fade-up`, `blink`, `particle-float`
- **Utility classes** — `.card-surface`, `.card-surface-hover`, `.drop-zone`, `.terminal-pane`

### [`src/components/TopBar.tsx`](src/components/TopBar.tsx)
- Wordmark `Dry`**`Run`** (violet accent) + "IBM Bob 2.0" pill badge
- `resolveStatusClass(status: RiskLevel)` → CSS status pill class
- Live status dot with `animate-pulse-dot` pulse
- Project name chip with `×` reset button
- Dynamic risk score pill (`Critical/High/Medium/Low/Zero Risk`) derived from `riskScore: number`
- Theme toggle button (Sun ↔ Moon) — strictly typed `'dark' | 'light'`

### [`src/components/UploadScreen.tsx`](src/components/UploadScreen.tsx)
- **Hero** — full headline + subtitle on `bg-micro-grid`
- **GitHub URL input** — validated `new URL()`, `aria-invalid`, error messaging
- **Drag-and-drop ZIP zone** — `.drop-zone` class, `.drag-active` state, particle floating dots on hover, 50 MB size guard
- **`ScenarioCard`** — per-demo circular SVG blast score gauge, tag badge, stack preview, click-through
- **Architecture highlights grid** — 4 items mapped from `ARCH_HIGHLIGHTS`

### [`src/components/ProcessingScreen.tsx`](src/components/ProcessingScreen.tsx)
- **`StageIndicator`** — 4 canonical pipeline stages (`PIPELINE_STAGES` `as const`), `CheckCircle2` / `Loader2` / `Circle` icons
- **Overall progress bar** — `aria-progressbar`, animated fill
- **`TerminalLog`** — auto-scroll `useEffect`, timestamped events coloured by `EventType`, blinking cursor
- **`StackChips`** — 11 pre-mapped tech colours, accessible `role="list"`
- Elapsed timer via `setInterval`

### [`src/components/AnalyzingOverlay.tsx`](src/components/AnalyzingOverlay.tsx)
- `position: fixed` full-screen overlay with `glass-panel-dark` + `scanlines`
- `DualRingSpinner` — outer `animate-spin-slow` + inner `animate-spin-reverse` rings + centre pulse dot
- Animated shimmer progress stripe
- `message` + optional `detail` props; `aria-live="assertive"` for screen-reader notification