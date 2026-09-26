/**
 * DryRun — Shared Utilities
 * Calculations, colour mappings, and maths helpers used across the UI.
 */

import type { EventType, Issue, Severity, SimulationEvent } from '@/types';

// ---------------------------------------------------------------------------
// § 1. Async helpers
// ---------------------------------------------------------------------------

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// § 2. Colour maps
// ---------------------------------------------------------------------------

/** Tailwind class strings for risk-level backgrounds/borders */
export const riskColors: Record<string, string> = {
  danger: 'bg-red-500/20 border-red-500/60 text-red-400',
  warn: 'bg-yellow-500/20 border-yellow-500/60 text-yellow-400',
  ok: 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400',
};

/** Box-shadow glow strings for risk levels */
export const riskGlows: Record<string, string> = {
  danger: '0 0 12px rgba(239,68,68,0.45)',
  warn: '0 0 12px rgba(250,204,21,0.35)',
  ok: '0 0 12px rgba(16,185,129,0.30)',
};

/** Colour classes for Severity values */
export const severityColors: Record<Severity, string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

/** Colour classes for simulation EventType values */
export const statusColors: Record<EventType, string> = {
  danger: 'text-red-400',
  warn: 'text-yellow-400',
  normal: 'text-slate-400',
};

// ---------------------------------------------------------------------------
// § 3. Risk badge helper
// ---------------------------------------------------------------------------

interface RiskBadge {
  label: string;
  colorClass: string;
}

const RISK_BADGE_CRITICAL_THRESHOLD = 75;
const RISK_BADGE_HIGH_THRESHOLD = 50;
const RISK_BADGE_MEDIUM_THRESHOLD = 25;

/**
 * Returns a human-readable label and Tailwind colour class for a numeric
 * risk score in the range [0, 100].
 */
export function getRiskBadgeClass(score: number): RiskBadge {
  if (score >= RISK_BADGE_CRITICAL_THRESHOLD) {
    return { label: 'CRITICAL', colorClass: 'bg-red-500/20 text-red-400 border-red-500/40' };
  }
  if (score >= RISK_BADGE_HIGH_THRESHOLD) {
    return { label: 'HIGH', colorClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40' };
  }
  if (score >= RISK_BADGE_MEDIUM_THRESHOLD) {
    return { label: 'MEDIUM', colorClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' };
  }
  return { label: 'LOW', colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
}

// ---------------------------------------------------------------------------
// § 4. Score → CSS colour string
// ---------------------------------------------------------------------------

/**
 * Maps a numeric risk score [0, 100] to a CSS colour string.
 * Uses the telemetry colour palette from .bobrules.
 */
export function getScoreColor(score: number): string {
  if (score >= RISK_BADGE_CRITICAL_THRESHOLD) return '#ef4444'; // red-500
  if (score >= RISK_BADGE_HIGH_THRESHOLD) return '#f97316';     // orange-500
  if (score >= RISK_BADGE_MEDIUM_THRESHOLD) return '#facc15';   // yellow-400
  return '#10b981';                                              // emerald-500
}

// ---------------------------------------------------------------------------
// § 5. Formatting
// ---------------------------------------------------------------------------

const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
const FILE_SIZE_UNIT_STEP = 1024;

/** Returns a human-readable file-size string (e.g. "1.4 MB"). */
export function formatFileSize(bytes: number): string {
  let value = bytes;
  let unitIndex = 0;
  while (value >= FILE_SIZE_UNIT_STEP && unitIndex < FILE_SIZE_UNITS.length - 1) {
    value /= FILE_SIZE_UNIT_STEP;
    unitIndex++;
  }
  const unit = FILE_SIZE_UNITS[unitIndex] ?? 'B';
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${unit}`;
}

// ---------------------------------------------------------------------------
// § 6. Simulation maths
// ---------------------------------------------------------------------------

const DAMAGE_DANGER = 18;
const DAMAGE_WARN = 8;
const DAMAGE_CAP = 100;

/**
 * Accumulates blast damage from simulation events up to (and including) the
 * event at index `upTo`.  danger events add 18, warn events add 8, capped at 100.
 */
export function computeDamage(events: SimulationEvent[], upTo: number): number {
  const slice = events.slice(0, upTo + 1);
  const raw = slice.reduce((acc, ev) => {
    if (ev.type === 'danger') return acc + DAMAGE_DANGER;
    if (ev.type === 'warn') return acc + DAMAGE_WARN;
    return acc;
  }, 0);
  return Math.min(raw, DAMAGE_CAP);
}

// ---------------------------------------------------------------------------
// § 7. Remediation & cost estimates
// ---------------------------------------------------------------------------

interface RemediationSummary {
  autoFixCount: number;
  manualFixCount: number;
  totalMinutes: number;
}

const REMEDIATION_MINUTES: Record<Severity, number> = {
  critical: 120,
  high: 60,
  medium: 30,
  low: 10,
};

/** Splits issues into auto-fixable vs manual and estimates total remediation time. */
export function computeRemediation(issues: Issue[]): RemediationSummary {
  let autoFixCount = 0;
  let manualFixCount = 0;
  let totalMinutes = 0;

  for (const issue of issues) {
    const minutes = REMEDIATION_MINUTES[issue.severity] ?? 30;
    totalMinutes += minutes;
    // Security issues with low/medium severity are auto-fixable; the rest are manual
    if (issue.type === 'security' && (issue.severity === 'low' || issue.severity === 'medium')) {
      autoFixCount++;
    } else {
      manualFixCount++;
    }
  }

  return { autoFixCount, manualFixCount, totalMinutes };
}

interface CostEstimate {
  hourly: number;
  daily: number;
}

const COST_PER_RISK_POINT_HOURLY = 12.5; // USD per risk point per hour
const HOURS_PER_DAY = 24;

/** Estimates incident cost (USD) based on risk score. */
export function computeCostEstimate(riskScore: number): CostEstimate {
  const hourly = Math.round(riskScore * COST_PER_RISK_POINT_HOURLY);
  const daily = hourly * HOURS_PER_DAY;
  return { hourly, daily };
}

/** Returns a worst-case downtime string based on risk score. */
export function computeWorstCaseDowntime(riskScore: number): string {
  if (riskScore >= 90) return '72+ hours';
  if (riskScore >= 75) return '24–48 hours';
  if (riskScore >= 50) return '4–12 hours';
  if (riskScore >= 25) return '30–90 minutes';
  return '< 15 minutes';
}
