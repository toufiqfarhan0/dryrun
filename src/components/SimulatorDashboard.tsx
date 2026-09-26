'use client'

import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import SimulationTimeline from './SimulationTimeline'
import ReleaseReadinessReport from './ReleaseReadinessReport'
import { riskColors } from '@/lib/simulation-helpers'
import type { ProjectData, Module } from '@/types'

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

  return (
    <motion.div
      className="dashboard-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Three Column Layout */}
      <div className="dashboard-grid">
        {/* ── LEFT: System Map & Modules ── */}
        <div className="dashboard-col">
          {/* System Map Panel */}
          <div className="dash-panel dash-panel-map">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1.5px solid #000',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'hsl(var(--neo-button))',
                boxShadow: '0 0 6px hsl(var(--neo-button))',
              }} />
              <span style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'hsl(var(--foreground))',
              }}>
                Architecture &amp; System Map
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ArchitectureMap modules={displayModules} />
            </div>
          </div>

          {/* Modules List Panel */}
          <div className="dash-panel dash-panel-modules">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: '1.5px solid #000',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'hsl(var(--neo-button))',
                boxShadow: '0 0 6px hsl(var(--neo-button))',
              }} />
              <span style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'hsl(var(--foreground))',
              }}>
                Dependencies &amp; Modules ({displayModules.length})
              </span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
            }}>
              {displayModules.map((mod, i) => (
                <motion.div
                  key={i}
                  className="dash-module-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: selectedModule === i
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
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: riskColors[mod.risk],
                        boxShadow: `0 0 6px ${riskColors[mod.risk]}`,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: '12px',
                      color: 'hsl(var(--foreground))',
                      fontWeight: 600,
                    }}>
                      {mod.name}
                    </span>
                  </div>

                  <span style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    color: 'hsl(var(--muted-foreground))',
                  }}>
                    {mod.files} files
                  </span>

                  {/* Tooltip on hover */}
                  {hoveredModule === i && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        position: 'absolute',
                        left: '102%',
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
                      <div style={{
                        fontFamily: "'Geist', sans-serif",
                        fontSize: '12px',
                        color: 'hsl(var(--foreground))',
                        fontWeight: 700,
                      }}>
                        Risk: {mod.risk.charAt(0).toUpperCase() + mod.risk.slice(1)}
                      </div>
                      <div style={{
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: '11px',
                        color: 'hsl(var(--muted-foreground))',
                        marginTop: '2px',
                      }}>
                        {mod.files} files detected
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CENTER: Timeline - Full Height ── */}
        <div className="dash-panel dash-panel-timeline">
          <SimulationTimeline
            events={aiResult.simulation}
            isDemo={isDemo}
            onStatusChange={onStatusChange}
            onReset={onReset}
          />
        </div>

        {/* ── RIGHT: Risk Report - Full Height Scrollable ── */}
        <div className="dash-panel dash-panel-report">
          <ReleaseReadinessReport
            aiResult={aiResult}
            stack={stack}
            projectName={data.projectName}
            modules={displayModules}
          />
        </div>
      </div>
    </motion.div>
  )
}
