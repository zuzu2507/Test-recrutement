import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { ApiError } from '@/lib/api'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const { notify } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/tasks" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFieldErrors({})
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/tasks', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        // Erreurs de validation sous les champs, le reste en toast.
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
      
      <h1 className="mt-4 font-display text-[32px] font-bold leading-10 tracking-[-0.02em] text-ink">
        Bon retour
      </h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Connectez-vous pour retrouver votre espace de travail et vos tâches.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
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

        <Input
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          icon={<Lock className="size-4" />}
          placeholder="Votre mot de passe"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
        />

        <Button type="submit" loading={submitting} className="mt-2 w-full">
          Se connecter
          {!submitting && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-semibold text-accent hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  )
}
