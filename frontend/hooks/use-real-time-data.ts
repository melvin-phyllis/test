/**
 * Hook personnalisé pour les données temps réel
 * Gère les connexions WebSocket et les états de données
 */

import { useState, useEffect, useCallback } from 'react';
import { wsManager } from '@/lib/websocket-manager';
import { apiClient } from '@/lib/api-client';
import { Logger } from '@/lib/logger';
import { ErrorHandler } from '@/lib/error-handler';

interface CrewAIAgent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  currentTask?: string;
  lastActivity?: string;
  campaign_id?: number;
}

interface Prospect {
  id: number;
  campaign_id: number;
  company_name: string;
  website?: string;
  sector?: string;
  location?: string;
  contact_name?: string;
  contact_position?: string;
  email?: string;
  phone?: string;
  quality_score?: number;
  status: string;
  created_at: string;
}

interface Campaign {
  id: number;
  name: string;
  product_description: string;
  status: string;
  prospect_count: number;
  created_at: string;
  metrics?: {
    total_prospects: number;
    qualified_prospects: number;
    contacted_prospects: number;
    responses: number;
  };
}

interface ConnectionStatus {
  connected: boolean;
  reconnectAttempts: number;
  queuedMessages: number;
}

export function useRealTimeData() {
  // États des données
  const [agents, setAgents] = useState<CrewAIAgent[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnectAttempts: 0,
    queuedMessages: 0,
  });

  // États de chargement
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charger les données initiales depuis l'API
   */
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      Logger.debug('Loading initial data', undefined, 'RealTimeData');

      // En mode développement, simuler des données si l'API n'est pas disponible
      if (process.env.NODE_ENV === 'development') {
        try {
          // Tester d'abord la connexion API
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system/health`, { 
            signal: AbortSignal.timeout(5000) 
          });
        } catch (apiError) {
          Logger.warn('API not available, using mock data', apiError, 'RealTimeData');
          
          // Utiliser des données mockées
          setCampaigns([
            {
              id: 1,
              name: "Campagne de démonstration",
              product_description: "Produit de test",
              status: "draft",
              prospect_count: 100,
              created_at: new Date().toISOString(),
            }
          ]);
          
          setProspects([
            {
              id: 1,
              campaign_id: 1,
              company_name: "Entreprise Demo",
              contact_name: "Jean Dupont",
              quality_score: 85,
              status: "new",
              created_at: new Date().toISOString(),
            }
          ]);
          
          setAgents([
            {
              id: "demo-agent",
              name: "Agent Demo",
              role: "Researcher",
              status: "idle" as const,
              currentTask: "En attente",
              lastActivity: new Date().toISOString(),
            }
          ]);
          
          setLoading(false);
          return;
        }
      }

      // Charger depuis l'API réelle
      const [campaignsData, prospectsData, agentStatusData] = await Promise.all([
        apiClient.getCampaigns({ limit: 20 }),
        apiClient.getProspects({ limit: 50 }),
        apiClient.getAgentStatus(),
      ]);

      setCampaigns(campaignsData);
      setProspects(prospectsData);
      
      // Transformer les données d'agent si nécessaire
      if (Array.isArray(agentStatusData)) {
        setAgents(agentStatusData.map((agent: any) => ({
          id: agent.agent_name || agent.id,
          name: agent.agent_name,
          role: agent.agent_role || 'Agent',
          status: agent.status || 'idle',
          currentTask: agent.task_name,
          lastActivity: agent.started_at,
          campaign_id: agent.campaign_id,
        })));
      }

      Logger.info('Initial data loaded successfully', {
        campaigns: campaignsData.length,
        prospects: prospectsData.length,
        agents: Array.isArray(agentStatusData) ? agentStatusData.length : 0,
      }, 'RealTimeData');

    } catch (error) {
      Logger.error('Failed to load initial data', error, 'RealTimeData');
      setError('Backend non disponible - Utilisez les données simulées en attendant');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Connecter le WebSocket et configurer les listeners
   */
  const setupWebSocket = useCallback(() => {
    Logger.debug('Setting up WebSocket connection', undefined, 'RealTimeData');

    // En mode développement, gérer gracieusement les erreurs WebSocket
    const handleWebSocketError = (error: any) => {
      Logger.error('WebSocket connection failed', error, 'RealTimeData');
      if (process.env.NODE_ENV === 'development') {
        console.warn('[useRealTimeData] WebSocket failed in dev mode - continuing without realtime features');
        setConnectionStatus({
          connected: false,
          reconnectAttempts: 0,
          queuedMessages: 0,
        });
      } else {
        ErrorHandler.handleWebSocketError(error, 'connexion temps réel');
      }
    };

    // Connexion WebSocket
    wsManager.connect()
      .then(() => {
        Logger.info('WebSocket connected successfully', undefined, 'RealTimeData');
      })
      .catch(handleWebSocketError);

    // Listener pour le statut de connexion
    const unsubscribeConnection = wsManager.subscribe('connection_status', (data: any) => {
      setConnectionStatus({
        connected: data.connected,
        reconnectAttempts: wsManager.getConnectionStats().reconnectAttempts,
        queuedMessages: wsManager.getConnectionStats().queuedMessages,
      });
    });

    // Listener pour l'activité des agents
    const unsubscribeAgentActivity = wsManager.subscribe('agent_activity', (data: any) => {
      Logger.wsEvent('agent_activity', data);
      
      setAgents(prev => {
        const existingIndex = prev.findIndex(agent => agent.id === data.agentId);
        
        if (existingIndex >= 0) {
          // Mettre à jour l'agent existant
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            status: data.status || 'working',
            currentTask: data.action || data.activity,
            lastActivity: data.timestamp || new Date().toISOString(),
          };
          return updated;
        } else {
          // Ajouter un nouvel agent
          return [...prev, {
            id: data.agentId,
            name: data.agentName || data.agentId,
            role: data.agentRole || 'Agent',
            status: data.status || 'working',
            currentTask: data.action || data.activity,
            lastActivity: data.timestamp || new Date().toISOString(),
            campaign_id: data.campaignId,
          }];
        }
      });
    });

    // Listener pour les nouveaux prospects
    const unsubscribeProspectFound = wsManager.subscribe('prospect_found', (data: any) => {
      Logger.wsEvent('prospect_found', data);
      
      setProspects(prev => {
        // Éviter les doublons
        if (prev.some(p => p.id === data.prospectId || p.id === data.id)) {
          return prev;
        }
        
        const newProspect: Prospect = {
          id: data.prospectId || data.id || Date.now(),
          campaign_id: data.campaignId || 0,
          company_name: data.company || data.name || 'Nouvelle entreprise',
          contact_name: data.contact_name,
          email: data.email,
          quality_score: data.score,
          status: 'new',
          created_at: data.timestamp || new Date().toISOString(),
          ...data,
        };
        
        return [newProspect, ...prev];
      });

      // Afficher notification pour les prospects de haute qualité
      if (data.score && data.score > 80) {
        ErrorHandler.showSuccess(
          'Prospect qualifié trouvé !',
          `${data.company || data.name} - Score: ${data.score}`
        );
      }
    });

    // Listener pour les mises à jour de campagne
    const unsubscribeCampaignUpdate = wsManager.subscribe('campaign_update', (data: any) => {
      Logger.wsEvent('campaign_update', data);
      
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === data.campaignId || campaign.id.toString() === data.campaignId
          ? {
              ...campaign,
              status: data.status || campaign.status,
              metrics: {
                ...campaign.metrics,
                total_prospects: data.prospects_contacted || campaign.metrics?.total_prospects || 0,
                responses: data.responses || campaign.metrics?.responses || 0,
                qualified_prospects: campaign.metrics?.qualified_prospects || 0,
                contacted_prospects: campaign.metrics?.contacted_prospects || 0,
              },
            }
          : campaign
      ));
    });

    // Listener pour les erreurs
    const unsubscribeError = wsManager.subscribe('error', (data: any) => {
      Logger.error('WebSocket error received', data, 'RealTimeData');
      ErrorHandler.showWarning('Erreur temps réel', data.message);
    });

    // Retourner fonction de nettoyage
    return () => {
      unsubscribeConnection();
      unsubscribeAgentActivity();
      unsubscribeProspectFound();
      unsubscribeCampaignUpdate();
      unsubscribeError();
    };
  }, []);

  /**
   * Rafraîchir les données manuellement
   */
  const refreshData = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  /**
   * Démarrer une campagne
   */
  const startCampaign = useCallback(async (campaignId: number) => {
    try {
      Logger.userAction('start_campaign', { campaignId });
      
      await apiClient.startCampaign(campaignId);
      
      // Mettre à jour l'état local
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId
          ? { ...campaign, status: 'running' }
          : campaign
      ));
      
      ErrorHandler.showSuccess('Campagne démarrée', 'La campagne a été lancée avec succès');
      
    } catch (error) {
      Logger.error('Failed to start campaign', error, 'RealTimeData');
      ErrorHandler.handleApiError(error as Error, 'démarrage de campagne');
    }
  }, []);

  /**
   * Arrêter une campagne
   */
  const stopCampaign = useCallback(async (campaignId: number) => {
    try {
      Logger.userAction('stop_campaign', { campaignId });
      
      await apiClient.stopCampaign(campaignId);
      
      // Mettre à jour l'état local
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId
          ? { ...campaign, status: 'paused' }
          : campaign
      ));
      
      ErrorHandler.showSuccess('Campagne arrêtée', 'La campagne a été mise en pause');
      
    } catch (error) {
      Logger.error('Failed to stop campaign', error, 'RealTimeData');
      ErrorHandler.handleApiError(error as Error, 'arrêt de campagne');
    }
  }, []);

  // Initialisation au montage du composant
  useEffect(() => {
    loadInitialData();
    const cleanupWebSocket = setupWebSocket();

    return () => {
      cleanupWebSocket();
      wsManager.disconnect();
    };
  }, [loadInitialData, setupWebSocket]);

  // Mettre à jour le statut de connexion périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = wsManager.getConnectionStats();
      setConnectionStatus(stats);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    // Données
    agents,
    prospects,
    campaigns,
    
    // État
    loading,
    error,
    connectionStatus,
    
    // Actions
    refreshData,
    startCampaign,
    stopCampaign,
    
    // WebSocket
    wsManager,
  };
}

export default useRealTimeData;