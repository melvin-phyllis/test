# 🎨 Frontend - AI Agent Prospecting Platform

Interface utilisateur moderne pour la gestion des campagnes de prospection IA.

## 🚀 Démarrage Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
```

**Frontend disponible sur** : http://localhost:3002/

## 📁 Structure du Frontend

```
frontend/
├── src/
│   ├── components/        # Composants réutilisables
│   ├── pages/             # Pages principales
│   │   ├── Dashboard.tsx  # Tableau de bord
│   │   ├── Campaigns.tsx  # Gestion campagnes
│   │   ├── Prospects.tsx  # Gestion prospects
│   │   └── Agents.tsx     # Monitoring agents
│   ├── services/          # Services API
│   ├── hooks/             # Hooks personnalisés
│   ├── utils/             # Utilitaires
│   └── types/             # Types TypeScript
├── public/                # Fichiers statiques
└── package.json           # Dépendances NPM
```

## 🛠️ Technologies

- **React 18** + **TypeScript**
- **Vite** - Build tool moderne
- **Tailwind CSS** - Styling
- **React Query** - Gestion données
- **React Router** - Navigation
- **WebSocket** - Temps réel

## 📱 Pages Principales

### 🏠 Dashboard (`/`)
- Vue d'ensemble statistiques
- Campagnes récentes  
- Agents en temps réel

### 📊 Campagnes (`/campaigns`)
- Liste des campagnes
- Création & gestion
- Actions start/stop

### 🔍 Détails Campagne (`/campaigns/:id`)
- Informations complètes
- Prospects identifiés
- Messages temps réel

### 👥 Prospects (`/prospects`)
- Liste complète
- Export CSV
- Filtres avancés

### 🤖 Agents (`/agents`)
- Monitoring temps réel
- Historique d'activité
- Statistiques performance

## 🌐 Configuration API

Backend connecté sur : `http://127.0.0.1:8001`

## 🎨 Interface

- Design responsive
- Thème moderne Tailwind
- Icônes Lucide React
- Notifications toast

---

**Documentation complète** : [README_FRONTEND.md](README_FRONTEND.md)