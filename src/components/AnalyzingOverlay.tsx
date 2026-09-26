'use client';

/**
 * DryRun — AnalyzingOverlay
 * Full-screen glassmorphic re-simulation loading overlay.
 *
 * Shown while a new chaos simulation run is in flight.
 * Renders over the existing dashboard — use position:fixed + z-index.
 */

import React from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT_MONO: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
};

// ---------------------------------------------------------------------------
// Dual-ring spinner
// ---------------------------------------------------------------------------

function DualRingSpinner(): React.JSX.Element {
  return (
    <div
      className="relative w-16 h-16"
      role="img"
      aria-label="Loading spinner"
    >
      {/* Outer ring */}
      <span
        className="absolute inset-0 rounded-full border-2 border-transparent
                   border-t-violet-500 animate-spin-slow"
        aria-hidden="true"
      />
      {/* Inner ring (counter-spin) */}
      <span
        className="absolute inset-2.5 rounded-full border-2 border-transparent
                   border-b-violet-400/60 animate-spin-reverse"
        aria-hidden="true"
      />
      {/* Centre dot */}
      <span
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse-dot" />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AnalyzingOverlayProps {
  /** Primary message (e.g. "Re-running chaos simulation…") */
  message: string;
  /** Optional secondary detail line */
  detail?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AnalyzingOverlay({
  message,
  detail,
}: AnalyzingOverlayProps): React.JSX.Element {
  return (
    <div
      role="status"
      aria-live="assertive"
      aria-label={message}
      className="fixed inset-0 z-50 flex items-center justify-center glass-panel-dark scanlines"
    >
      {/* Micro-grid texture behind the panel */}
      <div className="absolute inset-0 bg-micro-grid opacity-30" aria-hidden="true" />

      {/* Content card */}
      <div
        className="relative z-10 flex flex-col items-center gap-5
                   rounded-2xl border border-violet-500/20 bg-slate-950/80
                   backdrop-blur-xl px-10 py-10 shadow-2xl shadow-violet-900/20
                   max-w-sm w-full mx-4 text-center"
      >
        {/* Glow ring behind spinner */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full bg-violet-500/10 blur-xl scale-150"
            aria-hidden="true"
          />
          <DualRingSpinner />
        </div>

        {/* Message */}
        <div>
          <p
            className="text-sm font-bold text-slate-200 leading-snug mb-1"
            style={FONT_MONO}
          >
            {message}
          </p>
          {detail !== undefined && detail.length > 0 && (
            <p
              className="text-xs text-slate-500"
              style={FONT_MONO}
            >
              {detail}
            </p>
          )}
        </div>

        {/* Animated progress stripe */}
        <div className="w-full h-0.5 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full animate-shimmer" />
        </div>

        {/* Subtle label */}
        <p
          className="text-[10px] text-slate-700 uppercase tracking-widest"
          style={FONT_MONO}
        >
          DryRun · Chaos Engine
        </p>
      </div>
    </div>
  );
}
