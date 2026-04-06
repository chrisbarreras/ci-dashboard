import { Link } from 'react-router-dom'
import type { RepoWithRuns } from '../types'
import { REPO_DESCRIPTIONS } from '../config'
import { getRunStatus, getOverallRepoStatus, getStatusColor } from '../utils/statusHelpers'
import { formatRelativeTime } from '../utils/formatTime'
import StatusBadge from './StatusBadge'

interface RepoCardProps {
  repo: RepoWithRuns
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  Python: 'bg-green-500',
  HCL: 'bg-violet-500',
  'Jupyter Notebook': 'bg-orange-500',
  Go: 'bg-cyan-400',
  Rust: 'bg-orange-600',
  Shell: 'bg-emerald-600',
}

export default function RepoCard({ repo }: RepoCardProps) {
  const overallStatus = getOverallRepoStatus(repo.runs)
  const description = repo.description || REPO_DESCRIPTIONS[repo.name] || null
  const latestRun = repo.runs[0] || null
  const recentRuns = repo.runs.slice(0, 5)

  return (
    <Link
      to={`/repo/${repo.name}`}
      className="block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white truncate pr-2">
          {repo.name}
        </h3>
        {repo.language && (
          <span className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full ${LANGUAGE_COLORS[repo.language] || 'bg-slate-500'}`} />
            {repo.language}
          </span>
        )}
      </div>

      {description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{description}</p>
      )}

      {repo.hasWorkflows && latestRun ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <StatusBadge status={overallStatus} />
            <span className="text-xs text-slate-500">
              {latestRun.name} &middot; {formatRelativeTime(latestRun.created_at)}
            </span>
          </div>

          {recentRuns.length > 1 && (
            <div className="flex items-center gap-1" aria-label="Recent run history">
              {recentRuns.map((run) => {
                const status = getRunStatus(run)
                const colorClass = getStatusColor(status)
                return (
                  <span
                    key={run.id}
                    className={`w-3 h-3 rounded-full ${colorClass} ${status === 'in_progress' ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: 'currentColor', opacity: 0.8 }}
                    title={`#${run.run_number}: ${run.conclusion || run.status}`}
                  />
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-slate-600 italic">
          No CI/CD configured
        </div>
      )}
    </Link>
  )
}
