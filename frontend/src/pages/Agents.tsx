import { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  Bot, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle,
  Zap,
  TrendingUp
} from 'lucide-react'
import { agentApi, campaignApi } from '@/services/api'
import { AgentStatus, AgentActivity, Campaign } from '@/types'
import { clsx } from 'clsx'
import { formatTime, formatTimeAgo } from '@/utils'

export default function Agents() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all')

  // Queries
  const { data: agentStatuses = [] } = useQuery<AgentStatus[]>(
    ['agent-statuses', selectedCampaign !== 'all' ? parseInt(selectedCampaign) : undefined],
    () => agentApi.getAgentStatus({
      campaign_id: selectedCampaign !== 'all' ? parseInt(selectedCampaign) : undefined
    }).then(res => res.data),
    { refetchInterval: 5000 }
  )

  const { data: activities = [] } = useQuery<AgentActivity[]>(
    ['agent-activities', selectedCampaign !== 'all' ? parseInt(selectedCampaign) : undefined],
    () => agentApi.getAgentActivity({
      campaign_id: selectedCampaign !== 'all' ? parseInt(selectedCampaign) : undefined,
      limit: 50
    }).then(res => res.data),
    { refetchInterval: 5000 }
  )

  const { data: stats } = useQuery(
    ['agent-stats', selectedCampaign !== 'all' ? parseInt(selectedCampaign) : undefined],
    () => agentApi.getAgentStats({
      campaign_id: selectedCampaign !== 'all' ? parseInt(selectedCampaign) : undefined,
      hours: 24
    }).then(res => res.data),
    { refetchInterval: 30000 }
  )

  const { data: campaigns = [] } = useQuery<Campaign[]>(
    'campaigns',
    () => campaignApi.getCampaigns().then(res => res.data)
  )

  // Calculate overview stats
  const overviewStats = {
    totalAgents: agentStatuses.length,
    activeAgents: agentStatuses.filter(a => a.status === 'working').length,
    idleAgents: agentStatuses.filter(a => a.status === 'idle').length,
    errorAgents: agentStatuses.filter(a => a.status === 'error').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents IA</h1>
          <p className="text-gray-600">Monitoring en temps réel des agents de prospection</p>
        </div>

        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="input w-auto min-w-48"
        >
          <option value="all">Toutes les campagnes</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id.toString()}>
              {campaign.name}
            </option>
          ))}
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Agents totaux"
          value={overviewStats.totalAgents}
          icon={Bot}
          color="blue"
        />
        <StatCard
          title="Agents actifs"
          value={overviewStats.activeAgents}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Agents inactifs"
          value={overviewStats.idleAgents}
          icon={Clock}
          color="gray"
        />
        <StatCard
          title="Agents en erreur"
          value={overviewStats.errorAgents}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Performance Stats */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de succès</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.success_rate?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activités totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_activities || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Durée moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.average_task_duration ? 
                    `${Math.round(stats.average_task_duration)}s` : 
                    '0s'
                  }
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Status */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statut des agents</h2>
          
          <div className="space-y-4">
            {agentStatuses.length > 0 ? (
              agentStatuses.map((agent) => (
                <AgentStatusCard key={agent.agent_name} agent={agent} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun agent actif</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activités récentes</h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.length > 0 ? (
              activities.slice(0, 20).map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity by Status Chart */}
      {stats && stats.activities_by_status && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition des activités (24h)</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.activities_by_status).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className={clsx(
                  'w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2',
                  status === 'completed' && 'bg-green-500',
                  status === 'running' && 'bg-blue-500',
                  status === 'failed' && 'bg-red-500',
                  status === 'started' && 'bg-yellow-500'
                )}>
                  {count}
                </div>
                <p className="text-sm font-medium text-gray-700 capitalize">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Components
interface StatCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'gray' | 'red'
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    gray: 'bg-gray-500',
    red: 'bg-red-500',
  }

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={clsx('p-2 rounded-lg text-white', colorClasses[color])}>
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

interface AgentStatusCardProps {
  agent: AgentStatus
}

function AgentStatusCard({ agent }: AgentStatusCardProps) {
  const statusColors = {
    idle: 'bg-gray-100 text-gray-800',
    working: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  }

  const statusIcons = {
    idle: Clock,
    working: Activity,
    completed: CheckCircle,
    error: XCircle,
  }

  const StatusIcon = statusIcons[agent.status]

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={clsx('p-2 rounded-full', statusColors[agent.status])}>
          <StatusIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{agent.agent_name}</p>
          {agent.current_task && (
            <p className="text-sm text-gray-500">{agent.current_task}</p>
          )}
          <p className="text-xs text-gray-400">
Dernière activité: {formatTimeAgo(agent.last_activity)}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <span className={clsx('status-badge', statusColors[agent.status])}>
          {agent.status}
        </span>
        <div className="mt-2 w-20 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${agent.progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{agent.progress.toFixed(0)}%</p>
      </div>
    </div>
  )
}

interface ActivityCardProps {
  activity: AgentActivity
}

function ActivityCard({ activity }: ActivityCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'running': return 'text-blue-600'
      case 'failed': return 'text-red-600'
      case 'started': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="border-l-2 border-gray-200 pl-4 py-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{activity.agent_name}</span>
        <span className="text-xs text-gray-500">
          {formatTime(activity.started_at)}
        </span>
      </div>
      
      {activity.task_name && (
        <p className="text-sm text-gray-700 mt-1">{activity.task_name}</p>
      )}
      
      {activity.message && (
        <p className="text-sm text-gray-600 mt-1">{activity.message}</p>
      )}
      
      <div className="flex items-center justify-between mt-2">
        <span className={clsx('text-xs font-medium', getStatusColor(activity.status))}>
          {activity.status}
        </span>
        {activity.completed_at && (
          <span className="text-xs text-gray-400">
            Durée: {Math.round((new Date(activity.completed_at).getTime() - new Date(activity.started_at).getTime()) / 1000)}s
          </span>
        )}
      </div>
    </div>
  )
}