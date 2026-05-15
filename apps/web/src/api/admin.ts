import type { Admin, AdminStats, AdminSession, AdminPlayer, PaginatedResponse } from '@hush/shared'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export class AdminAuthError extends Error {
  constructor() {
    super('Non authentifié')
    this.name = 'AdminAuthError'
  }
}

export class AdminCsrfError extends Error {
  constructor() {
    super('Token CSRF invalide')
    this.name = 'AdminCsrfError'
  }
}

function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)hush_csrf=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const isMutation = method !== 'GET' && method !== 'HEAD'
  const csrfToken = getCsrfToken()

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(isMutation && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...(options.headers ?? {}),
    },
  })

  if (response.status === 401) throw new AdminAuthError()
  if (response.status === 403) throw new AdminCsrfError()

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch { /* ignore */ }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export function login(username: string, password: string) {
  return adminFetch<{ admin: Admin; csrfToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout() {
  return adminFetch<{ ok: true }>('/auth/logout', { method: 'POST' })
}

export function getMe() {
  return adminFetch<Admin>('/auth/me')
}

export function getAdminStats() {
  return adminFetch<AdminStats>('/admin/stats')
}

export function getAllSessions(page: number, perPage: number) {
  return adminFetch<PaginatedResponse<AdminSession>>(
    `/admin/sessions?page=${page}&perPage=${perPage}`,
  )
}

export function invalidateSession(id: string) {
  return adminFetch<AdminSession>(`/admin/sessions/${id}/invalidate`, { method: 'PATCH' })
}

export function revalidateSession(id: string) {
  return adminFetch<AdminSession>(`/admin/sessions/${id}/revalidate`, { method: 'PATCH' })
}

export function getAllPlayers(page: number, perPage: number, search?: string) {
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage) })
  if (search) params.set('search', search)
  return adminFetch<PaginatedResponse<AdminPlayer>>(`/admin/players?${params}`)
}

export function deletePlayer(id: string) {
  return adminFetch<AdminPlayer>(`/admin/players/${id}`, { method: 'DELETE' })
}
