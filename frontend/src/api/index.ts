import apiClient from './client'
import {
  Card,
  CollectionResponse,
  InvoiceResponse,
  TelegramAuthResponse,
  UserProfile,
  WithdrawHistoryItem,
  WithdrawHistoryResponse,
  WithdrawRequest,
} from '../types/entities'

export const authorizeWithTelegram = (initData: string, stars?: number | null) => {
  const payload: Record<string, unknown> = { init_data: initData }

  if (typeof stars === 'number') {
    payload.stars = stars
  }

  return apiClient.post<TelegramAuthResponse>('/auth/telegram/', payload)
}

export const fetchProfile = (token?: string | null) => apiClient.get<UserProfile>('/profile/', token)

export const fetchCollection = (token?: string | null) =>
  apiClient.get<CollectionResponse>('/collection/', token)

export const openCard = (token?: string | null) => apiClient.post<{ card: Card }>('/collection/', {}, token)

export const fetchWithdrawHistory = (token?: string | null) =>
  apiClient.get<WithdrawHistoryResponse>('/withdraw/', token)

export const submitWithdrawRequest = (payload: WithdrawRequest, token?: string | null) =>
  apiClient.post<WithdrawHistoryItem>('/withdraw/', payload, token)

export const createStarsInvoice = (amount: number, token?: string | null) =>
  apiClient.post<InvoiceResponse>('/stars/invoice/', { stars_amount: amount }, token)
