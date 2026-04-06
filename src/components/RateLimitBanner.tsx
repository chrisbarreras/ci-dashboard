import { formatCountdown } from '../utils/formatTime'
import type { RateLimitInfo } from '../types'
import { RATE_LIMIT_STOP_THRESHOLD } from '../config'

interface RateLimitBannerProps {
  rateLimitInfo: RateLimitInfo
}

export default function RateLimitBanner({ rateLimitInfo }: RateLimitBannerProps) {
  if (rateLimitInfo.remaining > RATE_LIMIT_STOP_THRESHOLD) return null

  const isPaused = rateLimitInfo.remaining <= RATE_LIMIT_STOP_THRESHOLD

  return (
    <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-2 text-sm text-amber-400 flex items-center gap-2">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <span>
        {isPaused
          ? `Auto-refresh paused — API rate limit low (${rateLimitInfo.remaining}/${rateLimitInfo.limit}). Resets in ${formatCountdown(rateLimitInfo.resetAt)}.`
          : `API rate limit approaching (${rateLimitInfo.remaining}/${rateLimitInfo.limit}).`
        }
      </span>
    </div>
  )
}
