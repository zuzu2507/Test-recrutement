import { useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/cn'

const MIN_PASSWORD_LENGTH = 6

/** Indicateur visuel simple : longueur, presence de lettres et de chiffres. */
function passwordStrength(password: string): { score: number; label: string; tone: string } {
  if (!password) return { score: 0, label: 'Vide', tone: 'bg-border-hairline' }
  let score = 0
  if (password.length >= MIN_PASSWORD_LENGTH) score++
  if (password.length >= 10) score++
  if (/[a-zA-Z]/.test(password) && /\d/.test(password)) score++
  const levels = [
    { label: 'Faible', tone: 'bg-danger' },
    { label: 'Correct', tone: 'bg-progress-fg' },
    { label: 'Bon', tone: 'bg-accent' },
    { label: 'Solide', tone: 'bg-done-fg' },
  ]
  return { score, ...levels[score] }
}

export function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const { notify } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const strength = useMemo(() => passwordStrength(password), [password])

  if (user) return <Navigate to="/tasks" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFieldErrors({})

    // Verification locale : l'API ne connait pas le champ de confirmation.
    if (password !== confirm) {
      setFieldErrors({ confirm: 'Les deux mots de passe ne correspondent pas.' })
      return
    }

    setSubmitting(true)
    try {
      await register(name, email, password)
      navigate('/tasks', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors) setFieldErrors(error.fieldErrors)
        else notify(error.message)
      } else {
        notify('Une erreur inattendue est survenue.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="font-display text-[32px] font-bold leading-10 tracking-[-0.02em] text-ink">
        Créer votre compte
      </h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Commencez à organiser vos projets et vos tâches personnelles.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        <Input
          label="Nom complet"
          hint="Obligatoire"
          autoComplete="name"
          required
          icon={<UserIcon className="size-4" />}
          placeholder="Zuber Ndengue"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name}
        />

        <Input
          label="Adresse email"
          type="email"
          autoComplete="email"
          required
          icon={<Mail className="size-4" />}
          placeholder="vous@exemple.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
        />

        <div>
          <Input
            label="Mot de passe"
            hint={`${MIN_PASSWORD_LENGTH} caractères minimum`}
            type="password"
            autoComplete="new-password"
            required
            icon={<Lock className="size-4" />}
            placeholder="Choisissez un mot de passe"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
          />
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border-hairline">
              <div
                className={cn('h-full rounded-full transition-all duration-300', strength.tone)}
                style={{ width: `${(strength.score / 3) * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-ink-muted">{strength.label}</span>
          </div>
        </div>

        <Input
          label="Confirmer le mot de passe"
          type="password"
          autoComplete="new-password"
          required
          icon={<Lock className="size-4" />}
          placeholder="Répétez le mot de passe"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={fieldErrors.confirm}
        />

        <Button type="submit" loading={submitting} className="mt-2 w-full">
          Créer le compte
          {!submitting && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Vous avez déjà un compte ?{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  )
}
