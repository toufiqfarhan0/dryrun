'use client'

import {
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { exportMarkdown, exportPdf } from '@/lib/report-exporter'
import type { ProjectData, Module } from '@/types'

interface CityBuilding {
  module: Module & { files: number }
  col: number
  row: number
  heightFactor: number
  spof: boolean
  cascadeDelay: number
  cascadeState: 'nominal' | 'degraded' | 'failed'
  dependents: string[]
}

type SimPhase = 'idle' | 'running' | 'done'

const ISO_SCALE_X = 64
const ISO_SCALE_Y = 32
const FLOOR_H = 22

function isoToScreen(col: number, row: number, offsetX: number, offsetY: number) {
  const sx = (col - row) * ISO_SCALE_X + offsetX
  const sy = (col + row) * ISO_SCALE_Y + offsetY
  return { sx, sy }
}

function riskColor(risk: string, cascadeState: string) {
  if (cascadeState === 'failed')   return { top: '#dc2626', left: '#b91c1c', right: '#991b1b', glow: 'rgba(220,38,38,0.45)' }
  if (cascadeState === 'degraded') return { top: '#d97706', left: '#b45309', right: '#92400e', glow: 'rgba(217,119,6,0.35)' }
  if (risk === 'danger') return { top: '#fee2e2', left: '#fca5a5', right: '#f87171', glow: 'rgba(239,68,68,0.2)' }
  if (risk === 'warn')   return { top: '#fef3c7', left: '#fde68a', right: '#fbbf24', glow: 'rgba(245,158,11,0.2)' }
  return { top: '#f0fdf4', left: '#bbf7d0', right: '#86efac', glow: 'rgba(34,197,94,0.15)' }
}

function lighten(hex: string, amount: number) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `rgb(${r},${g},${b})`
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  col: number, row: number, floors: number,
  colors: { top: string; left: string; right: string; glow: string },
  offsetX: number, offsetY: number,
  highlight: boolean, spof: boolean,
  cascadeState: string, simPhase: SimPhase,
) {
  const { sx, sy } = isoToScreen(col, row, offsetX, offsetY)
  const h = floors * FLOOR_H

  if ((spof && simPhase !== 'idle') || cascadeState !== 'nominal') {
    ctx.save()
    ctx.shadowColor = colors.glow
    ctx.shadowBlur = highlight ? 28 : 18
    ctx.beginPath()
    ctx.moveTo(sx, sy - h)
    ctx.lineTo(sx + ISO_SCALE_X, sy + ISO_SCALE_Y - h)
    ctx.lineTo(sx, sy + ISO_SCALE_Y * 2 - h)
    ctx.lineTo(sx - ISO_SCALE_X, sy + ISO_SCALE_Y - h)
    ctx.closePath()
    ctx.fillStyle = colors.glow
    ctx.fill()
    ctx.restore()
  }

  // Right face
  ctx.beginPath()
  ctx.moveTo(sx, sy - h)
  ctx.lineTo(sx + ISO_SCALE_X, sy + ISO_SCALE_Y - h)
  ctx.lineTo(sx + ISO_SCALE_X, sy + ISO_SCALE_Y)
  ctx.lineTo(sx, sy)
  ctx.closePath()
  ctx.fillStyle = highlight ? lighten(colors.right, 30) : colors.right
  ctx.fill()
  ctx.strokeStyle = '#18181b'
  ctx.lineWidth = highlight ? 2 : 1
  ctx.stroke()

  // Left face
  ctx.beginPath()
  ctx.moveTo(sx, sy - h)
  ctx.lineTo(sx - ISO_SCALE_X, sy + ISO_SCALE_Y - h)
  ctx.lineTo(sx - ISO_SCALE_X, sy + ISO_SCALE_Y)
  ctx.lineTo(sx, sy)
  ctx.closePath()
  ctx.fillStyle = highlight ? lighten(colors.left, 30) : colors.left
  ctx.fill()
  ctx.strokeStyle = '#18181b'
  ctx.lineWidth = highlight ? 2 : 1
  ctx.stroke()

  // Top face
  ctx.beginPath()
  ctx.moveTo(sx, sy - h)
  ctx.lineTo(sx + ISO_SCALE_X, sy + ISO_SCALE_Y - h)
  ctx.lineTo(sx, sy + ISO_SCALE_Y * 2 - h)
  ctx.lineTo(sx - ISO_SCALE_X, sy + ISO_SCALE_Y - h)
  ctx.closePath()
  ctx.fillStyle = highlight ? lighten(colors.top, 30) : colors.top
  ctx.fill()
  ctx.strokeStyle = '#18181b'
  ctx.lineWidth = highlight ? 2 : 1
  ctx.stroke()

  if (floors > 2) {
    const wc = cascadeState === 'failed' ? '#fca5a5' : cascadeState === 'degraded' ? '#fde68a' : '#86efac'
    for (let f = 1; f < floors; f++) {
      const wy = sy - f * FLOOR_H - 4
      ctx.beginPath(); ctx.arc(sx + 16, wy, 2.5, 0, Math.PI * 2); ctx.fillStyle = wc; ctx.fill()
      ctx.beginPath(); ctx.arc(sx - 16, wy, 2.5, 0, Math.PI * 2); ctx.fillStyle = wc; ctx.fill()
    }
  }

  if (spof) {
    ctx.beginPath()
    ctx.moveTo(sx, sy - h)
    ctx.lineTo(sx, sy - h - 14)
    ctx.strokeStyle = simPhase !== 'idle' ? '#dc2626' : '#71717a'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(sx, sy - h - 16, 3.5, 0, Math.PI * 2)
    ctx.fillStyle = simPhase !== 'idle' ? '#dc2626' : '#71717a'
    ctx.fill()
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, cols: number, rows: number, ox: number, oy: number) {
  ctx.strokeStyle = 'rgba(0,0,0,0.07)'
  ctx.lineWidth = 1
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const { sx, sy } = isoToScreen(c, r, ox, oy)
      ctx.beginPath(); ctx.moveTo(sx, sy + ISO_SCALE_Y * 2); ctx.lineTo(sx + ISO_SCALE_X, sy + ISO_SCALE_Y); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(sx, sy + ISO_SCALE_Y * 2); ctx.lineTo(sx - ISO_SCALE_X, sy + ISO_SCALE_Y); ctx.stroke()
    }
  }
}

