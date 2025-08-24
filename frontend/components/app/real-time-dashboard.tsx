"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { EnhancedKPICard } from "./enhanced-kpi-card"
import { Users, Target, TrendingUp, Bot, Activity, Zap, Globe } from "lucide-react"

export function RealTimeDashboard() {
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const kpiData = [
    {
      title: "Prospects Actifs",
      value: "2,847",
      change: 12.5,
      changeLabel: "ce mois",
      icon: Users,
      trend: "up" as const,
      animated: true,
    },
    {
      title: "Taux de Conversion",
      value: "24.8%",
      change: 3.2,
      changeLabel: "ce mois",
      icon: Target,
      trend: "up" as const,
    },
    {
      title: "Revenus Générés",
      value: "€127,450",
      change: 18.7,
      changeLabel: "ce mois",
      icon: TrendingUp,
      trend: "up" as const,
    },
    {
      title: "Agents IA Actifs",
      value: "8",
      change: 0,
      changeLabel: "En cours d'exécution",
      icon: Bot,
      trend: "stable" as const,
      animated: true,
    },
  ]

  const campaigns = [
    { name: "Tech Startups France", progress: 78, prospects: 245, status: "active", color: "bg-accent" },
    { name: "E-commerce Europe", progress: 45, prospects: 189, status: "active", color: "bg-primary" },
    { name: "SaaS B2B Global", progress: 92, prospects: 156, status: "completing", color: "bg-accent" },
    { name: "Retail Traditional", progress: 23, prospects: 298, status: "starting", color: "bg-muted-foreground" },
  ]

  const recentActivity = [
    { action: "Nouveau prospect qualifié", company: "TechCorp SAS", time: "Il y a 2 min", type: "success" },
    { action: "Campagne terminée", company: "E-commerce Campaign #3", time: "Il y a 15 min", type: "info" },
    { action: "Prospect converti", company: "StartupXYZ", time: "Il y a 1h", type: "success" },
    { action: "Analyse de marché complétée", company: "Secteur Retail", time: "Il y a 2h", type: "info" },
  ]

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-accent animate-pulse" : "bg-destructive"}`}></div>
          <span className="text-sm text-muted-foreground">
            {isConnected ? "Connecté en temps réel" : "Connexion interrompue"}
          </span>
          <span className="text-xs text-muted-foreground">Dernière mise à jour: {lastUpdate.toLocaleTimeString()}</span>
        </div>
        <Button variant="outline" size="sm">
          <Activity className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <EnhancedKPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeLabel={kpi.changeLabel}
            icon={kpi.icon}
            trend={kpi.trend}
            animated={kpi.animated}
          />
        ))}
      </div>

      {/* Real-time Campaigns and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Campaigns */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-accent animate-pulse" />
                <span>Campagnes en Direct</span>
              </span>
              <Badge variant="secondary" className="animate-pulse">
                5 actives
              </Badge>
            </CardTitle>
            <CardDescription>Suivi temps réel de vos campagnes de prospection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaigns.map((campaign, index) => (
              <div key={index} className="space-y-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${campaign.color} animate-pulse`}></div>
                    <span className="font-medium">{campaign.name}</span>
                    <Badge variant={campaign.status === "active" ? "default" : "secondary"} className="text-xs">
                      {campaign.status === "active"
                        ? "Actif"
                        : campaign.status === "completing"
                          ? "Finalisation"
                          : "Démarrage"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">{campaign.prospects} prospects</span>
                    <span className="text-sm font-medium">{campaign.progress}%</span>
                  </div>
                </div>
                <Progress value={campaign.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary animate-pulse" />
              <span>Activité Live</span>
            </CardTitle>
            <CardDescription>Événements en temps réel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "success" ? "bg-accent animate-pulse" : "bg-primary"
                  }`}
                ></div>
                <div className="flex-1 space-y-1">
                  <div className="font-medium text-sm">{activity.action}</div>
                  <div className="text-xs text-muted-foreground">{activity.company}</div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Global Performance Metrics */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-primary" />
            <span>Performance Globale</span>
          </CardTitle>
          <CardDescription>Vue d'ensemble de votre activité de prospection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">95.2%</div>
              <div className="text-sm text-muted-foreground">Précision IA</div>
              <Progress value={95.2} className="h-2" />
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-sm text-muted-foreground">Disponibilité</div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">10.5x</div>
              <div className="text-sm text-muted-foreground">Plus rapide</div>
              <Progress value={85} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
