import type { ReactNode } from 'react'
import { ORG } from '../config'
import type { RateLimitInfo } from '../types'
import RefreshIndicator from './RefreshIndicator'
import RateLimitBanner from './RateLimitBanner'

interface LayoutProps {
  children: ReactNode
  lastRefresh: number | null
  nextRefreshAt: number | null
  onManualRefresh: () => void
  isRefreshing: boolean
  rateLimitInfo: RateLimitInfo
  autoRefreshEnabled: boolean
  onToggleAutoRefresh: (enabled: boolean) => void
  error: string | null
}

export default function Layout({
  children,
  lastRefresh,
  nextRefreshAt,
  onManualRefresh,
  isRefreshing,
  rateLimitInfo,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  error,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-100">CI Dashboard</h1>
            <RefreshIndicator
              lastRefresh={lastRefresh}
              nextRefreshAt={nextRefreshAt}
              onManualRefresh={onManualRefresh}
              isRefreshing={isRefreshing}
              autoRefreshEnabled={autoRefreshEnabled}
              onToggleAutoRefresh={onToggleAutoRefresh}
            />
          </div>
          <a
            href={`https://github.com/${ORG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors hidden sm:block"
          >
            {ORG.replace(/-/g, ' ')}
          </a>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-3 flex flex-col gap-2">
          <RateLimitBanner rateLimitInfo={rateLimitInfo} />
          {error && (
            <div className="bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6">
        {children}
      </main>
    </div>
  )
}
