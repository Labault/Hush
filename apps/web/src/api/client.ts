const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch {
      // ignore parse error
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}
