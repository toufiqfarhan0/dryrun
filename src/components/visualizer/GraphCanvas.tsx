'use client';

/**
 * DryRun — Graph Canvas
 * Agent 5: Interactive System Visualizer
 *
 * Interactive graph rendering using a hybrid approach:
 *  - Force-directed layout via a lightweight spring simulation (no D3 dep)
 *  - <canvas> for node circles + labels (performance at scale)
 *  - <EdgeLayer> SVG overlay for animated directed edges
 *  - <NodeCard> tooltip on hover
 *
 * Pan and zoom are implemented via pointer-event tracking and a CSS transform.
 */

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { DependencyGraph, NodeId, NodeImpact, NodeSimResult } from '@/types';
import { EdgeLayer, type NodePosition } from './EdgeLayer';
import { NodeCard } from './NodeCard';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NODE_RADIUS = 22;
const FONT_FAMILY = '"JetBrains Mono", "Fira Code", monospace';
const FONT_SIZE = 10;
const LABEL_MAX_LEN = 12;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const REPULSION = 8000;
const ATTRACTION = 0.04;
const DAMPING = 0.78;
const ITERATIONS = 200;

// ---------------------------------------------------------------------------
// Colour mapping (matches .bobrules telemetry tokens)
// ---------------------------------------------------------------------------

function nodeColor(impactScore: number, failureProbability: number): string {
  // During simulation: colourise by failure probability
  if (failureProbability > 0) {
    if (failureProbability >= 0.8) return '#ef4444'; // red-500
    if (failureProbability >= 0.6) return '#f97316'; // orange-500
    if (failureProbability >= 0.4) return '#facc15'; // yellow-400
    if (failureProbability >= 0.2) return '#38bdf8'; // sky-400
    return '#10b981'; // emerald-500
  }
  // Pre-simulation: colourise by blast impact score
  if (impactScore >= 81) return '#ef4444';
  if (impactScore >= 61) return '#f97316';
  if (impactScore >= 41) return '#facc15';
  if (impactScore >= 21) return '#38bdf8';
  return '#10b981';
}

function nodeStroke(selected: boolean, onCriticalPath: boolean): string {
  if (selected) return '#8b5cf6'; // violet-500
  if (onCriticalPath) return '#ef4444'; // red-500
  return '#334155'; // slate-700
}

// ---------------------------------------------------------------------------
// Force layout
// ---------------------------------------------------------------------------

interface ForceNode {
  id: NodeId;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function buildForceLayout(
  nodeIds: NodeId[],
  edges: Array<{ source: NodeId; target: NodeId }>,
  width: number,
  height: number,
): Map<NodeId, { x: number; y: number }> {
  if (nodeIds.length === 0) return new Map();

  const cx = width / 2;
  const cy = height / 2;

  // Initialise in a circle to avoid degenerate overlap at origin
  const forceNodes: ForceNode[] = nodeIds.map((id, i) => {
    const angle = (i / nodeIds.length) * Math.PI * 2;
    const r = Math.min(cx, cy) * 0.6;
    return { id, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), vx: 0, vy: 0 };
  });

  const nodeIndex = new Map<NodeId, number>(forceNodes.map((n, i) => [n.id, i]));

  for (let iter = 0; iter < ITERATIONS; iter++) {
    // Repulsion between all pairs
    for (let i = 0; i < forceNodes.length; i++) {
      for (let j = i + 1; j < forceNodes.length; j++) {
        const a = forceNodes[i];
        const b = forceNodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist2 = dx * dx + dy * dy || 1;
        const force = REPULSION / dist2;
        const ux = dx / Math.sqrt(dist2);
        const uy = dy / Math.sqrt(dist2);
        a.vx -= ux * force;
        a.vy -= uy * force;
        b.vx += ux * force;
        b.vy += uy * force;
      }
    }
    // Attraction along edges
    for (const e of edges) {
      const si = nodeIndex.get(e.source);
      const ti = nodeIndex.get(e.target);
      if (si === undefined || ti === undefined) continue;
      const s = forceNodes[si];
      const t = forceNodes[ti];
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      s.vx += dx * ATTRACTION;
      s.vy += dy * ATTRACTION;
      t.vx -= dx * ATTRACTION;
      t.vy -= dy * ATTRACTION;
    }
    // Integrate + dampen + clamp to canvas bounds
    for (const n of forceNodes) {
      n.vx *= DAMPING;
      n.vy *= DAMPING;
      n.x = Math.max(NODE_RADIUS + 4, Math.min(width - NODE_RADIUS - 4, n.x + n.vx));
      n.y = Math.max(NODE_RADIUS + 4, Math.min(height - NODE_RADIUS - 4, n.y + n.vy));
    }
  }

