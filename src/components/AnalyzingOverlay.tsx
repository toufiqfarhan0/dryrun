'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface AnalyzingOverlayProps {
  visible: boolean
}

export default function AnalyzingOverlay({ visible }: AnalyzingOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6"
          style={{ background: 'rgba(10, 8, 18, 0.82)', backdropFilter: 'blur(12px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Spinner */}
          <div style={{ position: 'relative', width: '48px', height: '48px' }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2.5px solid hsl(var(--neo-button) / 0.25)',
            }} />
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
              transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '14px',
              fontWeight: 700,
              color: 'hsl(var(--foreground))',
              letterSpacing: '0.04em',
              marginBottom: '4px',
            }}>
              Simulating Failure Modes &amp; Blast Radius...
            </p>
            <p style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: '12px',
              color: 'hsl(var(--muted-foreground))',
            }}>
              Evaluating architecture breakage &amp; deployment gates with IBM Bob 2.0 &amp; watsonx.ai
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
