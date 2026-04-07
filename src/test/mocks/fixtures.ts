import type { Repo, WorkflowRun } from '../../types'

export const mockRepos: Repo[] = [
  {
    name: 'dockerized-typescript-api',
    description: 'Typescript REST API in a docker container',
    language: 'TypeScript',
    html_url: 'https://github.com/chrisbarreras/dockerized-typescript-api',
    updated_at: '2026-03-25T22:50:52Z',
    pushed_at: '2026-03-25T22:46:00Z',
  },
  {
    name: 'llm-ci-pipeline',
    description: null,
    language: null,
    html_url: 'https://github.com/chrisbarreras/llm-ci-pipeline',
    updated_at: '2026-03-24T23:34:29Z',
    pushed_at: '2026-03-24T23:00:00Z',
  },
  {
    name: 'facebreak',
    description: null,
    language: null,
    html_url: 'https://github.com/chrisbarreras/facebreak',
    updated_at: '2026-04-03T00:00:00Z',
    pushed_at: '2026-04-03T00:00:00Z',
  },
]

export const mockRuns: WorkflowRun[] = [
  {
    id: 100,
    name: 'CI',
    status: 'completed',
    conclusion: 'success',
    html_url: 'https://github.com/chrisbarreras/dockerized-typescript-api/actions/runs/100',
    created_at: '2026-03-25T22:49:58Z',
    updated_at: '2026-03-25T22:50:52Z',
    run_number: 2,
    event: 'workflow_dispatch',
    head_branch: 'main',
  },
  {
    id: 99,
    name: 'CI',
    status: 'completed',
    conclusion: 'success',
    html_url: 'https://github.com/chrisbarreras/dockerized-typescript-api/actions/runs/99',
    created_at: '2026-03-25T22:47:53Z',
    updated_at: '2026-03-25T22:48:38Z',
    run_number: 1,
    event: 'push',
    head_branch: 'main',
  },
]

export const mockFailedRun: WorkflowRun = {
  id: 200,
  name: 'CI',
  status: 'completed',
  conclusion: 'failure',
  html_url: 'https://github.com/chrisbarreras/llm-ci-pipeline/actions/runs/200',
  created_at: '2026-03-24T23:33:32Z',
  updated_at: '2026-03-24T23:34:29Z',
  run_number: 1,
  event: 'push',
  head_branch: 'main',
}

export const mockInProgressRun: WorkflowRun = {
  id: 300,
  name: 'CI',
  status: 'in_progress',
  conclusion: null,
  html_url: 'https://github.com/chrisbarreras/test/actions/runs/300',
  created_at: '2026-04-06T12:00:00Z',
  updated_at: '2026-04-06T12:00:00Z',
  run_number: 5,
  event: 'push',
  head_branch: 'feature-branch',
}
