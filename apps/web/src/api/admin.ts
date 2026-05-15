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

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (res.status === 401) throw new AdminAuthError()
  if (res.status === 403) throw new AdminCsrfError()

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body?.message) message = body.message
    } catch { /* ignore */ }
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

function withCsrf(options?: RequestInit): RequestInit {
  return {
    ...options,
    headers: {
      ...options?.headers,
      'X-CSRF-Token': getCsrfToken(),
    },
  }
}

export function login(username: string, password: string) {
  return adminFetch<{ admin: Admin; csrfToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout() {
  return adminFetch<{ ok: true }>('/auth/logout', withCsrf({ method: 'POST' }))
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
  return adminFetch<AdminSession>(`/admin/sessions/${id}/invalidate`, withCsrf({ method: 'PATCH' }))
}

export function revalidateSession(id: string) {
  return adminFetch<AdminSession>(`/admin/sessions/${id}/revalidate`, withCsrf({ method: 'PATCH' }))
}

export function getAllPlayers(page: number, perPage: number, search?: string) {
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage) })
  if (search) params.set('search', search)
  return adminFetch<PaginatedResponse<AdminPlayer>>(`/admin/players?${params}`)
}

export function deletePlayer(id: string) {
  return adminFetch<AdminPlayer>(`/admin/players/${id}`, withCsrf({ method: 'DELETE' }))
}
