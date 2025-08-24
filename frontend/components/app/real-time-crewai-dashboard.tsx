"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Users, Target, TrendingUp, Activity, CheckCircle, Zap } from "lucide-react"

interface CrewAIAgent {
  id: string
  name: string
  role: string
  status: 'idle' | 'working' | 'completed' | 'error'
  currentTask?: string
  lastActivity?: string
  campaign_id?: number
}

interface Prospect {
  id: number
  campaign_id: number
  company_name: string
  website?: string
  sector?: string
  location?: string
  contact_name?: string
  contact_position?: string
  email?: string
  phone?: string
  quality_score?: number
  status: string
  created_at: string
}

interface Campaign {
  id: number
  name: string
  product_description: string
  status: string
  prospect_count: number
  created_at: string
  metrics?: {
    total_prospects: number
    qualified_prospects: number
    contacted_prospects: number
    responses: number
  }
}

interface ConnectionStatus {
  connected: boolean
  reconnectAttempts: number
  queuedMessages: number
}

interface RealTimeCrewAIDashboardProps {
  agents?: CrewAIAgent[]
  prospects?: Prospect[]
  campaigns?: Campaign[]
  connectionStatus?: ConnectionStatus
}

export function RealTimeCrewAIDashboard({ 
  agents = [], 
  prospects = [], 
  campaigns = [],
  connectionStatus = { connected: false, reconnectAttempts: 0, queuedMessages: 0 }
}: RealTimeCrewAIDashboardProps) {
  // Calculate metrics from real data
  const totalProspects = prospects.length
  const qualifiedProspects = prospects.filter(p => (p.quality_score || 0) > 80).length
  const activeAgents = agents.filter(a => a.status === 'working').length
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === 'running').length

  // Calculate performance metrics
  const overallPerformance = totalProspects > 0 ? Math.round((qualifiedProspects / totalProspects) * 100) : 0

  // Recent prospects (last 10)
  const recentProspects = prospects
    .filter(p => (p.quality_score || 0) > 70)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  const getAgentIcon = (role: string) => {
    const roleLower = role.toLowerCase()
    if (roleLower.includes('research')) return "🔍"
    if (roleLower.includes('analyst') || roleLower.includes('analysis')) return "📊"
    if (roleLower.includes('outreach') || roleLower.includes('contact')) return "📧"
    if (roleLower.includes('qualif')) return "✅"
    return "🤖"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working":
        return "bg-blue-500 animate-pulse"
      case "completed":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "idle":
        return "bg-gray-400"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "working":
        return "En cours"
      case "completed":
        return "Terminé"
      case "error":
        return "Erreur"
      case "idle":
        return "En attente"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalProspects.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{activeCampaigns} campagnes actives</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospects Qualifiés</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{qualifiedProspects}</div>
            <p className="text-xs text-muted-foreground">
              Taux: {totalProspects > 0 ? ((qualifiedProspects / totalProspects) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents Actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{activeAgents}/{agents.length}</div>
            <p className="text-xs text-muted-foreground">
              {connectionStatus.connected ? "Connecté" : "Déconnecté"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{overallPerformance}%</div>
            <p className="text-xs text-muted-foreground">Efficacité globale</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Agent Activities */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Activité des Agents en Temps Réel
            </CardTitle>
            <CardDescription>Suivi en direct des actions CrewAI</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {agents.length > 0 ? agents.map((agent) => (
                  <div key={agent.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{getAgentIcon(agent.role)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{agent.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {agent.role}
                          </Badge>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {agent.currentTask || 'Aucune tâche en cours'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{getStatusText(agent.status)}</span>
                        {agent.lastActivity && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(agent.lastActivity).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun agent actif pour le moment</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Live Notifications */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Notifications Live
            </CardTitle>
            <CardDescription>Prospects qualifiés et événements importants</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {recentProspects.length > 0 ? recentProspects.map((prospect) => (
                  <div
                    key={prospect.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border bg-accent/5"
                  >
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Prospect Qualifié</span>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Score: {prospect.quality_score || 0}/100
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mt-1">
                        {prospect.contact_name && (
                          <><strong>{prospect.contact_name}</strong> de </>
                        )}
                        <strong>{prospect.company_name}</strong>
                      </p>
                      {prospect.contact_position && (
                        <p className="text-xs text-muted-foreground">
                          {prospect.contact_position}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(prospect.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun prospect qualifié récent</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
