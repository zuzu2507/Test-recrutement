import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

export type ToastVariant = 'success' | 'error'

interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  notify: (message: string, variant?: ToastVariant) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextValue | null>(null)

const AUTO_DISMISS_MS = 4500

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, variant: ToastVariant = 'error') => {
      const id = Date.now() + Math.random()
      setToasts((current) => [...current, { id, message, variant }])
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-card border border-border-hairline bg-surface p-3 shadow-level4"
          >
            {toast.variant === 'success' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-done-fg" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" />
            )}
            <p className="flex-1 text-[13px] leading-5 text-ink">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded text-ink-disabled transition-colors hover:text-ink"
              aria-label="Fermer la notification"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
