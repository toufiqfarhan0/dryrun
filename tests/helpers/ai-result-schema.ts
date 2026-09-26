// Checks that an AIResult has the right shape and valid values.
// Used by the route and watsonx tests.

export const ISSUE_TYPES = ['performance', 'security', 'architecture'] as const
export const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const
export const EVENT_TYPES = ['normal', 'warn', 'danger'] as const
export const RISK_LEVELS = ['ok', 'warn', 'danger'] as const

// The prompt asks for short simulations (3-6 events). The validator stays
// permissive enough to accept longer recorded responses for backwards compat.
export const SIMULATION_EVENT_RANGE: readonly [number, number] = [1, 12]

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

// Returns { valid, errors }. errors lists every problem found.
export function validateAIResult(obj: unknown): ValidationResult {
  const errors: string[] = []

  if (!isPlainObject(obj)) {
    return { valid: false, errors: ['result is not an object'] }
  }

  // ── Required: risk_score ──
  if (typeof obj.risk_score !== 'number' || !Number.isFinite(obj.risk_score)) {
    errors.push('risk_score must be a finite number')
  } else if (obj.risk_score < 0 || obj.risk_score > 100) {
    errors.push(`risk_score ${obj.risk_score} is outside [0, 100]`)
  }

  // ── Required: summary ──
  if (typeof obj.summary !== 'string' || obj.summary.trim().length === 0) {
    errors.push('summary must be a non-empty string')
  }

  // ── Required: issues ──
  if (!Array.isArray(obj.issues)) {
    errors.push('issues must be an array')
  } else {
    obj.issues.forEach((issue, i) => {
      if (!isPlainObject(issue)) {
        errors.push(`issues[${i}] is not an object`)
        return
      }
      if (!ISSUE_TYPES.includes(issue.type as any)) {
        errors.push(`issues[${i}].type "${String(issue.type)}" not in {${ISSUE_TYPES.join(', ')}}`)
      }
      if (!SEVERITIES.includes(issue.severity as any)) {
        errors.push(`issues[${i}].severity "${String(issue.severity)}" not in {${SEVERITIES.join(', ')}}`)
      }
      if (typeof issue.description !== 'string') errors.push(`issues[${i}].description must be a string`)
      if (typeof issue.impact !== 'string') errors.push(`issues[${i}].impact must be a string`)
    })
  }

  // ── Required: simulation ──
  if (!Array.isArray(obj.simulation)) {
    errors.push('simulation must be an array')
  } else {
    if (obj.simulation.length === 0) errors.push('simulation is empty')
    obj.simulation.forEach((ev, i) => {
      if (!isPlainObject(ev)) {
        errors.push(`simulation[${i}] is not an object`)
        return
      }
      if (typeof ev.time !== 'string') errors.push(`simulation[${i}].time must be a string`)
      if (typeof ev.event !== 'string') errors.push(`simulation[${i}].event must be a string`)
      if (!EVENT_TYPES.includes(ev.type as any)) {
        errors.push(`simulation[${i}].type "${String(ev.type)}" not in {${EVENT_TYPES.join(', ')}}`)
      }
    })
  }

  // ── Optional: projectName, stack, modules ──
  if (obj.projectName !== undefined && typeof obj.projectName !== 'string') {
    errors.push('projectName, when present, must be a string')
  }
  if (obj.stack !== undefined) {
    if (!Array.isArray(obj.stack) || !obj.stack.every((s) => typeof s === 'string')) {
      errors.push('stack, when present, must be a string[]')
    }
  }
  if (obj.modules !== undefined) {
    if (!Array.isArray(obj.modules)) {
      errors.push('modules, when present, must be an array')
    } else {
      obj.modules.forEach((m, i) => {
        if (!isPlainObject(m)) {
          errors.push(`modules[${i}] is not an object`)
          return
        }
        if (typeof m.name !== 'string') errors.push(`modules[${i}].name must be a string`)
        if (!RISK_LEVELS.includes(m.risk as any)) {
          errors.push(`modules[${i}].risk "${String(m.risk)}" not in {${RISK_LEVELS.join(', ')}}`)
        }
        if (typeof m.files !== 'number') errors.push(`modules[${i}].files must be a number`)
      })
    }
  }

  return { valid: errors.length === 0, errors }
}
