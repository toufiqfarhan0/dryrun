'use client'

import Link from 'next/link'
import type { StatusType } from '@/types'

interface TopBarProps {
  currentPage?: 'landing' | 'simulator'
  status?: StatusType
  statusColor?: string
  projectName?: string
  riskScore?: number | null
  theme?: 'light'
  onOpenPrivateRepoHelp?: () => void
  onSelectDemo?: () => void
  onNavigateDemo?: () => void
}

export default function TopBar({
  currentPage = 'simulator',
  status = 'IDLE',
  statusColor = '#10b981',
  projectName = 'no project loaded',
  riskScore = null,
  theme = 'light',
  onOpenPrivateRepoHelp,
  onSelectDemo,
  onNavigateDemo,
}: TopBarProps) {
  return (
    <header
      style={{
        position: 'relative',
        zIndex: 100,
        padding: '0 20px',
        maxWidth: '1080px',
        margin: currentPage === 'simulator' ? '8px auto 8px' : '14px auto 16px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid #e2e0d8',
          borderRadius: '9999px',
          padding: '8px 18px',
          boxShadow: '0 4px 20px -4px rgba(20, 20, 20, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Left: Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono), 'Geist Mono', monospace",
                fontWeight: 800,
                fontSize: '14px',
                letterSpacing: '-0.02em',
                color: '#141413',
              }}
            >
              dryrun
            </span>
          </Link>
        </div>

        {/* Right: Home · Demo · Why Pre-Flight · How it works · GitHub · Sun/Moon Toggle */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(12px, 2vw, 20px)',
          }}
        >
          <Link href="/" className="topbar-nav-link">
            Home
          </Link>
          {onNavigateDemo ? (
            <button
              type="button"
              onClick={onNavigateDemo}
              className="topbar-nav-link"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              Demo
            </button>
          ) : (
            <Link href="/simulator" className="topbar-nav-link">
              Demo
            </Link>
          )}
          <a
            href={currentPage === 'landing' ? '#why-preflight' : '/#why-preflight'}
            onClick={(e) => {
              if (currentPage === 'landing') {
                e.preventDefault()
                const el = document.getElementById('why-preflight')
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' })
                }
              }
            }}
            className="topbar-nav-link"
          >
            Why Pre-Flight
          </a>
          <a
            href={currentPage === 'landing' ? '#how-it-works' : '/#how-it-works'}
            className="topbar-nav-link"
          >
            How it works
          </a>
          <a
            href="https://github.com/toufiqfarhan0/dryrun"
            target="_blank"
            rel="noopener noreferrer"
            className="topbar-nav-link"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}
