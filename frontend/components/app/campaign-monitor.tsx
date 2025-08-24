"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, BarChart3, Users, MessageSquare, Target } from "lucide-react"
import { wsManager } from "@/lib/websocket-manager"

interface Campaign {
  id: string
  name: string
  status: "running" | "paused" | "completed" | "draft"
  prospects_total: number
  prospects_contacted: number
  responses: number
  meetings_booked: number
  start_date: string
  agent_assigned: string
}

export function CampaignMonitor() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "campaign_1",
      name: "Prospection Tech Startups",
      status: "running",
      prospects_total: 150,
      prospects_contacted: 87,
      responses: 23,
      meetings_booked: 8,
      start_date: "2024-01-15",
      agent_assigned: "Prospecteur Pro",
    },
    {
      id: "campaign_2",
      name: "Outreach SaaS Companies",
      status: "paused",
      prospects_total: 200,
      prospects_contacted: 45,
      responses: 12,
      meetings_booked: 3,
      start_date: "2024-01-20",
      agent_assigned: "Analyste Expert",
    },
    {
      id: "campaign_3",
      name: "Enterprise Leads",
      status: "running",
      prospects_total: 75,
      prospects_contacted: 32,
      responses: 8,
      meetings_booked: 2,
      start_date: "2024-01-25",
      agent_assigned: "Rédacteur IA",
    },
  ])

  useEffect(() => {
    // Listen for real-time campaign updates
    const handleCampaignUpdate = (data: any) => {
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === data.campaignId
            ? {
                ...campaign,
                status: data.status,
                prospects_contacted: data.prospects_contacted,
                responses: data.responses,
              }
            : campaign,
        ),
      )
    }

    wsManager.on("campaign_update", handleCampaignUpdate)
    wsManager.connect()

    return () => {
      wsManager.off("campaign_update", handleCampaignUpdate)
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500"
      case "paused":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Play className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      case "completed":
        return <Square className="h-4 w-4" />
      default:
        return <Square className="h-4 w-4" />
    }
  }

  const handleCampaignAction = (campaignId: string, action: "play" | "pause" | "stop") => {
    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === campaignId
          ? {
              ...campaign,
              status: action === "play" ? "running" : action === "pause" ? "paused" : "completed",
            }
          : campaign,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Moniteur de Campagnes</h2>
        <Badge variant="outline" className="text-sm">
          {campaigns.filter((c) => c.status === "running").length} campagnes actives
        </Badge>
      </div>

      <div className="grid gap-6">
        {campaigns.map((campaign) => {
          const progress = (campaign.prospects_contacted / campaign.prospects_total) * 100
          const responseRate =
            campaign.prospects_contacted > 0 ? (campaign.responses / campaign.prospects_contacted) * 100 : 0

          return (
            <Card key={campaign.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">{campaign.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className={`${getStatusColor(campaign.status)} text-white border-0`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(campaign.status)}
                          {campaign.status}
                        </div>
                      </Badge>
                      <span>•</span>
                      <span>Agent: {campaign.agent_assigned}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCampaignAction(campaign.id, "play")}
                      disabled={campaign.status === "running"}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCampaignAction(campaign.id, "pause")}
                      disabled={campaign.status === "paused"}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCampaignAction(campaign.id, "stop")}>
                      <Square className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>
                      {campaign.prospects_contacted}/{campaign.prospects_total} prospects
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{campaign.prospects_total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-1">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{campaign.prospects_contacted}</div>
                    <div className="text-xs text-muted-foreground">Contactés</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-1">
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{campaign.responses}</div>
                    <div className="text-xs text-muted-foreground">Réponses</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full mx-auto mb-1">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{campaign.meetings_booked}</div>
                    <div className="text-xs text-muted-foreground">RDV</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <div className="text-sm text-muted-foreground">
                    Taux de réponse: <span className="font-medium text-foreground">{responseRate.toFixed(1)}%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Démarré le {new Date(campaign.start_date).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
