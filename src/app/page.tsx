'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import SimulatorLoadingSkeleton from '@/components/SimulatorLoadingSkeleton'

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<'map' | 'timeline' | 'dossier'>('map')
  const [navigatingToDemo, setNavigatingToDemo] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved =
      (localStorage.getItem('dryrun-theme') as 'dark' | 'light') ||
      (localStorage.getItem('breakwater-theme') as 'dark' | 'light') ||
      'light'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('dryrun-theme', next)
    document.documentElement.setAttribute('data-theme', next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const navigateToDemo = (url: string = '/simulator') => {
    setNavigatingToDemo(true)
    router.push(url)
  }

  if (!mounted || navigatingToDemo) {
    return <SimulatorLoadingSkeleton theme={theme} />
  }

  const isDark = theme === 'dark'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? '#0e0e0d' : '#f6f5f2',
        color: isDark ? '#f4f4f5' : '#141413',
        fontFamily: "var(--font-sans), 'Geist', sans-serif",
        backgroundImage: isDark
          ? 'radial-gradient(rgba(255, 255, 255, 0.07) 1.2px, transparent 1.2px)'
          : 'radial-gradient(#dedad1 1.2px, transparent 1.2px)',
        backgroundSize: '20px 20px',
        transition: 'background-color 200ms ease, color 200ms ease',
      }}
    >
      {/* ── Unified Floating Pill Navigation ── */}
      <Navbar
        currentPage="landing"
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigateDemo={() => navigateToDemo('/simulator')}
      />

      {/* ── Hero Section ── */}
      <section
        style={{
          padding: '56px 24px 44px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Hero Copy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 14px',
                borderRadius: '9999px',
                background: isDark ? '#141413' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e5e3dc',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                width: 'fit-content',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  background: '#10b981',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontWeight: 600 }}>IBM Bob 2.0 Hackathon</span>
              <span style={{ opacity: 0.3 }}>•</span>
              <span style={{ color: isDark ? '#a1a1aa' : '#66645e' }}>Release Gate Engine</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(36px, 5vw, 56px)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1.06,
                color: isDark ? '#ffffff' : '#141413',
              }}
            >
              Watch your code break here.{' '}
              <br />
              <span style={{ color: isDark ? '#a1a1aa' : '#66645e' }}>
                Not in production.
              </span>
            </h1>

            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: isDark ? '#a1a1aa' : '#66645e',
                maxWidth: '540px',
              }}
            >
              DryRun simulates architectural failure modes, isolates blast radius, and audits deployment risk before your code ever touches users. Powered by <strong>IBM Bob 2.0 &amp; watsonx.ai</strong>.
            </p>

            <p
              style={{
                fontSize: '13.5px',
                lineHeight: 1.5,
                color: isDark ? '#a1a1aa' : '#78756d',
                maxWidth: '540px',
                margin: '-4px 0 4px 0',
              }}
            >
              Built with purpose for the IBM Bob 2.0 Hackathon · Enter any repo or drop an archive below
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={() => navigateToDemo('/simulator')}
                style={{
                  background: isDark ? '#ffffff' : '#141413',
                  color: isDark ? '#141413' : '#ffffff',
                  fontWeight: 600,
                  fontSize: '13px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 140ms ease',
                }}
              >
                <span>See a live demo</span>
                <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.6 }}>→</span>
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '18px',
                paddingTop: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11.5px',
                color: isDark ? '#a1a1aa' : '#66645e',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
                <span>In-Memory Ingestion (adm-zip)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
                <span>watsonx Granite 3.3 + Offline Fallback</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
                <span>Interactive System Map & Failure Timeline</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Live Telemetry Preview Card (Grounded in Real Codebase Data) */}
          <div id="telemetry">
            <div
              style={{
                background: isDark ? '#141413' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e5e3dc',
                borderRadius: '16px',
                padding: '22px',
                boxShadow: isDark
                  ? '0 12px 36px -4px rgba(0, 0, 0, 0.6)'
                  : '0 8px 30px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1efea',
                  paddingBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '9999px',
                      background: '#ef4444',
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
                    paystream-gateway@v2.4.0-rc1
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                    color: isDark ? '#f87171' : '#dc2626',
                    border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca',
                  }}
                >
                  GATE: BLOCKED • RISK 86
                </span>
              </div>

              {/* Tab Switcher */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  background: isDark ? '#1a1918' : '#f6f5f2',
                  padding: '4px',
                  borderRadius: '10px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                }}
              >
                {(['map', 'timeline', 'dossier'] as const).map((tab) => {
                  const labels = {
                    map: '1. System Map',
                    timeline: '2. Failure Timeline',
                    dossier: '3. watsonx.ai Report',
                  }
                  const isActive = activeTelemetryTab === tab
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTelemetryTab(tab)}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: isActive ? 700 : 500,
                        borderRadius: '7px',
                        border: 'none',
                        cursor: 'pointer',
                        background: isActive ? (isDark ? '#272725' : '#ffffff') : 'transparent',
                        color: isActive
                          ? (isDark ? '#ffffff' : '#141413')
                          : (isDark ? '#a1a1aa' : '#66645e'),
                        boxShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                        transition: 'all 120ms ease',
                      }}
                    >
                      {labels[tab]}
                    </button>
                  )
                })}
              </div>

              {/* Tab Contents */}
              <div
                style={{
                  minHeight: '200px',
                  background: isDark ? '#1a1918' : '#faf9f6',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  fontSize: '12px',
                }}
              >
                {activeTelemetryTab === 'map' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '9999px',
                            background: '#ef4444',
                            display: 'inline-block',
                          }}
                        />
                        ReactFlow System Topology
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: isDark ? '#a1a1aa' : '#66645e',
                        }}
                      >
                        6 Architectural Modules
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      <div
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: isDark ? '#141413' : '#ffffff',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '11.5px' }}>Ledger Engine</span>
                          <span
                            style={{
                              fontSize: '9px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: '#dc2626',
                              background: isDark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.08)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            DANGER
                          </span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: isDark ? '#a1a1aa' : '#66645e', marginTop: '2px' }}>
                          28 files • Deadlock risk
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: isDark ? '#141413' : '#ffffff',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '11.5px' }}>Redis Idempotency</span>
                          <span
                            style={{
                              fontSize: '9px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: '#dc2626',
                              background: isDark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.08)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            DANGER
                          </span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: isDark ? '#a1a1aa' : '#66645e', marginTop: '2px' }}>
                          7 files • Missing lock lease
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: isDark ? '#141413' : '#ffffff',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '11.5px' }}>API Gateway</span>
                          <span
                            style={{
                              fontSize: '9px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: '#d97706',
                              background: isDark ? 'rgba(217,119,6,0.2)' : 'rgba(217,119,6,0.08)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            WARN
                          </span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: isDark ? '#a1a1aa' : '#66645e', marginTop: '2px' }}>
                          34 files • Upstream timeout
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: isDark ? '#141413' : '#ffffff',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '11.5px' }}>Audit Vault</span>
                          <span
                            style={{
                              fontSize: '9px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: '#16a34a',
                              background: isDark ? 'rgba(22,163,74,0.2)' : 'rgba(22,163,74,0.08)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            OK
                          </span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: isDark ? '#a1a1aa' : '#66645e', marginTop: '2px' }}>
                          11 files • Cold storage compliant
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: isDark ? '#a1a1aa' : '#66645e',
                        borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e3dc',
                        paddingTop: '8px',
                      }}
                    >
                      Detected Stack: <strong>Go • Kafka • Redis • PostgreSQL • Docker</strong>
                    </div>
                  </div>
                )}

                {activeTelemetryTab === 'timeline' && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11.5px',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: isDark ? '#a1a1aa' : '#66645e',
                      }}
                    >
                      Failure Cascade Timeline (T+0s → T+18m)
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>T+0s:</span>
                      <span>Settlement pipeline active. 4,200 tx/sec throughput.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>T+6m:</span>
                      <span>Flash payout event triggers 450% traffic spike.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#d97706', fontWeight: 700 }}>T+10m:</span>
                      <span>Idempotency lock saturation; duplicate requests bypass window.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#dc2626', fontWeight: 700 }}>T+18m:</span>
                      <span>Split-brain double billing detected; gate blocked.</span>
                    </div>
                  </div>
                )}

                {activeTelemetryTab === 'dossier' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        IBM watsonx.ai Granite 3.3
                      </span>
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff',
                          color: isDark ? '#60a5fa' : '#2563eb',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        8B INSTRUCT
                      </span>
                    </div>
                    <p
                      style={{
                        lineHeight: 1.5,
                        color: isDark ? '#d4d4d8' : '#3f3f46',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                      }}
                    >
                      &ldquo;Missing distributed lock leases on idempotency keys combined with unhandled Kafka consumer group rebalances and absent upstream circuit breakers will trigger split-brain double-billing under burst volume.&rdquo;
                    </p>
                    <div
                      style={{
                        padding: '6px 10px',
                        background: isDark ? '#141413' : '#ffffff',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                        borderRadius: '6px',
                        fontSize: '10.5px',
                      }}
                    >
                      <strong>Remediation:</strong> Configure Redis distributed lock leases with explicit TTL &amp; implement circuit breakers.
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1efea',
                  paddingTop: '10px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: isDark ? '#a1a1aa' : '#66645e',
                }}
              >
                <span>Interactive ReactFlow topology + scrubber</span>
                <button
                  type="button"
                  onClick={() => navigateToDemo('/simulator?scenario=fintech')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: isDark ? '#ffffff' : '#141413',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>See live demo</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Core Capabilities (Grounded In Real Codebase) ── */}
      <section
        style={{
          padding: '56px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e6e4df',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: isDark ? '#a1a1aa' : '#66645e',
            }}
          >
            Engineered Capabilities
          </span>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: isDark ? '#ffffff' : '#141413',
            }}
          >
            Built for Real-World Codebases
          </h2>
          <p
            style={{
              fontSize: '14.5px',
              color: isDark ? '#a1a1aa' : '#66645e',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Direct static analysis, graph topology extraction, and AI release gate decisions without requiring production deployments.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Capability 1 */}
          <div
            style={{
              background: isDark ? '#141413' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e6e4df',
              borderRadius: '16px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: isDark ? '#60a5fa' : '#2563eb',
                  background: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                INGESTION
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#a1a1aa' : '#66645e' }}>
                GitHub + ZIP
              </span>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: isDark ? '#ffffff' : '#141413' }}>
              Multi-Source Ingestion
            </h3>
            <p style={{ fontSize: '12.5px', lineHeight: 1.55, color: isDark ? '#a1a1aa' : '#66645e' }}>
              Directly clone public GitHub repositories via GitHub API archive streams, or upload local <code>.zip</code> codebase archives up to 50MB with zero persistence of raw code to disk.
            </p>
          </div>

          {/* Capability 2 */}
          <div
            style={{
              background: isDark ? '#141413' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e6e4df',
              borderRadius: '16px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: isDark ? '#f59e0b' : '#d97706',
                  background: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                HEURISTICS
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#a1a1aa' : '#66645e' }}>
                Static Pattern Engine
              </span>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: isDark ? '#ffffff' : '#141413' }}>
              Code Pattern Analysis
            </h3>
            <p style={{ fontSize: '12.5px', lineHeight: 1.55, color: isDark ? '#a1a1aa' : '#66645e' }}>
              Scans manifests (Node, Python, Go, Rust) and code patterns for unhandled promise rejections, database connection saturation, deadlocks, missing timeouts, and exposed credentials.
            </p>
          </div>

          {/* Capability 3 */}
          <div
            style={{
              background: isDark ? '#141413' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e6e4df',
              borderRadius: '16px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: isDark ? '#a855f7' : '#9333ea',
                  background: isDark ? 'rgba(168, 85, 247, 0.15)' : '#faf5ff',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                TOPOLOGY
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#a1a1aa' : '#66645e' }}>
                @xyflow/react
              </span>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: isDark ? '#ffffff' : '#141413' }}>
              Interactive System Map
            </h3>
            <p style={{ fontSize: '12.5px', lineHeight: 1.55, color: isDark ? '#a1a1aa' : '#66645e' }}>
              Transforms repository architecture into an interactive node graph with animated packet streams, dependency connection edges, and color-coded risk status badges.
            </p>
          </div>

          {/* Capability 4 */}
          <div
            style={{
              background: isDark ? '#141413' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e6e4df',
              borderRadius: '16px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: isDark ? '#10b981' : '#16a34a',
                  background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                GATING
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#a1a1aa' : '#66645e' }}>
                watsonx Granite 3.3
              </span>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: isDark ? '#ffffff' : '#141413' }}>
              Audit-Ready Markdown Export
            </h3>
            <p style={{ fontSize: '12.5px', lineHeight: 1.55, color: isDark ? '#a1a1aa' : '#66645e' }}>
              Generates an objective 0–100 risk score, an APPROVED or BLOCKED gate decision, and a one-click downloadable Markdown release report for pull request audits.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section: How It Works (With Rich Interactive Animations) ── */}
      <section
        id="how-it-works"
        style={{
          padding: '64px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e6e4df',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}>
            <span
              className="pipeline-badge-pulse"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: isDark ? '#38bdf8' : '#0284c7',
                background: isDark ? 'rgba(56, 189, 248, 0.12)' : '#e0f2fe',
                padding: '3px 10px',
                borderRadius: '9999px',
                border: isDark ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid #bae6fd',
              }}
            >
              3-Stage Progressive Pipeline
            </span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 38px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: isDark ? '#ffffff' : '#141413',
            }}
          >
            How DryRun Operates
          </h2>
          <p
            style={{
              fontSize: '14.5px',
              color: isDark ? '#a1a1aa' : '#66645e',
              maxWidth: '620px',
              margin: '0 auto',
            }}
          >
            From in-memory archive extraction to topological graph mapping and IBM foundation AI release decisions.
          </p>
        </div>

        {/* Animated Connecting Flow Beam (Visible on Desktop) */}
        <div
          className="pipeline-connector-line"
          style={{
            height: '3px',
            borderRadius: '9999px',
            margin: '0 40px -18px',
            opacity: 0.85,
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Stage 1: Ingestion with Scanner Beam Animation */}
          <div
            className="pipeline-card"
            style={{
              background: isDark ? '#141413' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e6e4df',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div className="scanner-beam" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  color: isDark ? '#38bdf8' : '#0284c7',
                  background: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                  padding: '3px 10px',
                  borderRadius: '6px',
                }}
              >
                STAGE 01
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: isDark ? '#a1a1aa' : '#66645e' }}>
                In-Memory Parsing
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: isDark ? '#ffffff' : '#141413' }}>
              Source Tree &amp; Archive Ingestion
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: isDark ? '#a1a1aa' : '#66645e' }}>
              Unpacks GitHub zipball or uploaded <code>.zip</code> exclusively in RAM using <code>adm-zip</code>. Detects framework manifests (Node, Python, Go, Rust, Docker) and scans code for hardcoded secrets, unhandled promise rejections, and blocking calls.
            </p>
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '10px',
                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11.5px',
                fontFamily: 'var(--font-mono)',
                color: isDark ? '#38bdf8' : '#0284c7',
              }}
            >
              <span>⚡ RAM Execution • Zero disk traces</span>
            </div>
          </div>

          {/* Stage 2: Topology & Failure Cascade with Animated Decay Wave */}
          <div
            className="pipeline-card"
            style={{
              background: isDark ? '#141413' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e6e4df',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  color: isDark ? '#f59e0b' : '#d97706',
                  background: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
                  padding: '3px 10px',
                  borderRadius: '6px',
                }}
              >
                STAGE 02
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: isDark ? '#a1a1aa' : '#66645e' }}>
                Timeline Simulation
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: isDark ? '#ffffff' : '#141413' }}>
              Topology &amp; Cascade Decay
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: isDark ? '#a1a1aa' : '#66645e' }}>
              Constructs 6 functional system modules in an interactive ReactFlow graph. Simulates failure cascade timeline from canary rollout (T+0s) up to 24h steady state, predicting connection pool saturation and downstream timeouts.
            </p>
            {/* Animated Decay Bar Indicator */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '10px',
                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <span>Propagation Range:</span>
                <strong style={{ color: '#d97706' }}>T+0s → T+24h</strong>
              </div>
              <div
                style={{
                  height: '4px',
                  background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e3dc',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="decay-bar"
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981, #f59e0b, #ef4444)',
                    borderRadius: '9999px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stage 3: watsonx.ai Release Gate with Neural Glow Animation */}
          <div
            className="pipeline-card"
            style={{
              background: isDark ? '#141413' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e6e4df',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  color: isDark ? '#10b981' : '#16a34a',
                  background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7',
                  padding: '3px 10px',
                  borderRadius: '6px',
                }}
              >
                STAGE 03
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: isDark ? '#a1a1aa' : '#66645e' }}>
                Granite 3.3 8B
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: isDark ? '#ffffff' : '#141413' }}>
              Automated Release Gating
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: isDark ? '#a1a1aa' : '#66645e' }}>
              Evaluates architecture telemetry with IBM watsonx.ai Granite 3.3 8B to compute an objective risk score (0–100), issue severity breakdown, and an automated gate decision. Falls back to deterministic analysis when offline.
            </p>
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '10px',
                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                className="neural-glow"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7',
                  color: isDark ? '#34d399' : '#15803d',
                }}
              >
                <span>✓ GATE DECISION ACTIVE</span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: isDark ? '#a1a1aa' : '#66645e' }}>
                100% Offline Ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Pre-Configured Scenarios (Exact Real Demo Data) ── */}
      <section
        id="scenarios"
        style={{
          padding: '64px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e6e4df',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
        }}
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: isDark ? '#a1a1aa' : '#66645e',
            }}
          >
            Instant Evaluation
          </span>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 38px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: isDark ? '#ffffff' : '#141413',
            }}
          >
            Explore Pre-Configured Enterprise Outages
          </h2>
          <p
            style={{
              fontSize: '14.5px',
              color: isDark ? '#a1a1aa' : '#66645e',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Test real-world failure patterns in 1 click. Zero upload or external API keys required.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Scenario 1: FinTech PayStream */}
          <button
            type="button"
            onClick={() => navigateToDemo('/simulator?scenario=fintech')}
            className="pipeline-card"
            style={{
              background: isDark ? '#141413' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e6e4df',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'left',
              cursor: 'pointer',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '6px',
                  background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                  color: isDark ? '#f87171' : '#dc2626',
                  border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca',
                }}
              >
                RISK 86 • CRITICAL • BLOCKED
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>Run Demo →</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#141413' }}>
              PayStream Gateway
            </h3>
            <p style={{ fontSize: '12.5px', lineHeight: 1.55, color: isDark ? '#a1a1aa' : '#66645e' }}>
              High-throughput Go &amp; Kafka payment orchestration. Idempotency lock exhaustion and split-brain double-billing under burst transaction spikes.
            </p>
            <div
              style={{
                marginTop: 'auto',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: isDark ? '#71717a' : '#a19e95',
              }}
            >
              Stack: Go • Kafka • Redis • PostgreSQL • Docker
            </div>
          </button>

          {/* Scenario 2: Cloud Commerce */}
          <button
            type="button"
            onClick={() => navigateToDemo('/simulator?scenario=commerce')}
            className="pipeline-card"
            style={{
              background: isDark ? '#141413' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e6e4df',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'left',
              cursor: 'pointer',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '6px',
                  background: isDark ? 'rgba(217, 119, 6, 0.15)' : '#fffbeb',
                  color: isDark ? '#fbbf24' : '#d97706',
                  border: isDark ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid #fde68a',
                }}
              >
                RISK 78 • HIGH • BLOCKED
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>Run Demo →</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#141413' }}>
              Cloud Commerce Platform
            </h3>
            <p style={{ fontSize: '12.5px', lineHeight: 1.55, color: isDark ? '#a1a1aa' : '#66645e' }}>
              Next.js &amp; Node.js multi-tier storefront. Unindexed N+1 queries, unrotated JWT session keys, and unbounded Redis cache memory exhaustion.
            </p>
            <div
              style={{
                marginTop: 'auto',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: isDark ? '#71717a' : '#a19e95',
              }}
            >
              Stack: Next.js • Node.js • PostgreSQL • Redis • S3
            </div>
          </button>

          {/* Scenario 3: Sentinel Gateway */}
          <button
            type="button"
            onClick={() => navigateToDemo('/simulator?scenario=sentinel')}
            className="pipeline-card"
            style={{
              background: isDark ? '#141413' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e6e4df',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'left',
              cursor: 'pointer',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '6px',
                  background: isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
                  color: isDark ? '#4ade80' : '#16a34a',
                  border: isDark ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #bbf7d0',
                }}
              >
                RISK 0 • NOMINAL • APPROVED
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>Run Demo →</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#141413' }}>
              Sentinel Mesh Gateway
            </h3>
            <p style={{ fontSize: '12.5px', lineHeight: 1.55, color: isDark ? '#a1a1aa' : '#66645e' }}>
              Hardened Go &amp; Envoy ingress mesh. Active circuit breakers, mTLS auth vault, canary routing, and zero critical vulnerabilities. Passes all gates.
            </p>
            <div
              style={{
                marginTop: 'auto',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: isDark ? '#71717a' : '#a19e95',
              }}
            >
              Stack: Go • Kubernetes • Envoy • Redis • Vault
            </div>
          </button>
        </div>
      </section>

      {/* ── Section: Architecture & Security Specifications ── */}
      <section
        id="architecture"
        style={{
          padding: '64px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e6e4df',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        <div
          style={{
            background: isDark ? '#141413' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e6e4df',
            borderRadius: '20px',
            padding: '32px 36px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: isDark ? '#a1a1aa' : '#66645e',
              }}
            >
              Architecture &amp; Safety
            </span>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: isDark ? '#ffffff' : '#141413',
              }}
            >
              Engineered for Enterprise Safety &amp; Uptime
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <div
              style={{
                padding: '18px',
                background: isDark ? '#1a1918' : '#faf9f6',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: isDark ? '#ffffff' : '#141413' }}>
                Dual-Engine Resilience
              </div>
              <p style={{ fontSize: '12px', lineHeight: 1.5, color: isDark ? '#a1a1aa' : '#66645e' }}>
                Automatic fallback to deterministic static analysis when IBM Cloud credentials are not configured. 100% offline functionality.
              </p>
            </div>

            <div
              style={{
                padding: '18px',
                background: isDark ? '#1a1918' : '#faf9f6',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: isDark ? '#ffffff' : '#141413' }}>
                In-Memory ZIP Unpacking
              </div>
              <p style={{ fontSize: '12px', lineHeight: 1.5, color: isDark ? '#a1a1aa' : '#66645e' }}>
                Uploaded codebase archives are held exclusively in RAM memory buffers via <code>adm-zip</code>; zero persistence of raw code to disk.
              </p>
            </div>

            <div
              style={{
                padding: '18px',
                background: isDark ? '#1a1918' : '#faf9f6',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: isDark ? '#ffffff' : '#141413' }}>
                Sub-4s Feedback Loop
              </div>
              <p style={{ fontSize: '12px', lineHeight: 1.5, color: isDark ? '#a1a1aa' : '#66645e' }}>
                Manifest extraction, heuristic pattern matching, and topology graph construction execute in seconds before AI generation begins.
              </p>
            </div>

            <div
              style={{
                padding: '18px',
                background: isDark ? '#1a1918' : '#faf9f6',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e5e3dc',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: isDark ? '#ffffff' : '#141413' }}>
                Audit-Ready Release Export
              </div>
              <p style={{ fontSize: '12px', lineHeight: 1.5, color: isDark ? '#a1a1aa' : '#66645e' }}>
                Generates a one-click exportable Markdown release readiness dossier ready to paste into GitHub PRs and compliance records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom Call-to-Action Banner ── */}
      <section
        style={{
          padding: '48px 24px 64px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            background: isDark ? '#141413' : '#141413',
            color: '#ffffff',
            borderRadius: '24px',
            padding: '48px 36px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
            border: '1px solid #272725',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Gate releases before they break production.
          </h2>
          <p style={{ color: '#a1a1aa', maxWidth: '520px', fontSize: '14.5px', lineHeight: 1.6 }}>
            Upload any local zip, enter a GitHub repo, or explore pre-configured enterprise outages.
          </p>
          <div style={{ paddingTop: '6px' }}>
            <button
              type="button"
              onClick={() => navigateToDemo('/simulator')}
              style={{
                background: '#ffffff',
                color: '#141413',
                fontWeight: 600,
                fontSize: '13px',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 140ms ease',
              }}
            >
              <span>See a live demo</span>
              <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.6 }}>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Minimal Footer ── */}
      <footer
        style={{
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e6e4df',
          padding: '24px',
          fontSize: '11.5px',
          fontFamily: 'var(--font-mono)',
          color: isDark ? '#a1a1aa' : '#66645e',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div>
          <strong>DryRun</strong> • IBM Bob 2.0 Hackathon Submission (Release Readiness Engine)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            type="button"
            onClick={() => navigateToDemo('/simulator')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'inherit',
              font: 'inherit',
            }}
          >
            Simulator
          </button>
          <a
            href="https://github.com/toufiqfarhan0/dryrun"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            GitHub
          </a>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
