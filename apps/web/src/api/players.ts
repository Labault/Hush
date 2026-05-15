import type { Player, CreatePlayerPayload, UpdatePlayerPayload } from '@hush/shared'
import { apiFetch } from './client'

export function createPlayer(payload: CreatePlayerPayload): Promise<Player> {
  return apiFetch<Player>('/players', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getPlayer(id: string): Promise<Player> {
  return apiFetch<Player>(`/players/${id}`)
}

export function updatePlayerPseudo(id: string, payload: UpdatePlayerPayload): Promise<Player> {
  return apiFetch<Player>(`/players/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
