import { Link, useParams } from 'react-router-dom'
import type { RepoWithRuns } from '../types'
import { REPO_DESCRIPTIONS } from '../config'
import { getOverallRepoStatus } from '../utils/statusHelpers'
import StatusBadge from './StatusBadge'
import WorkflowRunRow from './WorkflowRunRow'

interface RepoDetailProps {
  repos: RepoWithRuns[]
}

export default function RepoDetail({ repos }: RepoDetailProps) {
  const { name } = useParams<{ name: string }>()
  const repo = repos.find((r) => r.name === name)

  if (!repo) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="text-slate-400 hover:text-slate-200 transition-colors mb-6 inline-block">
          &larr; Back to Dashboard
        </Link>
        <p className="text-slate-400">Repository not found.</p>
      </div>
    )
  }

  const description = repo.description || REPO_DESCRIPTIONS[repo.name] || null
  const overallStatus = getOverallRepoStatus(repo.runs)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-slate-400 hover:text-slate-200 transition-colors mb-6 inline-block">
        &larr; Back to Dashboard
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{repo.name}</h1>
            {description && (
              <p className="text-slate-400 mt-1">{description}</p>
            )}
          </div>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors shrink-0"
          >
            View on GitHub &rarr;
          </a>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <StatusBadge status={overallStatus} />
          {repo.language && (
            <span className="text-sm text-slate-400">{repo.language}</span>
          )}
          <span className="text-sm text-slate-500">
            {repo.runs.length} recent run{repo.runs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {repo.runs.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Workflow</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {repo.runs.map((run) => (
                <WorkflowRunRow key={run.id} run={run} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
          No workflow runs found for this repository.
        </div>
      )}
    </div>
  )
}
