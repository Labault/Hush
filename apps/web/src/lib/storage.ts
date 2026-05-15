export const STORAGE_KEYS = { playerId: 'hush.playerId' } as const

export function getStoredPlayerId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.playerId)
  } catch {
    return null
  }
}

export function setStoredPlayerId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.playerId, id)
  } catch {
    // quota exceeded
  }
}

export function clearStoredPlayerId(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.playerId)
  } catch {
    // ignore
  }
}
