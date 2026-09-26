'use client';

/**
 * DryRun — Simulation Context
 * Agent 5: Interactive System Visualizer
 *
 * React context provider that wraps the simulation reducer and exposes
 * both state and typed action creator helpers to child components.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import {
  simulationReducer,
  INITIAL_STATE,
  type SimulationState,
  type SimulationAction,
  type PresetKey,
} from './simulation-reducer';
import type {
  DependencyGraph,
  BlastRadiusReport,
  ChaosSimulationResult,
  ReleaseGateDecision,
  NodeId,
} from '@/types';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface SimulationContextValue {
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
  // --- Action creator helpers ---
  loadGraph: (graph: DependencyGraph, blastReport: BlastRadiusReport) => void;
  setPreset: (preset: PresetKey) => void;
  startSimulation: (chaosResult: ChaosSimulationResult, totalSteps: number) => void;
  setStep: (step: number) => void;
  stepForward: () => void;
  stepBack: () => void;
  streamGateChunk: (chunk: string) => void;
  setGateDecision: (decision: ReleaseGateDecision) => void;
  selectNode: (nodeId: NodeId | null) => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Context creation
// ---------------------------------------------------------------------------

const SimulationContext = createContext<SimulationContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function SimulationProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [state, dispatch] = useReducer(simulationReducer, INITIAL_STATE);

  const loadGraph = useCallback(
    (graph: DependencyGraph, blastReport: BlastRadiusReport): void => {
      dispatch({ type: 'LOAD_GRAPH', payload: { graph, blastReport } });
    },
    [],
  );

  const setPreset = useCallback((preset: PresetKey): void => {
    dispatch({ type: 'SET_PRESET', payload: { preset } });
  }, []);

  const startSimulation = useCallback(
    (chaosResult: ChaosSimulationResult, totalSteps: number): void => {
      dispatch({ type: 'START_SIMULATION', payload: { chaosResult, totalSteps } });
    },
    [],
  );

  const setStep = useCallback((step: number): void => {
    dispatch({ type: 'SET_STEP', payload: { step } });
  }, []);

  const stepForward = useCallback((): void => {
    dispatch({ type: 'STEP_FORWARD' });
  }, []);

  const stepBack = useCallback((): void => {
    dispatch({ type: 'STEP_BACK' });
  }, []);

  const streamGateChunk = useCallback((chunk: string): void => {
    dispatch({ type: 'STREAM_GATE_CHUNK', payload: { chunk } });
  }, []);

  const setGateDecision = useCallback((decision: ReleaseGateDecision): void => {
    dispatch({ type: 'SET_GATE_DECISION', payload: { decision } });
  }, []);

  const selectNode = useCallback((nodeId: NodeId | null): void => {
    dispatch({ type: 'SELECT_NODE', payload: { nodeId } });
  }, []);

  const reset = useCallback((): void => {
    dispatch({ type: 'RESET' });
  }, []);

  const value: SimulationContextValue = {
    state,
    dispatch,
    loadGraph,
    setPreset,
    startSimulation,
    setStep,
    stepForward,
    stepBack,
    streamGateChunk,
    setGateDecision,
    selectNode,
    reset,
  };

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (ctx === null) {
    throw new Error('useSimulation must be used inside <SimulationProvider>');
  }
  return ctx;
}

export type { SimulationContextValue, SimulationState, SimulationAction, PresetKey };
