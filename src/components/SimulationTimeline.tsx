'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Play, Pause, RefreshCw } from 'lucide-react'
import { computeDamage } from '@/lib/simulation-helpers'
import type { SimulationEvent } from '@/types'

const eventColors = {
  normal: '#22c55e',
  warn:   '#f59e0b',
  danger: '#ef4444',
}

interface TimelineProps {
  events: SimulationEvent[]
  isDemo: boolean
  onStatusChange: (status: string, color: string) => void
  onReset: () => void
}

export default function Timeline({
  events,
  isDemo,
  onStatusChange,
  onReset,
}: TimelineProps) {
  const [visibleCount, setVisibleCount] = useState(1)
  const [isPlaying, setIsPlaying] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleEvents = events.slice(0, visibleCount)
  const damagePercent = visibleCount > 0 ? computeDamage(events, visibleCount - 1) : 0

  let damageLabel = 'SYSTEM INTEGRITY: NOMINAL'
  let damageLabelColor = '#22c55e'
  if (damagePercent > 70) {
    damageLabel = 'SYSTEM INTEGRITY: CRITICAL'
    damageLabelColor = '#ef4444'
  } else if (damagePercent > 40) {
    damageLabel = 'SYSTEM INTEGRITY: DEGRADED'
    damageLabelColor = '#f59e0b'
  }

  useEffect(() => {
    if (damagePercent > 70) {
      onStatusChange('CRITICAL FAILURE', '#ef4444')
    } else if (damagePercent > 40) {
      onStatusChange('DEGRADING', '#f59e0b')
    } else {
      onStatusChange('SYSTEM NOMINAL', '#22c55e')
    }
  }, [damagePercent, onStatusChange])

  // Scroll to bottom on step
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [visibleCount])

  // Step-by-step simulation timer
  useEffect(() => {
    if (!isPlaying) return
    if (visibleCount >= events.length) {
      setIsPlaying(false)
      return
    }

    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= events.length) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 1800)

    return () => clearInterval(timer)
  }, [isPlaying, visibleCount, events.length])

  const togglePlay = () => {
    if (!isPlaying && visibleCount >= events.length) {
      setVisibleCount(1)
      setIsPlaying(true)
    } else {
      setIsPlaying((p) => !p)
    }
  }

  const replay = () => {
    setVisibleCount(1)
    setIsPlaying(true)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      background: 'transparent',
    }}>
      {/* Header with Integrity Status */}
      <div style={{
        padding: '0 0 12px 0',
        borderBottom: '1.5px solid #000',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              Deployment Failure Simulation
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isPlaying && (
              <span style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '10px',
                fontWeight: 700,
                color: '#22c55e',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping inline-block" />
                SIMULATING RELEASE
              </span>
            )}
          </div>
        </div>

        {/* Damage bar */}
        <div className="damage-bar" style={{ marginBottom: '8px' }}>
          <div
            className="damage-fill"
            style={{
              width: `${damagePercent}%`,
              background: damagePercent > 70
                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                : damagePercent > 40
                ? 'linear-gradient(90deg, #22c55e, #f59e0b)'
                : '#22c55e',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '11px',
            fontWeight: 700,
            color: damageLabelColor,
            letterSpacing: '0.04em',
          }}>
            {damageLabel}
          </span>
          <span style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '11px',
            fontWeight: 700,
            color: 'hsl(var(--muted-foreground))',
          }}>
            {damagePercent}% BLAST RADIUS
          </span>
        </div>
      </div>

      {/* Events log list */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px 0',
        }}
      >
        <AnimatePresence>
          {visibleEvents.map((ev, i) => {
            const color = eventColors[ev.type]
            return (
              <motion.div
                key={i}
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '14px',
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Time stamp */}
                <div style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '11px',
                  color: 'hsl(var(--muted-foreground))',
                  flexShrink: 0,
                  minWidth: '52px',
                  paddingTop: '2px',
                  fontWeight: 600,
                }}>
                  {ev.time}
                </div>

                {/* Connector */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: color,
                    border: '1.5px solid #000',
                    flexShrink: 0,
                    marginTop: '2px',
                  }} />
                  {i < visibleEvents.length - 1 && (
                    <div style={{
                      width: '1.5px',
                      flex: 1,
                      minHeight: '18px',
                      background: 'hsl(var(--foreground) / 0.1)',
                      marginTop: '3px',
                    }} />
                  )}
                </div>

                {/* Event content */}
                <div style={{ flex: 1, paddingBottom: '2px' }}>
                  <p style={{
                    fontFamily: "'Geist', sans-serif",
                    fontSize: '13px',
                    fontWeight: 500,
                    color: ev.type === 'danger'
                      ? '#ef4444'
                      : ev.type === 'warn'
                      ? '#f59e0b'
                      : 'hsl(var(--foreground))',
                    lineHeight: '1.5',
                    margin: 0,
                  }}>
                    {ev.event.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2B50}\u{231A}-\u{23F3}\u{200D}\s]+/u, '')}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Playback controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 0 0 0',
        borderTop: '1.5px solid #000',
        flexShrink: 0,
      }}>
        <button
          onClick={replay}
          className="pb-btn"
          title="Replay failure simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Replay</span>
        </button>

        <button
          onClick={togglePlay}
          className="pb-btn"
          title={isPlaying ? 'Pause simulation' : 'Play simulation'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play</span>
            </>
          )}
        </button>

        <div className="pb-counter-pill">
          {visibleEvents.length} / {events.length}
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={onReset}
          className="pb-btn"
          title="Analyze another repository"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Release Check</span>
        </button>
      </div>
    </div>
  )
}
