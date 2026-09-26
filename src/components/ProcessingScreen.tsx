'use client';

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
