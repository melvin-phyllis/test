# 🎨 AI Agent Prospecting Platform - Frontend

Interface utilisateur moderne pour la gestion des campagnes de prospection IA.

## 📁 Architecture Frontend

```
frontend/
├── src/
│   ├── components/        # Composants réutilisables
│   │   ├── Layout.tsx     # Layout principal
│   │   └── CreateCampaignModal.tsx
│   ├── pages/             # Pages principales
│   │   ├── Dashboard.tsx  # Tableau de bord
│   │   ├── Campaigns.tsx  # Gestion campagnes
│   │   ├── CampaignDetail.tsx # Détails campagne
│   │   ├── Prospects.tsx  # Gestion prospects
│   │   └── Agents.tsx     # Monitoring agents
│   ├── services/          # Services API
│   │   ├── api.ts         # Appels API REST
│   │   └── websocket.ts   # WebSocket temps réel
│   ├── hooks/             # Hooks personnalisés
│   ├── utils/             # Utilitaires
│   ├── types/             # Types TypeScript
│   └── styles/            # Styles CSS
├── public/                # Fichiers statiques
└── package.json           # Dépendances NPM
```

## 🛠️ Installation et Configuration

### 1. Prérequis
```bash
# Node.js 18+
node --version
npm --version

# Ou Yarn (optionnel)
yarn --version
```

### 2. Installation des dépendances
```bash
cd frontend

# Avec NPM
npm install

# Ou avec Yarn
yarn install
```

### 3. Configuration de l'environnement
```bash
# Créer un fichier .env.local (optionnel)
echo "VITE_API_URL=http://127.0.0.1:8001" > .env.local
echo "VITE_WS_URL=ws://127.0.0.1:8001" >> .env.local
```

## 🚀 Démarrage du Frontend

### Commande de démarrage
```bash
cd frontend

# Lancer le serveur de développement
npm run dev

# Ou avec Yarn
yarn dev
```

### URLs d'accès
- **Application**: http://localhost:3002/
- **Serveur Vite**: Auto-détecté (3000, 3001, 3002...)

## 📱 Pages et Fonctionnalités

### 🏠 Dashboard (Page d'accueil)
- Vue d'ensemble des statistiques
- Campagnes récentes
- Statut des agents IA en temps réel
- Métriques de performance

**Route**: `/`

### 📊 Campagnes
- Liste de toutes les campagnes
- Création de nouvelles campagnes
- Filtrage et recherche
- Actions : Démarrer, Arrêter, Voir détails

**Route**: `/campaigns`

**Fonctionnalités**:
- ✅ Création de campagne avec modal
- ✅ Filtrage par statut
- ✅ Actions en temps réel
- ✅ Recherche textuelle

### 🔍 Détails de Campagne
- Informations complètes de la campagne
- Prospects identifiés
- Activité des agents en temps réel
- Statistiques détaillées
- Messages WebSocket temps réel

**Route**: `/campaigns/:id`

### 👥 Prospects
- Liste complète des prospects
- Filtrage par campagne, secteur, statut
- Export CSV
- Cartes détaillées avec informations de contact

**Route**: `/prospects`

**Fonctionnalités**:
- ✅ Système de scoring avec étoiles
- ✅ Export CSV
- ✅ Filtres avancés
- ✅ Informations de contact (email, téléphone, WhatsApp)

### 🤖 Agents IA
- Monitoring des agents en temps réel
- Historique d'activité
- Statistiques de performance
- Filtrage par campagne

**Route**: `/agents`

## 🔧 Technologies Utilisées

### Framework et Outils
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool moderne
- **React Router** - Navigation
- **Tailwind CSS** - Styling utilitaire

### Gestion d'État
- **React Query** - Gestion des données serveur
- **Zustand** - State management (si configuré)

### Communication
- **Axios** - Requêtes HTTP
- **WebSocket Native** - Communication temps réel

### UI/UX
- **Lucide React** - Icônes modernes
- **React Hot Toast** - Notifications
- **Clsx** - Gestion des classes CSS

## 🌐 Services et API

### Service API REST (`src/services/api.ts`)
```typescript
// Exemples d'utilisation
import { campaignApi, prospectApi, agentApi } from '@/services/api'

// Créer une campagne
const campaign = await campaignApi.createCampaign(data)

// Récupérer les prospects
const prospects = await prospectApi.getProspects({ campaign_id: 1 })

// Statut des agents
const status = await agentApi.getAgentStatus()
```

### Service WebSocket (`src/services/websocket.ts`)
```typescript
import { wsService } from '@/services/websocket'

// S'abonner aux mises à jour d'une campagne
wsService.subscribeToCampaign(campaignId)

// Écouter les messages
const unsubscribe = wsService.subscribe('*', (message) => {
  console.log('Message temps réel:', message)
})
```

