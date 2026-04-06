import type { RepoWithRuns } from '../types'
import RepoCard from './RepoCard'

interface DashboardProps {
  repos: RepoWithRuns[]
  isLoading: boolean
}

export default function Dashboard({ repos, isLoading }: DashboardProps) {
  const sorted = [...repos].sort((a, b) => {
    // Repos with workflows first, then without
    if (a.hasWorkflows && !b.hasWorkflows) return -1
    if (!a.hasWorkflows && b.hasWorkflows) return 1
    // Within each group, sort by most recently updated
    return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
  })

  if (isLoading && repos.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse"
          >
            <div className="h-5 bg-slate-800 rounded w-2/3 mb-3" />
            <div className="h-4 bg-slate-800 rounded w-full mb-4" />
            <div className="h-6 bg-slate-800 rounded w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (!isLoading && repos.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-lg">No public repositories found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
      {sorted.map((repo) => (
        <RepoCard key={repo.name} repo={repo} />
      ))}
    </div>
  )
}
