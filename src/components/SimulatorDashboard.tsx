'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  Layers,
  Activity,
  FileText,
  Maximize2,
  Minimize2,
  X,
  Eye,
  EyeOff,
  Compass,
} from 'lucide-react'
import SimulationTimeline from './SimulationTimeline'
import ReleaseReadinessReport from './ReleaseReadinessReport'
import CodebaseCity from './CodebaseCity'
import type { ProjectData, Module, SimulationEvent } from '@/types'

// SSR-safe: React Flow uses browser APIs
const ArchitectureMap = dynamic(() => import('./ArchitectureMap'), { ssr: false })

interface DashboardProps {
  data: ProjectData
  isDemo: boolean
  onStatusChange: (text: string, color: string) => void
  onReset: () => void
}

export default function Dashboard({
  data,
  isDemo,
  onStatusChange,
  onReset,
}: DashboardProps) {
  const { modules, stack, aiResult } = data

  // Floating dock & visibility state (always pinned to right)
  const [showOverlayCards, setShowOverlayCards] = useState<boolean>(true)
  const [manifestMinimized, setManifestMinimized] = useState<boolean>(false)
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<'manifest' | 'architecture' | 'modules'>('manifest')
  const [activeSimEvent, setActiveSimEvent] = useState<string>('')
  const [simDamagePercent, setSimDamagePercent] = useState<number>(0)

  const handleSimStepChange = useCallback(
    (stepIndex: number, currentEvent: SimulationEvent | null, damagePercent: number) => {
      if (currentEvent) {
        setActiveSimEvent(currentEvent.event)
      }
      setSimDamagePercent(damagePercent)
    },
    []
  )

  const displayModules: Module[] = useMemo(() => {
    if (Array.isArray(modules) && modules.length >= 3) {
      return modules
    }
    const baseName = modules?.[0]?.name || data.projectName || 'Application'
    const totalFiles = modules?.[0]?.files || 40
    const isRisky = typeof aiResult?.risk_score === 'number' && aiResult.risk_score > 40
    const isMedium = typeof aiResult?.risk_score === 'number' && aiResult.risk_score > 20

    return [
      { name: `${baseName} Core`, risk: modules?.[0]?.risk || 'ok', files: Math.max(8, Math.round(totalFiles * 0.35)) },
      { name: 'API Router & Handlers', risk: isRisky ? 'danger' : isMedium ? 'warn' : 'ok', files: Math.max(5, Math.round(totalFiles * 0.25)) },
      { name: 'Middleware Pipeline', risk: 'ok', files: Math.max(4, Math.round(totalFiles * 0.15)) },
      { name: 'Context & State Engine', risk: 'ok', files: Math.max(3, Math.round(totalFiles * 0.10)) },
      { name: 'Data Access Layer', risk: isMedium ? 'warn' : 'ok', files: Math.max(3, Math.round(totalFiles * 0.10)) },
      { name: 'Security & Auth Guard', risk: isRisky ? 'danger' : 'ok', files: Math.max(2, Math.round(totalFiles * 0.05)) },
    ]
  }, [modules, data.projectName, aiResult])

  const [hoveredModule, setHoveredModule] = useState<number | null>(null)
  const [selectedModule, setSelectedModule] = useState<number | null>(null)

  const damageColor = simDamagePercent > 70 ? '#ef4444' : simDamagePercent > 40 ? '#f59e0b' : '#10b981'

  return (
    <motion.div
      className="dashboard-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        padding: '8px 16px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          FULL-SCREEN 3D CODEBASE CITY FRAME (Takes 100% of dashboard)
          ───────────────────────────────────────────────────────────── */}
      <div
        className="dash-panel dash-panel-city"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: 0,
          minHeight: 0,
          overflow: 'hidden',
          borderRadius: '10px',
          border: '2px solid #000',
          boxShadow: '4px 4px 0 0 #000',
          display: 'flex',
          flexDirection: 'column',
          background: '#ede8db',
        }}
      >
        {/* The 3D Isometric Canvas */}
        <CodebaseCity
          data={data}
          activeSimulationEvent={activeSimEvent}
          damagePercent={simDamagePercent}
          overlayOffsetRight={showOverlayCards ? 445 : 0}
        />

        {/* ─────────────────────────────────────────────────────────────
            FLOATING CONTROLS: Show/Hide Toggle Button
            ───────────────────────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            top: '56px',
            right: '12px',
            zIndex: 35,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={() => setShowOverlayCards((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: "'Geist Mono', monospace",
              background: '#ffffff',
              color: '#18181b',
              border: '1.5px solid #18181b',
              borderRadius: '6px',
              boxShadow: '2px 2px 0 0 #18181b',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
            title={showOverlayCards ? 'Hide floating cards to see 3D City only' : 'Open floating simulation and telemetry cards'}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '2px',
                background: damageColor,
                boxShadow: `0 0 5px ${damageColor}`,
                flexShrink: 0,
              }}
            />
            {showOverlayCards ? (
              <span>Hide Overlay Cards</span>
            ) : (
              <>
                <Activity size={12} style={{ color: '#18181b' }} />
                <span>Show Telemetry &amp; Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            FLOATING CARDS OVERLAY (Placed above the 3D City canvas)
            ───────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showOverlayCards && (
            <motion.div
              initial={{ opacity: 0, x: 36, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 36, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: '94px',
                bottom: '16px',
                right: '12px',
                width: '430px',
                maxWidth: 'calc(100vw - 24px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 30,
                pointerEvents: 'none', // Empty spaces click-through to 3D canvas
              }}
            >
              {/* ── CARD 1: DEPLOYMENT FAILURE SIMULATION ── */}
              <div
                className="dash-panel"
                style={{
                  background: 'rgba(255, 255, 255, 0.97)',
                  backdropFilter: 'blur(16px)',
                  border: '2px solid #000',
                  borderRadius: '10px',
                  boxShadow: '4px 4px 0 0 #000',
                  padding: '12px 14px',
                  height: '310px',
                  flexShrink: 0,
                  pointerEvents: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <SimulationTimeline
                  events={aiResult.simulation}
                  isDemo={isDemo}
                  onStatusChange={onStatusChange}
                  onReset={onReset}
                  onStepChange={handleSimStepChange}
                />
              </div>

              {/* ── CARD 2: RELEASE FLIGHT MANIFEST & SYSTEM TELEMETRY ── */}
              <div
                className="dash-panel"
                style={{
                  background: 'rgba(255, 255, 255, 0.97)',
                  backdropFilter: 'blur(16px)',
                  border: '2px solid #000',
                  borderRadius: '10px',
                  boxShadow: '4px 4px 0 0 #000',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: manifestMinimized ? '0 0 auto' : 1,
                  minHeight: manifestMinimized ? 'auto' : '220px',
                  overflow: 'hidden',
                  pointerEvents: 'auto',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Header with Tabs & Minimize */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderBottom: '1.5px solid #000',
                    background: '#f6f1e5',
                    flexShrink: 0,
                  }}
                >
                  {/* Tab Selector Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
                    <button
                      onClick={() => {
                        setActiveTelemetryTab('manifest')
                        if (manifestMinimized) setManifestMinimized(false)
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 7px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        fontFamily: "'Geist Mono', monospace",
                        borderRadius: '4px',
                        border: '1.5px solid #000',
                        background: activeTelemetryTab === 'manifest' ? '#000000' : '#ffffff',
                        color: activeTelemetryTab === 'manifest' ? '#ffffff' : '#000000',
                        boxShadow: activeTelemetryTab === 'manifest' ? 'none' : '1px 1px 0 0 #000',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      title="Release Flight Manifest, Risk Score, Verification Gates, and Export"
                    >
                      <span>📋 Manifest</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTelemetryTab('architecture')
                        if (manifestMinimized) setManifestMinimized(false)
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 7px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        fontFamily: "'Geist Mono', monospace",
                        borderRadius: '4px',
                        border: '1.5px solid #000',
                        background: activeTelemetryTab === 'architecture' ? '#000000' : '#ffffff',
                        color: activeTelemetryTab === 'architecture' ? '#ffffff' : '#000000',
                        boxShadow: activeTelemetryTab === 'architecture' ? 'none' : '1px 1px 0 0 #000',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      title="Architecture & System Map Diagram"
                    >
                      <span>🗺️ System Map</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTelemetryTab('modules')
                        if (manifestMinimized) setManifestMinimized(false)
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 7px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        fontFamily: "'Geist Mono', monospace",
                        borderRadius: '4px',
                        border: '1.5px solid #000',
                        background: activeTelemetryTab === 'modules' ? '#000000' : '#ffffff',
                        color: activeTelemetryTab === 'modules' ? '#ffffff' : '#000000',
                        boxShadow: activeTelemetryTab === 'modules' ? 'none' : '1px 1px 0 0 #000',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      title="Dependencies & Modules List"
                    >
                      <span>📦 Modules ({displayModules.length})</span>
                    </button>
                  </div>

                  {/* Minimize / Expand Toggle */}
                  <button
                    onClick={() => setManifestMinimized((p) => !p)}
                    style={{
                      padding: '2px 5px',
                      border: '1.5px solid #000',
                      borderRadius: '4px',
                      background: '#ffffff',
                      color: '#000000',
                      cursor: 'pointer',
                      boxShadow: '1px 1px 0 0 #000',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                    title={manifestMinimized ? 'Expand panel' : 'Minimize panel'}
                  >
                    {manifestMinimized ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
                  </button>
                </div>

                {/* Tab Content (visible when not minimized) */}
                {!manifestMinimized && (
                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      overflowY: 'auto',
                    }}
                  >
                    {/* ── TAB 1: Release Flight Manifest ── */}
                    {activeTelemetryTab === 'manifest' && (
                      <div
                        style={{
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                          minHeight: 0,
                        }}
                      >
                        <ReleaseReadinessReport
                          aiResult={aiResult}
                          stack={stack}
                          projectName={data.projectName}
                          modules={displayModules}
                        />
                      </div>
                    )}

                    {/* ── TAB 2: Architecture & System Map ── */}
                    {activeTelemetryTab === 'architecture' && (
                      <div
                        style={{
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                          minHeight: 0,
                          height: '290px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '6px',
                            paddingBottom: '4px',
                            borderBottom: '1px solid #e5ded0',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: '#18181b',
                            }}
                          >
                            Live Architecture Map
                          </span>
                          <span
                            style={{
                              fontFamily: "'Geist Mono', monospace",
                              fontSize: '10px',
                              color: '#71717a',
                            }}
                          >
                            {displayModules.length} Connected Nodes
                          </span>
                        </div>
                        <div style={{ flex: 1, minHeight: '230px', overflow: 'hidden', border: '1.5px solid #000', borderRadius: '6px' }}>
                          <ArchitectureMap modules={displayModules} />
                        </div>
                      </div>
                    )}

                    {/* ── TAB 3: Dependencies & Modules List ── */}
                    {activeTelemetryTab === 'modules' && (
                      <div
                        style={{
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          flex: 1,
                          minHeight: 0,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Geist Mono', monospace",
                            fontSize: '11px',
                            fontWeight: 700,
                            marginBottom: '4px',
                            color: '#18181b',
                            textTransform: 'uppercase',
                          }}
                        >
                          Detected Modules ({displayModules.length})
                        </div>
                        {displayModules.map((mod, i) => (
                          <motion.div
                            key={i}
                            className="dash-module-item"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              background:
                                selectedModule === i
                                  ? 'hsl(var(--neo-button) / 0.15)'
                                  : hoveredModule === i
                                  ? 'hsl(var(--neo-panel-muted))'
                                  : 'hsl(var(--neo-input-bg))',
                              border: '1.5px solid #000',
                              borderRadius: '6px',
                              boxShadow: '1.5px 1.5px 0 0 #000',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.12s ease',
                            }}
                            onMouseEnter={() => setHoveredModule(i)}
                            onMouseLeave={() => setHoveredModule(null)}
                            onClick={() => setSelectedModule(selectedModule === i ? null : i)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '2px',
                                  background:
                                    mod.risk === 'danger'
                                      ? '#ef4444'
                                      : mod.risk === 'warn'
                                      ? '#f59e0b'
                                      : '#10b981',
                                  border: '1px solid rgba(0,0,0,0.25)',
                                  boxShadow: `0 0 6px ${
                                    mod.risk === 'danger'
                                      ? '#ef444466'
                                      : mod.risk === 'warn'
                                      ? '#f59e0b66'
                                      : '#10b98166'
                                  }`,
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  fontFamily: "'Geist Mono', monospace",
                                  fontSize: '12px',
                                  color: 'hsl(var(--foreground))',
                                  fontWeight: 600,
                                }}
                              >
                                {mod.name}
                              </span>
                            </div>

                            <span
                              style={{
                                fontFamily: "'Geist Mono', monospace",
                                fontSize: '11px',
                                color: 'hsl(var(--muted-foreground))',
                              }}
                            >
                              {mod.files} files
                            </span>

                            {/* Tooltip on hover */}
                            {hoveredModule === i && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                  position: 'absolute',
                                  right: '102%',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'hsl(var(--neo-panel))',
                                  border: '2px solid #000',
                                  borderRadius: '6px',
                                  padding: '8px 12px',
                                  zIndex: 50,
                                  whiteSpace: 'nowrap',
                                  pointerEvents: 'none',
                                  boxShadow: '3px 3px 0 0 #000',
                                }}
                              >
                                <div
                                  style={{
                                    fontFamily: "'Geist', sans-serif",
                                    fontSize: '12px',
                                    color: 'hsl(var(--foreground))',
                                    fontWeight: 700,
                                  }}
                                >
                                  Risk: {mod.risk.charAt(0).toUpperCase() + mod.risk.slice(1)}
                                </div>
                                <div
                                  style={{
                                    fontFamily: "'Geist Mono', monospace",
                                    fontSize: '11px',
                                    color: 'hsl(var(--muted-foreground))',
                                    marginTop: '2px',
                                  }}
                                >
                                  {mod.files} files detected
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
