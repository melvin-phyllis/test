"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Bot, Search, Globe, PenTool, Loader2 } from "lucide-react"
import { useWebSocket } from "./websocket-provider"
import { useAgentStatuses, useAppStore } from "@/lib/store"
import { agentApi } from "@/lib/api"
import type { AgentStatus } from "@/lib/types"

interface AgentDisplay extends AgentStatus {
  icon: React.ComponentType<{ className?: string }>
  displayName: string
}

const AGENT_CONFIG = {
  'Global Market Researcher': { icon: Search, displayName: 'Market Researcher' },
  'International Prospecting Specialist': { icon: Globe, displayName: 'Prospecting Specialist' },
  'Global Content Writer': { icon: PenTool, displayName: 'Content Writer' },
}

export function RealTimeAgentsPanel() {
  const { lastMessage } = useWebSocket()
  const agentStatuses = useAgentStatuses()
  const { setAgentStatuses, updateAgentStatus, setLoading, setError } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)

  // Load agent data
  useEffect(() => {
    const loadAgents = async () => {
      setIsLoading(true)
      try {
        const agentsData = await agentApi.getAgentStatus()
        setAgentStatuses(agentsData)
      } catch (error) {
        console.error('Failed to load agents:', error)
        setError(error instanceof Error ? error.message : 'Failed to load agents')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAgents()
    
    // Refresh every 10 seconds
    const interval = setInterval(loadAgents, 10000)
    return () => clearInterval(interval)
  }, [setAgentStatuses, setError])

  // Prepare display agents
  const displayAgents: AgentDisplay[] = agentStatuses.map(agent => {
    const config = AGENT_CONFIG[agent.agent_name as keyof typeof AGENT_CONFIG] || 
                   { icon: Bot, displayName: agent.agent_name }
    
    return {
      ...agent,
      icon: config.icon,
      displayName: config.displayName,
    }
  })

  // Handle real-time updates
  useEffect(() => {
    if (!lastMessage) return

    if (lastMessage.type === "agent_status" || lastMessage.type === "agent_activity") {
      const agentData = lastMessage.data
      if (agentData.agent_name) {
        updateAgentStatus(agentData.agent_name, {
          status: agentData.status,
          progress: agentData.progress || 0,
          current_task: agentData.message || agentData.current_task,
          last_activity: new Date().toISOString(),
        })
      }
    }
  }, [lastMessage, updateAgentStatus])

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

  if (isLoading) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>AI Agents</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3 p-4 border border-border rounded-lg animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded"></div>
              <div className="h-3 w-48 bg-gray-200 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span>AI Agents</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayAgents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bot className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No agents connected</p>
          </div>
        ) : (
          displayAgents.map((agent) => (
            <div key={agent.agent_name} className="space-y-3 p-4 border border-border rounded-lg">
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
                      <h4 className="font-medium text-sm">{agent.displayName}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {agent.current_task || 'No active task'}
                    </p>
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
          ))
        )}
      </CardContent>
    </Card>
  )
}
