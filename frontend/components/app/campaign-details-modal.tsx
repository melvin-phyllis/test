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

interface Campaign {
  id: string
  name: string
  flag: string
  status: string
  progress: number
  prospects: number
}

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

export function CampaignDetailsModal({ campaign, isOpen, onClose }: CampaignDetailsModalProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (campaign && isOpen) {
      // Simulation des résultats de recherche SERPER
      setSearchResults([
        {
          title: "Top Tech Companies in Germany - Market Analysis",
          link: "https://example.com/tech-germany",
          snippet:
            "Comprehensive analysis of leading technology companies in Germany, including startups and established enterprises in the SaaS sector.",
          timestamp: "Il y a 15 min",
        },
        {
          title: "German SaaS Market Report 2025",
          link: "https://example.com/saas-report",
          snippet:
            "Latest trends and opportunities in the German Software-as-a-Service market, featuring key players and growth metrics.",
          timestamp: "Il y a 32 min",
        },
        {
          title: "Berlin Tech Hub - Company Directory",
          link: "https://example.com/berlin-tech",
          snippet:
            "Directory of technology companies based in Berlin, with contact information and company profiles for prospecting.",
          timestamp: "Il y a 1h",
        },
      ])

      // Simulation des logs d'interactions
      setLogs([
        {
          id: "1",
          timestamp: "2025-08-22 13:45:23",
          type: "search",
          message: "Recherche SERPER initiée pour 'tech companies Germany'",
          details: "Query: tech companies Germany SaaS | Results: 847 found",
          status: "success",
        },
        {
          id: "2",
          timestamp: "2025-08-22 13:42:15",
          type: "prospect",
          message: "Nouveau prospect identifié: TechCorp GmbH",
          details: "Email: contact@techcorp.de | Secteur: SaaS | Employés: 150",
          status: "success",
        },
        {
          id: "3",
          timestamp: "2025-08-22 13:38:07",
          type: "interaction",
          message: "Email envoyé à prospect #1247",
          details: "Template: Introduction SaaS | Status: Delivered",
          status: "info",
        },
        {
          id: "4",
          timestamp: "2025-08-22 13:35:42",
          type: "system",
          message: "Agent IA redémarré après mise à jour",
          details: "Version: 2.1.3 | Performance: +15%",
          status: "info",
        },
        {
          id: "5",
          timestamp: "2025-08-22 13:30:18",
          type: "search",
          message: "Recherche LinkedIn effectuée",
          details: "Profils analysés: 234 | Prospects qualifiés: 67",
          status: "success",
        },
        {
          id: "6",
          timestamp: "2025-08-22 13:25:33",
          type: "prospect",
          message: "Prospect non qualifié: StartupXYZ",
          details: "Raison: Taille d'entreprise < 50 employés",
          status: "warning",
        },
      ])
    }
  }, [campaign, isOpen])

  const performSearch = async () => {
    setIsSearching(true)
    // Simulation d'appel SERPER API
    setTimeout(() => {
      const newResult = {
        title: "Nouvelle recherche - German Tech Prospects",
        link: "https://example.com/new-search",
        snippet: "Résultats de recherche en temps réel pour les prospects technologiques allemands.",
        timestamp: "À l'instant",
      }
      setSearchResults((prev) => [newResult, ...prev])

      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString("fr-FR"),
        type: "search",
        message: "Nouvelle recherche SERPER effectuée",
        details: "Query: German tech prospects | Results: 156 nouveaux",
        status: "success",
      }
      setLogs((prev) => [newLog, ...prev])
      setIsSearching(false)
    }, 2000)
  }

  if (!campaign) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-blue-100 text-blue-700">En cours</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Terminée</Badge>
      case "pending":
        return <Badge className="bg-gray-100 text-gray-700">En attente</Badge>
      default:
        return <Badge>Inconnu</Badge>
    }
  }

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
            <span className="text-2xl">{campaign.flag}</span>
            <span>{campaign.name}</span>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusBadge(campaign.status)}
                <div className="flex items-center space-x-2">
                  <Progress value={campaign.progress} className="w-32" />
                  <span className="text-sm font-medium">{campaign.progress}%</span>
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
                  <div className="text-2xl font-bold">{campaign.prospects}</div>
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
                  <div className="text-2xl font-bold">12.5%</div>
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
                  <div className="text-sm">15 août 2025</div>
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
                  <div className="text-sm">Technology, SaaS</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Résultats de recherche SERPER</h3>
              <Button onClick={performSearch} disabled={isSearching} size="sm">
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? "Recherche..." : "Nouvelle recherche"}
              </Button>
            </div>

            <ScrollArea className="h-96">
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
            </ScrollArea>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <h3 className="text-lg font-semibold">Journal des interactions</h3>
            <ScrollArea className="h-96">
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
            </ScrollArea>
          </TabsContent>

          <TabsContent value="prospects" className="space-y-4">
            <h3 className="text-lg font-semibold">Prospects détaillés</h3>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">TechCorp GmbH #{i}</h4>
                          <p className="text-sm text-muted-foreground">contact@techcorp{i}.de</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs">
                            <span>Secteur: SaaS</span>
                            <span>Employés: {50 + i * 20}</span>
                            <span>Score: {85 + i}%</span>
                          </div>
                        </div>
                        <Badge variant={i % 2 === 0 ? "default" : "secondary"}>
                          {i % 2 === 0 ? "Contacté" : "En attente"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
