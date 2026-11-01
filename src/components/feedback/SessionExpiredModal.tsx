import * as React from 'react'
import { ShieldAlert, ArrowRight, X } from 'lucide-react'

export interface SessionExpiredModalProps {
  isOpen: boolean
  onDismiss: () => void
  onReauthenticate?: () => void
  preservedRoute?: string
}

/**
 * Reusable Session Expiry component prepared for future authentication integration.
 * In the current frontend prototype, this component remains available for backend
 * handoff without showing fake sign-outs during ordinary browsing.
 */
export default function SessionExpiredModal({
  isOpen,
  onDismiss,
  onReauthenticate,
  preservedRoute,
}: SessionExpiredModalProps) {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-line bg-paper p-6 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sand text-fox">
            <ShieldAlert size={24} strokeWidth={1.8} aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss session expired alert"
            className="p-1.5 text-soft hover:bg-sand hover:text-ink rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <h3
          id="session-expired-title"
          className="mt-4 font-display text-xl font-black uppercase text-ink"
        >
          Session Notice
        </h3>

        <p className="mt-2 text-sm text-soft leading-relaxed">
          Your active session has expired for security. Your shopping bag and saved contact entries have been preserved on your device so no work is lost.
        </p>

        <p className="mt-2 text-xs text-soft/80 leading-relaxed">
          When authentication is connected in production, signing in will return you to your saved checkout step without automatically placing an order.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4">
          <button
            type="button"
            onClick={onDismiss}
            className="h-10 rounded-full border border-line bg-white px-5 text-xs font-bold uppercase tracking-wider text-ink hover:bg-sand transition-colors"
          >
            Continue as Guest
          </button>
          {onReauthenticate && (
            <button
              type="button"
              onClick={onReauthenticate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-fox px-5 text-xs font-bold uppercase tracking-wider text-white hover:bg-fox-deep transition-colors shadow-sm"
            >
              <span>Sign In to Resume</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

