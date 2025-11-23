export interface TelegramUser {
  username?: string
  first_name?: string
  last_name?: string
  photo_url?: string
}

export interface UserProfile {
  user: TelegramUser
  telegram_id: string
  telegram_stars_balance: number
  stars_balance: number
  stars_withdrawable: number
  referrals_count: number
  cards_opened: number
  cards_total: number
  card_open_price?: number
  referral_code: string
  referral_link?: string
  cards_groups?: { template__group__name: string; count: number }[]
}

export interface Card {
  id: string
  title: string
  rarity: string
  quantity: number
  image_url?: string
  animation_url?: string
  group?: string | null
}

export interface WithdrawRequest {
  stars_amount: number
  recipient_username: string
}

export interface WithdrawHistoryItem {
  id: string | number
  recipient_username: string
  stars_amount: number
  created_at?: string
}

export interface CollectionResponse {
  cards: Card[]
}

export interface WithdrawHistoryResponse {
  history: WithdrawHistoryItem[]
}

export interface InvoiceResponse {
  payload: string
}

export interface TelegramAuthResponse {
  access: string
  profile: UserProfile
}
