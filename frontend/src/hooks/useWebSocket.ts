import { useEffect, useRef } from 'react'
import { wsService } from '@/services/websocket'
import { WebSocketMessage } from '@/types'
import { useAppStore } from '@/store'

export function useWebSocket() {
  const { setWebSocketConnected, setLastMessage } = useAppStore()
  const isConnectedRef = useRef(false)

  useEffect(() => {
    // Connect to WebSocket
    wsService.connect()

    // Subscribe to all messages
    const unsubscribe = wsService.subscribe('*', (message: WebSocketMessage) => {
      setLastMessage(message)
      
      // Update connection status based on message type
      if (message.type === 'pong') {
        if (!isConnectedRef.current) {
          setWebSocketConnected(true)
          isConnectedRef.current = true
        }
      }
    })

    // Ping periodically to check connection
    const pingInterval = setInterval(() => {
      wsService.ping()
    }, 10000) // Ping every 10 seconds

    return () => {
      unsubscribe()
      clearInterval(pingInterval)
      wsService.disconnect()
      setWebSocketConnected(false)
      isConnectedRef.current = false
    }
  }, [setWebSocketConnected, setLastMessage])

  return {
    subscribe: wsService.subscribe.bind(wsService),
    subscribeToCampaign: wsService.subscribeToCampaign.bind(wsService),
    unsubscribeFromCampaign: wsService.unsubscribeFromCampaign.bind(wsService),
    sendMessage: wsService.sendMessage.bind(wsService)
  }
}