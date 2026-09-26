#!/usr/bin/env node
// Runs the tests and writes a short summary to accuracy-report.json.
// Run with: npm run test:accuracy

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const RAW = join(REPO_ROOT, 'accuracy-report.raw.json')
const OUT = join(REPO_ROOT, 'accuracy-report.json')

const LAYERS = [
  { key: 'unit', label: 'Unit (per-function exact match)', match: /[\\/]tests[\\/]unit[\\/]/ },
  { key: 'integration', label: 'Integration (pipeline + contract)', match: /[\\/]tests[\\/]integration[\\/]/ },
  { key: 'regression', label: 'Regression (golden snapshots)', match: /[\\/]tests[\\/]regression[\\/]/ },
]

console.log('▶ Running accuracy suite (vitest)...\n')

const vitest = spawnSync(
  'npx',
  ['vitest', 'run', '--reporter=json', `--outputFile=${RAW}`],
  { cwd: REPO_ROOT, shell: true, stdio: ['ignore', 'ignore', 'inherit'] }
)

if (!existsSync(RAW)) {
  console.error('✖ Vitest produced no JSON report. Is vitest installed (npm install)?')
  process.exit(vitest.status ?? 1)
}

const report = JSON.parse(readFileSync(RAW, 'utf8'))
rmSync(RAW, { force: true })

function layerOf(filePath) {
  return LAYERS.find((l) => l.match.test(filePath))?.key ?? 'other'
}

const summary = {
  generatedAt: new Date().toISOString(),
  totals: { passed: 0, failed: 0, skippedOrTodo: 0 },
  layers: {},
  failures: [],
}
for (const l of LAYERS) summary.layers[l.key] = { passed: 0, failed: 0, skippedOrTodo: 0 }

for (const file of report.testResults ?? []) {
  const layer = layerOf(file.name)
  const bucket = summary.layers[layer] ?? summary.layers.regression
  for (const t of file.assertionResults ?? []) {
    if (t.status === 'passed') {
      bucket.passed++
      summary.totals.passed++
    } else if (t.status === 'failed') {
      bucket.failed++
      summary.totals.failed++
      summary.failures.push(`${file.name} › ${t.fullName ?? t.title}`)
    } else {
      bucket.skippedOrTodo++
      summary.totals.skippedOrTodo++
    }
  }
}

summary.pass = summary.totals.failed === 0

writeFileSync(OUT, JSON.stringify(summary, null, 2) + '\n')

// ── Console table ──
const pad = (s, n) => String(s).padEnd(n)
const padN = (s, n) => String(s).padStart(n)
console.log('\n  ACCURACY REPORT')
console.log('  ' + '-'.repeat(64))
console.log('  ' + pad('Layer', 38) + padN('Pass', 7) + padN('Fail', 7) + padN('Todo', 7))
console.log('  ' + '-'.repeat(64))
for (const l of LAYERS) {
  const s = summary.layers[l.key]
  console.log('  ' + pad(l.label, 38) + padN(s.passed, 7) + padN(s.failed, 7) + padN(s.skippedOrTodo, 7))
}
console.log('  ' + '-'.repeat(64))
const t = summary.totals
console.log('  ' + pad('TOTAL', 38) + padN(t.passed, 7) + padN(t.failed, 7) + padN(t.skippedOrTodo, 7))
console.log('  ' + '-'.repeat(64))

if (summary.failures.length) {
  console.log('\n  FAILURES:')
  for (const f of summary.failures) console.log('   ✖ ' + f)
}
console.log(`\n${summary.pass ? '✔ PASS' : '✖ FAIL'} — full report written to accuracy-report.json\n`)

process.exit(summary.pass ? 0 : 1)
