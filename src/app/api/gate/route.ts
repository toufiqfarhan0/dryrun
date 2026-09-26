/**
 * DryRun — POST /api/gate
 * App Router Route Handler
 *
 * Accepts a ChaosSimulationResult, BlastRadiusReport, and optional PR
 * metadata. Streams the release gate synthesis via Server-Sent Events.
 *
 * SSE event protocol:
 *   data: {"type":"token","value":"<token string>"}
 *   data: {"type":"complete","decision":{...ReleaseGateDecision...}}
 *   data: {"type":"error","message":"<error string>"}
 */

import { type NextRequest } from 'next/server';
import { z } from 'zod';

import {
  ChaosSimulationResultSchema,
  BlastRadiusReportSchema,
  PullRequestMetadataSchema,
  type ReleaseGateDecision,
} from '@/types';
import { synthesizeGateStream } from '@/lib/watsonx';

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------

const GateBodySchema = z.object({
  /** Chaos simulation result from POST /api/simulate. */
  simulationResult: ChaosSimulationResultSchema,
  /** Blast-radius report from POST /api/analyze. */
  blastRadiusReport: BlastRadiusReportSchema,
  /** Optional PR metadata for additional context in the prompt. */
  prMetadata: PullRequestMetadataSchema.optional(),
});

type GateBody = z.infer<typeof GateBodySchema>;

// ---------------------------------------------------------------------------
// SSE helpers
// ---------------------------------------------------------------------------

type SseTokenEvent = { type: 'token'; value: string };
type SseCompleteEvent = { type: 'complete'; decision: ReleaseGateDecision };
type SseErrorEvent = { type: 'error'; message: string };

type SseEvent = SseTokenEvent | SseCompleteEvent | SseErrorEvent;

function encodeSse(event: SseEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<Response> {
  // --- Parse & validate request body ---
  let body: GateBody;
  try {
    const raw: unknown = await request.json();
    const parsed = GateBodySchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: parsed.error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    body = parsed.data;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Request body must be valid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // --- Open SSE stream ---
  const { simulationResult, blastRadiusReport, prMetadata } = body;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const generator = synthesizeGateStream(
          simulationResult,
          blastRadiusReport,
          prMetadata,
        );

        // Stream tokens
        let next = await generator.next();
        while (!next.done) {
          const event: SseTokenEvent = { type: 'token', value: next.value };
          controller.enqueue(encodeSse(event));
          next = await generator.next();
        }

        // The generator's return value is the final ReleaseGateDecision
        const decision = next.value as ReleaseGateDecision;
        const completeEvent: SseCompleteEvent = { type: 'complete', decision };
        controller.enqueue(encodeSse(completeEvent));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Synthesis failed';
        const errorEvent: SseErrorEvent = { type: 'error', message };
        controller.enqueue(encodeSse(errorEvent));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
