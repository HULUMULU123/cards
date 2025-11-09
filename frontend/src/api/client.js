const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function request(endpoint, { method = 'GET', body, token } = {}) {
  const headers = {
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
    return null
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.detail || 'Ошибка при запросе к серверу'
    throw new Error(message)
  }

  return data
}

const apiClient = {
  get: (endpoint, token) => request(endpoint, { method: 'GET', token }),
  post: (endpoint, body, token) => request(endpoint, { method: 'POST', body, token }),
}

export default apiClient
