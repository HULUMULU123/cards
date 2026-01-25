import { create } from 'zustand'
import queryClient from '../lib/queryClient'

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
  CollectionGroup,
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
  card_open_price: 0,
  referral_code: 'demo',
}

const fallbackCards: Card[] = [
  {
    id: 'demo-1',
    title: 'Демо-карточка',
    rank: 4,
    quantity: 1,
    image_url: fallbackCardImage,
  },
]

const fallbackHistory: WithdrawHistoryItem[] = []

interface AuthState {
  token: string | null
  profile: UserProfile | null
  collection: Card[]
  collectionGroups: CollectionGroup[]
  withdrawHistory: WithdrawHistoryItem[]
  loading: boolean
  error: string | null
  appReady: boolean
  authBlocked: boolean
  authMessage: string | null
}

interface AuthActions {
  setToken: (token: string | null) => void
  setError: (message: string | null) => void
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
  collectionGroups: [],
  withdrawHistory: [],
  loading: false,
  error: null,
  appReady: false,
  authBlocked: false,
  authMessage: null,

  setToken: (token) => set({ token }),
  setError: (message) => set({ error: message }),

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
      if (telegram) {
        const initData = telegram.initData
        console.log(
          'Telegram WebApp detected:',
          Boolean(telegram),
          'initData length:',
          initData?.length ?? 0,
        )
        if (!initData) {
          set({
            authBlocked: true,
            authMessage: 'Telegram initData отсутствует. Откройте приложение через кнопку WebApp бота.',
          })
          return
        }
        console.log(
          'Telegram initDataUnsafe stars:',
          telegram.initDataUnsafe?.tg_web_app_star_count,
          'initDataUnsafe:',
          telegram.initDataUnsafe,
        )
        try {
          const starsBalance = telegram.initDataUnsafe?.tg_web_app_star_count

          const response = await authorizeWithTelegram(initData, starsBalance)
          const photoUrl = telegram.initDataUnsafe?.user?.photo_url
          const profile = photoUrl
            ? { ...response.profile, user: { ...response.profile.user, photo_url: photoUrl } }
            : response.profile

          set({ token: response.access, profile, authBlocked: false, authMessage: null })
          telegram.ready?.()
          await get().refreshAll()
          return
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Не удалось проверить Telegram подпись'
          set({ authBlocked: true, authMessage: message })
          console.warn('Failed to authorize via Telegram', error)
          return
        }
      }
      set({
        authBlocked: true,
        authMessage: 'Откройте приложение через официального Telegram бота',
      })
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
      const data = await queryClient.fetchQuery({
        queryKey: ['profile', token],
        queryFn: () => fetchProfileApi(token),
        staleTime: 60_000,
      })
      console.log('Profile response with stars balance:', data)
      if (data) {
        const currentPhoto = get().profile?.user?.photo_url
        const profile = data.user
          ? { ...data, user: { ...data.user, photo_url: data.user.photo_url ?? currentPhoto } }
          : data
        set({ profile })
        queryClient.setQueryData(['profile', token], profile)
      }
    } catch (error) {
      console.error('Failed to fetch profile', error)
    }
  },

  fetchCollection: async () => {
    const { token } = get()
    if (!token) return
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['collection', token],
        queryFn: () => fetchCollectionApi(token),
        staleTime: 60_000,
      })
      if (data?.cards) {
        set({ collection: data.cards, collectionGroups: data.groups ?? [] })
        queryClient.setQueryData(['collection', token], data)
      }
    } catch (error) {
      console.error('Failed to fetch collection', error)
    }
  },

  fetchWithdrawHistory: async () => {
    const { token } = get()
    if (!token) return
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['withdrawHistory', token],
        queryFn: () => fetchWithdrawHistoryApi(token),
        staleTime: 60_000,
      })
      if (data?.history) {
        set({ withdrawHistory: data.history })
        queryClient.setQueryData(['withdrawHistory', token], data)
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
    try {
      const result = await openCardApi(token)
      if (result?.card) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['collection', token] }),
          queryClient.invalidateQueries({ queryKey: ['profile', token] }),
        ])
        await get().fetchCollection()
        await get().fetchProfile()
        return result.card
      }
      return null
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось открыть карточку'
      set({ error: message })
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
