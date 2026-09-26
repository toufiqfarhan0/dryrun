'use client';

/**
 * DryRun — Control Panel
 * Agent 5: Interactive System Visualizer
 *
 * Scenario selector, chaos simulation trigger, watsonx gate button,
 * and reset controls.  All actions are dispatched via SimulationContext.
 */

import React, { useState } from 'react';
import { Play, Cpu, RefreshCw, ChevronDown, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useSimulation, type PresetKey } from './context/SimulationContext';
import { FIXTURE_SCENARIOS } from '@/lib/fixtures/enterprise-mesh';

// ---------------------------------------------------------------------------
// Preset configuration
// ---------------------------------------------------------------------------

interface PresetOption {
  key: PresetKey;
  label: string;
  description: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    key: 'authSchemaBreaking',
    label: 'Auth Schema Breaking Change',
    description: 'JWT token schema renamed fields — breaks all consumers',
  },
  {
    key: 'dbPoolExhaustion',
    label: 'DB Connection Pool Exhaustion',
    description: 'Shared connection pool starved under load burst',
  },
  {
    key: 'monolithMigration',
    label: 'Monolith Migration',
    description: 'Strangler-fig split creates transient dual-write chaos',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function GateBadge({ phase }: { phase: string }): React.JSX.Element | null {
  if (phase === 'STREAMING') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-sky-400 font-mono animate-pulse">
        <Loader2 className="h-3 w-3 animate-spin" />
        Streaming…
      </span>
    );
  }
  if (phase === 'COMPLETE') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
        <CheckCircle2 className="h-3 w-3" />
        Complete
      </span>
    );
  }
  if (phase === 'ERROR') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
        <XCircle className="h-3 w-3" />
        Error
      </span>
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ControlPanel(): React.JSX.Element {
  const { state, loadGraph, setPreset, startSimulation, streamGateChunk, setGateDecision, reset } =
    useSimulation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { phase, activePreset } = state;
  const isIdle = phase === 'IDLE' || phase === 'COMPLETE' || phase === 'ERROR';
  const isSimulating = phase === 'SIMULATING' || phase === 'ANALYZING';
  const isStreaming = phase === 'STREAMING';

  const selectedPreset = PRESET_OPTIONS.find((p) => p.key === activePreset) ?? PRESET_OPTIONS[0];

  // ── Run Chaos Simulation ─────────────────────────────────────────────────
  const handleRunSimulation = (): void => {
    const presetKey = activePreset ?? 'authSchemaBreaking';
    const fixture = FIXTURE_SCENARIOS[presetKey as keyof typeof FIXTURE_SCENARIOS];
    if (!fixture) return;

    // Load the graph + blast report first
    loadGraph(fixture.blastReport.graph, fixture.blastReport);

    // Compute total steps (= unique blast depths + 1)
    const depths = Object.values(fixture.blastReport.impacts).map((i) => i.blastDepth);
    const maxDepth = depths.length > 0 ? Math.max(...depths) : 0;
    const totalSteps = maxDepth + 2;

    startSimulation(fixture.chaosResult, totalSteps);
  };

  // ── Synthesize watsonx Gate ──────────────────────────────────────────────
  const handleSynthesizeGate = async (): Promise<void> => {
    if (!state.chaosResult) return;

    try {
      const res = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chaosSimulationResultId: state.chaosResult.runId }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Gate API error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') break;
            try {
              const parsed: unknown = JSON.parse(raw);
              if (
                parsed !== null &&
                typeof parsed === 'object' &&
                'chunk' in parsed &&
                typeof (parsed as { chunk: unknown }).chunk === 'string'
              ) {
                streamGateChunk((parsed as { chunk: string }).chunk);
              } else if (
                parsed !== null &&
                typeof parsed === 'object' &&
                'decision' in parsed
              ) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- external API boundary
                setGateDecision((parsed as any).decision);
              }
            } catch {
              // non-JSON SSE line — skip
            }
          }
        }
      }
    } catch (err) {
      // Surface error in narrative area; keep existing state
      const msg = err instanceof Error ? err.message : 'Unknown error';
      streamGateChunk(`\n\n**Error contacting gate API:** ${msg}`);
    }
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 space-y-4">
      <h2
        className="text-xs font-semibold text-slate-400 uppercase tracking-widest"
        style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
      >
        Simulation Controls
      </h2>

      {/* Scenario selector */}
      <div className="space-y-1.5">
        <label
          className="text-xs text-slate-400"
          style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
        >
          Fault Scenario
        </label>
        <div className="relative">
          <button
            type="button"
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-slate-600 bg-slate-900 text-slate-100 text-sm hover:border-violet-500 transition-colors"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <span
              className="truncate font-mono"
              style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
            >
              {selectedPreset.label}
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <ul
              role="listbox"
              className="absolute z-20 mt-1 w-full rounded-md border border-slate-600 bg-slate-900 shadow-xl overflow-hidden"
            >
              {PRESET_OPTIONS.map((option) => (
                <li
                  key={option.key}
                  role="option"
                  aria-selected={option.key === activePreset}
                  className={`px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                    option.key === activePreset
                      ? 'bg-violet-900/40 text-violet-300'
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                  onClick={() => {
                    setPreset(option.key);
                    setDropdownOpen(false);
                  }}
                >
                  <div
                    className="font-semibold font-mono truncate"
                    style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
                  >
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{option.description}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          type="button"
          disabled={isSimulating || isStreaming}
          onClick={handleRunSimulation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
        >
          {isSimulating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running…
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Chaos Simulation
            </>
          )}
        </button>

        <button
          type="button"
          disabled={!state.chaosResult || isStreaming}
          onClick={() => { void handleSynthesizeGate(); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-violet-600 hover:bg-violet-900/40 disabled:opacity-40 disabled:cursor-not-allowed text-violet-300 font-semibold text-sm transition-colors"
        >
          <Cpu className="h-4 w-4" />
          Synthesize watsonx Gate
          <GateBadge phase={phase} />
        </button>

        <button
          type="button"
          disabled={isIdle && !state.graph}
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-slate-600 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 text-sm transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* Phase indicator */}
      {phase !== 'IDLE' && (
        <div
          className="flex items-center gap-2 pt-1 border-t border-slate-700"
          aria-live="polite"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              phase === 'ERROR'
                ? 'bg-red-500'
                : phase === 'COMPLETE'
                  ? 'bg-emerald-500'
                  : 'bg-violet-500 animate-pulse'
            }`}
          />
          <span
            className="text-xs font-mono text-slate-400"
            style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
          >
            {phase}
          </span>
        </div>
      )}
    </div>
  );
}
