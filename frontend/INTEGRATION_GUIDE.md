# 🔗 Guide d'Intégration Frontend ↔ Backend

## 🎯 Objectif

Ce guide détaille comment connecter le frontend Next.js existant avec un backend FastAPI utilisant CrewAI pour la prospection automatisée.

## 🏗️ Architecture de Communication

### 1. Communication HTTP (REST API)

#### Configuration du Client API
\`\`\`typescript
// lib/api-client.ts
class ApiClient {
  private baseURL: string
  private token?: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  // Méthodes spécifiques
  async getProspects(filters?: ProspectFilters): Promise<Prospect[]>
  async createCampaign(campaign: CreateCampaignRequest): Promise<Campaign>
  async startAgent(agentId: string): Promise<void>
}
\`\`\`

### 2. Communication WebSocket (Temps Réel)

#### Gestionnaire WebSocket Frontend
\`\`\`typescript
// lib/websocket-manager.ts
class WebSocketManager {
  private ws?: WebSocket
  private listeners: Map<string, Function[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url)
      
      this.ws.onopen = () => {
        console.log('[v0] WebSocket connected')
        this.reconnectAttempts = 0
        resolve()
      }

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      }

      this.ws.onclose = () => {
        console.log('[v0] WebSocket disconnected')
        this.attemptReconnect(url)
      }

      this.ws.onerror = (error) => {
        console.error('[v0] WebSocket error:', error)
        reject(error)
      }
    })
  }

  subscribe(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  send(event: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: event, payload: data }))
    }
  }

  private handleMessage(data: { type: string; payload: any }): void {
    const callbacks = this.listeners.get(data.type) || []
    callbacks.forEach(callback => callback(data.payload))
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => this.connect(url), 2000 * this.reconnectAttempts)
    }
  }
}
\`\`\`

## 🔄 Flux de Données Détaillés

### 1. Démarrage d'une Campagne

#### Frontend
\`\`\`typescript
// components/app/campaign-monitor.tsx
const startCampaign = async (campaignId: string) => {
  try {
    // 1. Appel API REST pour démarrer
    await apiClient.startCampaign(campaignId)
    
    // 2. Écouter les événements WebSocket
    wsManager.subscribe('CAMPAIGN_STARTED', (data) => {
      setCampaignStatus(data.campaignId, 'active')
      showNotification('Campagne démarrée avec succès')
    })
    
    wsManager.subscribe('AGENT_ACTIVITY', (data) => {
      updateAgentActivity(data.agentId, data.activity)
    })
    
  } catch (error) {
    showError('Erreur lors du démarrage de la campagne')
  }
}
\`\`\`

#### Backend (à implémenter)
\`\`\`python
# api/campaigns.py
@router.post("/campaigns/{campaign_id}/start")
async def start_campaign(campaign_id: str, websocket_manager: WebSocketManager):
    # 1. Valider la campagne
    campaign = await get_campaign(campaign_id)
    
    # 2. Configurer les agents CrewAI
    agents = await setup_crewai_agents(campaign.targeting)
    
    # 3. Démarrer les agents
    for agent in agents:
        await agent.start()
    
    # 4. Notifier via WebSocket
    await websocket_manager.broadcast({
        "type": "CAMPAIGN_STARTED",
        "payload": {"campaignId": campaign_id, "agents": agents}
    })
    
    return {"status": "started", "agents_count": len(agents)}
\`\`\`

### 2. Découverte de Prospects

#### Backend CrewAI → Frontend
\`\`\`python
# services/crewai_service.py
class ProspectingAgent:
    async def on_prospect_found(self, prospect_data: dict):
        # 1. Sauvegarder en base
        prospect = await create_prospect(prospect_data)
        
        # 2. Calculer le score de qualification
        score = await calculate_prospect_score(prospect)
        
        # 3. Notifier le frontend
        await websocket_manager.broadcast({
            "type": "PROSPECT_FOUND",
            "payload": {
                "prospect": prospect.dict(),
                "score": score,
                "campaignId": self.campaign_id
            }
        })
\`\`\`

#### Frontend Reception
\`\`\`typescript
// components/app/real-time-crewai-dashboard.tsx
useEffect(() => {
  wsManager.subscribe('PROSPECT_FOUND', (data) => {
    // 1. Ajouter à la liste des prospects
    setProspects(prev => [data.prospect, ...prev])
    
    // 2. Mettre à jour les métriques
    updateMetrics(data.campaignId, { prospectsFound: +1 })
    
    // 3. Afficher notification si score élevé
    if (data.score > 80) {
      showNotification(`Prospect qualifié trouvé: ${data.prospect.name}`, 'success')
    }
    
    // 4. Jouer un son de notification
    playNotificationSound()
  })
}, [])
\`\`\`

## 🔧 Configuration des Composants

### 1. Dashboard Temps Réel

\`\`\`typescript
// app/app/dashboard/page.tsx
export default function Dashboard() {
  const [wsManager] = useState(() => new WebSocketManager())
  const [apiClient] = useState(() => new ApiClient(process.env.NEXT_PUBLIC_API_URL!))
  
  useEffect(() => {
    // Connexion WebSocket au montage
    wsManager.connect(process.env.NEXT_PUBLIC_WS_URL!)
    
    return () => wsManager.disconnect()
  }, [])

  return (
    <div className="space-y-6">
      <RealTimeCrewAIDashboard 
        wsManager={wsManager}
        apiClient={apiClient}
      />
      <CampaignMonitor 
        wsManager={wsManager}
        apiClient={apiClient}
      />
    </div>
  )
}
\`\`\`

### 2. Gestion des États

\`\`\`typescript
// hooks/use-real-time-data.ts
export function useRealTimeData() {
  const [agents, setAgents] = useState<CrewAIAgent[]>([])
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  
  const wsManager = useWebSocket()
  
  useEffect(() => {
    // Écouter les événements temps réel
    wsManager.subscribe('AGENT_ACTIVITY', (data) => {
      setAgents(prev => prev.map(agent => 
        agent.id === data.agentId 
          ? { ...agent, currentTask: data.activity, status: data.status }
          : agent
      ))
    })
    
    wsManager.subscribe('PROSPECT_FOUND', (data) => {
      setProspects(prev => [data.prospect, ...prev])
    })
    
    wsManager.subscribe('CAMPAIGN_METRICS_UPDATE', (data) => {
      setCampaigns(prev => prev.map(campaign =>
        campaign.id === data.campaignId
          ? { ...campaign, metrics: data.metrics }
          : campaign
      ))
    })
  }, [wsManager])
  
  return { agents, prospects, campaigns }
}
\`\`\`

## 🚨 Gestion des Erreurs

### Frontend
\`\`\`typescript
// lib/error-handler.ts
export class ErrorHandler {
  static handleApiError(error: Error): void {
    console.error('[v0] API Error:', error)
    
    if (error.message.includes('401')) {
      // Rediriger vers login
      window.location.href = '/auth/login'
    } else if (error.message.includes('500')) {
      // Erreur serveur
      showNotification('Erreur serveur, veuillez réessayer', 'error')
    } else {
      // Erreur générique
      showNotification('Une erreur est survenue', 'error')
    }
  }
  
  static handleWebSocketError(error: Event): void {
    console.error('[v0] WebSocket Error:', error)
    showNotification('Connexion temps réel interrompue', 'warning')
  }
}
\`\`\`

## 📊 Monitoring et Debug

### Logs Frontend
\`\`\`typescript
// lib/logger.ts
export class Logger {
  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[v0] ${message}`, data)
    }
  }
  
  static error(message: string, error?: Error): void {
    console.error(`[v0] ERROR: ${message}`, error)
    // Envoyer à un service de monitoring en production
  }
  
  static wsEvent(event: string, data: any): void {
    this.debug(`WebSocket Event: ${event}`, data)
  }
}
\`\`\`

## 🔐 Sécurité

### Authentification JWT
\`\`\`typescript
// lib/auth.ts
export class AuthManager {
  private token?: string
  
  async login(credentials: LoginCredentials): Promise<void> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    
    const data = await response.json()
    this.token = data.token
    localStorage.setItem('auth_token', this.token)
  }
  
  getToken(): string | undefined {
    return this.token || localStorage.getItem('auth_token') || undefined
  }
  
  logout(): void {
    this.token = undefined
    localStorage.removeItem('auth_token')
    window.location.href = '/auth/login'
  }
}
\`\`\`

## 🚀 Checklist d'Intégration

### Phase 1: Configuration de Base
- [ ] Configurer les variables d'environnement
- [ ] Implémenter ApiClient avec gestion d'erreurs
- [ ] Créer WebSocketManager avec reconnexion
- [ ] Tester la connexion frontend ↔ backend

### Phase 2: Intégration CrewAI
- [ ] Connecter les agents CrewAI aux événements WebSocket
- [ ] Implémenter les handlers d'événements temps réel
- [ ] Tester le flux de découverte de prospects
- [ ] Valider les notifications en temps réel

### Phase 3: Fonctionnalités Avancées
- [ ] Implémenter l'authentification JWT
- [ ] Ajouter la gestion des erreurs robuste
- [ ] Configurer le monitoring et les logs
- [ ] Optimiser les performances temps réel

### Phase 4: Tests et Déploiement
- [ ] Tests d'intégration frontend/backend
- [ ] Tests de charge WebSocket
- [ ] Configuration de production
- [ ] Monitoring en temps réel

---

*Ce guide fournit tous les éléments nécessaires pour une intégration réussie entre le frontend Next.js et le backend FastAPI avec CrewAI.*
