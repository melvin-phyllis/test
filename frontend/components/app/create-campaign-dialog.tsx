"use client"

import { useState } from "react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Bot, Target, Settings, Zap, Users, Globe, Building } from "lucide-react"

interface CreateCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCampaignCreated?: () => void
}

export function CreateCampaignDialog({ open, onOpenChange, onCampaignCreated }: CreateCampaignDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [customSector, setCustomSector] = useState("")
  const [customPosition, setCustomPosition] = useState("")
  const [customLocation, setCustomLocation] = useState("")

  const [campaignData, setCampaignData] = useState({
    name: "",
    description: "",
    type: "",
    targetSectors: [] as string[],
    targetPositions: [] as string[],
    locations: [] as string[],
    aggressiveness: [50],
    useSerper: true,
    maxProspects: 100,
    dailyLimit: 20,
    budget: "",
    duration: "",
    priority: "medium",
    notes: "",
  })

  const handleCreateCampaign = async () => {
    setIsLoading(true)

    try {
      // Préparer les données pour l'API backend
      const campaignPayload = {
        name: campaignData.name,
        product_description: `${campaignData.description}. Type: ${campaignData.type}. ${campaignData.notes ? 'Notes: ' + campaignData.notes : ''}`,
        target_location: campaignData.locations.join(", ") || "Global",
        target_sectors: campaignData.targetSectors,
        prospect_count: campaignData.maxProspects,
        config: {
          type: campaignData.type,
          priority: campaignData.priority,
          targetPositions: campaignData.targetPositions,
          aggressiveness: campaignData.aggressiveness[0],
          useSerper: campaignData.useSerper,
          dailyLimit: campaignData.dailyLimit,
          budget: campaignData.budget,
          duration: campaignData.duration,
          agents: {
            researcher: true,
            analyst: true,
            outreach: campaignData.type === "lead-generation",
            followUp: campaignData.type === "lead-generation"
          }
        }
      }

      console.log("[CreateCampaign] Sending payload:", campaignPayload)

      // Créer la campagne via l'API
      const createdCampaign = await apiClient.createCampaign(campaignPayload)
      
      toast.success("Campagne créée avec succès !", {
        description: `La campagne "${createdCampaign.name}" a été créée et sera bientôt démarrée.`
      })

      // Démarrer automatiquement la campagne si demandé
      if (campaignData.type) {
        setTimeout(async () => {
          try {
            await apiClient.startCampaign(createdCampaign.id)
            toast.success("Agents IA lancés !", {
              description: `Les agents CrewAI travaillent maintenant sur la campagne "${createdCampaign.name}".`
            })
          } catch (error) {
            console.error("Erreur lors du démarrage:", error)
            toast.error("Erreur lors du démarrage des agents", {
              description: "La campagne a été créée mais les agents n'ont pas pu être démarrés."
            })
          }
        }, 1000)
      }

      // Fermer le modal et réinitialiser
      onOpenChange(false)
      onCampaignCreated?.()
      
      // Reset form
      setCampaignData({
        name: "",
        description: "",
        type: "",
        targetSectors: [],
        targetPositions: [],
        locations: [],
        aggressiveness: [50],
        useSerper: true,
        maxProspects: 100,
        dailyLimit: 20,
        budget: "",
        duration: "",
        priority: "medium",
        notes: "",
      })
      setCustomSector("")
      setCustomPosition("")
      setCustomLocation("")

    } catch (error) {
      console.error("Erreur lors de la création de la campagne:", error)
      toast.error("Erreur lors de la création", {
        description: error instanceof Error ? error.message : "Une erreur inattendue s'est produite."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addTargetItem = (category: "targetSectors" | "targetPositions" | "locations", value: string) => {
    if (value && !campaignData[category].includes(value)) {
      setCampaignData((prev) => ({
        ...prev,
        [category]: [...prev[category], value],
      }))
    }
  }

  const addCustomItem = (
    category: "targetSectors" | "targetPositions" | "locations",
    value: string,
    setter: (value: string) => void,
  ) => {
    if (value.trim()) {
      addTargetItem(category, value.trim())
      setter("")
    }
  }

  const removeTargetItem = (category: "targetSectors" | "targetPositions" | "locations", value: string) => {
    setCampaignData((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item !== value),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-accent" />
            <span>Créer une nouvelle campagne CrewAI</span>
          </DialogTitle>
          <DialogDescription>
            Configurez votre campagne de prospection automatisée avec des agents IA spécialisés
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Informations</TabsTrigger>
            <TabsTrigger value="targeting">Ciblage</TabsTrigger>
            <TabsTrigger value="agents">Agents IA</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Informations de base</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Nom de la campagne *</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Ex: Prospection Tech Startups Q1 2024"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-description">Description *</Label>
                  <Textarea
                    id="campaign-description"
                    placeholder="Décrivez l'objectif et la stratégie de cette campagne..."
                    value={campaignData.description}
                    onChange={(e) => setCampaignData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-type">Type de campagne *</Label>
                    <Select
                      value={campaignData.type}
                      onValueChange={(value) => setCampaignData((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead-generation">Génération de leads</SelectItem>
                        <SelectItem value="market-research">Étude de marché</SelectItem>
                        <SelectItem value="competitor-analysis">Analyse concurrentielle</SelectItem>
                        <SelectItem value="partnership">Recherche de partenaires</SelectItem>
                        <SelectItem value="recruitment">Recrutement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="campaign-priority">Priorité</Label>
                    <Select
                      value={campaignData.priority}
                      onValueChange={(value) => setCampaignData((prev) => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-budget">Budget (optionnel)</Label>
                    <Input
                      id="campaign-budget"
                      placeholder="Ex: 5000€"
                      value={campaignData.budget}
                      onChange={(e) => setCampaignData((prev) => ({ ...prev, budget: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="campaign-duration">Durée estimée</Label>
                    <Input
                      id="campaign-duration"
                      placeholder="Ex: 30 jours"
                      value={campaignData.duration}
                      onChange={(e) => setCampaignData((prev) => ({ ...prev, duration: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-notes">Notes additionnelles</Label>
                  <Textarea
                    id="campaign-notes"
                    placeholder="Ajoutez des notes, instructions spéciales, ou contexte supplémentaire..."
                    value={campaignData.notes}
                    onChange={(e) => setCampaignData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="targeting" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Building className="w-4 h-4" />
                    <span>Secteurs d'activité</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {campaignData.targetSectors.map((sector) => (
                      <Badge key={sector} variant="secondary" className="text-xs">
                        {sector}
                        <button
                          onClick={() => removeTargetItem("targetSectors", sector)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(value) => addTargetItem("targetSectors", value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Secteurs prédéfinis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technologie">Technologie</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Santé">Santé</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Éducation">Éducation</SelectItem>
                      <SelectItem value="Immobilier">Immobilier</SelectItem>
                      <SelectItem value="Automobile">Automobile</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Secteur personnalisé"
                      value={customSector}
                      onChange={(e) => setCustomSector(e.target.value)}
                      className="h-8"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addCustomItem("targetSectors", customSector, setCustomSector)
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addCustomItem("targetSectors", customSector, setCustomSector)}
                      className="h-8 px-2"
                    >
                      +
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4" />
                    <span>Postes ciblés</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {campaignData.targetPositions.map((position) => (
                      <Badge key={position} variant="secondary" className="text-xs">
                        {position}
                        <button
                          onClick={() => removeTargetItem("targetPositions", position)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(value) => addTargetItem("targetPositions", value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Postes prédéfinis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CEO">CEO</SelectItem>
                      <SelectItem value="CTO">CTO</SelectItem>
                      <SelectItem value="CMO">CMO</SelectItem>
                      <SelectItem value="Directeur Marketing">Directeur Marketing</SelectItem>
                      <SelectItem value="Responsable Commercial">Responsable Commercial</SelectItem>
                      <SelectItem value="Founder">Founder</SelectItem>
                      <SelectItem value="VP Sales">VP Sales</SelectItem>
                      <SelectItem value="Head of Growth">Head of Growth</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Poste personnalisé"
                      value={customPosition}
                      onChange={(e) => setCustomPosition(e.target.value)}
                      className="h-8"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addCustomItem("targetPositions", customPosition, setCustomPosition)
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addCustomItem("targetPositions", customPosition, setCustomPosition)}
                      className="h-8 px-2"
                    >
                      +
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Globe className="w-4 h-4" />
                    <span>Localisations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {campaignData.locations.map((location) => (
                      <Badge key={location} variant="secondary" className="text-xs">
                        {location}
                        <button
                          onClick={() => removeTargetItem("locations", location)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(value) => addTargetItem("locations", value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Localisations prédéfinies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paris, France">Paris, France</SelectItem>
                      <SelectItem value="Lyon, France">Lyon, France</SelectItem>
                      <SelectItem value="Marseille, France">Marseille, France</SelectItem>
                      <SelectItem value="London, UK">London, UK</SelectItem>
                      <SelectItem value="Berlin, Germany">Berlin, Germany</SelectItem>
                      <SelectItem value="Amsterdam, Netherlands">Amsterdam, Netherlands</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Localisation personnalisée"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      className="h-8"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addCustomItem("locations", customLocation, setCustomLocation)
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addCustomItem("locations", customLocation, setCustomLocation)}
                      className="h-8 px-2"
                    >
                      +
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <span>Configuration des agents IA</span>
                </CardTitle>
                <CardDescription>Sélectionnez et configurez les agents CrewAI pour cette campagne</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Researcher", description: "Recherche et qualification des prospects", enabled: true },
                    { name: "Analyst", description: "Analyse des données et scoring", enabled: true },
                    { name: "Outreach", description: "Prise de contact automatisée", enabled: false },
                    { name: "Follow-up", description: "Suivi et relances", enabled: false },
                  ].map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-muted-foreground">{agent.description}</div>
                      </div>
                      <Switch defaultChecked={agent.enabled} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Paramètres avancés</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Niveau d'agressivité: {campaignData.aggressiveness[0]}%</Label>
                  <Slider
                    value={campaignData.aggressiveness}
                    onValueChange={(value) => setCampaignData((prev) => ({ ...prev, aggressiveness: value }))}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservateur</span>
                    <span>Équilibré</span>
                    <span>Agressif</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Utiliser Serper pour la recherche avancée</Label>
                    <p className="text-sm text-muted-foreground">Améliore la qualité des données prospects</p>
                  </div>
                  <Switch
                    checked={campaignData.useSerper}
                    onCheckedChange={(checked) => setCampaignData((prev) => ({ ...prev, useSerper: checked }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-prospects">Nombre max de prospects</Label>
                    <Input
                      id="max-prospects"
                      type="number"
                      value={campaignData.maxProspects}
                      onChange={(e) =>
                        setCampaignData((prev) => ({ ...prev, maxProspects: Number.parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="daily-limit">Limite quotidienne</Label>
                    <Input
                      id="daily-limit"
                      type="number"
                      value={campaignData.dailyLimit}
                      onChange={(e) =>
                        setCampaignData((prev) => ({ ...prev, dailyLimit: Number.parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleCreateCampaign}
            disabled={isLoading || !campaignData.name || !campaignData.description || !campaignData.type}
            className="animate-pulse-glow"
          >
            {isLoading ? "Création en cours..." : "Créer la campagne"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
