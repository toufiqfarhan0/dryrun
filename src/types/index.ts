/**
 * DryRun — Canonical Data Contracts
 * Agent 1: Architecture & Contract Specifier
 *
 * All shared types and Zod runtime schemas for the DryRun pipeline.
 * Every other agent MUST import from this file only — never define types locally.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// § 1. Graph Primitives
// ---------------------------------------------------------------------------

/** Canonical identifier for a node — normalised file path relative to repo root */
export type NodeId = string;

export type NodeType = 'MODULE' | 'SERVICE' | 'EXTERNAL' | 'CONFIG' | 'TEST';

export type EdgeType =
  | 'STATIC_IMPORT'
  | 'DYNAMIC_IMPORT'
  | 'HTTP_CALL'
  | 'RE_EXPORT'
  | 'ENV_READ';

export interface GraphNode {
  id: NodeId;
  /** Display name (module name or service label) */
  label: string;
  /** Relative path in the repository */
  filePath: string;
  nodeType: NodeType;
  /** Exported symbol names */
  exports: string[];
  /** True for service boundaries, CLI entry points */
  isEntryPoint: boolean;
  /** Lines of code — heuristic weight */
  loc: number;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  source: NodeId;
  target: NodeId;
  edgeType: EdgeType;
  /** Call frequency heuristic (1 = static import, >1 = runtime call) */
  weight: number;
}

export interface DependencyGraph {
  /** UUID — ties graph to an analysis run */
  id: string;
  repoUrl?: string;
  /** ISO 8601 timestamp */
  analyzedAt: string;
  nodes: Record<NodeId, GraphNode>;
  edges: GraphEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    maxDepth: number;
    serviceCount: number;
  };
}

// Zod schemas

export const NodeTypeSchema = z.enum(['MODULE', 'SERVICE', 'EXTERNAL', 'CONFIG', 'TEST']);

export const EdgeTypeSchema = z.enum([
  'STATIC_IMPORT',
  'DYNAMIC_IMPORT',
  'HTTP_CALL',
  'RE_EXPORT',
  'ENV_READ',
]);

export const GraphNodeSchema: z.ZodType<GraphNode> = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  filePath: z.string().min(1),
  nodeType: NodeTypeSchema,
  exports: z.array(z.string()),
  isEntryPoint: z.boolean(),
  loc: z.number().int().nonnegative(),
  metadata: z.record(z.string(), z.unknown()),
});

export const GraphEdgeSchema: z.ZodType<GraphEdge> = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  edgeType: EdgeTypeSchema,
  weight: z.number().positive(),
});

export const DependencyGraphSchema: z.ZodType<DependencyGraph> = z.object({
  id: z.string().uuid(),
  repoUrl: z.string().url().optional(),
  analyzedAt: z.string().datetime(),
  nodes: z.record(z.string(), GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
  stats: z.object({
    totalNodes: z.number().int().nonnegative(),
    totalEdges: z.number().int().nonnegative(),
    maxDepth: z.number().int().nonnegative(),
    serviceCount: z.number().int().nonnegative(),
  }),
});

// ---------------------------------------------------------------------------
// § 2. Change Set
// ---------------------------------------------------------------------------

export interface PullRequestMetadata {
  title: string;
  description: string;
  author: string;
  targetBranch: string;
  url?: string;
}

export interface ChangeSet {
  /** Links to DependencyGraph.id */
  runId: string;
  /** Relative file paths modified in the PR */
  changedFiles: string[];
  addedFiles: string[];
  deletedFiles: string[];
  prMetadata?: PullRequestMetadata;
}

export const PullRequestMetadataSchema: z.ZodType<PullRequestMetadata> = z.object({
  title: z.string().min(1),
  description: z.string(),
  author: z.string().min(1),
  targetBranch: z.string().min(1),
  url: z.string().url().optional(),
});

export const ChangeSetSchema: z.ZodType<ChangeSet> = z.object({
  runId: z.string().uuid(),
  changedFiles: z.array(z.string()),
  addedFiles: z.array(z.string()),
  deletedFiles: z.array(z.string()),
  prMetadata: PullRequestMetadataSchema.optional(),
});

// ---------------------------------------------------------------------------
// § 3. Blast-Radius Report
// ---------------------------------------------------------------------------

export interface NodeImpact {
  nodeId: NodeId;
  /** 0–100 */
  impactScore: number;
  /** Hops from nearest changed node */
  blastDepth: number;
  /** Nodes that transitively depend on this node */
  dependentCount: number;
  onCriticalPath: boolean;
  reachableFromChanged: boolean;
}

export interface BlastRadiusReport {
  runId: string;
  graph: DependencyGraph;
  changeSet: ChangeSet;
  impacts: Record<NodeId, NodeImpact>;
  /** Ordered paths from changed nodes to service boundaries */
  criticalPaths: NodeId[][];
  /** Top-10 by impactScore */
  topRiskyNodes: NodeId[];
  /** 0–100, aggregate */
  overallBlastScore: number;
  computedAt: string;
}

export const NodeImpactSchema: z.ZodType<NodeImpact> = z.object({
  nodeId: z.string().min(1),
  impactScore: z.number().min(0).max(100),
  blastDepth: z.number().int().nonnegative(),
  dependentCount: z.number().int().nonnegative(),
  onCriticalPath: z.boolean(),
  reachableFromChanged: z.boolean(),
});

export const BlastRadiusReportSchema: z.ZodType<BlastRadiusReport> = z.object({
  runId: z.string().uuid(),
  graph: DependencyGraphSchema,
  changeSet: ChangeSetSchema,
  impacts: z.record(z.string(), NodeImpactSchema),
  criticalPaths: z.array(z.array(z.string())),
  topRiskyNodes: z.array(z.string()),
  overallBlastScore: z.number().min(0).max(100),
  computedAt: z.string().datetime(),
});

// ---------------------------------------------------------------------------
// § 4. Fault Scenarios & Chaos Simulation
// ---------------------------------------------------------------------------

export type FaultType =
  | 'SERVICE_OUTAGE'
  | 'LATENCY_P99_SPIKE'
  | 'ERROR_RATE_BREACH'
  | 'NETWORK_PARTITION'
  | 'DEPENDENCY_REMOVED';

export type SpreadDecayModel = 'EXPONENTIAL' | 'LINEAR' | 'STEP';

export interface FaultScenario {
  id: string;
  name: string;
  description: string;
  faultType: FaultType;
  /** Fault origin */
  targetNodeId: NodeId;
  params: {
    /** 0–1: fraction of capacity lost */
    severity: number;
    spreadDecayModel: SpreadDecayModel;
    /** Per-hop decay (e.g. 0.7 = 70% transmission) */
    decayFactor: number;
  };
}

export interface NodeSimResult {
  nodeId: NodeId;
  /** 0–1 */
  failureProbability: number;
  estimatedLatencyMultiplier: number;
  /** Scenario ids */
  affectedByScenarios: string[];
}

export interface ChaosSimulationResult {
  runId: string;
  blastRadiusReport: BlastRadiusReport;
  scenarios: FaultScenario[];
  nodeResults: Record<NodeId, NodeSimResult>;
  /** Highest-probability path to a service boundary */
  criticalFailureChain: NodeId[];
  /** 0–100 */
  aggregateRiskScore: number;
  simulatedAt: string;
}

export const FaultTypeSchema = z.enum([
  'SERVICE_OUTAGE',
  'LATENCY_P99_SPIKE',
  'ERROR_RATE_BREACH',
  'NETWORK_PARTITION',
  'DEPENDENCY_REMOVED',
]);

export const SpreadDecayModelSchema = z.enum(['EXPONENTIAL', 'LINEAR', 'STEP']);

export const FaultScenarioSchema: z.ZodType<FaultScenario> = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  faultType: FaultTypeSchema,
  targetNodeId: z.string().min(1),
  params: z.object({
    severity: z.number().min(0).max(1),
    spreadDecayModel: SpreadDecayModelSchema,
    decayFactor: z.number().min(0).max(1),
  }),
});

