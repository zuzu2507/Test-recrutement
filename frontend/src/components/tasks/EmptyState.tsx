import { ClipboardList, Plus, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  /** true si la liste est vide a cause d'un filtre ou d'une recherche. */
  filtered: boolean
  onCreate: () => void
  onReset: () => void
}

export function EmptyState({ filtered, onCreate, onReset }: EmptyStateProps) {
  if (filtered) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <span className="flex size-14 items-center justify-center rounded-card border border-border-hairline bg-recessed">
          <SearchX className="size-6 text-ink-disabled" />
        </span>
        <h3 className="mt-5 font-display text-[20px] font-semibold tracking-[-0.01em] text-ink">
          Aucun résultat
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
          Aucune tâche ne correspond à votre recherche ou au filtre sélectionné.
        </p>
        <Button variant="secondary" size="compact" onClick={onReset} className="mt-5">
          Réinitialiser les filtres
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="relative">
        <span className="flex size-16 items-center justify-center rounded-card border border-border-hairline bg-surface shadow-level2">
          <ClipboardList className="size-7 text-accent" />
        </span>
        <span className="gradient-brand absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full border-2 border-surface">
          <Plus className="size-3.5 text-white" />
        </span>
      </div>

      <h3 className="mt-6 font-display text-[22px] font-semibold tracking-[-0.015em] text-ink">
        Aucune tâche pour le moment
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
        Créez votre première tâche pour commencer à organiser votre journée.
        Elle sera immédiatement synchronisée avec le mobile.
      </p>

      <Button onClick={onCreate} className="mt-6">
        <Plus className="size-4" />
        Créer ma première tâche
      </Button>
    </div>
  )
}
