"use client"

import { useMemo, useState } from "react"
import { useRealTimeData } from "@/hooks/use-real-time-data"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Pause, Play, Calendar, Target, Download } from "lucide-react"
import Link from "next/link"
import { CreateCampaignDialog } from "@/components/app/create-campaign-dialog"

const statusLabels: Record<string, string> = {
  pending: "En attente",
  running: "En cours",
  completed: "Terminé",
  failed: "Échec",
  cancelled: "Annulée",
}

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { campaigns, loading, error, startCampaign, stopCampaign, refreshData } = useRealTimeData()

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [campaigns, searchTerm, statusFilter])

  const handleStart = async (id: number) => {
    try {
      await startCampaign(id)
      toast.success("Campagne démarrée")
      refreshData()
    } catch {
      toast.error("Impossible de démarrer la campagne")
    }
  }

  const handleStop = async (id: number) => {
    try {
      await stopCampaign(id)
      toast.success("Campagne arrêtée")
      refreshData()
    } catch {
      toast.error("Impossible d'arrêter la campagne")
    }
  }

  const exportCsv = (id: number) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/prospecting/campaigns/${id}/export?format=csv`
    window.open(url, "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-primary">Campagnes</h1>
          <p className="text-muted-foreground">Gérez et suivez vos campagnes de prospection IA</p>
        </div>
        <Button className="bg-primary" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nouvelle campagne
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher une campagne..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="running">En cours</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="failed">Échec</SelectItem>
            <SelectItem value="cancelled">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <Card><CardContent className="p-6">Chargement des campagnes…</CardContent></Card>
      )}
      {error && (
        <Card><CardContent className="p-6 text-red-600">{error}</CardContent></Card>
      )}

      <div className="grid gap-4">
        {filtered.map((c) => (
          <Card key={c.id} className="hover:shadow-sm transition">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4" />
                  <CardTitle className="font-serif">{c.name}</CardTitle>
                  <Badge variant="outline">{statusLabels[c.status] || c.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => exportCsv(c.id)}>
                    <Download className="h-4 w-4 mr-1" /> Exporter
                  </Button>
                  {c.status === "running" ? (
                    <Button size="sm" variant="outline" onClick={() => handleStop(c.id)}>
                      <Pause className="h-4 w-4 mr-1" /> Arrêter
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleStart(c.id)}>
                      <Play className="h-4 w-4 mr-1" /> Démarrer
                    </Button>
                  )}
                  <Link href={`/app/campaigns/${c.id}`}>
                    <Button size="sm" variant="ghost">Voir</Button>
                  </Link>
                </div>
              </div>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> Créée le {new Date(c.created_at).toLocaleDateString("fr-FR")}
                </span>
                {c.started_at && (
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" /> Démarrée le {new Date(c.started_at).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Prospects ciblés: <span className="font-medium">{c.prospect_count}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <div className="mb-4">Aucune campagne trouvée.</div>
            <Button className="bg-primary" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Créer une campagne
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateCampaignDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCampaignCreated={refreshData}
      />
    </div>
  )
}
