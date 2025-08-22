import axios from 'axios'
import { Campaign, CampaignCreate, CampaignStats, Prospect, AgentActivity, AgentStatus } from '@/types'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const campaignApi = {
  // Get all campaigns
  getCampaigns: (params?: { skip?: number; limit?: number; status?: string }) =>
    api.get<Campaign[]>('/prospecting/campaigns', { params }),

  // Get single campaign
  getCampaign: (id: number) =>
    api.get<Campaign>(`/prospecting/campaigns/${id}`),

  // Create campaign
  createCampaign: (data: CampaignCreate) =>
    api.post<Campaign>('/prospecting/campaigns', data),

  // Update campaign
  updateCampaign: (id: number, data: Partial<CampaignCreate>) =>
    api.put<Campaign>(`/prospecting/campaigns/${id}`, data),

  // Start campaign
  startCampaign: (id: number) =>
    api.post(`/prospecting/campaigns/${id}/start`),

  // Stop campaign
  stopCampaign: (id: number) =>
    api.post(`/prospecting/campaigns/${id}/stop`),

  // Get campaign status
  getCampaignStatus: (id: number) =>
    api.get(`/prospecting/campaigns/${id}/status`),

  // Get campaign statistics
  getCampaignStats: (id: number) =>
    api.get<CampaignStats>(`/prospecting/campaigns/${id}/stats`),
}

export const prospectApi = {
  // Get prospects
  getProspects: (params?: { 
    campaign_id?: number
    sector?: string
    status?: string
    skip?: number
    limit?: number 
  }) =>
    api.get<Prospect[]>('/prospects', { params }),

  // Get single prospect
  getProspect: (id: number) =>
    api.get<Prospect>(`/prospects/${id}`),

  // Update prospect
  updateProspect: (id: number, data: Partial<Prospect>) =>
    api.put<Prospect>(`/prospects/${id}`, data),

  // Delete prospect
  deleteProspect: (id: number) =>
    api.delete(`/prospects/${id}`),
}

export const agentApi = {
  // Get agent activities
  getAgentActivity: (params?: {
    campaign_id?: number
    agent_name?: string
    status?: string
    skip?: number
    limit?: number
  }) =>
    api.get<AgentActivity[]>('/agents/activity', { params }),

  // Get agent status
  getAgentStatus: (params?: { campaign_id?: number }) =>
    api.get<AgentStatus[]>('/agents/status', { params }),

  // Get agent statistics
  getAgentStats: (params?: { campaign_id?: number; hours?: number }) =>
    api.get('/agents/stats', { params }),
}

export const systemApi = {
  // Health check
  healthCheck: () =>
    api.get('/prospecting/health'),

  // Get crew info
  getCrewInfo: () =>
    api.get('/prospecting/crew/info'),
}

export default api