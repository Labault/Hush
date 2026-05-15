export type Player = {
  id: string
  pseudo: string
  createdAt: string
}

export type Session = {
  id: string
  playerId: string
  pseudoSnapshot: string
  startedAt: string
  endedAt: string
  durationMs: number
  isValid: boolean
  createdAt: string
}

export type Admin = {
  id: string
  username: string
  createdAt: string
}

export type AdminStats = {
  totalPlayers: number
  totalSessions: number
  totalInvalidSessions: number
  avgDurationMs: number | null
  maxDurationMs: number | null
  sessionsLast24h: number
  sessionsLast7d: number
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  perPage: number
}

export type AdminSession = {
  id: string
  playerId: string
  pseudoSnapshot: string
  durationMs: number
  isValid: boolean
  startedAt: string
  endedAt: string
  createdAt: string
  player: { id: string; pseudo: string }
}

export type AdminPlayer = {
  id: string
  pseudo: string
  createdAt: string
  _count: { sessions: number }
}

export type HealthResponse = {
  status: 'ok'
  timestamp: string
  db: 'connected' | 'error'
}

export type CreatePlayerPayload = {
  pseudo: string
}

export type UpdatePlayerPayload = {
  pseudo: string
}

export type CreateSessionPayload = {
  playerId: string
  startedAt: string
  endedAt: string
}

export type LeaderboardEntry = {
  id: string
  pseudoSnapshot: string
  durationMs: number
  createdAt: string
}
