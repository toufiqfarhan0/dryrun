/**
 * DryRun — Simulation Reducer
 * Agent 5: Interactive System Visualizer
 *
 * Pure reducer implementing the frontend state machine.
 * No side-effects; every action is deterministic.
 *
 * State machine:
 *   IDLE → ANALYZING → SIMULATING → STREAMING → COMPLETE
 *                                              → ERROR  (from any state)
 */

import type {
  DependencyGraph,
  BlastRadiusReport,
  ChaosSimulationResult,
  ReleaseGateDecision,
  NodeId,
} from '@/types';

// ---------------------------------------------------------------------------
// State type
// ---------------------------------------------------------------------------

export type SimulationPhase =
  | 'IDLE'
  | 'ANALYZING'
  | 'SIMULATING'
  | 'STREAMING'
  | 'COMPLETE'
  | 'ERROR';

export type PresetKey = 'authSchemaBreaking' | 'dbPoolExhaustion' | 'monolithMigration';

export interface SimulationState {
  phase: SimulationPhase;
  /** Active preset scenario key (null = none selected) */
  activePreset: PresetKey | null;
  graph: DependencyGraph | null;
  blastReport: BlastRadiusReport | null;
  chaosResult: ChaosSimulationResult | null;
  /** Current timeline step (0-based) */
  currentStep: number;
  /** Total steps in the simulation timeline */
  totalSteps: number;
  /** Node currently selected in the graph */
  selectedNodeId: NodeId | null;
  /** Streaming narrative chunks accumulated so far */
  streamedNarrative: string;
  /** Final gate decision (null until streaming is complete) */
  gateDecision: ReleaseGateDecision | null;
  /** Error message when phase === 'ERROR' */
  errorMessage: string | null;
}

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

export type SimulationAction =
  | { type: 'LOAD_GRAPH'; payload: { graph: DependencyGraph; blastReport: BlastRadiusReport } }
  | { type: 'SET_PRESET'; payload: { preset: PresetKey } }
  | {
      type: 'START_SIMULATION';
      payload: { chaosResult: ChaosSimulationResult; totalSteps: number };
    }
  | { type: 'SET_STEP'; payload: { step: number } }
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACK' }
  | { type: 'STREAM_GATE_CHUNK'; payload: { chunk: string } }
  | { type: 'SET_GATE_DECISION'; payload: { decision: ReleaseGateDecision } }
  | { type: 'SELECT_NODE'; payload: { nodeId: NodeId | null } }
  | { type: 'RESET' };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const INITIAL_STATE: SimulationState = {
  phase: 'IDLE',
  activePreset: null,
  graph: null,
  blastReport: null,
  chaosResult: null,
  currentStep: 0,
  totalSteps: 0,
  selectedNodeId: null,
  streamedNarrative: '',
  gateDecision: null,
  errorMessage: null,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function simulationReducer(
  state: SimulationState,
  action: SimulationAction,
): SimulationState {
  switch (action.type) {
    case 'LOAD_GRAPH': {
      return {
        ...state,
        phase: 'ANALYZING',
        graph: action.payload.graph,
        blastReport: action.payload.blastReport,
        chaosResult: null,
        currentStep: 0,
        totalSteps: 0,
        selectedNodeId: null,
        streamedNarrative: '',
        gateDecision: null,
        errorMessage: null,
      };
    }

    case 'SET_PRESET': {
      return {
        ...state,
        activePreset: action.payload.preset,
      };
    }

    case 'START_SIMULATION': {
      return {
        ...state,
        phase: 'SIMULATING',
        chaosResult: action.payload.chaosResult,
        totalSteps: action.payload.totalSteps,
        currentStep: 0,
        streamedNarrative: '',
        gateDecision: null,
        errorMessage: null,
      };
    }

    case 'SET_STEP': {
      const step = Math.max(0, Math.min(action.payload.step, state.totalSteps - 1));
      return { ...state, currentStep: step };
    }

    case 'STEP_FORWARD': {
      const next = state.currentStep + 1;
      return {
        ...state,
        currentStep: next >= state.totalSteps ? state.totalSteps - 1 : next,
      };
    }

    case 'STEP_BACK': {
      const prev = state.currentStep - 1;
      return { ...state, currentStep: prev < 0 ? 0 : prev };
    }

    case 'STREAM_GATE_CHUNK': {
      return {
        ...state,
        phase: 'STREAMING',
        streamedNarrative: state.streamedNarrative + action.payload.chunk,
      };
    }

    case 'SET_GATE_DECISION': {
      return {
        ...state,
        phase: 'COMPLETE',
        gateDecision: action.payload.decision,
        streamedNarrative: action.payload.decision.narrative,
      };
    }

    case 'SELECT_NODE': {
      return { ...state, selectedNodeId: action.payload.nodeId };
    }

    case 'RESET': {
      return { ...INITIAL_STATE };
    }

    default: {
      // Exhaustiveness guard — TypeScript will error if a case is missing.
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
