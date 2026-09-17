import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { STATUS_META, StatusBadge } from '@/components/ui/StatusBadge'
import { nextStatus } from '@/lib/status'
import { formatDate, formatRelative } from '@/lib/date'
import { cn } from '@/lib/cn'
import type { Task } from '@/types'

interface TaskTableProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  /** Fait avancer la tache au statut suivant depuis la case a cocher. */
  onAdvance: (task: Task) => void
  /** Ouvre le panneau de detail. */
  onSelect: (task: Task) => void
  busyId: number | null
  selectedId: number | null
}

const PAGE_SIZE = 10

/** Libelle du statut suivant, pour l'intitule accessible de la case a cocher. */
function nextLabel(status: Task['status']): string {
  const upcoming = nextStatus(status)
  return upcoming ? STATUS_META[upcoming].label : 'aucune etape suivante'
}

const headerClass =
  'py-2.5 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.03em] text-ink-muted'

const actionClass =
  'rounded-control p-1.5 text-ink-disabled transition-colors hover:bg-recessed hover:text-ink ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const pagerClass =
  'inline-flex h-8 items-center gap-1 rounded-control border border-border-hairline bg-surface px-2.5 ' +
  'text-[13px] font-semibold text-ink transition-colors hover:border-border-strong ' +
  'disabled:cursor-not-allowed disabled:opacity-45'

/** Case a cocher 18px conforme a DESIGN.md > Checkboxes. */
function Checkbox({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  disabled?: boolean
  onChange: () => void
  label: string
}) {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={label}
        className="peer sr-only"
      />
      <span
        className={cn(
          'flex size-[18px] items-center justify-center rounded-[4px] border-[1.5px] transition-colors',
          'peer-focus-visible:ring-[3px] peer-focus-visible:ring-accent/15',
          checked ? 'border-accent bg-accent' : 'border-border-strong bg-surface hover:border-accent',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
            <path
              d="M2.5 6.2l2.2 2.2 4.8-5"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </label>
  )
}

export function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onAdvance,
  onSelect,
  busyId,
  selectedId,
}: TaskTableProps) {
  const [page, setPage] = useState(1)

  const pageCount = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE))
  // Si la liste retrecit (suppression, filtre), la page courante peut sortir
  // des bornes : on la ramene dans la plage valide au rendu.
  const currentPage = Math.min(page, pageCount)

  const visible = useMemo(
    () => tasks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [tasks, currentPage],
  )

  const firstIndex = (currentPage - 1) * PAGE_SIZE + 1
  const lastIndex = Math.min(currentPage * PAGE_SIZE, tasks.length)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="border-b border-border-hairline bg-recessed/60">
              <th scope="col" className="w-12 py-2.5 pl-4" />
              <th scope="col" className={headerClass}>Tache et description</th>
              <th scope="col" className={cn(headerClass, 'w-[140px]')}>Statut</th>
              <th scope="col" className={cn(headerClass, 'w-[130px]')}>Creee le</th>
              <th scope="col" className={cn(headerClass, 'w-[130px]')}>Modifiee</th>
              <th scope="col" className={cn(headerClass, 'w-[100px] pr-4 text-right')}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {visible.map((task) => {
              const done = task.status === 'DONE'
              const busy = busyId === task.id
              return (
                <tr
                  key={task.id}
                  onClick={() => onSelect(task)}
                  className={cn(
                    'cursor-pointer border-b border-border-hairline transition-colors last:border-b-0',
                    'hover:bg-recessed/50',
                    task.id === selectedId && 'bg-accent-soft/60',
                    busy && 'opacity-55',
                  )}
                >
                  <td className="py-3 pl-4 align-top" onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={done}
                      // Une tache terminee ne peut plus reculer : la case
                      // devient un simple indicateur, non decochable.
                      disabled={busy || done}
                      onChange={() => onAdvance(task)}
                      label={
                        done
                          ? `${task.title} est terminee`
                          : `Faire avancer ${task.title} vers ${nextLabel(task.status)}`
                      }
                    />
                  </td>

                  <td className="py-3 pr-4 align-top">
                    <div className="flex gap-3">
                      <span
                        className={cn(
                          'mt-0.5 w-[3px] shrink-0 self-stretch rounded-full',
                          STATUS_META[task.status].accent,
                        )}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p
                          className={cn(
                            'truncate text-sm font-semibold',
                            done ? 'text-ink-muted line-through' : 'text-ink',
                          )}
                          title={task.title}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="mt-0.5 truncate text-[13px] text-ink-muted" title={task.description}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 pr-4 align-top">
                    <StatusBadge status={task.status} />
                  </td>

                  <td className="py-3 pr-4 align-top text-[13px] text-ink-muted">
                    {formatDate(task.createdAt)}
                  </td>

                  <td className="py-3 pr-4 align-top text-[13px] text-ink-muted">
                    {formatRelative(task.updatedAt)}
                  </td>

                  <td className="py-3 pr-4 align-top" onClick={(event) => event.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(task)}
                        disabled={busy}
                        className={actionClass}
                        aria-label={`Modifier ${task.title}`}
                        title="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(task)}
                        disabled={busy}
                        className={cn(actionClass, 'hover:bg-danger-bg hover:text-danger')}
                        aria-label={`Supprimer ${task.title}`}
                        title="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {tasks.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-4 border-t border-border-hairline px-4 py-3">
          <p className="text-[13px] text-ink-muted">
            Affichage de <span className="font-semibold text-ink">{firstIndex}</span> a{' '}
            <span className="font-semibold text-ink">{lastIndex}</span> sur{' '}
            <span className="font-semibold text-ink">{tasks.length}</span> taches
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={pagerClass}
            >
              <ChevronLeft className="size-4" />
              Precedent
            </button>

            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => setPage(number)}
                aria-current={number === currentPage ? 'page' : undefined}
                className={cn(
                  'size-8 rounded-control text-[13px] font-semibold transition-colors',
                  number === currentPage
                    ? 'bg-accent-soft text-accent'
                    : 'text-ink-muted hover:bg-recessed hover:text-ink',
                )}
              >
                {number}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              className={pagerClass}
            >
              Suivant
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
