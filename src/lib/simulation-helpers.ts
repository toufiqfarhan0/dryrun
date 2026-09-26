import type { RiskLevel, Severity, StatusType, SimulationEvent } from '@/types'

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const riskColors: Record<RiskLevel, string> = {
  ok: '#4ade80',
  warn: '#fbbf24',
  danger: '#f87171',
}

export const riskGlows: Record<RiskLevel, string> = {
  ok: '0 0 8px rgba(74,222,128,0.5)',
  warn: '0 0 8px rgba(251,191,36,0.5)',
  danger: '0 0 8px rgba(248,113,113,0.6)',
}

export const severityColors: Record<Severity, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#fbbf24',
  low: '#4ade80',
}

export const statusColors: Record<StatusType, string> = {
  IDLE:             '#22c55e',
  ANALYZING:        '#f59e0b',
  ACTIVE:           '#f59e0b',
  DEGRADING:        '#f97316',
  'CRITICAL FAILURE': '#ef4444',
}

export function getRiskBadgeClass(score: number): {
  label: string
  colorClass: string
} {
  if (score >= 80) return { label: 'Critical', colorClass: 'critical' }
  if (score >= 60) return { label: 'High', colorClass: 'high' }
  if (score >= 40) return { label: 'Medium', colorClass: 'medium' }
  if (score === 0) return { label: 'Zero Risk', colorClass: 'low' }
  return { label: 'Low', colorClass: 'low' }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#ef4444'
  if (score >= 60) return '#f97316'
  if (score >= 40) return '#f59e0b'
  return '#22c55e'
}

export function formatFileSize(bytes: number): string {
  return (bytes / 1024).toFixed(1) + ' KB'
}

/* Report math moved here from Timeline.tsx and RiskReport.tsx so it can be tested. */

// Damage through event index upTo. danger = 18, warn = 8, capped at 100.
export function computeDamage(events: SimulationEvent[], upTo: number): number {
  const slice = events.slice(0, upTo + 1)
  const dangerCount = slice.filter((e) => e.type === 'danger').length
  const warnCount = slice.filter((e) => e.type === 'warn').length
  return Math.min(100, dangerCount * 18 + warnCount * 8)
}

// Rough incident cost from the risk score.
export function estimateIncidentCost(score: number): number {
  if (score === 0) return 0
  return score * 150 + 2000
}

// Recommendation text for an issue type and severity.
export function getRecommendation(type: string, severity: string): string {
  const recommendations: Record<string, Record<string, string>> = {
    performance: {
      critical: 'Implement caching, optimize database queries, and consider load balancing immediately.',
      high: 'Profile slow endpoints, add database indexes, and optimize heavy computations.',
      medium: 'Review API response times and implement lazy loading where applicable.',
      low: 'Monitor performance metrics and set up alerts for degradation.',
    },
    security: {
      critical: 'Patch vulnerabilities NOW, update dependencies, and conduct security audit.',
      high: 'Update all packages, implement input validation, and add rate limiting.',
      medium: 'Review authentication flows, add HTTPS, and sanitize user inputs.',
      low: 'Enable security headers, update dependencies regularly, and add logging.',
    },
    architecture: {
      critical: 'Refactor critical paths, separate concerns, and implement proper error handling.',
      high: 'Break down monolithic components, add proper abstractions, and improve modularity.',
      medium: 'Review code organization, add documentation, and improve test coverage.',
      low: 'Follow best practices, add comments, and maintain consistent patterns.',
    },
  }

  return recommendations[type]?.[severity] ?? 'Review and address this issue based on your project requirements.'
}
