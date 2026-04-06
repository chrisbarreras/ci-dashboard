import { describe, it, expect } from 'vitest'
import { getRunStatus, getStatusColor, getStatusLabel, getStatusIcon, getOverallRepoStatus } from './statusHelpers'
import type { WorkflowRun } from '../types'

const makeRun = (overrides: Partial<WorkflowRun> = {}): WorkflowRun => ({
  id: 1,
  name: 'CI',
  status: 'completed',
  conclusion: 'success',
  html_url: 'https://github.com/org/repo/actions/runs/1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:01:00Z',
  run_number: 1,
  event: 'push',
  head_branch: 'main',
  ...overrides,
})

describe('getRunStatus', () => {
  it('returns success for completed successful run', () => {
    expect(getRunStatus(makeRun())).toBe('success')
  })

  it('returns failure for failed run', () => {
    expect(getRunStatus(makeRun({ conclusion: 'failure' }))).toBe('failure')
  })

  it('returns failure for timed_out run', () => {
    expect(getRunStatus(makeRun({ conclusion: 'timed_out' }))).toBe('failure')
  })

  it('returns in_progress for in_progress run', () => {
    expect(getRunStatus(makeRun({ status: 'in_progress', conclusion: null }))).toBe('in_progress')
  })

  it('returns in_progress for queued run', () => {
    expect(getRunStatus(makeRun({ status: 'queued', conclusion: null }))).toBe('in_progress')
  })

  it('returns cancelled for cancelled run', () => {
    expect(getRunStatus(makeRun({ conclusion: 'cancelled' }))).toBe('cancelled')
  })

  it('returns cancelled for skipped run', () => {
    expect(getRunStatus(makeRun({ conclusion: 'skipped' }))).toBe('cancelled')
  })
})

describe('getStatusColor', () => {
  it('returns emerald for success', () => {
    expect(getStatusColor('success')).toContain('emerald')
  })

  it('returns red for failure', () => {
    expect(getStatusColor('failure')).toContain('red')
  })

  it('returns amber for in_progress', () => {
    expect(getStatusColor('in_progress')).toContain('amber')
  })
})

describe('getStatusLabel', () => {
  it('returns Passed for success', () => {
    expect(getStatusLabel('success')).toBe('Passed')
  })

  it('returns Failed for failure', () => {
    expect(getStatusLabel('failure')).toBe('Failed')
  })

  it('returns Running for in_progress', () => {
    expect(getStatusLabel('in_progress')).toBe('Running')
  })
})

describe('getStatusIcon', () => {
  it('returns checkmark for success', () => {
    expect(getStatusIcon('success')).toBe('\u2713')
  })

  it('returns X for failure', () => {
    expect(getStatusIcon('failure')).toBe('\u2717')
  })
})

describe('getOverallRepoStatus', () => {
  it('returns none for empty runs', () => {
    expect(getOverallRepoStatus([])).toBe('none')
  })

  it('returns status of the latest run', () => {
    const runs = [makeRun({ conclusion: 'failure' }), makeRun()]
    expect(getOverallRepoStatus(runs)).toBe('failure')
  })
})
