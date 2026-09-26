/**
 * DryRun — POST /api/simulate
 * App Router Route Handler
 *
 * Accepts a BlastRadiusReport and fault scenarios, runs the chaos
 * simulation, and returns a ChaosSimulationResult.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import {
  BlastRadiusReportSchema,
  FaultScenarioSchema,
  type ChaosSimulationResult,
} from '@/types';
import { runSimulation } from '@/lib/chaos';
import { DEFAULT_CHAOS_SCENARIOS } from '@/lib/chaos';

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------

const SimulateBodySchema = z.object({
  /**
   * The blast-radius report produced by POST /api/analyze.
   * Provides the annotated dependency graph and impact scores.
   */
  blastRadiusReport: BlastRadiusReportSchema,
  /**
   * Fault scenarios to run. When omitted, all four default preset
   * scenarios are used with their first changed node as origin.
   */
  scenarios: z.array(FaultScenarioSchema).min(1).optional(),
});

type SimulateBody = z.infer<typeof SimulateBodySchema>;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // --- Parse & validate ---
  let body: SimulateBody;
  try {
    const raw: unknown = await request.json();
    const parsed = SimulateBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 },
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  try {
    const { blastRadiusReport } = body;
    const graph = blastRadiusReport.graph;

    // --- Resolve scenarios ---
    // When none supplied, use the default preset scenarios but substitute the
    // first changed node as the fault origin (replacing the sentinel ID).
    const originNodeId =
      blastRadiusReport.changeSet.changedFiles[0] ??
      blastRadiusReport.topRiskyNodes[0] ??
      Object.keys(graph.nodes)[0];

    const scenarios =
      body.scenarios ??
      DEFAULT_CHAOS_SCENARIOS.map((s) => ({
        ...s,
        targetNodeId: originNodeId ?? s.targetNodeId,
      }));

    // --- Run simulation ---
    const simulationResult: ChaosSimulationResult = runSimulation(
      graph,
      blastRadiusReport,
      scenarios,
    );

    return NextResponse.json(simulationResult, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
