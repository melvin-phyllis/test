# 🤖 Plateforme de Prospection IA avec CrewAI

## 📋 Vue d'ensemble

Cette plateforme de prospection intelligente utilise CrewAI pour automatiser la recherche et la qualification de prospects. Elle combine un frontend Next.js moderne avec un backend FastAPI pour offrir une expérience temps réel de gestion de campagnes de prospection.

## 🏗️ Architecture Générale

\`\`\`
┌─────────────────┐    WebSocket/HTTP    ┌─────────────────┐
│                 │ ◄─────────────────► │                 │
│   Frontend      │                     │   Backend       │
│   (Next.js)     │                     │   (FastAPI)     │
│                 │                     │                 │
└─────────────────┘                     └─────────────────┘
         │                                       │
         │                                       │
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│   Interface     │                     │   CrewAI        │
│   Utilisateur   │                     │   + Serper      │
└─────────────────┘                     └─────────────────┘
\`\`\`

## 🎯 Rôles et Responsabilités

### Frontend (Next.js)
**Responsabilités principales :**
- **Interface utilisateur** : Affichage des dashboards, formulaires, et composants interactifs
- **Gestion d'état** : État local des composants et données temporaires
- **Communication temps réel** : Connexion WebSocket pour les notifications live
- **Authentification** : Gestion des sessions utilisateur et protection des routes
- **Visualisation** : Graphiques, métriques, et tableaux de données

**Composants clés :**
- `RealTimeCrewAIDashboard` : Affichage des activités des agents en temps réel
- `NotificationCenter` : Gestion des alertes et notifications
- `CampaignMonitor` : Suivi des campagnes actives
- `ProspectManagement` : Gestion et enrichissement des prospects

### Backend (FastAPI + CrewAI)
**Responsabilités principales :**
- **Logique métier** : Orchestration des agents CrewAI et traitement des données
- **Base de données** : Stockage et récupération des prospects, campagnes, et résultats
- **API REST** : Endpoints pour CRUD operations et configuration
- **WebSocket** : Diffusion des événements temps réel
- **Intégrations externes** : Serper API, LinkedIn, CRM, etc.
- **Intelligence artificielle** : Agents CrewAI pour prospection automatisée

## 📊 Structure des Données

### Modèles de Données Principaux

#### Prospect
\`\`\`typescript
interface Prospect {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string
  position: string
  industry: string
  location: string
  score: number // Score de qualification (0-100)
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected'
  source: 'manual' | 'ai_search' | 'import'
  enrichedData?: {
    linkedinUrl?: string
    companySize?: string
    revenue?: string
    technologies?: string[]
  }
  createdAt: Date
  updatedAt: Date
}
\`\`\`

#### Campaign
\`\`\`typescript
interface Campaign {
  id: string
  name: string
  description: string
  type: 'email' | 'linkedin' | 'mixed'
  status: 'draft' | 'active' | 'paused' | 'completed'
  targeting: {
    industries: string[]
    positions: string[]
    locations: string[]
    companySize?: string
  }
  agents: AgentConfig[]
  metrics: {
    prospectsFound: number
    contacted: number
    responses: number
    meetings: number
    conversions: number
  }
  createdAt: Date
  startDate?: Date
  endDate?: Date
}
\`\`\`

#### Agent CrewAI
\`\`\`typescript
interface CrewAIAgent {
  id: string
  name: string
  role: 'researcher' | 'qualifier' | 'outreach' | 'analyst'
  status: 'idle' | 'working' | 'paused' | 'error'
  currentTask?: string
  config: {
    aggressiveness: number // 1-10
    language: 'fr' | 'en'
    tone: 'professional' | 'casual' | 'friendly'
    useSerper: boolean
  }
  performance: {
    tasksCompleted: number
    successRate: number
    averageTime: number
  }
}
\`\`\`

## 🔄 Communication Frontend ↔ Backend

### API Endpoints

#### Prospects
\`\`\`
GET    /api/prospects              # Liste des prospects
POST   /api/prospects              # Créer un prospect
PUT    /api/prospects/{id}         # Modifier un prospect
DELETE /api/prospects/{id}         # Supprimer un prospect
POST   /api/prospects/enrich       # Enrichir avec Serper
POST   /api/prospects/search       # Recherche IA
\`\`\`

#### Campaigns
\`\`\`
GET    /api/campaigns              # Liste des campagnes
POST   /api/campaigns              # Créer une campagne
PUT    /api/campaigns/{id}         # Modifier une campagne
POST   /api/campaigns/{id}/start   # Démarrer une campagne
POST   /api/campaigns/{id}/pause   # Mettre en pause
GET    /api/campaigns/{id}/metrics # Métriques détaillées
\`\`\`

#### Agents CrewAI
\`\`\`
GET    /api/agents                 # Liste des agents
POST   /api/agents                 # Créer un agent
PUT    /api/agents/{id}/config     # Configurer un agent
POST   /api/agents/{id}/start      # Démarrer un agent
POST   /api/agents/{id}/stop       # Arrêter un agent
GET    /api/agents/{id}/logs       # Logs d'activité
\`\`\`

### WebSocket Events

#### Frontend → Backend
\`\`\`typescript
// Démarrer une campagne
{
  type: 'START_CAMPAIGN',
  payload: { campaignId: string }
}

// Configurer un agent
{
  type: 'CONFIGURE_AGENT',
  payload: { agentId: string, config: AgentConfig }
}

// Demander enrichissement
{
  type: 'ENRICH_PROSPECT',
  payload: { prospectId: string }
}
\`\`\`

#### Backend → Frontend
\`\`\`typescript
// Nouveau prospect trouvé
{
  type: 'PROSPECT_FOUND',
  payload: { prospect: Prospect, campaignId: string }
}

// Activité d'agent
{
  type: 'AGENT_ACTIVITY',
  payload: {
    agentId: string,
    activity: string,
    status: 'started' | 'completed' | 'error',
    result?: any
  }
}

// Métriques mises à jour
{
  type: 'METRICS_UPDATE',
  payload: { campaignId: string, metrics: CampaignMetrics }
}
\`\`\`

## 🚀 Instructions d'Intégration

### 1. Configuration de l'Environnement

#### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

#### Backend (.env)
\`\`\`env
DATABASE_URL=postgresql://user:password@localhost:5432/prospecting_db
SERPER_API_KEY=your_serper_api_key
OPENAI_API_KEY=your_openai_api_key
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
\`\`\`

### 2. Points de Connexion Critiques

#### WebSocket Manager (Frontend)
\`\`\`typescript
// lib/websocket-manager.ts
class WebSocketManager {
  connect(url: string): void
  subscribe(event: string, callback: Function): void
  send(event: string, data: any): void
  disconnect(): void
}
\`\`\`

#### Event Handler (Backend)
\`\`\`python
# backend/websocket_handler.py
class WebSocketHandler:
    async def handle_connection(websocket: WebSocket)
    async def broadcast_event(event: str, data: dict)
    async def send_to_user(user_id: str, event: str, data: dict)
\`\`\`

### 3. Flux de Données Temps Réel

\`\`\`
1. Utilisateur démarre une campagne (Frontend)
   ↓
2. WebSocket envoie START_CAMPAIGN (Frontend → Backend)
   ↓
3. Backend active les agents CrewAI
   ↓
4. Agents commencent la prospection avec Serper
   ↓
5. Backend diffuse AGENT_ACTIVITY (Backend → Frontend)
   ↓
6. Frontend met à jour l'interface en temps réel
   ↓
7. Prospect trouvé → PROSPECT_FOUND (Backend → Frontend)
   ↓
8. Frontend affiche notification et met à jour les listes
\`\`\`

## 🎯 Prompt pour Claude Console

\`\`\`
Tu es un développeur expert chargé de connecter un frontend Next.js avec un backend FastAPI pour une plateforme de prospection IA utilisant CrewAI.

CONTEXTE :
- Frontend : Next.js avec composants React, TypeScript, Tailwind CSS
- Backend : FastAPI avec CrewAI, Serper API, WebSocket
- Communication : REST API + WebSocket pour temps réel

TÂCHES PRIORITAIRES :

1. CONFIGURATION WEBSOCKET
   - Implémenter WebSocketManager côté frontend
   - Créer les handlers WebSocket côté backend
   - Gérer la reconnexion automatique

2. INTÉGRATION CREWAI
   - Connecter les agents CrewAI aux événements frontend
   - Implémenter le système de notifications temps réel
   - Gérer les états des agents (idle, working, error)

3. GESTION DES DONNÉES
   - Synchroniser les prospects entre frontend/backend
   - Implémenter la pagination et le filtrage
   - Gérer le cache et l'optimisation

4. AUTHENTIFICATION
   - Sécuriser les routes API
   - Implémenter JWT tokens
   - Protéger les connexions WebSocket

CONTRAINTES TECHNIQUES :
- Utiliser les interfaces TypeScript définies
- Respecter les patterns REST pour les API
- Implémenter la gestion d'erreurs robuste
- Optimiser pour les performances temps réel

LIVRABLES ATTENDUS :
- Code backend FastAPI fonctionnel
- Intégration WebSocket complète
- Tests de connexion frontend/backend
- Documentation des endpoints API

Commence par analyser l'architecture existante et propose un plan d'implémentation étape par étape.
\`\`\`

## 📁 Structure des Fichiers

### Frontend
\`\`\`
app/
├── (auth)/
│   └── login/page.tsx          # Authentification admin
├── app/
│   ├── dashboard/page.tsx      # Dashboard principal
│   ├── prospects/page.tsx      # Gestion prospects
│   ├── campaigns/page.tsx      # Gestion campagnes
│   ├── agents/page.tsx         # Configuration agents
│   ├── analytics/page.tsx      # Analytics avancées
│   └── settings/page.tsx       # Paramètres
├── components/
│   └── app/
│       ├── real-time-crewai-dashboard.tsx
│       ├── notification-center.tsx
│       ├── campaign-monitor.tsx
│       └── ...
└── lib/
    ├── websocket-manager.ts    # Gestion WebSocket
    └── api-client.ts          # Client API
\`\`\`

### Backend (à implémenter)
\`\`\`
backend/
├── main.py                    # Point d'entrée FastAPI
├── models/
│   ├── prospect.py
│   ├── campaign.py
│   └── agent.py
├── api/
│   ├── prospects.py
│   ├── campaigns.py
│   └── agents.py
├── services/
│   ├── crewai_service.py      # Orchestration CrewAI
│   ├── serper_service.py      # Intégration Serper
│   └── websocket_service.py   # Gestion WebSocket
└── database/
    ├── connection.py
    └── migrations/
\`\`\`

## 🔧 Configuration et Déploiement

### Développement Local
\`\`\`bash
# Frontend
npm install
npm run dev

# Backend (à implémenter)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
\`\`\`

### Production
- Frontend : Déploiement Vercel
- Backend : Docker + Cloud provider
- Base de données : PostgreSQL
- Cache : Redis
- Monitoring : Logs temps réel

## 📈 Métriques et Monitoring

Le système doit tracker :
- Nombre de prospects trouvés par heure
- Taux de qualification des prospects
- Performance des agents CrewAI
- Temps de réponse des API
- Connexions WebSocket actives
- Erreurs et exceptions

---

*Cette documentation sert de référence complète pour l'intégration et le développement de la plateforme de prospection IA.*
