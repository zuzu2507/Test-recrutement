import type { TaskStatus } from '@/types'

/**
 * Miroir de la regle appliquee par le backend (TaskStatus.canMoveTo) :
 * la progression est a sens unique, TODO -> IN_PROGRESS -> DONE.
 * Ce module ne sert qu'a griser ce qui est interdit ; l'API reste la seule
 * autorite et renvoie un 409 si la regle est contournee.
 */
const RANK: Record<TaskStatus, number> = {
  TODO: 0,
  IN_PROGRESS: 1,
  DONE: 2,
}

export const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']

export function canMoveTo(from: TaskStatus, to: TaskStatus): boolean {
  return RANK[to] >= RANK[from]
}

/** Statut suivant dans le cycle, ou null si la tache est deja terminee. */
export function nextStatus(from: TaskStatus): TaskStatus | null {
  const index = STATUS_ORDER.indexOf(from)
  return index < STATUS_ORDER.length - 1 ? STATUS_ORDER[index + 1] : null
}

export function isFinal(status: TaskStatus): boolean {
  return nextStatus(status) === null
}
