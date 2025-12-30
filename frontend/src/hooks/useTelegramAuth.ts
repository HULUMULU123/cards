import { useEffect, useMemo } from 'react'
import { useWebApp } from '@vkruglikov/react-telegram-web-app'

import useAuthStore from '../store/useAuthStore'

export default function useTelegramAuth() {
  const webApp = useWebApp()
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    if (webApp) {
      // обозначаем готовность веб-приложения Telegram
      webApp.ready?.()
      void initialize(webApp)
      return
    }
    void initialize(null)
  }, [webApp, initialize])

  return useMemo(
    () => ({
      webApp,
      isTelegram: Boolean(webApp),
    }),
    [webApp],
  )
}
