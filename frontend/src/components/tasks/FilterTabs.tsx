import type { Task, TaskStatus } from '@/types'
import { cn } from '@/lib/cn'

export type StatusFilter = TaskStatus | 'ALL'

interface FilterTabsProps {
  value: StatusFilter
  onChange: (value: StatusFilter) => void
  tasks: Task[]
}

const TABS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'ALL', label: 'Toutes' },
  { key: 'TODO', label: 'À faire' },
  { key: 'IN_PROGRESS', label: 'En cours' },
  { key: 'DONE', label: 'Terminées' },
]

export function FilterTabs({ value, onChange, tasks }: FilterTabsProps) {
  const countFor = (key: StatusFilter) =>
    key === 'ALL' ? tasks.length : tasks.filter((task) => task.status === key).length

  return (
    <div className="inline-flex items-center gap-1 rounded-card border border-border-hairline bg-surface p-1 shadow-level1">
      {TABS.map(({ key, label }) => {
        const active = value === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={active}
            className={cn(
              'flex items-center gap-2 rounded-control px-3 py-1.5 text-[13px] font-semibold transition-colors',
              active ? 'bg-accent-soft text-accent' : 'text-ink-muted hover:bg-recessed hover:text-ink',
            )}
          >
            {label}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
                active ? 'bg-accent/15 text-accent' : 'bg-recessed text-ink-muted',
              )}
            >
              {countFor(key)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
