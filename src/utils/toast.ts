// Global Toast Notification Event Dispatcher
type ToastDetail = {
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
};

export function showToast(
  message: string,
  options?: {
    type?: 'success' | 'warning' | 'error' | 'info';
    actionLabel?: string;
    actionTo?: string;
    onAction?: () => void;
  }
) {
  if (typeof window === 'undefined') return;
  const detail: ToastDetail = {
    message,
    type: options?.type || 'success',
    actionLabel: options?.actionLabel,
    actionTo: options?.actionTo,
    onAction: options?.onAction,
  };
  window.dispatchEvent(new CustomEvent('funky-fox-toast', { detail }));
}

