interface BadgeProps {
  status: 'safe' | 'warn' | 'block'
  children: React.ReactNode
}

const statusClasses = {
  safe: 'bg-status-safe-bg text-status-safe',
  warn: 'bg-status-warn-bg text-status-warn',
  block: 'bg-status-block-bg text-status-block',
}

export default function Badge({ status, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-medium ${statusClasses[status]}`}>
      {children}
    </span>
  )
}
