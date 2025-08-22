import { useQuery } from 'react-query'
import { campaignApi, agentApi } from '@/services/api'
import { Campaign, AgentStatus } from '@/types'
import { 
  Target, 
  Users, 
  Activity,
  CheckCircle,
  XCircle,
  Globe,
  Bot,
  Zap,
  TrendingUp as TrendUp,
  MapPin,
  Clock,
  Wifi,
  Award,
  Eye,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { formatDate } from '@/utils'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import CreateCampaignModal from '@/components/CreateCampaignModal'
import { wsService } from '@/services/websocket'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { isConnected } = useAppStore()
  const [liveActivity, setLiveActivity] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  const { data: campaigns = [], isLoading: campaignLoading, error: campaignError } = useQuery<Campaign[]>(
    'campaigns',
    () => campaignApi.getCampaigns().then(res => res.data),
    { 
      refetchInterval: 10000,
      retry: 3,
      retryDelay: 1000
    }
  )

  const { data: agentStatuses = [], isLoading: agentLoading, error: agentError } = useQuery<AgentStatus[]>(
    'agent-status',
    () => agentApi.getAgentStatus().then(res => res.data),
    { 
      refetchInterval: 5000,
      retry: 3,
      retryDelay: 1000
    }
  )

  // Enhanced statistics
  const stats = {
    totalCampaigns: campaigns.length,
    runningCampaigns: campaigns.filter(c => c.status === 'running').length,
    completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
    totalProspects: campaigns.reduce((acc, c) => acc + (c.results_summary?.prospects_found || 0), 0),
    successRate: campaigns.length > 0 ? 
      (campaigns.filter(c => c.status === 'completed').length / campaigns.length * 100) : 0,
    countriesTargeted: [...new Set(campaigns.map(c => c.target_location))].length
  }

  const recentCampaigns = campaigns
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)

  // Country data for world map
  const countryData = campaigns.reduce((acc, campaign) => {
    const country = campaign.target_location
    const prospects = campaign.results_summary?.prospects_found || 0
    acc[country] = (acc[country] || 0) + prospects
    return acc
  }, {} as Record<string, number>)

  // Top countries by prospects
  const topCountries = Object.entries(countryData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)

  // Country flags mapping
  const countryFlags: Record<string, string> = {
    'France': '🇫🇷',
    'Allemagne': '🇩🇪', 
    'Canada': '🇨🇦',
    'Royaume-Uni': '🇬🇧',
    'États-Unis': '🇺🇸',
    'Espagne': '🇪🇸',
    'Italie': '🇮🇹',
    'Pays-Bas': '🇳🇱',
    'Japon': '🇯🇵',
    'Australie': '🇦🇺',
    'Brésil': '🇧🇷',
    'Inde': '🇮🇳'
  }

  // Real-time WebSocket updates and activity simulation
  useEffect(() => {
    const activities = [
      { agent: 'Global Market Researcher', action: 'Analyzing automotive companies in Stuttgart', time: '2 min ago', status: 'working', avatar: '🔍' },
      { agent: 'International Prospecting Specialist', action: 'Found 15 verified contacts in French fintech sector', time: '5 min ago', status: 'completed', avatar: '🌐' },
      { agent: 'Global Content Writer', action: 'Creating personalized outreach for German manufacturers', time: '8 min ago', status: 'working', avatar: '✍️' },
      { agent: 'Global Market Researcher', action: 'Identified 23 prospects in Canadian SaaS market', time: '12 min ago', status: 'completed', avatar: '🔍' },
      { agent: 'International Prospecting Specialist', action: 'Verifying contact details for UK PropTech companies', time: '15 min ago', status: 'working', avatar: '🌐' }
    ]
    setLiveActivity(activities)

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Listen for WebSocket messages
    const unsubscribeWS = wsService.subscribe('*', (message) => {
      if (message.type === 'campaign_update') {
        toast.success(`Campagne mise à jour: ${message.data.campaign_name}`)
      } else if (message.type === 'agent_status') {
        // Update live activity with real agent updates
        const newActivity = {
          agent: message.data.agent_name,
          action: message.data.current_task || 'Nouvelle tâche démarrée',
          time: 'À l\'instant',
          status: message.data.status,
          avatar: message.data.agent_name.includes('Market') ? '🔍' : 
                  message.data.agent_name.includes('Prospecting') ? '🌐' : '✍️'
        }
        setLiveActivity(prev => [newActivity, ...prev.slice(0, 4)])
      } else if (message.type === 'prospect_found') {
        toast.success(`Nouveau prospect identifié: ${message.data.company_name}`)
      }
    })

    return () => {
      clearInterval(timer)
      unsubscribeWS()
    }
  }, [])

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Globe className="h-7 w-7 text-white" />
            </div>
            Global AI Prospecting Platform
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Intelligence artificielle pour la prospection internationale • {currentTime.toLocaleString('fr-FR')}
          </p>
        </div>
        
        {/* Connection Status */}
        <div className={clsx(
          'flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm',
          isConnected 
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        )}>
          <div className={clsx(
            'h-3 w-3 rounded-full',
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          )}></div>
          <Wifi className="h-5 w-5" />
          {isConnected ? 'Système Connecté' : 'Déconnecté'} 
        </div>
      </div>

      {/* Loading State */}
      {(campaignLoading || agentLoading) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chargement des données...</h3>
              <p className="text-gray-600">Récupération des campagnes et statuts agents</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {(campaignError || agentError) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Erreur de chargement</h3>
              <p className="text-red-700 text-sm">
                {campaignError ? 'Impossible de charger les campagnes. ' : ''}
                {agentError ? 'Impossible de charger les statuts agents. ' : ''}
                Vérifiez votre connexion et réessayez.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Campaigns */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Total Campagnes</div>
              <div className="text-3xl font-bold text-blue-900 mt-2">{stats.totalCampaigns}</div>
              <div className="text-sm text-blue-700 flex items-center mt-2">
                <TrendUp className="h-4 w-4 mr-1" />
                +12 ce mois
              </div>
            </div>
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-orange-600 text-sm font-semibold uppercase tracking-wide">Campagnes Actives</div>
              <div className="text-3xl font-bold text-orange-900 mt-2">{stats.runningCampaigns}</div>
              <div className="text-sm text-orange-700 flex items-center mt-2">
                <Clock className="h-4 w-4 mr-1" />
                En cours maintenant
              </div>
            </div>
            <div className="h-16 w-16 bg-orange-600 rounded-2xl flex items-center justify-center">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Total Prospects */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-600 text-sm font-semibold uppercase tracking-wide">Total Prospects</div>
              <div className="text-3xl font-bold text-green-900 mt-2">{stats.totalProspects.toLocaleString()}</div>
              <div className="text-sm text-green-700 flex items-center mt-2">
                <TrendUp className="h-4 w-4 mr-1" />
                +{Math.floor(stats.totalProspects * 0.1)} cette semaine
              </div>
            </div>
            <div className="h-16 w-16 bg-green-600 rounded-2xl flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-600 text-sm font-semibold uppercase tracking-wide">Taux de Réussite</div>
              <div className="text-3xl font-bold text-purple-900 mt-2">{stats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-purple-700 flex items-center mt-2">
                <TrendUp className="h-4 w-4 mr-1" />
                +2.1% vs le mois dernier
              </div>
            </div>
            <div className="h-16 w-16 bg-purple-600 rounded-2xl flex items-center justify-center">
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* World Map Section */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <MapPin className="h-6 w-6 text-blue-600" />
              Prospection Mondiale
            </h2>
            <div className="flex items-center gap-2 text-sm bg-blue-50 px-4 py-2 rounded-full text-blue-700 font-medium">
              <Globe className="h-4 w-4" />
              {stats.countriesTargeted} pays ciblés
            </div>
          </div>
          
          {/* Interactive World Map Placeholder */}
          <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 min-h-[400px] border border-blue-100">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl"></div>
            
            <div className="relative z-10 h-full flex flex-col items-center justify-center">
              <div className="mb-8 text-center">
                <Globe className="h-20 w-20 text-blue-400 mx-auto mb-4 animate-spin" style={{animationDuration: '20s'}} />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Carte Mondiale Interactive</h3>
                <p className="text-gray-600">Visualisation en temps réel de vos campagnes internationales</p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
                {topCountries.map(([country, prospects]) => (
                  <div key={country} className="bg-white/80 backdrop-blur rounded-xl p-4 hover:bg-white/90 transition-all duration-300 border border-white/50 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{countryFlags[country] || '🌍'}</span>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{country}</div>
                          <div className="text-xs text-gray-500">Prospects</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-blue-600">{prospects}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link 
                to="/analytics" 
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Voir analytics détaillés
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* AI Agents Status Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Bot className="h-6 w-6 text-blue-600" />
            Agents IA
          </h2>
          
          <div className="space-y-6">
            {agentStatuses.length > 0 ? (
              agentStatuses.map((agent, index) => {
                const agentIcons = ['🔍', '🌐', '✍️']
                const agentColors = ['blue', 'green', 'purple']
                const color = agentColors[index % agentColors.length]
                const icon = agentIcons[index % agentIcons.length]
                
                return (
                  <div key={agent.agent_name} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "h-12 w-12 rounded-full flex items-center justify-center text-xl",
                          color === 'blue' && "bg-gradient-to-br from-blue-400 to-blue-600",
                          color === 'green' && "bg-gradient-to-br from-green-400 to-green-600", 
                          color === 'purple' && "bg-gradient-to-br from-purple-400 to-purple-600"
                        )}>
                          {icon}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{agent.agent_name}</div>
                          <div className="text-sm text-gray-500">{agent.status}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {agent.status === 'working' && <div className="h-3 w-3 bg-orange-500 rounded-full animate-pulse"></div>}
                        {agent.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {agent.status === 'idle' && <div className="h-3 w-3 bg-gray-400 rounded-full"></div>}
                        <span className={clsx(
                          "text-sm font-semibold",
                          agent.status === 'working' && "text-orange-600",
                          agent.status === 'completed' && "text-green-600",
                          agent.status === 'idle' && "text-gray-600"
                        )}>
                          {agent.status === 'working' && 'En Cours'}
                          {agent.status === 'completed' && 'Terminé'}  
                          {agent.status === 'idle' && 'En Attente'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {agent.current_task || 'Aucune tâche active'}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={clsx(
                          "h-2 rounded-full transition-all duration-1000",
                          color === 'blue' && "bg-blue-500",
                          color === 'green' && "bg-green-500",
                          color === 'purple' && "bg-purple-500"
                        )}
                        style={{width: `${agent.progress || 0}%`}}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">{agent.progress || 0}% complété</div>
                  </div>
                )
              })
            ) : (
              // Fallback static agents si pas de données
              <div className="text-center py-8">
                <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun agent connecté</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="h-6 w-6 text-yellow-600" />
            Activité Temps Réel
          </h2>
          <div className="flex items-center gap-2 text-sm bg-green-50 px-4 py-2 rounded-full text-green-700 font-medium">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            Live
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {liveActivity.map((activity, index) => (
            <div key={index} className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 transition-all duration-300 border border-gray-200">
              <div className="text-3xl">{activity.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-gray-900">{activity.agent}</span>
                  <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-600 border">{activity.time}</span>
                  <div className={clsx(
                    'h-2 w-2 rounded-full',
                    activity.status === 'working' ? 'bg-orange-500 animate-pulse' : 'bg-green-500'
                  )}></div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{activity.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Campaigns Enhanced */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Target className="h-6 w-6 text-blue-600" />
              Campagnes Récentes
            </h3>
            <Link 
              to="/campaigns" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Voir toutes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentCampaigns.length === 0 ? (
            <div className="p-12 text-center">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune campagne</h3>
              <p className="text-gray-500 mb-6">Commencez votre prospection internationale</p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Créer votre première campagne
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            recentCampaigns.map((campaign) => {
              const progress = campaign.status === 'completed' ? 100 : 
                              campaign.status === 'running' ? Math.floor(Math.random() * 80) + 20 : 0
              
              return (
                <div key={campaign.id} className="p-6 hover:bg-gray-50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{countryFlags[campaign.target_location] || '🌍'}</div>
                      <div>
                        <Link 
                          to={`/campaigns/${campaign.id}`}
                          className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {campaign.name}
                        </Link>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <span>{campaign.target_location}</span>
                          <span>•</span>
                          <span>{formatDate(campaign.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {campaign.results_summary?.prospects_found || 0} prospects
                        </div>
                        <div className="text-sm text-gray-500">
                          {progress}% complété
                        </div>
                      </div>
                      
                      <span className={clsx(
                        'inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold',
                        {
                          'bg-yellow-100 text-yellow-800': campaign.status === 'pending',
                          'bg-orange-100 text-orange-800': campaign.status === 'running',
                          'bg-green-100 text-green-800': campaign.status === 'completed',
                          'bg-red-100 text-red-800': campaign.status === 'failed',
                          'bg-gray-100 text-gray-800': campaign.status === 'cancelled'
                        }
                      )}>
                        {campaign.status === 'pending' && 'En attente'}
                        {campaign.status === 'running' && 'En cours'}
                        {campaign.status === 'completed' && 'Terminé'}
                        {campaign.status === 'failed' && 'Échec'}
                        {campaign.status === 'cancelled' && 'Annulé'}
                      </span>
                      
                      <Link 
                        to={`/campaigns/${campaign.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                  
                  {/* Enhanced Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={clsx(
                        'h-3 rounded-full transition-all duration-1000 relative overflow-hidden',
                        {
                          'bg-gradient-to-r from-yellow-400 to-yellow-500': campaign.status === 'pending',
                          'bg-gradient-to-r from-orange-400 to-orange-500': campaign.status === 'running',
                          'bg-gradient-to-r from-green-400 to-green-500': campaign.status === 'completed',
                          'bg-gradient-to-r from-red-400 to-red-500': campaign.status === 'failed',
                          'bg-gradient-to-r from-gray-400 to-gray-500': campaign.status === 'cancelled'
                        }
                      )}
                      style={{width: `${progress}%`}}
                    >
                      {campaign.status === 'running' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          toast.success('Campagne créée avec succès')
        }}
      />
    </div>
  )
}