'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Lock } from 'lucide-react'
import { DEMO_SCENARIOS } from '@/lib/demo-data'

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

/* Exact Violet Sparkle from GitDiagram hero.tsx (User Image 1) */
const VioletSparkle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 91 98"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="m35.878 14.162 1.333-5.369 1.933 5.183c4.47 11.982 14.036 21.085 25.828 24.467l5.42 1.555-5.209 2.16c-11.332 4.697-19.806 14.826-22.888 27.237l-1.333 5.369-1.933-5.183C34.56 57.599 24.993 48.496 13.201 45.114l-5.42-1.555 5.21-2.16c11.331-4.697 19.805-14.826 22.887-27.237Z"
      className="fill-violet-500 stroke-black dark:fill-[hsl(var(--neo-button))] dark:stroke-black"
      strokeWidth="3.445"
    />
    <path
      d="M79.653 5.729c-2.436 5.323-9.515 15.25-18.341 12.374m9.197 16.336c2.6-5.851 10.008-16.834 18.842-13.956m-9.738-15.07c-.374 3.787 1.076 12.078 9.869 14.943M70.61 34.6c.503-4.21-.69-13.346-9.49-16.214M14.922 65.967c1.338 5.677 6.372 16.756 15.808 15.659M18.21 95.832c-1.392-6.226-6.54-18.404-15.984-17.305m12.85-12.892c-.41 3.771-3.576 11.588-12.968 12.681M18.025 96c.367-4.21 3.453-12.905 12.854-14"
      className="stroke-black dark:stroke-[hsl(var(--foreground))]"
      strokeWidth="2.548"
      strokeLinecap="round"
    />
  </svg>
)

/* Exact Sky Sparkle from GitDiagram hero.tsx (User Image 2) */
const SkySparkle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 92 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="m35.213 16.953.595-5.261 2.644 4.587a35.056 35.056 0 0 0 26.432 17.33l5.261.594-4.587 2.644A35.056 35.056 0 0 0 48.23 63.28l-.595 5.26-2.644-4.587a35.056 35.056 0 0 0-26.432-17.328l-5.261-.595 4.587-2.644a35.056 35.056 0 0 0 17.329-26.433Z"
      className="fill-sky-400 stroke-black dark:fill-[hsl(var(--neo-button-hover))] dark:stroke-black"
      strokeWidth="2.868"
    />
    <path
      d="M75.062 40.108c1.07 5.255 1.072 16.52-7.472 19.54m7.422-19.682c1.836 2.965 7.643 8.14 16.187 5.121-8.544 3.02-8.207 15.23-6.971 20.957-1.97-3.343-8.044-9.274-16.588-6.254M12.054 28.012c1.34-5.22 6.126-15.4 14.554-14.369M12.035 28.162c-.274-3.487-2.93-10.719-11.358-11.75C9.104 17.443 14.013 6.262 15.414.542c.226 3.888 2.784 11.92 11.212 12.95"
      className="stroke-black dark:stroke-[hsl(var(--foreground))]"
      strokeWidth="2.319"
      strokeLinecap="round"
    />
  </svg>
)

/* Exact Flank Sparkle from GitDiagram hero.tsx for mobile */
const FlankSparkle = ({
  className,
  fillClassName,
}: {
  className?: string
  fillClassName: string
}) => (
  <svg
    className={className}
    viewBox="10.8 10.2 61.4 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="m35.213 16.953.595-5.261 2.644 4.587a35.056 35.056 0 0 0 26.432 17.33l5.261.594-4.587 2.644A35.056 35.056 0 0 0 48.23 63.28l-.595 5.26-2.644-4.587a35.056 35.056 0 0 0-26.432-17.328l-5.261-.595 4.587-2.644a35.056 35.056 0 0 0 17.329-26.433Z"
      className={`${fillClassName} stroke-black dark:stroke-black`}
      strokeWidth="2.868"
    />
  </svg>
)