## 🎨 Composants Principaux

### Layout (`src/components/Layout.tsx`)
- Navigation principale
- Sidebar responsive  
- Header avec titre dynamique

### CreateCampaignModal (`src/components/CreateCampaignModal.tsx`)
- Formulaire de création de campagne
- Validation des données
- Intégration avec l'API

### Composants de Page
- **StatCard** - Cartes de statistiques
- **CampaignRow** - Ligne de campagne
- **ProspectCard** - Carte de prospect
- **ActivityRow** - Activité d'agent

## 🛡️ Types TypeScript

### Types Principaux (`src/types/index.ts`)
```typescript
export interface Campaign {
  id: number
  name: string
  status: CampaignStatus
  product_description: string
  target_location: string
  target_sectors: string[]
  prospect_count: number
  created_at: string
  results_summary?: any
}

export interface Prospect {
  id: number
  campaign_id: number
  company_name: string
  contact_name?: string
  email?: string
  phone?: string
  quality_score: number
  status: string
}

export interface AgentActivity {
  id: number
  agent_name: string
  task_name: string
  status: string
  started_at: string
  message?: string
}
```

## 📊 Fonctionnalités Temps Réel

### WebSocket Integration
- Connexion automatique aux campagnes actives
- Mises à jour de statut en temps réel
- Messages d'activité des agents
- Reconnexion automatique

### Mises à Jour Automatiques
- React Query avec `refetchInterval`
- Invalidation de cache sur événements WebSocket
- Optimistic updates pour les actions utilisateur

## 🎨 Styling et Thème

### Tailwind CSS Configuration
- Couleurs personnalisées pour la marque
- Classes utilitaires réutilisables
- Design system cohérent

### Classes CSS Personnalisées
```css
/* Boutons */
.btn-primary    /* Bouton principal bleu */
.btn-success    /* Bouton vert */
.btn-danger     /* Bouton rouge */
.btn-secondary  /* Bouton gris */

/* Composants */
.card           /* Carte avec ombre */
.input          /* Input stylisé */
.status-badge   /* Badge de statut */
```

## 🔄 Intégration Backend

### Configuration API
```typescript
// Configuration automatique des endpoints
const API_BASE_URL = 'http://127.0.0.1:8001'

// Services configurés
- campaignApi    /* /api/v1/prospecting/campaigns */
- prospectApi    /* /api/v1/prospects */  
- agentApi       /* /api/v1/agents */
```

### Gestion des Erreurs
- Toast notifications pour les erreurs
- Retry automatique avec React Query
- Fallbacks en cas d'erreur réseau

## 🐛 Dépannage

### Erreurs Courantes

1. **Port déjà utilisé**
   ```bash
   # Vite trouve automatiquement un port libre
   # 3000 → 3001 → 3002, etc.
   ```

2. **Erreur de connexion API**
   ```bash
   # Vérifier que le backend est lancé
   curl http://127.0.0.1:8001/health
   ```

3. **Problème de build CSS**
   ```bash
   # Supprimer node_modules et reinstaller
   rm -rf node_modules
   npm install
   ```

4. **WebSocket non connecté**
   - Vérifier l'URL WebSocket dans les DevTools
   - S'assurer que le backend supporte les WebSockets

### Mode Debug
```bash
# Lancer avec logs détaillés
npm run dev -- --debug

# Ou mode verbose
VITE_LOG_LEVEL=info npm run dev
```

## 🚀 Build et Déploiement

### Build de Production
```bash
# Créer le build optimisé
npm run build

# Aperçu du build
npm run preview
```

### Fichiers Générés
- `dist/` - Fichiers de production optimisés
- `dist/index.html` - Point d'entrée
- `dist/assets/` - JS, CSS, images minifiés

## 📱 Responsive Design

### Breakpoints Tailwind
- `sm:` - 640px+
- `md:` - 768px+  
- `lg:` - 1024px+
- `xl:` - 1280px+

### Composants Adaptatifs
- Navigation mobile avec sidebar
- Grilles responsives pour les cartes
- Tables adaptatives sur mobile

---

## 📞 Support

Pour toute question sur le frontend :
- Vérifier la console browser (F12)
- Examiner les requêtes réseau
- Consulter les logs React Query

**Frontend URL**: http://localhost:3002/
**Backend API**: http://127.0.0.1:8001
**Status**: Serveur de développement Vite actif

### Commandes Utiles
```bash
# Installer les dépendances
npm install

# Lancer le dev server  
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```