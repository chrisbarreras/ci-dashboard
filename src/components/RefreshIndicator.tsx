import { useState, useEffect } from 'react'
import { formatCountdown } from '../utils/formatTime'

interface RefreshIndicatorProps {
  lastRefresh: number | null
  nextRefreshAt: number | null
  onManualRefresh: () => void
  isRefreshing: boolean
}

export default function RefreshIndicator({
  lastRefresh,
  nextRefreshAt,
  onManualRefresh,
  isRefreshing,
}: RefreshIndicatorProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const lastRefreshText = lastRefresh
    ? `Updated ${formatTimeSince(lastRefresh)}`
    : 'Loading...'

  const nextRefreshText = nextRefreshAt
    ? `Next: ${formatCountdown(nextRefreshAt)}`
    : ''

  return (
    <div className="flex items-center gap-3 text-xs text-slate-500">
      <span>{lastRefreshText}</span>
      {nextRefreshText && <span>&middot;</span>}
      {nextRefreshText && <span>{nextRefreshText}</span>}
      <button
        onClick={onManualRefresh}
        disabled={isRefreshing}
        className="text-slate-400 hover:text-slate-200 disabled:opacity-50 transition-colors"
        aria-label="Refresh data"
      >
        <svg
          className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  )
}

function formatTimeSince(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  return `${diffMin}m ago`
}
