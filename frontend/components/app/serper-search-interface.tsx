"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Bot, Zap, Target, Building, Globe, Loader2, CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SearchResult {
  id: string
  title: string
  snippet: string
  link: string
  source: string
  relevanceScore: number
  enrichedData?: {
    company?: string
    position?: string
    email?: string
    linkedin?: string
    phone?: string
  }
}

export default function SerperSearchInterface() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("")
  const [searchType, setSearchType] = useState("prospects")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchCriteria, setSearchCriteria] = useState({
    industry: "",
    location: "",
    companySize: "",
    jobTitle: "",
    keywords: "",
  })

  const agents = [
    {
      id: "prospector",
      name: "Prospecteur Principal",
      description: "Recherche et qualification de prospects avec Serper",
      avatar: "/blue-ai-robot.png",
      specialty: "Prospection LinkedIn + Google",
      status: "active",
    },
    {
      id: "qualifier",
      name: "Qualificateur Expert",
      description: "Analyse et enrichit les données prospects",
      avatar: "/ai-robot-green.png",
      specialty: "Enrichissement de données",
      status: "active",
    },
    {
      id: "analyzer",
      name: "Analyseur de Marché",
      description: "Collecte des insights marché via Serper",
      avatar: "/ai-robot-orange.png",
      specialty: "Intelligence marché",
      status: "active",
    },
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedAgent) return

    setIsSearching(true)

    // Simulation d'une recherche avec l'agent IA + Serper
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: "1",
          title: "Marie Dubois - Directrice Marketing chez TechCorp",
          snippet:
            "Experte en marketing digital avec 8 ans d'expérience. Spécialisée dans la croissance des startups B2B.",
          link: "https://linkedin.com/in/marie-dubois",
          source: "LinkedIn",
          relevanceScore: 95,
          enrichedData: {
            company: "TechCorp",
            position: "Directrice Marketing",
            email: "marie.dubois@techcorp.com",
            linkedin: "https://linkedin.com/in/marie-dubois",
            phone: "+33 1 23 45 67 89",
          },
        },
        {
          id: "2",
          title: "Pierre Martin - CEO de InnovSoft",
          snippet:
            "Entrepreneur passionné par l'IA et l'automatisation. Recherche des solutions pour optimiser les processus.",
          link: "https://innovsoft.com/about",
          source: "Site web",
          relevanceScore: 88,
          enrichedData: {
            company: "InnovSoft",
            position: "CEO",
            email: "p.martin@innovsoft.com",
            linkedin: "https://linkedin.com/in/pierre-martin-ceo",
          },
        },
        {
          id: "3",
          title: "Sophie Laurent - VP Sales chez DataFlow",
          snippet: "Leader commerciale avec un track record de croissance de 300% sur 2 ans. Expertise en SaaS B2B.",
          link: "https://dataflow.com/team",
          source: "Site web",
          relevanceScore: 92,
          enrichedData: {
            company: "DataFlow",
            position: "VP Sales",
            email: "sophie.laurent@dataflow.com",
            linkedin: "https://linkedin.com/in/sophie-laurent-vp",
          },
        },
      ]

      setResults(mockResults)
      setIsSearching(false)
    }, 2000)
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50"
    if (score >= 75) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Recherche IA avec Serper
          </CardTitle>
          <CardDescription>
            Utilisez vos agents IA pour rechercher et enrichir des prospects via Google Search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agent Selection */}
          <div className="space-y-2">
            <Label>Sélectionner un agent IA</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Card
                  key={agent.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedAgent === agent.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          <Bot className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{agent.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{agent.specialty}</p>
                      </div>
                      {agent.status === "active" && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Search Configuration */}
          <Tabs value={searchType} onValueChange={setSearchType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="prospects">Prospects</TabsTrigger>
              <TabsTrigger value="companies">Entreprises</TabsTrigger>
              <TabsTrigger value="market">Marché</TabsTrigger>
            </TabsList>

            <TabsContent value="prospects" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Poste recherché</Label>
                  <Input
                    placeholder="ex: Directeur Marketing, CEO, VP Sales"
                    value={searchCriteria.jobTitle}
                    onChange={(e) => setSearchCriteria({ ...searchCriteria, jobTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secteur d'activité</Label>
                  <Input
                    placeholder="ex: SaaS, E-commerce, FinTech"
                    value={searchCriteria.industry}
                    onChange={(e) => setSearchCriteria({ ...searchCriteria, industry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Localisation</Label>
                  <Input
                    placeholder="ex: Paris, France, Europe"
                    value={searchCriteria.location}
                    onChange={(e) => setSearchCriteria({ ...searchCriteria, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taille d'entreprise</Label>
                  <Select
                    value={searchCriteria.companySize}
                    onValueChange={(value) => setSearchCriteria({ ...searchCriteria, companySize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-50)</SelectItem>
                      <SelectItem value="sme">PME (51-250)</SelectItem>
                      <SelectItem value="enterprise">Grande entreprise (250+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mots-clés supplémentaires</Label>
                <Textarea
                  placeholder="Ajoutez des mots-clés spécifiques pour affiner la recherche..."
                  value={searchCriteria.keywords}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, keywords: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="companies" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Recherche d'entreprises avec critères avancés</p>
              </div>
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Analyse de marché et tendances</p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Search Input */}
          <div className="space-y-2">
            <Label>Requête de recherche</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Décrivez ce que vous recherchez..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || !selectedAgent || isSearching}
                className="animate-pulse-glow"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isSearching ? "Recherche..." : "Rechercher"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Résultats de recherche ({results.length})</span>
              <Badge variant="outline" className="bg-primary/10">
                <Zap className="w-3 h-3 mr-1" />
                Enrichi par IA
              </Badge>
            </CardTitle>
            <CardDescription>Prospects trouvés et enrichis par votre agent IA via Serper</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="border-border/30 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{result.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{result.snippet}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {result.source}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getRelevanceColor(result.relevanceScore)}`}>
                          {result.relevanceScore}% pertinent
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Target className="w-4 h-4 mr-1" />
                        Ajouter
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Globe className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Enriched Data */}
                  {result.enrichedData && (
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Données enrichies</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {result.enrichedData.company && (
                          <div>
                            <span className="text-muted-foreground">Entreprise:</span>
                            <p className="font-medium">{result.enrichedData.company}</p>
                          </div>
                        )}
                        {result.enrichedData.position && (
                          <div>
                            <span className="text-muted-foreground">Poste:</span>
                            <p className="font-medium">{result.enrichedData.position}</p>
                          </div>
                        )}
                        {result.enrichedData.email && (
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <p className="font-medium text-primary">{result.enrichedData.email}</p>
                          </div>
                        )}
                        {result.enrichedData.phone && (
                          <div>
                            <span className="text-muted-foreground">Téléphone:</span>
                            <p className="font-medium">{result.enrichedData.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isSearching && (
        <Card className="border-border/50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Bot className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Agent IA en action</h3>
                <p className="text-muted-foreground">Recherche et enrichissement des données via Serper...</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyse en cours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
