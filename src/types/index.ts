export type RiskLevel = 'ok' | 'warn' | 'danger'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type IssueType = 'performance' | 'security' | 'architecture'
export type EventType = 'normal' | 'warn' | 'danger'
export type Screen = 'upload' | 'processing' | 'dashboard'
export type StatusType = 'IDLE' | 'ANALYZING' | 'ACTIVE' | 'DEGRADING' | 'CRITICAL FAILURE'

export interface Module {
  name: string
  risk: RiskLevel
  files: number
  x?: number
  y?: number
}

export interface Issue {
  type: IssueType
  severity: Severity
  description: string
  impact: string
}

export interface SimulationEvent {
  time: string
  event: string
  type: EventType
}

export interface AIResult {
  projectName?: string
  stack?: string[]
  modules?: Module[]
  risk_score: number
  summary: string
  issues: Issue[]
  simulation: SimulationEvent[]
}

export interface ProjectData {
  projectName: string
  modules: Module[]
  stack: string[]
  aiResult: AIResult
}

export interface StatusConfig {
  text: StatusType
  color: string
}
