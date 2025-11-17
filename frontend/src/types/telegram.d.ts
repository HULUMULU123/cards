interface TelegramWebApp {
  initData?: string;
  ready: () => void;
  openInvoice?: (invoice: string, callback?: (status: string) => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export {};
