"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Download, Plus, MapPin, Building, Mail, Phone, Star, Sparkles, RefreshCw, AlertCircle, Bot } from "lucide-react"
import { ProspectEnrichmentDialog } from "@/components/app/prospect-enrichment-dialog"
import { AddProspectDialog } from "@/components/app/add-prospect-dialog"
import { CrewAIProspectsDisplay } from "@/components/app/crewai-prospects-display"
import { useState, useMemo } from "react"
import { useProspects } from "@/hooks/use-prospects"
import { useHydration } from "@/hooks/use-hydration"
import { toast } from "sonner"

export default function ProspectsPage() {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("crewai")
  
  // Check if component is hydrated
  const isHydrated = useHydration()
  
  // Utiliser le hook pour récupérer les prospects réels
  const { prospects, stats, loading, error, refreshProspects, getStatusLabel, getStatusVariant, getScoreColor } = useProspects()

  const handleEnhancedSearch = async (query: string, industry?: string, location?: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    console.log("[v0] Searching prospects with query:", { query, industry, location })

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate search results
      const simulatedResults = [
        {
          name: "Thomas Dubois",
          company: "StartupTech",
          position: "CEO",
          score: 92,
          snippet: "Entrepreneur expérimenté dans le secteur tech, spécialisé en IA",
        },
        {
          name: "Claire Martin",
          company: "InnovSolutions",
          position: "CTO",
          score: 88,
          snippet: "Expert technique avec 10+ ans d'expérience en développement",
        },
        {
          name: "Marc Laurent",
          company: "TechCorp",
          position: "VP Marketing",
          score: 85,
          snippet: "Responsable marketing digital avec focus sur l'acquisition",
        },
      ]

      console.log("[v0] Search completed successfully")
      setSearchResults(simulatedResults)
      setShowSearchResults(true)
    } catch (error) {
      console.error("[v0] Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddProspect = () => {
    console.log("[v0] Opening add prospect dialog")
    setShowAddDialog(true)
  }

  // Filtrer les prospects en fonction des critères
  const filteredProspects = useMemo(() => {
    if (!isHydrated) return [];
    
    return prospects.filter(prospect => {
      const matchesSearch = !searchTerm || 
        prospect.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prospect.contact_name && prospect.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prospect.email && prospect.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || prospect.status === statusFilter;

      const matchesScore = scoreFilter === "all" ||
        (scoreFilter === "high" && prospect.quality_score >= 90) ||
        (scoreFilter === "medium" && prospect.quality_score >= 75 && prospect.quality_score < 90) ||
        (scoreFilter === "low" && prospect.quality_score < 75);

      return matchesSearch && matchesStatus && matchesScore;
    });
  }, [prospects, searchTerm, statusFilter, scoreFilter, isHydrated]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Prospects</h1>
          <p className="text-muted-foreground">Gérez et suivez vos prospects qualifiés par l'IA</p>
        </div>
        <div className="flex gap-2">
          {/* Refresh button */}
          <Button
            variant="outline"
            onClick={refreshProspects}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Actualisation...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </>
            )}
          </Button>
          {/* Enhanced search button */}
          <Button
            variant="outline"
            onClick={() => handleEnhancedSearch("CEO startup France", "technology", "Paris")}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <Search className="w-4 h-4 mr-2 animate-spin" />
                Recherche IA...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Recherche IA
              </>
            )}
          </Button>
          <Button className="animate-pulse-glow" onClick={handleAddProspect}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un prospect
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Erreur de chargement des prospects: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Prospects</p>
                <p className="text-2xl font-bold">{!isHydrated || loading ? "..." : stats.total.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Qualifiés</p>
                <p className="text-2xl font-bold">{!isHydrated || loading ? "..." : stats.qualified.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contactés</p>
                <p className="text-2xl font-bold">{!isHydrated || loading ? "..." : stats.contacted.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Moyen</p>
                <p className="text-2xl font-bold">{!isHydrated || loading ? "..." : stats.avgScore}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="crewai" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Prospects CrewAI
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Prospects Manuels
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Recherche IA
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Prospects CrewAI */}
        <TabsContent value="crewai" className="space-y-6">
          <CrewAIProspectsDisplay />
        </TabsContent>

        {/* Tab 2: Prospects Manuels */}
        <TabsContent value="manual" className="space-y-6">
          {/* Filters and Search */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Filtres et Recherche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Rechercher par nom, entreprise, email..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="qualified">Qualifié</SelectItem>
                    <SelectItem value="contacted">Contacté</SelectItem>
                    <SelectItem value="interested">Intéressé</SelectItem>
                    <SelectItem value="identified">Identifié</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les scores</SelectItem>
                    <SelectItem value="high">90-100</SelectItem>
                    <SelectItem value="medium">75-89</SelectItem>
                    <SelectItem value="low">0-74</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Prospects Table */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Liste des Prospects Manuels</CardTitle>
              <CardDescription>{filteredProspects.length} prospects trouvés</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prospect</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Score IA</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernier Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProspects.map((prospect) => (
                    <TableRow key={prospect.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {prospect.contact_name
                                ? prospect.contact_name.split(" ").map((n) => n[0]).join("")
                                : prospect.company_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{prospect.contact_name || "Contact à définir"}</div>
                            <div className="text-sm text-muted-foreground">{prospect.contact_position || "Poste à définir"}</div>
                            {prospect.extra_data?.decision_makers && prospect.extra_data.decision_makers.length > 1 && (
                              <div className="text-xs text-accent mt-1">
                                +{prospect.extra_data.decision_makers.length - 1} autres décideurs
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{prospect.company_name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{prospect.description}</div>
                          <div className="text-xs text-muted-foreground">Secteur: {prospect.sector}</div>
                          {prospect.website && (
                            <a 
                              href={prospect.website} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-primary hover:underline"
                            >
                              {prospect.website}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {prospect.email ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="w-3 h-3 text-green-500" />
                              <a href={`mailto:${prospect.email}`} className="text-primary hover:underline">
                                {prospect.email}
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span>Email à trouver</span>
                            </div>
                          )}
                          {prospect.phone ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="w-3 h-3 text-green-500" />
                              <a href={`tel:${prospect.phone}`} className="text-primary hover:underline">
                                {prospect.phone}
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>Téléphone à trouver</span>
                            </div>
                          )}
                          {prospect.extra_data?.linkedin_profiles && (
                            <div className="text-xs">
                              <a 
                                href={prospect.extra_data.linkedin_profiles[0]} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline"
                              >
                                LinkedIn
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{prospect.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Star className={`w-4 h-4 ${getScoreColor(prospect.quality_score)}`} />
                          <span className={`font-medium ${getScoreColor(prospect.quality_score)}`}>{prospect.quality_score}/100</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(prospect.status)}>
                          {getStatusLabel(prospect.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(prospect.updated_at).toLocaleDateString('fr-FR')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Mail className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                          <ProspectEnrichmentDialog
                            prospect={{
                              name: prospect.contact_name || prospect.company_name,
                              company: prospect.company_name,
                              position: prospect.contact_position || "À définir",
                            }}
                            trigger={
                              <Button variant="ghost" size="sm">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Enrichir
                              </Button>
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Recherche IA */}
        <TabsContent value="search" className="space-y-6">
          {/* Search Results Section */}
          {showSearchResults && (
            <Card className="border-accent/20 bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-accent" />
                  Résultats de recherche IA ({searchResults.length})
                </CardTitle>
                <CardDescription>Nouveaux prospects découverts par l'IA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {searchResults.slice(0, 5).map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-semibold">{result.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {result.position} chez {result.company}
                            </p>
                            {result.snippet && <p className="text-xs text-muted-foreground mt-1">{result.snippet}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-accent border-accent">
                          Score: {result.score}
                        </Badge>
                        <ProspectEnrichmentDialog
                          prospect={{
                            name: result.name,
                            company: result.company,
                            position: result.position,
                          }}
                          trigger={
                            <Button variant="outline" size="sm">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Enrichir
                            </Button>
                          }
                        />
                        <Button size="sm">Ajouter</Button>
                      </div>
                    </div>
                  ))}
                </div>
                {searchResults.length > 5 && (
                  <div className="text-center mt-4">
                    <Button variant="outline">Voir tous les résultats ({searchResults.length})</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Search Interface */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Recherche IA Avancée</CardTitle>
              <CardDescription>Utilisez l'intelligence artificielle pour découvrir de nouveaux prospects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Recherche</label>
                    <Input 
                      placeholder="CEO startup France..." 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Secteur</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner un secteur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technologie</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Santé</SelectItem>
                        <SelectItem value="retail">Commerce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Localisation</label>
                    <Input 
                      placeholder="Paris, France..." 
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleEnhancedSearch("CEO startup France", "technology", "Paris")}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <Search className="w-4 h-4 mr-2 animate-spin" />
                      Recherche en cours...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Lancer la recherche IA
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Prospect Dialog */}
      {showAddDialog && <AddProspectDialog onClose={() => setShowAddDialog(false)} />}
    </div>
  )
}
