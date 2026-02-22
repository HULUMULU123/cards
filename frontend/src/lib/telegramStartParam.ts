export function getTelegramStartParam(): string | null {
  if (typeof window === 'undefined') return null

  const telegramStartParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param
  if (telegramStartParam) {
    return String(telegramStartParam)
  }

  const params = new URLSearchParams(window.location.search)
  return params.get('tgWebAppStartParam') || params.get('startapp')
}

export function clearTelegramStartParamFromUrl(): void {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  const searchParams = url.searchParams
  const hadParam =
    searchParams.has('tgWebAppStartParam') || searchParams.has('startapp')

  if (!hadParam) return

  searchParams.delete('tgWebAppStartParam')
  searchParams.delete('startapp')
  url.search = searchParams.toString()
  window.history.replaceState(null, '', url.toString())
}

