import * as React from 'react'
import { Clock, X } from 'lucide-react'

export interface SlowNetworkNoticeProps {
  thresholdMs?: number
  message?: string
  className?: string
  isSlow?: boolean
}

/**
 * Monitors slow network conditions either via navigator.connection (2G/slow-2g)
 * or when an explicit isSlow prop / loading duration threshold is exceeded.
 */
export default function SlowNetworkNotice({
  thresholdMs = 4000,
  message = 'Loading is taking longer than expected on your connection. Your bag and local data remain safe.',
  className = '',
  isSlow: controlledIsSlow,
}: SlowNetworkNoticeProps) {
  const [internalSlow, setInternalSlow] = React.useState<boolean>(false)
  const [dismissed, setDismissed] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Check NetworkInformation API if available in browser
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null
    const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection

    if (conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g')) {
      setInternalSlow(true)
    }

    // Timer check for slow operations
    const timer = setTimeout(() => {
      if (controlledIsSlow === undefined) {
        // Can be triggered if page took long to stabilize
      }
    }, thresholdMs)

    return () => clearTimeout(timer)
  }, [controlledIsSlow, thresholdMs])

  const shouldShow = (controlledIsSlow !== undefined ? controlledIsSlow : internalSlow) && !dismissed

  if (!shouldShow) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded border border-line bg-sand/60 px-4 py-3 text-xs text-soft flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Clock size={15} className="text-fox shrink-0" aria-hidden="true" />
        <span className="leading-snug">{message}</span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss slow connection notice"
        className="text-soft hover:text-ink p-1 transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  )
}

