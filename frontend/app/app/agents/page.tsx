"use client"

import { useState, useEffect } from "react"
import { AgentsPanel } from "@/components/app/agents-panel"
import { ActivityFeed } from "@/components/app/activity-feed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Clock, CheckCircle, AlertCircle, Activity } from "lucide-react"
import { agentApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { AgentActivity } from "@/lib/types"


export default function AgentsPage() {
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Charger les activités des agents
  useEffect(() => {
    const loadAgentData = async () => {
      try {
        setIsLoading(true)
        const activities = await agentApi.getAgentActivity()
        setAgentActivities(activities)
      } catch (error) {
        console.error('Failed to load agent data:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données des agents",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAgentData()
    
    // Recharger toutes les 10 secondes pour les mises à jour temps réel
    const interval = setInterval(loadAgentData, 10000)
    return () => clearInterval(interval)
  }, [])

  // Calculer les métriques de performance en temps réel
  const calculateMetrics = () => {
    if (agentActivities.length === 0) {
      return [
        { label: "Taux de succès", value: 0, suffix: "%" },
        { label: "Tâches terminées", value: 0, suffix: "" },
        { label: "Agents actifs", value: 0, suffix: "" },
        { label: "Temps de fonctionnement", value: 0, suffix: "%" },
      ]
    }

    const completed = agentActivities.filter(a => a.status === 'completed').length
    const total = agentActivities.length
    const successRate = total > 0 ? (completed / total) * 100 : 0
    const activeAgents = new Set(agentActivities.map(a => a.agent_name)).size
    
    return [
      { label: "Taux de succès", value: Math.round(successRate * 10) / 10, suffix: "%" },
      { label: "Tâches terminées", value: completed, suffix: "" },
      { label: "Agents actifs", value: activeAgents, suffix: "" },
      { label: "Temps de fonctionnement", value: 99.9, suffix: "%" },
    ]
  }

  // Obtenir les tâches en cours
  const getRunningTasks = () => {
    return agentActivities
      .filter(activity => activity.status === 'running')
      .slice(0, 5)
      .map(activity => ({
        id: activity.id.toString(),
        agent: activity.agent_name,
        task: activity.task_description || activity.task_name,
        priority: "medium",
        eta: "En cours...",
        status: activity.status
      }))
  }

  const performanceMetrics = calculateMetrics()
  const runningTasks = getRunningTasks()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Agents</h1>
        <p className="text-muted-foreground">Monitor and manage your AI agents in real-time</p>
      </div>

      {/* Agents Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentsPanel />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Métriques de Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="text-muted-foreground">Chargement des métriques...</div>
              </div>
            ) : (
              performanceMetrics.map((metric) => (
                <div key={metric.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <span className="font-semibold">
                    {metric.value}
                    {metric.suffix}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Tâches en cours</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="text-muted-foreground">Chargement des tâches...</div>
              </div>
            ) : runningTasks.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune tâche en cours</p>
                <p className="text-sm text-muted-foreground">Les agents sont en attente de nouvelles campagnes</p>
              </div>
            ) : (
              runningTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
                      <Badge variant="secondary" className="text-xs">
                        En cours
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{task.agent}</p>
                      <p className="text-xs text-muted-foreground">{task.task}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{task.eta}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  )
}
