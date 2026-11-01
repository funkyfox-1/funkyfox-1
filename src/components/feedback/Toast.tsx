import * as React from 'react'
import { Link } from 'react-router-dom'
import { Check, X as CloseIcon, AlertCircle, ArrowRight } from 'lucide-react'
import './Toast.css'

export interface ToastProps {
  message: string
  actionLabel?: string
  actionTo?: string
  onAction?: () => void
  onDismiss: () => void
  type?: 'success' | 'warning' | 'error' | 'info'
  className?: string
}

export default function Toast({
  message,
  actionLabel = 'View Bag',
  actionTo = '/cart',
  onAction,
  onDismiss,
  type = 'success',
  className = '',
}: ToastProps) {
  if (!message) return null

  // Analyze message to extract headline and product details if available
  // e.g. "Lightweight Linen Shirt (M) added to bag" -> title: "Added to your bag", desc: "Lightweight Linen Shirt (M)"
  const isAddedToBag = /added to bag$/i.test(message)
  let title = message
  let description: string | null = null

  if (isAddedToBag) {
    title = 'Added to your bag'
    description = message.replace(/\s*added to bag$/i, '')
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fox-toast ${className}`}
    >
      {/* Main row: Status icon, text confirmation, dismiss control */}
      <div className="fox-toast-main">
        <div
          aria-hidden="true"
          className={`fox-toast-icon-badge ${
            type === 'error'
              ? 'fox-toast-icon-badge--error'
              : type === 'warning'
              ? 'fox-toast-icon-badge--warning'
              : 'fox-toast-icon-badge--success'
          }`}
        >
          {type === 'error' ? (
            <AlertCircle size={15} />
          ) : (
            <Check size={14} strokeWidth={2.8} />
          )}
        </div>

        <div className="fox-toast-body">
          <p className="fox-toast-title">{title}</p>
          {description && <p className="fox-toast-desc">{description}</p>}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="fox-toast-dismiss"
        >
          <CloseIcon size={16} />
        </button>
      </div>

      {/* Secondary row: Clean, visually distinct View Bag action */}
      {(actionTo || onAction) && (
        <div className="fox-toast-footer">
          {actionTo ? (
            <Link
              to={actionTo}
              onClick={() => {
                if (onAction) onAction()
                onDismiss()
              }}
              className="fox-toast-action"
            >
              <span>{actionLabel}</span>
              <ArrowRight size={13} strokeWidth={2.2} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onAction) onAction()
                onDismiss()
              }}
              className="fox-toast-action"
            >
              <span>{actionLabel}</span>
              <ArrowRight size={13} strokeWidth={2.2} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
