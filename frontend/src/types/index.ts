/** Miroir exact des DTO exposes par l'API Spring Boot. */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface User {
  id: number
  name: string
  email: string
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface TaskPayload {
  title: string
  description?: string | null
  status?: TaskStatus
}

/** Format d'erreur normalise renvoye par GlobalExceptionHandler. */
export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  fieldErrors?: Record<string, string>
}
