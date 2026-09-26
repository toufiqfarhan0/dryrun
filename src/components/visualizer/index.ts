/**
 * DryRun — Visualizer Barrel Export
 * Agent 5: Interactive System Visualizer
 *
 * Single public entry-point for all visualizer components and context.
 * Other agents and pages MUST import only from this barrel.
 */

// Context & state management
export { SimulationProvider, useSimulation } from './context/SimulationContext';
export type {
  SimulationContextValue,
  SimulationState,
  SimulationAction,
  PresetKey,
} from './context/SimulationContext';
export { simulationReducer, INITIAL_STATE } from './context/simulation-reducer';
export type { SimulationPhase } from './context/simulation-reducer';

// Canvas & rendering
export { GraphCanvas } from './GraphCanvas';
export type { GraphCanvasProps } from './GraphCanvas';

export { EdgeLayer } from './EdgeLayer';
export type { EdgeLayerProps, NodePosition } from './EdgeLayer';

export { NodeCard } from './NodeCard';
export type { NodeCardProps } from './NodeCard';

export { ImpactLegend } from './ImpactLegend';

// Controls & inspectors
export { ControlPanel } from './ControlPanel';
export { ScenarioTimeline } from './ScenarioTimeline';
export type { ScenarioTimelineProps } from './ScenarioTimeline';
export { NodeDetailPanel } from './NodeDetailPanel';
export { GateReport } from './GateReport';
export type { GateReportProps } from './GateReport';
