interface TelegramWebAppUser {
  id?: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
}

interface TelegramWebApp {
  initData?: string
  initDataUnsafe?: {
    user?: TelegramWebAppUser
    stars?: number
    tg_web_app_star_count?: number
  }
  ready: () => void
  openInvoice?: (invoice: string, callback?: (status: string) => void) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export {};
