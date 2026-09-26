'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Lock } from 'lucide-react'
import { DEMO_SCENARIOS } from '@/lib/simulation-scenarios'

interface UploadScreenProps {
  onFileSelected: (file: File) => void
  onDemo: (scenarioId?: string) => void
  onRepoUrl?: (url: string) => void
  privateRepoNotice?: {
    isOpen: boolean
    repoUrl?: string
    error?: string
  } | null
  onClosePrivateRepoNotice?: () => void
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  velocityX: number
  velocityY: number
}

/* Minimal clean components — sparkles suppressed for sleek professional UI */
const VioletSparkle = (_props: { className?: string }) => null
const SkySparkle = (_props: { className?: string }) => null
const FlankSparkle = (_props: { className?: string; fillClassName?: string }) => null

export default function UploadScreen({
  onFileSelected,
  onDemo,
  onRepoUrl,
  privateRepoNotice,
  onClosePrivateRepoNotice,
}: UploadScreenProps) {
  const [repoUrlInput, setRepoUrlInput] = useState('')
  const [repoError, setRepoError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [dropError, setDropError] = useState<string | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const closeModal = () => {
    setManualModalOpen(false)
    if (onClosePrivateRepoNotice) onClosePrivateRepoNotice()
  }

  const handleUploadZipInstead = () => {
    closeModal()
    const dropzone = document.getElementById('sandbox-dropzone')
    if (dropzone) {
      dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    setTimeout(() => {
      inputRef.current?.click()
    }, 250)
  }

  const createParticles = (x: number, y: number) => {
    const colors = ['#c084fc', '#a855f7', '#8b5cf6', '#38bdf8', '#22c55e']
    const newParticles: Particle[] = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 7 + 4,
      velocityX: (Math.random() - 0.5) * 160,
      velocityY: (Math.random() - 0.5) * 160,
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 700)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    createParticles(x, y)

    const file = e.dataTransfer.files[0]
    if (file && file.name.toLowerCase().endsWith('.zip')) {
      setDropError(null)
      setTimeout(() => onFileSelected(file), 300)
    } else {
      setDropError('Please drop a .zip archive to analyze.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setDropError('Please select a .zip archive.')
      return
    }
    setDropError(null)
    onFileSelected(file)
  }

  const handleSubmitRepo = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = repoUrlInput.trim()
    if (!trimmed) {
      setRepoError('Please paste a GitHub URL to simulate release')
      return
    }
    setRepoError(null)
    if (onRepoUrl) {
      onRepoUrl(trimmed)
    }
  }

  return (
    <motion.div
      style={{
        flex: '1 0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 28px 48px',
        position: 'relative',
        maxWidth: '780px',
        margin: 'auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Main Neo-Panel Card */}
      <div style={{ position: 'relative', width: '100%' }}>

        <div
          className="neo-panel relative"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            padding: '36px 36px 32px',
            borderRadius: '16px',
          }}
        >
          {/* Subtle + corner watermarks (User Image 3) */}
          <span className="absolute bottom-3 left-4 text-xs font-mono select-none opacity-40 leading-none pointer-events-none">
            +
          </span>
          <span className="absolute top-3 right-4 text-xs font-mono select-none opacity-40 leading-none pointer-events-none">
            +
          </span>

          {/* GitHub Input + Diagram Button (Exact GitDiagram form) */}
          <form onSubmit={handleSubmitRepo} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
              <input
                type="text"
                value={repoUrlInput}
                onChange={(e) => {
                  setRepoUrlInput(e.target.value)
                  if (repoError) setRepoError(null)
                }}
                placeholder="owner/repo or GitHub URL (e.g. expressjs/express)"
                className="neo-input"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '15px',
                  fontWeight: 600,
                  borderColor: repoError ? '#dc2626' : undefined,
                  boxShadow: repoError ? '0 0 0 1.5px #dc2626' : undefined,
                  transition: 'border-color 140ms ease, box-shadow 140ms ease',
                }}
              />
              <button
                type="submit"
                className="neo-button"
                style={{
                  padding: '12px 24px',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
              >
                Simulate Release
              </button>
            </div>

            {repoError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#dc2626',
                  background: 'rgba(220, 38, 38, 0.08)',
                  border: '1px solid rgba(220, 38, 38, 0.25)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{repoError}</span>
              </div>
            )}
          </form>

          {/* "Try these example repositories:" Chips Row (Exact GitDiagram) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'hsl(var(--foreground) / 0.8)',
            }}>
              Try example release candidates:
            </span>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { label: 'Hono', url: 'https://github.com/honojs/hono' },
                { label: 'expressjs/express', url: 'https://github.com/expressjs/express' },
                { label: 'Flask', url: 'https://github.com/pallets/flask' },
                { label: 'Koa', url: 'https://github.com/koajs/koa' },
                { label: 'toufiqfarhan0/3d-game', url: 'https://github.com/toufiqfarhan0/3d-game' },
              ].map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  className="neo-chip"
                  onClick={() => {
                    setRepoUrlInput(sample.url)
                    if (repoError) setRepoError(null)
                    if (onRepoUrl) onRepoUrl(sample.url)
                  }}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '2px 0' }}>
            <div style={{ flex: 1, height: '1.5px', background: 'hsl(var(--foreground) / 0.12)' }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'hsl(var(--muted-foreground))',
            }}>
              or upload release candidate .zip archive
            </span>
            <div style={{ flex: 1, height: '1.5px', background: 'hsl(var(--foreground) / 0.12)' }} />
          </div>

          {/* Integrated .ZIP Dropzone */}
          <div
            id="sandbox-dropzone"
            role="button"
            tabIndex={0}
            aria-label="Upload a .zip archive: press Enter to browse for a file, or drop one here"
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '100px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              background: 'hsl(var(--neo-input-bg))',
              border: '2px dashed #000',
              borderRadius: '8px',
              boxShadow: '3px 3px 0 0 #000',
              overflow: 'hidden',
              transition: 'all 0.15s ease',
            }}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            {(isDragOver || isFocused) && <div className="scan-line" />}

            {/* Particle Effects */}
            <AnimatePresence>
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  style={{
                    position: 'absolute',
                    left: particle.x,
                    top: particle.y,
                    width: particle.size,
                    height: particle.size,
                    background: particle.color,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                  }}
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{
                    opacity: 0,
                    scale: 1.2,
                    x: particle.velocityX,
                    y: particle.velocityY,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              ))}
            </AnimatePresence>

            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'hsl(var(--neo-button))',
              border: '2px solid #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--neo-button-text))',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <div>
              <div style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'hsl(var(--foreground))',
              }}>
                {isDragOver ? 'Drop your release candidate archive here' : 'Drop a .zip codebase archive here'}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'hsl(var(--muted-foreground))',
              }}>
                Drop any repository .zip · Instant blast radius analysis up to 50 MB
              </div>
            </div>

            {dropError && (
              <div style={{
                fontSize: '12px',
                color: '#dc2626',
                background: 'rgba(220,38,38,0.1)',
                padding: '4px 8px',
                borderRadius: '6px',
              }}>
                {dropError}
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              style={{ display: 'none' }}
              onChange={handleChange}
            />
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="neo-button neo-button-secondary"
              onClick={() => inputRef.current?.click()}
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '13px',
              }}
            >
              Upload .ZIP
            </button>
            <button
              type="button"
              className="neo-button"
              onClick={() => onDemo()}
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '13px',
              }}
            >
              Run Release Demo
            </button>
          </div>

          {/* Selectable Demo Scenarios (FinTech, E-Commerce, Risk 0) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'hsl(var(--muted-foreground))',
            }}>
              Or run a live failure scenario:
            </span>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px',
              width: '100%',
            }}>
              {DEMO_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => onDemo(scenario.id)}
                  className="scenario-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: 'hsl(var(--foreground))',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {scenario.tag}
                    </span>
                    <span className={`risk-badge ${scenario.badgeClass}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                      Risk {scenario.data.aiResult.risk_score}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'hsl(var(--foreground))',
                  }}>
                    {scenario.name}
                  </div>
                  <div style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    color: 'hsl(var(--muted-foreground))',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {scenario.data.projectName}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Scope Banner */}
          <div className="supported-tech-banner">
            <div className="supported-tech-sub">
              <strong>Audits:</strong> Architecture Breakage <span className="supported-tech-dot">·</span> Cascading Faults <span className="supported-tech-dot">·</span> Dependency Drifts <span className="supported-tech-dot">·</span> Security CVEs
            </div>
          </div>

        </div>
      </div>

      {/* Public Repositories Only / Private Repo Guidance Modal */}
      <AnimatePresence>
        {(manualModalOpen || (privateRepoNotice && privateRepoNotice.isOpen)) && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 16px',
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={closeModal}
          >
            <motion.div
              className="neo-panel p-6 sm:p-8 relative"
              style={{
                width: '100%',
                maxWidth: '580px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '6px 6px 0 0 #000',
              }}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: 'hsl(var(--neo-button))',
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0 0 #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Lock className="w-5 h-5 text-black" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'hsl(var(--foreground))',
                      letterSpacing: '-0.02em',
                      margin: 0,
                    }}>
                      Public Repositories Only
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      color: 'hsl(var(--muted-foreground))',
                      margin: '3px 0 0 0',
                    }}>
                      Private or restricted repositories cannot be streamed directly
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close dialog"
                  className="nav-link-btn"
                  style={{
                    width: '34px',
                    height: '34px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Alert Message */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1.5px solid #000',
                borderRadius: '8px',
                boxShadow: '2px 2px 0 0 #000',
                padding: '12px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12.5px',
                color: '#ef4444',
                lineHeight: 1.55,
              }}>
                {privateRepoNotice?.error ||
                  'GitHub security restricts direct unauthenticated URL downloads for private or unauthorized repositories.'}
              </div>

              {/* 3 Step Guidance */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'hsl(var(--neo-button))',
                  display: 'inline-block',
                }}>
                  How to analyze your private repository (3 easy steps):
                </span>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  background: 'hsl(var(--neo-panel-muted))',
                  border: '2px solid #000',
                  borderRadius: '10px',
                  boxShadow: '3px 3px 0 0 #000',
                  padding: '18px 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      background: 'hsl(var(--neo-button))',
                      color: '#000',
                      border: '1.5px solid #000',
                      boxShadow: '1.5px 1.5px 0 0 #000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: '1px',
                    }}>
                      1
                    </span>
                    <span style={{ fontSize: '13.5px', color: 'hsl(var(--foreground))', lineHeight: 1.55 }}>
                      Open your repository on <strong>GitHub.com</strong> in your browser.
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      background: 'hsl(var(--neo-button))',
                      color: '#000',
                      border: '1.5px solid #000',
                      boxShadow: '1.5px 1.5px 0 0 #000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: '1px',
                    }}>
                      2
                    </span>
                    <span style={{ fontSize: '13.5px', color: 'hsl(var(--foreground))', lineHeight: 1.55 }}>
                      Click the green <strong>&lt;&gt; Code</strong> button and select <strong>Download ZIP</strong>.
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      background: 'hsl(var(--neo-button))',
                      color: '#000',
                      border: '1.5px solid #000',
                      boxShadow: '1.5px 1.5px 0 0 #000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: '1px',
                    }}>
                      3
                    </span>
                    <span style={{ fontSize: '13.5px', color: 'hsl(var(--foreground))', lineHeight: 1.55 }}>
                      Click the button below to upload your downloaded <strong>.zip</strong> archive into DryRun for complete local readiness evaluation!
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px',
                marginTop: '6px',
                paddingTop: '4px',
              }}>
                <button
                  type="button"
                  onClick={closeModal}
                  className="nav-link-btn"
                  style={{
                    padding: '9px 18px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={handleUploadZipInstead}
                  className="neo-button"
                  style={{
                    padding: '9px 20px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload .ZIP Instead
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
