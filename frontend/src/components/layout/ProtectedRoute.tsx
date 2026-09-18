import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute() {
  const { user, initializing } = useAuth()
  const location = useLocation()

  // Tant que le token stocke n'est pas revalide, on n'affiche ni l'app ni la
  // page de connexion : rediriger trop tot ferait clignoter l'ecran de login
  // a chaque rechargement pour un utilisateur pourtant authentifie.
  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <Loader2 className="size-6 animate-spin text-accent" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return <Outlet />
}
