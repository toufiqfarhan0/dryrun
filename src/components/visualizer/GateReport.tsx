'use client';

/**
 * DryRun — Gate Report
 * Agent 5: Interactive System Visualizer
 *
 * Slide-over / modal showing:
 *  - Large APPROVED / BLOCKED deployment gate badge
 *  - Overall Blast Score radial gauge (0–100)
 *  - Streaming watsonx Granite narrative (markdown rendered as monospace blocks)
 *  - Rollback Runbook terminal code block with copy button
 *  - Mitigation list
 */

import React, { useState, useCallback } from 'react';
import { X, Copy, Check, ShieldCheck, ShieldX, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useSimulation } from './context/SimulationContext';
import type { GateDecision, SeverityLevel } from '@/types';

// ---------------------------------------------------------------------------
// Constants & colour maps
// ---------------------------------------------------------------------------

const FONT_MONO: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
};

const DECISION_CONFIG: Record<
  GateDecision,
  { label: string; bg: string; border: string; text: string; Icon: React.ElementType }
> = {
  APPROVED: {
    label: 'APPROVED',
    bg: 'bg-emerald-900/40',
    border: 'border-emerald-500',
    text: 'text-emerald-400',
    Icon: ShieldCheck,
  },
  BLOCKED: {
    label: 'BLOCKED',
    bg: 'bg-red-900/40',
    border: 'border-red-500',
    text: 'text-red-400',
    Icon: ShieldX,
  },
};

