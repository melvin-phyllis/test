"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building, 
  Users, 
  Star, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Linkedin,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"
import { useState } from "react"
import { ProspectCard } from "./prospect-card"
import { Prospect } from "@/hooks/use-prospects"
import { useCrewAIProspects, CrewAIProspect } from "@/hooks/use-crewai-prospects"

interface CrewAIProspectsDisplayProps {
  campaignId?: number
}

export function CrewAIProspectsDisplay({ campaignId }: CrewAIProspectsDisplayProps) {
  const { prospects, stats, loading, error, refreshProspects } = useCrewAIProspects(campaignId)
  const [activeTab, setActiveTab] = useState("all")

  const getFilteredProspects = () => {
    switch (activeTab) {
      case "qualified":
        return prospects.filter(p => p.quality_score >= 80)
      case "identified":
        return prospects.filter(p => p.quality_score < 80)
      case "high-score":
        return prospects.filter(p => p.quality_score >= 90)
      default:
        return prospects
    }
  }

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Chargement des prospects CrewAI...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (prospects.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-8 text-center">
          <div className="space-y-3">
            <Building className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">Aucun prospect CrewAI trouvé</h3>
            <p className="text-sm text-muted-foreground">
              {campaignId 
                ? "Cette campagne n'a pas encore généré de prospects"
                : "Aucune campagne n'a encore généré de prospects"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            Prospects CrewAI
          </h2>
          <p className="text-muted-foreground">
            Prospects qualifiés découverts par l'intelligence artificielle
          </p>
        </div>
        <Button variant="outline" onClick={refreshProspects} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Qualifiés</p>
                <p className="text-2xl font-bold">{stats.qualified}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Élevé</p>
                <p className="text-2xl font-bold">{stats.highScore}</p>
              </div>
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Moyen</p>
                <p className="text-2xl font-bold">{stats.avgScore}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de filtrage */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tous ({prospects.length})</TabsTrigger>
          <TabsTrigger value="qualified">Qualifiés ({stats.qualified})</TabsTrigger>
          <TabsTrigger value="identified">Identifiés ({stats.identified})</TabsTrigger>
          <TabsTrigger value="high-score">Score Élevé ({stats.highScore})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getFilteredProspects().map((prospect) => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect as Prospect}
                onEnrich={() => console.log("Enrichir prospect:", prospect.company_name)}
                onContact={() => console.log("Contacter prospect:", prospect.company_name)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
