'use client';

/**
 * DryRun — Edge Layer
 * Agent 5: Interactive System Visualizer
 *
 * SVG overlay that renders directed dependency edges with animated fault-
 * propagation pulses during simulation playback.  The component is rendered
 * on top of the canvas (via absolute positioning) so it can use crisp SVG
 * lines while the node layer uses Canvas for performance.
 */

import React, { useMemo } from 'react';
import type { GraphEdge, NodeId } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Width of a normal edge stroke */
const EDGE_STROKE_WIDTH = 1.5;
/** Width of a critical-path edge stroke */
const CRITICAL_STROKE_WIDTH = 2.5;
/** Base opacity for inactive edges */
const INACTIVE_OPACITY = 0.3;
/** Opacity for active / affected edges */
const ACTIVE_OPACITY = 0.9;
/** Dash length for critical-path animation */
const CRITICAL_DASH = '8 4';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NodePosition {
  id: NodeId;
  x: number;
  y: number;
}

export interface EdgeLayerProps {
  edges: GraphEdge[];
  nodePositions: NodePosition[];
  /** Node IDs that are on the critical failure chain */
  criticalChain: NodeId[];
  /** Node IDs actively affected in the current simulation step */
  activeNodeIds: Set<NodeId>;
  width: number;
  height: number;
  /** Animation offset driven by requestAnimationFrame (0–1 cycle) */
  animOffset: number;
  /** Edge weight tooltip callback */
  onEdgeHover?: (edge: GraphEdge | null) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function positionMap(positions: NodePosition[]): Map<NodeId, { x: number; y: number }> {
  const map = new Map<NodeId, { x: number; y: number }>();
  for (const p of positions) {
    map.set(p.id, { x: p.x, y: p.y });
  }
  return map;
}

function isCriticalEdge(edge: GraphEdge, criticalChain: NodeId[]): boolean {
  const chainSet = new Set(criticalChain);
  return chainSet.has(edge.source) && chainSet.has(edge.target);
}

function isActiveEdge(edge: GraphEdge, activeNodeIds: Set<NodeId>): boolean {
  return activeNodeIds.has(edge.source) && activeNodeIds.has(edge.target);
}

/** Compute arrowhead marker id based on edge kind */
function markerId(critical: boolean, active: boolean): string {
  if (critical) return 'arrow-critical';
  if (active) return 'arrow-active';
  return 'arrow-default';
}

/** Offset path slightly so arrow tip lands on node circumference */
function shortenLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  nodeRadius: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: x1 + ux * nodeRadius,
    y1: y1 + uy * nodeRadius,
    x2: x2 - ux * nodeRadius,
    y2: y2 - uy * nodeRadius,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EdgeLayer({
  edges,
  nodePositions,
  criticalChain,
  activeNodeIds,
  width,
  height,
  animOffset,
  onEdgeHover,
}: EdgeLayerProps): React.JSX.Element {
  const positions = useMemo(() => positionMap(nodePositions), [nodePositions]);

  const NODE_RADIUS = 22;

  const renderedEdges = useMemo(() => {
    return edges.map((edge) => {
      const src = positions.get(edge.source);
      const tgt = positions.get(edge.target);
      if (!src || !tgt) return null;

      const critical = isCriticalEdge(edge, criticalChain);
      const active = isActiveEdge(edge, activeNodeIds);
      const coords = shortenLine(src.x, src.y, tgt.x, tgt.y, NODE_RADIUS);
      const opacity = active || critical ? ACTIVE_OPACITY : INACTIVE_OPACITY;
      const strokeWidth = critical ? CRITICAL_STROKE_WIDTH : EDGE_STROKE_WIDTH;
      const stroke = critical ? '#ef4444' : active ? '#f97316' : '#475569';
      const markerEnd = `url(#${markerId(critical, active)})`;

      // Animated dash offset for critical edges
      const dashOffset = critical ? (-animOffset * 48).toString() : undefined;

      return (
        <line
          key={`${edge.source}-${edge.target}-${edge.edgeType}`}
          x1={coords.x1}
          y1={coords.y1}
          x2={coords.x2}
          y2={coords.y2}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity}
          strokeDasharray={critical ? CRITICAL_DASH : undefined}
          strokeDashoffset={dashOffset}
          markerEnd={markerEnd}
          onMouseEnter={onEdgeHover ? () => onEdgeHover(edge) : undefined}
          onMouseLeave={onEdgeHover ? () => onEdgeHover(null) : undefined}
          style={{ cursor: onEdgeHover ? 'crosshair' : 'default' }}
        />
      );
    });
  }, [edges, positions, criticalChain, activeNodeIds, animOffset, onEdgeHover]);

  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        {/* Default arrowhead */}
        <marker
          id="arrow-default"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L7,3 z" fill="#475569" />
        </marker>
        {/* Active arrowhead */}
        <marker
          id="arrow-active"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L7,3 z" fill="#f97316" />
        </marker>
        {/* Critical arrowhead */}
        <marker
          id="arrow-critical"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L7,3 z" fill="#ef4444" />
        </marker>
      </defs>
      <g>{renderedEdges}</g>
    </svg>
  );
}
