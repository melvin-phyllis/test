"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Pause, Play, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CampaignDetailsModal } from "./campaign-details-modal"
import { useAppStore } from "@/lib/store"
import { campaignApi } from "@/lib/api"
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

export function CampaignsTable() {
  const { toast } = useToast()
  const { campaigns, setCampaigns } = useAppStore()
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Charger les campagnes au montage du composant
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
  }, [])

  const handleViewDetails = (campaignId: number) => {
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (campaign) {
      setSelectedCampaign(campaign)
      setIsDetailsModalOpen(true)
    }
    console.log("Viewing details for campaign:", campaignId)
  }

  const handleToggleCampaign = async (campaignId: number) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (!campaign) return

    try {
      if (campaign.status === "pending") {
        // Démarrer la campagne
        await campaignApi.startCampaign(campaignId)
        toast({
          title: "Campagne démarrée",
          description: `"${campaign.name}" a été démarrée`,
        })
      } else if (campaign.status === "running") {
        // Arrêter la campagne
        await campaignApi.stopCampaign(campaignId)
        toast({
          title: "Campagne arrêtée",
          description: `"${campaign.name}" a été arrêtée`,
        })
      }
      
      // Recharger les campagnes pour avoir le statut à jour
      const updatedCampaigns = await campaignApi.getCampaigns()
      setCampaigns(updatedCampaigns)
    } catch (error) {
      console.error('Failed to toggle campaign:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de la campagne",
        variant: "destructive",
      })
    }
  }

  const handleExportResults = async (campaignId: number, campaignName: string) => {
    try {
      // Pour l'instant, exportation simulée - TODO: implémenter l'export réel
      const csvContent = `Nom,Email,Entreprise,Pays,Statut
John Doe,john@example.com,TechCorp,${campaignName},Contacté
Jane Smith,jane@example.com,InnovateLtd,${campaignName},En attente
Mike Johnson,mike@example.com,StartupXYZ,${campaignName},Répondu`

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${campaignName.replace(/\s+/g, "_")}_prospects.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export terminé",
        description: `Fichier "${campaignName}_prospects.csv" téléchargé`,
      })
    } catch (error) {
      console.error('Failed to export results:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les résultats",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Campagnes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">Chargement des campagnes...</div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">Aucune campagne trouvée</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campagne</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Prospects</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {countryFlags[campaign.target_location] || "🌍"}
                        </span>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {campaign.target_location}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell>
                      <span className="font-medium">{campaign.prospect_count}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(campaign.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(campaign.id)}
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleCampaign(campaign.id)}
                        title={campaign.status === "pending" ? "Démarrer" : campaign.status === "running" ? "Arrêter" : ""}
                        disabled={campaign.status === "completed" || campaign.status === "failed" || campaign.status === "cancelled"}
                      >
                        {campaign.status === "running" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExportResults(campaign.id, campaign.name)}
                        title="Exporter les résultats"
                        disabled={campaign.status === "pending"}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <CampaignDetailsModal
        campaign={selectedCampaign}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </>
  )
}
