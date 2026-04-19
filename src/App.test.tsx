import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, afterAll, afterEach } from 'vitest'
import App from './App'
import { server } from './test/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())

describe('App', () => {
  it('renders the CI Dashboard heading', () => {
    render(<App />)
    expect(screen.getByText('CI Dashboard')).toBeInTheDocument()
  })

  it('defaults auto-refresh to Off with no countdown', async () => {
    render(<App />)
    const toggle = await screen.findByRole('button', { name: /auto-refresh off/i })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByText(/^Next:/)).not.toBeInTheDocument()
  })

  it('toggles auto-refresh on, persists to localStorage, and shows countdown', async () => {
    const user = userEvent.setup()
    render(<App />)
    const offToggle = await screen.findByRole('button', { name: /auto-refresh off/i })
    await user.click(offToggle)

    const onToggle = await screen.findByRole('button', { name: /auto-refresh on/i })
    expect(onToggle).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('ci-dashboard.autoRefresh')).toBe('true')
    expect(await screen.findByText(/^Next:/)).toBeInTheDocument()
  })

  it('hydrates auto-refresh to On when localStorage has "true"', async () => {
    localStorage.setItem('ci-dashboard.autoRefresh', 'true')
    render(<App />)
    const toggle = await screen.findByRole('button', { name: /auto-refresh on/i })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByText(/^Next:/)).toBeInTheDocument()
  })
})
