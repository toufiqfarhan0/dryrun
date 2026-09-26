// Static analysis pipeline used by the /api/analyze route.
// Detects risk signals from uploaded zip content and produces a deterministic
// fallback analysis that mirrors the Watson contract.

import AdmZip from 'adm-zip'

export function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export type FindingCategory = 'hardcoded_secret' | 'dynamic_code_exec' | 'insecure_http'
export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface RiskFinding {
  category: FindingCategory
  severity: FindingSeverity
  file: string
  line: number
  evidence: string
  description: string
}

export interface SystemSnapshot {
  project_name: string
  project_summary: string
  stack: string[]
  entry_points: string[]
  folder_structure: {
    folders: string[]
    key_files: string[]
  }
  dependency_graph: {
    nodes: string[]
    relationships: string[]
  }
  findings: RiskFinding[]
  file_stats: {
    total_files: number
    code_files: number
    config_files: number
    size_kb: string
  }
}

const SKIP_CONTENT_EXTENSIONS = new Set([
  'md', 'markdown', 'rst', 'adoc', 'txt',
  'svg', 'xml', 'html', 'htm', 'css', 'scss', 'less',
  'png', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'bmp',
  'lock', 'log', 'csv', 'tsv',
])

const NOISE_SEGMENTS = new Set([
  'node_modules', 'dist', 'build', '.git', '__pycache__',
  'venv', '.venv', '.next', 'coverage', '.turbo', '.cache',
])

function hasNoiseSegment(path: string): boolean {
  return path.split('/').some(segment => NOISE_SEGMENTS.has(segment))
}

