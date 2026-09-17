import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, clearToken, getToken, setToken, setUnauthorizedHandler } from '@/lib/api'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  /** true tant que le token stocke n'a pas ete revalide aupres de l'API. */
  initializing: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  // Un 401 renvoye par n'importe quel appel purge la session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken()
      setUser(null)
    })
  }, [])

  // Au chargement, un token en localStorage ne prouve rien : il peut etre
  // expire ou correspondre a un compte supprime. On le revalide via /me.
  useEffect(() => {
    if (!getToken()) {
      setInitializing(false)
      return
    }
    api
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setInitializing(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password)
    setToken(response.token)
    setUser(response.user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await api.register(name, email, password)
    setToken(response.token)
    setUser(response.user)
  }, [])

  const value = useMemo(
    () => ({ user, initializing, login, register, logout }),
    [user, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
