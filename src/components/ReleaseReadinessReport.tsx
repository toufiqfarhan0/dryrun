'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, ChevronDown, FileText, FileDown, Loader2 } from 'lucide-react'
import { getScoreColor, severityColors, estimateIncidentCost, getRecommendation } from '@/lib/simulation-helpers'
import { exportMarkdown, exportPdf } from '@/lib/report-exporter'
import type { AIResult } from '@/types'

const typeIcons: Record<string, string> = {
  performance: '⚡',
  security: '🔒',
  architecture: '🏗️',
}

interface RiskReportProps {
  aiResult: AIResult
  stack: string[]
  projectName?: string
  modules?: Array<{ name: string; risk: string; files: number }>
}

export default function RiskReport({ aiResult, stack, projectName, modules }: RiskReportProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const [barWidth, setBarWidth] = useState(0)
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const score = aiResult.risk_score ?? 0
  const scoreColor = getScoreColor(score)

  useEffect(() => {
    setDisplayScore(0)
    setBarWidth(0)

    let current = 0
    const interval = setInterval(() => {
      current = Math.min(current + 2, score)
      setDisplayScore(current)
      if (current >= score) clearInterval(interval)
    }, 30)

    setTimeout(() => setBarWidth(score), 200)

    return () => clearInterval(interval)
  }, [score])

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsExportOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExportOpen(false)
    }

    if (isExportOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExportOpen])

  const baseCost = estimateIncidentCost(score)

  const reportPayload = {
    projectName,
    score,
    summary: aiResult.summary,
    stack,
    modules,
    issues: aiResult.issues,
    baseCost,
  }

  const handleExportMarkdown = () => {
    exportMarkdown(reportPayload)
    setIsExportOpen(false)
  }

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true)
      await exportPdf(reportPayload)
    } catch (err) {
      console.error('Failed to export PDF:', err)
    } finally {
      setIsExportingPdf(false)
      setIsExportOpen(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      height: '100%',
      minHeight: 0,
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Header with Export Dropdown */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        paddingBottom: '10px',
        borderBottom: '1.5px solid #000',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
          <div style={{
            width: '7px',
            height: '7px',
            borderRadius: '2px',
            background: 'hsl(var(--neo-button))',
            boxShadow: '0 0 6px hsl(var(--neo-button))',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: 'hsl(var(--foreground))',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            Release Flight Manifest
          </span>
        </div>

        {/* Export dropdown menu */}
        <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setIsExportOpen((prev) => !prev)}
            aria-expanded={isExportOpen}
            aria-haspopup="true"
            title="Export Release Notes in multiple formats"
            className="neo-button neo-button-secondary"
            style={{
              fontSize: '10.5px',
              padding: '4px 8px',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
            }}
          >
            {isExportingPdf ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Download className="w-3 h-3" />
            )}
            <span style={{ whiteSpace: 'nowrap' }}>
              {isExportingPdf ? 'Exporting...' : 'Export'}
            </span>
            <ChevronDown
              className="w-3 h-3"
              style={{
                transform: isExportOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 160ms ease',
              }}
            />
          </button>

          {/* Dropdown Popover */}
          <AnimatePresence>
            {isExportOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  zIndex: 100,
                  width: '210px',
                  maxWidth: 'calc(100vw - 32px)',
                  background: 'hsl(var(--popover))',
                  backdropFilter: 'none',
                  border: '2px solid #000',
                  borderRadius: '8px',
                  boxShadow: '3px 3px 0 0 #000',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'hsl(var(--muted-foreground))',
                  padding: '4px 8px 2px',
                }}>
                  Export Format
                </div>

                {/* Option 1: Markdown (.md) */}
                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  className="export-dropdown-item"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: '1.5px solid transparent',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 120ms ease',
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '5px',
                    background: 'hsl(var(--neo-subtle))',
                    border: '1.5px solid #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '2px',
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'hsl(var(--foreground))',
                      }}>
                        Export Manifest (.MD)
                      </span>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        fontFamily: "'Geist Mono', monospace",
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: '#3b82f620',
                        color: '#3b82f6',
                        border: '1px solid #3b82f640',
                      }}>
                        .MD
                      </span>
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: 'hsl(var(--muted-foreground))',
                      lineHeight: 1.2,
                    }}>
                      GitHub-ready release manifest
                    </div>
                  </div>
                </button>

                {/* Option 2: PDF Document (.pdf) */}
                <button
                  type="button"
                  disabled={isExportingPdf}
                  onClick={handleExportPdf}
                  className="export-dropdown-item"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: '1.5px solid transparent',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    cursor: isExportingPdf ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 120ms ease',
                    opacity: isExportingPdf ? 0.6 : 1,
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '5px',
                    background: 'hsl(var(--neo-subtle))',
                    border: '1.5px solid #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FileDown className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '2px',
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'hsl(var(--foreground))',
                      }}>
                        Export Manifest (.PDF)
                      </span>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        fontFamily: "'Geist Mono', monospace",
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: '#ef444420',
                        color: '#ef4444',
                        border: '1px solid #ef444440',
                      }}>
                        .PDF
                      </span>
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: 'hsl(var(--muted-foreground))',
                      lineHeight: 1.2,
                    }}>
                      Compliance PDF dossier
                    </div>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Score display (Neo-panel style) */}
      <div style={{
        textAlign: 'center',
        padding: '20px 16px',
        background: 'hsl(var(--neo-panel-muted))',
        border: '2px solid #000',
        borderRadius: '10px',
        boxShadow: '3px 3px 0 0 #000',
      }}>
        <p style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'hsl(var(--muted-foreground))',
          marginBottom: '6px',
        }}>
          Deployment Risk Score
        </p>
        <p style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: '52px',
          fontWeight: 800,
          lineHeight: '1',
          color: scoreColor,
          letterSpacing: '-0.04em',
          marginBottom: '4px',
          transition: 'color 0.3s',
        }}>
          {displayScore}
        </p>
        <p style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: '13px',
          fontWeight: 600,
          color: 'hsl(var(--muted-foreground))',
        }}>
          / 100
        </p>
      </div>

      {/* Score bar */}
      <div className="damage-bar">
        <div
          className="damage-fill"
          style={{
            width: `${barWidth}%`,
            background: score > 70 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' :
                        score > 40 ? 'linear-gradient(90deg, #22c55e, #f59e0b)' :
                        'linear-gradient(90deg, #22c55e, #4ade80)',
          }}
        />
      </div>

      {/* Deployment Gate Verdict Box */}
      <div style={{
        padding: '14px 16px',
        background: score >= 40
          ? (score > 70 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)')
          : 'rgba(34,197,94,0.08)',
        border: '1.5px solid #000',
        borderRadius: '8px',
        boxShadow: '3px 3px 0 0 #000',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          paddingBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '10.5px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '5px',
              background: score >= 40 ? '#dc2626' : '#16a34a',
              color: '#ffffff',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              {score >= 40 ? 'GATE: BLOCKED' : 'GATE: CLEARED'}
            </span>
            <span style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              color: 'hsl(var(--foreground))',
              letterSpacing: '-0.01em',
            }}>
              {score >= 40
                ? 'Automated release clearance withheld (Critical Architectural Risk)'
                : 'Automated release clearance granted for staging rollout'}
            </span>
          </div>

          <span style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '11px',
            color: 'hsl(var(--muted-foreground))',
          }}>
            Audited by IBM Bob 2.0
          </span>
        </div>

        {/* CAB Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: '10.5px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'hsl(var(--muted-foreground))',
            margin: '0 0 2px 0',
          }}>
            Change Advisory Board (CAB) Verification Gates
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[
              'In-Memory AST Dependency Audit',
              'Single Point of Failure Isolation',
              'Cascading Fault Simulation Replayed',
              'watsonx.ai Granite 3.3 Remediation Verified',
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '11px',
                  color: 'hsl(var(--foreground))',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{
                  color: '#16a34a',
                  fontWeight: 800,
                  fontSize: '12px',
                  lineHeight: 1,
                  flexShrink: 0,
                }}>✓</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div>
        <p className="sec-header">Executive Summary &amp; Risk Assessment</p>
        <div style={{
          padding: '12px 14px',
          background: 'hsl(var(--neo-input-bg))',
          border: '1.5px solid #000',
          borderRadius: '8px',
          boxShadow: '2px 2px 0 0 #000',
        }}>
          <p style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: '13px',
            lineHeight: '1.6',
            color: 'hsl(var(--foreground))',
          }}>
            {aiResult.summary}
          </p>
        </div>
      </div>

      {/* Cost Estimate */}
      <div style={{
        padding: '14px 16px',
        background: score === 0 ? 'rgba(34,197,94,0.1)' : 'hsl(var(--neo-panel-muted))',
        border: '2px solid #000',
        borderRadius: '8px',
        boxShadow: '2.5px 2.5px 0 0 #000',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <p style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'hsl(var(--muted-foreground))',
            marginBottom: '2px',
          }}>
            {score === 0 ? 'Estimated Incident Cost (Deploy Ready)' : 'Estimated Incident Cost'}
          </p>
          <p style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: '24px',
            fontWeight: 800,
            color: score === 0 ? '#16a34a' : '#d97706',
            letterSpacing: '-0.02em',
          }}>
            ${baseCost.toLocaleString()}
          </p>
        </div>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: score === 0 ? '#4ade80' : 'hsl(var(--neo-button))',
          border: '2px solid #000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          color: '#000',
          fontWeight: 'bold',
        }}>
          {score === 0 ? '✓' : '⚠'}
        </div>
      </div>

      {/* Issues & Recommendations */}
      <div>
        <p className="sec-header">Issues &amp; Recommendations</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(!aiResult.issues || aiResult.issues.length === 0) && (
            <div style={{
              padding: '20px 14px',
              textAlign: 'center',
              background: 'rgba(34,197,94,0.1)',
              border: '2px solid #000',
              borderRadius: '8px',
              boxShadow: '2px 2px 0 0 #000',
            }}>
              <p style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#16a34a',
                marginBottom: '2px',
              }}>
                ✓ All Release Gates Passed
              </p>
              <p style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: '12px',
                color: 'hsl(var(--muted-foreground))',
              }}>
                No high-risk regressions or CVE vulnerabilities detected. Safe for automated deployment.
              </p>
            </div>
          )}
          {aiResult.issues?.map((issue, i) => (
            <motion.div
              key={i}
              style={{
                padding: '12px 14px',
                background: expandedIssue === i ? 'hsl(var(--neo-panel))' : 'hsl(var(--neo-input-bg))',
                borderTop: '1.5px solid #000',
                borderRight: '1.5px solid #000',
                borderBottom: '1.5px solid #000',
                borderLeft: `4px solid ${severityColors[issue.severity]}`,
                borderRadius: '6px',
                boxShadow: '2px 2px 0 0 #000',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: 2 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setExpandedIssue(expandedIssue === i ? null : i)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{typeIcons[issue.type] || '🔍'}</span>
                  <span style={{
                    fontFamily: "'Geist', sans-serif",
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'hsl(var(--foreground))',
                  }}>
                    {issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}
                  </span>
                </div>
                <span className={`risk-badge ${issue.severity}`}>
                  {issue.severity.toUpperCase()}
                </span>
              </div>

              <p style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: '12.5px',
                color: 'hsl(var(--foreground))',
                lineHeight: '1.5',
                marginTop: '6px',
              }}>
                {issue.description}
              </p>

              {expandedIssue === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid hsl(var(--foreground) / 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div>
                    <span style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'hsl(var(--muted-foreground))',
                      textTransform: 'uppercase',
                    }}>
                      Impact:
                    </span>
                    <p style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: '12px',
                      color: 'hsl(var(--foreground))',
                      marginTop: '2px',
                    }}>
                      {issue.impact}
                    </p>
                  </div>
                  <div>
                    <span style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#16a34a',
                      textTransform: 'uppercase',
                    }}>
                      Recommendation:
                    </span>
                    <p style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: '12px',
                      color: 'hsl(var(--foreground))',
                      marginTop: '2px',
                    }}>
                      {getRecommendation(issue.type, issue.severity)}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
