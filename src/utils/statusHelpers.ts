import type { WorkflowRun } from '../types'

export type StatusType = 'success' | 'failure' | 'in_progress' | 'cancelled' | 'none'

export function getRunStatus(run: WorkflowRun): StatusType {
  if (run.status === 'in_progress' || run.status === 'queued' || run.status === 'waiting') {
    return 'in_progress'
  }
  if (run.conclusion === 'success') return 'success'
  if (run.conclusion === 'failure' || run.conclusion === 'timed_out') return 'failure'
  if (run.conclusion === 'cancelled' || run.conclusion === 'skipped') return 'cancelled'
  return 'none'
}

export function getStatusColor(status: StatusType): string {
  switch (status) {
    case 'success': return 'text-emerald-400'
    case 'failure': return 'text-red-400'
    case 'in_progress': return 'text-amber-400'
    case 'cancelled': return 'text-slate-500'
    case 'none': return 'text-slate-600'
  }
}

export function getStatusBgColor(status: StatusType): string {
  switch (status) {
    case 'success': return 'bg-emerald-400/10'
    case 'failure': return 'bg-red-400/10'
    case 'in_progress': return 'bg-amber-400/10'
    case 'cancelled': return 'bg-slate-500/10'
    case 'none': return 'bg-slate-600/10'
  }
}

export function getStatusLabel(status: StatusType): string {
  switch (status) {
    case 'success': return 'Passed'
    case 'failure': return 'Failed'
    case 'in_progress': return 'Running'
    case 'cancelled': return 'Cancelled'
    case 'none': return 'N/A'
  }
}

export function getStatusIcon(status: StatusType): string {
  switch (status) {
    case 'success': return '\u2713'
    case 'failure': return '\u2717'
    case 'in_progress': return '\u25CF'
    case 'cancelled': return '\u2014'
    case 'none': return '\u2014'
  }
}

export function getOverallRepoStatus(runs: WorkflowRun[]): StatusType {
  if (runs.length === 0) return 'none'
  return getRunStatus(runs[0])
}
