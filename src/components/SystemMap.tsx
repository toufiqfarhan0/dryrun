'use client'

import { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  Handle,
  Position,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { riskColors, riskGlows } from '@/lib/utils'
import type { Module, RiskLevel } from '@/types'

/* ── Custom node ── */
function ModuleNode({ data }: NodeProps) {
  const risk = (data.risk as RiskLevel) ?? 'ok'
  const color = riskColors[risk]
  const glow = riskGlows[risk]

  return (
    <div
      style={{
        padding: '6px 10px',
        border: `1.5px solid ${color}`,
        borderRadius: 2,
        background: `${color}18`,
        boxShadow: glow,
        color,
        fontSize: 9,
        fontFamily: "'Share Tech Mono', monospace",
        textAlign: 'center',
        minWidth: 90,
        maxWidth: 110,
        lineHeight: 1.4,
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      title={`${data.label} · ${data.files} files`}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      {String(data.label)}
      <div style={{ fontSize: 8, opacity: 0.6, marginTop: 2 }}>
        {String(data.files)}f
      </div>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  )
}

const nodeTypes = { module: ModuleNode }

/* ── Grid positions ── */
const POSITIONS = [
  { x: 10, y: 10 },
  { x: 160, y: 10 },
  { x: 10, y: 110 },
  { x: 160, y: 110 },
  { x: 85, y: 60 },
  { x: 10, y: 210 },
  { x: 160, y: 210 },
]

interface SystemMapProps {
  modules: Module[]
}

export default function SystemMap({ modules }: SystemMapProps) {
  const nodes: Node[] = useMemo(
    () =>
      modules.map((mod, i) => ({
        id: String(i),
        type: 'module',
        position: POSITIONS[i] ?? {
          x: (i % 2) * 150 + 10,
          y: Math.floor(i / 2) * 90 + 10,
        },
        data: { label: mod.name, risk: mod.risk, files: mod.files },
      })),
    [modules]
  )

  const edges: Edge[] = useMemo(
    () =>
      modules.slice(0, -1).map((mod, i) => ({
        id: `e${i}-${i + 1}`,
        source: String(i),
        target: String(i + 1),
        style: {
          stroke: riskColors[mod.risk],
          strokeOpacity: 0.4,
          strokeDasharray: '4 4',
          strokeWidth: 1,
        },
        animated: true,
      })),
    [modules]
  )

  return (
    <div
      className="w-full rounded-[2px] overflow-hidden"
      style={{ height: 300, background: 'transparent' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background color="rgba(240,230,200,0.04)" gap={16} size={1} />
      </ReactFlow>
    </div>
  )
}
