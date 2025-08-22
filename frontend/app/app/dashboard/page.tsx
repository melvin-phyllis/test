"use client"

import { useState } from "react"
import { RealtimeDashboard } from "@/components/app/realtime-dashboard"
import { WebSocketDebug } from "@/components/debug/websocket-debug"
import { SimulateCrewAI } from "@/components/debug/simulate-crewai"
import { Button } from "@/components/ui/button"
import { Bug, Eye, Play } from "lucide-react"

export default function DashboardPage() {
  const [showDebug, setShowDebug] = useState(false)
  const [showSimulator, setShowSimulator] = useState(process.env.NEXT_PUBLIC_APP_ENV === 'development')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard CrewAI</h1>
          <p className="text-muted-foreground">Monitoring temps réel des agents IA et prospection</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {process.env.NEXT_PUBLIC_APP_ENV === 'development' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSimulator(!showSimulator)}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>{showSimulator ? 'Masquer' : 'Simulateur'}</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center space-x-2"
          >
            {showDebug ? <Eye className="h-4 w-4" /> : <Bug className="h-4 w-4" />}
            <span>{showDebug ? 'Vue Normal' : 'Debug'}</span>
          </Button>
        </div>
      </div>

      {/* Simulateur en mode développement */}
      {showSimulator && process.env.NEXT_PUBLIC_APP_ENV === 'development' && (
        <SimulateCrewAI />
      )}

      {/* Vue principale ou debug */}
      {showDebug ? (
        <WebSocketDebug />
      ) : (
        <RealtimeDashboard />
      )}
    </div>
  )
}