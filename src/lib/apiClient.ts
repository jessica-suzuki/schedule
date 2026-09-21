// Cada chamada em `api.*` já inclui o prefixo "/api/..." no path (ex.:
// api.post('/api/auth/login', ...)). VITE_API_URL deve ser só a origem do
// backend (ex.: "https://seudominio.com" ou "http://localhost:3001"). Se
// alguém configurar VITE_API_URL já com "/api" no final (comum quando o
// Nginx faz proxy de "/api" para o backend), removemos esse sufixo aqui
// para não duplicar o prefixo e virar "/api/api/...".
function resolveApiUrl(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3001'
  return raw.replace(/\/+$/, '').replace(/\/api$/, '')
}

const API_URL = resolveApiUrl()

const TOKEN_KEY = 'clinica_app_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 204) return undefined as T

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(body?.error || 'Erro ao comunicar com o servidor.')
  }

  return body as T
}

export const api = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined }),
  put: <T,>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: data !== undefined ? JSON.stringify(data) : undefined }),
  patch: <T,>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: data !== undefined ? JSON.stringify(data) : undefined }),
  delete: <T,>(path: string) => request<T>(path, { method: 'DELETE' }),
}
