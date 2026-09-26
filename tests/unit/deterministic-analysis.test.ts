// Tests for the evidence-based deterministic fallback analysis.
// Verifies that the score and issues are derived from real findings,
// never from a hash floor or hardcoded template.

import { describe, it, expect } from 'vitest'
import {
  generateDeterministicRiskScore,
  generateDeterministicAnalysis,
  type RiskFinding,
  type SystemSnapshot,
} from '@/lib/analysis'
import { validateAIResult } from '../helpers/ai-result-schema'

function makeFinding(
  category: RiskFinding['category'],
  severity: RiskFinding['severity'] = 'high',
  file = 'src/foo.js',
  line = 1
): RiskFinding {
  return {
    category,
    severity,
    file,
    line,
    evidence: 'example line',
    description: `synthetic ${category} finding`,
  }
}

function makeSnapshot(overrides: Partial<SystemSnapshot> = {}): SystemSnapshot {
  return {
    project_name: 'demo-project',
    project_summary: 'Demo project with 4 code files',
    stack: ['JavaScript', 'Node.js'],
    entry_points: ['demo-project/index.js'],
    folder_structure: {
      folders: ['demo-project', 'demo-project/src'],
      key_files: ['demo-project/package.json'],
    },
    dependency_graph: { nodes: [], relationships: [] },
    findings: [],
    file_stats: {
      total_files: 4,
      code_files: 3,
      config_files: 1,
      size_kb: '12.5',
    },
    ...overrides,
  }
}

describe('generateDeterministicRiskScore', () => {
  it('returns 0 when there are no findings', () => {
    expect(generateDeterministicRiskScore([])).toBe(0)
  })

  it('weights severity correctly', () => {
    expect(generateDeterministicRiskScore([makeFinding('hardcoded_secret', 'low')])).toBe(3)
    expect(generateDeterministicRiskScore([makeFinding('hardcoded_secret', 'medium')])).toBe(8)
    expect(generateDeterministicRiskScore([makeFinding('hardcoded_secret', 'high')])).toBe(15)
    expect(generateDeterministicRiskScore([makeFinding('hardcoded_secret', 'critical')])).toBe(25)
  })

  it('accumulates score across findings and caps at 95', () => {
    const many = Array.from({ length: 10 }, () => makeFinding('hardcoded_secret', 'critical'))
    expect(generateDeterministicRiskScore(many)).toBe(95)
  })

  it('never returns a floor above 0 for clean projects', () => {
    expect(generateDeterministicRiskScore([])).toBe(0)
    expect(generateDeterministicRiskScore([])).toBeLessThan(20)
  })
})

describe('generateDeterministicAnalysis', () => {
  it('produces zero score and empty issues for a clean snapshot', () => {
    const result = generateDeterministicAnalysis(makeSnapshot())
    expect(result.risk_score).toBe(0)
    expect(result.issues).toEqual([])
    expect(result.simulation.length).toBeGreaterThan(0)
    expect(result.simulation.every(e => e.type === 'normal')).toBe(true)
  })

  it('is deterministic for the same snapshot', () => {
    const snap = makeSnapshot({
      findings: [makeFinding('hardcoded_secret', 'high', 'demo-project/config.js', 12)],
    })
    expect(generateDeterministicAnalysis(snap)).toEqual(generateDeterministicAnalysis(snap))
  })

  it('returns an AIResult that satisfies the schema contract', () => {
    const result = generateDeterministicAnalysis(makeSnapshot())
    const { valid, errors } = validateAIResult(result)
    expect(errors).toEqual([])
    expect(valid).toBe(true)
  })

  it('produces one issue per category present in findings', () => {
    const snap = makeSnapshot({
      findings: [
        makeFinding('hardcoded_secret', 'high'),
        makeFinding('dynamic_code_exec', 'high'),
        makeFinding('insecure_http', 'medium'),
      ],
    })
    const result = generateDeterministicAnalysis(snap)
    expect(result.issues).toHaveLength(3)
    const types = result.issues.map(i => i.description)
    expect(types.some(d => /hardcoded credential/i.test(d))).toBe(true)
    expect(types.some(d => /eval\/exec/i.test(d))).toBe(true)
    expect(types.some(d => /HTTP URL/i.test(d))).toBe(true)
  })

  it('escalates hardcoded_secret to critical when there are 3 or more', () => {
    const snap = makeSnapshot({
      findings: [
        makeFinding('hardcoded_secret', 'high', 'a.js', 1),
        makeFinding('hardcoded_secret', 'high', 'b.js', 1),
        makeFinding('hardcoded_secret', 'high', 'c.js', 1),
      ],
    })
    const result = generateDeterministicAnalysis(snap)
    const secretIssue = result.issues.find(i => /hardcoded credential/i.test(i.description))
    expect(secretIssue?.severity).toBe('critical')
  })

  it('uses the project folder layout to name modules', () => {
    const snap = makeSnapshot({
      folder_structure: {
        folders: ['demo-project', 'demo-project/auth', 'demo-project/api'],
        key_files: [],
      },
    })
    const result = generateDeterministicAnalysis(snap)
    const names = result.modules.map(m => m.name)
    expect(names).toContain('auth')
    expect(names).toContain('api')
  })

  it('marks a module as danger when it contains a high-severity finding', () => {
    const snap = makeSnapshot({
      folder_structure: {
        folders: ['demo-project', 'demo-project/auth'],
        key_files: [],
      },
      findings: [makeFinding('hardcoded_secret', 'high', 'demo-project/auth/config.js', 4)],
    })
    const result = generateDeterministicAnalysis(snap)
    const auth = result.modules.find(m => m.name === 'auth')
    expect(auth?.risk).toBe('danger')
  })

  it('does NOT produce the legacy hardcoded doom issues for a clean project', () => {
    const result = generateDeterministicAnalysis(makeSnapshot())
    const blob = JSON.stringify(result).toLowerCase()
    expect(blob).not.toMatch(/jwt secret stored in \.env/)
    expect(blob).not.toMatch(/n\+1 query pattern/)
    expect(blob).not.toMatch(/redis cache/)
    expect(blob).not.toMatch(/cdn-distributed/)
  })
})