function isTestFile(path: string): boolean {
  const lower = path.toLowerCase()
  if (/(^|\/)(tests?|__tests__|spec|specs)\//.test(lower)) return true
  if (/\.(test|spec)\.[a-z0-9]+$/.test(lower)) return true
  return false
}

const PLACEHOLDER_VALUE = /^(your[_-]|change[_-]?me|placeholder|example|todo|xxx+|\.{3,}|<.*>|\{\{.*\}\}|sample|dummy|fake|n\/?a)/i
const COMMON_TRIVIAL_SECRETS = new Set([
  'password', 'pass', 'pwd', '123456', '12345678', '1234567890',
  'admin', 'root', 'qwerty', 'letmein', 'welcome', 'default',
  'test', 'foo', 'bar', 'baz', 'string', 'value',
])
const ENV_REFERENCE = /process\.env\.|os\.environ|System\.getenv|getenv\(|\$\{|\$\(/i
// Matches identifiers that contain a credential keyword as a real word/segment.
// Allows JWT_SECRET, CLIENT_SECRET, myApiKey, etc. (\w* captures any surrounding
// snake_case or camelCase segments). String-literal detection is separated out
// so we can also catch `IDENT || 'literal'` fallback patterns.
const CREDENTIAL_IDENT = /\b(\w*(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?key|private[_-]?key|auth[_-]?key|token|client[_-]?secret)\w*)\b/i
const STRING_LITERAL = /['"`]([^'"`\n]{4,})['"`]/g
const HASH_INDICATOR = /(^|[_-])hash($|[_-]|[A-Z])|hashed/i

// Identifier suffixes that mean this is a description of a credential, not the
// credential itself (e.g. password_hash, api_key_id).
const SAFE_KEY_SUFFIX = /(_|-)(hash|hashed|digest|salt|id|name|type|field|column|header|param|placeholder|example|input|label|prompt|count|length|len|max|min)$/i

const HTTP_URL = /https?:\/\/[^\s'"`<>)]+/g

const SAFE_HTTP_HOST_PATTERNS = [
  /^http:\/\/localhost(:|\/|$)/i,
  /^http:\/\/127\.0\.0\.1(:|\/|$)/i,
  /^http:\/\/0\.0\.0\.0(:|\/|$)/i,
  /^http:\/\/\[::1\](:|\/|$)/i,
  /^http:\/\/10\./,
  /^http:\/\/192\.168\./,
  /^http:\/\/172\.(1[6-9]|2\d|3[01])\./,
  /^http:\/\/[a-z0-9.-]+\.local(:|\/|$)/i,
  /^http:\/\/[a-z0-9.-]+\.internal(:|\/|$)/i,
  /^http:\/\/(www\.)?w3\.org\//i,
  /^http:\/\/(www\.)?schema\.org\//i,
  /^http:\/\/purl\.org\//i,
  /^http:\/\/xmlns\.com\//i,
  /^http:\/\/[a-z0-9.-]+\.w3\.org\//i,
]

function isSafeHttpUrl(url: string): boolean {
  return SAFE_HTTP_HOST_PATTERNS.some(pattern => pattern.test(url))
}

function isCommentLine(line: string): boolean {
  const trimmed = line.trimStart()
  return (
    trimmed.startsWith('//') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('<!--') ||
    trimmed.startsWith('--')
  )
}

function looksLikeRealSecret(value: string): boolean {
  if (value.length < 4) return false
  if (PLACEHOLDER_VALUE.test(value)) return false
  if (COMMON_TRIVIAL_SECRETS.has(value.toLowerCase())) return false
  if (!/[a-zA-Z]/.test(value)) return false
  if (value.includes(' ')) return false
  // Require digits, special chars, or unusual length. Pure mixed-case letter
  // strings (like class names "TokenExpiredError") are excluded so they don't
  // produce false positives when used as comparison values.
  const hasDigit = /\d/.test(value)
  const hasSpecial = /[^a-zA-Z0-9]/.test(value)
  return hasDigit || hasSpecial || value.length >= 24
}

export function detectRisks(content: string, path: string): RiskFinding[] {
  const findings: RiskFinding[] = []
  const ext = path.split('.').pop()?.toLowerCase() ?? ''

  if (SKIP_CONTENT_EXTENSIONS.has(ext)) return findings
  if (isTestFile(path)) return findings

  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const lineNum = i + 1

    if (isCommentLine(rawLine)) continue
    if (ENV_REFERENCE.test(rawLine)) {
      // Strip env-reference portions before checking for hardcoded literals.
      // A line like `password: process.env.X || 'literal'` would otherwise
      // be skipped entirely; instead, fall through with the env part removed.
      const stripped = rawLine.replace(/(process\.env\.\w+|os\.environ(\.get)?\([^)]*\)|System\.getenv\([^)]*\)|getenv\([^)]*\))/g, 'ENV')
      detectInLine(stripped, path, lineNum, findings)
      continue
    }

    detectInLine(rawLine, path, lineNum, findings)
  }

  return findings
}

