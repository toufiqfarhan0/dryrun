'use client';

/**
 * DryRun — Telemetry Event Stream Drawer
 * Observability & Developer Experience Agent
 *
 * Collapsible bottom drawer that surfaces real-time pipeline events across
 * all four stages: [AST] · [BLAST] · [CHAOS] · [WATSONX].
 * Events are fed by the SimulationContext phase transitions.
 *
 * Features:
 *  - Auto-appends log entries as simulation phases advance
 *  - Filter by log level: ALL | INFO | WARN | ERROR
 *  - Search by free text
 *  - "Clear" and "Export Logs (.json)" buttons
 *  - Collapsible — header always visible; body toggles
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Trash2,
  Download,
  Activity,
} from 'lucide-react';
import { useSimulation } from '@/components/visualizer';
import type { SimulationPhase } from '@/components/visualizer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LogLevel = 'INFO' | 'WARN' | 'ERROR';
type LogFilter = 'ALL' | LogLevel;

type LogChannel = 'AST' | 'BLAST' | 'CHAOS' | 'WATSONX';

export interface TelemetryEvent {
  id: string;
  ts: number;
  channel: LogChannel;
  level: LogLevel;
  message: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT_MONO: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
};

const CHANNEL_COLORS: Record<LogChannel, string> = {
  AST: 'text-sky-400',
  BLAST: 'text-orange-400',
  CHAOS: 'text-red-400',
  WATSONX: 'text-violet-400',
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  INFO: 'text-slate-300',
  WARN: 'text-yellow-400',
  ERROR: 'text-red-500',
};

const FILTER_OPTIONS: LogFilter[] = ['ALL', 'INFO', 'WARN', 'ERROR'];

// ---------------------------------------------------------------------------
// Seed events per phase transition — deterministic log narrative
// ---------------------------------------------------------------------------

type PhaseKey = 'ANALYZING' | 'SIMULATING' | 'STREAMING' | 'COMPLETE' | 'ERROR';

const PHASE_EVENTS: Record<PhaseKey, TelemetryEvent[]> = {
  ANALYZING: [
    { id: 'ast-1', ts: 0, channel: 'AST', level: 'INFO', message: 'Walking repository file tree…' },
    { id: 'ast-2', ts: 0, channel: 'AST', level: 'INFO', message: 'Resolved 12 service boundary nodes' },
    { id: 'ast-3', ts: 0, channel: 'AST', level: 'INFO', message: 'Extracted 38 directed dependency edges' },
    { id: 'ast-4', ts: 0, channel: 'AST', level: 'INFO', message: 'DependencyGraph emitted — id: run-mesh-001' },
    { id: 'blast-1', ts: 0, channel: 'BLAST', level: 'INFO', message: 'Starting reverse BFS from changed nodes…' },
    { id: 'blast-2', ts: 0, channel: 'BLAST', level: 'INFO', message: 'Reachability pass complete — 9 nodes affected' },
    { id: 'blast-3', ts: 0, channel: 'BLAST', level: 'WARN', message: 'api-gateway: impactScore=94 — CRITICAL PATH' },
    { id: 'blast-4', ts: 0, channel: 'BLAST', level: 'WARN', message: 'billing-engine: impactScore=81 — HIGH RISK' },
    { id: 'blast-5', ts: 0, channel: 'BLAST', level: 'INFO', message: 'BlastRadiusReport ready — overallBlastScore=78' },
  ],
  SIMULATING: [
    { id: 'chaos-1', ts: 0, channel: 'CHAOS', level: 'INFO', message: 'Injecting SERVICE_OUTAGE on auth-service (severity=0.9)' },
    { id: 'chaos-2', ts: 0, channel: 'CHAOS', level: 'WARN', message: 'Tick 1: failure cascade → user-service p(fail)=0.67' },
    { id: 'chaos-3', ts: 0, channel: 'CHAOS', level: 'WARN', message: 'Tick 2: decay 0.72 → order-service p(fail)=0.48' },
    { id: 'chaos-4', ts: 0, channel: 'CHAOS', level: 'ERROR', message: 'Tick 3: api-gateway p(fail)=0.91 — CRITICAL' },
    { id: 'chaos-5', ts: 0, channel: 'CHAOS', level: 'WARN', message: 'Tick 4: notification-worker p(fail)=0.31 — decay absorbed' },
    { id: 'chaos-6', ts: 0, channel: 'CHAOS', level: 'INFO', message: 'Simulation complete — aggregateRiskScore=82' },
  ],
  STREAMING: [
    { id: 'wx-1', ts: 0, channel: 'WATSONX', level: 'INFO', message: 'Connecting to watsonx Granite — model: granite-13b-chat-v2' },
    { id: 'wx-2', ts: 0, channel: 'WATSONX', level: 'INFO', message: 'SSE stream open — receiving tokens…' },
    { id: 'wx-3', ts: 0, channel: 'WATSONX', level: 'INFO', message: 'Gate evaluation in progress — severity classification active' },
  ],
  COMPLETE: [
    { id: 'wx-4', ts: 0, channel: 'WATSONX', level: 'INFO', message: 'SSE stream closed — all tokens received' },
    { id: 'wx-5', ts: 0, channel: 'WATSONX', level: 'WARN', message: 'Gate decision emitted: BLOCKED — severity=HIGH' },
  ],
  ERROR: [
    { id: 'err-1', ts: 0, channel: 'WATSONX', level: 'ERROR', message: 'Pipeline error — check console for details' },
  ],
};

// ---------------------------------------------------------------------------
// Hook: accumulate events as simulation phases advance
// ---------------------------------------------------------------------------

function useTelemetryLog(): {
  events: TelemetryEvent[];
  clear: () => void;
} {
  const { state } = useSimulation();
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const seenPhases = useRef<Set<string>>(new Set());
  const counter = useRef(0);

  const appendPhaseEvents = useCallback((phase: PhaseKey): void => {
    const phaseEvents = PHASE_EVENTS[phase];
    const stamped = phaseEvents.map((e) => ({
      ...e,
      id: `${e.id}-${++counter.current}`,
      ts: Date.now(),
    }));
    setEvents((prev) => [...prev, ...stamped]);
  }, []);

  useEffect(() => {
    const rawPhase: SimulationPhase = state.phase;
    if (rawPhase === 'IDLE') return;
    if (!(rawPhase in PHASE_EVENTS)) return;
    const phase = rawPhase as PhaseKey;
    if (seenPhases.current.has(phase)) return;
    seenPhases.current.add(phase);
    appendPhaseEvents(phase);
  }, [state.phase, appendPhaseEvents]);

  // Reset seen phases on RESET action (state returns to IDLE)
  useEffect(() => {
    if (state.phase === 'IDLE') {
      seenPhases.current.clear();
    }
  }, [state.phase]);

  const clear = useCallback((): void => {
    setEvents([]);
    seenPhases.current.clear();
  }, []);

  return { events, clear };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LogRow({ event }: { event: TelemetryEvent }): React.JSX.Element {
  const time = new Date(event.ts).toISOString().substring(11, 23); // HH:mm:ss.mmm
  return (
    <div className="flex items-start gap-2 py-0.5 hover:bg-slate-800/60 px-2 rounded text-xs">
      <span className="text-slate-600 shrink-0 pt-px" style={FONT_MONO}>
        {time}
      </span>
      <span
        className={`font-semibold shrink-0 w-14 text-right pt-px ${CHANNEL_COLORS[event.channel]}`}
        style={FONT_MONO}
      >
        [{event.channel}]
      </span>
      <span
        className={`shrink-0 w-10 pt-px ${LEVEL_COLORS[event.level]}`}
        style={FONT_MONO}
      >
        {event.level}
      </span>
      <span className="text-slate-300 leading-relaxed break-all" style={FONT_MONO}>
        {event.message}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TelemetryDrawer
// ---------------------------------------------------------------------------

export function TelemetryDrawer(): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<LogFilter>('ALL');
  const [query, setQuery] = useState('');
  const { events, clear } = useTelemetryLog();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events.length, open]);

  const filtered = useMemo((): TelemetryEvent[] => {
    return events.filter((e) => {
      const levelMatch = filter === 'ALL' || e.level === filter;
      const queryMatch =
        query.trim() === '' ||
        e.message.toLowerCase().includes(query.toLowerCase()) ||
        e.channel.toLowerCase().includes(query.toLowerCase());
      return levelMatch && queryMatch;
    });
  }, [events, filter, query]);

  const handleExport = useCallback((): void => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dryrun-telemetry-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  return (
    <div className="shrink-0 border-t border-slate-700 bg-slate-900/95 backdrop-blur-sm">
      {/* Drawer header — always visible */}
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
        role="button"
        aria-expanded={open}
        aria-controls="telemetry-body"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest" style={FONT_MONO}>
            Telemetry Event Stream
          </span>
          <span
            className="ml-2 px-1.5 py-0.5 rounded text-xs bg-slate-800 border border-slate-700 text-slate-500"
            style={FONT_MONO}
          >
            {events.length}
          </span>
          {events.some((e) => e.level === 'ERROR') && (
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Controls: only show when open */}
          {open && (
            <>
              {/* Filter pills */}
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                      filter === f
                        ? 'bg-violet-900/50 border-violet-500 text-violet-300'
                        : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                    }`}
                    style={FONT_MONO}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700 bg-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                <Search className="h-3 w-3 text-slate-600" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter…"
                  className="bg-transparent text-xs text-slate-300 outline-none w-24 placeholder-slate-600"
                  style={FONT_MONO}
                />
              </div>

              {/* Action buttons */}
              <button
                type="button"
                title="Clear logs"
                onClick={(e) => { e.stopPropagation(); clear(); }}
                className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Export logs as JSON"
                onClick={(e) => { e.stopPropagation(); handleExport(); }}
                className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          {open ? (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </div>

      {/* Drawer body */}
      {open && (
        <div
          id="telemetry-body"
          className="overflow-y-auto max-h-48 px-2 pb-2"
          aria-live="polite"
          aria-label="Telemetry log entries"
        >
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-600 px-2 py-4 text-center" style={FONT_MONO}>
              No events match the current filter.
            </p>
          ) : (
            filtered.map((e) => <LogRow key={e.id} event={e} />)
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
