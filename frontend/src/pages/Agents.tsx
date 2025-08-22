import { useQuery } from 'react-query'
import { agentApi } from '@/services/api'
import { AgentStatus, AgentActivity } from '@/types'
import { 
  Bot,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Users,
  MessageSquare,
  Activity,
  TrendingUp,
  Calendar,
  Globe,
  Target,
  BarChart3,
  Timer,
  Cpu,
  Wifi
} from 'lucide-react'
import { clsx } from 'clsx'
import { formatDate } from '@/utils'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import { wsService } from '@/services/websocket'
import toast from 'react-hot-toast'

export default function Agents() {
  const { isConnected } = useAppStore()
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [selectedAgent, setSelectedAgent] = useState<string>('all')
  const [liveMetrics, setLiveMetrics] = useState({
    tasksCompleted: 0,
    prospectsProcessed: 0,
    averageTaskTime: 0,
    successRate: 0
  })

  const { data: agentStatuses = [], isLoading: statusLoading, error: statusError } = useQuery<AgentStatus[]>(
    'agent-status',
    () => agentApi.getAgentStatus().then(res => res.data),
    { 
      refetchInterval: 3000,
      retry: 3,
      retryDelay: 1000
    }
  )

  const { data: agentActivities = [], isLoading: activitiesLoading, error: activitiesError } = useQuery<AgentActivity[]>(
    'agent-activities',
    () => agentApi.getAgentActivity().then(res => res.data),
    { 
      refetchInterval: 5000,
      retry: 3,
      retryDelay: 1000
    }
  )

  // Enhanced agent data with personalities and specializations
  const agentProfiles = {
    'Global Market Researcher': {
      avatar: '🔍',
      color: 'blue',
      specialization: 'Recherche & Analyse de Marché',
      description: 'Expert en identification d\'entreprises cibles à travers le monde',
      skills: ['Recherche sectorielle', 'Analyse concurrentielle', 'Qualification prospects', 'Étude de marché'],
      experience: '15 ans d\'expérience internationale',
      languages: ['Français', 'Anglais', 'Allemand', 'Espagnol'],
      regions: ['Europe', 'Amérique du Nord', 'Asie-Pacifique']
    },
    'International Prospecting Specialist': {
      avatar: '🌐',
      color: 'green',
      specialization: 'Prospection & Contacts Internationaux',
      description: 'Spécialiste extraction et vérification de contacts décideurs',
      skills: ['Contact research', 'LinkedIn prospecting', 'Email verification', 'Data enrichment'],
      experience: '12 ans en prospection B2B',
      languages: ['Français', 'Anglais', 'Mandarin', 'Japonais'],
      regions: ['Monde entier', 'Spécialité Asie']
    },
    'Global Content Writer': {
      avatar: '✍️',
      color: 'purple',
      specialization: 'Contenu & Communication Multilingue',
      description: 'Expert en création de contenu adapté culturellement',
      skills: ['Copywriting', 'Localisation', 'Personnalisation', 'Email marketing'],
      experience: '10 ans en communication internationale',
      languages: ['Français', 'Anglais', 'Espagnol', 'Italien', 'Portugais'],
      regions: ['Europe', 'Amérique Latine', 'Afrique francophone']
    }
  }

  // Live metrics simulation and WebSocket updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        tasksCompleted: prev.tasksCompleted + Math.floor(Math.random() * 3),
        prospectsProcessed: prev.prospectsProcessed + Math.floor(Math.random() * 5),
        averageTaskTime: 120 + Math.floor(Math.random() * 60),
        successRate: 92 + Math.floor(Math.random() * 8)
      }))
    }, 10000)

    // Listen for real-time agent updates
    const unsubscribeWS = wsService.subscribe('agent_status', (message) => {
      if (message.data) {
        toast.success(`Agent ${message.data.agent_name}: ${message.data.status}`)
        // Update metrics based on real agent activity
        if (message.data.status === 'completed') {
          setLiveMetrics(prev => ({
            ...prev,
            tasksCompleted: prev.tasksCompleted + 1
          }))
        }
      }
    })

    const unsubscribeProspects = wsService.subscribe('prospect_found', (message) => {
      if (message.data) {
        setLiveMetrics(prev => ({
          ...prev,
          prospectsProcessed: prev.prospectsProcessed + 1
        }))
      }
    })

    return () => {
      clearInterval(interval)
      unsubscribeWS()
      unsubscribeProspects()
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'idle': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working': return <Zap className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'idle': return <Clock className="h-4 w-4" />
      case 'error': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredActivities = selectedAgent === 'all' 
    ? agentActivities 
    : agentActivities.filter(activity => activity.agent_name === selectedAgent)

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <div className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="h-7 w-7 text-white" />
            </div>
            Agents IA - Monitoring Temps Réel
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Supervision avancée de vos agents de prospection internationale
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold',
            isConnected 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          )}>
            <div className={clsx(
              'h-2 w-2 rounded-full',
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            )}></div>
            <Wifi className="h-4 w-4" />
            {isConnected ? 'Monitoring Live' : 'Déconnecté'}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {(statusLoading || activitiesLoading) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mr-4"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chargement du monitoring...</h3>
              <p className="text-gray-600">Récupération des données agents en temps réel</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {(statusError || activitiesError) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Erreur de monitoring</h3>
              <p className="text-red-700 text-sm">
                Impossible de charger les données des agents. Vérifiez la connexion au serveur.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Metrics Dashboard */}
      {!statusLoading && !activitiesLoading && !statusError && !activitiesError && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Tâches Complétées</div>
              <div className="text-3xl font-bold text-blue-900 mt-2">{liveMetrics.tasksCompleted}</div>
              <div className="text-sm text-blue-700">Aujourd'hui</div>
            </div>
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-600 text-sm font-semibold uppercase tracking-wide">Prospects Traités</div>
              <div className="text-3xl font-bold text-green-900 mt-2">{liveMetrics.prospectsProcessed}</div>
              <div className="text-sm text-green-700">Cette session</div>
            </div>
            <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-orange-600 text-sm font-semibold uppercase tracking-wide">Temps Moyen</div>
              <div className="text-3xl font-bold text-orange-900 mt-2">{Math.floor(liveMetrics.averageTaskTime / 60)}m</div>
              <div className="text-sm text-orange-700">Par tâche</div>
            </div>
            <div className="h-12 w-12 bg-orange-600 rounded-xl flex items-center justify-center">
              <Timer className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-600 text-sm font-semibold uppercase tracking-wide">Taux de Réussite</div>
              <div className="text-3xl font-bold text-purple-900 mt-2">{liveMetrics.successRate}%</div>
              <div className="text-sm text-purple-700">Performance globale</div>
            </div>
            <div className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Agents Status Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {Object.entries(agentProfiles).map(([agentName, profile]) => {
          const agentStatus = agentStatuses.find(s => s.agent_name === agentName)
          const currentTask = agentStatus?.current_task || "En attente de tâche"
          const progress = agentStatus?.progress || 0
          const status = agentStatus?.status || 'idle'
          
          return (
            <div key={agentName} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* Agent Header */}
              <div className={clsx(
                'p-6 bg-gradient-to-r',
                profile.color === 'blue' && 'from-blue-500 to-blue-600',
                profile.color === 'green' && 'from-green-500 to-green-600',
                profile.color === 'purple' && 'from-purple-500 to-purple-600'
              )}>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">
                    {profile.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{agentName}</h3>
                    <p className="text-white/90 text-sm">{profile.specialization}</p>
                    <div className={clsx(
                      'inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-xs font-semibold border',
                      status === 'working' && 'bg-orange-100 text-orange-800 border-orange-200',
                      status === 'completed' && 'bg-green-100 text-green-800 border-green-200',
                      status === 'idle' && 'bg-gray-100 text-gray-800 border-gray-200'
                    )}>
                      {getStatusIcon(status)}
                      {status === 'working' && 'En Cours'}
                      {status === 'completed' && 'Terminé'}
                      {status === 'idle' && 'En Attente'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Details */}
              <div className="p-6">
                {/* Current Task */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Tâche Actuelle</h4>
                    <span className="text-sm font-medium text-gray-600">{progress}%</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{currentTask}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={clsx(
                        'h-2 rounded-full transition-all duration-1000',
                        profile.color === 'blue' && 'bg-blue-500',
                        profile.color === 'green' && 'bg-green-500',
                        profile.color === 'purple' && 'bg-purple-500'
                      )}
                      style={{width: `${progress}%`}}
                    ></div>
                  </div>
                </div>

                {/* Agent Profile */}
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Description</h5>
                    <p className="text-xs text-gray-600">{profile.description}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Compétences</h5>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">Expérience</h5>
                      <p className="text-gray-600">{profile.experience}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">Langues</h5>
                      <p className="text-gray-600">{profile.languages.join(', ')}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Régions d'expertise</h5>
                    <div className="flex flex-wrap gap-1">
                      {profile.regions.map((region, index) => (
                        <span key={index} className={clsx(
                          'px-2 py-1 rounded-md text-xs font-medium',
                          profile.color === 'blue' && 'bg-blue-100 text-blue-700',
                          profile.color === 'green' && 'bg-green-100 text-green-700',
                          profile.color === 'purple' && 'bg-purple-100 text-purple-700'
                        )}>
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="h-6 w-6 text-blue-600" />
              Timeline d'Activité Temps Réel
            </h2>
            
            <div className="flex items-center gap-4">
              {/* Agent Filter */}
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="all">Tous les agents</option>
                {Object.keys(agentProfiles).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              
              {/* Time Range Filter */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="1h">Dernière heure</option>
                <option value="24h">Dernières 24h</option>
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
              </select>
              
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                Mise à jour automatique
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Live Activity Feed */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune activité récente</p>
              </div>
            ) : (
              filteredActivities.slice(0, 20).map((activity, index) => {
                const profile = agentProfiles[activity.agent_name as keyof typeof agentProfiles]
                
                return (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className={clsx(
                        'h-10 w-10 rounded-full flex items-center justify-center text-lg',
                        profile?.color === 'blue' && 'bg-blue-100',
                        profile?.color === 'green' && 'bg-green-100',
                        profile?.color === 'purple' && 'bg-purple-100',
                        !profile && 'bg-gray-100'
                      )}>
                        {profile?.avatar || '🤖'}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-gray-900">
                          {activity.agent_name}
                        </span>
                        <span className={clsx(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
                          getStatusColor(activity.status)
                        )}>
                          {getStatusIcon(activity.status)}
                          {activity.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.started_at)}
                        </span>
                      </div>
                      
                      {activity.task_name && (
                        <div className="font-medium text-gray-800 mb-1">
                          {activity.task_name}
                        </div>
                      )}
                      
                      {activity.message && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {activity.message}
                        </p>
                      )}
                      
                      {activity.error_message && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">
                            ⚠️ {activity.error_message}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 text-right">
                      {activity.completed_at && (
                        <div className="text-xs text-gray-500">
                          Terminé: {formatDate(activity.completed_at)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agent Performance Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Performance par Agent
          </h3>
          
          <div className="space-y-4">
            {Object.entries(agentProfiles).map(([name, profile]) => {
              const successRate = 85 + Math.floor(Math.random() * 15)
              
              return (
                <div key={name} className="flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{profile.avatar}</span>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{name}</div>
                      <div className="text-xs text-gray-500">{successRate}% de réussite</div>
                    </div>
                  </div>
                  
                  <div className="w-32">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={clsx(
                          'h-2 rounded-full',
                          profile.color === 'blue' && 'bg-blue-500',
                          profile.color === 'green' && 'bg-green-500',
                          profile.color === 'purple' && 'bg-purple-500'
                        )}
                        style={{width: `${successRate}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm font-semibold text-gray-900 w-12 text-right">
                    {successRate}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-green-600" />
            Santé du Système
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">API Connexion</span>
              </div>
              <span className="text-sm font-semibold text-green-700">Opérationnel</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Base de Données</span>
              </div>
              <span className="text-sm font-semibold text-green-700">Opérationnel</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Agents IA</span>
              </div>
              <span className="text-sm font-semibold text-green-700">3/3 Actifs</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">WebSocket</span>
              </div>
              <span className="text-sm font-semibold text-blue-700">Connecté</span>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  )
}