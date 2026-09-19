import { useCallback, useEffect, useRef, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { canMoveTo, nextStatus } from '@/lib/status'
import type { Task, TaskPayload, TaskStatus } from '@/types'

interface Filters {
  status?: TaskStatus
  search?: string
}

/**
 * Source de verite des taches. Le filtrage et la recherche sont delegues a
 * l'API (parametres ?status= et ?search=), pas refaits cote client.
 */
export function useTasks(filters: Filters) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const { notify } = useToast()

  const { status, search } = filters

  // Evite qu'une reponse lente d'une recherche precedente n'ecrase
  // le resultat d'une frappe plus recente.
  const requestId = useRef(0)

  const refresh = useCallback(async () => {
    const current = ++requestId.current
    setLoading(true)
    try {
      const data = await api.listTasks({ status, search })
      if (current === requestId.current) setTasks(data)
    } catch (error) {
      if (current === requestId.current && error instanceof ApiError && error.status !== 401) {
        notify(error.message)
      }
    } finally {
      if (current === requestId.current) setLoading(false)
    }
  }, [status, search, notify])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createTask = useCallback(
    async (payload: TaskPayload) => {
      const created = await api.createTask(payload)
      await refresh()
      notify(`Tache "${created.title}" créée.`, 'success')
    },
    [refresh, notify],
  )

  const updateTask = useCallback(
    async (id: number, payload: TaskPayload) => {
      const updated = await api.updateTask(id, payload)
      await refresh()
      notify(`Tache "${updated.title}" mise à jour.`, 'success')
    },
    [refresh, notify],
  )

  const deleteTask = useCallback(
    async (task: Task) => {
      setBusyId(task.id)
      try {
        await api.deleteTask(task.id)
        await refresh()
        notify(`Tache "${task.title}" supprimée.`, 'success')
      } finally {
        setBusyId(null)
      }
    },
    [refresh, notify],
  )

  /**
   * Fait avancer une tache vers un statut donne. La progression est a sens
   * unique : le backend refuse tout retour en arriere par un 409.
   */
  const changeStatus = useCallback(
    async (task: Task, status: TaskStatus) => {
      if (!canMoveTo(task.status, status)) return
      setBusyId(task.id)
      try {
        await api.updateTask(task.id, {
          title: task.title,
          description: task.description,
          status,
        })
        await refresh()
      } catch (error) {
        if (error instanceof ApiError && error.status !== 401) notify(error.message)
      } finally {
        setBusyId(null)
      }
    },
    [refresh, notify],
  )

  /** Passe la tache a l'etape suivante depuis la case a cocher de la liste. */
  const advance = useCallback(
    async (task: Task) => {
      const upcoming = nextStatus(task.status)
      if (upcoming) await changeStatus(task, upcoming)
    },
    [changeStatus],
  )

  return {
    tasks,
    loading,
    busyId,
    refresh,
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
    advance,
  }
}
