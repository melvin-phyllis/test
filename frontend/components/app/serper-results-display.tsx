"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2, MapPin, Mail, Phone, Linkedin, ExternalLink, Star } from "lucide-react"

interface SerperResult {
  id: string
  name: string
  title: string
  company: string
  location: string
  email?: string
  phone?: string
  linkedin?: string
  score: number
  insights: string[]
  companyInfo?: {
    industry: string
    size: string
    website: string
  }
}

interface SerperResultsDisplayProps {
  results: SerperResult[]
  isLoading: boolean
  onAddProspect: (result: SerperResult) => void
  onViewDetails: (result: SerperResult) => void
}

export function SerperResultsDisplay({ results, isLoading, onAddProspect, onViewDetails }: SerperResultsDisplayProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
          <p className="text-muted-foreground">
            Essayez d'ajuster vos critères de recherche pour obtenir plus de résultats.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {results.length} prospect{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
        </h3>
        <Badge variant="secondary">Enrichi par IA + Serper</Badge>
      </div>

      {results.map((result) => (
        <Card key={result.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={`/abstract-geometric-shapes.png?height=48&width=48&query=${result.name}`} />
                  <AvatarFallback>
                    {result.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-lg">{result.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{result.score}/100</span>
                    </div>
                  </div>

                  <p className="text-primary font-medium">{result.title}</p>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-4 h-4" />
                      <span>{result.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{result.location}</span>
                    </div>
                  </div>

                  {result.companyInfo && (
                    <div className="flex items-center space-x-4 text-sm">
                      <Badge variant="outline">{result.companyInfo.industry}</Badge>
                      <Badge variant="outline">{result.companyInfo.size}</Badge>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm">
                    {result.email && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Mail className="w-4 h-4" />
                        <span>Email disponible</span>
                      </div>
                    )}
                    {result.phone && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Phone className="w-4 h-4" />
                        <span>Téléphone disponible</span>
                      </div>
                    )}
                    {result.linkedin && (
                      <div className="flex items-center space-x-1 text-blue-700">
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </div>
                    )}
                  </div>

                  {result.insights.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Insights IA:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {result.insights.slice(0, 2).map((insight, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="text-primary">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <Button size="sm" onClick={() => onViewDetails(result)} variant="outline">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Détails
                </Button>
                <Button size="sm" onClick={() => onAddProspect(result)} className="bg-primary hover:bg-primary/90">
                  Ajouter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
