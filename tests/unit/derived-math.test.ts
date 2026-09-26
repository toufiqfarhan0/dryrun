// Tests for the report math: computeDamage, estimateIncidentCost, getRecommendation.

import { describe, it, expect } from 'vitest'
import { computeDamage, estimateIncidentCost, getRecommendation } from '@/lib/utils'
import type { SimulationEvent } from '@/types'

const ev = (type: SimulationEvent['type']): SimulationEvent => ({ time: 'T+0s', event: 'e', type })

describe('computeDamage', () => {
  it('weights danger events 18 and warn events 8, cumulative through upTo', () => {
    const events = [ev('normal'), ev('warn'), ev('danger'), ev('danger')]
    expect(computeDamage(events, 0)).toBe(0) // normal only
    expect(computeDamage(events, 1)).toBe(8) // + one warn
    expect(computeDamage(events, 2)).toBe(26) // + one danger
    expect(computeDamage(events, 3)).toBe(44) // + another danger
  })

  it('caps the result at 100', () => {
    const events = Array.from({ length: 8 }, () => ev('danger')) // 8 * 18 = 144
    expect(computeDamage(events, 7)).toBe(100)
  })

  it('returns 0 for an empty event list', () => {
    expect(computeDamage([], 0)).toBe(0)
  })
})

describe('estimateIncidentCost', () => {
  it('computes score * 150 + 2000', () => {
    expect(estimateIncidentCost(0)).toBe(2000)
    expect(estimateIncidentCost(72)).toBe(12800)
    expect(estimateIncidentCost(100)).toBe(17000)
  })
})

describe('getRecommendation', () => {
  it('returns the specific recommendation for a known type/severity pair', () => {
    expect(getRecommendation('security', 'critical')).toBe(
      'Patch vulnerabilities NOW, update dependencies, and conduct security audit.'
    )
    expect(getRecommendation('performance', 'low')).toBe(
      'Monitor performance metrics and set up alerts for degradation.'
    )
  })

  it('falls back gracefully for unknown type/severity', () => {
    const fallback = 'Review and address this issue based on your project requirements.'
    expect(getRecommendation('unknown', 'critical')).toBe(fallback)
    expect(getRecommendation('security', 'unknown')).toBe(fallback)
  })
})
