"use client"

import { useState, useEffect, useCallback } from 'react'
import { wsService } from '@/lib/websocket'
import type { WebSocketMessage } from '@/lib/types'

export interface AgentAction {
  id: string
  agent_name: string
  action: string
  description: string
  result?: string
  status: 'started' | 'in_progress' | 'completed' | 'failed'
  timestamp: string
  campaign_id?: number
  duration_ms?: number
  prospect_data?: {
    company_name: string
    contact_name?: string
    email?: string
    quality_score: number
    sector?: string
    location?: string
  }
}

export interface ProspectNotification {
  id: string
  prospect: {
    company_name: string
    contact_name?: string
    email?: string
    quality_score: number
    sector?: string
    location?: string
  }
  campaign_id: number
  campaign_name: string
  timestamp: string
  agent_name: string
}

// Hook pour les actions des agents en temps réel
export function useAgentActions() {
  const [actions, setActions] = useState<AgentAction[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    console.log('🔄 Setting up agent actions WebSocket listeners...')

    const handleConnection = (message: WebSocketMessage) => {
      console.log('🔗 Connection status:', message.data)
      setIsConnected(message.data.connected)
    }

    const handleAgentAction = (message: WebSocketMessage) => {
      console.log('🤖 Agent action received:', message.data)
      const action: AgentAction = message.data
      setActions(prev => {
        const filtered = prev.filter(a => a.id !== action.id)
        return [action, ...filtered].slice(0, 100)
      })
    }

    const handleAgentActivity = (message: WebSocketMessage) => {
      console.log('📊 Agent activity received:', message.data)
      const activity = message.data
      const action: AgentAction = {
        id: activity.id?.toString() || `${Date.now()}-${Math.random()}`,
        agent_name: activity.agent_name || activity.agent || 'Agent Inconnu',
        action: activity.task_name || activity.task || activity.action || 'Tâche en cours',
        description: activity.message || activity.description || 'Agent en cours de travail...',
        status: activity.status === 'working' || activity.status === 'running' ? 'in_progress' : 
                activity.status === 'completed' || activity.status === 'success' ? 'completed' : 
                activity.status === 'error' || activity.status === 'failed' ? 'failed' : 'started',
        timestamp: activity.started_at || activity.timestamp || new Date().toISOString(),
        campaign_id: activity.campaign_id,
        result: activity.status === 'completed' ? activity.result || 'Tâche terminée avec succès' : 
                activity.status === 'error' ? activity.error_message || activity.error : undefined
      }
      
      setActions(prev => {
        const filtered = prev.filter(a => a.id !== action.id)
        return [action, ...filtered].slice(0, 100)
      })
    }

    // Gestionnaire pour les messages CrewAI spécifiques
    const handleCrewAgentStart = (message: WebSocketMessage) => {
      console.log('🚀 CrewAI agent started:', message.data)
      const data = message.data
      const action: AgentAction = {
        id: `crew-${Date.now()}-${Math.random()}`,
        agent_name: data.agent_name || data.agent || 'CrewAI Agent',
        action: 'Démarrage',
        description: data.message || data.task || 'Agent CrewAI démarré',
        status: 'started',
        timestamp: data.timestamp || new Date().toISOString(),
        campaign_id: data.campaign_id
      }
      
      setActions(prev => [action, ...prev.slice(0, 99)])
    }

    const handleCrewAgentProgress = (message: WebSocketMessage) => {
      console.log('⚡ CrewAI agent progress:', message.data)
      const data = message.data
      const action: AgentAction = {
        id: `crew-progress-${Date.now()}-${Math.random()}`,
        agent_name: data.agent_name || data.agent || 'CrewAI Agent',
        action: data.current_task || data.task || 'En cours',
        description: data.message || data.description || 'Agent CrewAI en cours de travail...',
        status: 'in_progress',
        timestamp: data.timestamp || new Date().toISOString(),
        campaign_id: data.campaign_id
      }
      
      setActions(prev => [action, ...prev.slice(0, 99)])
    }

    const handleCrewAgentComplete = (message: WebSocketMessage) => {
      console.log('✅ CrewAI agent completed:', message.data)
      const data = message.data
      const action: AgentAction = {
        id: `crew-complete-${Date.now()}-${Math.random()}`,
        agent_name: data.agent_name || data.agent || 'CrewAI Agent',
        action: data.task || 'Tâche terminée',
        description: data.message || 'Agent CrewAI a terminé sa tâche',
        status: 'completed',
        timestamp: data.timestamp || new Date().toISOString(),
        campaign_id: data.campaign_id,
        result: data.result || 'Tâche terminée avec succès'
      }
      
      setActions(prev => [action, ...prev.slice(0, 99)])
    }

    // Gestionnaire pour capturer TOUS les messages pour debug
    const handleAllMessages = (message: WebSocketMessage) => {
      // Log tous les messages pour debug
      if (message.type !== 'connection_status') {
        console.log('🔍 WebSocket message received:', {
          type: message.type,
          data: message.data,
          timestamp: message.timestamp
        })

        // Si c'est un message non géré qui contient des infos d'agent
        if (message.data && (message.data.agent_name || message.data.agent || 
            message.type.includes('agent') || message.type.includes('crew'))) {
          const data = message.data
          const action: AgentAction = {
            id: `generic-${Date.now()}-${Math.random()}`,
            agent_name: data.agent_name || data.agent || `Agent-${message.type}`,
            action: data.action || data.task || data.task_name || message.type,
            description: data.message || data.description || `Message de type: ${message.type}`,
            status: data.status === 'completed' || data.status === 'success' ? 'completed' :
                    data.status === 'failed' || data.status === 'error' ? 'failed' :
                    data.status === 'running' || data.status === 'working' ? 'in_progress' : 'started',
            timestamp: data.timestamp || message.timestamp || new Date().toISOString(),
            campaign_id: data.campaign_id
          }
          
          setActions(prev => [action, ...prev.slice(0, 99)])
        }
      }
    }

    // S'abonner aux événements
    const unsubscribeConnection = wsService.subscribe('connection_status', handleConnection)
    const unsubscribeAction = wsService.subscribe('agent_action', handleAgentAction)
    const unsubscribeActivity = wsService.subscribe('agent_activity', handleAgentActivity)
    const unsubscribeCrewStart = wsService.subscribe('crew_agent_start', handleCrewAgentStart)
    const unsubscribeCrewProgress = wsService.subscribe('crew_agent_progress', handleCrewAgentProgress)
    const unsubscribeCrewComplete = wsService.subscribe('crew_agent_complete', handleCrewAgentComplete)
    const unsubscribeAll = wsService.subscribe('*', handleAllMessages)

    // Vérifier l'état de connexion initial
    setIsConnected(wsService.isConnected())

    return () => {
      unsubscribeConnection()
      unsubscribeAction()
      unsubscribeActivity()
      unsubscribeCrewStart()
      unsubscribeCrewProgress()
      unsubscribeCrewComplete()
      unsubscribeAll()
    }
  }, [])

  const clearActions = useCallback(() => {
    setActions([])
  }, [])

  return { 
    actions, 
    isConnected, 
    clearActions,
    actionsCount: actions.length 
  }
}

