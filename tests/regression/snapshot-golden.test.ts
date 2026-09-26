// Snapshot tests for buildSystemSnapshot - catches accidental changes.
// If a change is intended, update snapshots with: npx vitest -u

import { describe, it, expect } from 'vitest'
import { buildSystemSnapshot } from '@/lib/analysis'
import { loadFixtureZip, FIXTURE_FILE_SIZE } from '../helpers/load-fixture'

const FIXTURES = ['minimal-node', 'react-ts-app', 'risky-secrets']

describe('buildSystemSnapshot snapshots', () => {
  for (const name of FIXTURES) {
    it(`${name} snapshot is unchanged`, () => {
      const snapshot = buildSystemSnapshot(loadFixtureZip(name), FIXTURE_FILE_SIZE)
      expect(snapshot).toMatchSnapshot()
    })
  }
})
