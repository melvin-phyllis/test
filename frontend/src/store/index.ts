import { create } from 'zustand'
import { Campaign, Prospect, AgentStatus, WebSocketMessage } from '@/types'

interface AppState {
  // Campaigns
  campaigns: Campaign[]
  selectedCampaign: Campaign | null
  
  // Prospects
  prospects: Prospect[]
  
  // Agents
  agentStatuses: AgentStatus[]
  
  // WebSocket
  isConnected: boolean
  lastMessage: WebSocketMessage | null
  
  // UI
  loading: boolean
  error: string | null
  
  // Actions
  setCampaigns: (campaigns: Campaign[]) => void
  setSelectedCampaign: (campaign: Campaign | null) => void
  updateCampaign: (campaign: Campaign) => void
  addCampaign: (campaign: Campaign) => void
  
  setProspects: (prospects: Prospect[]) => void
  addProspect: (prospect: Prospect) => void
  updateProspect: (prospect: Prospect) => void
  removeProspect: (prospectId: number) => void
  
  setAgentStatuses: (statuses: AgentStatus[]) => void
  updateAgentStatus: (status: AgentStatus) => void
  
  setWebSocketConnected: (connected: boolean) => void
  setLastMessage: (message: WebSocketMessage) => void
  
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  campaigns: [],
  selectedCampaign: null,
  prospects: [],
  agentStatuses: [],
  isConnected: false,
  lastMessage: null,
  loading: false,
  error: null,

  // Campaign actions
  setCampaigns: (campaigns) => set({ campaigns }),
  
  setSelectedCampaign: (campaign) => set({ selectedCampaign: campaign }),
  
  updateCampaign: (updatedCampaign) => set((state) => ({
    campaigns: state.campaigns.map(c => 
      c.id === updatedCampaign.id ? updatedCampaign : c
    ),
    selectedCampaign: state.selectedCampaign?.id === updatedCampaign.id 
      ? updatedCampaign 
      : state.selectedCampaign
  })),
  
  addCampaign: (campaign) => set((state) => ({
    campaigns: [campaign, ...state.campaigns]
  })),

  // Prospect actions
  setProspects: (prospects) => set({ prospects }),
  
  addProspect: (prospect) => set((state) => ({
    prospects: [prospect, ...state.prospects]
  })),
  
  updateProspect: (updatedProspect) => set((state) => ({
    prospects: state.prospects.map(p => 
      p.id === updatedProspect.id ? updatedProspect : p
    )
  })),
  
  removeProspect: (prospectId) => set((state) => ({
    prospects: state.prospects.filter(p => p.id !== prospectId)
  })),

  // Agent actions
  setAgentStatuses: (statuses) => set({ agentStatuses: statuses }),
  
  updateAgentStatus: (updatedStatus) => set((state) => ({
    agentStatuses: state.agentStatuses.map(s => 
      s.agent_name === updatedStatus.agent_name ? updatedStatus : s
    )
  })),

  // WebSocket actions
  setWebSocketConnected: (connected) => set({ isConnected: connected }),
  
  setLastMessage: (message) => set({ lastMessage: message }),

  // UI actions
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
}))

// Selectors
export const useCampaigns = () => useAppStore(state => state.campaigns)
export const useSelectedCampaign = () => useAppStore(state => state.selectedCampaign)
export const useProspects = () => useAppStore(state => state.prospects)
export const useAgentStatuses = () => useAppStore(state => state.agentStatuses)
export const useAppLoading = () => useAppStore(state => state.loading)
export const useAppError = () => useAppStore(state => state.error)