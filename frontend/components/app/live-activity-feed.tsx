"use client"

import { useState, useEffect } from "react"
import { Bot, CheckCircle, Users, Target, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Activity {
  id: string
  agentName: string
  agentType: "prospector" | "analyzer" | "researcher" | "qualifier"
  action: string
  status: "in-progress" | "completed" | "error"
  timestamp: Date
  result?: string
  prospectCount?: number
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])

  // Simulate real-time CrewAI activities
  useEffect(() => {
    const interval = setInterval(() => {
      const agentActivities = [
        {
          agentName: "Agent Prospecteur",
          agentType: "prospector" as const,
          action: "Recherche de prospects sur LinkedIn",
          status: "in-progress" as const,
          result: "15 profils analysés",
        },
        {
          agentName: "Agent Analyste",
          agentType: "analyzer" as const,
          action: "Analyse des données de prospection",
          status: "completed" as const,
          result: "Score de qualification: 87%",
          prospectCount: 3,
        },
        {
          agentName: "Agent Chercheur",
          agentType: "researcher" as const,
          action: "Enrichissement des données entreprise",
          status: "in-progress" as const,
          result: "Collecte d'informations financières",
        },
        {
          agentName: "Agent Qualifieur",
          agentType: "qualifier" as const,
          action: "Qualification des prospects",
          status: "completed" as const,
          result: "2 prospects qualifiés ajoutés",
          prospectCount: 2,
        },
      ]

      if (Math.random() > 0.6) {
        // 40% chance every 3 seconds
        const randomActivity = agentActivities[Math.floor(Math.random() * agentActivities.length)]
        const newActivity: Activity = {
          id: Date.now().toString(),
          ...randomActivity,
          timestamp: new Date(),
        }

        setActivities((prev) => [newActivity, ...prev.slice(0, 19)]) // Keep only 20 activities
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getAgentIcon = (type: string) => {
    switch (type) {
      case "prospector":
        return <Search className="w-4 h-4" />
      case "analyzer":
        return <Target className="w-4 h-4" />
      case "researcher":
        return <Users className="w-4 h-4" />
      case "qualifier":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Bot className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-primary" />
          <span>Activité des Agents IA</span>
          <Badge variant="outline" className="ml-auto">
            {activities.filter((a) => a.status === "in-progress").length} actifs
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {activities.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>En attente d'activité des agents...</p>
            </div>
          ) : (
            <div className="space-y-1 p-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">{getAgentIcon(activity.agentType)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.agentName}</p>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`} />
                        <span className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">{activity.action}</p>

                    {activity.result && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground">{activity.result}</p>
                        {activity.prospectCount && (
                          <Badge variant="secondary" className="text-xs">
                            +{activity.prospectCount} prospects
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
