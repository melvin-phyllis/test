"use client"

import { useWebSocket } from "./websocket-provider"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export function ConnectionStatus() {
  const { isConnected } = useWebSocket()

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
      <Badge variant={isConnected ? "secondary" : "destructive"} className="text-xs">
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3 mr-1" />
            Connected
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 mr-1" />
            Disconnected
          </>
        )}
      </Badge>
    </div>
  )
}
