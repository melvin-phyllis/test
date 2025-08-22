"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  Activity,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  Wifi,
  WifiOff,
  Bell,
  BellRing,
  Trash2,
  Play,
  Pause,
  RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAgentActions, useProspectNotifications, useWebSocketConnection } from "@/hooks/use-realtime"

export function RealtimeDashboard() {
  const { actions, isConnected, clearActions, actionsCount } = useAgentActions()
  const { 
    notifications, 
    unreadCount, 
    totalProspects, 
    markAsRead, 
    clearNotifications 
  } = useProspectNotifications()
  const { reconnect, disconnect } = useWebSocketConnection()

  const [showNotifications, setShowNotifications] = useState(false)

  // Calculer les statistiques en temps réel
  const stats = {
    activeAgents: new Set(actions.filter(a => a.status === 'in_progress').map(a => a.agent_name)).size,
    completedTasks: actions.filter(a => a.status === 'completed').length,
    failedTasks: actions.filter(a => a.status === 'failed').length,
    totalActions: actionsCount
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'in_progress':
        return <Activity className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Terminé</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Échec</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700 animate-pulse">En cours</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">En attente</Badge>
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return ''
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  }

  return (
    <div className="space-y-6">
      {/* Header avec indicateur de connexion */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Dashboard Temps Réel</h2>
          <div className={cn(
            "flex items-center space-x-2 px-3 py-1 rounded-full text-sm",
            isConnected 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          )}>
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span>{isConnected ? 'Connecté' : 'Déconnecté'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Bouton notifications */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowNotifications(!showNotifications)
              if (!showNotifications) markAsRead()
            }}
            className="relative"
          >
            {unreadCount > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white px-1 min-w-[20px] h-5 flex items-center justify-center text-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Contrôles connexion */}
          {isConnected ? (
            <Button variant="outline" size="sm" onClick={disconnect}>
              <Pause className="h-4 w-4 mr-2" />
              Déconnecter
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={reconnect}>
              <Play className="h-4 w-4 mr-2" />
              Reconnecter
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={clearActions}>
            <Trash2 className="h-4 w-4 mr-2" />
            Effacer
          </Button>
        </div>
      </div>

      {/* Statistiques en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Bot className="h-4 w-4 text-blue-500" />
              <span>Agents Actifs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeAgents}</div>
            <p className="text-xs text-muted-foreground">En cours de travail</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Tâches Terminées</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">Aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span>Prospects Trouvés</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalProspects}</div>
            <p className="text-xs text-muted-foreground">Total qualifiés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span>Taux de Succès</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalActions > 0 ? Math.round((stats.completedTasks / stats.totalActions) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.failedTasks} échecs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions des agents */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Actions CrewAI en Temps Réel</span>
                <Badge variant="outline">{actionsCount}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {actions.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <Bot className="h-8 w-8 mx-auto mb-2" />
                      <p>Aucune activité d'agent pour le moment</p>
                      <p className="text-xs">Les actions apparaîtront ici en temps réel</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {actions.map((action) => (
                      <div
                        key={action.id}
                        className={cn(
                          "p-4 rounded-lg border transition-all duration-500",
                          action.status === 'in_progress' && "bg-blue-50 border-blue-200 animate-pulse",
                          action.status === 'completed' && "bg-green-50 border-green-200",
                          action.status === 'failed' && "bg-red-50 border-red-200"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(action.status)}
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm">{action.agent_name}</span>
                                {getStatusBadge(action.status)}
                              </div>
                              <p className="text-sm font-medium mt-1">{action.action}</p>
                              <p className="text-xs text-muted-foreground">{action.description}</p>
                              {action.result && (
                                <p className="text-xs text-green-600 mt-1 font-medium">{action.result}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>{formatTime(action.timestamp)}</p>
                            {action.duration_ms && (
                              <p>{formatDuration(action.duration_ms)}</p>
                            )}
                          </div>
                        </div>
                        
                        {action.prospect_data && (
                          <div className="mt-3 p-2 bg-white rounded border">
                            <p className="text-xs font-medium text-purple-600">
                              Prospect trouvé: {action.prospect_data.company_name}
                            </p>
                            {action.prospect_data.contact_name && (
                              <p className="text-xs text-muted-foreground">
                                Contact: {action.prospect_data.contact_name}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Score: {action.prospect_data.quality_score}%
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Notifications de prospects */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span>Prospects Qualifiés</span>
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Total trouvés</span>
                  <span className="font-semibold">{totalProspects}</span>
                </div>
                <Progress value={(totalProspects / 100) * 100} className="h-2" />
              </div>

              <ScrollArea className="h-80">
                {notifications.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p>Aucun prospect trouvé</p>
                      <p className="text-xs">Les nouveaux prospects apparaîtront ici</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">{notification.prospect.company_name}</p>
                            {notification.prospect.contact_name && (
                              <p className="text-xs text-muted-foreground">
                                {notification.prospect.contact_name}
                              </p>
                            )}
                            {notification.prospect.email && (
                              <p className="text-xs text-blue-600">{notification.prospect.email}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Score: {notification.prospect.quality_score}%
                              </Badge>
                              {notification.prospect.sector && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.prospect.sector}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>{formatTime(notification.timestamp)}</p>
                            <p className="text-green-600 font-medium">{notification.agent_name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {notifications.length > 0 && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearNotifications}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Effacer notifications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}