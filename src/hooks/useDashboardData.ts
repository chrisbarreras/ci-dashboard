import { useState, useEffect, useCallback, useRef } from 'react'
import type { RepoWithRuns, RateLimitInfo } from '../types'
import { fetchRepos, fetchAllRepoRuns } from '../api/github'
import { getRateLimitInfo } from '../api/cache'
import {
  REFRESH_INTERVAL_MS,
  SLOW_REFRESH_INTERVAL_MS,
  RATE_LIMIT_SLOW_THRESHOLD,
  RATE_LIMIT_STOP_THRESHOLD,
} from '../config'

const AUTO_REFRESH_STORAGE_KEY = 'ci-dashboard.autoRefresh'

interface DashboardState {
  repos: RepoWithRuns[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  lastRefresh: number | null
  nextRefreshAt: number | null
  rateLimitInfo: RateLimitInfo
  autoRefreshEnabled: boolean
  setAutoRefreshEnabled: (enabled: boolean) => void
  refresh: () => void
}

function readStoredAutoRefresh(): boolean {
  try {
    return localStorage.getItem(AUTO_REFRESH_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function useDashboardData(): DashboardState {
  const [repos, setRepos] = useState<RepoWithRuns[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<number | null>(null)
  const [nextRefreshAt, setNextRefreshAt] = useState<number | null>(null)
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({
    remaining: 60,
    limit: 60,
    resetAt: 0,
  })
  const [autoRefreshEnabled, setAutoRefreshEnabledState] = useState<boolean>(readStoredAutoRefresh)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoRefreshEnabledRef = useRef(autoRefreshEnabled)

  useEffect(() => {
    autoRefreshEnabledRef.current = autoRefreshEnabled
  }, [autoRefreshEnabled])

  const setAutoRefreshEnabled = useCallback((enabled: boolean) => {
    setAutoRefreshEnabledState(enabled)
    try {
      localStorage.setItem(AUTO_REFRESH_STORAGE_KEY, String(enabled))
    } catch {
      // ignore persistence failure — in-memory state still works
    }
  }, [])

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)

    try {
      const repoList = await fetchRepos()
      const runsMap = await fetchAllRepoRuns(repoList)

      const reposWithRuns: RepoWithRuns[] = repoList.map((repo) => {
        const runs = runsMap.get(repo.name) || []
        return {
          ...repo,
          runs,
          hasWorkflows: runs.length > 0,
        }
      })

      setRepos(reposWithRuns)
      setLastRefresh(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
      setRateLimitInfo(getRateLimitInfo())
    }
  }, [])

  const scheduleNextRefresh = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    const currentRateLimit = getRateLimitInfo()
    let interval: number

    if (currentRateLimit.remaining <= RATE_LIMIT_STOP_THRESHOLD) {
      // Paused — schedule for when rate limit resets
      interval = Math.max(0, currentRateLimit.resetAt - Date.now()) + 1000
    } else if (currentRateLimit.remaining <= RATE_LIMIT_SLOW_THRESHOLD) {
      interval = SLOW_REFRESH_INTERVAL_MS
    } else {
      interval = REFRESH_INTERVAL_MS
    }

    const nextAt = Date.now() + interval
    setNextRefreshAt(nextAt)

    timerRef.current = setTimeout(async () => {
      await fetchData(false)
      if (autoRefreshEnabledRef.current) {
        scheduleNextRefresh()
      }
    }, interval)
  }, [fetchData])

  const refresh = useCallback(() => {
    fetchData(false).then(() => {
      if (autoRefreshEnabledRef.current) {
        scheduleNextRefresh()
      }
    })
  }, [fetchData, scheduleNextRefresh])

  useEffect(() => {
    fetchData(true)
  }, [fetchData])

  useEffect(() => {
    if (!autoRefreshEnabled) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setNextRefreshAt(null)
      return
    }

    scheduleNextRefresh()
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [autoRefreshEnabled, scheduleNextRefresh])

  return {
    repos,
    isLoading,
    isRefreshing,
    error,
    lastRefresh,
    nextRefreshAt,
    rateLimitInfo,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    refresh,
  }
}
