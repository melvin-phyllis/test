// src/api/client.ts
import axios from 'axios'

// en dev, on passe par le proxy Vite => baseURL commence par /api
export const api = axios.create({ baseURL: '/api/v1' })

// (optionnel) helpers typés
export const getProspects = (params?: Record<string, any>) =>
  api.get('/prospects/', { params })

export const getCampaign = (id: number) =>
  api.get(`/prospecting/campaigns/${id}`)
