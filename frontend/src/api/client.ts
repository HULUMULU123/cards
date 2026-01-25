const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://giftcardstg.ru/api'

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  token?: string | null
}

async function request<T>(endpoint: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) {
    return null as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  let data: T | { detail?: string } | string | null = null
  if (contentType.includes('application/json')) {
    data = (await response.json().catch(() => null)) as T | null
  } else {
    const text = await response.text().catch(() => '')
    data = text || null
  }

  if (!response.ok) {
    const detail =
      (data && typeof data === 'object' && 'detail' in data ? (data as { detail?: string }).detail : null) ||
      (typeof data === 'string' ? data : null)
    const fallback = response.statusText ? `${response.status} ${response.statusText}` : `Ошибка сервера (${response.status})`
    const message = detail || fallback
    throw new Error(message)
  }

  return data as T
}

const apiClient = {
  get: <T>(endpoint: string, token?: string | null) => request<T>(endpoint, { method: 'GET', token }),
  post: <T>(endpoint: string, body: unknown, token?: string | null) => request<T>(endpoint, { method: 'POST', body, token }),
}

export default apiClient
