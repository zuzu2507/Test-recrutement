import { Info, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDate } from '@/lib/date'
import type { Task } from '@/types'

interface DeleteTaskDialogProps {
  task: Task | null
  submitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteTaskDialog({ task, submitting, onClose, onConfirm }: DeleteTaskDialogProps) {
  return (
    <Modal
      open={task !== null}
      onClose={onClose}
      size="md"
      title="Supprimer la tache"
      icon={
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-danger-bg">
          <Trash2 className="size-[18px] text-danger" />
        </span>
      }
      footer={
        <>
          <Button variant="secondary" size="compact" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button variant="destructive" size="compact" loading={submitting} onClick={onConfirm}>
            {!submitting && <Trash2 className="size-4" />}
            Supprimer definitivement
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-ink-muted">
        Voulez-vous vraiment supprimer{' '}
        <span className="font-semibold text-ink">&laquo;&nbsp;{task?.title}&nbsp;&raquo;</span> ?
        Cette action est irreversible.
      </p>

      {task && (
        <div className="mt-4 rounded-control border border-border-hairline bg-recessed px-3.5 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.03em] text-ink-muted">
              Tache #{task.id}
            </span>
            <StatusBadge status={task.status} />
          </div>
          {task.description && (
            <p className="mt-2.5 line-clamp-2 text-[13px] text-ink-muted">{task.description}</p>
          )}
          <p className="mt-2.5 text-[12px] text-ink-disabled">
            Creee le {formatDate(task.createdAt)}
          </p>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-control bg-accent-soft px-3 py-2.5 text-[12px] leading-5 text-ink-muted">
        <Info className="mt-0.5 size-3.5 shrink-0 text-accent" />
        La suppression est immediate et se propage aux autres appareils connectes
        au meme compte.
      </p>
    </Modal>
  )
}
