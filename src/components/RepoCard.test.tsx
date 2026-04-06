import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import RepoCard from './RepoCard'
import type { RepoWithRuns } from '../types'
import { mockRuns } from '../test/mocks/fixtures'

const makeRepo = (overrides: Partial<RepoWithRuns> = {}): RepoWithRuns => ({
  name: 'test-repo',
  description: 'A test repository',
  language: 'TypeScript',
  html_url: 'https://github.com/org/test-repo',
  updated_at: '2026-04-01T00:00:00Z',
  pushed_at: '2026-04-01T00:00:00Z',
  runs: mockRuns,
  hasWorkflows: true,
  ...overrides,
})

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('RepoCard', () => {
  it('renders repo name', () => {
    renderWithRouter(<RepoCard repo={makeRepo()} />)
    expect(screen.getByText('test-repo')).toBeInTheDocument()
  })

  it('renders description', () => {
    renderWithRouter(<RepoCard repo={makeRepo()} />)
    expect(screen.getByText('A test repository')).toBeInTheDocument()
  })

  it('renders language badge', () => {
    renderWithRouter(<RepoCard repo={makeRepo()} />)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('shows status badge when runs exist', () => {
    renderWithRouter(<RepoCard repo={makeRepo()} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows "No CI/CD configured" for repos without workflows', () => {
    renderWithRouter(<RepoCard repo={makeRepo({ hasWorkflows: false, runs: [] })} />)
    expect(screen.getByText('No CI/CD configured')).toBeInTheDocument()
  })

  it('links to detail page', () => {
    renderWithRouter(<RepoCard repo={makeRepo()} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/repo/test-repo')
  })
})
