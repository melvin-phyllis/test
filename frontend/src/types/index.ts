export interface Campaign {
  id: number
  name: string
  product_description: string
  target_location: string
  target_sectors: string[]
  prospect_count: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  started_at?: string
  completed_at?: string
  results_summary: Record<string, any>
  config?: Record<string, any>
}

export interface CampaignCreate {
  name: string
  product_description: string
  target_location?: string
  target_sectors?: string[]
  prospect_count?: number
  config?: Record<string, any>
}

export interface CampaignStats {
  total_prospects: number
  prospects_by_status: Record<string, number>
  prospects_by_sector: Record<string, number>
  average_quality_score: number
  completion_rate: number
}

export interface Prospect {
  id: number
  campaign_id: number
  company_name: string
  website?: string
  description?: string
  sector?: string
  location?: string
  contact_name?: string
  contact_position?: string
  email?: string
  phone?: string
  whatsapp?: string
  quality_score: number
  status: string
  created_at: string
  updated_at: string
  extra_data: Record<string, any>
}

export interface AgentActivity {
  id: number
  campaign_id: number
  agent_name: string
  agent_role?: string
  task_name?: string
  task_description?: string
  status: string
  message?: string
  error_message?: string
  started_at: string
  completed_at?: string
  extra_data: Record<string, any>
}

export interface AgentStatus {
  agent_name: string
  status: 'idle' | 'working' | 'completed' | 'error'
  current_task?: string
  progress: number
  last_activity: string
}

export interface WebSocketMessage {
  type: string
  campaign_id: number
  data?: any
  timestamp: string
}

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}