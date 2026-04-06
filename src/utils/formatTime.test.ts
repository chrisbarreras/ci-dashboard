import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatRelativeTime, formatDuration, formatCountdown } from './formatTime'

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for very recent timestamps', () => {
    const now = new Date()
    expect(formatRelativeTime(now.toISOString())).toBe('just now')
  })

  it('returns minutes ago', () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000)
    expect(formatRelativeTime(tenMinAgo.toISOString())).toBe('10m ago')
  })

  it('returns hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
    expect(formatRelativeTime(threeHoursAgo.toISOString())).toBe('3h ago')
  })

  it('returns days ago', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(fiveDaysAgo.toISOString())).toBe('5d ago')
  })

  it('returns a formatted date for old timestamps', () => {
    const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(oldDate.toISOString())
    expect(result).not.toContain('ago')
  })
})

describe('formatDuration', () => {
  it('formats seconds', () => {
    expect(formatDuration('2026-01-01T00:00:00Z', '2026-01-01T00:00:45Z')).toBe('45s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration('2026-01-01T00:00:00Z', '2026-01-01T00:02:30Z')).toBe('2m 30s')
  })

  it('formats exact minutes', () => {
    expect(formatDuration('2026-01-01T00:00:00Z', '2026-01-01T00:05:00Z')).toBe('5m')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration('2026-01-01T00:00:00Z', '2026-01-01T01:15:00Z')).toBe('1h 15m')
  })

  it('formats exact hours', () => {
    expect(formatDuration('2026-01-01T00:00:00Z', '2026-01-01T02:00:00Z')).toBe('2h')
  })
})

describe('formatCountdown', () => {
  it('formats countdown correctly', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

    const resetAt = new Date('2026-01-01T00:05:30Z').getTime()
    expect(formatCountdown(resetAt)).toBe('5:30')

    vi.useRealTimers()
  })

  it('returns 0:00 when reset time has passed', () => {
    const pastTime = Date.now() - 1000
    expect(formatCountdown(pastTime)).toBe('0:00')
  })
})
