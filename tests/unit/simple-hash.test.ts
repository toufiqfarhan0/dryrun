// Tests for simpleHash — should be a stable, non-negative integer.

import { describe, it, expect } from 'vitest'
import { simpleHash } from '@/lib/analysis'

describe('simpleHash (D1)', () => {
  it('matches golden values', () => {
    // Hand-computed from the ((h<<5)-h)+char recurrence.
    expect(simpleHash('')).toBe(0)
    expect(simpleHash('a')).toBe(97)
    expect(simpleHash('ab')).toBe(3105)
  })

  it('is deterministic — same input yields same output', () => {
    const input = JSON.stringify({ folders: ['src', 'src/api'], key_files: ['package.json'] })
    expect(simpleHash(input)).toBe(simpleHash(input))
  })

  it('always returns a non-negative integer', () => {
    for (const s of ['', 'x', 'a much longer string with symbols !@#$', '日本語', '{}']) {
      const h = simpleHash(s)
      expect(Number.isInteger(h)).toBe(true)
      expect(h).toBeGreaterThanOrEqual(0)
    }
  })

  it('distinguishes different inputs', () => {
    expect(simpleHash('alpha')).not.toBe(simpleHash('beta'))
  })

  // TODO: add a collision-rate check over a large corpus once more fixtures exist.
})
