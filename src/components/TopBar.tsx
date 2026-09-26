'use client'

import { getRiskBadgeClass } from '@/lib/utils'
import type { StatusType } from '@/types'

interface TopBarProps {
  status: StatusType
  statusColor: string
  projectName: string
  riskScore: number | null
  theme?: 'dark' | 'light'
  onToggleTheme?: () => void
  onOpenPrivateRepoHelp?: () => void
  onSelectDemo?: () => void
}

/** Map legacy statusColor hex → semantic class */
function resolveStatusClass(color: string): string {
  if (color.includes('22c5') || color.includes('4ade') || color === '#5ddb6a' || color.includes('16a3')) return 'ok'
  if (color.includes('f59e') || color.includes('f5c8') || color.includes('fbbf') || color.includes('d977')) return 'warn'
  if (color.includes('ef44') || color.includes('e840') || color.includes('dc26') || color.includes('b91c')) return 'danger'
  return 'idle'
}

export default function TopBar({
  status,
  statusColor,
  projectName,
  riskScore,
  theme = 'dark',
  onToggleTheme,
  onOpenPrivateRepoHelp,
  onSelectDemo,
}: TopBarProps) {
  const badge = riskScore !== null ? getRiskBadgeClass(riskScore) : null
  const dotClass = resolveStatusClass(statusColor)

  return (
    <header className="topbar">
      {/* Brand Wordmark (Exact GitDiagram style + IBM Bob 2.0) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={onSelectDemo}>
          <span style={{
            fontFamily: "'Geist', sans-serif",
            fontWeight: 800,
            fontSize: '20px',
            letterSpacing: '-0.03em',
            color: 'hsl(var(--foreground))',
          }}>
            Dry
          </span>
          <span style={{
            fontFamily: "'Geist', sans-serif",
            fontWeight: 800,
            fontSize: '20px',
            letterSpacing: '-0.03em',
            color: 'hsl(var(--neo-button))',
          }}>
            Run
          </span>
          <span className="new-badge" style={{ fontSize: '10px', height: '18px', padding: '0 6px' }}>
            BOB 2.0
          </span>
        </div>
      </div>

      {/* Active Project & Status Pill (shown when project is loaded) */}
      {projectName && projectName !== 'no project loaded' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
          <div style={{ width: '1px', height: '16px', background: 'hsl(var(--foreground) / 0.15)' }} />

          {/* Status dot pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 9px',
            background: 'hsl(var(--neo-panel-muted))',
            border: '1.5px solid #000',
            borderRadius: '99px',
            boxShadow: '1.5px 1.5px 0 0 #000',
          }}>
            <div className={`status-dot ${dotClass} pulse`} />
            <span style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '11px',
              fontWeight: 700,
              color: 'hsl(var(--foreground))',
              letterSpacing: '0.04em',
            }}>
              {status}
            </span>
          </div>

          {/* Risk Badge */}
          {badge && (
            <span className={`risk-badge ${badge.colorClass}`}>
              {badge.label}
            </span>
          )}

          {/* Project name pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '6px',
            background: 'hsl(var(--neo-input-bg))',
            border: '1.5px solid #000',
            boxShadow: '1.5px 1.5px 0 0 #000',
          }}>
            <span style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '12px',
              fontWeight: 600,
              color: 'hsl(var(--foreground))',
            }}>
              {projectName}
            </span>
          </div>
        </div>
      ) : null}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right Nav Links (Exact GitDiagram Header) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {onSelectDemo && (
          <button
            type="button"
            className="nav-link-btn font-semibold"
            onClick={onSelectDemo}
          >
            <span>Demos</span>
            <span className="new-badge">3</span>
          </button>
        )}

        {onOpenPrivateRepoHelp && (
          <button
            type="button"
            className="nav-link-btn font-medium"
            onClick={onOpenPrivateRepoHelp}
          >
            Private Repos
          </button>
        )}

        {/* Theme Toggle (Exact GitDiagram: "Light" / "Dark") */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        )}

        {/* GitHub link with star count */}
        <a
          href="https://github.com/toufiqfarhan0/dryrun"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link-btn"
          style={{ textDecoration: 'none' }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span className="hidden sm:inline font-semibold">GitHub</span>
        </a>
      </div>
    </header>
  )
}
