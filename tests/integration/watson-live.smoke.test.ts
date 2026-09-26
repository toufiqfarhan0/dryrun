// Optional test against the real watsonx API.
// Skipped unless WATSONX_API_KEY and WATSONX_PROJECT_ID are set.

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { POST } from '@/app/api/analyze/route'
import { validateAIResult } from '../helpers/ai-result-schema'
import { loadFixtureZip } from '../helpers/load-fixture'

const HAS_CREDS =
  !!process.env.WATSONX_API_KEY &&
  process.env.WATSONX_API_KEY !== 'your_api_key_here' &&
  !!process.env.WATSONX_PROJECT_ID

describe.runIf(HAS_CREDS)('watsonx live smoke test', () => {
  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterAll(() => {
    vi.restoreAllMocks()
  })

  it(
    'returns a schema-valid AIResult from the live API',
    { timeout: 60_000 },
    async () => {
      const body = {
        fileSize: '5.0',
        base64Data: loadFixtureZip('react-ts-app').toString('base64'),
      }
      const res = await POST({ json: async () => body } as any)
      const result = (await res.json()).result

      expect(validateAIResult(result).errors).toEqual([])
    }
  )
})

// shown when the live test is skipped
describe.skipIf(HAS_CREDS)('watsonx live smoke test', () => {
  it.skip('skipped — set WATSONX_API_KEY and WATSONX_PROJECT_ID to enable', () => {})
})
