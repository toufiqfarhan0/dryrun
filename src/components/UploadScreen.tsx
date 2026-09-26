'use client';

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
