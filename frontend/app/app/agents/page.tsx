"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, Play, Pause, Settings, Activity, Zap, Target, TrendingUp, Plus } from "lucide-react"
import SerperSearchInterface from "@/components/app/serper-search-interface"
import AITaskLauncher from "@/components/app/ai-task-launcher"
import { AIAgentConfigurator } from "@/components/app/ai-agent-configurator"
import { SerperResultsDisplay } from "@/components/app/serper-results-display"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function AgentsPage() {
  const [showConfigurator, setShowConfigurator] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const agents = [
    {
      id: 1,
      name: "Prospecteur Principal",
      description: "Agent spécialisé dans la recherche et qualification de prospects",
      status: "active",
      tasksCompleted: 1247,
      tasksInProgress: 23,
      successRate: 94,
      avatar: "/blue-ai-robot.png",
      specialty: "Prospection",
      lastActivity: "Il y a 2 min",
    },
    {
      id: 2,
      name: "Qualificateur Expert",
      description: "Analyse et score les prospects selon vos critères",
      status: "active",
      tasksCompleted: 892,
      tasksInProgress: 15,
      successRate: 97,
      avatar: "/ai-robot-green.png",
      specialty: "Qualification",
      lastActivity: "Il y a 5 min",
    },
    {
      id: 3,
      name: "Analyseur de Données",
      description: "Collecte et analyse les données de marché",
      status: "idle",
      tasksCompleted: 634,
      tasksInProgress: 0,
      successRate: 89,
      avatar: "/ai-robot-orange.png",
      specialty: "Analyse",
      lastActivity: "Il y a 1h",
    },
    {
      id: 4,
      name: "Générateur de Leads",
      description: "Identifie de nouveaux prospects potentiels",
      status: "active",
      tasksCompleted: 1456,
      tasksInProgress: 31,
      successRate: 91,
      avatar: "/ai-robot-purple.png",
      specialty: "Génération",
      lastActivity: "Il y a 1 min",
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Actif", variant: "default" as const, color: "bg-accent" },
      idle: { label: "En attente", variant: "secondary" as const, color: "bg-muted-foreground" },
      maintenance: { label: "Maintenance", variant: "destructive" as const, color: "bg-destructive" },
    }
    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        variant: "secondary" as const,
        color: "bg-muted-foreground",
      }
    )
  }

  const handleSaveAgent = (config: any) => {
    console.log("[v0] Saving agent configuration:", config)
    setShowConfigurator(false)
  }

  const handleTestAgent = (config: any) => {
    console.log("[v0] Testing agent configuration:", config)
    setIsSearching(true)

    setTimeout(() => {
      const mockResults = [
        {
          id: "1",
          name: "Marie Dubois",
          title: "Directrice Marketing",
          company: "TechCorp France",
          location: "Paris, France",
          email: "marie.dubois@techcorp.fr",
          phone: "+33 1 23 45 67 89",
          linkedin: "https://linkedin.com/in/marie-dubois",
          score: 92,
          insights: [
            "Récemment promue au poste de Directrice Marketing",
            "Expertise en transformation digitale et marketing B2B",
            "Active sur LinkedIn avec 5000+ connexions",
          ],
          companyInfo: {
            industry: "Technologie",
            size: "201-500 employés",
            website: "techcorp.fr",
          },
        },
        {
          id: "2",
          name: "Jean Martin",
          title: "CEO",
          company: "InnovateLab",
          location: "Lyon, France",
          email: "j.martin@innovatelab.com",
          score: 88,
          insights: [
            "Fondateur d'une startup en croissance rapide",
            "Spécialisé dans l'IA et l'automatisation",
            "Recherche activement des solutions de prospection",
          ],
          companyInfo: {
            industry: "Intelligence Artificielle",
            size: "11-50 employés",
            website: "innovatelab.com",
          },
        },
      ]
      setSearchResults(mockResults)
      setIsSearching(false)
    }, 2000)
  }

  const handleAddProspect = (result: any) => {
    console.log("[v0] Adding prospect:", result)
  }

  const handleViewDetails = (result: any) => {
    console.log("[v0] Viewing prospect details:", result)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Agents IA</h1>
          <p className="text-muted-foreground">Gérez et surveillez vos agents de prospection intelligents</p>
        </div>
        <Dialog open={showConfigurator} onOpenChange={setShowConfigurator}>
          <DialogTrigger asChild>
            <Button className="animate-pulse-glow">
              <Plus className="w-4 h-4 mr-2" />
              Créer un agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouvel agent IA</DialogTitle>
            </DialogHeader>
            <AIAgentConfigurator onSaveAgent={handleSaveAgent} onTestAgent={handleTestAgent} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Agents Actifs</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-accent animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tâches Complétées</p>
                <p className="text-2xl font-bold">4,229</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de Réussite</p>
                <p className="text-2xl font-bold">92.8%</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Cours</p>
                <p className="text-2xl font-bold">69</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different agent management views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="search">Recherche IA</TabsTrigger>
          <TabsTrigger value="tasks">Tâches</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Agents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="border-border/50 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          <Bot className="w-8 h-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{agent.name}</CardTitle>
                        <CardDescription className="mt-1">{agent.description}</CardDescription>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{agent.specialty}</Badge>
                          <Badge variant={getStatusBadge(agent.status).variant}>
                            {getStatusBadge(agent.status).label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {agent.status === "active" ? (
                        <Button variant="outline" size="sm">
                          <Pause className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{agent.tasksCompleted}</div>
                      <div className="text-xs text-muted-foreground">Complétées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">{agent.tasksInProgress}</div>
                      <div className="text-xs text-muted-foreground">En cours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{agent.successRate}%</div>
                      <div className="text-xs text-muted-foreground">Réussite</div>
                    </div>
                  </div>

                  {/* Success Rate Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taux de réussite</span>
                      <span className="font-medium">{agent.successRate}%</span>
                    </div>
                    <Progress value={agent.successRate} className="h-2" />
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusBadge(agent.status).color} ${agent.status === "active" ? "animate-pulse" : ""}`}
                      ></div>
                      <span className="text-sm text-muted-foreground">{agent.lastActivity}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                      Voir détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Agent Performance Chart */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Performance des Agents (7 derniers jours)</CardTitle>
              <CardDescription>Suivi de l'activité et des performances de vos agents IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Graphique de performance des agents</p>
                  <p className="text-sm">Données temps réel disponibles prochainement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <SerperSearchInterface />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <AITaskLauncher />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <SerperResultsDisplay
            results={searchResults}
            isLoading={isSearching}
            onAddProspect={handleAddProspect}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
