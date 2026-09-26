// Checks that recorded watsonx responses have the right shape and values.

import { describe, it, expect } from 'vitest'
import { extractFirstJsonObject } from '@/lib/analysis'
import { loadWatsonResponse } from '../helpers/load-fixture'
import { validateAIResult, SIMULATION_EVENT_RANGE } from '../helpers/ai-result-schema'

const RECORDED_RESPONSES = ['valid', 'markdown-wrapped', 'multiple-objects']

describe('watsonx response contract', () => {
  for (const name of RECORDED_RESPONSES) {
    describe(`recorded response: ${name}`, () => {
      const parsed = extractFirstJsonObject(loadWatsonResponse(name))

      it('matches the AIResult shape with valid values', () => {
        const { valid, errors } = validateAIResult(parsed)
        expect(errors).toEqual([])
        expect(valid).toBe(true)
      })

      it('has a risk_score within [0, 100]', () => {
        expect(parsed.risk_score).toBeGreaterThanOrEqual(0)
        expect(parsed.risk_score).toBeLessThanOrEqual(100)
      })

      it(`has ${SIMULATION_EVENT_RANGE[0]}-${SIMULATION_EVENT_RANGE[1]} simulation events`, () => {
        const [min, max] = SIMULATION_EVENT_RANGE
        expect(parsed.simulation.length).toBeGreaterThanOrEqual(min)
        expect(parsed.simulation.length).toBeLessThanOrEqual(max)
      })
    })
  }
})

describe('watsonx output grounding', () => {
  // TODO: check the model uses the real detected stack, not a made-up one
  it.todo('echoes the detected stack and project name from the input snapshot')
})

describe('watsonx adversarial responses', () => {
  // TODO: add broken/empty response files and check the extractor throws
  it.todo('throws on truncated / empty / prose-only model output')
})
