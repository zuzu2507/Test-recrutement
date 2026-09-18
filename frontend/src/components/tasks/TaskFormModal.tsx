import { useEffect, useState, type FormEvent } from 'react'
import { Check, Lock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { STATUS_META } from '@/components/ui/StatusBadge'
import { STATUS_ORDER, canMoveTo } from '@/lib/status'
import { cn } from '@/lib/cn'
import type { Task, TaskPayload, TaskStatus } from '@/types'

interface TaskFormModalProps {
  open: boolean
  /** null = creation, sinon edition de la tache fournie. */
  task: Task | null
  submitting: boolean
  fieldErrors: Record<string, string>
  onClose: () => void
  onSubmit: (payload: TaskPayload) => void
}

const TITLE_MAX = 150

export function TaskFormModal({
  open,
  task,
  submitting,
  fieldErrors,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('TODO')

  // Reinitialise le formulaire a chaque ouverture, sinon la modale garderait
  // les valeurs de la tache precedemment editee.
  useEffect(() => {
    if (!open) return
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setStatus(task?.status ?? 'TODO')
  }, [open, task])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit({
      title: title.trim(),
      description: description.trim() === '' ? null : description.trim(),
      status,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? 'Modifier la tache' : 'Nouvelle tache'}
      description={
        task
          ? 'Mettez a jour le titre, la description ou le statut.'
          : 'Renseignez les informations de votre nouvelle tache.'
      }
      footer={
        <>
          <Button variant="secondary" size="compact" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button
            type="submit"
            form="task-form"
            size="compact"
            loading={submitting}
            disabled={title.trim().length === 0}
          >
            {!submitting && <Check className="size-4" />}
            {task ? 'Enregistrer' : 'Creer la tache'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Titre de la tache"
          hint={`${title.length} / ${TITLE_MAX}`}
          required
          maxLength={TITLE_MAX}
          autoFocus
          placeholder="Ex. Finaliser la maquette du tableau de bord"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={fieldErrors.title}
        />

        <Textarea
          label="Description"
          hint="Optionnelle"
          placeholder="Precisez le contexte, les etapes ou les criteres de reussite..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          error={fieldErrors.description}
        />

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-[13px] font-semibold text-ink">Statut</legend>
          <div className="grid grid-cols-3 gap-2">
            {STATUS_ORDER.map((value) => {
              const meta = STATUS_META[value]
              const active = status === value
              // A l'edition, le statut ne peut qu'avancer. A la creation,
              // les trois valeurs restent ouvertes.
              const allowed = task === null || canMoveTo(task.status, value)
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  disabled={!allowed}
                  aria-pressed={active}
                  title={allowed ? undefined : 'Le statut ne peut pas revenir en arriere'}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-control border px-3 py-2.5',
                    'text-[13px] font-semibold transition-all duration-150',
                    active && 'border-accent bg-accent-soft text-accent shadow-level1',
                    !active && allowed &&
                      'border-border-hairline bg-surface text-ink-muted hover:border-border-strong hover:text-ink',
                    !allowed &&
                      'cursor-not-allowed border-border-hairline bg-recessed text-ink-disabled',
                  )}
                >
                  {allowed ? (
                    <span className={cn('size-2 rounded-full', meta.accent)} />
                  ) : (
                    <Lock className="size-3.5" />
                  )}
                  {meta.label}
                </button>
              )
            })}
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}
