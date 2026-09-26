// Tests for the risk badge, score colour, and file-size helpers.

import { describe, it, expect } from 'vitest'
import { getRiskBadgeClass, getScoreColor, formatFileSize } from '@/lib/utils'

describe('getRiskBadgeClass', () => {
  it('maps scores to badges at the exact thresholds', () => {
    expect(getRiskBadgeClass(0)).toEqual({ label: 'Zero Risk', colorClass: 'low' })
    expect(getRiskBadgeClass(39)).toEqual({ label: 'Low', colorClass: 'low' })
    expect(getRiskBadgeClass(40)).toEqual({ label: 'Medium', colorClass: 'medium' })
    expect(getRiskBadgeClass(59)).toEqual({ label: 'Medium', colorClass: 'medium' })
    expect(getRiskBadgeClass(60)).toEqual({ label: 'High', colorClass: 'high' })
    expect(getRiskBadgeClass(79)).toEqual({ label: 'High', colorClass: 'high' })
    expect(getRiskBadgeClass(80)).toEqual({ label: 'Critical', colorClass: 'critical' })
    expect(getRiskBadgeClass(100)).toEqual({ label: 'Critical', colorClass: 'critical' })
  })
})

describe('getScoreColor', () => {
  it('maps scores to colours at the exact thresholds', () => {
    expect(getScoreColor(39)).toBe('#22c55e')
    expect(getScoreColor(40)).toBe('#f59e0b')
    expect(getScoreColor(59)).toBe('#f59e0b')
    expect(getScoreColor(60)).toBe('#f97316')
    expect(getScoreColor(79)).toBe('#f97316')
    expect(getScoreColor(80)).toBe('#ef4444')
  })
})

describe('formatFileSize', () => {
  it('formats bytes as KB with one decimal place', () => {
    expect(formatFileSize(0)).toBe('0.0 KB')
    expect(formatFileSize(512)).toBe('0.5 KB')
    expect(formatFileSize(1024)).toBe('1.0 KB')
    expect(formatFileSize(1536)).toBe('1.5 KB')
    expect(formatFileSize(1024 * 1024)).toBe('1024.0 KB')
  })
})
