import { useQuery } from 'react-query'
import { campaignApi, agentApi } from '@/services/api'
import { Campaign, AgentStatus } from '@/types'
import { 
  Target, 
  Users, 
  TrendingUp, 
  Activity,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { formatDate } from '@/utils'

export default function Dashboard() {
  const { data: campaigns = [] } = useQuery<Campaign[]>(
    'campaigns',
    () => campaignApi.getCampaigns().then(res => res.data)
  )

  const { data: agentStatuses = [] } = useQuery<AgentStatus[]>(
    'agent-status',
    () => agentApi.getAgentStatus().then(res => res.data),
    { refetchInterval: 5000 }
  )

  // Calculate statistics
  const stats = {
    totalCampaigns: campaigns.length,
    runningCampaigns: campaigns.filter(c => c.status === 'running').length,
    completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
    totalProspects: campaigns.reduce((acc, c) => acc + (c.results_summary?.prospects_found || 0), 0),
  }

  const recentCampaigns = campaigns
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Global</h1>
        <p className="text-gray-600">Vue d'ensemble de vos campagnes de prospection internationale</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Campagnes totales"
          value={stats.totalCampaigns}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Campagnes actives"
          value={stats.runningCampaigns}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Campagnes terminées"
          value={stats.completedCampaigns}
          icon={CheckCircle}
          color="purple"
        />
        <StatCard
          title="Prospects trouvés"
          value={stats.totalProspects}
          icon={Users}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent campaigns */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Campagnes récentes</h2>
            <Link to="/campaigns" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Voir tout
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentCampaigns.length > 0 ? (
              recentCampaigns.map((campaign) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune campagne trouvée</p>
            )}
          </div>
        </div>

        {/* Agent status */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Statut des agents</h2>
            <Link to="/agents" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Voir détails
            </Link>
          </div>
          
          <div className="space-y-3">
            {agentStatuses.length > 0 ? (
              agentStatuses.map((agent) => (
                <AgentRow key={agent.agent_name} agent={agent} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun agent actif</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    purple: 'bg-purple-500 text-white',
    orange: 'bg-orange-500 text-white',
  }

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={clsx('p-2 rounded-lg', colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

interface CampaignRowProps {
  campaign: Campaign
}

function CampaignRow({ campaign }: CampaignRowProps) {
  const statusIcons = {
    pending: PauseCircle,
    running: PlayCircle,
    completed: CheckCircle,
    failed: XCircle,
    cancelled: XCircle,
  }

  const StatusIcon = statusIcons[campaign.status]

  return (
    <Link
      to={`/campaigns/${campaign.id}`}
      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <StatusIcon className={clsx(
          'h-5 w-5',
          campaign.status === 'running' && 'text-primary-600',
          campaign.status === 'completed' && 'text-green-600',
          campaign.status === 'failed' && 'text-red-600',
          campaign.status === 'pending' && 'text-gray-400',
          campaign.status === 'cancelled' && 'text-yellow-600'
        )} />
        <div>
          <p className="font-medium text-gray-900">{campaign.name}</p>
          <p className="text-sm text-gray-500">
{formatDate(campaign.created_at, 'dd MMM yyyy')}
          </p>
        </div>
      </div>
      <span className={clsx('status-badge', `status-${campaign.status}`)}>
        {campaign.status}
      </span>
    </Link>
  )
}

interface AgentRowProps {
  agent: AgentStatus
}

function AgentRow({ agent }: AgentRowProps) {
  const statusColors = {
    idle: 'text-gray-400',
    working: 'text-primary-600',
    completed: 'text-green-600',
    error: 'text-red-600',
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className={clsx('w-3 h-3 rounded-full', 
          agent.status === 'working' && 'bg-primary-600',
          agent.status === 'completed' && 'bg-green-600',
          agent.status === 'error' && 'bg-red-600',
          agent.status === 'idle' && 'bg-gray-400'
        )} />
        <div>
          <p className="font-medium text-gray-900">{agent.agent_name}</p>
          {agent.current_task && (
            <p className="text-sm text-gray-500">{agent.current_task}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={clsx('text-sm font-medium', statusColors[agent.status])}>
          {agent.status}
        </p>
        <p className="text-xs text-gray-500">{agent.progress.toFixed(0)}%</p>
      </div>
    </div>
  )
}