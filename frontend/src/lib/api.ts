import type { ApiErrorBody, AuthResponse, Task, TaskPayload, TaskStatus, User } from '@/types'

const TOKEN_KEY = 'taskflow.token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Erreur applicative portant le corps normalise de l'API.
 * `fieldErrors` permet d'afficher les messages sous les champs concernes
 * plutot que dans un toast generique.
 */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: Record<string, string>

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/** Declenche quand le token est absent, invalide ou expire : force la deconnexion. */
export type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler = () => {}

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()

  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    })
  } catch {
    // Echec reseau : l'API est injoignable, on ne recoit meme pas de statut.
    throw new ApiError("Impossible de joindre le serveur. Vérifiez qu'il est démarré.", 0)
  }

  if (response.status === 401) {
    onUnauthorized()
    throw new ApiError('Session expirée, veuillez vous reconnecter.', 401)
  }

  if (!response.ok) {
    let body: Partial<ApiErrorBody> = {}
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      // Reponse sans corps JSON : on retombe sur un message generique.
    }
    throw new ApiError(
      body.message ?? `Erreur ${response.status}`,
      response.status,
      body.fieldErrors,
    )
  }

  // 204 No Content : pas de corps a parser.
  if (response.status === 204) return undefined as T

  return (await response.json()) as T
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>('/api/auth/me'),

  listTasks: (filters: { status?: TaskStatus; search?: string } = {}) => {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.search?.trim()) params.set('search', filters.search.trim())
    const query = params.toString()
    return request<Task[]>(`/api/tasks${query ? `?${query}` : ''}`)
  },

  createTask: (payload: TaskPayload) =>
    request<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(payload) }),

  updateTask: (id: number, payload: TaskPayload) =>
    request<Task>(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteTask: (id: number) => request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
}
