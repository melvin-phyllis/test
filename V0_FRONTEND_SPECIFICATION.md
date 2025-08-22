# Spécification Frontend v0 - Global AI Prospecting Platform 🌍

## Vue d'ensemble du Projet

**Plateforme de prospection internationale** avec agents IA spécialisés, construite sur FastAPI + CrewAI backend avec interface React moderne.

## Architecture Backend Existante

### 🔧 API Endpoints Disponibles

#### Campagnes (`/api/v1/prospecting/campaigns`)
- `GET /campaigns` - Liste des campagnes
- `POST /campaigns` - Créer campagne
- `GET /campaigns/{id}` - Détails campagne
- `PUT /campaigns/{id}` - Modifier campagne  
- `POST /campaigns/{id}/start` - Lancer campagne
- `POST /campaigns/{id}/stop` - Arrêter campagne
- `GET /campaigns/{id}/status` - Statut temps réel
- `GET /campaigns/{id}/stats` - Statistiques

#### Prospects (`/api/v1/prospects`)
- `GET /prospects/` - Liste avec filtres (campaign_id, sector, status)
- `GET /prospects/{id}` - Détails prospect
- `PUT /prospects/{id}` - Modifier prospect
- `DELETE /prospects/{id}` - Supprimer prospect

#### Agents IA (`/api/v1/agents`)
- `GET /agents/activity` - Logs d'activité
- `GET /agents/status` - Statut agents en temps réel
- `GET /agents/stats` - Statistiques performance

#### WebSocket (`/ws/{campaign_id}`)
- Monitoring temps réel des campagnes
- Messages d'activité des agents
- Notifications de progression

### 🗄️ Modèles de Données

#### Campaign
```typescript
interface Campaign {
  id: number
  name: string
  product_description: string
  target_location: string  // Pays/région internationale
  target_sectors: string[]
  prospect_count: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  started_at?: string
  completed_at?: string
  results_summary: {
    prospects_found?: number
    processing_completed?: boolean
    timestamp?: string
  }
}
```

#### Prospect
```typescript
interface Prospect {
  id: number
  campaign_id: number
  company_name: string
  website?: string
  description?: string
  sector?: string
  location?: string  // International
  contact_name?: string
  contact_position?: string
  email?: string
  phone?: string
  linkedin?: string  // Pour contacts internationaux
  quality_score: number  // 0-10
  status: string
  created_at: string
  updated_at: string
  extra_data: Record<string, any>
}
```

#### AgentActivity
```typescript
interface AgentActivity {
  id: number
  campaign_id: number
  agent_name: string  // market_researcher, prospecting_specialist, content_writer
  agent_role?: string
  task_name?: string
  status: string  // started, running, completed, failed
  message?: string
  error_message?: string
  started_at: string
  completed_at?: string
}
```

### 🤖 Agents IA Spécialisés

1. **Global Market Researcher** - Identifie entreprises mondiales
2. **International Prospecting Specialist** - Trouve contacts internationaux  
3. **Global Content Writer** - Contenu adapté culturellement

## Spécifications Interface v0

### 🎨 Design System

#### Couleurs
```css
Primary: #3B82F6 (Blue-500)
Success: #10B981 (Emerald-500) 
Warning: #F59E0B (Amber-500)
Error: #EF4444 (Red-500)
Gray: #6B7280 (Gray-500)
Background: #F9FAFB (Gray-50)
```

#### Typographie
- **Headings**: Inter Bold
- **Body**: Inter Regular  
- **Mono**: JetBrains Mono

### 📱 Pages Principales

#### 1. Dashboard Global (`/`)
**Composants requis:**
- **KPI Cards**: Campagnes totales, actives, prospects trouvés, taux de réussite
- **Graphique temporel**: Activité prospection par jour
- **Carte mondiale interactive**: Visualisation par pays ciblés
- **Activité temps réel**: Stream des agents IA avec WebSocket
- **Campagnes récentes**: Table avec actions rapides

**Données WebSocket:**
```typescript
interface WebSocketMessage {
  type: 'agent_activity' | 'campaign_status'
  campaign_id: number
  agent_name?: string
  status?: string
  message?: string
  timestamp: string
}
```

#### 2. Gestion Campagnes (`/campaigns`)

