import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  /** Icone affichee a gauche du titre, utilisee par les dialogues destructifs. */
  icon?: ReactNode
  size?: 'md' | 'lg'
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  icon,
  size = 'lg',
}: ModalProps) {
  // Echap ferme, et on bloque le defilement de l'arriere-plan tant que la
  // modale est ouverte pour eviter le scroll fantome derriere l'overlay.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[4px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative z-10 w-full overflow-hidden rounded-card border border-border-hairline',
          'bg-surface shadow-level4',
          size === 'lg' ? 'max-w-[620px]' : 'max-w-[480px]',
        )}
      >
        <header className="flex items-start gap-3 border-b border-border-hairline px-5 py-4">
          {icon}
          <div className="flex-1">
            <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-control p-1 text-ink-disabled transition-colors hover:bg-recessed hover:text-ink"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-border-hairline bg-canvas px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}
