import * as React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'

export interface ErrorStateProps {
  heading?: string
  message: string
  isTemporary?: boolean
  action?: {
    label: string
    onClick?: () => void
    to?: string
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
    to?: string
  }
  className?: string
  technicalDetails?: string
}

export default function ErrorState({
  heading = 'Something went wrong',
  message,
  isTemporary = true,
  action,
  secondaryAction,
  className = '',
  technicalDetails,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col items-center justify-center py-16 px-4 text-center sm:py-20 ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sand text-fox mb-5">
        <AlertCircle size={28} strokeWidth={1.8} aria-hidden="true" />
      </div>

      <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink sm:text-3xl max-w-lg">
        {heading}
      </h2>

      <p className="mt-2.5 max-w-md text-sm text-soft leading-relaxed">
        {message}
      </p>

      {isTemporary && (
        <p className="mt-1 text-xs text-soft/80">
          This may be a momentary issue. You can try again or return to browsing.
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {action && (
            action.to ? (
              <Link
                to={action.to}
                onClick={action.onClick}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-fox px-7 text-xs font-bold uppercase tracking-[.18em] text-white transition-colors hover:bg-fox-deep shadow-sm"
              >
                <span>{action.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-fox px-7 text-xs font-bold uppercase tracking-[.18em] text-white transition-colors hover:bg-fox-deep shadow-sm"
              >
                <RefreshCw size={14} className="shrink-0" />
                <span>{action.label}</span>
              </button>
            )
          )}

          {secondaryAction && (
            secondaryAction.to ? (
              <Link
                to={secondaryAction.to}
                onClick={secondaryAction.onClick}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-paper px-6 text-xs font-bold uppercase tracking-[.18em] text-ink hover:border-ink hover:bg-sand transition-colors"
              >
                <ArrowLeft size={14} className="shrink-0" />
                <span>{secondaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-paper px-6 text-xs font-bold uppercase tracking-[.18em] text-ink hover:border-ink hover:bg-sand transition-colors"
              >
                <ArrowLeft size={14} className="shrink-0" />
                <span>{secondaryAction.label}</span>
              </button>
            )
          )}
        </div>
      )}

      {technicalDetails && (
        <div className="mt-8 max-w-sm">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-soft hover:text-ink underline underline-offset-4"
          >
            {showDetails ? 'Hide technical summary' : 'Technical summary'}
          </button>
          {showDetails && (
            <p className="mt-2 text-[10px] text-soft/70 bg-sand p-2.5 rounded text-left font-mono">
              {technicalDetails}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