**Liste Campagnes:**
- **Filtres**: Statut, pays, secteur, date
- **Actions en masse**: Démarrer/arrêter plusieurs campagnes
- **Cards campagnes** avec:
  - Progress bar temps réel
  - Indicateurs pays avec drapeaux
  - Compteurs prospects trouvés
  - Boutons actions contextuels

**Création Campagne - Modal Avancé:**
- **Sélecteur pays multi-niveaux**:
```typescript
const COUNTRIES = {
  "🇪🇺 Europe": ["France", "Allemagne", "Royaume-Uni", "Espagne", "Italie"],
  "🇺🇸 Amérique du Nord": ["États-Unis", "Canada", "Mexique"],
  "🌏 Asie-Pacifique": ["Japon", "Singapour", "Australie", "Inde"],
  "🌍 Afrique": ["Afrique du Sud", "Nigeria", "Kenya", "Maroc"],
  "🌎 Amérique Latine": ["Brésil", "Argentine", "Chili"]
}
```

- **Secteurs modernes**:
```typescript
const SECTORS = [
  "🚀 Technologie", "💰 FinTech", "🏥 MedTech", 
  "🛒 E-commerce", "☁️ SaaS", "🏭 Industrie 4.0",
  "🚗 Automobile", "🏠 PropTech", "⚡ EnergeTech",
  "📚 EdTech", "🌱 AgTech", "🔐 CyberSécurité"
]
```

- **Configuration avancée**:
  - Slider prospect count (1-100)
  - Options agents IA personnalisées
  - Planning automatique

#### 3. Détail Campagne (`/campaigns/{id}`)

**Onglets principaux:**
- **Vue d'ensemble**: Métriques + graphiques
- **Prospects**: Table interactive avec actions
- **Activité Agents**: Timeline temps réel
- **Résultats**: Export et analyse

**Monitoring Temps Réel:**
- **Agent Status Cards**:
  ```typescript
  interface AgentStatusCard {
    name: string
    status: 'idle' | 'working' | 'completed' | 'error'
    current_task?: string
    progress: number
    avatar: string  // Robot avatar différent par agent
  }
  ```

- **Timeline d'activité** avec WebSocket live updates
- **Progress rings** pour chaque étape
- **Logs expandables** par agent

#### 4. Base Prospects (`/prospects`)

**Table Avancée:**
- **Filtres intelligents**: 
  - Pays avec autocomplete
  - Secteurs avec chips
  - Score qualité (slider)
  - Statut avec badges colorés
- **Colonnes personnalisables**
- **Actions en masse**: Export, mise à jour statut
- **Vue cartes** alternative

**Fiche Prospect Détaillée:**
- **Header** avec logo entreprise (via API Clearbit)
- **Onglets**: Infos, Contact, Historique
- **Actions**: Email direct, LinkedIn, notes
- **Score qualité** avec breakdown

#### 5. Analytics Agents (`/agents`)

**Dashboards Spécialisés:**
- **Performance par agent**: Graphiques comparatifs
- **Géolocalisation**: Heatmap succès par pays
- **Secteurs**: Analysis breakdown par industrie
- **Trends temporels**: Évolution performance

### 🔄 Interactions WebSocket

#### Connection Management
```typescript
class WebSocketManager {
  connect(campaignId?: number): void
  subscribe(type: string, callback: Function): void
  send(message: any): void
  disconnect(): void
}
```

#### Messages Temps Réel
```typescript
// Agent activité
{
  type: "agent_activity",
  campaign_id: 123,
  agent_name: "market_researcher", 
  status: "working",
  task_name: "Recherche entreprises Allemagne",
  message: "Analyse secteur automobile...",
  progress: 45,
  timestamp: "2025-08-22T11:30:00Z"
}

// Statut campagne
{
  type: "campaign_status",
  campaign_id: 123,
  status: "running",
  message: "15 prospects identifiés",
  progress: 60,
  timestamp: "2025-08-22T11:30:00Z"
}
```

### 🌍 Fonctionnalités Internationales

#### Localisation UI
- **Drapeaux pays** avec bibliothèque flag-icons
- **Timezones** automatiques par pays sélectionné
- **Formats dates/heures** localisés
- **Devises** pour métriques business

#### Adaptation Culturelle
- **Messages contextuels** par région:
  - "Prospection RGPD-compliant" (Europe)
  - "CAN-SPAM Act respecté" (USA)
  - "Sources locales privilégiées" (Asie)

