'use client';

/**
 * DryRun — Impact Legend
 * Agent 5: Interactive System Visualizer
 *
 * Clean severity legend matching the .bobrules telemetry colour tokens.
 * Renders CRITICAL → HIGH → MEDIUM → LOW rows with colour swatches.
 */

import React from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

interface LegendEntry {
  label: string;
  color: string;
  range: string;
  description: string;
}

const LEGEND_ENTRIES: LegendEntry[] = [
  {
    label: 'CRITICAL',
    color: '#ef4444',
    range: '81–100',
    description: 'Service boundary risk, circuit-breaker threat',
  },
  {
    label: 'HIGH',
    color: '#f97316',
    range: '61–80',
    description: 'Multiple dependents, on critical path',
  },
  {
    label: 'MEDIUM',
    color: '#facc15',
    range: '41–60',
    description: 'Significant blast depth, degraded availability',
  },
  {
    label: 'LOW',
    color: '#38bdf8',
    range: '21–40',
    description: 'Limited downstream impact',
  },
  {
    label: 'SAFE',
    color: '#10b981',
    range: '0–20',
    description: 'Isolated or change-unreachable node',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImpactLegend(): React.JSX.Element {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
      <h3
        className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3"
        style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
      >
        Impact Legend
      </h3>
      <ul className="space-y-2">
        {LEGEND_ENTRIES.map((entry) => (
          <li key={entry.label} className="flex items-center gap-2.5">
            {/* Colour swatch */}
            <span
              className="shrink-0 h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            {/* Label + range */}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-xs font-semibold font-mono"
                  style={{
                    color: entry.color,
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  }}
                >
                  {entry.label}
                </span>
                <span
                  className="text-xs text-slate-500 font-mono"
                  style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
                >
                  {entry.range}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-tight mt-0.5">{entry.description}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Node-status indicators */}
      <div className="mt-4 pt-3 border-t border-slate-700">
        <p
          className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2"
          style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
        >
          Node Status
        </p>
        <ul className="space-y-1.5">
          <StatusRow symbol="●" color="#10b981" label="Healthy" />
          <StatusRow symbol="◐" color="#facc15" label="Degraded" />
          <StatusRow symbol="✕" color="#ef4444" label="Failed" pulse />
          <StatusRow symbol="○" color="#475569" label="Isolated / unreachable" />
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function StatusRow({
  symbol,
  color,
  label,
  pulse = false,
}: {
  symbol: string;
  color: string;
  label: string;
  pulse?: boolean;
}): React.JSX.Element {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`text-sm font-mono leading-none ${pulse ? 'animate-pulse' : ''}`}
        style={{ color, fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
        aria-hidden="true"
      >
        {symbol}
      </span>
      <span className="text-xs text-slate-400">{label}</span>
    </li>
  );
}
