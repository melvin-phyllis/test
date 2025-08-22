import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useEffect, useState } from 'react'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Users, 
  Target, 
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  RefreshCw
} from 'lucide-react'
import { campaignApi, prospectApi, agentApi } from '@/services/api'
import { Campaign, CampaignStats, Prospect, AgentActivity, WebSocketMessage } from '@/types'
import { clsx } from 'clsx'
import { formatDate, formatTime } from '@/utils'
import toast from 'react-hot-toast'
import { wsService } from '@/services/websocket'

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>()
  const campaignId = parseInt(id!, 10)
  const queryClient = useQueryClient()
  const [realtimeMessages, setRealtimeMessages] = useState<WebSocketMessage[]>([])

  // Queries
  const { data: campaign, isLoading: campaignLoading } = useQuery<Campaign>(
    ['campaign', campaignId],
    () => campaignApi.getCampaign(campaignId).then(res => res.data),
    { enabled: !!campaignId }
  )

  const { data: stats } = useQuery<CampaignStats>(
    ['campaign-stats', campaignId],
    () => campaignApi.getCampaignStats(campaignId).then(res => res.data),
    { enabled: !!campaignId, refetchInterval: 10000 }
  )

  const { data: prospects = [] } = useQuery<Prospect[]>(
    ['prospects', campaignId],
    () => prospectApi.getProspects({ campaign_id: campaignId }).then(res => res.data),
    { enabled: !!campaignId, refetchInterval: 10000 }
  )

  const { data: activities = [] } = useQuery<AgentActivity[]>(
    ['agent-activities', campaignId],
    () => agentApi.getAgentActivity({ campaign_id: campaignId, limit: 50 }).then(res => res.data),
    { enabled: !!campaignId, refetchInterval: 5000 }
  )

  // Mutations
  const startCampaignMutation = useMutation(
    () => campaignApi.startCampaign(campaignId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['campaign', campaignId])
        toast.success('Campagne démarrée')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Erreur lors du démarrage')
      }
    }
  )

  const stopCampaignMutation = useMutation(
    () => campaignApi.stopCampaign(campaignId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['campaign', campaignId])
        toast.success('Campagne arrêtée')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Erreur lors de l\'arrêt')
      }
    }
  )

  // WebSocket integration
  useEffect(() => {
    if (!campaignId) return

    // Subscribe to campaign updates
    wsService.subscribeToCampaign(campaignId)

    const unsubscribe = wsService.subscribe('*', (message: WebSocketMessage) => {
      if (message.campaign_id === campaignId) {
        setRealtimeMessages(prev => [message, ...prev.slice(0, 49)]) // Keep last 50 messages
        
        // Refresh data based on message type
        if (message.type === 'campaign_status') {
          queryClient.invalidateQueries(['campaign', campaignId])
        } else if (message.type === 'results_processed') {
          queryClient.invalidateQueries(['prospects', campaignId])
          queryClient.invalidateQueries(['campaign-stats', campaignId])
        }
      }
    })

    return () => {
      unsubscribe()
      wsService.unsubscribeFromCampaign(campaignId)
    }
  }, [campaignId, queryClient])

  if (campaignLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Campagne non trouvée</p>
        <Link to="/campaigns" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Retour aux campagnes
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/campaigns" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className={clsx('status-badge', `status-${campaign.status}`)}>
                {campaign.status}
              </span>
              <span className="text-sm text-gray-500">
Créée le {formatDate(campaign.created_at, 'dd MMM yyyy')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          {campaign.status === 'pending' && (
            <button
              onClick={() => startCampaignMutation.mutate()}
              disabled={startCampaignMutation.isLoading}
              className="btn-success"
            >
              <Play className="h-4 w-4 mr-2" />
              {startCampaignMutation.isLoading ? 'Démarrage...' : 'Démarrer'}
            </button>
          )}
          
          {campaign.status === 'running' && (
            <button
              onClick={() => stopCampaignMutation.mutate()}
              disabled={stopCampaignMutation.isLoading}
              className="btn-danger"
            >
              <Pause className="h-4 w-4 mr-2" />
              {stopCampaignMutation.isLoading ? 'Arrêt...' : 'Arrêter'}
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Prospects trouvés"
            value={stats.total_prospects}
            target={campaign.prospect_count}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Taux de complétion"
            value={`${stats.completion_rate.toFixed(1)}%`}
            icon={Target}
            color="green"
          />
          <StatCard
            title="Score qualité moyen"
            value={`${stats.average_quality_score.toFixed(1)}/10`}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            title="Secteurs identifiés"
            value={Object.keys(stats.prospects_by_sector).length}
            icon={Activity}
            color="orange"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description du produit/service</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{campaign.product_description}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-500">Localisation cible</p>
                <p className="text-gray-900">{campaign.target_location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Objectif prospects</p>
                <p className="text-gray-900">{campaign.prospect_count}</p>
              </div>
            </div>
            
            {campaign.target_sectors && campaign.target_sectors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Secteurs ciblés</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.target_sectors.map((sector) => (
                    <span key={sector} className="status-badge bg-gray-100 text-gray-800">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prospects */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Prospects identifiés</h2>
              <Link to={`/prospects?campaign_id=${campaignId}`} className="text-primary-600 hover:text-primary-700 text-sm">
                Voir tous
              </Link>
            </div>
            
            {prospects.length > 0 ? (
              <div className="space-y-3">
                {prospects.slice(0, 5).map((prospect) => (
                  <ProspectRow key={prospect.id} prospect={prospect} />
                ))}
                {prospects.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    Et {prospects.length - 5} autre(s) prospect(s)...
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun prospect trouvé</p>
            )}
          </div>
        </div>

        {/* Real-time Activity */}
        <div className="space-y-6">
          {/* Agent Activities */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Activité des agents</h2>
              <RefreshCw className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activities.slice(0, 10).map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
              {activities.length === 0 && (
                <p className="text-gray-500 text-center py-4">Aucune activité</p>
              )}
            </div>
          </div>

          {/* Real-time Messages */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages temps réel</h2>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {realtimeMessages.map((message, index) => (
                <div key={index} className="text-sm border-l-2 border-primary-200 pl-3 py-1">
                  <p className="text-gray-600">{message.data?.message || message.type}</p>
                  <p className="text-xs text-gray-400">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              ))}
              {realtimeMessages.length === 0 && (
                <p className="text-gray-500 text-center py-4">En attente de messages...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper components
interface StatCardProps {
  title: string
  value: string | number
  target?: number
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function StatCard({ title, value, target, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  }

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={clsx('p-2 rounded-lg text-white', colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {value}
            {target && <span className="text-lg text-gray-500">/{target}</span>}
          </p>
        </div>
      </div>
    </div>
  )
}

function ProspectRow({ prospect }: { prospect: Prospect }) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{prospect.company_name}</p>
        <p className="text-sm text-gray-500">{prospect.sector}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {prospect.quality_score.toFixed(1)}/10
        </p>
        <p className="text-xs text-gray-500">{prospect.status}</p>
      </div>
    </div>
  )
}

function ActivityRow({ activity }: { activity: AgentActivity }) {
  return (
    <div className="text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{activity.agent_name}</span>
        <span className="text-xs text-gray-500">
          {formatTime(activity.started_at)}
        </span>
      </div>
      <p className="text-gray-600 mt-1">{activity.message || activity.task_name}</p>
      <span className={clsx('inline-block mt-1 px-2 py-0.5 rounded text-xs', 
        activity.status === 'completed' && 'bg-green-100 text-green-800',
        activity.status === 'running' && 'bg-blue-100 text-blue-800',
        activity.status === 'failed' && 'bg-red-100 text-red-800'
      )}>
        {activity.status}
      </span>
    </div>
  )
}