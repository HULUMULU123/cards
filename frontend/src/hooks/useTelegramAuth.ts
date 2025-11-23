import { useEffect, useMemo, useState } from 'react'
import TelegramWebApp from '@vkruglikov/telegram-web-app'

import useAuthStore from '../store/useAuthStore'

export default function useTelegramAuth() {
  const initialize = useAuthStore((state) => state.initialize)
  const [webApp, setWebApp] = useState<typeof window.Telegram.WebApp | null>(null)

  useEffect(() => {
    const resolved = window.Telegram?.WebApp || TelegramWebApp || null
    if (resolved) {
      resolved.ready?.()
      setWebApp(resolved)
    } else {
      setWebApp(null)
    }
  }, [])

  useEffect(() => {
    void initialize(webApp)
  }, [initialize, webApp])

  return useMemo(
    () => ({
      webApp,
      isTelegram: Boolean(webApp),
    }),
    [webApp],
  )
}
