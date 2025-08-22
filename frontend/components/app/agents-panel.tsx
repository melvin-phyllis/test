"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Bot, Search, Globe, PenTool } from "lucide-react"

const agents = [
  {
    id: "researcher",
    name: "Global Market Researcher",
    status: "working",
    progress: 67,
    task: "Analyzing automotive companies in Stuttgart",
    icon: Search,
  },
  {
    id: "prospector",
    name: "International Prospecting Specialist",
    status: "completed",
    progress: 100,
    task: "Verified 89 French fintech contacts",
    icon: Globe,
  },
  {
    id: "writer",
    name: "Global Content Writer",
    status: "idle",
    progress: 0,
    task: "Ready for personalized outreach",
    icon: PenTool,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "working":
      return "bg-blue-500"
    case "completed":
      return "bg-green-500"
    case "idle":
      return "bg-gray-400"
    default:
      return "bg-gray-400"
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "working":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          Working
        </Badge>
      )
    case "completed":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          Completed
        </Badge>
      )
    case "idle":
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
          Idle
        </Badge>
      )
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}

export function AgentsPanel() {
  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span>AI Agents</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.id} className="space-y-3 p-4 border border-border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)} ${
                    agent.status === "working" ? "animate-pulse" : ""
                  }`}
                ></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <agent.icon className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium text-sm">{agent.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{agent.task}</p>
                </div>
              </div>
              {getStatusBadge(agent.status)}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{agent.progress}%</span>
              </div>
              <Progress value={agent.progress} className="h-2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
