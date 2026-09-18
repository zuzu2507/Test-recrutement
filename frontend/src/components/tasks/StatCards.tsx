import { CircleCheck, Hourglass, ListChecks } from 'lucide-react'
import type { Task } from '@/types'

interface StatCardsProps {
  tasks: Task[]
}

/**
 * Les trois indicateurs sont derives de la liste reellement chargee.
 * Aucune metrique inventee : ce que l'API ne fournit pas n'est pas affiche.
 */
export function StatCards({ tasks }: StatCardsProps) {
  const total = tasks.length
  const inProgress = tasks.filter((task) => task.status === 'IN_PROGRESS').length
  const done = tasks.filter((task) => task.status === 'DONE').length
  const todo = tasks.filter((task) => task.status === 'TODO').length
  const completion = total === 0 ? 0 : Math.round((done / total) * 100)

  const cards = [
    {
      label: 'Total des taches',
      value: total,
      caption: total === 0 ? 'Aucune tache enregistree' : `${todo} en attente de demarrage`,
      icon: ListChecks,
      tone: 'text-accent bg-accent-soft',
    },
    {
      label: 'En cours',
      value: inProgress,
      caption: inProgress === 0 ? 'Rien en cours actuellement' : 'Actuellement en traitement',
      icon: Hourglass,
      tone: 'text-progress-fg bg-progress-bg',
    },
    {
      label: 'Terminees',
      value: done,
      caption: total === 0 ? 'En attente de donnees' : `${completion}% de l'ensemble`,
      icon: CircleCheck,
      tone: 'text-done-fg bg-done-bg',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ label, value, caption, icon: Icon, tone }) => (
        <article
          key={label}
          className="rounded-card border border-border-hairline bg-surface p-4 shadow-level1"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-semibold text-ink-muted">{label}</p>
            <span className={`flex size-9 items-center justify-center rounded-control ${tone}`}>
              <Icon className="size-[18px]" />
            </span>
          </div>
          <p className="mt-2 font-display text-[32px] font-bold leading-10 tracking-[-0.02em] text-ink">
            {value}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-muted">
            <span className="size-1.5 rounded-full bg-border-strong" />
            {caption}
          </p>
        </article>
      ))}
    </div>
  )
}
