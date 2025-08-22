"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Target,
  Users,
  TrendingUp,
  Search,
  Activity,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react"
import { useState, useEffect } from "react"
import { campaignApi, prospectApi, agentApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Campaign, Prospect, AgentActivity } from "@/lib/types"

interface SearchResult {
  title: string
  link: string
  snippet: string
  timestamp: string
}

interface LogEntry {
  id: string
  timestamp: string
  type: "search" | "prospect" | "interaction" | "system"
  message: string
  details?: string
  status: "success" | "warning" | "error" | "info"
}

interface CampaignDetailsModalProps {
  campaign: Campaign | null
  isOpen: boolean
  onClose: () => void
}

// Mapping des pays vers les drapeaux
const countryFlags: { [key: string]: string } = {
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "United Kingdom": "🇬🇧",
  "Italy": "🇮🇹",
  "Spain": "🇪🇸",
  "Netherlands": "🇳🇱",
  "Belgium": "🇧🇪",
  "Switzerland": "🇨🇭",
  "Canada": "🇨🇦",
  "United States": "🇺🇸",
  "International": "🌍",
  "Côte d'Ivoire": "🇨🇮"
}

export function CampaignDetailsModal({ campaign, isOpen, onClose }: CampaignDetailsModalProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([])
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(campaign)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (campaign && isOpen) {
      setCurrentCampaign(campaign)
      loadCampaignData()
    }
  }, [campaign, isOpen])

  const loadCampaignData = async () => {
    if (!campaign) return
    
    try {
      setIsLoading(true)
      
      // Recharger les données de la campagne depuis le backend pour avoir les infos à jour
      const refreshedCampaign = await campaignApi.getCampaign(campaign.id)
      setCurrentCampaign(refreshedCampaign)
      
      // Charger les prospects de cette campagne
      const campaignProspects = await prospectApi.getProspects({ campaign_id: campaign.id })
      setProspects(campaignProspects)
      
      // Charger les activités des agents pour cette campagne
      const activities = await agentApi.getAgentActivity({ campaign_id: campaign.id })
      const campaignActivities = activities
      setAgentActivities(campaignActivities)
      
      // Générer les logs basés sur les activités réelles
      const generatedLogs: LogEntry[] = campaignActivities.map((activity, index) => ({
        id: activity.id.toString(),
        timestamp: new Date(activity.started_at).toLocaleString('fr-FR'),
        type: activity.status === 'completed' ? 'prospect' : activity.status === 'error' ? 'system' : 'interaction',
        message: activity.message || `Tâche ${activity.task_name || 'inconnue'} - ${activity.agent_name}`,
        details: activity.error_message || `Agent: ${activity.agent_name} | Statut: ${activity.status}`,
        status: activity.status === 'completed' ? 'success' : activity.status === 'error' ? 'error' : 'info'
      }))
      
      setLogs(generatedLogs)
      
      // Simulation des résultats de recherche SERPER basés sur la campagne actualisée
      const currentCampaignData = refreshedCampaign || campaign
      setSearchResults([
        {
          title: `${currentCampaignData.target_sectors.join(', ')} Companies in ${currentCampaignData.target_location} - Market Analysis`,
          link: "https://example.com/market-analysis",
          snippet: `Comprehensive analysis of ${currentCampaignData.target_sectors.join(' and ')} companies in ${currentCampaignData.target_location}, identified through our AI prospecting system.`,
          timestamp: "Il y a 15 min",
        },
        {
          title: `${currentCampaignData.target_location} Business Directory - ${currentCampaignData.target_sectors[0]}`,
          link: "https://example.com/business-directory",
          snippet: `Latest business directory for ${currentCampaignData.target_sectors[0]} sector in ${currentCampaignData.target_location}, featuring key companies and contact information.`,
          timestamp: "Il y a 32 min",
        },
        {
          title: `Market Report 2025 - ${currentCampaignData.target_location}`,
          link: "https://example.com/market-report",
          snippet: `Market trends and opportunities in ${currentCampaignData.target_location} for ${currentCampaignData.target_sectors.join(', ')} sectors.`,
          timestamp: "Il y a 1h",
        },
      ])
      
    } catch (error) {
      console.error('Failed to load campaign data:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la campagne",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const performSearch = async () => {
    const searchCampaign = currentCampaign || campaign
    if (!searchCampaign) return
    
    setIsSearching(true)
    // Simulation d'appel SERPER API
    setTimeout(() => {
      const newResult = {
        title: `Nouvelle recherche - ${searchCampaign.target_location} ${searchCampaign.target_sectors[0]} Prospects`,
        link: "https://example.com/new-search",
        snippet: `Résultats de recherche en temps réel pour les prospects ${searchCampaign.target_sectors[0]} en ${searchCampaign.target_location}.`,
        timestamp: "À l'instant",
      }
      setSearchResults((prev) => [newResult, ...prev])

      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString("fr-FR"),
        type: "search",
        message: "Nouvelle recherche SERPER effectuée",
        details: `Query: ${searchCampaign.target_location} ${searchCampaign.target_sectors.join(' ')} prospects | Results: ${Math.floor(Math.random() * 200) + 50} nouveaux`,
        status: "success",
      }
      setLogs((prev) => [newLog, ...prev])
      setIsSearching(false)
    }, 2000)
  }

  const calculateProgress = (): number => {
    const activeCampaign = currentCampaign || campaign
    if (!activeCampaign) return 0
    if (activeCampaign.status === 'completed') return 100
    if (activeCampaign.status === 'pending') return 0
    if (activeCampaign.status === 'failed') return 0
    
    // Pour les campagnes en cours, calculer un pourcentage basé sur les résultats
    const prospectsFound = activeCampaign.results_summary?.prospects_found || prospects.length
    const targetCount = activeCampaign.prospect_count || 1
    return Math.min(100, (prospectsFound / targetCount) * 100)
  }

  const calculateConversionRate = (): number => {
    if (prospects.length === 0) return 0
    const convertedProspects = prospects.filter(p => p.status === 'converted' || p.status === 'qualified').length
    return Math.round((convertedProspects / prospects.length) * 1000) / 10
  }

  const activeCampaign = currentCampaign || campaign
  if (!activeCampaign) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-blue-100 text-blue-700">En cours</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Terminée</Badge>
      case "pending":
        return <Badge className="bg-gray-100 text-gray-700">En attente</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-700">Échec</Badge>
      case "cancelled":
        return <Badge className="bg-orange-100 text-orange-700">Annulée</Badge>
      default:
        return <Badge>Inconnu</Badge>
    }
  }

  const getProspectStatusBadge = (status: string) => {
    switch (status) {
      case "identified":
        return <Badge variant="outline">Identifié</Badge>
      case "contacted":
        return <Badge className="bg-blue-100 text-blue-700">Contacté</Badge>
      case "qualified":
        return <Badge className="bg-yellow-100 text-yellow-700">Qualifié</Badge>
      case "converted":
        return <Badge className="bg-green-100 text-green-700">Converti</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const flag = countryFlags[activeCampaign.target_location] || "🌍"
  const progress = calculateProgress()
  const conversionRate = calculateConversionRate()
  const prospectsFound = activeCampaign.results_summary?.prospects_found || prospects.length

  const getLogIcon = (type: string, status: string) => {
    if (status === "success") return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status === "warning") return <AlertCircle className="h-4 w-4 text-yellow-500" />
    if (status === "error") return <AlertCircle className="h-4 w-4 text-red-500" />

    switch (type) {
      case "search":
        return <Search className="h-4 w-4 text-blue-500" />
      case "prospect":
        return <Users className="h-4 w-4 text-purple-500" />
      case "interaction":
        return <Activity className="h-4 w-4 text-orange-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">{flag}</span>
            <span>{activeCampaign.name}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="search">Recherches SERPER</TabsTrigger>
            <TabsTrigger value="logs">Logs d'interactions</TabsTrigger>
            <TabsTrigger value="prospects">Prospects détaillés</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Chargement des données...</div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(activeCampaign.status)}
                    <div className="flex items-center space-x-2">
                      <Progress value={progress} className="w-32" />
                      <span className="text-sm font-medium">{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Prospects trouvés</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{prospectsFound}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Taux de conversion</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{conversionRate}%</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Créée le</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">{new Date(activeCampaign.created_at).toLocaleDateString('fr-FR')}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Secteurs ciblés</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">{activeCampaign.target_sectors.join(', ')}</div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Résultats de recherche SERPER</h3>
              <Button onClick={performSearch} disabled={isSearching || isLoading} size="sm">
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? "Recherche..." : "Nouvelle recherche"}
              </Button>
            </div>

            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Chargement des résultats de recherche...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-600 hover:text-blue-800">
                              <a
                                href={result.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center"
                              >
                                {result.title}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">{result.snippet}</p>
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {result.timestamp}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Journal des interactions</h3>
              <Badge variant="outline">{logs.length} entrées</Badge>
            </div>
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Chargement des logs...</div>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Aucune activité enregistrée pour cette campagne</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-3">
                          {getLogIcon(log.type, log.status)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{log.message}</p>
                              <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                            </div>
                            {log.details && <p className="text-xs text-muted-foreground mt-1">{log.details}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="prospects" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Prospects détaillés</h3>
              <Badge variant="outline">{prospects.length} prospects</Badge>
            </div>
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Chargement des prospects...</div>
                </div>
              ) : prospects.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Aucun prospect trouvé pour cette campagne</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {prospects.map((prospect) => (
                    <Card key={prospect.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{prospect.company_name}</h4>
                            {prospect.contact_name && (
                              <p className="text-sm text-muted-foreground">{prospect.contact_name}</p>
                            )}
                            {prospect.email && (
                              <p className="text-sm text-muted-foreground">{prospect.email}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs">
                              {prospect.sector && <span>Secteur: {prospect.sector}</span>}
                              {prospect.company_size && <span>Taille: {prospect.company_size}</span>}
                              <span>Score: {Math.round(prospect.quality_score)}%</span>
                              {prospect.location && <span>Lieu: {prospect.location}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            {getProspectStatusBadge(prospect.status)}
                            {prospect.website && (
                              <a 
                                href={prospect.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Site web
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
