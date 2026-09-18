import type { ReactNode } from 'react'
import { Zap } from 'lucide-react'
import { Logo } from './Logo'

/**
 * Ecran scinde : panneau de marque a gauche, formulaire a droite.
 * Le gradient est reserve a ce contexte et aux actions primaires (DESIGN.md).
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <div className="gradient-brand relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        {/* Halo lumineux diagonal, purement decoratif. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1/4 opacity-60 blur-3xl"
          style={{
            background:
              'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 48%, transparent 62%)',
          }}
        />

        <div className="relative">
          <Logo className="[&_span:last-child]:text-white" />
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.03em] text-white">
            <Zap className="size-3.5" />
            Execution intentionnelle
          </span>
          <h1 className="mt-6 font-display text-[40px] font-bold leading-[1.1] tracking-[-0.02em] text-white">
            Clarte, autorite tranquille, elan.
          </h1>
          <p className="mt-4 text-[15px] leading-6 text-white/75">
            Organisez vos priorites quotidiennes dans un espace de travail unique,
            synchronise entre le web et le mobile.
          </p>
        </div>

        <p className="relative text-[12px] text-white/50">
          TaskFlow — gestionnaire de taches haute densite.
        </p>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
