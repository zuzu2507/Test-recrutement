import { NavLink } from 'react-router-dom'
import { LogOut, Settings, SquareCheck } from 'lucide-react'
import { Logo } from './Logo'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { to: '/tasks', label: 'Mes taches', icon: SquareCheck },
  { to: '/settings', label: 'Parametres', icon: Settings },
]

export function Sidebar() {
  const { user, logout } = useAuth()

  // Initiales en repli : l'API ne fournit pas de photo de profil.
  const initials = (user?.name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-border-hairline bg-surface">
      <div className="px-5 py-5">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-accent-soft text-accent'
                  : 'text-ink-muted hover:bg-recessed hover:text-ink',
              )
            }
          >
            <Icon className="size-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-border-hairline px-4 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[12px] font-bold text-accent">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-ink">{user?.name}</p>
          <p className="truncate text-[12px] text-ink-muted">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-control p-1.5 text-ink-disabled transition-colors hover:bg-recessed hover:text-danger"
          aria-label="Se deconnecter"
          title="Se deconnecter"
        >
          <LogOut className="size-[18px]" />
        </button>
      </div>
    </aside>
  )
}
