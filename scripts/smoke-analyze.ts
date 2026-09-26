// Smoke-test script: runs buildSystemSnapshot + generateDeterministicAnalysis
// on a zip file from disk and prints the result. Used to verify the analysis
// pipeline against the TestCases/*.zip fixtures.
//
// Usage: npx tsx scripts/smoke-analyze.ts TestCases/clean-test-project.zip

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  buildSystemSnapshot,
  generateDeterministicAnalysis,
} from '../src/lib/analysis'

const zipPath = process.argv[2]
if (!zipPath) {
  console.error('Usage: tsx scripts/smoke-analyze.ts <path-to-zip>')
  process.exit(1)
}

const buffer = readFileSync(resolve(zipPath))
const sizeKb = (buffer.length / 1024).toFixed(1)

const snapshot = buildSystemSnapshot(buffer, sizeKb)
const analysis = generateDeterministicAnalysis(snapshot)

console.log('=== SNAPSHOT ===')
console.log('Project:', snapshot.project_name)
console.log('Stack:', snapshot.stack.join(', '))
console.log('Total files:', snapshot.file_stats.total_files)
console.log('Findings:', snapshot.findings.length)
for (const f of snapshot.findings) {
  console.log(`  - [${f.severity}] ${f.category} @ ${f.file}:${f.line}`)
  console.log(`      ${f.evidence}`)
}

console.log('\n=== DETERMINISTIC ANALYSIS ===')
console.log('Risk score:', analysis.risk_score)
console.log('Summary:', analysis.summary)
console.log('Modules:', analysis.modules.map(m => `${m.name} (${m.risk})`).join(', '))
console.log('Issues:', analysis.issues.length)
for (const i of analysis.issues) {
  console.log(`  - [${i.severity}] ${i.type}: ${i.description}`)
}
console.log('Simulation:')
for (const e of analysis.simulation) {
  console.log(`  ${e.time} [${e.type}] ${e.event}`)
}
