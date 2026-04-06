import { getStatusColor, getStatusBgColor, getStatusLabel, getStatusIcon, type StatusType } from '../utils/statusHelpers'

interface StatusBadgeProps {
  status: StatusType
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colorClass = getStatusColor(status)
  const bgClass = getStatusBgColor(status)
  const label = getStatusLabel(status)
  const icon = getStatusIcon(status)

  const sizeClass = size === 'sm'
    ? 'text-xs px-1.5 py-0.5'
    : 'text-sm px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${colorClass} ${bgClass} ${sizeClass}`}
      role="status"
      aria-label={`Status: ${label}`}
    >
      <span aria-hidden="true" className={status === 'in_progress' ? 'animate-pulse' : ''}>
        {icon}
      </span>
      {label}
    </span>
  )
}
