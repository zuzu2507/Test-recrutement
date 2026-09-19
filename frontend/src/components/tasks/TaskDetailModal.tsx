import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, CalendarPlus, Check, Clock, Hash, Lock, Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { STATUS_META, StatusBadge } from '@/components/ui/StatusBadge'
import { STATUS_ORDER, canMoveTo, isFinal, nextStatus } from '@/lib/status'
import { formatDate, formatRelative } from '@/lib/date'
import { cn } from '@/lib/cn'
import type { Task, TaskStatus } from '@/types'

interface TaskDetailModalProps {
  task: Task | null
  busy: boolean
  onClose: () => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onChangeStatus: (task: Task, status: TaskStatus) => void
}

/**
 * Detail d'une tache, en modale posee sur la liste avec arriere-plan floute.
 * Ouverte au clic sur une ligne du tableau.
 */
export function TaskDetailModal({
  task,
  busy,
  onClose,
  onEdit,
  onDelete,
  onChangeStatus,
}: TaskDetailModalProps) {
  useEffect(() => {
    if (!task) return
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
  }, [task, onClose])

  if (!task) return null

  const upcoming = nextStatus(task.status)
  const final = isFinal(task.status)

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6">
      {/* Arriere-plan floute, coherent avec les autres modales de l'app. */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[4px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Détails de la tâche ${task.title}`}
        className="relative z-10 flex max-h-[88vh] w-full max-w-[920px] flex-col overflow-hidden rounded-card border border-border-hairline bg-surface shadow-level4"
      >
        <header className="flex items-start gap-4 border-b border-border-hairline px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.03em] text-ink-muted">
              Tâche #{task.id}
            </p>
            <h2 className="mt-1.5 font-display text-[24px] font-bold leading-8 tracking-[-0.015em] text-ink">
              {task.title}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <StatusBadge status={task.status} />
            <button
              type="button"
              onClick={onClose}
              className="rounded-control p-1 text-ink-disabled transition-colors hover:bg-recessed hover:text-ink"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-canvas px-6 py-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-5">
              <Card title="Description">
                {task.description ? (
                  <p className="whitespace-pre-wrap text-sm leading-6 text-ink">{task.description}</p>
                ) : (
                  <p className="text-sm italic text-ink-disabled">Aucune description renseignée.</p>
                )}
              </Card>

              <Card title="Informations">
                <dl className="flex flex-col gap-3">
                  <Row icon={<Hash className="size-3.5" />} label="Identifiant" value={`#${task.id}`} />
                  <Row
                    icon={<CalendarPlus className="size-3.5" />}
                    label="Créée le"
                    value={formatDate(task.createdAt)}
                  />
                  <Row
                    icon={<Clock className="size-3.5" />}
                    label="Dernière modification"
                    value={formatRelative(task.updatedAt)}
                  />
                </dl>
              </Card>
            </div>

            <Card title="Progression">
              {/* Cycle a sens unique : les etapes franchies sont verrouillees. */}
              <ol className="flex flex-col gap-1.5">
                {STATUS_ORDER.map((step) => {
                  const meta = STATUS_META[step]
                  const current = step === task.status
                  const available = !current && canMoveTo(task.status, step)
                  const reached = current || !canMoveTo(task.status, step)

                  return (
                    <li key={step}>
                      <button
                        type="button"
                        disabled={!available || busy}
                        onClick={() => onChangeStatus(task, step)}
                        title={available || current ? undefined : 'Étape déjà franchie'}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-control border px-3 py-2.5 text-left',
                          'text-[13px] font-semibold transition-colors',
                          current && 'border-accent bg-accent-soft text-accent',
                          available &&
                            'border-border-hairline bg-surface text-ink-muted hover:border-accent hover:text-accent',
                          !current && !available &&
                            'cursor-not-allowed border-border-hairline bg-recessed text-ink-disabled',
                        )}
                      >
                        <span
                          className={cn(
                            'flex size-5 shrink-0 items-center justify-center rounded-full',
                            reached ? meta.accent : 'border border-border-strong bg-surface',
                          )}
                        >
                          {reached && <Check className="size-3 text-white" />}
                        </span>

                        <span className="flex-1">{meta.label}</span>

                        {current && <span className="text-[11px] uppercase tracking-[0.03em]">Actuel</span>}
                        {available && <ArrowRight className="size-3.5" />}
                        {!current && !available && <Lock className="size-3.5" />}
                      </button>
                    </li>
                  )
                })}
              </ol>

              {final ? (
                <p className="mt-3 flex items-start gap-2 rounded-control bg-done-bg px-3 py-2 text-[12px] leading-5 text-done-fg">
                  <Check className="mt-0.5 size-3.5 shrink-0" />
                  Tâche terminée. Le statut ne peut plus être modifié.
                </p>
              ) : (
                <p className="mt-3 text-[12px] leading-5 text-ink-muted">
                  Prochaine étape :{' '}
                  <span className="font-semibold text-ink">
                    {upcoming && STATUS_META[upcoming].label}
                  </span>
                  . Une étape franchie ne peut pas être reprise.
                </p>
              )}
            </Card>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border-hairline bg-surface px-6 py-3.5">
          <Button
            variant="ghost"
            size="compact"
            onClick={() => onDelete(task)}
            disabled={busy}
            className="mr-auto hover:bg-danger-bg hover:text-danger"
          >
            <Trash2 className="size-4" />
            Supprimer
          </Button>
          <Button variant="secondary" size="compact" onClick={onClose}>
            Fermer
          </Button>
          <Button size="compact" onClick={() => onEdit(task)} disabled={busy}>
            <Pencil className="size-4" />
            Modifier
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-border-hairline bg-surface shadow-level1">
      <h3 className="border-b border-border-hairline px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.03em] text-ink-muted">
        {title}
      </h3>
      <div className="px-4 py-3.5">{children}</div>
    </section>
  )
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-7 items-center justify-center rounded-control bg-recessed text-ink-muted">
        {icon}
      </span>
      <dt className="flex-1 text-[13px] text-ink-muted">{label}</dt>
      <dd className="text-[13px] font-semibold text-ink">{value}</dd>
    </div>
  )
}
