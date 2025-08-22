"use client"

import { useState, useEffect } from "react"
import { useHydration } from "@/hooks/use-hydration"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pause, Play } from "lucide-react"

interface ActivityItem {
  id: string
  timestamp: Date
  agent: string
  message: string
  type: "success" | "info" | "warning"
}

const initialActivities: ActivityItem[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    agent: "Market Researcher",
    message: "Identified 5 new prospects in BMW supplier network",
    type: "success",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    agent: "Content Writer",
    message: "Completed emails for 15 French startups",
    type: "success",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    agent: "Prospecting Specialist",
    message: "Verified contact details for Schneider Electric",
    type: "info",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    agent: "Market Researcher",
    message: "Started analysis of German automotive sector",
    type: "info",
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 18 * 60 * 1000),
    agent: "Content Writer",
    message: "Generated personalized outreach templates",
    type: "success",
  },
]

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)
  const [isPaused, setIsPaused] = useState(false)
  const isHydrated = useHydration()

  useEffect(() => {
    if (isPaused || !isHydrated) return

    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        timestamp: new Date(),
        agent: ["Market Researcher", "Content Writer", "Prospecting Specialist"][Math.floor(Math.random() * 3)],
        message: [
          "Found new prospects in technology sector",
          "Completed contact verification batch",
          "Generated personalized content",
          "Analyzed market trends",
          "Updated prospect quality scores",
        ][Math.floor(Math.random() * 5)],
        type: ["success", "info"][Math.floor(Math.random() * 2)] as "success" | "info",
      }

      setActivities((prev) => [newActivity, ...prev.slice(0, 9)])
    }, 8000)

    return () => clearInterval(interval)
  }, [isPaused, isHydrated])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "success":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
            Success
          </Badge>
        )
      case "info":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
            Info
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
            Warning
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Unknown
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live Activity Feed</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center space-x-2"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">{activity.agent}</p>
                  <div className="flex items-center space-x-2">
                    {getTypeBadge(activity.type)}
                    <span className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{activity.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
