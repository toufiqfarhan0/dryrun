// Tests for the /api/analyze route. The network call is mocked, so the live
// watsonx API is never used here.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/analyze/route'
import { validateAIResult } from '../helpers/ai-result-schema'
import {
  loadFixtureZip,
  loadWatsonResponse,
  wrapWatsonChatResponse,
} from '../helpers/load-fixture'

// fake request - the route only calls request.json()
function request(body: unknown) {
  return { json: async () => body } as any
}

function analyzeBody(fixture: string) {
  return {
    fileSize: '5.0',
    base64Data: loadFixtureZip(fixture).toString('base64'),
  }
}

async function resultOf(res: { json: () => Promise<any> }) {
  return (await res.json()).result
}

beforeEach(() => {
  // the route logs a lot, mute it
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('POST /api/analyze - no credentials', () => {
  it('returns a valid AIResult with correct _meta', async () => {
    vi.stubEnv('WATSONX_API_KEY', '')

    const res = await POST(request(analyzeBody('minimal-node')))
    const result = await resultOf(res)

    expect(validateAIResult(result).errors).toEqual([])
    expect(result._meta.usedWatson).toBe(false)
    expect(result._meta.detectedStack).toEqual(['JavaScript', 'Node.js'])
    expect(result._meta.totalFiles).toBe(2)
  })

  it('returns deterministic analysis when watsonx is unavailable', async () => {
    vi.stubEnv('WATSONX_API_KEY', '')

    const res = await POST(request(analyzeBody('risky-secrets')))
    const result = await resultOf(res)

    expect(result.issues.length).toBeGreaterThan(0)
    expect(result.issues[0]).toEqual(
      expect.objectContaining({
        type: expect.any(String),
        severity: expect.any(String),
        description: expect.any(String),
        impact: expect.any(String),
      })
    )
    expect(result.issues[0].title).toBeUndefined()
    expect(result._meta.usedWatson).toBe(false)
  })

  it('rejects invalid zip uploads with a clear parse error', async () => {
    vi.stubEnv('WATSONX_API_KEY', '')

    const res = await POST(request({
      fileSize: '0.1',
      base64Data: Buffer.from('not a zip').toString('base64'),
    }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('Uploaded zip could not be parsed')
  })
})

describe('POST /api/analyze - watsonx success (mocked)', () => {
  it('uses the watsonx result when the API responds with valid JSON', async () => {
    vi.stubEnv('WATSONX_API_KEY', 'fake-key')
    vi.stubEnv('WATSONX_PROJECT_ID', 'fake-project')
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).includes('iam.cloud.ibm.com')) {
          return { ok: true, json: async () => ({ access_token: 'fake-token' }) }
        }
        return { ok: true, json: async () => wrapWatsonChatResponse(loadWatsonResponse('valid')) }
      })
    )

    const res = await POST(request(analyzeBody('minimal-node')))
    const result = await resultOf(res)

    expect(result._meta.usedWatson).toBe(true)
    expect(result.risk_score).toBe(72)
    expect(validateAIResult(result).errors).toEqual([])
  })
})

describe('POST /api/analyze - watsonx failure (mocked)', () => {
  it('falls back to deterministic analysis when the watsonx call fails', async () => {
    vi.stubEnv('WATSONX_API_KEY', 'fake-key')
    vi.stubEnv('WATSONX_PROJECT_ID', 'fake-project')
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).includes('iam.cloud.ibm.com')) {
          return { ok: true, json: async () => ({ access_token: 'fake-token' }) }
        }
        return { ok: false, status: 500, text: async () => 'internal error' }
      })
    )

    const res = await POST(request(analyzeBody('minimal-node')))
    const result = await resultOf(res)

    expect(result._meta.usedWatson).toBe(false) // fell back
    expect(validateAIResult(result).errors).toEqual([])
  })

  it('falls back to deterministic analysis when IAM authentication fails', async () => {
    vi.stubEnv('WATSONX_API_KEY', 'fake-key')
    vi.stubEnv('WATSONX_PROJECT_ID', 'fake-project')
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).includes('iam.cloud.ibm.com')) {
          return { ok: false, status: 401, text: async () => 'unauthorized' }
        }
        return { ok: true, json: async () => wrapWatsonChatResponse(loadWatsonResponse('valid')) }
      })
    )

    const res = await POST(request(analyzeBody('minimal-node')))
    const result = await resultOf(res)

    expect(result._meta.usedWatson).toBe(false)
    expect(validateAIResult(result).errors).toEqual([])
  })

  // note: the route only checks risk_score, not the rest of the shape
  it.todo('rejects or repairs watsonx JSON that is missing required fields')

  // TODO: test when watsonx returns plain text instead of JSON
  it.todo('falls back when watsonx returns unparseable text')
})
