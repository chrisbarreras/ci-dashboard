import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import RepoDetail from './RepoDetail'
import type { RepoWithRuns } from '../types'
import { mockRuns } from '../test/mocks/fixtures'

const makeRepo = (name: string): RepoWithRuns => ({
  name,
  description: `${name} description`,
  language: 'TypeScript',
  html_url: `https://github.com/org/${name}`,
  updated_at: '2026-04-01T00:00:00Z',
  pushed_at: '2026-04-01T00:00:00Z',
  runs: mockRuns,
  hasWorkflows: true,
})

function renderAtRoute(repos: RepoWithRuns[], repoName: string) {
  return render(
    <MemoryRouter initialEntries={[`/repo/${repoName}`]}>
      <Routes>
        <Route path="/repo/:name" element={<RepoDetail repos={repos} />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('RepoDetail', () => {
  it('renders repo name and description', () => {
    const repos = [makeRepo('my-repo')]
    renderAtRoute(repos, 'my-repo')
    expect(screen.getByText('my-repo')).toBeInTheDocument()
    expect(screen.getByText('my-repo description')).toBeInTheDocument()
  })

  it('renders back link', () => {
    const repos = [makeRepo('my-repo')]
    renderAtRoute(repos, 'my-repo')
    expect(screen.getByText(/Back to Dashboard/)).toBeInTheDocument()
  })

  it('renders workflow run rows', () => {
    const repos = [makeRepo('my-repo')]
    renderAtRoute(repos, 'my-repo')
    // Should show run entries from mockRuns
    expect(screen.getByText(/CI #2/)).toBeInTheDocument()
    expect(screen.getByText(/CI #1/)).toBeInTheDocument()
  })

  it('shows not found for unknown repo', () => {
    renderAtRoute([], 'unknown-repo')
    expect(screen.getByText('Repository not found.')).toBeInTheDocument()
  })

  it('renders GitHub link', () => {
    const repos = [makeRepo('my-repo')]
    renderAtRoute(repos, 'my-repo')
    const ghLink = screen.getByText(/View on GitHub/)
    expect(ghLink).toHaveAttribute('href', 'https://github.com/org/my-repo')
  })
})
