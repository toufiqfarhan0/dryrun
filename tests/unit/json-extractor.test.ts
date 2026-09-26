// Tests for extractFirstJsonObject — getting JSON out of the model's text.

import { describe, it, expect } from 'vitest'
import { extractFirstJsonObject } from '@/lib/analysis'
import { loadWatsonResponse } from '../helpers/load-fixture'

describe('extractFirstJsonObject', () => {
  it('parses a bare JSON object', () => {
    expect(extractFirstJsonObject('{"risk_score": 80, "summary": "ok"}')).toEqual({
      risk_score: 80,
      summary: 'ok',
    })
  })

  it('strips markdown code fences before parsing', () => {
    const parsed = extractFirstJsonObject(loadWatsonResponse('markdown-wrapped'))
    expect(parsed.risk_score).toBe(64)
  })

  it('returns the FIRST complete object when several are present', () => {
    const parsed = extractFirstJsonObject(loadWatsonResponse('multiple-objects'))
    expect(parsed.risk_score).toBe(58)
    expect(parsed.note).toBeUndefined() // the trailing object must be ignored
  })

  it('handles nested braces correctly', () => {
    const parsed = extractFirstJsonObject('prose {"a": {"b": {"c": 1}}} more prose')
    expect(parsed).toEqual({ a: { b: { c: 1 } } })
  })

  it('throws on empty or too-short input', () => {
    expect(() => extractFirstJsonObject('')).toThrow()
    expect(() => extractFirstJsonObject('   {}  ')).toThrow() // < 10 chars after trim
  })

  it('throws when no complete object exists (truncated output)', () => {
    expect(() => extractFirstJsonObject('{"risk_score": 80, "summary": "unterminated')).toThrow(
      /No valid JSON object/
    )
  })

  it('throws when the extracted text is not valid JSON', () => {
    expect(() => extractFirstJsonObject('{ this is not json at all }')).toThrow()
  })
})
