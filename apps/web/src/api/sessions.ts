import type { LeaderboardEntry, CreateSessionPayload, Session } from '@hush/shared'
import { apiFetch } from './client'

export function createSession(payload: CreateSessionPayload): Promise<Session> {
  return apiFetch<Session>('/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  return apiFetch<LeaderboardEntry[]>(`/sessions/leaderboard?limit=${limit}`)
}
