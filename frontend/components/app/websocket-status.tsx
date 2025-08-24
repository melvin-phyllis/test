"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"
import { wsManager } from "@/lib/websocket-manager"

interface ConnectionStatus {
  connected: boolean
  error?: boolean
  fallbackMode?: boolean
}

export function WebSocketStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let hideTimer: NodeJS.Timeout

    const handleStatusChange = (newStatus: ConnectionStatus) => {
      setStatus(newStatus)
      setIsVisible(true)

      // Hide the status after 3 seconds if connected, keep visible if not
      clearTimeout(hideTimer)
      if (newStatus.connected) {
        hideTimer = setTimeout(() => setIsVisible(false), 3000)
      }
    }

    const unsubscribe = wsManager.subscribe('connection_status', handleStatusChange)

    // Show initial status
    const initialStatus = {
      connected: wsManager.isConnected(),
      fallbackMode: !wsManager.isConnected()
    }
    handleStatusChange(initialStatus)

    return () => {
      unsubscribe()
      clearTimeout(hideTimer)
    }
  }, [])

  if (!isVisible && status.connected) {
    return null
  }

  const getStatusProps = () => {
    if (status.connected) {
      return {
        variant: "default" as const,
        icon: Wifi,
        text: "WebSocket connecté",
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      }
    }
    
    if (status.fallbackMode) {
      return {
        variant: "secondary" as const,
        icon: AlertCircle,
        text: "Mode hors ligne",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      }
    }

    return {
      variant: "destructive" as const,
      icon: WifiOff,
      text: "WebSocket déconnecté",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    }
  }

  const { variant, icon: Icon, text, className } = getStatusProps()

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in-0 duration-300">
      <Badge variant={variant} className={`${className} flex items-center gap-1.5 px-3 py-1.5`}>
        <Icon className="w-3 h-3" />
        <span className="text-xs font-medium">{text}</span>
      </Badge>
    </div>
  )
}