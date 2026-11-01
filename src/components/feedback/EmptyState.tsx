import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export interface EmptyStateAction {
  label: string
  to?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export interface EmptyStateProps {
  heading: string
  message: string
  icon?: React.ReactNode
  primaryAction?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  suggestions?: React.ReactNode
  className?: string
  eyebrow?: string
}

export default function EmptyState({
  heading,
  message,
  icon,
  primaryAction,
  secondaryAction,
  suggestions,
  className = '',
  eyebrow,
}: EmptyStateProps) {
  return (
    <div
      role="region"
      aria-label={heading}
      className={`flex flex-col items-center justify-center py-16 px-4 text-center sm:py-20 ${className}`}
    >
      {icon && (
        <div
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-sand text-soft mb-5"
        >
          {icon}
        </div>
      )}

      {eyebrow && (
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-soft mb-2">
          <span aria-hidden="true" className="h-[2px] w-4 rounded-full bg-fox" />
          {eyebrow}
        </p>
      )}

      <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink sm:text-3xl max-w-lg">
        {heading}
      </h2>

      <p className="mt-2.5 max-w-md text-sm text-soft leading-relaxed">
        {message}
      </p>

      {suggestions && (
        <div className="mt-6 w-full max-w-lg">
          {suggestions}
        </div>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            primaryAction.to ? (
              <Link
                to={primaryAction.to}
                onClick={primaryAction.onClick}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-fox px-8 text-xs font-bold uppercase tracking-[.18em] text-white transition-colors hover:bg-fox-deep shadow-sm active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fox"
              >
                <span>{primaryAction.label}</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-fox px-8 text-xs font-bold uppercase tracking-[.18em] text-white transition-colors hover:bg-fox-deep shadow-sm active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fox"
              >
                <span>{primaryAction.label}</span>
                <ArrowRight size={15} />
              </button>
            )
          )}

          {secondaryAction && (
            secondaryAction.to ? (
              <Link
                to={secondaryAction.to}
                onClick={secondaryAction.onClick}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-paper px-7 text-xs font-bold uppercase tracking-[.18em] text-ink transition-colors hover:border-ink hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <span>{secondaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-paper px-7 text-xs font-bold uppercase tracking-[.18em] text-ink transition-colors hover:border-ink hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <span>{secondaryAction.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

