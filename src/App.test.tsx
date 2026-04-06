import { render, screen } from '@testing-library/react'
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
})
