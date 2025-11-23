import apiClient from './client'
import { Card, CollectionResponse } from '../types/entities'

export interface OpenCardResponse {
  card: Card
  group?: string
}

export const fetchCollection = (token?: string | null) => apiClient.get<CollectionResponse>('/collection/', token)

export const openCard = (token?: string | null) => apiClient.post<OpenCardResponse>('/collection/', {}, token)