// Hook pour les notifications de prospects qualifiés
export function useProspectNotifications() {
  const [notifications, setNotifications] = useState<ProspectNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [totalProspects, setTotalProspects] = useState(0)

  useEffect(() => {
    const handleProspectFound = (message: WebSocketMessage) => {
      const notification: ProspectNotification = message.data
      
      setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Garder 50 notifications
      setUnreadCount(prev => prev + 1)
      setTotalProspects(prev => prev + 1)

      // Notification sonore (optionnelle)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Nouveau prospect qualifié!`, {
          body: `${notification.prospect.company_name} trouvé par ${notification.agent_name}`,
          icon: '/favicon.ico'
        })
      }
    }

    const unsubscribe = wsService.subscribe('prospect_found', handleProspectFound)

    // Demander permission pour les notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      unsubscribe()
    }
  }, [])

  const markAsRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return { 
    notifications, 
    unreadCount, 
    totalProspects,
    markAsRead, 
    clearNotifications 
  }
}

// Hook pour les mises à jour de campagne
export function useCampaignUpdates() {
  const [updates, setUpdates] = useState<any[]>([])
  const [stats, setStats] = useState({
    running: 0,
    completed: 0,
    failed: 0,
    total: 0
  })

  useEffect(() => {
    const handleCampaignUpdate = (message: WebSocketMessage) => {
      const update = message.data
      setUpdates(prev => [update, ...prev.slice(0, 19)]) // Garder 20 mises à jour
      
      // Mettre à jour les stats
      if (update.status) {
        setStats(prev => ({
          ...prev,
          [update.status]: (prev[update.status as keyof typeof prev] || 0) + 1,
          total: prev.total + 1
        }))
      }
    }

    const unsubscribe = wsService.subscribe('campaign_update', handleCampaignUpdate)

    return () => {
      unsubscribe()
    }
  }, [])

  return { updates, stats }
}

// Hook pour gérer la connexion WebSocket
export function useWebSocketConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

  useEffect(() => {
    const handleConnection = (message: WebSocketMessage) => {
      setIsConnected(message.data.connected)
    }

    const handleAnyMessage = (message: WebSocketMessage) => {
      setLastMessage(message)
    }

    const unsubscribeConnection = wsService.subscribe('connection_status', handleConnection)
    const unsubscribeAll = wsService.subscribe('*', handleAnyMessage)

    // Vérifier l'état initial
    setIsConnected(wsService.isConnected())

    return () => {
      unsubscribeConnection()
      unsubscribeAll()
    }
  }, [])

  const reconnect = useCallback(() => {
    wsService.connect()
  }, [])

  const disconnect = useCallback(() => {
    wsService.disconnect()
  }, [])

  return { 
    isConnected, 
    lastMessage, 
    reconnect, 
    disconnect 
  }
}