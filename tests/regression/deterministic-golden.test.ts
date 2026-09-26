// Snapshot tests for generateDeterministicAnalysis.
// If a change is intended, update snapshots with: npx vitest -u

import { describe, it, expect } from 'vitest'
import {
  generateDeterministicAnalysis,
  type RiskFinding,
  type SystemSnapshot,
} from '@/lib/analysis'

function makeFinding(
  category: RiskFinding['category'],
  severity: RiskFinding['severity'],
  file: string,
  line: number
): RiskFinding {
  return {
    category,
    severity,
    file,
    line,
    evidence: `evidence for ${category} at ${file}:${line}`,
    description: `${category} finding`,
  }
}

function makeSnapshot(findings: RiskFinding[], folders: string[] = ['golden-project']): SystemSnapshot {
  return {
    project_name: 'golden-project',
    project_summary: 'Backend JavaScript service with 6 code files',
    stack: ['React', 'Node.js'],
    entry_points: ['golden-project/server.js'],
    folder_structure: {
      folders,
      key_files: ['golden-project/package.json'],
    },
    dependency_graph: { nodes: [], relationships: [] },
    findings,
    file_stats: {
      total_files: 8,
      code_files: 6,
      config_files: 2,
      size_kb: '50.0',
    },
  }
}

const CASES: { name: string; snapshot: SystemSnapshot }[] = [
  {
    name: 'clean',
    snapshot: makeSnapshot([]),
  },
  {
    name: 'one-secret',
    snapshot: makeSnapshot([
      makeFinding('hardcoded_secret', 'high', 'golden-project/config.js', 4),
    ]),
  },
  {
    name: 'mixed-three-categories',
    snapshot: makeSnapshot(
      [
        makeFinding('hardcoded_secret', 'high', 'golden-project/auth/config.js', 12),
        makeFinding('dynamic_code_exec', 'high', 'golden-project/server.js', 8),
        makeFinding('insecure_http', 'medium', 'golden-project/api/client.js', 22),
      ],
      ['golden-project', 'golden-project/auth', 'golden-project/api']
    ),
  },
  {
    name: 'many-secrets-critical',
    snapshot: makeSnapshot([
      makeFinding('hardcoded_secret', 'high', 'golden-project/a.js', 1),
      makeFinding('hardcoded_secret', 'high', 'golden-project/b.js', 1),
      makeFinding('hardcoded_secret', 'high', 'golden-project/c.js', 1),
      makeFinding('hardcoded_secret', 'high', 'golden-project/d.js', 1),
    ]),
  },
]

describe('generateDeterministicAnalysis snapshots', () => {
  for (const { name, snapshot } of CASES) {
    it(`${name} is unchanged`, () => {
      expect(generateDeterministicAnalysis(snapshot)).toMatchSnapshot()
    })
  }
})
