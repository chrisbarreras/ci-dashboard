export interface Repo {
  name: string
  description: string | null
  language: string | null
  html_url: string
  updated_at: string
  pushed_at: string
}

export interface WorkflowRun {
  id: number
  name: string
  status: 'completed' | 'in_progress' | 'queued' | 'waiting'
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | 'timed_out' | null
  html_url: string
  created_at: string
  updated_at: string
  run_number: number
  event: string
  head_branch: string
}

export interface RepoWithRuns extends Repo {
  runs: WorkflowRun[]
  hasWorkflows: boolean
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  etag: string | null
}

export interface RateLimitInfo {
  remaining: number
  limit: number
  resetAt: number
}
