import type { WorkflowRun } from '../types'
import { getRunStatus } from '../utils/statusHelpers'
import { formatRelativeTime, formatDuration } from '../utils/formatTime'
import StatusBadge from './StatusBadge'

interface WorkflowRunRowProps {
  run: WorkflowRun
}

export default function WorkflowRunRow({ run }: WorkflowRunRowProps) {
  const status = getRunStatus(run)

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
      <td className="py-3 px-4">
        <StatusBadge status={status} size="sm" />
      </td>
      <td className="py-3 px-4 text-slate-300">
        <a
          href={run.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-100 transition-colors"
        >
          {run.name} #{run.run_number}
        </a>
      </td>
      <td className="py-3 px-4 text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="text-xs font-mono bg-slate-800 rounded px-1.5 py-0.5">
            {run.head_branch}
          </span>
        </span>
      </td>
      <td className="py-3 px-4 text-slate-400 capitalize">{run.event}</td>
      <td className="py-3 px-4 text-slate-400">
        {run.status === 'completed' ? formatDuration(run.created_at, run.updated_at) : '...'}
      </td>
      <td className="py-3 px-4 text-slate-500 text-right">
        {formatRelativeTime(run.created_at)}
      </td>
    </tr>
  )
}
