"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Eye, Pause, Play, Download, MoreHorizontal } from "lucide-react"
import { CampaignCreationModal } from "@/components/app/campaign-creation-modal"
import { CampaignDetailsModal } from "@/components/app/campaign-details-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/lib/store"
import { campaignApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Campaign } from "@/lib/types"

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

export default function CampaignsPage() {
  const { campaigns, setCampaigns } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Charger les campagnes au montage
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setIsLoading(true)
        const fetchedCampaigns = await campaignApi.getCampaigns()
        setCampaigns(fetchedCampaigns)
      } catch (error) {
        console.error('Failed to load campaigns:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les campagnes",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCampaigns()
    
    // Recharger toutes les 30 secondes pour les mises à jour en temps réel
    const interval = setInterval(loadCampaigns, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            En cours
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Terminée
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            En attente
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            Échec
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            Annulée
          </Badge>
        )
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setIsDetailsModalOpen(true)
  }

  const handleCampaignAction = async (campaignId: number, action: 'start' | 'stop') => {
    try {
      if (action === 'start') {
        await campaignApi.startCampaign(campaignId)
        toast({
          title: "Campagne démarrée",
          description: "La campagne a été démarrée avec succès",
        })
      } else {
        await campaignApi.stopCampaign(campaignId)
        toast({
          title: "Campagne arrêtée",
          description: "La campagne a été arrêtée",
        })
      }
      
      // Recharger les campagnes
      const updatedCampaigns = await campaignApi.getCampaigns()
      setCampaigns(updatedCampaigns)
    } catch (error) {
      console.error('Failed to update campaign:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier la campagne",
        variant: "destructive",
      })
    }
  }

  const calculateProgress = (campaign: Campaign): number => {
    if (campaign.status === 'completed') return 100
    if (campaign.status === 'pending') return 0
    if (campaign.status === 'failed') return 0
    
    // Pour les campagnes en cours, calculer un pourcentage basé sur les résultats
    const prospectsFound = campaign.results_summary?.prospects_found || 0
    const targetCount = campaign.prospect_count || 1
    return Math.min(100, (prospectsFound / targetCount) * 100)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Manage your international prospecting campaigns</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-muted-foreground">Chargement des campagnes...</div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Aucune campagne</h3>
          <p className="text-muted-foreground mb-4">Créez votre première campagne de prospection</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle campagne
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const progress = calculateProgress(campaign)
            const flag = countryFlags[campaign.target_location] || "🌍"
            
            return (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{flag}</span>
                        <span className="text-sm text-muted-foreground">
                          {campaign.target_location}
                        </span>
                      </div>
                    </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(campaign)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleCampaignAction(campaign.id, campaign.status === "running" ? "stop" : "start")}
                      disabled={campaign.status === "completed" || campaign.status === "failed"}
                    >
                      {campaign.status === "running" ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Arrêter campagne
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Démarrer campagne
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={campaign.status === "pending"}>
                      <Download className="mr-2 h-4 w-4" />
                      Exporter résultats
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {campaign.target_sectors.slice(0, 2).map((sector) => (
                      <Badge key={sector} variant="outline" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                    {campaign.target_sectors.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{campaign.target_sectors.length - 2} more
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      {getStatusBadge(campaign.status)}
                      <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prospects cible</span>
                    <span className="font-medium">{campaign.prospect_count}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trouvés</span>
                    <span className="font-medium">{campaign.results_summary?.prospects_found || 0}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Créée</span>
                    <span className="font-medium">{new Date(campaign.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CampaignCreationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <CampaignDetailsModal 
        campaign={selectedCampaign} 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
      />
    </div>
  )
}
