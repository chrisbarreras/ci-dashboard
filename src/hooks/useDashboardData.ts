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

interface DashboardState {
  repos: RepoWithRuns[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  lastRefresh: number | null
  nextRefreshAt: number | null
  rateLimitInfo: RateLimitInfo
  refresh: () => void
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      scheduleNextRefresh()
    }, interval)
  }, [fetchData])

  const refresh = useCallback(() => {
    fetchData(false).then(() => {
      scheduleNextRefresh()
    })
  }, [fetchData, scheduleNextRefresh])

  useEffect(() => {
    fetchData(true).then(() => {
      scheduleNextRefresh()
    })

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [fetchData, scheduleNextRefresh])

  return {
    repos,
    isLoading,
    isRefreshing,
    error,
    lastRefresh,
    nextRefreshAt,
    rateLimitInfo,
    refresh,
  }
}