function buildCityLayout(modules: Module[]): CityBuilding[] {
  const sorted = [...modules].sort((a, b) => (b.files ?? 5) - (a.files ?? 5))
  const maxFiles = Math.max(...sorted.map(m => m.files ?? 5), 1)
  const positions: [number, number][] = [
    [1, 1], [2, 1], [3, 1],
    [0, 2], [1, 2], [2, 2], [3, 2],
    [1, 3], [2, 3],
  ]
  return sorted.slice(0, positions.length).map((mod, i) => {
    const [col, row] = positions[i]
    const hf = 0.5 + 0.5 * ((mod.files ?? 5) / maxFiles)
    const seed = i * 137.508
    const depIndices = positions.map((_, j) => j).filter(j => j !== i && ((j * 31 + i * 17) % 3 !== 0)).slice(0, 3)
    return {
      module: mod as Module & { files: number },
      col, row,
      heightFactor: hf,
      spof: mod.risk === 'danger',
      cascadeDelay: mod.risk === 'danger' ? 0 : mod.risk === 'warn' ? 3000 + i * 1000 : 7000 + i * 1500,
      cascadeState: 'nominal' as const,
      dependents: depIndices.map(j => sorted[j]?.name).filter(Boolean),
    }
  })
}

interface DeploymentCityProps {
  data: ProjectData
  theme?: 'light'
  onSimulateDone: () => void
  onBack: () => void
}

