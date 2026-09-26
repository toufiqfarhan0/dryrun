'use client';

/**
 * DryRun — /analyze — Primary Command Center Workspace
 * Agent 5: Frontend Application Assembler
 *
 * Full-screen layout:
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  Header / Telemetry Bar                                     │
 *   ├─────────────────────────────────┬───────────────────────────┤
 *   │  GraphCanvas (main canvas)      │  ControlPanel (sidebar)   │
 *   │    + EdgeLayer overlay          │  NodeDetailPanel (slide)  │
 *   ├─────────────────────────────────┴───────────────────────────┤
 *   │  ImpactLegend  │  ScenarioTimeline (floating bar)           │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * GateReport slides in as a full-height overlay from the right.
 */

import React, { useState, useCallback } from 'react';
import {
  Zap,
  GitBranch,
  User,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  ExternalLink,
  FolderSearch,
  FileText,
} from 'lucide-react';
import { TelemetryDrawer } from '@/components/TelemetryDrawer';
import { ReleaseNotesModal } from '@/components/ReleaseNotesModal';
import { RepoUploadModal } from '@/components/RepoUploadModal';
import {
  SimulationProvider,
  useSimulation,
  GraphCanvas,
  ControlPanel,
  NodeDetailPanel,
  ImpactLegend,
  ScenarioTimeline,
  GateReport,
  type PresetKey,
} from '@/components/visualizer';
import type { NodeId } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT_MONO: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
};

/** PR metadata shown in the telemetry bar */
const PR_META = {
  number: 142,
  author: 'ada.lovelace',
  branch: 'feat/jwt-schema-v2',
  target: 'main',
};

const PRESET_LABELS: Record<PresetKey | 'monolithMigration', string> = {
  authSchemaBreaking: 'Auth Token Schema Change',
  dbPoolExhaustion: 'DB Pool Exhaustion',
  monolithMigration: 'Monolith → Microservices',
};

const ALL_PRESET_KEYS: Array<PresetKey | 'monolithMigration'> = [
  'authSchemaBreaking',
  'dbPoolExhaustion',
  'monolithMigration',
];

// ---------------------------------------------------------------------------
// Radial blast gauge (compact, header-sized)
// ---------------------------------------------------------------------------

function HeaderBlastGauge({ score }: { score: number }): React.JSX.Element {
  const RADIUS = 18;
  const STROKE = 4;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const clamped = Math.max(0, Math.min(100, score));
  const dashOffset = CIRCUMFERENCE * (1 - clamped / 100);

  let color = '#10b981';
  if (clamped >= 80) color = '#ef4444';
  else if (clamped >= 60) color = '#f97316';
  else if (clamped >= 40) color = '#facc15';

  const cx = RADIUS + STROKE;
  const cy = RADIUS + STROKE;
  const size = (RADIUS + STROKE) * 2;

  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} aria-label={`Blast score ${clamped}`}>
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
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="9"
          fontWeight="700"
          style={FONT_MONO}
        >
          {clamped}
        </text>
      </svg>
      <span className="text-xs text-slate-400" style={FONT_MONO}>
        Blast
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gate status pill
// ---------------------------------------------------------------------------

