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

  const data = (await response.json().catch(() => null)) as T | null

  if (!response.ok) {
    const message = (data as { detail?: string } | null)?.detail || 'Ошибка при запросе к серверу'
    throw new Error(message)
  }

  return data as T
}

const apiClient = {
  get: <T>(endpoint: string, token?: string | null) => request<T>(endpoint, { method: 'GET', token }),
  post: <T>(endpoint: string, body: unknown, token?: string | null) => request<T>(endpoint, { method: 'POST', body, token }),
}

export default apiClient