function detectInLine(line: string, path: string, lineNum: number, findings: RiskFinding[]): void {
  // 1. Hardcoded credentials
  //
  // A line is suspicious if it contains a credential-like identifier AND a
  // string literal that looks like a real secret. This catches both direct
  // assignment (`password = "abc"`) and fallback (`SECRET = env || "abc"`).
  const identMatch = line.match(CREDENTIAL_IDENT)
  if (identMatch) {
    const ident = identMatch[1]
    const safeSuffix = SAFE_KEY_SUFFIX.test(ident) || HASH_INDICATOR.test(ident)
    if (!safeSuffix) {
      const literals = line.match(STRING_LITERAL) || []
      for (const lit of literals) {
        const value = lit.slice(1, -1)
        if (looksLikeRealSecret(value)) {
          // Pick a human-readable label from the matched credential keyword.
          const keywordMatch = ident.toLowerCase().match(/(password|passwd|pwd|secret|api[_-]?key|access[_-]?key|private[_-]?key|auth[_-]?key|token|client[_-]?secret)/)
          const label = (keywordMatch?.[1] ?? 'credential').replace(/[_-]/g, ' ')
          findings.push({
            category: 'hardcoded_secret',
            severity: 'high',
            file: path,
            line: lineNum,
            evidence: truncate(line.trim(), 160),
            description: `Hardcoded ${label} literal`,
          })
          break // one finding per line
        }
      }
    }
  }

  // 2. Dynamic code execution
  // Word boundary on the left prevents safeEval/safeExec from matching.
  if (/(^|[^a-zA-Z0-9_$.])eval\s*\(/.test(line) || /(^|[^a-zA-Z0-9_$.])exec\s*\(/.test(line)) {
    const which = /eval\s*\(/.test(line) ? 'eval' : 'exec'
    findings.push({
      category: 'dynamic_code_exec',
      severity: 'high',
      file: path,
      line: lineNum,
      evidence: truncate(line.trim(), 160),
      description: `Use of ${which}() — dynamic code execution`,
    })
  }

  // 3. Insecure HTTP URLs
  const urls = line.match(HTTP_URL)
  if (urls) {
    for (const url of urls) {
      if (!url.toLowerCase().startsWith('http://')) continue
      if (isSafeHttpUrl(url)) continue
      findings.push({
        category: 'insecure_http',
        severity: 'medium',
        file: path,
        line: lineNum,
        evidence: truncate(url, 120),
        description: `Insecure HTTP URL: ${truncate(url, 80)}`,
      })
      break // one finding per line
    }
  }
}

function truncate(str: string, limit: number): string {
  return str.length <= limit ? str : str.slice(0, limit - 1) + '…'
}

export function buildSystemSnapshot(buffer: Buffer, fileSize: string): SystemSnapshot {
  const zip = new AdmZip(buffer)
  const entries = zip.getEntries()

  const snapshot: SystemSnapshot = {
    project_name: 'uploaded-project',
    project_summary: '',
    stack: [],
    entry_points: [],
    folder_structure: { folders: [], key_files: [] },
    dependency_graph: { nodes: [], relationships: [] },
    findings: [],
    file_stats: {
      total_files: 0,
      code_files: 0,
      config_files: 0,
      size_kb: fileSize,
    },
  }

  const filesByType: Record<string, string[]> = {}
  const folders = new Set<string>()
  const imports: Record<string, string[]> = {}

  entries.forEach(entry => {
    const path = entry.entryName

    if (hasNoiseSegment(path)) return

    if (entry.isDirectory) {
      folders.add(path)
      return
    }

    snapshot.file_stats.total_files++

    const parts = path.split('/')
    if (parts.length > 1) {
      folders.add(parts.slice(0, -1).join('/'))
    }

    const ext = path.split('.').pop()?.toLowerCase() || ''
    if (!filesByType[ext]) filesByType[ext] = []
    filesByType[ext].push(path)

    const filename = parts[parts.length - 1].toLowerCase()
    if (['index.js', 'index.ts', 'main.py', 'app.py', 'server.js', 'app.js', 'main.ts', 'app.tsx'].includes(filename)) {
      snapshot.entry_points.push(path)
    }

    if (['package.json', 'requirements.txt', 'pom.xml', 'build.gradle', 'cargo.toml', '.env', 'config.json', 'tsconfig.json'].includes(filename)) {
      snapshot.folder_structure.key_files.push(path)
      snapshot.file_stats.config_files++
    }

    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'kt', 'rs', 'go', 'rb'].includes(ext)) {
      snapshot.file_stats.code_files++
    }

    try {
      const content = entry.getData().toString('utf8')

      const importMatches = content.match(/import .+ from ['"](.+)['"]/g) || []
      const requireMatches = content.match(/require\(['"](.+)['"]\)/g) || []
      if (importMatches.length > 0 || requireMatches.length > 0) {
        imports[path] = [...importMatches, ...requireMatches]
      }

      for (const finding of detectRisks(content, path)) {
        snapshot.findings.push(finding)
      }
    } catch {
      // Skip files we can't decode as UTF-8 (binary).
    }
  })

  if (entries.length > 0) {
    snapshot.project_name = entries[0].entryName.split('/')[0] || 'uploaded-project'
  }

  const stackSet = new Set<string>()
  if (filesByType['tsx'] || filesByType['jsx']) stackSet.add('React')
  if (filesByType['vue']) stackSet.add('Vue')
  if (filesByType['py']) stackSet.add('Python')
  if (filesByType['java']) stackSet.add('Java')
  if (filesByType['kt']) stackSet.add('Kotlin')
  if (filesByType['rs']) stackSet.add('Rust')
  if (filesByType['go']) stackSet.add('Go')
  if (filesByType['ts'] || filesByType['js']) stackSet.add('JavaScript')
  if (snapshot.folder_structure.key_files.some(f => f.includes('package.json'))) stackSet.add('Node.js')
  if (snapshot.folder_structure.key_files.some(f => f.includes('requirements.txt'))) stackSet.add('Python')
  if (snapshot.folder_structure.key_files.some(f => f.includes('pom.xml'))) stackSet.add('Maven')
  snapshot.stack = Array.from(stackSet)

  snapshot.folder_structure.folders = Array.from(folders).slice(0, 20)

  Object.keys(imports).slice(0, 15).forEach(file => {
    snapshot.dependency_graph.nodes.push(file)
  })
  Object.entries(imports).slice(0, 10).forEach(([file, deps]) => {
    deps.slice(0, 3).forEach(dep => {
      snapshot.dependency_graph.relationships.push(`${file} → ${dep}`)
    })
  })

  const primaryStack = snapshot.stack[0] || 'Unknown'
  const hasBackend = snapshot.entry_points.some(e => e.includes('server') || e.includes('api'))
  const hasFrontend = snapshot.entry_points.some(e => e.includes('app') || e.includes('index'))
  if (hasBackend && hasFrontend) {
    snapshot.project_summary = `Full-stack ${primaryStack} application with ${snapshot.file_stats.code_files} code files`
  } else if (hasBackend) {
    snapshot.project_summary = `Backend ${primaryStack} service with ${snapshot.file_stats.code_files} code files`
  } else if (hasFrontend) {
    snapshot.project_summary = `Frontend ${primaryStack} application with ${snapshot.file_stats.code_files} code files`
  } else {
    snapshot.project_summary = `${primaryStack} project with ${snapshot.file_stats.code_files} code files`
  }

  return snapshot
}

const SEVERITY_WEIGHT: Record<FindingSeverity, number> = {
  low: 3,
  medium: 8,
  high: 15,
  critical: 25,
}

export function generateDeterministicRiskScore(findings: RiskFinding[]): number {
  if (findings.length === 0) return 0
  let score = 0
  for (const f of findings) score += SEVERITY_WEIGHT[f.severity]
  return Math.min(score, 95)
}

interface DeterministicIssue {
  type: 'performance' | 'security' | 'architecture'
  severity: FindingSeverity
  description: string
  impact: string
}

interface DeterministicSimulationEvent {
  time: string
  event: string
  type: 'normal' | 'warn' | 'danger'
}

interface DeterministicModule {
  name: string
  risk: 'ok' | 'warn' | 'danger'
  files: number
}

function buildIssuesFromFindings(findings: RiskFinding[]): DeterministicIssue[] {
  const groups: Record<FindingCategory, RiskFinding[]> = {
    hardcoded_secret: [],
    dynamic_code_exec: [],
    insecure_http: [],
  }
  for (const f of findings) groups[f.category].push(f)

  const issues: DeterministicIssue[] = []

  if (groups.hardcoded_secret.length > 0) {
    const items = groups.hardcoded_secret
    const locations = items
      .slice(0, 3)
      .map(f => `${f.file}:${f.line}`)
      .join(', ')
    issues.push({
      type: 'security',
      severity: items.length >= 3 ? 'critical' : 'high',
      description:
        `Hardcoded credential${items.length > 1 ? 's' : ''} detected in ${items.length} location${items.length > 1 ? 's' : ''}: ${locations}${items.length > 3 ? ', ...' : ''}.`,
      impact:
        'Credentials in source can leak through git history, public mirrors, logs, or build artifacts. Rotate any exposed values and move them to environment variables or a secrets manager.',
    })
  }

  if (groups.dynamic_code_exec.length > 0) {
    const items = groups.dynamic_code_exec
    const locations = items
      .slice(0, 3)
      .map(f => `${f.file}:${f.line}`)
      .join(', ')
    issues.push({
      type: 'security',
      severity: 'high',
      description:
        `Use of eval/exec detected in ${items.length} location${items.length > 1 ? 's' : ''}: ${locations}${items.length > 3 ? ', ...' : ''}.`,
      impact:
        'Dynamic code execution becomes a remote code execution vulnerability if any user-controlled input can reach it. Replace with safer alternatives (e.g. JSON.parse, lookup tables, sandboxed evaluators).',
    })
  }

  if (groups.insecure_http.length > 0) {
    const items = groups.insecure_http
    const locations = items
      .slice(0, 3)
      .map(f => `${f.file}:${f.line}`)
      .join(', ')
    issues.push({
      type: 'security',
      severity: 'medium',
      description:
        `Plaintext HTTP URL${items.length > 1 ? 's' : ''} found in ${items.length} location${items.length > 1 ? 's' : ''}: ${locations}${items.length > 3 ? ', ...' : ''}.`,
      impact:
        'HTTP traffic can be intercepted or modified by anything on the network path. Switch the affected endpoints to HTTPS.',
    })
  }

  return issues
}

function buildSimulationFromFindings(findings: RiskFinding[], score: number): DeterministicSimulationEvent[] {
  if (findings.length === 0) {
    return [
      { time: 'T+0s', event: 'System initialized — no risk signals detected by static analysis.', type: 'normal' },
      { time: 'T+5m', event: 'Operating within expected parameters.', type: 'normal' },
      { time: 'T+1h', event: 'No anomalies observed during sustained operation.', type: 'normal' },
    ]
  }

  const events: DeterministicSimulationEvent[] = [
    { time: 'T+0s', event: 'System initialized.', type: 'normal' },
  ]

  const hasSecret = findings.some(f => f.category === 'hardcoded_secret')
  const hasEval = findings.some(f => f.category === 'dynamic_code_exec')
  const hasHttp = findings.some(f => f.category === 'insecure_http')

  if (hasSecret) {
    events.push({
      time: 'T+5m',
      event: 'Credential exposure risk active — hardcoded secrets remain reachable through source artifacts.',
      type: 'warn',
    })
    if (score >= 50) {
      events.push({
        time: 'T+1h',
        event: 'A repository or log leak would immediately expose production credentials.',
        type: 'danger',
      })
    }
  }
  if (hasEval) {
    events.push({
      time: 'T+10m',
      event: 'Dynamic code execution paths reachable — any input that flows here becomes an RCE surface.',
      type: 'warn',
    })
  }
  if (hasHttp) {
    events.push({
      time: 'T+15m',
      event: 'Plaintext HTTP traffic in use — vulnerable to interception on untrusted networks.',
      type: 'warn',
    })
  }

  if (score >= 60) {
    events.push({
      time: 'T+24h',
      event: 'Without remediation, the combined risks above materially raise the chance of a security incident in production.',
      type: 'danger',
    })
  }

  return events
}

function buildModulesFromSnapshot(snapshot: SystemSnapshot, findings: RiskFinding[]): DeterministicModule[] {
  const moduleNames = new Set<string>()
  for (const folder of snapshot.folder_structure.folders) {
    const parts = folder.split('/').filter(Boolean)
    if (parts.length >= 2 && parts[1]) moduleNames.add(parts[1])
  }

  if (moduleNames.size === 0) {
    return [
      {
        name: snapshot.project_name || 'Main',
        risk: findings.length === 0 ? 'ok' : findings.some(f => f.severity === 'high' || f.severity === 'critical') ? 'danger' : 'warn',
        files: snapshot.file_stats.total_files,
      },
    ]
  }

  const totalFiles = snapshot.file_stats.total_files
  const perModule = moduleNames.size > 0 ? Math.max(1, Math.round(totalFiles / moduleNames.size)) : totalFiles

  const modules: DeterministicModule[] = []
  for (const name of moduleNames) {
    const modFindings = findings.filter(f => f.file.includes(`/${name}/`))
    const risk: DeterministicModule['risk'] =
      modFindings.length === 0
        ? 'ok'
        : modFindings.some(f => f.severity === 'high' || f.severity === 'critical')
        ? 'danger'
        : 'warn'
    modules.push({ name, risk, files: perModule })
  }
  return modules
}

function buildSummaryFromFindings(snapshot: SystemSnapshot, findings: RiskFinding[], score: number): string {
  const project = snapshot.project_name
  const fileCount = snapshot.file_stats.total_files
  const sizeKb = snapshot.file_stats.size_kb

  if (findings.length === 0) {
    return `Static analysis of ${project} (${fileCount} files, ${sizeKb} KB) found no risk signals. The codebase is clean of obvious credential leaks, dynamic-code-execution paths, and plaintext-HTTP usage. Static analysis cannot verify runtime behavior, business-logic correctness, or architectural quality.`
  }

  const band = score >= 70 ? 'high' : score >= 40 ? 'moderate' : 'low'
  const cats = Array.from(new Set(findings.map(f => f.category))).join(', ')
  return `Static analysis of ${project} (${fileCount} files, ${sizeKb} KB) detected ${findings.length} risk signal${findings.length > 1 ? 's' : ''} (${cats}), indicating ${band} deployment risk. Address the issues below before promoting this build.`
}

export function generateDeterministicAnalysis(snapshot: SystemSnapshot): {
  projectName: string
  stack: string[]
  modules: DeterministicModule[]
  risk_score: number
  summary: string
  issues: DeterministicIssue[]
  simulation: DeterministicSimulationEvent[]
} {
  const findings = snapshot.findings
  const risk_score = generateDeterministicRiskScore(findings)
  const issues = buildIssuesFromFindings(findings)
  const simulation = buildSimulationFromFindings(findings, risk_score)
  const modules = buildModulesFromSnapshot(snapshot, findings)
  const summary = buildSummaryFromFindings(snapshot, findings, risk_score)

  return {
    projectName: snapshot.project_name,
    stack: snapshot.stack,
    modules,
    risk_score,
    summary,
    issues,
    simulation,
  }
}

export function extractFirstJsonObject(generatedText: string): any {
  if (!generatedText || generatedText.trim().length < 10) {
    throw new Error('Empty response from Watson API')
  }

  let jsonText = generatedText.replace(/```json\s*/g, '').replace(/```\s*/g, '')

  const jsonMatches: string[] = []
  let depth = 0
  let startIdx = -1

  for (let i = 0; i < jsonText.length; i++) {
    if (jsonText[i] === '{') {
      if (depth === 0) startIdx = i
      depth++
    } else if (jsonText[i] === '}') {
      depth--
      if (depth === 0 && startIdx !== -1) {
        jsonMatches.push(jsonText.substring(startIdx, i + 1))
        startIdx = -1
      }
    }
  }

  if (jsonMatches.length === 0) {
    throw new Error('No valid JSON object found in response')
  }

  jsonText = jsonMatches[0].trim()
  return JSON.parse(jsonText)
}
