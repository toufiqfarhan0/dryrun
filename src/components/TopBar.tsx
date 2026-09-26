'use client';

/**
 * DryRun — TopBar
 * Navigation header: wordmark, IBM Bob 2.0 badge, live status dot,
 * project chip, dynamic risk score pill, and theme toggle.
 */

import React from 'react';
import { Zap, Sun, Moon, X } from 'lucide-react';
import type { RiskLevel, StatusType } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT_MONO: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
};

// ---------------------------------------------------------------------------
// Helper — map RiskLevel → CSS pill class
// ---------------------------------------------------------------------------

function resolveStatusClass(status: RiskLevel): string {
  switch (status) {
    case 'danger':
      return 'status-pill-danger';
    case 'warn':
      return 'status-pill-warn';
    case 'ok':
    default:
      return 'status-pill-ok';
  }
}

// ---------------------------------------------------------------------------
// Helper — map risk_score → severity label + pill class
// ---------------------------------------------------------------------------

interface RiskPillConfig {
  label: string;
  pillClass: string;
  dotClass: string;
}

function resolveRiskPill(score: number): RiskPillConfig {
  if (score >= 80) {
    return {
      label: `Critical — ${score}`,
      pillClass: 'badge-critical border',
      dotClass: 'bg-red-500',
    };
  }
  if (score >= 60) {
    return {
      label: `High — ${score}`,
      pillClass: 'badge-high border',
      dotClass: 'bg-orange-500',
    };
  }
  if (score >= 35) {
    return {
      label: `Medium — ${score}`,
      pillClass: 'badge-medium border',
      dotClass: 'bg-yellow-400',
    };
  }
  if (score > 0) {
    return {
      label: `Low — ${score}`,
      pillClass: 'badge-low border',
      dotClass: 'bg-emerald-500',
    };
  }
  return {
    label: 'Zero Risk',
    pillClass: 'badge-low border',
    dotClass: 'bg-emerald-500',
  };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TopBarProps {
  /** Live system status used to colour the pulse dot */
  systemStatus: RiskLevel;
  /** Human-readable system status label (e.g. "ACTIVE", "CRITICAL FAILURE") */
  statusLabel: StatusType;
  /** Optional project name shown in the chip; null hides it */
  projectName: string | null;
  /** Aggregate risk score 0–100; drives the risk pill */
  riskScore: number;
  /** Called when the user clicks the × on the project chip */
  onResetProject: () => void;
  /** Current theme */
  theme: 'dark' | 'light';
  /** Called when the user toggles the theme */
  onToggleTheme: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TopBar({
  systemStatus,
  statusLabel,
  projectName,
  riskScore,
  onResetProject,
  theme,
  onToggleTheme,
}: TopBarProps): React.JSX.Element {
  const statusPillClass = resolveStatusClass(systemStatus);
  const riskPill = resolveRiskPill(riskScore);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-3 px-5 py-2.5
                 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-md"
    >
      {/* ── Left: wordmark + IBM Bob badge ── */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="text-lg font-bold tracking-tight text-slate-100"
          style={FONT_MONO}
          aria-label="DryRun"
        >
          Dry<span className="text-violet-500">Run</span>
        </span>

        <span
          className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                     border border-violet-500/40 bg-violet-500/10 text-violet-400
                     text-[10px] font-semibold tracking-widest uppercase select-none"
          style={FONT_MONO}
        >
          <Zap size={9} aria-hidden="true" />
          IBM Bob 2.0
        </span>
      </div>

      {/* ── Centre: status dot + label + project chip ── */}
      <div className="flex items-center gap-3 overflow-hidden min-w-0">
        {/* Live status dot */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusPillClass}`}
          style={FONT_MONO}
          aria-live="polite"
          aria-label={`System status: ${statusLabel}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse-dot ${
              systemStatus === 'danger'
                ? 'bg-red-500'
                : systemStatus === 'warn'
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
            }`}
            aria-hidden="true"
          />
          {statusLabel}
        </span>

        {/* Project chip */}
        {projectName !== null && (
          <span
            className="hidden md:inline-flex items-center gap-1.5 max-w-[220px] truncate
                       px-2.5 py-1 rounded-full border border-slate-700 bg-slate-800/70
                       text-slate-300 text-xs font-medium"
            style={FONT_MONO}
            title={projectName}
          >
            <span className="truncate">{projectName}</span>
            <button
              type="button"
              onClick={onResetProject}
              className="ml-0.5 text-slate-500 hover:text-slate-200 transition-colors shrink-0"
              aria-label="Reset project"
            >
              <X size={11} aria-hidden="true" />
            </button>
          </span>
        )}
      </div>

      {/* ── Right: risk score pill + theme toggle ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        {riskScore > 0 && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${riskPill.pillClass}`}
            style={FONT_MONO}
            aria-label={`Risk score: ${riskPill.label}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${riskPill.dotClass}`} aria-hidden="true" />
            {riskPill.label}
          </span>
        )}

        {/* Theme toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex items-center justify-center w-7 h-7 rounded-md border border-slate-700
                     bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:border-slate-600
                     transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-violet-500"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun size={13} aria-hidden="true" />
          ) : (
            <Moon size={13} aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
}
