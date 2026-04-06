import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchRepos, fetchWorkflowRuns, fetchAllRepoRuns } from './github'
import type { Repo, WorkflowRun } from '../types'

const makeHeaders = () => new Headers({
  'x-ratelimit-remaining': '55',
  'x-ratelimit-limit': '60',
  'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
})

const mockRepo: Repo = {
  name: 'test-repo',
  description: 'A test repository',
  language: 'TypeScript',
  html_url: 'https://github.com/org/test-repo',
  updated_at: '2026-04-01T00:00:00Z',
  pushed_at: '2026-04-01T00:00:00Z',
}

const mockRun: WorkflowRun = {
  id: 1,
  name: 'CI',
  status: 'completed',
  conclusion: 'success',
  html_url: 'https://github.com/org/test-repo/actions/runs/1',
  created_at: '2026-04-01T00:00:00Z',
  updated_at: '2026-04-01T00:01:00Z',
  run_number: 1,
  event: 'push',
  head_branch: 'main',
}

describe('fetchRepos', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('fetches and returns repos', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([mockRepo]), { status: 200, headers: makeHeaders() })
    )

    const repos = await fetchRepos()

    expect(repos).toHaveLength(1)
    expect(repos[0].name).toBe('test-repo')
  })
})

describe('fetchWorkflowRuns', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('fetches and returns workflow runs', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ total_count: 1, workflow_runs: [mockRun] }), {
        status: 200,
        headers: makeHeaders(),
      })
    )

    const runs = await fetchWorkflowRuns('test-repo')

    expect(runs).toHaveLength(1)
    expect(runs[0].conclusion).toBe('success')
  })
})

describe('fetchAllRepoRuns', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('fetches runs for all repos and returns a map', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ total_count: 1, workflow_runs: [mockRun] }), {
        status: 200,
        headers: makeHeaders(),
      }))
    )

    const repos = [mockRepo, { ...mockRepo, name: 'repo-2' }]
    const runsMap = await fetchAllRepoRuns(repos)

    expect(runsMap.size).toBe(2)
    expect(runsMap.get('test-repo')).toHaveLength(1)
    expect(runsMap.get('repo-2')).toHaveLength(1)
  })

  it('handles failed fetches gracefully', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ total_count: 1, workflow_runs: [mockRun] }), {
          status: 200,
          headers: makeHeaders(),
        })
      )
      .mockRejectedValueOnce(new Error('Network error'))

    const repos = [mockRepo, { ...mockRepo, name: 'failing-repo' }]
    const runsMap = await fetchAllRepoRuns(repos)

    expect(runsMap.size).toBe(1)
    expect(runsMap.has('test-repo')).toBe(true)
    expect(runsMap.has('failing-repo')).toBe(false)
  })
})
