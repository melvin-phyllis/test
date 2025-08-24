"use client"

import { useState, useEffect } from "react"
import { useRealTimeData } from "@/hooks/use-real-time-data"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Play,
  Pause,
  Plus,
  Search,
  MoreHorizontal,
  Users,
  Mail,
  Phone,
  MessageSquare,
  TrendingUp,
  Calendar,
  Target,
  Zap,
} from "lucide-react"

// Types pour les campagnes
interface Campaign {
  id: number
  name: string
  status: "draft" | "running" | "paused" | "completed"
  product_description: string
  target_location?: string
  target_sectors?: string[]
  prospect_count: number
  created_at: string
  started_at?: string
  completed_at?: string
}

// Données simulées des campagnes
const campaigns: Campaign[] = [
  {
    id: "1",
    name: "SaaS Startup Outreach Q1",
    status: "active",
    type: "email",
    prospects: 500,
    contacted: 342,
    responses: 28,
    meetings: 12,
    conversionRate: 8.2,
    startDate: "2024-01-15",
    agent: "Agent Commercial",
    template: "SaaS Cold Email",
  },
  {
    id: "2",
    name: "LinkedIn Tech Leaders",
    status: "active",
    type: "linkedin",
    prospects: 250,
    contacted: 180,
    responses: 22,
    meetings: 8,
    conversionRate: 12.2,
    startDate: "2024-01-20",
    agent: "Agent LinkedIn",
    template: "Tech Executive Outreach",
  },
  {
    id: "3",
    name: "Enterprise Sales Campaign",
    status: "paused",
    type: "mixed",
    prospects: 150,
    contacted: 89,
    responses: 15,
    meetings: 6,
    conversionRate: 16.9,
    startDate: "2024-01-10",
    agent: "Agent Enterprise",
    template: "Enterprise Multi-Touch",
  },
  {
    id: "4",
    name: "Startup Founders Outreach",
    status: "completed",
    type: "email",
    prospects: 300,
    contacted: 300,
    responses: 45,
    meetings: 18,
    conversionRate: 15.0,
    startDate: "2023-12-01",
    endDate: "2024-01-15",
    agent: "Agent Startup",
    template: "Founder to Founder",
  },
]

const statusColors = {
  active: "bg-green-500",
  paused: "bg-yellow-500",
  completed: "bg-blue-500",
  draft: "bg-gray-500",
}

const typeIcons = {
  email: Mail,
  linkedin: Users,
  phone: Phone,
  mixed: MessageSquare,
}

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    product_description: "",
    target_location: "",
    target_sectors: [] as string[],
    prospect_count: 100
  })
  
  const { campaigns, loading, error, startCampaign, stopCampaign, refreshData } = useRealTimeData()

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Campaign["status"]) => {
    const colors = {
      running: "bg-green-100 text-green-800 border-green-200",
      paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      draft: "bg-gray-100 text-gray-800 border-gray-200",
    }

    const labels = {
      running: "En cours",
      paused: "En pause",
      completed: "Terminé",
      draft: "Brouillon",
    }

    return (
      <Badge variant="outline" className={colors[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const handleStartCampaign = async (campaignId: number) => {
    try {
      await startCampaign(campaignId)
      toast.success("Campagne démarrée avec succès")
    } catch (error) {
      toast.error("Erreur lors du démarrage de la campagne")
    }
  }

  const handleStopCampaign = async (campaignId: number) => {
    try {
      await stopCampaign(campaignId)
      toast.success("Campagne arrêtée avec succès")
    } catch (error) {
      toast.error("Erreur lors de l'arrêt de la campagne")
    }
  }

  const handleCreateCampaign = async () => {
    try {
      // Ici on appellerait l'API pour créer la campagne
      // await apiClient.createCampaign(newCampaign)
      setIsCreateDialogOpen(false)
      setNewCampaign({ name: "", product_description: "", target_location: "", target_sectors: [], prospect_count: 100 })
      toast.success("Campagne créée avec succès")
      refreshData()
    } catch (error) {
      toast.error("Erreur lors de la création de la campagne")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-primary">Campagnes</h1>
          <p className="text-muted-foreground">Gérez et suivez vos campagnes de prospection IA</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle campagne
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle campagne</DialogTitle>
              <DialogDescription>Configurez votre campagne de prospection IA</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Nom de la campagne</Label>
                  <Input id="campaign-name" placeholder="Ex: Outreach Q1 2024" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-type">Type de campagne</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="phone">Téléphone</SelectItem>
                      <SelectItem value="mixed">Multi-canal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent">Agent IA</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Agent Commercial</SelectItem>
                      <SelectItem value="linkedin">Agent LinkedIn</SelectItem>
                      <SelectItem value="enterprise">Agent Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saas">SaaS Cold Email</SelectItem>
                      <SelectItem value="tech">Tech Executive</SelectItem>
                      <SelectItem value="enterprise">Enterprise Multi-Touch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Décrivez l'objectif de cette campagne..." rows={3} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-start" />
                <Label htmlFor="auto-start">Démarrer automatiquement</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button className="bg-primary hover:bg-primary/90">Créer la campagne</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres et recherche */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher une campagne..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="running">En cours</SelectItem>
            <SelectItem value="paused">En pause</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des campagnes */}
      <div className="grid gap-6">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <CardTitle className="font-serif">{campaign.name}</CardTitle>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>

                <div className="flex items-center space-x-2">
                  {campaign.status === "running" && (
                    <Button size="sm" variant="outline" onClick={() => handleStopCampaign(campaign.id)}>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  {campaign.status === "paused" && (
                    <Button size="sm" variant="outline" onClick={() => handleStartCampaign(campaign.id)}>
                      <Play className="h-4 w-4 mr-1" />
                      Reprendre
                    </Button>
                  )}
                  {campaign.status === "draft" && (
                    <Button size="sm" variant="outline" onClick={() => handleStartCampaign(campaign.id)}>
                      <Play className="h-4 w-4 mr-1" />
                      Démarrer
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardDescription className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Démarré le {new Date(campaign.startDate).toLocaleDateString("fr-FR")}
                </span>
                <span className="flex items-center">
                  <Zap className="h-4 w-4 mr-1" />
                  {campaign.agent}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{campaign.prospects}</div>
                  <div className="text-sm text-muted-foreground">Prospects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{campaign.contacted}</div>
                  <div className="text-sm text-muted-foreground">Contactés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{campaign.responses}</div>
                  <div className="text-sm text-muted-foreground">Réponses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{campaign.meetings}</div>
                  <div className="text-sm text-muted-foreground">RDV</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Progression</span>
                  <span className="font-medium">{Math.round((campaign.contacted / campaign.prospects) * 100)}%</span>
                </div>
                <Progress value={(campaign.contacted / campaign.prospects) * 100} className="h-2" />

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                    Taux de conversion
                  </span>
                  <span className="font-medium text-green-600">{campaign.conversionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune campagne trouvée</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Aucune campagne ne correspond à vos critères de recherche."
                : "Créez votre première campagne de prospection IA."}
            </p>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une campagne
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
