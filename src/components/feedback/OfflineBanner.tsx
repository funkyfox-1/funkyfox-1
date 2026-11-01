import * as React from 'react'
import { WifiOff, Wifi, X } from 'lucide-react'

export interface OfflineBannerProps {
  className?: string
}

export default function OfflineBanner({ className = '' }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = React.useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  })
  const [showReconnected, setShowReconnected] = React.useState<boolean>(false)
  const [dismissed, setDismissed] = React.useState<boolean>(false)

  React.useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
      setDismissed(false)
      setShowReconnected(true)
      const timer = setTimeout(() => {
        setShowReconnected(false)
      }, 4000)
      return () => clearTimeout(timer)
    }

    function handleOffline() {
      setIsOnline(false)
      setShowReconnected(false)
      setDismissed(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showReconnected) {
    return null
  }

  if (dismissed) {
    return null
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${className}`}
    >
      <div
        className={`flex items-center justify-between px-4 py-2.5 text-xs font-semibold shadow-md border-b backdrop-blur-md ${
          isOnline
            ? 'bg-emerald-900/90 text-white border-emerald-800'
            : 'bg-ink/95 text-paper border-line'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          {isOnline ? (
            <>
              <Wifi size={15} className="text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Back online. Your connection has been restored.</span>
            </>
          ) : (
            <>
              <WifiOff size={15} className="text-fox shrink-0" aria-hidden="true" />
              <span>
                You’re currently offline. You can continue browsing cached pieces and your bag is saved locally. Checkout and form submission require an active connection.
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss connectivity status notice"
          className="ml-3 p-1 text-soft hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </aside>
  )
}

