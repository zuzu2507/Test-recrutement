import type { ReactNode } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  variant?: 'primary' | 'destructive'
  icon?: ReactNode
  /** Contenu additionnel affiche sous la description. */
  children?: ReactNode
  onConfirm: () => void
  onClose: () => void
}

/** Confirmation generique pour les actions dont on ne revient pas seul. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Annuler',
  variant = 'primary',
  icon,
  children,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={title}
      icon={icon}
      footer={
        <>
          <Button variant="secondary" size="compact" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="compact" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-ink-muted">{description}</p>
      {children}
    </Modal>
  )
}