function GateStatusPill({
  onClick,
}: {
  onClick: () => void;
}): React.JSX.Element {
  const { state } = useSimulation();
  const { gateDecision, phase } = state;

  if (gateDecision) {
    const isApproved = gateDecision.decision === 'APPROVED';
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all cursor-pointer hover:opacity-80 ${
          isApproved
            ? 'border-emerald-500 bg-emerald-900/40 text-emerald-400'
            : 'border-red-500 bg-red-900/40 text-red-400'
        }`}
        style={FONT_MONO}
        aria-label="Open gate report"
      >
        {isApproved ? (
          <ShieldCheck className="h-3.5 w-3.5" />
        ) : (
          <ShieldX className="h-3.5 w-3.5" />
        )}
        {gateDecision.decision}
      </button>
    );
  }

  if (phase === 'STREAMING') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-500/50 bg-sky-900/30 text-sky-400 text-xs font-semibold animate-pulse"
        style={FONT_MONO}
        aria-label="Open gate report"
      >
        <ShieldAlert className="h-3.5 w-3.5" />
        EVALUATING
      </button>
    );
  }

  if (phase === 'SIMULATING' || phase === 'ANALYZING') {
    return (
      <span
        className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-500/50 bg-violet-900/30 text-violet-400 text-xs font-semibold"
        style={FONT_MONO}
      >
        <ShieldAlert className="h-3.5 w-3.5 animate-spin" />
        SIMULATING
      </span>
    );
  }

  return (
    <span
      className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-600 bg-slate-800 text-slate-500 text-xs font-semibold"
      style={FONT_MONO}
    >
      <ShieldAlert className="h-3.5 w-3.5" />
      PENDING
    </span>
  );
}

// ---------------------------------------------------------------------------
// Preset switcher dropdown
// ---------------------------------------------------------------------------

function PresetSwitcher(): React.JSX.Element {
  const { state, setPreset } = useSimulation();
  const [open, setOpen] = useState(false);

  const active = (state.activePreset ?? 'authSchemaBreaking') as PresetKey | 'monolithMigration';

  const handleSelect = (key: PresetKey | 'monolithMigration'): void => {
    // monolithMigration has no fixture yet — treat as authSchemaBreaking visually
    if (key !== 'monolithMigration') {
      setPreset(key as PresetKey);
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-600 bg-slate-800 hover:border-violet-500 text-slate-200 text-xs transition-colors"
        style={FONT_MONO}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate max-w-[160px]">{PRESET_LABELS[active]}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full mt-1 z-30 w-56 rounded-md border border-slate-600 bg-slate-900 shadow-2xl overflow-hidden"
        >
          {ALL_PRESET_KEYS.map((key) => (
            <li
              key={key}
              role="option"
              aria-selected={key === active}
              className={`px-3 py-2 cursor-pointer text-xs transition-colors ${
                key === active
                  ? 'bg-violet-900/40 text-violet-300'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              style={FONT_MONO}
              onClick={() => handleSelect(key)}
            >
              {PRESET_LABELS[key]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Telemetry Header
// ---------------------------------------------------------------------------

function TelemetryHeader({
  onOpenGate,
  onOpenReleaseNotes,
  onOpenRepoUpload,
}: {
  onOpenGate: () => void;
  onOpenReleaseNotes: () => void;
  onOpenRepoUpload: () => void;
}): React.JSX.Element {
  const { state } = useSimulation();
  const blastScore =
    state.gateDecision?.blastScore ??
    state.chaosResult?.aggregateRiskScore ??
    state.blastReport?.overallBlastScore ??
    0;

  return (
    <header className="shrink-0 flex items-center justify-between gap-4 px-5 py-2.5 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
      {/* Left: branding */}
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="font-mono text-xl font-bold text-slate-100 hover:text-violet-400 transition-colors"
          style={FONT_MONO}
        >
          Dry<span className="text-violet-500">Run</span>
        </a>
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-400 text-xs font-semibold tracking-widest uppercase">
          <Zap size={10} />
          IBM Bob 2.0
        </span>
      </div>

      {/* Centre: PR metadata + preset switcher + utility buttons */}
      <div className="flex items-center gap-3 min-w-0">
        {/* PR chip */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md border border-slate-700 bg-slate-800 text-xs text-slate-400"
          style={FONT_MONO}
        >
          <GitBranch className="h-3.5 w-3.5 text-violet-400 shrink-0" />
          <span className="text-slate-300 font-semibold">PR #{PR_META.number}</span>
          <ArrowRight className="h-3 w-3 text-slate-600" />
          <User className="h-3 w-3 text-sky-400" />
          <span>{PR_META.author}</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400">{PR_META.branch}</span>
          <ExternalLink className="h-3 w-3 text-slate-600 cursor-pointer hover:text-slate-400" />
        </div>

        <PresetSwitcher />

        {/* Repo upload button */}
        <button
          type="button"
          onClick={onOpenRepoUpload}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-600 bg-slate-800 hover:border-violet-500 text-slate-400 hover:text-violet-300 text-xs transition-colors"
          style={FONT_MONO}
          title="Ingest custom repository"
          aria-label="Open repository ingestion modal"
        >
          <FolderSearch className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Ingest Repo</span>
        </button>

        {/* Release notes button */}
        <button
          type="button"
          onClick={onOpenReleaseNotes}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-600 bg-slate-800 hover:border-violet-500 text-slate-400 hover:text-violet-300 text-xs transition-colors"
          style={FONT_MONO}
          title="Generate release notes"
          aria-label="Open release notes modal"
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Release Notes</span>
        </button>
      </div>

      {/* Right: blast gauge + gate pill */}
      <div className="flex items-center gap-3 shrink-0">
        <HeaderBlastGauge score={blastScore} />
        <GateStatusPill onClick={onOpenGate} />
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Inner workspace (needs SimulationContext)
// ---------------------------------------------------------------------------

function WorkspaceInner(): React.JSX.Element {
  const { state, selectNode } = useSimulation();
  const [animOffset, setAnimOffset] = useState(0);
  const [gateOpen, setGateOpen] = useState(false);
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);
  const [repoUploadOpen, setRepoUploadOpen] = useState(false);

  const handleAnimOffset = useCallback((offset: number): void => {
    setAnimOffset(offset);
  }, []);

  const handleOpenGate = useCallback((): void => {
    setGateOpen(true);
  }, []);

  const handleCloseGate = useCallback((): void => {
    setGateOpen(false);
  }, []);

  const handleOpenReleaseNotes = useCallback((): void => {
    setReleaseNotesOpen(true);
  }, []);

  const handleCloseReleaseNotes = useCallback((): void => {
    setReleaseNotesOpen(false);
  }, []);

  const handleOpenRepoUpload = useCallback((): void => {
    setRepoUploadOpen(true);
  }, []);

  const handleCloseRepoUpload = useCallback((): void => {
    setRepoUploadOpen(false);
  }, []);

  // Auto-open gate report when streaming starts
  React.useEffect(() => {
    if (state.phase === 'STREAMING' || state.phase === 'COMPLETE') {
      setGateOpen(true);
    }
  }, [state.phase]);

  const { graph, blastReport, chaosResult, selectedNodeId } = state;

  // Compute active node IDs for the current simulation step
  const activeNodeIds = React.useMemo((): Set<NodeId> => {
    if (!chaosResult || !blastReport) return new Set();
    const criticalChain = chaosResult.criticalFailureChain;
    const stepSlice = criticalChain.slice(0, state.currentStep + 1);
    return new Set(stepSlice);
  }, [chaosResult, blastReport, state.currentStep]);

  const impacts = blastReport?.impacts ?? {};
  const nodeResults = chaosResult?.nodeResults ?? {};
  const criticalChain = chaosResult?.criticalFailureChain ?? [];

  const hasGraph = graph !== null;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <TelemetryHeader
        onOpenGate={handleOpenGate}
        onOpenReleaseNotes={handleOpenReleaseNotes}
        onOpenRepoUpload={handleOpenRepoUpload}
      />

      {/* Main content area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Canvas area */}
        <div className="relative flex flex-col flex-1 min-w-0 min-h-0">
          {/* Graph canvas — fills remaining space */}
          <div className="flex-1 min-h-0">
            {hasGraph ? (
              <GraphCanvas
                graph={graph}
                impacts={impacts}
                nodeResults={nodeResults}
                activeNodeIds={activeNodeIds}
                criticalChain={criticalChain}
                selectedNodeId={selectedNodeId}
                onSelectNode={selectNode}
                animOffset={animOffset}
              />
            ) : (
              <EmptyCanvasPlaceholder />
            )}
          </div>

          {/* Floating bottom bar: ImpactLegend + ScenarioTimeline */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end gap-3 p-4 pointer-events-none">
            <div className="pointer-events-auto w-48 shrink-0">
              <ImpactLegend />
            </div>
            <div className="pointer-events-auto flex-1">
              <ScenarioTimeline onAnimOffset={handleAnimOffset} />
            </div>
          </div>
        </div>

        {/* Right sidebar: ControlPanel + NodeDetailPanel */}
        <aside className="flex flex-col w-72 shrink-0 border-l border-slate-700 bg-slate-900 overflow-y-auto">
          <div className="p-3 border-b border-slate-700">
            <ControlPanel />
          </div>
          {selectedNodeId !== null && (
            <div className="flex-1 min-h-0">
              <NodeDetailPanel />
            </div>
          )}
        </aside>
      </div>

      {/* Telemetry Event Stream drawer — pinned to bottom */}
      <TelemetryDrawer />

      {/* Gate Report slide-over */}
      <GateReport open={gateOpen} onClose={handleCloseGate} />

      {/* Release Notes modal */}
      <ReleaseNotesModal open={releaseNotesOpen} onClose={handleCloseReleaseNotes} />

      {/* Repository ingestion modal */}
      <RepoUploadModal open={repoUploadOpen} onClose={handleCloseRepoUpload} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state when no graph is loaded
// ---------------------------------------------------------------------------

function EmptyCanvasPlaceholder(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-950 gap-6 select-none">
      <div className="flex flex-col items-center gap-3 opacity-50">
        <div className="h-24 w-24 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center">
          <GitBranch className="h-10 w-10 text-slate-700" />
        </div>
        <p className="text-sm text-slate-600" style={FONT_MONO}>
          No simulation loaded
        </p>
        <p className="text-xs text-slate-700 text-center max-w-xs" style={FONT_MONO}>
          Select a scenario preset and click{' '}
          <span className="text-violet-600">Run Chaos Simulation</span> to begin.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export — wraps everything in SimulationProvider
// ---------------------------------------------------------------------------

export default function AnalyzePage(): React.JSX.Element {
  return (
    <SimulationProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
        <WorkspaceInner />
      </div>
    </SimulationProvider>
  );
}
