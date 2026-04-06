import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import type { RepoWithRuns } from '../types'
import { mockRuns } from '../test/mocks/fixtures'

const makeRepo = (name: string, hasWorkflows = true): RepoWithRuns => ({
  name,
  description: `${name} description`,
  language: 'TypeScript',
  html_url: `https://github.com/org/${name}`,
  updated_at: '2026-04-01T00:00:00Z',
  pushed_at: '2026-04-01T00:00:00Z',
  runs: hasWorkflows ? mockRuns : [],
  hasWorkflows,
})

describe('Dashboard', () => {
  it('renders loading skeleton when loading with no repos', () => {
    render(
      <MemoryRouter>
        <Dashboard repos={[]} isLoading={true} />
      </MemoryRouter>
    )
    // Should show skeleton placeholders
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders empty state when no repos found', () => {
    render(
      <MemoryRouter>
        <Dashboard repos={[]} isLoading={false} />
      </MemoryRouter>
    )
    expect(screen.getByText('No public repositories found.')).toBeInTheDocument()
  })

  it('renders repo cards', () => {
    const repos = [makeRepo('repo-a'), makeRepo('repo-b')]
    render(
      <MemoryRouter>
        <Dashboard repos={repos} isLoading={false} />
      </MemoryRouter>
    )
    expect(screen.getByText('repo-a')).toBeInTheDocument()
    expect(screen.getByText('repo-b')).toBeInTheDocument()
  })

  it('sorts repos with workflows before those without', () => {
    const repos = [
      makeRepo('no-ci', false),
      makeRepo('has-ci', true),
    ]
    render(
      <MemoryRouter>
        <Dashboard repos={repos} isLoading={false} />
      </MemoryRouter>
    )
    const cards = screen.getAllByRole('link')
    expect(cards[0]).toHaveAttribute('href', '/repo/has-ci')
    expect(cards[1]).toHaveAttribute('href', '/repo/no-ci')
  })
})