export default function DeploymentCity({ data, theme = 'light', onSimulateDone, onBack }: DeploymentCityProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const rafRef      = useRef<number>(0)

  const [simPhase, setSimPhase]             = useState<SimPhase>('idle')
  const [selectedBuilding, setSelectedBuilding] = useState<CityBuilding | null>(null)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [verdict, setVerdict]               = useState<'blocked' | 'cleared' | null>(null)
  const [buildings, setBuildings]           = useState<CityBuilding[]>([])
  const [canvasSize, setCanvasSize]         = useState({ w: 900, h: 540 })

  const riskScore = data.aiResult.risk_score ?? 0
  const isBlocked = riskScore >= 40
  const isDark    = false

  useEffect(() => {
    setBuildings(buildCityLayout(data.modules))
    setSimPhase('idle')
    setVerdict(null)
    setSelectedBuilding(null)
  }, [data])

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const e = entries[0]
      if (e) setCanvasSize({ w: Math.floor(e.contentRect.width), h: Math.floor(e.contentRect.height) })
    })
    if (wrapperRef.current) obs.observe(wrapperRef.current)
    return () => obs.disconnect()
  }, [])

  const bgColor  = isDark ? '#0e0e0d' : '#f6f5f2'
  const dotColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'
  const offsetX  = canvasSize.w / 2
  const offsetY  = 110

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function render() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let x = 0; x < canvas.width; x += 20) {
        for (let y = 0; y < canvas.height; y += 20) {
          ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2)
          ctx.fillStyle = dotColor; ctx.fill()
        }
      }

      drawGrid(ctx, 5, 5, offsetX, offsetY)

      const sorted = [...buildings].sort((a, b) => (a.col + a.row) - (b.col + b.row))
      for (const b of sorted) {
        const floors = Math.max(2, Math.round(b.heightFactor * 8))
        const colors = riskColor(b.module.risk, b.cascadeState)
        const isSel = selectedBuilding?.module.name === b.module.name
        drawBuilding(ctx, b.col, b.row, floors, colors, offsetX, offsetY, isSel, b.spof, b.cascadeState, simPhase)
      }

      ctx.font = 'bold 11px "Geist Mono", monospace'
      ctx.textAlign = 'center'
      for (const b of sorted) {
        const { sx, sy } = isoToScreen(b.col, b.row, offsetX, offsetY)
        const floors = Math.max(2, Math.round(b.heightFactor * 8))
        const lY = sy - floors * FLOOR_H - (b.spof ? 30 : 14)
        const label = b.module.name.length > 18 ? b.module.name.slice(0, 16) + '…' : b.module.name
        ctx.fillStyle = isDark ? '#f4f4f5' : '#09090b'
        ctx.fillText(label, sx, lY)
      }

      if (simPhase === 'running' || simPhase === 'done') {
        const fc = buildings.filter(b => b.cascadeState === 'failed').length
        const dc = buildings.filter(b => b.cascadeState === 'degraded').length
        const fog = Math.min(0.32, fc * 0.08 + dc * 0.04)
        if (fog > 0.01) {
          const gr = ctx.createRadialGradient(offsetX, offsetY + 200, 40, offsetX, offsetY + 200, 360)
          gr.addColorStop(0, `rgba(220,38,38,${fog})`)
          gr.addColorStop(1, 'rgba(220,38,38,0)')
          ctx.fillStyle = gr
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [buildings, simPhase, selectedBuilding, offsetX, offsetY, bgColor, dotColor, isDark])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width)
    const my = (e.clientY - rect.top) * (canvas.height / rect.height)
    for (const b of [...buildings].reverse()) {
      const { sx, sy } = isoToScreen(b.col, b.row, offsetX, offsetY)
      const floors = Math.max(2, Math.round(b.heightFactor * 8))
      const ty = sy - floors * FLOOR_H
      const dx = Math.abs(mx - sx) / ISO_SCALE_X
      const dy = Math.abs(my - (ty + ISO_SCALE_Y)) / ISO_SCALE_Y
      if (dx + dy < 1.2) {
        setSelectedBuilding(prev => prev?.module.name === b.module.name ? null : b)
        return
      }
    }
    setSelectedBuilding(null)
  }, [buildings, offsetX, offsetY])

  const handleSimulate = useCallback(() => {
    if (simPhase !== 'idle') return
    setSimPhase('running')
    setVerdict(null)
    const timers: ReturnType<typeof setTimeout>[] = []
    buildings.forEach((b, i) => {
      if (b.module.risk === 'danger') {
        timers.push(setTimeout(() => setBuildings(p => p.map((pb, pi) => pi === i ? { ...pb, cascadeState: 'failed' } : pb)), 800 + i * 220))
      } else if (b.module.risk === 'warn') {
        timers.push(setTimeout(() => setBuildings(p => p.map((pb, pi) => pi === i ? { ...pb, cascadeState: 'degraded' } : pb)), 3200 + i * 600))
        timers.push(setTimeout(() => setBuildings(p => p.map((pb, pi) => pi === i ? { ...pb, cascadeState: 'failed' } : pb)), 5800 + i * 500))
      } else {
        timers.push(setTimeout(() => setBuildings(p => p.map((pb, pi) => pi === i ? { ...pb, cascadeState: 'degraded' } : pb)), 6200 + i * 400))
      }
    })
    timers.push(setTimeout(() => {
      setSimPhase('done')
      setVerdict(isBlocked ? 'blocked' : 'cleared')
      onSimulateDone()
    }, 9500))
  }, [simPhase, buildings, isBlocked, onSimulateDone])

  const handleReset = useCallback(() => {
    setSimPhase('idle')
    setVerdict(null)
    setBuildings(p => p.map(b => ({ ...b, cascadeState: 'nominal' })))
    setSelectedBuilding(null)
  }, [])

  const handleExportPng = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `dryrun-city-${data.projectName.replace(/[@/\s]/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [data.projectName])

  const handleExportMd  = useCallback(() => exportMarkdown({
    projectName: data.projectName,
    score: data.aiResult.risk_score,
    summary: data.aiResult.summary,
    stack: data.stack,
    modules: data.modules,
    issues: data.aiResult.issues,
    baseCost: 45000,
  }), [data])
  const handleExportPdf = useCallback(async () => {
    setIsExportingPdf(true)
    try {
      await exportPdf({
        projectName: data.projectName,
        score: data.aiResult.risk_score,
        summary: data.aiResult.summary,
        stack: data.stack,
        modules: data.modules,
        issues: data.aiResult.issues,
        baseCost: 45000,
      })
    } finally {
      setIsExportingPdf(false)
    }
  }, [data])

  const failedCount   = buildings.filter(b => b.cascadeState === 'failed').length
  const degradedCount = buildings.filter(b => b.cascadeState === 'degraded').length
  const nominalCount  = buildings.filter(b => b.cascadeState === 'nominal').length
  const blastPct      = buildings.length > 0 ? Math.round(((failedCount + degradedCount) / buildings.length) * 100) : 0

  const btnBase = { fontFamily: 'var(--font-mono, monospace)', fontSize: 12, fontWeight: 800, borderRadius: 8, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 } as const

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: bgColor, color: isDark ? '#f4f4f5' : '#09090b', fontFamily: "var(--font-sans, 'Geist', sans-serif)" }}>

      {/* TOOLBAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `2px solid ${isDark ? '#27272a' : '#000'}`, background: isDark ? 'rgba(9,9,11,0.85)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', flexShrink: 0, gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{ ...btnBase, border: `2px solid ${isDark ? '#3f3f46' : '#000'}`, background: 'transparent', color: isDark ? '#a1a1aa' : '#52525b', fontSize: 11, boxShadow: `2px 2px 0 ${isDark ? '#3f3f46' : '#000'}` }}>← BACK</button>
          <div style={{ border: `2px solid ${isDark ? '#3f3f46' : '#000'}`, borderRadius: 8, padding: '6px 14px', background: isDark ? '#18181b' : '#fff', boxShadow: `3px 3px 0 ${isDark ? '#000' : '#000'}` }}>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: isDark ? '#a1a1aa' : '#71717a' }}>🏙️ DEPLOYMENT CITY</span>
            <span style={{ marginLeft: 10, fontFamily: 'var(--font-mono, monospace)', fontSize: 12, fontWeight: 800, color: isDark ? '#f4f4f5' : '#09090b' }}>{data.projectName}</span>
          </div>
          <div style={{ border: `2px solid ${riskScore >= 40 ? '#dc2626' : '#16a34a'}`, borderRadius: 8, padding: '6px 12px', background: riskScore >= 40 ? 'rgba(220,38,38,0.1)' : 'rgba(22,163,74,0.1)', fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 800, color: riskScore >= 40 ? '#dc2626' : '#16a34a', boxShadow: `2px 2px 0 ${riskScore >= 40 ? '#dc2626' : '#16a34a'}` }}>
            {riskScore >= 40 ? '🛑' : '🟢'} RISK {riskScore}/100
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button id="btn-simulate-release" onClick={simPhase === 'idle' ? handleSimulate : handleReset} disabled={simPhase === 'running'}
            style={{ ...btnBase, border: '2px solid #000', background: simPhase === 'idle' ? '#09090b' : simPhase === 'done' ? '#3f3f46' : '#dc2626', color: '#fff', boxShadow: simPhase === 'running' ? 'none' : '3px 3px 0 #000', opacity: simPhase === 'running' ? 0.7 : 1, cursor: simPhase === 'running' ? 'not-allowed' : 'pointer' }}>
            {simPhase === 'idle' ? '🚀 SIMULATE RELEASE' : simPhase === 'done' ? '↺ RESET CITY' : '⏱ CASCADING…'}
          </button>
          <button id="btn-save-city-png" onClick={handleExportPng} style={{ ...btnBase, border: `2px solid ${isDark ? '#3f3f46' : '#000'}`, background: isDark ? '#27272a' : '#fff', color: isDark ? '#f4f4f5' : '#09090b', boxShadow: `3px 3px 0 ${isDark ? '#52525b' : '#000'}`, fontSize: 11 }}>📸 SAVE PNG</button>
          <button id="btn-export-readiness-md" onClick={handleExportMd} style={{ ...btnBase, border: `2px solid ${isDark ? '#3f3f46' : '#000'}`, background: isDark ? '#27272a' : '#fff', color: isDark ? '#f4f4f5' : '#09090b', boxShadow: `3px 3px 0 ${isDark ? '#52525b' : '#000'}`, fontSize: 11 }}>📄 EXPORT .MD</button>
          <button id="btn-export-readiness-pdf" onClick={handleExportPdf} disabled={isExportingPdf} style={{ ...btnBase, border: '2px solid #000', background: '#09090b', color: '#fff', boxShadow: isExportingPdf ? 'none' : '3px 3px 0 #000', opacity: isExportingPdf ? 0.7 : 1, cursor: isExportingPdf ? 'wait' : 'pointer', fontSize: 11 }}>{isExportingPdf ? '⏳ GENERATING…' : '📋 EXPORT PDF'}</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* CANVAS */}
        <div ref={wrapperRef} style={{ flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
          <canvas ref={canvasRef} width={canvasSize.w} height={canvasSize.h} onClick={handleCanvasClick}
            style={{ width: '100%', height: '100%', cursor: 'crosshair', display: 'block' }} />

          {/* Legend */}
          <div style={{ position: 'absolute', bottom: 14, left: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[{ color: '#f0fdf4', border: '#86efac', label: 'Nominal' }, { color: '#fef3c7', border: '#fbbf24', label: 'Degraded' }, { color: '#fee2e2', border: '#f87171', label: 'Failed' }].map(i => (
              <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 5, border: `1.5px solid ${isDark ? '#3f3f46' : '#000'}`, borderRadius: 6, padding: '4px 10px', background: isDark ? 'rgba(9,9,11,0.75)' : 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)' }}>
                <div style={{ width: 9, height: 9, background: i.color, border: `1.5px solid ${i.border}`, borderRadius: 2 }} />
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 700, color: isDark ? '#a1a1aa' : '#52525b' }}>{i.label}</span>
              </div>
            ))}
            <div style={{ border: `1.5px solid ${isDark ? '#3f3f46' : '#000'}`, borderRadius: 6, padding: '4px 10px', background: isDark ? 'rgba(9,9,11,0.75)' : 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)', fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 700, color: isDark ? '#a1a1aa' : '#52525b' }}>📡 = SPOF &nbsp;·&nbsp; HEIGHT = FILE COUNT</div>
          </div>

          {simPhase === 'idle' && (
            <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', border: `1.5px solid ${isDark ? '#3f3f46' : '#000'}`, borderRadius: 8, padding: '6px 18px', background: isDark ? 'rgba(9,9,11,0.82)' : 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)', fontFamily: 'var(--font-mono, monospace)', fontSize: 12, fontWeight: 600, color: isDark ? '#a1a1aa' : '#52525b', whiteSpace: 'nowrap' }}>
              Click a building to inspect &nbsp;·&nbsp; Taller = more files &nbsp;·&nbsp; 📡 = SPOF risk module
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{ width: 316, flexShrink: 0, borderLeft: `2px solid ${isDark ? '#27272a' : '#000'}`, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: isDark ? '#09090b' : '#fff' }}>
          <AnimatePresence>
            {verdict && (
              <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '18px 18px 14px', background: verdict === 'blocked' ? 'rgba(220,38,38,0.09)' : 'rgba(22,163,74,0.09)', borderBottom: `2px solid ${verdict === 'blocked' ? '#dc2626' : '#16a34a'}`, flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 17, fontWeight: 900, color: verdict === 'blocked' ? '#dc2626' : '#16a34a', marginBottom: 4 }}>{verdict === 'blocked' ? '🛑 GATE BLOCKED' : '🟢 GATE CLEARED'}</div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: isDark ? '#a1a1aa' : '#52525b', fontWeight: 700 }}>{verdict === 'blocked' ? `${blastPct}% blast radius — Deployment halted` : 'Cascade nominal — Deployment cleared'}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {(simPhase === 'running' || simPhase === 'done') && (
            <div style={{ padding: '14px 18px', borderBottom: `1.5px solid ${isDark ? '#27272a' : '#e4e4e7'}` }}>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 800, color: '#71717a', letterSpacing: '0.1em', marginBottom: 10 }}>CASCADE MONITOR</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
                {[{ label: 'FAILED', val: failedCount, color: '#dc2626' }, { label: 'DEGRAD', val: degradedCount, color: '#d97706' }, { label: 'OK', val: nominalCount, color: '#16a34a' }].map(s => (
                  <div key={s.label} style={{ border: `2px solid ${s.color}`, borderRadius: 8, padding: '8px 4px', textAlign: 'center', background: `${s.color}14` }}>
                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}</div>
                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, fontWeight: 800, color: '#71717a', letterSpacing: '0.08em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {simPhase === 'done' && <div style={{ marginTop: 10, padding: '7px 12px', background: 'rgba(220,38,38,0.08)', border: '1.5px solid #dc2626', borderRadius: 6, fontFamily: 'var(--font-mono, monospace)', fontSize: 12, fontWeight: 700, color: '#dc2626' }}>💥 BLAST RADIUS: {blastPct}% of modules</div>}
            </div>
          )}

          <AnimatePresence mode="wait">
            {selectedBuilding ? (
              <motion.div key={selectedBuilding.module.name} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }} style={{ padding: '14px 18px', flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 800, color: '#71717a', letterSpacing: '0.1em', marginBottom: 12 }}>MODULE INSPECTOR</div>
                <div style={{ border: `2px solid ${isDark ? '#3f3f46' : '#000'}`, borderRadius: 11, overflow: 'hidden', boxShadow: `4px 4px 0 ${isDark ? '#3f3f46' : '#000'}`, marginBottom: 14 }}>
                  <div style={{ padding: '11px 14px', background: selectedBuilding.module.risk === 'danger' ? 'rgba(220,38,38,0.11)' : selectedBuilding.module.risk === 'warn' ? 'rgba(217,119,6,0.11)' : 'rgba(22,163,74,0.09)', borderBottom: `1.5px solid ${isDark ? '#27272a' : '#e4e4e7'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: 'var(--font-sans, sans-serif)', fontSize: 13, fontWeight: 800, color: isDark ? '#f4f4f5' : '#09090b' }}>{selectedBuilding.module.name}</div>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 5, border: `1.5px solid ${selectedBuilding.module.risk === 'danger' ? '#dc2626' : selectedBuilding.module.risk === 'warn' ? '#d97706' : '#16a34a'}`, color: selectedBuilding.module.risk === 'danger' ? '#dc2626' : selectedBuilding.module.risk === 'warn' ? '#d97706' : '#16a34a', background: selectedBuilding.module.risk === 'danger' ? 'rgba(220,38,38,0.1)' : selectedBuilding.module.risk === 'warn' ? 'rgba(217,119,6,0.1)' : 'rgba(22,163,74,0.1)' }}>{selectedBuilding.module.risk.toUpperCase()}</span>
                  </div>
                  <div style={{ padding: '11px 14px' }}>
                    {[{ label: 'FILES', val: `${selectedBuilding.module.files}` }, { label: 'CASCADE STATE', val: selectedBuilding.cascadeState.toUpperCase() }, { label: 'SPOF', val: selectedBuilding.spof ? '⚠️ YES' : '✓ NO' }].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: `1px dashed ${isDark ? '#27272a' : '#e4e4e7'}` }}>
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 700, color: '#71717a' }}>{row.label}</span>
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 800, color: isDark ? '#f4f4f5' : '#09090b' }}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedBuilding.dependents.length > 0 && (
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 800, color: '#71717a', letterSpacing: '0.1em', marginBottom: 8 }}>AFFECTED IF THIS FAILS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {selectedBuilding.dependents.map(dep => (
                        <div key={dep} style={{ border: `1.5px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`, borderRadius: 7, padding: '7px 12px', fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 600, color: isDark ? '#a1a1aa' : '#52525b', background: isDark ? '#18181b' : '#f4f4f5', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#d97706' }}>→</span> {dep}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14, color: isDark ? '#52525b' : '#a1a1aa', textAlign: 'center' }}>
                <div style={{ fontSize: 44 }}>🏙️</div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>Click any building to inspect module details and dependency chain.</div>
                {simPhase === 'idle' && <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 600, color: isDark ? '#3f3f46' : '#d4d4d8' }}>Then hit "SIMULATE RELEASE" to watch the cascade unfold.</div>}
                <div style={{ marginTop: 12, width: '100%' }}>
                  <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 800, color: '#71717a', letterSpacing: '0.1em', marginBottom: 8 }}>MODULE REGISTRY</div>
                  {buildings.map(b => (
                    <div key={b.module.name} onClick={() => setSelectedBuilding(b)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 7, cursor: 'pointer', marginBottom: 4, border: `1.5px solid ${isDark ? '#27272a' : '#e4e4e7'}`, background: isDark ? '#18181b' : '#f4f4f5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: b.cascadeState === 'failed' ? '#dc2626' : b.cascadeState === 'degraded' ? '#d97706' : b.module.risk === 'danger' ? '#f87171' : b.module.risk === 'warn' ? '#fbbf24' : '#86efac' }} />
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 600, color: isDark ? '#a1a1aa' : '#52525b' }}>{b.module.name}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 700, color: isDark ? '#52525b' : '#a1a1aa' }}>{b.module.files}f</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
