"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Bot, Settings, Zap, Target, Brain, Search } from "lucide-react"

interface AgentConfig {
  name: string
  type: "prospection" | "enrichment" | "outreach" | "research"
  aggressiveness: number
  language: string
  tone: string
  searchDepth: number
  useSerper: boolean
  targetCriteria: {
    industries: string[]
    positions: string[]
    locations: string[]
    companySize: string
  }
  customPrompt: string
}

interface AIAgentConfiguratorProps {
  onSaveAgent: (config: AgentConfig) => void
  onTestAgent: (config: AgentConfig) => void
  existingConfig?: AgentConfig
}

export function AIAgentConfigurator({ onSaveAgent, onTestAgent, existingConfig }: AIAgentConfiguratorProps) {
  const [config, setConfig] = useState<AgentConfig>(
    existingConfig || {
      name: "",
      type: "prospection",
      aggressiveness: 50,
      language: "fr",
      tone: "professional",
      searchDepth: 3,
      useSerper: true,
      targetCriteria: {
        industries: [],
        positions: [],
        locations: [],
        companySize: "all",
      },
      customPrompt: "",
    },
  )

  const [newIndustry, setNewIndustry] = useState("")
  const [newPosition, setNewPosition] = useState("")
  const [newLocation, setNewLocation] = useState("")

  const addToArray = (field: keyof typeof config.targetCriteria, value: string) => {
    if (value.trim() && Array.isArray(config.targetCriteria[field])) {
      setConfig((prev) => ({
        ...prev,
        targetCriteria: {
          ...prev.targetCriteria,
          [field]: [...(prev.targetCriteria[field] as string[]), value.trim()],
        },
      }))
    }
  }

  const removeFromArray = (field: keyof typeof config.targetCriteria, index: number) => {
    setConfig((prev) => ({
      ...prev,
      targetCriteria: {
        ...prev.targetCriteria,
        [field]: (prev.targetCriteria[field] as string[]).filter((_, i) => i !== index),
      },
    }))
  }

  const agentTypes = [
    {
      value: "prospection",
      label: "Prospection",
      icon: Target,
      description: "Recherche et qualification de prospects",
    },
    { value: "enrichment", label: "Enrichissement", icon: Brain, description: "Enrichissement de données existantes" },
    { value: "outreach", label: "Outreach", icon: Zap, description: "Génération de messages personnalisés" },
    { value: "research", label: "Recherche", icon: Search, description: "Recherche approfondie d'entreprises" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span>Configuration de l'Agent IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Nom de l'agent</Label>
              <Input
                id="agent-name"
                value={config.name}
                onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Agent Prospection Tech"
              />
            </div>

            <div className="space-y-2">
              <Label>Type d'agent</Label>
              <Select
                value={config.type}
                onValueChange={(value: any) => setConfig((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* AI Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Paramètres IA</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Langue</Label>
                <Select
                  value={config.language}
                  onValueChange={(value) => setConfig((prev) => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ton de communication</Label>
                <Select value={config.tone} onValueChange={(value) => setConfig((prev) => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professionnel</SelectItem>
                    <SelectItem value="friendly">Amical</SelectItem>
                    <SelectItem value="formal">Formel</SelectItem>
                    <SelectItem value="casual">Décontracté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Niveau d'agressivité: {config.aggressiveness}%</Label>
              <Slider
                value={[config.aggressiveness]}
                onValueChange={(value) => setConfig((prev) => ({ ...prev, aggressiveness: value[0] }))}
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

            <div className="space-y-2">
              <Label>Profondeur de recherche: {config.searchDepth}</Label>
              <Slider
                value={[config.searchDepth]}
                onValueChange={(value) => setConfig((prev) => ({ ...prev, searchDepth: value[0] }))}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Rapide</span>
                <span>Standard</span>
                <span>Approfondi</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={config.useSerper}
                onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, useSerper: checked }))}
              />
              <Label>Utiliser Serper pour la recherche avancée</Label>
            </div>
          </div>

          {/* Target Criteria */}
          <div className="space-y-4">
            <h4 className="font-semibold">Critères de ciblage</h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Secteurs d'activité</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    placeholder="Ex: Technologie, Finance..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addToArray("industries", newIndustry)
                        setNewIndustry("")
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      addToArray("industries", newIndustry)
                      setNewIndustry("")
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.targetCriteria.industries.map((industry, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeFromArray("industries", index)}
                    >
                      {industry} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Postes ciblés</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    placeholder="Ex: CEO, CTO, Directeur Marketing..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addToArray("positions", newPosition)
                        setNewPosition("")
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      addToArray("positions", newPosition)
                      setNewPosition("")
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.targetCriteria.positions.map((position, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeFromArray("positions", index)}
                    >
                      {position} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Localisations</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Ex: Paris, France, Europe..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addToArray("locations", newLocation)
                        setNewLocation("")
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      addToArray("locations", newLocation)
                      setNewLocation("")
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.targetCriteria.locations.map((location, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeFromArray("locations", index)}
                    >
                      {location} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Taille d'entreprise</Label>
                <Select
                  value={config.targetCriteria.companySize}
                  onValueChange={(value) =>
                    setConfig((prev) => ({
                      ...prev,
                      targetCriteria: { ...prev.targetCriteria, companySize: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes tailles</SelectItem>
                    <SelectItem value="startup">Startup (1-10)</SelectItem>
                    <SelectItem value="small">PME (11-50)</SelectItem>
                    <SelectItem value="medium">Moyenne (51-200)</SelectItem>
                    <SelectItem value="large">Grande (201-1000)</SelectItem>
                    <SelectItem value="enterprise">Entreprise (1000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="custom-prompt">Prompt personnalisé (optionnel)</Label>
            <Textarea
              id="custom-prompt"
              value={config.customPrompt}
              onChange={(e) => setConfig((prev) => ({ ...prev, customPrompt: e.target.value }))}
              placeholder="Instructions spécifiques pour l'agent IA..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            <Button onClick={() => onTestAgent(config)} variant="outline" disabled={!config.name}>
              Tester l'agent
            </Button>
            <Button
              onClick={() => onSaveAgent(config)}
              disabled={!config.name}
              className="bg-primary hover:bg-primary/90"
            >
              Sauvegarder l'agent
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
