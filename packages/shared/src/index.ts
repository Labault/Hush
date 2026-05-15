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

export type HealthResponse = {
  status: 'ok'
  timestamp: string
  db: 'connected' | 'error'
}
