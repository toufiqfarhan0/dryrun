'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

export interface LogEntry {
  ts: string
  text: string
  type: 'ok' | 'warn' | 'err' | 'info'
}

interface ProcessingScreenProps {
  stage: string
  logs: LogEntry[]
  stackTags: string[]
}

const LOG_COLORS: Record<LogEntry['type'], string> = {
  ok:   '#22c55e',
  warn: '#f59e0b',
  err:  '#ef4444',
  info: 'hsl(var(--muted-foreground))',
}

export default function ProcessingScreen({
  stage,
  logs,
  stackTags,
}: ProcessingScreenProps) {
  const logContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({
        top: logContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [logs])

  return (
    <motion.div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Ambient glow behind spinner */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        width: '100%',
        maxWidth: '640px',
      }}>
        {/* Animated spinner with GitDiagram violet palette */}
        <div style={{ position: 'relative', width: '64px', height: '64px' }}>
          {/* Outer ring */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2.5px solid hsl(var(--neo-button) / 0.25)',
          }} />
          {/* Spinning arc */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2.5px solid transparent',
              borderTopColor: 'hsl(var(--neo-button))',
              borderRightColor: 'hsl(var(--neo-button-hover))',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          {/* Inner pulse */}
          <motion.div
            style={{
              position: 'absolute',
              inset: '12px',
              borderRadius: '50%',
              background: 'hsl(var(--neo-button) / 0.15)',
              border: '1.5px solid hsl(var(--neo-button) / 0.3)',
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Center dot */}
          <div style={{
            position: 'absolute',
            inset: '22px',
            borderRadius: '50%',
            background: 'hsl(var(--neo-button))',
            boxShadow: '0 0 12px hsl(var(--neo-button))',
          }} />
        </div>

        {/* Stage label in neo-panel badge */}
        <div style={{
          padding: '8px 20px',
          background: 'hsl(var(--neo-panel))',
          border: '2px solid #000',
          borderRadius: '99px',
          boxShadow: '2px 2px 0 0 #000',
        }}>
          <p style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '13px',
            fontWeight: 700,
            textAlign: 'center',
            color: 'hsl(var(--foreground))',
            letterSpacing: '0.03em',
            margin: 0,
          }}>
            {stage}
          </p>
        </div>

        {/* Log feed in Neo Panel */}
        <div
          ref={logContainerRef}
          className="neo-panel"
          style={{
            width: '100%',
            height: '210px',
            padding: '16px 20px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {logs.map((entry, i) => (
            <div key={i} style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              marginBottom: '6px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}>
              <span style={{
                color: 'hsl(var(--muted-foreground))',
                flexShrink: 0,
                fontWeight: 600,
              }}>
                [{entry.ts}]
              </span>
              <span style={{
                color: LOG_COLORS[entry.type],
                lineHeight: '1.5',
                fontWeight: 500,
              }}>
                {entry.text}
              </span>
            </div>
          ))}

          {/* Blinking cursor */}
          {logs.length >= 0 && (
            <div style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              color: 'hsl(var(--neo-button))',
              display: 'inline-block',
            }} className="animate-blink">
              ▍
            </div>
          )}
        </div>

        {/* Stack tags */}
        {stackTags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
          }}>
            {stackTags.map((tag, i) => (
              <span
                key={i}
                className="neo-chip"
                style={{ fontSize: '12px', height: '30px', padding: '0 10px' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
