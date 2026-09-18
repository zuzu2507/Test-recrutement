import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
  search: string
  onSearchChange: (value: string) => void
}

export function AppLayout({ children, search, onSearchChange }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[68px] shrink-0 items-center gap-4 border-b border-border-hairline bg-canvas px-8">
          <div className="relative w-full max-w-[560px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-disabled" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Rechercher une tache par titre ou description..."
              aria-label="Rechercher une tache"
              className="h-10 w-full rounded-control border border-border-hairline bg-recessed pl-10 pr-3 text-sm text-ink placeholder:text-ink-disabled transition-colors focus:border-accent focus:bg-surface focus:outline-none focus:ring-[3px] focus:ring-accent/15"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 pb-10 pt-6">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