export default function UploadScreen({
  onFileSelected,
  onDemo,
  onRepoUrl,
  privateRepoNotice,
  onClosePrivateRepoNotice,
}: UploadScreenProps) {
  const [repoUrlInput, setRepoUrlInput] = useState('')
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
    if (trimmed && onRepoUrl) {
      onRepoUrl(trimmed)
    }
  }

  return (
    <motion.div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '36px 16px 64px',
        gap: '24px',
        position: 'relative',
        maxWidth: '820px',
        margin: '0 auto',
        width: '100%',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Exact GitDiagram Announcement Pill with breathing glow */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div
          className="promo-banner"
          onClick={() => onDemo()}
          role="button"
          tabIndex={0}
        >
          <div className="promo-banner-glow" />
          <span className="new-badge">⚡ IBM BOB 2.0</span>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>
            Pre-Flight Release Simulation Engine
          </span>
          <span className="promo-banner-arrow font-bold text-sm">→</span>
        </div>
      </motion.div>

      {/* Hero Header with Exact Sparkles (User Images 1 & 2) */}
      <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
        {/* Mobile Fluid Title with FlankSparkles */}
        <div className="mx-auto w-fit sm:hidden mb-4">
          <h1 className="text-center text-[clamp(2.3rem,10.5vw,3.1rem)] leading-[0.98] font-bold tracking-tight">
            Watch it break here. <br />
            <span className="relative inline-block text-[hsl(var(--neo-button))]">
              Not in production.
              <FlankSparkle
                className="flank-sparkle-left pointer-events-none absolute top-[57%] -left-[1.18em] h-auto w-[0.8em] -translate-y-1/2 -rotate-10"
                fillClassName="fill-violet-500 dark:fill-[hsl(var(--neo-button))]"
              />
              <FlankSparkle
                className="flank-sparkle-right pointer-events-none absolute top-[57%] -right-[1.18em] h-auto w-[0.8em] -translate-y-1/2 rotate-10"
                fillClassName="fill-sky-400 dark:fill-[hsl(var(--neo-button-hover))]"
              />
            </span>
          </h1>
        </div>

        {/* Desktop Title with Exact VioletSparkle (User Image 1) & SkySparkle (User Image 2) */}
        <div className="relative mx-auto hidden w-full flex-row items-center justify-center sm:flex">
          <VioletSparkle className="absolute left-0 h-auto w-20 flex-shrink-0 -translate-y-16 p-2 md:relative md:ml-0 md:w-24 md:translate-x-10 md:-translate-y-0 lg:absolute lg:ml-32 lg:-translate-x-full lg:-translate-y-10" />
          <h1 className="relative inline-block w-full text-center text-5xl font-bold tracking-tighter md:text-6xl lg:pt-5 lg:text-7xl">
            Watch it break here. <br />
            <span className="text-[hsl(var(--neo-button))]">Not in production.</span>
          </h1>
          <SkySparkle className="right-0 bottom-0 hidden h-auto w-16 flex-shrink-0 -translate-x-10 translate-y-20 md:block lg:absolute lg:w-20 lg:-translate-x-12 lg:translate-y-4" />
        </div>

        {/* Subtitle */}
        <p style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: '16px',
          color: 'hsl(var(--muted-foreground))',
          lineHeight: 1.5,
          maxWidth: '580px',
          margin: '12px auto 6px',
        }}>
          DryRun simulates architectural failure modes, isolates blast radius, and audits deployment risk before your code ever touches users. Powered by IBM Bob 2.0 &amp; watsonx.ai.
        </p>
        <p style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: '13.5px',
          color: 'hsl(var(--muted-foreground) / 0.8)',
        }}>
          Built with purpose for the IBM Bob 2.0 Hackathon · Enter any repo or drop an archive below
        </p>
      </div>

      {/* Main Neo-Panel Card (Exact GitDiagram Card with User Image 3 Corner Sparkle) */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '720px' }}>
        {/* Exact Bottom-Left Corner Sparkle from GitDiagram (User Image 3) */}
        <div className="absolute -bottom-8 -left-12 hidden sm:block pointer-events-none select-none z-10">
          <Sparkles
            className="h-20 w-20 fill-sky-400 text-black dark:fill-[hsl(var(--neo-button))] dark:text-[hsl(var(--background))]"
            strokeWidth={0.6}
            style={{ transform: "rotate(-15deg)" }}
          />
        </div>

        <div className="neo-panel p-5 sm:p-7 relative" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Subtle + corner watermarks (User Image 3) */}
          <span className="absolute bottom-2.5 left-3 text-xs font-mono select-none opacity-40 leading-none pointer-events-none">
            +
          </span>
          <span className="absolute top-2.5 right-3 text-xs font-mono select-none opacity-40 leading-none pointer-events-none">
            +
          </span>

          {/* GitHub Input + Diagram Button (Exact GitDiagram form) */}
          <form onSubmit={handleSubmitRepo} style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
            <input
              type="text"
              value={repoUrlInput}
              onChange={(e) => setRepoUrlInput(e.target.value)}
              placeholder="owner/repo or GitHub URL (e.g. expressjs/express)"
              className="neo-input"
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '15px',
                fontWeight: 600,
              }}
            />
            <button
              type="submit"
              disabled={!repoUrlInput.trim()}
              className="neo-button"
              style={{
                padding: '12px 24px',
                fontSize: '15px',
              }}
            >
              Simulate Release
            </button>
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
                { label: 'FastAPI', url: 'https://github.com/tiangolo/fastapi' },
                { label: 'expressjs/express', url: 'https://github.com/expressjs/express' },
                { label: 'Flask', url: 'https://github.com/pallets/flask' },
                { label: 'Monkeytype', url: 'https://github.com/monkeytypegame/monkeytype' },
                { label: 'toufiqfarhan0/3d-game', url: 'https://github.com/toufiqfarhan0/3d-game' },
              ].map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  className="neo-chip"
                  onClick={() => {
                    setRepoUrlInput(sample.url)
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
              color: '#000',
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
              className="neo-button"
              onClick={() => inputRef.current?.click()}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'hsl(var(--neo-subtle))',
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
