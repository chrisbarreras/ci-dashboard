import type { Repo, WorkflowRun } from '../types'
import { ORG, GITHUB_API_BASE, RUNS_PER_PAGE } from '../config'
import { cachedFetch } from './cache'

interface GitHubRunsResponse {
  total_count: number
  workflow_runs: WorkflowRun[]
}

export async function fetchRepos(): Promise<Repo[]> {
  const url = `${GITHUB_API_BASE}/users/${ORG}/repos?type=public&per_page=100&sort=updated`
  return cachedFetch<Repo[]>(url)
}

export async function fetchWorkflowRuns(repoName: string): Promise<WorkflowRun[]> {
  const url = `${GITHUB_API_BASE}/repos/${ORG}/${repoName}/actions/runs?per_page=${RUNS_PER_PAGE}`
  const response = await cachedFetch<GitHubRunsResponse>(url)
  return response.workflow_runs
}

export async function fetchAllRepoRuns(repos: Repo[]): Promise<Map<string, WorkflowRun[]>> {
  const results = new Map<string, WorkflowRun[]>()

  const settled = await Promise.allSettled(
    repos.map(async (repo) => {
      const runs = await fetchWorkflowRuns(repo.name)
      return { name: repo.name, runs }
    })
  )

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.set(result.value.name, result.value.runs)
    } else {
      // If a repo has no workflows, the API may 404 — treat as empty
      console.warn('Failed to fetch runs:', result.reason)
    }
  }

  return results
}