export const NodeSimResultSchema: z.ZodType<NodeSimResult> = z.object({
  nodeId: z.string().min(1),
  failureProbability: z.number().min(0).max(1),
  estimatedLatencyMultiplier: z.number().positive(),
  affectedByScenarios: z.array(z.string()),
});

export const ChaosSimulationResultSchema: z.ZodType<ChaosSimulationResult> = z.object({
  runId: z.string().uuid(),
  blastRadiusReport: BlastRadiusReportSchema,
  scenarios: z.array(FaultScenarioSchema),
  nodeResults: z.record(z.string(), NodeSimResultSchema),
  criticalFailureChain: z.array(z.string()),
  aggregateRiskScore: z.number().min(0).max(100),
  simulatedAt: z.string().datetime(),
});

// ---------------------------------------------------------------------------
// § 5. Release Gate Decision
// ---------------------------------------------------------------------------

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type GateDecision = 'APPROVED' | 'BLOCKED';

export interface Mitigation {
  nodeId: NodeId;
  description: string;
  priority: SeverityLevel;
}

export interface ReleaseGateDecision {
  runId: string;
  severity: SeverityLevel;
  decision: GateDecision;
  /** Full watsonx-generated markdown report */
  narrative: string;
  mitigations: Mitigation[];
  /** 0–1, from watsonx token logprobs if available */
  confidenceScore: number;
  generatedAt: string;
  /** Blast score inherited from ChaosSimulationResult */
  blastScore: number;
  /** Step-by-step rollback instructions */
  rollbackRunbook: string[];
}

export const SeverityLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const GateDecisionSchema = z.enum(['APPROVED', 'BLOCKED']);

export const MitigationSchema: z.ZodType<Mitigation> = z.object({
  nodeId: z.string().min(1),
  description: z.string().min(1),
  priority: SeverityLevelSchema,
});

export const ReleaseGateDecisionSchema: z.ZodType<ReleaseGateDecision> = z.object({
  runId: z.string().uuid(),
  severity: SeverityLevelSchema,
  decision: GateDecisionSchema,
  narrative: z.string(),
  mitigations: z.array(MitigationSchema),
  confidenceScore: z.number().min(0).max(1),
  generatedAt: z.string().datetime(),
  blastScore: z.number().min(0).max(100),
  rollbackRunbook: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// § 6. API Payloads (external input — Zod-validated at route boundaries)
// ---------------------------------------------------------------------------

export const AnalyzeRequestSchema = z.object({
  repoUrl: z.string().url().optional(),
  fileTree: z.record(z.string(), z.string()).optional(),
  prMetadata: PullRequestMetadataSchema.optional(),
});

export const SimulateRequestSchema = z.object({
  blastRadiusReportId: z.string().uuid(),
  scenarios: z.array(FaultScenarioSchema).min(1),
});

export const GateRequestSchema = z.object({
  chaosSimulationResultId: z.string().uuid(),
  additionalContext: z.string().optional(),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type SimulateRequest = z.infer<typeof SimulateRequestSchema>;
export type GateRequest = z.infer<typeof GateRequestSchema>;
