import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/cn'

// Hauteur 38px, rayon 8px, bordure hairline : DESIGN.md > Form Inputs & Textareas.
const FIELD_BASE =
  'w-full rounded-control border border-border-hairline bg-surface px-3 text-sm text-ink ' +
  'placeholder:text-ink-disabled transition-colors ' +
  'focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15'

interface FieldShellProps {
  label: string
  hint?: ReactNode
  error?: string
  htmlFor: string
  children: ReactNode
}

function FieldShell({ label, hint, error, htmlFor, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink">
          {label}
        </label>
        {hint && <span className="text-[11px] text-ink-muted">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-[12px] text-danger">{error}</p>}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: ReactNode
  error?: string
  icon?: ReactNode
}

export function Input({ label, hint, error, icon, className, ...props }: InputProps) {
  const id = useId()
  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id}>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-disabled">
            {icon}
          </span>
        )}
        <input
          {...props}
          id={id}
          aria-invalid={Boolean(error)}
          className={cn(
            FIELD_BASE,
            'h-[38px]',
            icon && 'pl-9',
            error && 'border-danger focus:border-danger focus:ring-danger/15',
            className,
          )}
        />
      </div>
    </FieldShell>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: ReactNode
  error?: string
}

export function Textarea({ label, hint, error, className, ...props }: TextareaProps) {
  const id = useId()
  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={id}>
      <textarea
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(
          FIELD_BASE,
          'min-h-[104px] resize-y py-2.5 leading-6',
          error && 'border-danger focus:border-danger focus:ring-danger/15',
          className,
        )}
      />
    </FieldShell>
  )
}