#### Cartes Interactives
- **Vue mondiale** avec markers par campagne
- **Drill-down** par pays/région
- **Heatmap** performance par zone géographique

### 📊 Visualisations de Données

#### Graphiques Requis
1. **Line Chart**: Évolution prospects dans le temps
2. **Bar Chart**: Prospects par secteur/pays
3. **Donut Chart**: Répartition statuts campagnes
4. **Heatmap**: Performance géographique
5. **Gauge Charts**: Scores qualité moyens
6. **Timeline**: Activité agents

#### Métriques Clés
```typescript
interface Metrics {
  totalCampaigns: number
  activeCampaigns: number
  totalProspects: number
  avgQualityScore: number
  successRate: number
  countriesTargeted: number
  topSectors: string[]
  recentActivity: AgentActivity[]
}
```

### 🎯 Composants Spécialisés

#### CampaignProgressCard
```tsx
interface CampaignProgressCardProps {
  campaign: Campaign
  realTimeUpdates: boolean
  onStart: () => void
  onStop: () => void
  onView: () => void
}
```

#### ProspectTable
```tsx
interface ProspectTableProps {
  prospects: Prospect[]
  filters: ProspectFilters
  onFilter: (filters: ProspectFilters) => void
  onExport: () => void
  onBulkAction: (action: string, ids: number[]) => void
}
```

#### AgentStatusPanel
```tsx
interface AgentStatusPanelProps {
  agents: AgentStatus[]
  campaignId: number
  wsConnection: WebSocket
}
```

#### WorldMap
```tsx
interface WorldMapProps {
  campaigns: Campaign[]
  onCountryClick: (country: string) => void
  heatmapData: Record<string, number>
}
```

### 🔧 Configuration Technique

#### APIs Integration
```typescript
class ApiClient {
  // Campaigns
  getCampaigns(filters?: CampaignFilters): Promise<Campaign[]>
  createCampaign(data: CampaignCreate): Promise<Campaign>
  startCampaign(id: number): Promise<void>
  
  // Prospects  
  getProspects(filters?: ProspectFilters): Promise<Prospect[]>
  updateProspect(id: number, data: ProspectUpdate): Promise<Prospect>
  
  // Agents
  getAgentStatus(): Promise<AgentStatus[]>
  getAgentStats(): Promise<AgentStats>
}
```

#### State Management (Zustand)
```typescript
interface AppStore {
  // Campaigns
  campaigns: Campaign[]
  activeCampaign?: Campaign
  
  // Prospects
  prospects: Prospect[]
  prospectFilters: ProspectFilters
  
  // Real-time
  wsConnected: boolean
  agentStatuses: AgentStatus[]
  lastMessage?: WebSocketMessage
  
  // UI
  selectedCountries: string[]
  selectedSectors: string[]
}
```

## 🚀 Fonctionnalités Avancées

### Export & Reporting
- **Export prospects**: CSV, Excel, PDF avec templates
- **Rapports campagnes**: Performance, ROI, géographique  
- **Scheduling**: Exports automatiques récurrents

### Notifications
- **Toast notifications**: Actions utilisateur
- **Email alerts**: Campagnes terminées
- **Slack integration**: Résultats en temps réel

### Sécurité
- **API rate limiting** avec retry logic
- **Error boundaries** React
- **Loading states** intelligents
- **Offline mode** avec service worker

---

## 📋 Checklist Développement v0

### Phase 1: Structure
- [ ] Layout responsive avec sidebar
- [ ] Routing React Router
- [ ] State management Zustand
- [ ] API client configuration

### Phase 2: Pages Core
- [ ] Dashboard avec métriques
- [ ] Liste campagnes avec filtres
- [ ] Création campagne (modal)
- [ ] Détail campagne

### Phase 3: Temps Réel
- [ ] WebSocket integration
- [ ] Agent status monitoring  
- [ ] Live progress updates
- [ ] Notifications système

### Phase 4: Données
- [ ] Table prospects avancée
- [ ] Graphiques interactifs
- [ ] Export fonctionnalités
- [ ] Filtres intelligents

### Phase 5: International
- [ ] Sélecteur pays groupés
- [ ] Drapeaux et localization
- [ ] Carte mondiale interactive
- [ ] Adaptation culturelle

Cette spécification complète permettra de créer une interface v0 entièrement connectée à votre backend de prospection internationale ! 🌍✨