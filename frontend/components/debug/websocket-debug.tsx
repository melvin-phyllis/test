"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { wsService } from "@/lib/websocket"
import type { WebSocketMessage } from "@/lib/types"
import { Wifi, WifiOff, Play, Pause, Trash2, Bug } from "lucide-react"
import { cn } from "@/lib/utils"

export function WebSocketDebug() {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Array<WebSocketMessage & { id: string }>>([])
  const [stats, setStats] = useState({
    total: 0,
    connectionEvents: 0,
    agentEvents: 0,
    errors: 0
  })

  useEffect(() => {
    console.log('🔧 WebSocket Debug component mounted')

    const handleAllMessages = (message: WebSocketMessage) => {
      const messageWithId = {
        ...message,
        id: `${Date.now()}-${Math.random()}`
      }
      
      setMessages(prev => [messageWithId, ...prev.slice(0, 99)]) // Garder 100 messages
      
      setStats(prev => ({
        total: prev.total + 1,
        connectionEvents: prev.connectionEvents + (message.type === 'connection_status' ? 1 : 0),
        agentEvents: prev.agentEvents + (
          message.type.includes('agent') || message.type.includes('crew') ? 1 : 0
        ),
        errors: prev.errors + (message.type === 'error' ? 1 : 0)
      }))
    }

    const handleConnection = (message: WebSocketMessage) => {
      setIsConnected(message.data.connected)
    }

    // S'abonner à tous les messages
    const unsubscribeAll = wsService.subscribe('*', handleAllMessages)
    const unsubscribeConnection = wsService.subscribe('connection_status', handleConnection)

    // État initial
    setIsConnected(wsService.isConnected())

    return () => {
      unsubscribeAll()
      unsubscribeConnection()
    }
  }, [])

  const clearMessages = () => {
    setMessages([])
    setStats({ total: 0, connectionEvents: 0, agentEvents: 0, errors: 0 })
  }

  const reconnect = () => {
    wsService.connect()
  }

  const disconnect = () => {
    wsService.disconnect()
  }

  const sendTestMessage = () => {
    wsService.sendMessage('test', { message: 'Test depuis le frontend', timestamp: new Date().toISOString() })
  }

  const sendPing = () => {
    wsService.ping()
  }

  const getMessageTypeColor = (type: string) => {
    if (type === 'connection_status') return 'bg-blue-100 text-blue-700'
    if (type === 'error') return 'bg-red-100 text-red-700'
    if (type.includes('agent') || type.includes('crew')) return 'bg-green-100 text-green-700'
    if (type === 'prospect_found') return 'bg-purple-100 text-purple-700'
    if (type === 'ping' || type === 'pong') return 'bg-gray-100 text-gray-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bug className="h-5 w-5" />
          <span>WebSocket Debug Console</span>
          <div className={cn(
            "flex items-center space-x-2 px-2 py-1 rounded-full text-sm",
            isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span>{isConnected ? 'Connecté' : 'Déconnecté'}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contrôles */}
        <div className="flex flex-wrap gap-2">
          {isConnected ? (
            <Button variant="outline" size="sm" onClick={disconnect}>
              <Pause className="h-4 w-4 mr-2" />
              Déconnecter
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={reconnect}>
              <Play className="h-4 w-4 mr-2" />
              Reconnecter
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={sendTestMessage} disabled={!isConnected}>
            📤 Test Message
          </Button>
          
          <Button variant="outline" size="sm" onClick={sendPing} disabled={!isConnected}>
            🏓 Ping
          </Button>
          
          <Button variant="outline" size="sm" onClick={clearMessages}>
            <Trash2 className="h-4 w-4 mr-2" />
            Effacer
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
            <div className="text-xs text-gray-500">Total Messages</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.connectionEvents}</div>
            <div className="text-xs text-blue-500">Connexion</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.agentEvents}</div>
            <div className="text-xs text-green-500">Agents</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            <div className="text-xs text-red-500">Erreurs</div>
          </div>
        </div>

        <Separator />

        {/* Messages */}
        <div>
          <h4 className="font-semibold mb-2">Messages reçus ({messages.length})</h4>
          <ScrollArea className="h-96 border rounded-lg p-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Bug className="h-8 w-8 mx-auto mb-2" />
                <p>Aucun message reçu</p>
                <p className="text-xs">Les messages WebSocket apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="p-3 border rounded-lg bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getMessageTypeColor(message.type)}>
                        {message.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                      {JSON.stringify(message.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* URL de connexion */}
        <div className="text-xs text-gray-500">
          <strong>WebSocket URL:</strong> {process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'}
        </div>
      </CardContent>
    </Card>
  )
}