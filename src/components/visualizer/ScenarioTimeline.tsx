'use client';

/**
 * DryRun — Scenario Timeline
 * Agent 5: Interactive System Visualizer
 *
 * Step scrubber for simulation playback.
 * Provides Play/Pause, Step Forward, Step Back, and a step indicator.
 * Also drives the animOffset clock used by GraphCanvas and EdgeLayer.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useSimulation } from './context/SimulationContext';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Milliseconds between automatic step advances during playback */
const STEP_INTERVAL_MS = 900;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScenarioTimelineProps {
  /** Callback to receive the updated animOffset (0–1 cycle) on each RAF tick */
  onAnimOffset?: (offset: number) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScenarioTimeline({ onAnimOffset }: ScenarioTimelineProps): React.JSX.Element {
  const { state, setStep, stepForward, stepBack } = useSimulation();
  const { currentStep, totalSteps, phase } = state;

  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const animStartRef = useRef<number | null>(null);

  const isActive = phase === 'SIMULATING' || phase === 'COMPLETE';
  const hasSteps = totalSteps > 0;
  const atEnd = currentStep >= totalSteps - 1;
  const atStart = currentStep <= 0;

  // ---------------------------------------------------------------------------
  // Animation clock (drives pulsing / edge animations independent of steps)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!onAnimOffset) return;

    function tick(timestamp: number): void {
      if (animStartRef.current === null) animStartRef.current = timestamp;
      const elapsed = timestamp - animStartRef.current;
      const offset = (elapsed % 2000) / 2000; // 2-second cycle
      onAnimOffset?.(offset);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      animStartRef.current = null;
    };
  }, [onAnimOffset]);

  // ---------------------------------------------------------------------------
  // Auto-play step advancement
  // ---------------------------------------------------------------------------

  const stopPlayback = useCallback((): void => {
    setIsPlaying(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPlayback = useCallback((): void => {
    if (atEnd) {
      // Restart from beginning
      setStep(0);
    }
    setIsPlaying(true);
  }, [atEnd, setStep]);

  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      if (atEnd) {
        stopPlayback();
        return;
      }
      stepForward();
    }, STEP_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [isPlaying, atEnd, stepForward, stopPlayback]);

  // Stop playback on phase change
  useEffect(() => {
    if (!isActive) stopPlayback();
  }, [isActive, stopPlayback]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const progressPercent = hasSteps ? (currentStep / Math.max(totalSteps - 1, 1)) * 100 : 0;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
      <div className="flex items-center justify-between mb-2">
        <h3
          className="text-xs font-semibold text-slate-400 uppercase tracking-widest"
          style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
        >
          Simulation Timeline
        </h3>
        {hasSteps && (
          <span
            className="text-xs font-mono text-slate-400"
            aria-live="polite"
            style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
          >
            Step {currentStep + 1} / {totalSteps}
          </span>
        )}
      </div>

      {/* Scrubber */}
      <div className="mb-3">
        <input
          type="range"
          min={0}
          max={Math.max(totalSteps - 1, 0)}
          value={currentStep}
          disabled={!isActive || !hasSteps}
          onChange={(e) => setStep(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: isActive
              ? `linear-gradient(to right, #8b5cf6 ${progressPercent}%, #334155 ${progressPercent}%)`
              : '#334155',
          }}
          aria-label="Simulation step"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <TimelineButton
          onClick={stepBack}
          disabled={!isActive || atStart}
          label="Step back"
          icon={<ChevronLeft className="h-4 w-4" />}
        />

        <button
          type="button"
          disabled={!isActive || !hasSteps}
          onClick={isPlaying ? stopPlayback : startPlayback}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <TimelineButton
          onClick={stepForward}
          disabled={!isActive || atEnd}
          label="Step forward"
          icon={<ChevronRight className="h-4 w-4" />}
        />
      </div>

      {/* Step breadcrumbs */}
      {hasSteps && totalSteps <= 12 && (
        <div className="flex items-center justify-center gap-1 mt-3" aria-hidden="true">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <button
              key={i}
              type="button"
              disabled={!isActive}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all duration-150 disabled:cursor-default ${
                i === currentStep
                  ? 'w-4 bg-violet-500'
                  : i < currentStep
                    ? 'w-1.5 bg-violet-800'
                    : 'w-1.5 bg-slate-600'
              }`}
              aria-label={`Jump to step ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function TimelineButton({
  onClick,
  disabled,
  label,
  icon,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  icon: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center h-8 w-8 rounded-md border border-slate-600 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
      aria-label={label}
    >
      {icon}
    </button>
  );
}
