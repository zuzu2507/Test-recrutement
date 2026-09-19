import { useState } from 'react'
import { Loader2, Plus, RefreshCw } from 'lucide-react'
import { StatCards } from '@/components/tasks/StatCards'
import { FilterTabs, type StatusFilter } from '@/components/tasks/FilterTabs'
import { TaskTable } from '@/components/tasks/TaskTable'
import { TaskFormModal } from '@/components/tasks/TaskFormModal'
import { DeleteTaskDialog } from '@/components/tasks/DeleteTaskDialog'
import { EmptyState } from '@/components/tasks/EmptyState'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { Button } from '@/components/ui/Button'
import { useTasks } from '@/hooks/useTasks'
import { useToast } from '@/hooks/useToast'
import { ApiError } from '@/lib/api'
import type { Task, TaskPayload, TaskStatus } from '@/types'

interface TasksPageProps {
  /** Terme de recherche pilote par la barre de l'en-tete, deja debounce. */
  search: string
  onResetSearch: () => void
}

export function TasksPage({ search, onResetSearch }: TasksPageProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const { notify } = useToast()

  const { tasks, loading, busyId, refresh, createTask, updateTask, deleteTask, changeStatus, advance } =
    useTasks({
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      search,
    })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)

  function openCreate() {
    setEditing(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  function openEdit(task: Task) {
    setEditing(task)
    setFieldErrors({})
    setFormOpen(true)
  }

  async function handleSubmit(payload: TaskPayload) {
    setSubmitting(true)
    setFieldErrors({})
    try {
      if (editing) await updateTask(editing.id, payload)
      else await createTask(payload)
      setFormOpen(false)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors) setFieldErrors(error.fieldErrors)
        else if (error.status !== 401) notify(error.message)
      } else {
        notify('Une erreur inattendue est survenue.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteTask(pendingDelete)
      if (selectedId === pendingDelete.id) setSelectedId(null)
      setPendingDelete(null)
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) notify(error.message)
    } finally {
      setDeleting(false)
    }
  }

  // On relit la tache depuis la liste a jour plutot que de figer un objet
  // dans l'etat : le panneau reflete ainsi toute modification immediatement.
  const selected = tasks.find((task) => task.id === selectedId) ?? null

  const isFiltered = statusFilter !== 'ALL' || search.trim().length > 0

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.03em] text-accent">
            <span className="size-1.5 rounded-full bg-accent" />
            Espace de travail
          </p>
          <h1 className="mt-1.5 font-display text-[32px] font-bold leading-10 tracking-[-0.02em] text-ink">
            Mes tâches
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Gérez et suivez vos priorités quotidiennes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="compact" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw className={loading ? 'size-4 animate-spin' : 'size-4'} />
            Actualiser
          </Button>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nouvelle tâche
          </Button>
        </div>
      </header>

      <StatCards tasks={tasks} />

      <FilterTabs value={statusFilter} onChange={setStatusFilter} tasks={tasks} />

      <section className="overflow-hidden rounded-card border border-border-hairline bg-surface shadow-level1">
        {loading && tasks.length === 0 ? (
          <div className="flex items-center justify-center gap-2.5 py-20 text-sm text-ink-muted">
            <Loader2 className="size-4 animate-spin text-accent" />
            Chargement des tâches...
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            filtered={isFiltered}
            onCreate={openCreate}
            onReset={() => {
              setStatusFilter('ALL')
              onResetSearch()
            }}
          />
        ) : (
          <TaskTable
            tasks={tasks}
            busyId={busyId}
            selectedId={selectedId}
            onEdit={openEdit}
            onDelete={setPendingDelete}
            onAdvance={(task) => void advance(task)}
            onSelect={(task) => setSelectedId(task.id)}
          />
        )}
      </section>

      <TaskDetailModal
        task={selected}
        busy={busyId === selected?.id}
        onClose={() => setSelectedId(null)}
        onEdit={openEdit}
        onDelete={setPendingDelete}
        onChangeStatus={(task, status: TaskStatus) => void changeStatus(task, status)}
      />

      <TaskFormModal
        open={formOpen}
        task={editing}
        submitting={submitting}
        fieldErrors={fieldErrors}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload) => void handleSubmit(payload)}
      />

      <DeleteTaskDialog
        task={pendingDelete}
        submitting={deleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
