import { create } from 'zustand'

import apiClient from '../api/client'

const fallbackUser = {
  user: {
    username: 'tg_demo',
    first_name: 'Demo',
    last_name: 'User',
  },
  telegram_id: '0',
  stars_balance: 417,
  stars_withdrawable: 300,
  referrals_count: 38,
  cards_opened: 70,
  cards_total: 12,
}

const fallbackCards = [
  {
    id: 'demo-1',
    title: 'Ice Watch',
    rarity: 'epic',
    quantity: 7,
    image_url: 'https://placehold.co/200x300/8833ff/ffffff?text=Ice+Watch',
  },
  {
    id: 'demo-2',
    title: 'City Lights',
    rarity: 'rare',
    quantity: 3,
    image_url: 'https://placehold.co/200x300/441199/ffffff?text=City+Lights',
  },
]

const fallbackHistory = []

const useAuthStore = create((set, get) => ({
  token: null,
  profile: null,
  collection: [],
  withdrawHistory: [],
  loading: false,
  error: null,

  setToken: (token) => set({ token }),

  initialize: async () => {
    const { token } = get()
    if (token) {
      return
    }
    const telegram = window.Telegram?.WebApp
    if (telegram?.initData) {
      try {
        const response = await apiClient.post('/auth/telegram/', { init_data: telegram.initData })
        set({ token: response.access, profile: response.profile })
        telegram.ready()
        await get().refreshAll()
        return
      } catch (error) {
        console.warn('Failed to authorize via Telegram', error)
      }
    }
    // fallback demo data for local development without Telegram
    set({ token: null, profile: fallbackUser, collection: fallbackCards, withdrawHistory: fallbackHistory })
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
      const data = await apiClient.get('/profile/', token)
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
      const data = await apiClient.get('/collection/', token)
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
      const data = await apiClient.get('/withdraw/', token)
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
      const data = await apiClient.post('/withdraw/', payload, token)
      set((state) => ({
        withdrawHistory: [data, ...state.withdrawHistory],
        loading: false,
      }))
      await get().fetchProfile()
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
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
    const invoice = await apiClient.post('/stars/invoice/', { stars_amount: amount }, token)
    if (telegram.openInvoice) {
      telegram.openInvoice(invoice.payload, (status) => {
        if (status === 'paid') {
          get().fetchProfile()
        }
      })
    }
    return invoice
  },
}))

export default useAuthStore
