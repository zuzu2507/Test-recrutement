import type { TaskStatus } from '@/types'
import { cn } from '@/lib/cn'

/** Libelles et couleurs de statut, centralises pour rester coherents partout. */
export const STATUS_META: Record<TaskStatus, { label: string; badge: string; accent: string }> = {
  TODO: {
    label: 'À faire',
    badge: 'bg-todo-bg text-todo-fg border-todo-br',
    accent: 'bg-todo-fg',
  },
  IN_PROGRESS: {
    label: 'En cours',
    badge: 'bg-progress-bg text-progress-fg border-progress-br',
    accent: 'bg-progress-fg',
  },
  DONE: {
    label: 'Termine',
    badge: 'bg-done-bg text-done-fg border-done-br',
    accent: 'bg-done-fg',
  },
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 rounded-full border px-2',
        'text-[11px] font-semibold uppercase tracking-[0.03em]',
        meta.badge,
      )}
    >
      <span className={cn('size-1.5 rounded-full', meta.accent)} />
      {meta.label}
    </span>
  )
}
