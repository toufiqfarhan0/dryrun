/**
 * DryRun — Chaos Fault Injection Engine
 * Decay Functions
 *
 * Models how failure probability attenuates across network hops.
 * Each function accepts the base probability and the hop depth, returning
 * a clamped [0, 1] failure probability at that depth.
 */

import type { SpreadDecayModel } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum hop depth at which STEP decay drops probability to zero. */
const STEP_DECAY_THRESHOLD = 3;

// ---------------------------------------------------------------------------
// Individual decay implementations
// ---------------------------------------------------------------------------

/**
 * Exponential decay — probability halves (or scales) with each hop.
 *
 * P(depth) = initialProb × decayFactor^depth
 *
 * @param initialProb  - Starting probability at depth 0 (0–1).
 * @param depth        - Number of hops from the fault origin.
 * @param decayFactor  - Per-hop transmission coefficient (0–1).
 */
export function exponentialDecay(
  initialProb: number,
  depth: number,
  decayFactor: number,
): number {
  return Math.min(1, Math.max(0, initialProb * Math.pow(decayFactor, depth)));
}

/**
 * Linear decay — probability decreases at a constant rate per hop.
 *
 * P(depth) = max(0, initialProb − depth × rate)
 *
 * `rate` is derived from `decayFactor`: rate = (1 − decayFactor).
 * A decayFactor of 0.7 means 30 % of the remaining probability is lost
 * each hop.
 *
 * @param initialProb  - Starting probability at depth 0 (0–1).
 * @param depth        - Number of hops from the fault origin.
 * @param decayFactor  - Per-hop retention (0–1); loss per hop = 1 − decayFactor.
 */
export function linearDecay(
  initialProb: number,
  depth: number,
  decayFactor: number,
): number {
  const rate = 1 - decayFactor;
  return Math.min(1, Math.max(0, initialProb - depth * rate));
}

/**
 * Step decay — probability holds constant within a threshold, then drops to zero.
 *
 * P(depth) = initialProb   if depth ≤ STEP_DECAY_THRESHOLD
 *           0              otherwise
 *
 * Models a fault that is fully contained beyond a defined blast radius.
 *
 * @param initialProb  - Starting probability at depth 0 (0–1).
 * @param depth        - Number of hops from the fault origin.
 */
export function stepDecay(initialProb: number, depth: number): number {
  return depth <= STEP_DECAY_THRESHOLD ? Math.min(1, Math.max(0, initialProb)) : 0;
}

// ---------------------------------------------------------------------------
// Decay function type & factory
// ---------------------------------------------------------------------------

/** Unified signature: (initialProb, depth, decayFactor) → probability */
export type DecayFn = (initialProb: number, depth: number, decayFactor: number) => number;

/**
 * Returns the appropriate decay function for the requested model.
 *
 * @param model - One of 'EXPONENTIAL' | 'LINEAR' | 'STEP'
 */
export function getDecayFunction(model: SpreadDecayModel): DecayFn {
  switch (model) {
    case 'EXPONENTIAL':
      return exponentialDecay;
    case 'LINEAR':
      return linearDecay;
    case 'STEP':
      // step decay ignores decayFactor; wrap it to match the unified signature
      return (initialProb: number, depth: number, _decayFactor: number) =>
        stepDecay(initialProb, depth);
  }
}
