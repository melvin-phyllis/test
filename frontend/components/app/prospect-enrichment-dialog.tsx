"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Building, MapPin, Users, TrendingUp, ExternalLink, Loader2, Sparkles } from "lucide-react"

interface ProspectEnrichmentDialogProps {
  prospect: {
    name: string
    company: string
    position?: string
  }
  trigger?: React.ReactNode
}

interface EnrichmentData {
  name: string
  company: string
  position?: string
  email?: string
  linkedin?: string
  companyInfo?: {
    name: string
    website?: string
    description?: string
    industry?: string
    location?: string
    employees?: string
    founded?: string
    revenue?: string
  }
  insights?: string[]
}

export function ProspectEnrichmentDialog({ prospect, trigger }: ProspectEnrichmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleEnrich = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Starting prospect enrichment for:", prospect)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Simulate enrichment data
      const simulatedData: EnrichmentData = {
        name: prospect.name,
        company: prospect.company,
        position: prospect.position || "Directeur Commercial",
        email: `${prospect.name.toLowerCase().replace(" ", ".")}@${prospect.company.toLowerCase().replace(" ", "")}.com`,
        linkedin: `https://linkedin.com/in/${prospect.name.toLowerCase().replace(" ", "-")}`,
        companyInfo: {
          name: prospect.company,
          website: `https://www.${prospect.company.toLowerCase().replace(" ", "")}.com`,
          description: `${prospect.company} est une entreprise innovante spécialisée dans les solutions technologiques avancées.`,
          industry: "Technologie",
          location: "Paris, France",
          employees: "50-200",
          founded: "2018",
          revenue: "5-10M€",
        },
        insights: [
          `${prospect.name} a récemment publié sur LinkedIn à propos de l'expansion de ${prospect.company}`,
          `L'entreprise ${prospect.company} recherche activement de nouveaux partenaires technologiques`,
          `Opportunité élevée : ${prospect.company} a levé des fonds récemment et investit dans de nouvelles solutions`,
        ],
      }

      console.log("[v0] Enrichment data simulated:", simulatedData)
      setEnrichmentData(simulatedData)
    } catch (err) {
      console.error("[v0] Enrichment error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Sparkles className="w-4 h-4 mr-2" />
      Enrichir avec IA
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Enrichissement IA - {prospect.name}
          </DialogTitle>
          <DialogDescription>Découvrez des informations détaillées sur ce prospect grâce à l'IA</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!enrichmentData && !isLoading && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Prêt à enrichir ce prospect</h3>
              <p className="text-muted-foreground mb-4">
                Obtenez des informations détaillées sur {prospect.name} et {prospect.company}
              </p>
              <Button onClick={handleEnrich} className="bg-accent hover:bg-accent/90">
                <Sparkles className="w-4 h-4 mr-2" />
                Lancer l'enrichissement
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-accent mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enrichissement en cours...</h3>
              <p className="text-muted-foreground">
                Recherche d'informations sur {prospect.name} et {prospect.company}
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-destructive mb-4">
                <p className="font-semibold">Erreur lors de l'enrichissement</p>
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={handleEnrich} variant="outline">
                Réessayer
              </Button>
            </div>
          )}

          {enrichmentData && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                {/* Prospect Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Informations du prospect
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nom</p>
                        <p className="font-semibold">{enrichmentData.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Poste</p>
                        <p className="font-semibold">
                          {enrichmentData.position || prospect.position || "Non spécifié"}
                        </p>
                      </div>
                    </div>

                    {enrichmentData.linkedin && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">LinkedIn</p>
                        <a
                          href={enrichmentData.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Voir le profil LinkedIn
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Company Information */}
                {enrichmentData.companyInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Informations de l'entreprise
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Entreprise</p>
                          <p className="font-semibold">{enrichmentData.companyInfo.name}</p>
                        </div>
                        {enrichmentData.companyInfo.industry && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Secteur</p>
                            <Badge variant="secondary">{enrichmentData.companyInfo.industry}</Badge>
                          </div>
                        )}
                      </div>

                      {enrichmentData.companyInfo.location && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Localisation</p>
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {enrichmentData.companyInfo.location}
                          </p>
                        </div>
                      )}

                      {enrichmentData.companyInfo.website && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Site web</p>
                          <a
                            href={enrichmentData.companyInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {enrichmentData.companyInfo.website}
                          </a>
                        </div>
                      )}

                      {enrichmentData.companyInfo.description && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                          <p className="text-sm leading-relaxed">{enrichmentData.companyInfo.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* AI Insights */}
                {enrichmentData.insights && enrichmentData.insights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Insights IA
                      </CardTitle>
                      <CardDescription>Informations clés découvertes par l'IA</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {enrichmentData.insights.map((insight, index) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm leading-relaxed">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Fermer
                  </Button>
                  <Button onClick={handleEnrich} disabled={isLoading}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Actualiser les données
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
