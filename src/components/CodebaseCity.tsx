'use client'

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Maximize2,
  Minimize2,
  RotateCcw,
  Plus,
  Minus,
  Download,
  Compass,
  Layers,
  Activity,
  Box,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Play,
  Share2,
} from 'lucide-react'
import {
  getCityDataForProject,
  type CityBuildingNode,
  type CityDistrict,
  type CityDataset,
} from '@/lib/city-data'
import type { ProjectData } from '@/types'

interface CodebaseCityProps {
  data: ProjectData
  theme?: 'light'
  onSimulateTrigger?: () => void
  activeSimulationEvent?: string
  damagePercent?: number
  overlayOffsetRight?: number
}

// Isometric Projection Constants (Standard 2:1 axonometric projection)
const ISO_DX = 42
const ISO_DY = 21
const BASE_BUILDING_W = 28
const MAX_BUILDING_H = 140
const MIN_BUILDING_H = 18

function projectIso(gx: number, gy: number, panX: number, panY: number, zoom: number) {
  const sx = (gx - gy) * ISO_DX * zoom + panX
  const sy = (gx + gy) * ISO_DY * zoom + panY
  return { sx, sy }
}

export default function CodebaseCity({
  data,
  theme = 'light',
  onSimulateTrigger,
  activeSimulationEvent,
  damagePercent = 0,
  overlayOffsetRight = 0,
}: CodebaseCityProps) {
  const isDark = false
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)

  // Dataset
  const dataset: CityDataset = useMemo(() => getCityDataForProject(data), [data])
  const { files, districts, totalFiles, totalLines, totalDependencies, repoName } = dataset

  // Controls State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [heightMode, setHeightMode] = useState<'loc' | 'dependents'>('loc')
  const [showDependencyFlow, setShowDependencyFlow] = useState(true)
  const [showHatching, setShowHatching] = useState(true)
  const [isOrbiting, setIsOrbiting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)
  const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(null)
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'src/': true,
    'src/app/': true,
    'src/core/': true,
    'workers/': true,
    'tests/': true,
    'docs/': true,
  })

  // Camera Pan & Zoom
  const [zoom, setZoom] = useState(1.0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const orbitAngleRef = useRef(0)
  const particlePhaseRef = useRef(0)
  const buildingScreenPosRef = useRef<Map<string, { sx: number; sy: number; height: number; bw: number; b: CityBuildingNode }>>(new Map())

  // Guided Tour State
  const [tourStep, setTourStep] = useState<number | null>(null)
  const tourStops = useMemo(
    () => [
      {
        id: 'src/app/shell.ts',
        title: 'Entry District — Application Shell',
        desc: 'The entry district creates the application shell and registers a minimal router with zero-overhead page transitions.',
      },
      {
        id: 'src/app/routes.ts',
        title: 'Route-Table Square',
        desc: 'The route-table square is the single place where new pages, sub-apps, and authenticated view boundaries are added.',
      },
      {
        id: 'src/core/store.ts',
        title: 'The Skyline Sovereign — Subscribable State Tree',
        desc: 'The tallest tower on the skyline: the most-depended-on module in the whole repository. Central reactive store broadcasting immutable states.',
      },
      {
        id: 'src/core/log.ts',
        title: 'Structured Logging Tower',
        desc: 'Structured logging tower with correlation ID tracing, ring-buffered memory flushing, and zero-allocation JSON formatting.',
      },
      {
        id: 'src/core/event.ts',
        title: 'Publish-Subscribe Kiosk',
        desc: 'A small publish-subscribe kiosk standing beside the central tower, distributing decoupled asynchronous event notifications.',
      },
      {
        id: 'src/core/http.ts',
        title: 'Request-Layer Office Block',
        desc: 'Request-layer office block handling timeout, retry, and cancellation with exponential backoff plus full jitter.',
      },
      {
        id: 'src/core/cache.ts',
        title: 'Two-Level Cache Neighborhood',
        desc: 'Combines L1 in-memory fast lookups and persistent storage with tag-based invalidation and eviction leases.',
      },
    ],
    []
  )

  // Selected building object
  const selectedBuilding = useMemo(
    () => files.find((f) => f.id === selectedBuildingId) || null,
    [files, selectedBuildingId]
  )

  // Center the city when component mounts or canvas resizes
  const centerCamera = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    // Center of canvas
    setPan({
      x: rect.width * 0.46,
      y: rect.height * 0.28,
    })
    setZoom(1.0)
    orbitAngleRef.current = 0
    setIsOrbiting(false)
  }, [])

  useEffect(() => {
    centerCamera()
  }, [centerCamera])

  // Filtered files for left sidebar search
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files
    const q = searchQuery.toLowerCase()
    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.folder.toLowerCase().includes(q) ||
        f.path.toLowerCase().includes(q)
    )
  }, [files, searchQuery])

  // Group filtered files by folder
  const groupedFiles = useMemo(() => {
    const groups: Record<string, CityBuildingNode[]> = {}
    filteredFiles.forEach((f) => {
      const folder = f.folder || 'src/'
      if (!groups[folder]) groups[folder] = []
      groups[folder].push(f)
    })
    return groups
  }, [filteredFiles])

  // Toggle folder open state
  const toggleFolder = (folder: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder],
    }))
  }

  // Handle tour step change
  const handleTourStep = (step: number) => {
    if (step < 0 || step >= tourStops.length) {
      setTourStep(null)
      return
    }
    setTourStep(step)
    const targetId = tourStops[step].id
    setSelectedBuildingId(targetId)
    // Focus camera on target building
    const b = files.find((f) => f.id === targetId)
    if (b && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const targetIso = projectIso(b.gridX, b.gridY, 0, 0, zoom)
      setPan({
        x: rect.width * 0.46 - targetIso.sx,
        y: rect.height * 0.35 - targetIso.sy,
      })
    }
  }

  // PNG Export Handler
  const handleExportPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `codebase-city-${repoName.replace(/[/\\?%*:|"<>]/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  /* ─────────────────────────────────────────────────────────────
     CANVAS RENDER LOOP (HTML5 High-Performance Isometric Renderer)
     ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let isMounted = true

    const render = () => {
      if (!isMounted || !canvas || !ctx) return

      // Handle canvas resize & DPI scaling
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const dpr = window.devicePixelRatio || 1

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr
        canvas.height = height * dpr
      }

      ctx.save()
      ctx.scale(dpr, dpr)

      // Background color: Clean warm parchment/cream in light mode, dark blueprint in dark mode
      const bg = isDark ? '#0e0e0d' : '#ede8db'
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, width, height)

      // Technical blueprint grid dots
      const dotSpacing = 28 * zoom
      const dotColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'
      ctx.fillStyle = dotColor

      const startX = pan.x % dotSpacing
      const startY = pan.y % dotSpacing
      for (let x = startX - dotSpacing; x < width + dotSpacing; x += dotSpacing) {
        for (let y = startY - dotSpacing; y < height + dotSpacing; y += dotSpacing) {
          ctx.beginPath()
          ctx.arc(x, y, 1.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Orbit animation: continuously rotate 3D angle around city center
      if (isOrbiting) {
        orbitAngleRef.current += 0.007
        particlePhaseRef.current += 0.02
      } else {
        particlePhaseRef.current += 0.015
      }

      const cosA = Math.cos(orbitAngleRef.current)
      const sinA = Math.sin(orbitAngleRef.current)

      // Center of city grid (4.5, 4.5)
      const cx = 4.5
      const cy = 4.5

      // Helper to project rotated grid coords around center
      const projectRotated = (gx: number, gy: number) => {
        const dx = gx - cx
        const dy = gy - cy
        const rotGx = cx + (dx * cosA - dy * sinA)
        const rotGy = cy + (dx * sinA + dy * cosA)
        return projectIso(rotGx, rotGy, pan.x, pan.y, zoom)
      }

      // Draw Isometric Grid Ground Plane (smoothly rotating in 3D)
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.07)'
      ctx.lineWidth = 1

      const gridCols = 9
      const gridRows = 9
      for (let c = 0; c <= gridCols; c++) {
        const p1 = projectRotated(c, 0)
        const p2 = projectRotated(c, gridRows)
        ctx.beginPath()
        ctx.moveTo(p1.sx, p1.sy)
        ctx.lineTo(p2.sx, p2.sy)
        ctx.stroke()
      }
      for (let r = 0; r <= gridRows; r++) {
        const p1 = projectRotated(0, r)
        const p2 = projectRotated(gridCols, r)
        ctx.beginPath()
        ctx.moveTo(p1.sx, p1.sy)
        ctx.lineTo(p2.sx, p2.sy)
        ctx.stroke()
      }

      // Project all buildings with rotated coordinates and calculate true depth:
      // In axonometric projection, distance from camera is rotGx + rotGy
      const rotatedBuildings = files.map((b) => {
        const dx = b.gridX - cx
        const dy = b.gridY - cy
        const rotGx = cx + (dx * cosA - dy * sinA)
        const rotGy = cy + (dx * sinA + dy * cosA)
        const { sx, sy } = projectIso(rotGx, rotGy, pan.x, pan.y, zoom)
        const depth = rotGx + rotGy
        return { b, sx, sy, depth }
      })

      // Sort back-to-front by depth so foreground buildings draw on top
      const sortedBuildings = rotatedBuildings.sort((a, b) => a.depth - b.depth)

      // Building screen positions cache for hit testing & dependency flight paths
      const buildingScreenPos = new Map<string, { sx: number; sy: number; height: number; bw: number; b: CityBuildingNode }>()

      // Draw each building
      sortedBuildings.forEach(({ b, sx, sy }) => {
        const bw = BASE_BUILDING_W * zoom
        const bd = bw * 0.5

        // Height based on mode
        const factor = heightMode === 'loc' ? b.heightFactorLoc : b.heightFactorDep
        const h = Math.max(MIN_BUILDING_H * zoom, factor * MAX_BUILDING_H * zoom)

        buildingScreenPos.set(b.id, { sx, sy, height: h, bw, b })

        const isSelected = selectedBuildingId === b.id
        const isHovered = hoveredBuildingId === b.id
        const isHighlight = isSelected || isHovered

        // Risk state / simulation failure reactivity
        const isDamaged = damagePercent > 40 && (b.risk === 'danger' || b.risk === 'warn')
        const isCritical = damagePercent > 70 && b.risk === 'danger'

        // Colors: Buildings reflect their danger/warn risk states and district palettes
        let topColor = b.districtColor.top
        let leftColor = b.districtColor.left
        let rightColor = b.districtColor.right

        if (b.risk === 'danger') {
          topColor = '#f87171'
          leftColor = '#ef4444'
          rightColor = '#dc2626'
        } else if (b.risk === 'warn') {
          topColor = '#fbbf24'
          leftColor = '#f59e0b'
          rightColor = '#d97706'
        }

        if (isCritical) {
          topColor = '#ff4d4d'
          leftColor = '#dc2626'
          rightColor = '#991b1b'
        } else if (isDamaged) {
          topColor = '#f59e0b'
          leftColor = '#d97706'
          rightColor = '#b45309'
        } else if (isHighlight) {
          topColor = isDark ? '#ffffff' : '#fef08a'
          leftColor = b.risk === 'danger' ? '#f87171' : b.risk === 'warn' ? '#fbbf24' : b.districtColor.top
          rightColor = b.risk === 'danger' ? '#ef4444' : b.risk === 'warn' ? '#f59e0b' : b.districtColor.left
        }

        // Draw shadow on ground plane
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(sx + bw, sy - bd)
        ctx.lineTo(sx + bw + h * 0.35, sy - bd + h * 0.15)
        ctx.lineTo(sx + h * 0.35, sy + h * 0.15)
        ctx.closePath()
        ctx.fillStyle = isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.12)'
        ctx.fill()

        // 1. LEFT FACE
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(sx, sy - h)
        ctx.lineTo(sx - bw, sy - bd - h)
        ctx.lineTo(sx - bw, sy - bd)
        ctx.closePath()
        ctx.fillStyle = leftColor
        ctx.fill()
        ctx.strokeStyle = isHighlight ? '#000000' : isDark ? '#27272a' : '#18181b'
        ctx.lineWidth = isHighlight ? 2 : 1
        ctx.stroke()

        // 2. RIGHT FACE
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(sx, sy - h)
        ctx.lineTo(sx + bw, sy - bd - h)
        ctx.lineTo(sx + bw, sy - bd)
        ctx.closePath()
        ctx.fillStyle = rightColor
        ctx.fill()
        ctx.strokeStyle = isHighlight ? '#000000' : isDark ? '#27272a' : '#18181b'
        ctx.lineWidth = isHighlight ? 2 : 1
        ctx.stroke()

        // Hatching lines on right face (Architectural drafting style)
        if (showHatching && h > 20 * zoom) {
          ctx.save()
          ctx.beginPath()
          ctx.rect(sx, sy - h - bd, bw, h + bd)
          ctx.clip()

          ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)'
          ctx.lineWidth = 1
          const hatchStep = 6 * zoom
          for (let hy = sy - h - bd; hy < sy + bd; hy += hatchStep) {
            ctx.beginPath()
            ctx.moveTo(sx, hy)
            ctx.lineTo(sx + bw, hy - bd)
            ctx.stroke()
          }
          ctx.restore()
        }

        // Window lights / dots on tall buildings
        if (h > 45 * zoom) {
          const winColor = isDark ? 'rgba(255, 235, 160, 0.75)' : 'rgba(255, 255, 255, 0.65)'
          ctx.fillStyle = winColor
          const rows = Math.min(6, Math.floor(h / (14 * zoom)))
          for (let r = 1; r <= rows; r++) {
            const wy = sy - (r * (h / (rows + 1)))
            // Left face windows
            ctx.beginPath()
            ctx.arc(sx - bw * 0.45, wy - bd * 0.45, 1.4 * zoom, 0, Math.PI * 2)
            ctx.fill()
            // Right face windows
            ctx.beginPath()
            ctx.arc(sx + bw * 0.45, wy - bd * 0.45, 1.4 * zoom, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        // 3. TOP FACE (ROOF)
        ctx.beginPath()
        ctx.moveTo(sx, sy - h)
        ctx.lineTo(sx + bw, sy - bd - h)
        ctx.lineTo(sx, sy - bd * 2 - h)
        ctx.lineTo(sx - bw, sy - bd - h)
        ctx.closePath()
        ctx.fillStyle = topColor
        ctx.fill()
        ctx.strokeStyle = isHighlight ? '#000000' : isDark ? '#27272a' : '#18181b'
        ctx.lineWidth = isHighlight ? 2.5 : 1
        ctx.stroke()

        // Spire / Antenna on tallest tower (e.g. store.ts or max dependents)
        if (b.spof || b.id.includes('store.ts')) {
          const apexY = sy - bd * 2 - h
          ctx.beginPath()
          ctx.moveTo(sx, apexY)
          ctx.lineTo(sx, apexY - 24 * zoom)
          ctx.strokeStyle = isCritical ? '#ef4444' : isDark ? '#38bdf8' : '#0284c7'
          ctx.lineWidth = 2
          ctx.stroke()

          // Blinking beacon ball
          const beaconSize = (3 + Math.sin(particlePhaseRef.current * 4) * 1.5) * zoom
          ctx.beginPath()
          ctx.arc(sx, apexY - 24 * zoom, beaconSize, 0, Math.PI * 2)
          ctx.fillStyle = isCritical ? '#ef4444' : '#f59e0b'
          ctx.fill()
        }

        // Label on top of building if highlighted
        if (isHighlight) {
          ctx.font = `700 ${Math.max(10, Math.round(11 * zoom))}px "Geist Mono", monospace`
          ctx.textAlign = 'center'
          ctx.fillStyle = isDark ? '#ffffff' : '#000000'
          ctx.fillText(b.name, sx, sy - bd * 2 - h - 10 * zoom)
        }
      })

      // ─────────────────────────────────────────────────────────────
      // DEPENDENCY FLIGHT PATHS (Curved Arcs & Energy Pulses)
      // ─────────────────────────────────────────────────────────────
      if (showDependencyFlow) {
        files.forEach((source) => {
          if (!source.dependencies || source.dependencies.length === 0) return
          const sPos = buildingScreenPos.get(source.id)
          if (!sPos) return

          source.dependencies.forEach((targetPath) => {
            const target = files.find((f) => f.path === targetPath || f.id === targetPath)
            if (!target) return
            const tPos = buildingScreenPos.get(target.id)
            if (!tPos) return

            const isRelated =
              selectedBuildingId === source.id ||
              selectedBuildingId === target.id ||
              hoveredBuildingId === source.id ||
              hoveredBuildingId === target.id

            const startX = sPos.sx
            const startY = sPos.sy - sPos.height - 4 * zoom
            const endX = tPos.sx
            const endY = tPos.sy - tPos.height - 4 * zoom

            // High arch control point
            const midX = (startX + endX) / 2
            const midY = Math.min(startY, endY) - 50 * zoom

            ctx.save()
            ctx.beginPath()
            ctx.moveTo(startX, startY)
            ctx.quadraticCurveTo(midX, midY, endX, endY)

            if (isRelated) {
              ctx.strokeStyle = isDark ? '#38bdf8' : '#d97706'
              ctx.lineWidth = 2.2
              ctx.setLineDash([])
            } else {
              ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.15)'
              ctx.lineWidth = 1
              ctx.setLineDash([4 * zoom, 4 * zoom])
            }
            ctx.stroke()

            // Traveling particle on the curve
            const t = (particlePhaseRef.current + (source.lines % 10) * 0.1) % 1
            const invT = 1 - t
            const px = invT * invT * startX + 2 * invT * t * midX + t * t * endX
            const py = invT * invT * startY + 2 * invT * t * midY + t * t * endY

            ctx.beginPath()
            ctx.arc(px, py, isRelated ? 3.5 * zoom : 2 * zoom, 0, Math.PI * 2)
            ctx.fillStyle = isRelated ? '#ea580c' : isDark ? '#ffffff' : '#78350f'
            ctx.fill()

            ctx.restore()
          })
        })
      }

      buildingScreenPosRef.current = buildingScreenPos
      ctx.restore()

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)
    return () => {
      isMounted = false
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [
    files,
    heightMode,
    showDependencyFlow,
    showHatching,
    isOrbiting,
    pan,
    zoom,
    selectedBuildingId,
    hoveredBuildingId,
    isDark,
    damagePercent,
  ])

  // Mouse Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    isDraggingRef.current = true
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x
      const dy = e.clientY - lastMousePosRef.current.y
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
      lastMousePosRef.current = { x: e.clientX, y: e.clientY }
      return
    }

    // Hover hit test using rendered screen positions
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    let found: CityBuildingNode | null = null
    const posList = Array.from(buildingScreenPosRef.current.values()).reverse()

    for (const item of posList) {
      const bw = item.bw
      const h = item.height
      if (mx >= item.sx - bw && mx <= item.sx + bw && my >= item.sy - h - bw && my <= item.sy + bw) {
        found = item.b
        break
      }
    }

    setHoveredBuildingId(found?.id || null)
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  // Wheel to Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.1 : -0.1
    setZoom((z) => Math.min(2.5, Math.max(0.4, Number((z + delta).toFixed(2)))))
  }

  // Canvas Click: Select Building
  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    let clicked: CityBuildingNode | null = null
    const posList = Array.from(buildingScreenPosRef.current.values()).reverse()

    for (const item of posList) {
      const bw = item.bw
      const h = item.height
      if (mx >= item.sx - bw && mx <= item.sx + bw && my >= item.sy - h - bw && my <= item.sy + bw) {
        clicked = item.b
        break
      }
    }

    setSelectedBuildingId(clicked?.id || null)
  }

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        background: isDark ? '#0e0e0d' : '#ede8db',
        fontFamily: "'Geist', sans-serif",
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          TOP HEADER: Codebase City Title, Repo URL, 3 Core Stats
          ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderBottom: isDark ? '1.5px solid #27272a' : '1.5px solid #18181b',
          background: isDark ? '#141413' : '#ede8db',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: 'hsl(var(--neo-button))',
                boxShadow: '0 0 6px hsl(var(--neo-button))',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '12px',
                fontWeight: 700,
                color: isDark ? '#ffffff' : '#18181b',
                whiteSpace: 'nowrap',
              }}
            >
              {repoName}
            </span>
          </div>

          {/* 3 Prominent Stat Counters (Matching Kimi screenshot) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', whiteSpace: 'nowrap' }}>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '15px',
                  fontWeight: 800,
                  color: isDark ? '#ffffff' : '#18181b',
                  lineHeight: 1.1,
                }}
              >
                {totalFiles}
              </span>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '9.5px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: isDark ? '#a1a1aa' : '#71717a',
                  textTransform: 'uppercase',
                }}
              >
                FILES
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', whiteSpace: 'nowrap' }}>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '15px',
                  fontWeight: 800,
                  color: isDark ? '#ffffff' : '#18181b',
                  lineHeight: 1.1,
                }}
              >
                {totalLines.toLocaleString()}
              </span>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '9.5px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: isDark ? '#a1a1aa' : '#71717a',
                  textTransform: 'uppercase',
                }}
              >
                LINES
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', whiteSpace: 'nowrap' }}>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '15px',
                  fontWeight: 800,
                  color: isDark ? '#ffffff' : '#18181b',
                  lineHeight: 1.1,
                }}
              >
                {totalDependencies}
              </span>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '9.5px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: isDark ? '#a1a1aa' : '#71717a',
                  textTransform: 'uppercase',
                }}
              >
                DEPENDENCIES
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>

          {/* Breadcrumb Indicator */}
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '6px',
              border: isDark ? '1px solid #3f3f46' : '1.5px solid #18181b',
              background: isDark ? '#1c1c1a' : '#ffffff',
              color: isDark ? '#e4e4e7' : '#18181b',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span style={{ color: isDark ? '#a1a1aa' : '#71717a' }}>REPO /</span>
            <span>{heightMode === 'loc' ? 'OVERVIEW' : 'BY FAN-IN'}</span>
          </div>

          {/* Guided Tour Trigger Button */}
          <button
            onClick={() => handleTourStep(tourStep === null ? 0 : (tourStep + 1) % tourStops.length)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              fontSize: '10.5px',
              fontWeight: 700,
              fontFamily: "'Geist Mono', monospace",
              background: tourStep !== null ? '#ea580c' : isDark ? '#27272a' : '#ffffff',
              color: tourStep !== null ? '#ffffff' : isDark ? '#ffffff' : '#18181b',
              border: '1.5px solid #18181b',
              borderRadius: '6px',
              boxShadow: '1.5px 1.5px 0 0 #18181b',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Compass size={12} />
            <span>{tourStep === null ? 'Guided Tour' : `Tour ${tourStep + 1}/${tourStops.length}`}</span>
          </button>

          {/* Export PNG Button */}
          <button
            onClick={handleExportPng}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              fontSize: '10.5px',
              fontWeight: 700,
              fontFamily: "'Geist Mono', monospace",
              background: isDark ? '#27272a' : '#ffffff',
              color: isDark ? '#ffffff' : '#18181b',
              border: '1.5px solid #18181b',
              borderRadius: '6px',
              boxShadow: '1.5px 1.5px 0 0 #18181b',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            title="Download PNG Snapshot"
          >
            <Download size={12} />
            <span>PNG</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SPLIT BODY: Left File Explorer + Center 3D City Canvas
          ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        {/* ── LEFT: File & Directory Tree Explorer ── */}
        <div
          style={{
            width: isSidebarOpen ? '230px' : '0px',
            borderRight: isSidebarOpen ? (isDark ? '1.5px solid #27272a' : '1.5px solid #18181b') : 'none',
            background: isDark ? '#141413' : '#ede8db',
            display: isSidebarOpen ? 'flex' : 'none',
            flexDirection: 'column',
            flexShrink: 0,
            overflow: 'hidden',
            zIndex: 5,
            transition: 'width 0.15s ease',
          }}
        >
          {/* Search Input & Close Sidebar Button */}
          <div style={{ padding: '8px 10px', borderBottom: isDark ? '1px solid #27272a' : '1px solid #dcd6c5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 8px',
                  background: isDark ? '#1f1f1d' : '#ffffff',
                  border: isDark ? '1px solid #3f3f46' : '1.5px solid #18181b',
                  borderRadius: '6px',
                  boxShadow: isDark ? 'none' : '1.5px 1.5px 0 0 #18181b',
                  minWidth: 0,
                }}
              >
                <Search size={12} color={isDark ? '#a1a1aa' : '#71717a'} style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search file or directory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    color: isDark ? '#ffffff' : '#18181b',
                    minWidth: 0,
                  }}
                />
                {searchQuery && (
                  <X
                    size={12}
                    style={{ cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => setSearchQuery('')}
                  />
                )}
              </div>

              {/* Close Sidebar Button */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                title="Close file list"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  background: isDark ? '#1f1f1d' : '#ffffff',
                  border: isDark ? '1px solid #3f3f46' : '1.5px solid #18181b',
                  borderRadius: '6px',
                  boxShadow: isDark ? 'none' : '1.5px 1.5px 0 0 #18181b',
                  cursor: 'pointer',
                  color: isDark ? '#a1a1aa' : '#18181b',
                  flexShrink: 0,
                  transition: 'all 0.1s ease',
                }}
              >
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>

          {/* Directory & Files Tree */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '6px 8px',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11.5px',
            }}
          >
            {Object.entries(groupedFiles).map(([folder, folderFiles]) => {
              const isOpen = openFolders[folder] ?? true
              const folderLines = folderFiles.reduce((sum, f) => sum + f.lines, 0)
              const firstFile = folderFiles[0]
              const folderColor = firstFile?.districtColor.base || '#8c533c'

              return (
                <div key={folder} style={{ marginBottom: '4px' }}>
                  {/* Folder Row */}
                  <div
                    onClick={() => toggleFolder(folder)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: isOpen ? (isDark ? '#27272a33' : '#e4decb') : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      <span
                        style={{
                          width: '9px',
                          height: '9px',
                          background: folderColor,
                          borderRadius: '2px',
                          display: 'inline-block',
                        }}
                      />
                      <span style={{ fontWeight: 700, color: isDark ? '#f4f4f5' : '#18181b' }}>
                        {folder}
                      </span>
                    </div>

                    <span style={{ fontSize: '10.5px', color: isDark ? '#71717a' : '#78716c' }}>
                      {folderLines}
                    </span>
                  </div>

                  {/* Indented File List */}
                  {isOpen && (
                    <div style={{ paddingLeft: '16px', marginTop: '2px' }}>
                      {folderFiles.map((file) => {
                        const isSelected = selectedBuildingId === file.id
                        const isHovered = hoveredBuildingId === file.id

                        return (
                          <div
                            key={file.id}
                            onClick={() => {
                              setSelectedBuildingId(file.id)
                              // Pan camera towards building
                              if (containerRef.current) {
                                const rect = containerRef.current.getBoundingClientRect()
                                const p = projectIso(file.gridX, file.gridY, 0, 0, zoom)
                                setPan({
                                  x: rect.width * 0.46 - p.sx,
                                  y: rect.height * 0.35 - p.sy,
                                })
                              }
                            }}
                            onMouseEnter={() => setHoveredBuildingId(file.id)}
                            onMouseLeave={() => setHoveredBuildingId(null)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '3px 6px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              background: isSelected
                                ? isDark
                                  ? '#3f3f46'
                                  : '#ded6be'
                                : isHovered
                                ? isDark
                                  ? '#27272a'
                                  : '#e5ded0'
                                : 'transparent',
                              borderLeft: isSelected
                                ? '2px solid #ea580c'
                                : '2px solid transparent',
                              transition: 'all 0.1s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  width: '7px',
                                  height: '7px',
                                  background:
                                    file.risk === 'danger'
                                      ? '#ef4444'
                                      : file.risk === 'warn'
                                      ? '#f59e0b'
                                      : file.districtColor.base,
                                  borderRadius: '1.5px',
                                  display: 'inline-block',
                                }}
                              />
                              <span
                                style={{
                                  color: isSelected
                                    ? isDark
                                      ? '#ffffff'
                                      : '#000000'
                                    : isDark
                                    ? '#d4d4d8'
                                    : '#292524',
                                  fontWeight: isSelected ? 700 : 500,
                                }}
                              >
                                {file.name}
                              </span>
                            </div>

                            <span
                              style={{
                                fontSize: '10px',
                                color: isDark ? '#a1a1aa' : '#78716c',
                              }}
                            >
                              {file.lines}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── CENTER: 3D Isometric Canvas Area ── */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            cursor: isDraggingRef.current ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
        >


          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />

          {/* ─────────────────────────────────────────────────────────────
              HOVERED / SELECTED BUILDING TOOLTIP CARD
              ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {(selectedBuilding || hoveredBuildingId) && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: overlayOffsetRight > 0 ? '12px' : '50px',
                  right: overlayOffsetRight > 0 ? `${overlayOffsetRight + 12}px` : '12px',
                  transition: 'right 0.2s ease, top 0.2s ease',
                  background: isDark ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(8px)',
                  border: isDark ? '1px solid #3f3f46' : '1.5px solid #18181b',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  boxShadow: isDark ? '0 8px 20px rgba(0,0,0,0.5)' : '2px 2px 0 0 #18181b',
                  width: '210px',
                  maxWidth: 'calc(100% - 24px)',
                  zIndex: 20,
                  pointerEvents: 'auto',
                }}
              >
                {(() => {
                  const b = selectedBuilding || files.find((f) => f.id === hoveredBuildingId)
                  if (!b) return null
                  return (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                          marginBottom: '3px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              background:
                                b.risk === 'danger'
                                  ? '#ef4444'
                                  : b.risk === 'warn'
                                  ? '#f59e0b'
                                  : b.districtColor.base,
                              borderRadius: '1.5px',
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: '11px',
                              fontWeight: 700,
                              color: isDark ? '#ffffff' : '#18181b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {b.name}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: '9.5px',
                            color: isDark ? '#a1a1aa' : '#71717a',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}
                        >
                          {b.lines} lines
                        </span>
                      </div>

                      <div
                        style={{
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '9px',
                          color: isDark ? '#a1a1aa' : '#71717a',
                          marginBottom: '5px',
                        }}
                      >
                        {b.folder} · {b.dependents} deps
                      </div>

                      {/* Design intent / Annotation */}
                      {b.annotation && (
                        <p
                          style={{
                            fontSize: '9.5px',
                            lineHeight: '1.35',
                            color: isDark ? '#d4d4d8' : '#27272a',
                            margin: '0 0 5px 0',
                            padding: '4px 6px',
                            background: isDark ? '#27272a' : '#f5f5f4',
                            borderRadius: '3px',
                            borderLeft: `2.5px solid ${b.risk === 'danger' ? '#ef4444' : b.risk === 'warn' ? '#f59e0b' : b.districtColor.base}`,
                          }}
                        >
                          {b.annotation}
                        </p>
                      )}

                      {/* Dependencies chips */}
                      {b.dependencies && b.dependencies.length > 0 && (
                        <div>
                          <div
                            style={{
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: '8.5px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: isDark ? '#71717a' : '#a8a29e',
                              marginBottom: '2px',
                            }}
                          >
                            DEPENDS ON:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                            {b.dependencies.slice(0, 3).map((dep, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontFamily: "'Geist Mono', monospace",
                                  fontSize: '8.5px',
                                  padding: '1px 5px',
                                  borderRadius: '2.5px',
                                  background: isDark ? '#3f3f46' : '#e7e5e4',
                                  color: isDark ? '#e4e4e7' : '#292524',
                                }}
                              >
                                {dep.split('/').pop()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─────────────────────────────────────────────────────────────
              GUIDED TOUR ONBOARDING CARD (When Tour is Active)
              ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {tourStep !== null && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '18px',
                  background: isDark ? '#1c1c1e' : '#ffffff',
                  border: '2px solid #18181b',
                  borderRadius: '8px',
                  boxShadow: '4px 4px 0 0 #18181b',
                  padding: '14px 18px',
                  width: '320px',
                  zIndex: 25,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: '#ea580c',
                      letterSpacing: '0.05em',
                    }}
                  >
                    ONBOARDING TOUR · STEP {tourStep + 1} OF {tourStops.length}
                  </span>
                  <X
                    size={14}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setTourStep(null)}
                  />
                </div>

                <div
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontSize: '14px',
                    fontWeight: 800,
                    color: isDark ? '#ffffff' : '#18181b',
                    marginBottom: '4px',
                  }}
                >
                  {tourStops[tourStep].title}
                </div>

                <p
                  style={{
                    fontSize: '12px',
                    lineHeight: '1.45',
                    color: isDark ? '#a1a1aa' : '#52525b',
                    margin: '0 0 12px 0',
                  }}
                >
                  {tourStops[tourStep].desc}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <button
                    disabled={tourStep === 0}
                    onClick={() => handleTourStep(tourStep - 1)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontFamily: "'Geist Mono', monospace",
                      fontWeight: 700,
                      background: isDark ? '#27272a' : '#f5f5f4',
                      border: '1.5px solid #18181b',
                      borderRadius: '5px',
                      cursor: tourStep === 0 ? 'not-allowed' : 'pointer',
                      opacity: tourStep === 0 ? 0.5 : 1,
                    }}
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => handleTourStep(tourStep + 1)}
                    style={{
                      padding: '4px 14px',
                      fontSize: '11px',
                      fontFamily: "'Geist Mono', monospace",
                      fontWeight: 700,
                      background: '#ea580c',
                      color: '#ffffff',
                      border: '1.5px solid #18181b',
                      borderRadius: '5px',
                      boxShadow: '1.5px 1.5px 0 0 #18181b',
                      cursor: 'pointer',
                    }}
                  >
                    {tourStep === tourStops.length - 1 ? 'Finish Tour' : 'Next Stop'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─────────────────────────────────────────────────────────────
              TOP LEFT: Reopen Files Button + Color Legend for Districts
              ───────────────────────────────────────────────────────────── */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 15,
            }}
          >
            {/* Reopen Files Button when sidebar is collapsed */}
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                title="Open File Explorer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: "'Geist Mono', monospace",
                  background: isDark ? '#1f1f1d' : '#ffffff',
                  color: isDark ? '#ffffff' : '#18181b',
                  border: isDark ? '1px solid #3f3f46' : '1.5px solid #18181b',
                  borderRadius: '6px',
                  boxShadow: isDark ? 'none' : '2px 2px 0 0 #18181b',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  flexShrink: 0,
                }}
              >
                <ChevronRight size={13} />
                <span>Files</span>
              </button>
            )}

            {/* Color Legend for Districts */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isDark ? 'rgba(24, 24, 27, 0.9)' : 'rgba(237, 232, 219, 0.9)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: isDark ? '1px solid #3f3f46' : '1px solid rgba(0,0,0,0.18)',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '10px',
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '1px 1px 0 0 rgba(0,0,0,0.15)',
              }}
            >
              {districts.slice(0, 4).map((d) => (
                <div key={d.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      background: d.color,
                      borderRadius: '1.5px',
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ color: isDark ? '#d4d4d8' : '#292524', fontWeight: 600 }}>
                    {d.name.replace(/\/$/, '')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              FLOATING BOTTOM CONTROL PILL (Extreme Left Beside Sidebar)
              ───────────────────────────────────────────────────────────── */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '14px',
              display: 'flex',
              pointerEvents: 'none',
              zIndex: 25,
            }}
          >
            <div
              style={{
                pointerEvents: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 14px 4px 8px',
                background: isDark ? 'rgba(24, 24, 27, 0.92)' : 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(12px)',
                border: isDark ? '1px solid rgba(63, 63, 70, 0.85)' : '1.5px solid #18181b',
                borderRadius: '9999px',
                boxShadow: isDark
                  ? '0 12px 28px -4px rgba(0, 0, 0, 0.65), 0 4px 10px rgba(0, 0, 0, 0.4)'
                  : '2px 2.5px 0 0 #18181b, 0 10px 25px -4px rgba(0, 0, 0, 0.12)',
                fontFamily: "'Geist Mono', monospace",
                fontSize: '10.5px',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                boxSizing: 'border-box',
              }}
            >
              {/* Segmented Height Mode Switch */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: isDark ? '#27272a' : '#ede7d8',
                  borderRadius: '9999px',
                  padding: '2px',
                  gap: '2px',
                  border: isDark ? '1px solid #3f3f46' : '1px solid #18181b',
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => setHeightMode('loc')}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: heightMode === 'loc' ? (isDark ? '#ea580c' : '#18181b') : 'transparent',
                    color: heightMode === 'loc' ? '#ffffff' : isDark ? '#a1a1aa' : '#57534e',
                    fontWeight: 700,
                    fontSize: '10px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                  title="Building height represents Lines of Code"
                >
                  LOC
                </button>
                <button
                  onClick={() => setHeightMode('dependents')}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: heightMode === 'dependents' ? (isDark ? '#ea580c' : '#18181b') : 'transparent',
                    color: heightMode === 'dependents' ? '#ffffff' : isDark ? '#a1a1aa' : '#57534e',
                    fontWeight: 700,
                    fontSize: '10px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                  title="Building height represents Dependent Count"
                >
                  Dependents
                </button>
              </div>

              {/* Feature Toggles */}
              <button
                onClick={() => setShowDependencyFlow((p) => !p)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  border: isDark
                    ? showDependencyFlow ? '1px solid rgba(234, 88, 12, 0.6)' : '1px solid #3f3f46'
                    : '1px solid #18181b',
                  background: showDependencyFlow
                    ? isDark ? 'rgba(234, 88, 12, 0.25)' : '#c2410c'
                    : isDark ? 'transparent' : '#ede7d8',
                  color: showDependencyFlow
                    ? isDark ? '#fb923c' : '#ffffff'
                    : isDark ? '#a1a1aa' : '#57534e',
                  fontWeight: 700,
                  fontSize: '10px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                title="Toggle real-time dependency flow arcs"
              >
                <Activity size={11} />
                <span>Flow</span>
              </button>

              <button
                onClick={() => setShowHatching((p) => !p)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  border: isDark
                    ? showHatching ? '1px solid rgba(59, 130, 246, 0.6)' : '1px solid #3f3f46'
                    : '1px solid #18181b',
                  background: showHatching
                    ? isDark ? 'rgba(59, 130, 246, 0.25)' : '#1e3a8a'
                    : isDark ? 'transparent' : '#ede7d8',
                  color: showHatching
                    ? isDark ? '#60a5fa' : '#ffffff'
                    : isDark ? '#a1a1aa' : '#57534e',
                  fontWeight: 700,
                  fontSize: '10px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                title="Toggle architectural technical drafting hatch lines"
              >
                <Box size={11} />
                <span>Hatching</span>
              </button>

              <button
                onClick={() => setIsOrbiting((p) => !p)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  border: isDark
                    ? isOrbiting ? '1px solid rgba(16, 185, 129, 0.6)' : '1px solid #3f3f46'
                    : '1px solid #18181b',
                  background: isOrbiting
                    ? isDark ? 'rgba(16, 185, 129, 0.25)' : '#065f46'
                    : isDark ? 'transparent' : '#ede7d8',
                  color: isOrbiting
                    ? isDark ? '#34d399' : '#ffffff'
                    : isDark ? '#a1a1aa' : '#57534e',
                  fontWeight: 700,
                  fontSize: '10px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                title="Toggle continuous axonometric camera orbit"
              >
                <RotateCcw size={11} className={isOrbiting ? 'animate-spin' : ''} />
                <span>Orbit</span>
              </button>

              <div
                style={{
                  width: '1px',
                  height: '14px',
                  background: isDark ? '#3f3f46' : '#d4cebe',
                  margin: '0 2px',
                  flexShrink: 0,
                }}
              />

              {/* Zoom Percentage */}
              <span
                style={{
                  fontSize: '10px',
                  color: isDark ? '#a1a1aa' : '#57534e',
                  minWidth: '32px',
                  textAlign: 'center',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {Math.round(zoom * 100)}%
              </span>

              {/* Zoom Controls */}
              <button
                onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#ffffff' : '#18181b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '3px',
                  borderRadius: '4px',
                  flexShrink: 0,
                }}
                title="Zoom In"
              >
                <Plus size={12} />
              </button>

              <button
                onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#ffffff' : '#18181b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '3px',
                  borderRadius: '4px',
                  flexShrink: 0,
                }}
                title="Zoom Out"
              >
                <Minus size={12} />
              </button>

              <button
                onClick={centerCamera}
                style={{
                  background: isDark ? '#27272a' : '#ede7d8',
                  border: isDark ? '1px solid #3f3f46' : '1px solid #18181b',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  color: isDark ? '#ffffff' : '#18181b',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '9.5px',
                  fontWeight: 700,
                  padding: '2.5px 8px',
                  marginRight: '8px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                title="Reset Camera View"
              >
                Reset
              </button>

              {/* Safety spacer to guarantee right margin from curved capsule border in all browsers */}
              <div style={{ width: '4px', flexShrink: 0 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
