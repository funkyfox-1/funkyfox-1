import * as React from 'react'
import { AlertCircle } from 'lucide-react'

export interface InlineFieldErrorProps {
  id: string
  message?: string
  className?: string
}

export default function InlineFieldError({
  id,
  message,
  className = '',
}: InlineFieldErrorProps) {
  if (!message) return null

  return (
    <p
      id={id}
      role="alert"
      className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#C95D25] ${className}`}
    >
      <AlertCircle size={13} className="shrink-0 text-fox" aria-hidden="true" />
      <span>{message}</span>
    </p>
  )
}

