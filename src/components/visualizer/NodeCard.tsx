'use client';

/**
 * DryRun — Node Card
 * Agent 5: Interactive System Visualizer
 *
 * Floating tooltip shown on hover over a graph node.
 * Displays: node label, service type badge, fan-in count, and instantaneous
 * failure probability.
 */

import React from 'react';
import type { GraphNode, NodeImpact, NodeSimResult, NodeType } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NODE_TYPE_COLORS: Record<NodeType, string> = {
  SERVICE: 'bg-violet-900 text-violet-300 border-violet-700',
  MODULE: 'bg-slate-700 text-slate-300 border-slate-600',
  EXTERNAL: 'bg-sky-900 text-sky-300 border-sky-700',
  CONFIG: 'bg-amber-900 text-amber-300 border-amber-700',
  TEST: 'bg-emerald-900 text-emerald-300 border-emerald-700',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NodeCardProps {
  node: GraphNode;
  impact: NodeImpact | null;
  simResult: NodeSimResult | null;
  /** Fan-in: number of nodes that directly import/call this node */
  fanIn: number;
  /** Position in viewport coordinates */
  x: number;
  y: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function failureColor(prob: number): string {
  if (prob >= 0.8) return 'text-red-400';
  if (prob >= 0.6) return 'text-orange-400';
  if (prob >= 0.4) return 'text-yellow-400';
  return 'text-emerald-400';
}

function impactColor(score: number): string {
  if (score >= 80) return 'text-red-400';
  if (score >= 60) return 'text-orange-400';
  if (score >= 40) return 'text-yellow-400';
  if (score >= 20) return 'text-sky-400';
  return 'text-emerald-400';
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NodeCard({ node, impact, simResult, fanIn, x, y }: NodeCardProps): React.JSX.Element {
  const badgeClass = NODE_TYPE_COLORS[node.nodeType] ?? NODE_TYPE_COLORS.MODULE;

  // Clamp tooltip so it stays within a reasonable viewport bound
  const TOOLTIP_WIDTH = 240;
  const adjustedX = x + TOOLTIP_WIDTH > window.innerWidth ? x - TOOLTIP_WIDTH - 16 : x + 16;
  const adjustedY = Math.max(8, y - 60);

  return (
    <div
      role="tooltip"
      style={{
        position: 'fixed',
        left: adjustedX,
        top: adjustedY,
        width: TOOLTIP_WIDTH,
        zIndex: 50,
        pointerEvents: 'none',
      }}
      className="rounded-lg border border-slate-700 bg-slate-800 shadow-xl p-3 text-sm"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className="font-mono font-semibold text-slate-100 leading-tight break-all"
          style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
        >
          {node.label}
        </span>
        <span
          className={`shrink-0 px-1.5 py-0.5 rounded border text-xs font-mono uppercase ${badgeClass}`}
          style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
        >
          {node.nodeType}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
        <MetricRow label="Fan-in" value={String(fanIn)} />
        <MetricRow label="LOC" value={String(node.loc)} />
        {impact !== null && (
          <MetricRow
            label="Impact"
            value={`${impact.impactScore}`}
            valueClass={impactColor(impact.impactScore)}
          />
        )}
        {simResult !== null && (
          <MetricRow
            label="Failure prob"
            value={formatPercent(simResult.failureProbability)}
            valueClass={failureColor(simResult.failureProbability)}
          />
        )}
        {impact?.onCriticalPath && (
          <div className="col-span-2 mt-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-mono">Critical path</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function MetricRow({
  label,
  value,
  valueClass = 'text-slate-200',
}: {
  label: string;
  value: string;
  valueClass?: string;
}): React.JSX.Element {
  return (
    <>
      <span className="text-slate-500 text-xs">{label}</span>
      <span
        className={`text-xs font-mono ${valueClass}`}
        style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
      >
        {value}
      </span>
    </>
  );
}
