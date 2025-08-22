"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { wsService } from "@/lib/websocket"
import type { WebSocketMessage } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface WebSocketContextType {
  isConnected: boolean
  lastMessage: WebSocketMessage | null
  sendMessage: (message: any) => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Subscribe to all WebSocket messages
    const unsubscribe = wsService.subscribe('*', (message: WebSocketMessage) => {
      setLastMessage(message)

      // Handle connection status
      if (message.type === 'connection_status') {
        const connected = message.data.connected
        setIsConnected(connected)
        
        if (connected) {
          toast({
            title: "Connected",
            description: "Real-time updates are now active",
            duration: 3000,
          })
        } else {
          toast({
            title: "Connection Lost",
            description: "Attempting to reconnect...",
            variant: "destructive",
            duration: 3000,
          })
        }
      }

      // Handle agent activity
      else if (message.type === 'agent_status' || message.type === 'agent_activity') {
        const data = message.data
        if (data.progress === 100 || data.status === 'completed' || 
            data.message?.includes('completed') || data.message?.includes('verified')) {
          toast({
            title: `${data.agent_name?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Agent'}`,
            description: data.message || `Task ${data.status}`,
            duration: 4000,
          })
        }
      }

      // Handle campaign updates
      else if (message.type === 'campaign_update') {
        const data = message.data
        if (data.status === 'completed') {
          toast({
            title: "Campaign Completed",
            description: `Found ${data.prospects_found || 0} prospects`,
            duration: 5000,
          })
        }
      }

      // Handle prospect updates
      else if (message.type === 'prospect_found') {
        const data = message.data
        toast({
          title: "New Prospect Found",
          description: `${data.company_name} in ${data.location || 'Unknown location'}`,
          duration: 4000,
        })
      }

      // Handle errors
      else if (message.type === 'error') {
        toast({
          title: "Error",
          description: message.data.message || 'An error occurred',
          variant: "destructive",
          duration: 5000,
        })
      }
    })

    // Connect to WebSocket
    wsService.connect().catch(error => {
      console.error('Failed to connect to WebSocket:', error)
      toast({
        title: "Connection Failed",
        description: "Could not connect to real-time updates",
        variant: "destructive",
        duration: 5000,
      })
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
    }
  }, [toast])

  const sendMessage = (message: any) => {
    wsService.sendMessage(message.type, message.data)
  }

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        lastMessage,
        sendMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}