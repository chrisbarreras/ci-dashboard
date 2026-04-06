import { http, HttpResponse } from 'msw'
import { mockRepos, mockRuns } from './fixtures'
import { GITHUB_API_BASE, ORG } from '../../config'

export const handlers = [
  http.get(`${GITHUB_API_BASE}/orgs/${ORG}/repos`, () => {
    return HttpResponse.json(mockRepos, {
      headers: {
        'x-ratelimit-remaining': '55',
        'x-ratelimit-limit': '60',
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
      },
    })
  }),

  http.get(`${GITHUB_API_BASE}/repos/${ORG}/:repo/actions/runs`, ({ params }) => {
    const repo = params.repo as string
    if (repo === 'facebreak') {
      return HttpResponse.json({ total_count: 0, workflow_runs: [] }, {
        headers: {
          'x-ratelimit-remaining': '54',
          'x-ratelimit-limit': '60',
          'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
        },
      })
    }
    return HttpResponse.json({ total_count: mockRuns.length, workflow_runs: mockRuns }, {
      headers: {
        'x-ratelimit-remaining': '53',
        'x-ratelimit-limit': '60',
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
      },
    })
  }),
]
