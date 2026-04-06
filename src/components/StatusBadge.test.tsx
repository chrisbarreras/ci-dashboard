import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('renders success status', () => {
    render(<StatusBadge status="success" />)
    expect(screen.getByRole('status')).toHaveTextContent('Passed')
    expect(screen.getByRole('status')).toHaveAccessibleName('Status: Passed')
  })

  it('renders failure status', () => {
    render(<StatusBadge status="failure" />)
    expect(screen.getByRole('status')).toHaveTextContent('Failed')
  })

  it('renders in_progress status with animation', () => {
    render(<StatusBadge status="in_progress" />)
    expect(screen.getByRole('status')).toHaveTextContent('Running')
  })

  it('renders cancelled status', () => {
    render(<StatusBadge status="cancelled" />)
    expect(screen.getByRole('status')).toHaveTextContent('Cancelled')
  })

  it('renders none status', () => {
    render(<StatusBadge status="none" />)
    expect(screen.getByRole('status')).toHaveTextContent('N/A')
  })

  it('supports small size', () => {
    render(<StatusBadge status="success" size="sm" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
