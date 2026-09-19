import { useState } from 'react'
import { KeyRound, LogOut, Mail, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/hooks/useAuth'

export function SettingsPage() {
  const { user, logout } = useAuth()
  const [confirmLogout, setConfirmLogout] = useState(false)

  const rows = [
    { icon: UserIcon, label: 'Nom complet', value: user?.name ?? '-' },
    { icon: Mail, label: 'Adresse email', value: user?.email ?? '-' },
    { icon: KeyRound, label: 'Identifiant interne', value: `#${user?.id ?? '-'}` },
  ]

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.03em] text-accent">
          <span className="size-1.5 rounded-full bg-accent" />
          Compte
        </p>
        <h1 className="mt-1.5 font-display text-[32px] font-bold leading-10 tracking-[-0.02em] text-ink">
          Paramètres
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Informations de votre compte et gestion de la session.
        </p>
      </header>

      <section className="overflow-hidden rounded-card border border-border-hairline bg-surface shadow-level1">
        <h2 className="border-b border-border-hairline px-5 py-3.5 text-[13px] font-semibold text-ink">
          Profil
        </h2>
        <dl className="divide-y divide-border-hairline">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-5 py-3.5">
              <span className="flex size-8 items-center justify-center rounded-control bg-recessed text-ink-muted">
                <Icon className="size-4" />
              </span>
              <dt className="w-44 text-[13px] text-ink-muted">{label}</dt>
              <dd className="flex-1 text-sm font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border-hairline bg-surface p-5 shadow-level1">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">Déconnexion</h2>
        </div>
        <Button variant="secondary" size="compact" onClick={() => setConfirmLogout(true)}>
          <LogOut className="size-4" />
          Se déconnecter
        </Button>
      </section>

      <ConfirmDialog
        open={confirmLogout}
        title="Déconnexion"
        description="Voulez-vous vous déconnecter ?"
        confirmLabel="Se déconnecter"
        icon={
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-recessed">
            <LogOut className="size-[18px] text-ink-muted" />
          </span>
        }
        onConfirm={logout}
        onClose={() => setConfirmLogout(false)}
      />
    </div>
  )
}
