import type { CacheEntry, RateLimitInfo } from '../types'
import { CACHE_TTL_MS } from '../config'

const CACHE_PREFIX = 'ci-dash-cache:'

let rateLimitInfo: RateLimitInfo = {
  remaining: 60,
  limit: 60,
  resetAt: 0,
}

export function getRateLimitInfo(): RateLimitInfo {
  return { ...rateLimitInfo }
}

export function updateRateLimitFromHeaders(headers: Headers): void {
  const remaining = headers.get('x-ratelimit-remaining')
  const limit = headers.get('x-ratelimit-limit')
  const reset = headers.get('x-ratelimit-reset')

  rateLimitInfo = {
    remaining: remaining !== null ? parseInt(remaining, 10) : rateLimitInfo.remaining,
    limit: limit !== null ? parseInt(limit, 10) : rateLimitInfo.limit,
    resetAt: reset !== null ? parseInt(reset, 10) * 1000 : rateLimitInfo.resetAt,
  }
}

function getCacheKey(url: string): string {
  return CACHE_PREFIX + url
}

function getFromCache<T>(url: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(getCacheKey(url))
    if (!raw) return null
    return JSON.parse(raw) as CacheEntry<T>
  } catch {
    return null
  }
}

function setCache<T>(url: string, data: T, etag: string | null): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    etag,
  }
  try {
    localStorage.setItem(getCacheKey(url), JSON.stringify(entry))
  } catch {
    // localStorage full — clear old entries and retry
    clearExpiredCache()
    try {
      localStorage.setItem(getCacheKey(url), JSON.stringify(entry))
    } catch {
      // still full, give up silently
    }
  }
}

export function clearExpiredCache(): void {
  const now = Date.now()
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const entry = JSON.parse(localStorage.getItem(key)!) as CacheEntry<unknown>
        if (now - entry.timestamp > CACHE_TTL_MS * 10) {
          localStorage.removeItem(key)
        }
      } catch {
        localStorage.removeItem(key!)
      }
    }
  }
}

export async function cachedFetch<T>(url: string): Promise<T> {
  const cached = getFromCache<T>(url)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  }

  if (cached?.etag) {
    headers['If-None-Match'] = cached.etag
  }

  const response = await fetch(url, { headers })
  updateRateLimitFromHeaders(response.headers)

  if (response.status === 304 && cached) {
    setCache(url, cached.data, cached.etag)
    return cached.data
  }

  if (!response.ok) {
    if (response.status === 403 && rateLimitInfo.remaining === 0) {
      throw new Error(`GitHub API rate limit exceeded. Resets at ${new Date(rateLimitInfo.resetAt).toLocaleTimeString()}`)
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as T
  const etag = response.headers.get('etag')
  setCache(url, data, etag)
  return data
}