const SEVERITY_CONFIG: Record<SeverityLevel, { color: string; bg: string }> = {
  CRITICAL: { color: '#ef4444', bg: 'bg-red-900/40' },
  HIGH: { color: '#f97316', bg: 'bg-orange-900/40' },
  MEDIUM: { color: '#facc15', bg: 'bg-yellow-900/40' },
  LOW: { color: '#10b981', bg: 'bg-emerald-900/40' },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface GateReportProps {
  /** When true the panel is visible */
  open: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Radial gauge
// ---------------------------------------------------------------------------

function BlastGauge({ score }: { score: number }): React.JSX.Element {
  const RADIUS = 44;
  const STROKE = 8;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const clamped = Math.max(0, Math.min(100, score));
  const dashOffset = CIRCUMFERENCE * (1 - clamped / 100);

  let gaugeColor = '#10b981'; // emerald
  if (clamped >= 80) gaugeColor = '#ef4444';
  else if (clamped >= 60) gaugeColor = '#f97316';
  else if (clamped >= 40) gaugeColor = '#facc15';

  const cx = RADIUS + STROKE;
  const cy = RADIUS + STROKE;
  const size = (RADIUS + STROKE) * 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} aria-label={`Blast score: ${clamped}`}>
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={RADIUS}
          fill="none"
          stroke="#1e293b"
          strokeWidth={STROKE}
        />
        {/* Foreground arc */}
        <circle
          cx={cx}
          cy={cy}
          r={RADIUS}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {/* Score label */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill={gaugeColor}
          fontSize="18"
          fontWeight="700"
          style={FONT_MONO}
        >
          {clamped}
        </text>
      </svg>
      <p className="text-xs text-slate-500 text-center" style={FONT_MONO}>
        Blast Score
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((): void => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-slate-200 text-xs transition-colors"
      aria-label="Copy runbook to clipboard"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Streaming narrative display
// ---------------------------------------------------------------------------

function NarrativeBlock({ narrative }: { narrative: string }): React.JSX.Element {
  return (
    <div
      className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words"
      style={FONT_MONO}
      aria-live="polite"
    >
      {narrative || (
        <span className="text-slate-600 animate-pulse">Streaming analysis from watsonx Granite…</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GateReport({ open, onClose }: GateReportProps): React.JSX.Element | null {
  const { state } = useSimulation();
  const { gateDecision, streamedNarrative, phase } = state;

  if (!open) return null;

  const isStreaming = phase === 'STREAMING';
  const decision = gateDecision?.decision;
  const severity = gateDecision?.severity;
  const runbook = gateDecision?.rollbackRunbook ?? [];
  const mitigations = gateDecision?.mitigations ?? [];
  const blastScore = gateDecision?.blastScore ?? state.chaosResult?.aggregateRiskScore ?? 0;

  const decisionCfg = decision ? DECISION_CONFIG[decision] : null;
  const severityCfg = severity ? SEVERITY_CONFIG[severity] : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Gate Report"
        className="fixed right-0 top-0 h-full w-full max-w-xl bg-slate-900 border-l border-slate-700 z-50 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0">
          <h2 className="text-sm font-semibold text-slate-200" style={FONT_MONO}>
            watsonx Release Gate Report
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 transition-colors"
            aria-label="Close gate report"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Gate badge + gauge */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-slate-800">
            {decisionCfg ? (
              <div
                className={`flex items-center gap-3 flex-1 px-4 py-3 rounded-lg border-2 ${decisionCfg.bg} ${decisionCfg.border}`}
              >
                <decisionCfg.Icon className={`h-8 w-8 ${decisionCfg.text}`} />
                <div>
                  <p
                    className={`text-2xl font-bold tracking-widest ${decisionCfg.text}`}
                    style={FONT_MONO}
                  >
                    {decisionCfg.label}
                  </p>
                  {severity && severityCfg && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ ...FONT_MONO, color: severityCfg.color }}
                    >
                      Severity: {severity}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-lg border-2 border-slate-700 bg-slate-800/40">
                <ShieldAlert className="h-8 w-8 text-slate-500 animate-pulse" />
                <div>
                  <p className="text-xl font-bold tracking-widest text-slate-500" style={FONT_MONO}>
                    {isStreaming ? 'EVALUATING…' : 'PENDING'}
                  </p>
                </div>
              </div>
            )}
            <BlastGauge score={blastScore} />
          </div>

          {/* Narrative */}
          <section>
            <GateSectionHeading>
              {isStreaming ? (
                <span className="flex items-center gap-1.5">
                  Streaming Analysis
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                </span>
              ) : (
                'Analysis Narrative'
              )}
            </GateSectionHeading>
            <div className="rounded-md border border-slate-700 bg-slate-800 px-4 py-3 max-h-72 overflow-y-auto">
              <NarrativeBlock narrative={streamedNarrative} />
            </div>
          </section>

          {/* Mitigations */}
          {mitigations.length > 0 && (
            <section>
              <GateSectionHeading>
                <AlertTriangle className="h-3.5 w-3.5 inline-block mr-1.5 text-yellow-400" />
                Recommended Mitigations
              </GateSectionHeading>
              <ul className="space-y-2">
                {mitigations.map((m) => {
                  const sev = SEVERITY_CONFIG[m.priority];
                  return (
                    <li
                      key={`${m.nodeId}-${m.priority}`}
                      className={`flex gap-3 p-3 rounded-md border border-slate-700 ${sev.bg}`}
                    >
                      <span
                        className="h-2 w-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: sev.color }}
                      />
                      <div className="min-w-0">
                        <p
                          className="text-xs font-semibold truncate"
                          style={{ ...FONT_MONO, color: sev.color }}
                        >
                          {m.nodeId}
                        </p>
                        <p className="text-sm text-slate-300 mt-0.5 leading-snug">
                          {m.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Rollback Runbook */}
          {runbook.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <GateSectionHeading>Rollback Runbook</GateSectionHeading>
                <CopyButton text={runbook.join('\n')} />
              </div>
              <div className="rounded-md border border-slate-700 bg-[#020617] p-4 overflow-x-auto">
                <pre className="text-xs text-emerald-400 leading-relaxed" style={FONT_MONO}>
                  <code>{runbook.join('\n')}</code>
                </pre>
              </div>
            </section>
          )}

          {/* Confidence */}
          {gateDecision && (
            <p className="text-xs text-slate-600 text-right" style={FONT_MONO}>
              Confidence: {Math.round(gateDecision.confidenceScore * 100)}% ·{' '}
              {new Date(gateDecision.generatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function GateSectionHeading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <h3
      className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2"
      style={FONT_MONO}
    >
      {children}
    </h3>
  );
}
