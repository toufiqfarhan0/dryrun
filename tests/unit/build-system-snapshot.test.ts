// Tests for buildSystemSnapshot — checks known zips give the expected result
// (file counts, stack, entry points, findings).

import { describe, it, expect } from 'vitest'
import { buildSystemSnapshot } from '@/lib/analysis'
import {
  loadFixtureZip,
  loadExpectedSnapshot,
  buildZip,
  FIXTURE_FILE_SIZE,
} from '../helpers/load-fixture'

const FIXTURES = ['minimal-node', 'react-ts-app', 'risky-secrets']

describe('buildSystemSnapshot - known fixtures', () => {
  for (const name of FIXTURES) {
    it(`${name}: produces exactly the expected snapshot`, () => {
      const snapshot = buildSystemSnapshot(loadFixtureZip(name), FIXTURE_FILE_SIZE)
      expect(snapshot).toEqual(loadExpectedSnapshot(name))
    })
  }

  it('react-ts-app: detects the stack with no duplicates', () => {
    const { stack } = buildSystemSnapshot(loadFixtureZip('react-ts-app'), FIXTURE_FILE_SIZE)
    expect(stack).toEqual(['React', 'JavaScript', 'Node.js'])
    expect(new Set(stack).size).toBe(stack.length)
  })

  it('risky-secrets: flags hardcoded password, eval, and non-localhost http', () => {
    const { findings } = buildSystemSnapshot(loadFixtureZip('risky-secrets'), FIXTURE_FILE_SIZE)
    const categories = findings.map(f => f.category).sort()
    expect(categories).toEqual(['dynamic_code_exec', 'hardcoded_secret', 'insecure_http'])
  })

  it('risky-secrets: does NOT flag http://localhost', () => {
    const { findings } = buildSystemSnapshot(loadFixtureZip('risky-secrets'), FIXTURE_FILE_SIZE)
    expect(findings.some(f => f.file.endsWith('safe.js'))).toBe(false)
  })
})

describe('buildSystemSnapshot - finding precision', () => {
  it('does NOT flag form-field names like `const { password } = req.body`', () => {
    const zip = buildZip('app', {
      'login.js':
        "function login(req) {\n  const { email, password } = req.body\n  return authenticate(email, password)\n}\n",
    })
    const { findings } = buildSystemSnapshot(zip, FIXTURE_FILE_SIZE)
    expect(findings).toEqual([])
  })

  it('does NOT flag `password_hash` (a column name for a bcrypted value)', () => {
    const zip = buildZip('app', {
      'queries.js':
        "INSERT_USER = `INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, NOW())`\n",
    })
    const { findings } = buildSystemSnapshot(zip, FIXTURE_FILE_SIZE)
    expect(findings).toEqual([])
  })

  it('does NOT flag env-var lookups like process.env.DB_PASS', () => {
    const zip = buildZip('app', {
      'connection.js':
        "const config = { password: process.env.DB_PASS }\n",
    })
    const { findings } = buildSystemSnapshot(zip, FIXTURE_FILE_SIZE)
    expect(findings).toEqual([])
  })

  it('does NOT flag README discussions of secrets', () => {
    const zip = buildZip('app', {
      'README.md':
        "# How we handle secrets\nWe load JWT_SECRET from the environment. Never check in `api_key` values.\n",
    })
    const { findings } = buildSystemSnapshot(zip, FIXTURE_FILE_SIZE)
    expect(findings).toEqual([])
  })

  it('does NOT flag SVG/XML namespace URLs', () => {
    const zip = buildZip('app', {
      'icon.svg':
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"/>\n',
    })
    const { findings } = buildSystemSnapshot(zip, FIXTURE_FILE_SIZE)
    expect(findings).toEqual([])
  })

  it('does NOT flag commented-out eval() usage', () => {
    const zip = buildZip('app', {
      'safe.js': '// Don\'t use eval() — use Number() or JSON.parse() instead.\nfunction parse(x) { return Number(x) }\n',
    })
    const { findings } = buildSystemSnapshot(zip, FIXTURE_FILE_SIZE)
    expect(findings).toEqual([])
  })

  it('does NOT flag identifier-prefixed names like safeEval or executePlan', () => {
    const zip = buildZip('app', {
      'safe.js':
        'function safeEval(expr) { return Number(expr) }\nfunction executePlan(plan) { return plan.run() }\nsafeEval("1"); executePlan({ run: () => 1 })\n',
    })
    const { findings } = buildSystemSnapshot(zip, FIXTURE_FILE_SIZE)
    expect(findings).toEqual([])
  })

  it('DOES flag an actual hardcoded API key literal', () => {
    const zip = buildZip('app', {
      'config.js': "const api_key = 'sk_live_abc123def456ghi'\n",
    })
    const { findings } = buildSystemSnapshot(zip, FIXTURE_FILE_SIZE)
    expect(findings).toHaveLength(1)
    expect(findings[0].category).toBe('hardcoded_secret')
  })

  it('DOES flag an actual eval(input) call', () => {
    const zip = buildZip('app', {
      'server.js': 'function run(input) {\n  return eval(input)\n}\n',
    })
    const { findings } = buildSystemSnapshot(zip, FIXTURE_FILE_SIZE)
    expect(findings.some(f => f.category === 'dynamic_code_exec')).toBe(true)
  })

  it('DOES flag plaintext HTTP to a public host', () => {
    const zip = buildZip('app', {
      'client.js': "fetch('http://api.example.com/data')\n",
    })
    const { findings } = buildSystemSnapshot(zip, FIXTURE_FILE_SIZE)
    expect(findings.some(f => f.category === 'insecure_http')).toBe(true)
  })
})

describe('buildSystemSnapshot - edge cases', () => {
  it('excludes noise directories from all counts', () => {
    const zip = buildZip('noisy', {
      'app.js': "console.log('real code')",
      'node_modules/dep/index.js': "const password = 'should not flag'",
      '.next/cache/blob.js': 'cached',
    })
    const snapshot = buildSystemSnapshot(zip, FIXTURE_FILE_SIZE)
    expect(snapshot.file_stats.total_files).toBe(1)
    expect(snapshot.file_stats.code_files).toBe(1)
    expect(snapshot.findings.every(f => !f.file.includes('node_modules'))).toBe(true)
  })

  it('handles an empty archive without throwing', () => {
    const snapshot = buildSystemSnapshot(buildZip('empty', {}), FIXTURE_FILE_SIZE)
    expect(snapshot.file_stats.total_files).toBe(0)
    expect(snapshot.project_name).toBe('uploaded-project')
    expect(snapshot.project_summary).toBe('Unknown project with 0 code files')
  })
})
