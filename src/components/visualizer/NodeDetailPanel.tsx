'use client';

/**
 * DryRun — Node Detail Panel
 * Agent 5: Interactive System Visualizer
 *
 * Slide-in drawer displaying full metadata for the selected graph node:
 * - Node info, LOC, criticality rating, blast score
 * - Direct upstream callers and downstream dependents
 * - Fault injection override (force-fail toggle)
 */

import React, { useMemo } from 'react';
import { X, AlertTriangle, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { useSimulation } from './context/SimulationContext';
import type { NodeId, NodeType } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NODE_TYPE_LABEL: Record<NodeType, string> = {
  SERVICE: 'Service',
  MODULE: 'Module',
  EXTERNAL: 'External',
  CONFIG: 'Config',
  TEST: 'Test',
};

const NODE_TYPE_COLOR: Record<NodeType, string> = {
  SERVICE: 'text-violet-400 border-violet-700 bg-violet-900/40',
  MODULE: 'text-slate-300 border-slate-600 bg-slate-700/40',
  EXTERNAL: 'text-sky-400 border-sky-700 bg-sky-900/40',
  CONFIG: 'text-amber-400 border-amber-700 bg-amber-900/40',
  TEST: 'text-emerald-400 border-emerald-700 bg-emerald-900/40',
};

const FONT_MONO: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function criticalityRating(impactScore: number): { label: string; color: string } {
  if (impactScore >= 81) return { label: 'CRITICAL', color: '#ef4444' };
  if (impactScore >= 61) return { label: 'HIGH', color: '#f97316' };
  if (impactScore >= 41) return { label: 'MEDIUM', color: '#facc15' };
  if (impactScore >= 21) return { label: 'LOW', color: '#38bdf8' };
  return { label: 'SAFE', color: '#10b981' };
}

function formatProb(p: number): string {
  return `${Math.round(p * 100)}%`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface OverriddenNodes {
  nodeId: NodeId;
  forced: boolean;
}

export function NodeDetailPanel(): React.JSX.Element | null {
  const { state, selectNode } = useSimulation();
  const { selectedNodeId, graph, blastReport, chaosResult } = state;
  const [forcedFails, setForcedFails] = React.useState<Set<NodeId>>(new Set());

  const node = selectedNodeId && graph ? graph.nodes[selectedNodeId] : null;
  if (!node || !selectedNodeId || !graph) return null;

  // Narrowed non-null references (TypeScript narrowing from guards above)
  const narrowedGraph = graph;

  const impact = blastReport?.impacts[selectedNodeId] ?? null;
  const simResult = chaosResult?.nodeResults[selectedNodeId] ?? null;
  const impactScore = impact?.impactScore ?? 0;
  const { label: criticality, color: criticColor } = criticalityRating(impactScore);

  // Direct upstream callers (edges where target = selectedNodeId)
  const upstreamCallers: NodeId[] = useMemo(() => {
    return narrowedGraph.edges
      .filter((e) => e.target === selectedNodeId)
      .map((e) => e.source)
      .slice(0, 8);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- narrowedGraph reference is stable
  }, [narrowedGraph, selectedNodeId]);

  // Direct downstream dependents (edges where source = selectedNodeId)
  const downstreamDeps: NodeId[] = useMemo(() => {
    return narrowedGraph.edges
      .filter((e) => e.source === selectedNodeId)
      .map((e) => e.target)
      .slice(0, 8);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- narrowedGraph reference is stable
  }, [narrowedGraph, selectedNodeId]);

  const isForcedFail = forcedFails.has(selectedNodeId);

  const toggleForcedFail = (): void => {
    setForcedFails((prev) => {
      const next = new Set(prev);
      if (next.has(selectedNodeId)) {
        next.delete(selectedNodeId);
      } else {
        next.add(selectedNodeId);
      }
      return next;
    });
  };

  return (
    <div
      role="complementary"
      aria-label="Node detail panel"
      className="flex flex-col h-full w-full bg-slate-900 border-l border-slate-700 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
        <div className="min-w-0">
          <p
            className="text-xs text-slate-500 mb-0.5"
            style={FONT_MONO}
          >
            {node.filePath}
          </p>
          <h2 className="text-base font-semibold text-slate-100 leading-tight break-all" style={FONT_MONO}>
            {node.label}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => selectNode(null)}
          className="shrink-0 text-slate-500 hover:text-slate-200 transition-colors mt-0.5"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-4 space-y-5">
        {/* Type badge + criticality */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-2 py-0.5 rounded border text-xs font-semibold font-mono ${NODE_TYPE_COLOR[node.nodeType]}`}
            style={FONT_MONO}
          >
            {NODE_TYPE_LABEL[node.nodeType]}
          </span>
          {node.isEntryPoint && (
            <span
              className="px-2 py-0.5 rounded border border-violet-700 bg-violet-900/40 text-violet-400 text-xs font-semibold"
              style={FONT_MONO}
            >
              ENTRY POINT
            </span>
          )}
          <span
            className="px-2 py-0.5 rounded border text-xs font-semibold"
            style={{ ...FONT_MONO, color: criticColor, borderColor: criticColor + '55', backgroundColor: criticColor + '11' }}
          >
            {criticality}
          </span>
        </div>

        {/* Metrics grid */}
        <section>
          <SectionHeading>Metrics</SectionHeading>
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="LOC" value={String(node.loc)} />
            <MetricCard label="Blast Score" value={String(impactScore)} valueColor={criticColor} />
            <MetricCard label="Blast Depth" value={impact ? String(impact.blastDepth) : '—'} />
            <MetricCard label="Dependents" value={impact ? String(impact.dependentCount) : '—'} />
            {simResult && (
              <>
                <MetricCard
                  label="Failure Prob"
                  value={formatProb(simResult.failureProbability)}
                  valueColor={simResult.failureProbability >= 0.6 ? '#ef4444' : '#10b981'}
                />
                <MetricCard
                  label="Latency ×"
                  value={`${simResult.estimatedLatencyMultiplier.toFixed(1)}×`}
                />
              </>
            )}
          </div>
          {impact?.onCriticalPath && (
            <div className="mt-2 flex items-center gap-1.5 text-red-400 text-xs" style={FONT_MONO}>
              <AlertTriangle className="h-3.5 w-3.5" />
              On critical failure path
            </div>
          )}
        </section>

        {/* Upstream callers */}
        {upstreamCallers.length > 0 && (
          <section>
            <SectionHeading>
              <ArrowUpRight className="h-3.5 w-3.5 inline-block mr-1 text-sky-400" />
              Upstream callers ({upstreamCallers.length})
            </SectionHeading>
            <ul className="space-y-1">
              {upstreamCallers.map((id) => (
                <NodeListItem key={id} nodeId={id} graph={narrowedGraph} onClick={() => selectNode(id)} />
              ))}
            </ul>
          </section>
        )}

        {/* Downstream dependents */}
        {downstreamDeps.length > 0 && (
          <section>
            <SectionHeading>
              <ArrowDownRight className="h-3.5 w-3.5 inline-block mr-1 text-orange-400" />
              Downstream dependents ({downstreamDeps.length})
            </SectionHeading>
            <ul className="space-y-1">
              {downstreamDeps.map((id) => (
                <NodeListItem key={id} nodeId={id} graph={narrowedGraph} onClick={() => selectNode(id)} />
              ))}
            </ul>
          </section>
        )}

        {/* Fault injection override */}
        <section>
          <SectionHeading>
            <Zap className="h-3.5 w-3.5 inline-block mr-1 text-yellow-400" />
            Fault Injection Override
          </SectionHeading>
          <div className="flex items-center justify-between p-3 rounded-md border border-slate-700 bg-slate-800">
            <div>
              <p className="text-sm text-slate-200 font-semibold" style={FONT_MONO}>
                Force node failure
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Override: treat this node as fully failed in the current scenario
              </p>
            </div>
            <button
              type="button"
              onClick={toggleForcedFail}
              role="switch"
              aria-checked={isForcedFail}
              className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
                isForcedFail
                  ? 'bg-red-600 border-red-500'
                  : 'bg-slate-700 border-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isForcedFail ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {isForcedFail && (
            <p
              className="mt-2 text-xs text-red-400 flex items-center gap-1"
              style={FONT_MONO}
              aria-live="polite"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Node manually forced to FAILED state
            </p>
          )}
        </section>

        {/* Exports */}
        {node.exports.length > 0 && (
          <section>
            <SectionHeading>Exports ({node.exports.length})</SectionHeading>
            <div className="flex flex-wrap gap-1.5">
              {node.exports.slice(0, 12).map((exp) => (
                <span
                  key={exp}
                  className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs text-slate-400"
                  style={FONT_MONO}
                >
                  {exp}
                </span>
              ))}
              {node.exports.length > 12 && (
                <span className="text-xs text-slate-600" style={FONT_MONO}>
                  +{node.exports.length - 12} more
                </span>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <h3
      className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2"
      style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
    >
      {children}
    </h3>
  );
}

function MetricCard({
  label,
  value,
  valueColor = '#f1f5f9',
}: {
  label: string;
  value: string;
  valueColor?: string;
}): React.JSX.Element {
  return (
    <div className="px-2.5 py-2 rounded bg-slate-800 border border-slate-700">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p
        className="text-sm font-semibold font-mono"
        style={{ color: valueColor, fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
      >
        {value}
      </p>
    </div>
  );
}

function NodeListItem({
  nodeId,
  graph,
  onClick,
}: {
  nodeId: NodeId;
  graph: { nodes: Record<NodeId, { label: string; nodeType: string }> };
  onClick: () => void;
}): React.JSX.Element {
  const node = graph.nodes[nodeId];
  const label = node?.label ?? nodeId;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 hover:border-violet-600 text-xs text-slate-300 font-mono transition-colors"
        style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
      >
        {label}
      </button>
    </li>
  );
}

export type { OverriddenNodes };
