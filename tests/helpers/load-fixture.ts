// Helpers for loading test fixtures.
// Zip fixtures are kept as plain folders and zipped in memory here.

import AdmZip from 'adm-zip'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, sep } from 'node:path'

const HELPERS_DIR = dirname(fileURLToPath(import.meta.url))
const FIXTURES_DIR = join(HELPERS_DIR, '..', 'fixtures')

// fileSize passed to buildSystemSnapshot in tests (just echoed into size_kb)
export const FIXTURE_FILE_SIZE = '12.5'

// list every file under dir, sorted, so the zip order is always the same
function listFilesSorted(dir: string): string[] {
  const out: string[] = []
  const walk = (current: string) => {
    for (const name of readdirSync(current)) {
      const full = join(current, name)
      if (statSync(full).isDirectory()) walk(full)
      else out.push(full)
    }
  }
  walk(dir)
  return out.sort()
}

// build a zip in memory from the folder tests/fixtures/zips/<name>
export function loadFixtureZip(name: string): Buffer {
  const root = join(FIXTURES_DIR, 'zips', name)
  const zip = new AdmZip()
  for (const file of listFilesSorted(root)) {
    const rel = relative(root, file).split(sep).join('/')
    zip.addFile(`${name}/${rel}`, readFileSync(file))
  }
  return zip.toBuffer()
}

// build a zip in memory from a {path: content} map
export function buildZip(topName: string, files: Record<string, string | Buffer>): Buffer {
  const zip = new AdmZip()
  for (const rel of Object.keys(files).sort()) {
    const content = files[rel]
    zip.addFile(
      `${topName}/${rel}`,
      Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8')
    )
  }
  return zip.toBuffer()
}

// load the expected snapshot for a zip fixture
export function loadExpectedSnapshot(name: string): any {
  const raw = readFileSync(join(FIXTURES_DIR, 'zips', `${name}.expected.json`), 'utf8')
  return JSON.parse(raw)
}

// load a recorded watsonx response (the raw model text)
export function loadWatsonResponse(name: string): string {
  return readFileSync(join(FIXTURES_DIR, 'watson-responses', `${name}.txt`), 'utf8')
}

// wrap model text the way the watsonx API would return it
export function wrapWatsonChatResponse(modelText: string): unknown {
  return { choices: [{ message: { content: modelText } }] }
}
