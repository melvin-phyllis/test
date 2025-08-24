"use client"

import { useState, useEffect } from "react"
import { RealTimeCrewAIDashboard } from "@/components/app/real-time-crewai-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Bot, Activity, Zap, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { CreateCampaignDialog } from "@/components/app/create-campaign-dialog"
import { useRealTimeData } from "@/hooks/use-real-time-data"
import { authManager } from "@/lib/auth-manager"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [user, setUser] = useState(authManager.getCurrentUser())
  
  const {
    agents,
    prospects,
    campaigns,
    loading,
    error,
    connectionStatus,
    refreshData,
  } = useRealTimeData()

  // S'abonner aux changements d'authentification
  useEffect(() => {
    return authManager.subscribe((authState) => {
      setUser(authState.user)
    })
  }, [])

  // Calculer les métriques en temps réel
  const activeAgents = agents.filter(agent => agent.status === 'working').length
  const totalProspects = prospects.length
  const qualifiedProspects = prospects.filter(p => (p.quality_score || 0) > 80).length
  const activeCampaigns = campaigns.filter(c => c.status === 'running').length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert d'erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" className="ml-2" onClick={refreshData}>
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statut de connexion WebSocket */}
      {!connectionStatus.connected && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Connexion temps réel interrompue. Reconnexion en cours...
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Dashboard CrewAI</h1>
          <p className="text-muted-foreground">
            Bienvenue {user?.username || 'Admin'} - Suivi temps réel de vos agents de prospection IA
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge 
            variant={connectionStatus.connected ? "secondary" : "destructive"} 
            className={connectionStatus.connected ? "animate-pulse" : ""}
          >
            {connectionStatus.connected ? (
              <Wifi className="w-3 h-3 mr-1" />
            ) : (
              <WifiOff className="w-3 h-3 mr-1" />
            )}
            {connectionStatus.connected ? 'En ligne' : 'Hors ligne'}
          </Badge>
          <Badge variant="outline">
            <Activity className="w-3 h-3 mr-1" />
            {activeAgents} agents actifs
          </Badge>
          <Button className="animate-pulse-glow" onClick={() => setShowCreateCampaign(true)}>
            <Zap className="w-4 h-4 mr-2" />
            Nouvelle campagne
          </Button>
        </div>
      </div>

      {/* Real-time CrewAI Dashboard */}
      <RealTimeCrewAIDashboard 
        agents={agents}
        prospects={prospects}
        campaigns={campaigns}
        connectionStatus={connectionStatus}
      />

      {/* Additional Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span>Performance Globale</span>
            </CardTitle>
            <CardDescription>Métriques de performance de vos agents CrewAI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">
                  {totalProspects > 0 ? Math.round((qualifiedProspects / totalProspects) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Taux de qualification</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-accent">{activeCampaigns}</div>
                <div className="text-sm text-muted-foreground">Campagnes actives</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-secondary">{totalProspects}</div>
                <div className="text-sm text-muted-foreground">Prospects totaux</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-chart-3">{qualifiedProspects}</div>
                <div className="text-sm text-muted-foreground">Prospects qualifiés</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Efficiency */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary" />
              <span>Efficacité des Agents</span>
            </CardTitle>
            <CardDescription>Comparaison des performances par agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Sarah (Researcher)", efficiency: 96, color: "bg-chart-1" },
              { name: "Marcus (Analyst)", efficiency: 89, color: "bg-chart-2" },
              { name: "Emma (Outreach)", efficiency: 92, color: "bg-chart-3" },
              { name: "Alex (Qualifier)", efficiency: 87, color: "bg-chart-4" },
            ].map((agent, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{agent.name}</span>
                  <span className="text-sm text-muted-foreground">{agent.efficiency}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${agent.color} transition-all duration-500`}
                    style={{ width: `${agent.efficiency}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <CreateCampaignDialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign} />
    </div>
  )
}
