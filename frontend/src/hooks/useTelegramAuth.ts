import { useEffect, useMemo } from 'react'
import { useWebApp } from '@vkruglikov/react-telegram-web-app'

import useAuthStore from '../store/useAuthStore'

export default function useTelegramAuth() {
  const webApp = useWebApp()
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    if (!webApp) return

    // обозначаем готовность веб-приложения Telegram
    webApp.ready?.()

    void initialize(webApp)
  }, [webApp, initialize])

  return useMemo(
    () => ({
      webApp,
      isTelegram: Boolean(webApp),
    }),
    [webApp],
  )
}

