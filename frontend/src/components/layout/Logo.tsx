import { cn } from '@/lib/cn'

/** Marque TaskFlow : tuile gradient + monogramme, reprise de l'icone applicative. */
export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="gradient-brand flex size-8 items-center justify-center rounded-[10px] shadow-level1">
        <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
          <rect x="3" y="5" width="15" height="2.8" rx="1.4" fill="white" />
          <rect x="3" y="10.6" width="11" height="2.8" rx="1.4" fill="white" />
          <rect x="3" y="16.2" width="7" height="2.8" rx="1.4" fill="white" />
          <circle cx="17.5" cy="16.5" r="5" fill="white" />
          <path
            d="M15.4 16.6l1.5 1.5 2.7-3"
            stroke="#2563eb"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
          TaskFlow
        </span>
      )}
    </div>
  )
}
