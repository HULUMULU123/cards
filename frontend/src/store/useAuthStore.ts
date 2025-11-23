import { create } from 'zustand'

import {
  authorizeWithTelegram,
  createStarsInvoice,
  fetchCollection as fetchCollectionApi,
  fetchProfile as fetchProfileApi,
  fetchWithdrawHistory as fetchWithdrawHistoryApi,
  openCard as openCardApi,
  submitWithdrawRequest,
} from '../api'
import fallbackCardImage from '../assets/img/card.png'
import {
  Card,
  InvoiceResponse,
  UserProfile,
  WithdrawHistoryItem,
  WithdrawRequest,
} from '../types/entities'

const fallbackUser: UserProfile = {
  user: {
    username: 'tg_demo',
    first_name: 'Demo',
    last_name: 'User',
  },
  telegram_id: '0',
  telegram_stars_balance: 0,
  stars_balance: 417,
  stars_withdrawable: 300,
  referrals_count: 38,
  cards_opened: 70,
  cards_total: 12,
  referral_code: 'demo',
}

const fallbackCards: Card[] = [
  {
    id: 'demo-1',
    title: 'Демо-карточка',
    rarity: 'epic',
    quantity: 1,
    image_url: fallbackCardImage,
  },
]

const fallbackHistory: WithdrawHistoryItem[] = []

interface AuthState {
  token: string | null
  profile: UserProfile | null
  collection: Card[]
  withdrawHistory: WithdrawHistoryItem[]
  loading: boolean
  error: string | null
  appReady: boolean
}

interface AuthActions {
  setToken: (token: string | null) => void
  initialize: (telegram?: typeof window.Telegram.WebApp | null) => Promise<void>
  refreshAll: () => Promise<void>
  fetchProfile: () => Promise<void>
  fetchCollection: () => Promise<void>
  fetchWithdrawHistory: () => Promise<void>
  submitWithdraw: (payload: WithdrawRequest) => Promise<WithdrawHistoryItem>
  openStarsInvoice: (amount: number) => Promise<InvoiceResponse>
  openCardFromGroup: () => Promise<Card | null>
}

const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  token: null,
  profile: null,
  collection: [],
  withdrawHistory: [],
  loading: false,
  error: null,
  appReady: false,

  setToken: (token) => set({ token }),

  initialize: async (telegramInstance) => {
    const { token, appReady } = get()
    if (appReady) {
      return
    }
    try {
      if (token) {
        await get().refreshAll()
        return
      }
      const telegram = telegramInstance || window.Telegram?.WebApp
      if (telegram?.initData) {
        try {
          const starsBalance = (telegram as unknown as { initDataUnsafe?: { stars?: number; tg_web_app_star_count?: number } })
            ?.initDataUnsafe?.tg_web_app_star_count

          const response = await authorizeWithTelegram(telegram.initData, starsBalance)
          set({ token: response.access, profile: response.profile })
          telegram.ready?.()
          await get().refreshAll()
          return
        } catch (error) {
          console.warn('Failed to authorize via Telegram', error)
        }
      }
      // fallback demo data for local development without Telegram
      set({ token: null, profile: fallbackUser, collection: fallbackCards, withdrawHistory: fallbackHistory })
    } finally {
      set({ appReady: true })
    }
  },

  refreshAll: async () => {
    const { token } = get()
    if (!token) {
      return
    }
    await Promise.all([get().fetchProfile(), get().fetchCollection(), get().fetchWithdrawHistory()])
  },

  fetchProfile: async () => {
    const { token } = get()
    if (!token) return
    try {
      const data = await fetchProfileApi(token)
      if (data) {
        set({ profile: data })
      }
    } catch (error) {
      console.error('Failed to fetch profile', error)
    }
  },

  fetchCollection: async () => {
    const { token } = get()
    if (!token) return
    try {
      const data = await fetchCollectionApi(token)
      if (data?.cards) {
        set({ collection: data.cards })
      }
    } catch (error) {
      console.error('Failed to fetch collection', error)
    }
  },

  fetchWithdrawHistory: async () => {
    const { token } = get()
    if (!token) return
    try {
      const data = await fetchWithdrawHistoryApi(token)
      if (data?.history) {
        set({ withdrawHistory: data.history })
      }
    } catch (error) {
      console.error('Failed to fetch withdraw history', error)
    }
  },

  submitWithdraw: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { token } = get()
      if (!token) {
        throw new Error('Авторизуйтесь в Telegram для вывода')
      }
      const data = await submitWithdrawRequest(payload, token)
      set((state) => ({
        withdrawHistory: [data, ...state.withdrawHistory],
        loading: false,
      }))
      await get().fetchProfile()
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось выполнить вывод'
      set({ error: message, loading: false })
      throw error
    }
  },

  openCardFromGroup: async () => {
    const { token } = get()
    if (!token) return null
    const result = await openCardApi(token)
    if (result?.card) {
      await get().fetchCollection()
      await get().fetchProfile()
      return result.card
    }
    return null
  },

  openStarsInvoice: async (amount) => {
    const telegram = window.Telegram?.WebApp
    if (!telegram) {
      throw new Error('Telegram WebApp API недоступно')
    }
    const { token } = get()
    if (!token) {
      throw new Error('Авторизуйтесь в Telegram для покупки звёзд')
    }
    const invoice = await createStarsInvoice(amount, token)
    if (telegram.openInvoice) {
      telegram.openInvoice(invoice.payload, (status) => {
        if (status === 'paid') {
          void get().fetchProfile()
        }
      })
    }
    return invoice
  },
}))

export default useAuthStore
