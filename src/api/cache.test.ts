import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cachedFetch, getRateLimitInfo, clearExpiredCache } from './cache'

const mockResponse = (data: unknown, options: { status?: number; etag?: string; rateRemaining?: string } = {}) => {
  const { status = 200, etag, rateRemaining = '59' } = options
  const headers = new Headers({
    'x-ratelimit-remaining': rateRemaining,
    'x-ratelimit-limit': '60',
    'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
  })
  if (etag) headers.set('etag', etag)

  return new Response(JSON.stringify(data), { status, headers })
}

describe('cachedFetch', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('fetches data and caches it', async () => {
    const data = { id: 1, name: 'test-repo' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse(data, { etag: '"abc"' }))

    const result = await cachedFetch<typeof data>('https://api.github.com/test')

    expect(result).toEqual(data)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('returns cached data within TTL without fetching', async () => {
    const data = { id: 1, name: 'cached' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse(data, { etag: '"abc"' }))

    await cachedFetch('https://api.github.com/cached')
    const result = await cachedFetch('https://api.github.com/cached')

    expect(result).toEqual(data)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('sends If-None-Match when cache has ETag and is expired', async () => {
    const data = { id: 1 }
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockResponse(data, { etag: '"abc"' }))
      .mockResolvedValueOnce(new Response(null, {
        status: 304,
        headers: new Headers({
          'x-ratelimit-remaining': '58',
          'x-ratelimit-limit': '60',
          'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
        }),
      }))

    await cachedFetch('https://api.github.com/etag-test')

    // Fast-forward past cache TTL
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 5 * 60 * 1000)

    const result = await cachedFetch('https://api.github.com/etag-test')

    expect(result).toEqual(data)
    expect(fetch).toHaveBeenCalledTimes(2)
    const secondCallHeaders = (fetch as ReturnType<typeof vi.fn>).mock.calls[1][1]?.headers
    expect(secondCallHeaders['If-None-Match']).toBe('"abc"')
  })

  it('throws on rate limit exceeded', async () => {
    const headers = new Headers({
      'x-ratelimit-remaining': '0',
      'x-ratelimit-limit': '60',
      'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
    })
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('rate limited', { status: 403, headers })
    )

    await expect(cachedFetch('https://api.github.com/rate-limit'))
      .rejects.toThrow('rate limit exceeded')
  })

  it('throws on non-OK response', async () => {
    const headers = new Headers({
      'x-ratelimit-remaining': '50',
      'x-ratelimit-limit': '60',
      'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
    })
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('not found', { status: 404, statusText: 'Not Found', headers })
    )

    await expect(cachedFetch('https://api.github.com/not-found'))
      .rejects.toThrow('GitHub API error: 404 Not Found')
  })
})

describe('getRateLimitInfo', () => {
  it('returns current rate limit info', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse({}, { rateRemaining: '42' }))
    await cachedFetch('https://api.github.com/rate-info')

    const info = getRateLimitInfo()
    expect(info.remaining).toBe(42)
    expect(info.limit).toBe(60)
  })
})

describe('clearExpiredCache', () => {
  it('removes old cache entries', () => {
    const oldEntry = JSON.stringify({ data: {}, timestamp: Date.now() - 10 * 60 * 60 * 1000, etag: null })
    localStorage.setItem('ci-dash-cache:old-url', oldEntry)

    clearExpiredCache()

    expect(localStorage.getItem('ci-dash-cache:old-url')).toBeNull()
  })

  it('keeps fresh cache entries', () => {
    const freshEntry = JSON.stringify({ data: {}, timestamp: Date.now(), etag: null })
    localStorage.setItem('ci-dash-cache:fresh-url', freshEntry)

    clearExpiredCache()

    expect(localStorage.getItem('ci-dash-cache:fresh-url')).not.toBeNull()
  })
})
