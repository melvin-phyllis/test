import { WebSocketMessage } from '@/types'
import { useAppStore } from '@/store'

class WebSocketService {
  private ws: WebSocket | null = null
  private subscribers: Map<string, Set<(message: WebSocketMessage) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return

    try {
      this.ws = new WebSocket('ws://localhost:8000/ws')
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        useAppStore.getState().setWebSocketConnected(true)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        useAppStore.getState().setWebSocketConnected(false)
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.notifySubscribers(message.type, message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      useAppStore.getState().setWebSocketConnected(false)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect()
      }, 3000)
    }
  }

  subscribeToCampaign(campaignId: number) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect()
    }

    // Send subscription message
    this.sendMessage('subscribe', { campaign_id: campaignId })
  }

  unsubscribeFromCampaign(campaignId: number) {
    this.sendMessage('unsubscribe', { campaign_id: campaignId })
  }

  subscribe(eventType: string, callback: (message: WebSocketMessage) => void) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set())
    }
    this.subscribers.get(eventType)!.add(callback)

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(eventType)
      if (subscribers) {
        subscribers.delete(callback)
        if (subscribers.size === 0) {
          this.subscribers.delete(eventType)
        }
      }
    }
  }

  private notifySubscribers(eventType: string, message: WebSocketMessage) {
    const subscribers = this.subscribers.get(eventType)
    if (subscribers) {
      subscribers.forEach(callback => callback(message))
    }
    
    // Also notify global subscribers
    const globalSubscribers = this.subscribers.get('*')
    if (globalSubscribers) {
      globalSubscribers.forEach(callback => callback(message))
    }
  }

  sendMessage(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
    }
  }

  ping() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping' }))
    }
  }
}

export const wsService = new WebSocketService()
export default wsService