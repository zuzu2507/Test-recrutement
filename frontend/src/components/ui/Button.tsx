import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'compact' | 'default'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

// Specifications issues de DESIGN.md > Components > Buttons.
const VARIANTS: Record<Variant, string> = {
  primary:
    'gradient-brand text-white border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110 hover:shadow-level2',
  secondary:
    'bg-surface text-ink border border-border-hairline hover:bg-canvas hover:border-border-strong',
  ghost: 'bg-transparent text-ink-muted hover:bg-recessed hover:text-ink',
  destructive: 'bg-danger text-white hover:bg-danger-hover',
}

const SIZES: Record<Size, string> = {
  compact: 'h-9 px-3 text-[13px]',
  default: 'h-10 px-4 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-control font-semibold',
        'transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
        'disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:brightness-100',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}