  return new Map(forceNodes.map((n) => [n.id, { x: n.x, y: n.y }]));
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GraphCanvasProps {
  graph: DependencyGraph;
  impacts: Record<NodeId, NodeImpact>;
  nodeResults: Record<NodeId, NodeSimResult>;
  /** Nodes in the current simulation step */
  activeNodeIds: Set<NodeId>;
  criticalChain: NodeId[];
  selectedNodeId: NodeId | null;
  onSelectNode: (id: NodeId | null) => void;
  /** Current animation clock (0–1 cycle from ScenarioTimeline) */
  animOffset: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GraphCanvas({
  graph,
  impacts,
  nodeResults,
  activeNodeIds,
  criticalChain,
  selectedNodeId,
  onSelectNode,
  animOffset,
}: GraphCanvasProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [positions, setPositions] = useState<Map<NodeId, { x: number; y: number }>>(new Map());
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [hoveredNodeId, setHoveredNodeId] = useState<NodeId | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // Observe container size
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Recompute layout when graph or canvas size changes
  useEffect(() => {
    const nodeIds = Object.keys(graph.nodes);
    const newPositions = buildForceLayout(nodeIds, graph.edges, size.width, size.height);
    setPositions(newPositions);
  }, [graph, size]);

  // Draw to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size.width, size.height);

    // Apply pan/zoom transform
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    for (const [nodeId, node] of Object.entries(graph.nodes)) {
      const pos = positions.get(nodeId);
      if (!pos) continue;

      const impact = impacts[nodeId];
      const simResult = nodeResults[nodeId];
      const impactScore = impact?.impactScore ?? 0;
      const failureProb = simResult?.failureProbability ?? 0;
      const onCritical = impact?.onCriticalPath ?? false;
      const isSelected = nodeId === selectedNodeId;

      const color = nodeColor(impactScore, failureProb);
      const stroke = nodeStroke(isSelected, onCritical);

      // Pulsing halo for failed nodes
      if (failureProb >= 0.8 || (onCritical && activeNodeIds.has(nodeId))) {
        const haloRadius = NODE_RADIUS + 6 + Math.sin(animOffset * Math.PI * 2) * 4;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, haloRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = color + '22'; // transparent fill
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.stroke();

      // Inner dot for entry points
      if (node.isEntryPoint) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      // Label
      const label = node.label.length > LABEL_MAX_LEN
        ? node.label.slice(0, LABEL_MAX_LEN - 1) + '…'
        : node.label;
      ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f1f5f9'; // slate-100
      ctx.fillText(label, pos.x, pos.y);
    }

    ctx.restore();
  }, [
    graph,
    positions,
    impacts,
    nodeResults,
    activeNodeIds,
    criticalChain,
    selectedNodeId,
    transform,
    size,
    animOffset,
  ]);

  // Hit-test: find node at canvas coordinates
  const hitTest = useCallback(
    (cx: number, cy: number): NodeId | null => {
      const { x: tx, y: ty, scale: ts } = transformRef.current;
      // Convert screen coords → world coords
      const wx = (cx - tx) / ts;
      const wy = (cy - ty) / ts;
      for (const [nodeId] of Object.entries(graph.nodes)) {
        const pos = positions.get(nodeId);
        if (!pos) continue;
        const dx = wx - pos.x;
        const dy = wy - pos.y;
        if (dx * dx + dy * dy <= (NODE_RADIUS + 4) * (NODE_RADIUS + 4)) {
          return nodeId;
        }
      }
      return null;
    },
    [graph.nodes, positions],
  );

  // Pointer handlers for pan + node selection
  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>): void => {
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const hit = hitTest(cx, cy);
      if (hit !== null) {
        onSelectNode(hit);
        return;
      }
      isPanning.current = true;
      panStart.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y };
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    },
    [hitTest, onSelectNode],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>): void => {
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      if (isPanning.current) {
        setTransform((t) => ({
          ...t,
          x: e.clientX - panStart.current.x,
          y: e.clientY - panStart.current.y,
        }));
        return;
      }

      const hit = hitTest(cx, cy);
      setHoveredNodeId(hit);
      if (hit) setHoverPos({ x: e.clientX, y: e.clientY });
    },
    [hitTest],
  );

  const handlePointerUp = useCallback((): void => {
    isPanning.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({
      ...t,
      scale: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, t.scale * delta)),
    }));
  }, []);

  // Build NodePosition array for EdgeLayer
  const nodePositions: NodePosition[] = Array.from(positions.entries()).map(([id, pos]) => ({
    id,
    x: pos.x * transform.scale + transform.x,
    y: pos.y * transform.scale + transform.y,
  }));

  const hoveredNode = hoveredNodeId ? graph.nodes[hoveredNodeId] : null;

  // Compute fan-in counts
  const fanInMap = new Map<NodeId, number>();
  for (const edge of graph.edges) {
    fanInMap.set(edge.target, (fanInMap.get(edge.target) ?? 0) + 1);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950 overflow-hidden rounded-lg"
      style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
    >
      {/* Canvas for nodes */}
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      />

      {/* SVG edge overlay */}
      <EdgeLayer
        edges={graph.edges}
        nodePositions={nodePositions}
        criticalChain={criticalChain}
        activeNodeIds={activeNodeIds}
        width={size.width}
        height={size.height}
        animOffset={animOffset}
      />

      {/* Hover tooltip */}
      {hoveredNode !== null && (
        <NodeCard
          node={hoveredNode}
          impact={impacts[hoveredNodeId ?? ''] ?? null}
          simResult={nodeResults[hoveredNodeId ?? ''] ?? null}
          fanIn={fanInMap.get(hoveredNodeId ?? '') ?? 0}
          x={hoverPos.x}
          y={hoverPos.y}
        />
      )}

      {/* Zoom hint */}
      <p className="absolute bottom-3 right-4 text-xs text-slate-600 pointer-events-none select-none">
        Scroll to zoom · drag to pan · click node to inspect
      </p>
    </div>
  );
}
