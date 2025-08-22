# 🚀 AI Agent Prospecting Platform

Plateforme de prospection automatisée avec agents IA spécialisés pour le marché ivoirien.

## 📁 Structure du Projet

Ce projet est maintenant organisé en **deux dossiers distincts** :

### 🔧 Backend
```
backend/
├── app/                    # Application FastAPI
├── src/ai_agent_crew/     # Système multi-agents CrewAI  
├── venv/                  # Environnement virtuel Python
├── requirements.txt       # Dépendances Python
└── README.md              # Documentation backend
```

**Démarrage** :
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```
**URL** : http://127.0.0.1:8001

### 🎨 Frontend  
```
frontend/
├── src/                   # Code source React
├── public/                # Fichiers statiques
├── package.json           # Dépendances NPM
└── README.md              # Documentation frontend
```

**Démarrage** :
```bash
cd frontend  
npm install
npm run dev
```
**URL** : http://localhost:3002/

## 🚀 Démarrage Rapide

### 1. Backend (Terminal 1)
```bash
cd backend
source venv/bin/activate  
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### 2. Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

### 3. Accès
- **Frontend** : http://localhost:3002/
- **Backend API** : http://127.0.0.1:8001
- **API Docs** : http://127.0.0.1:8001/docs

## 🤖 Fonctionnalités

### Agents IA CrewAI
- **Market Researcher** - Recherche d'entreprises ivoiriennes
- **Prospecting Specialist** - Qualification des prospects  
- **Content Writer** - Contenus personnalisés

### Interface Web
- **Dashboard** - Vue d'ensemble temps réel
- **Campagnes** - Création et gestion
- **Prospects** - Export et filtres
- **Monitoring** - Agents IA en action

### Technologies
- **Backend** : FastAPI, CrewAI, SQLAlchemy, WebSockets
- **Frontend** : React 18, TypeScript, Tailwind CSS, Vite
- **Base de Données** : SQLite (dev) / PostgreSQL (prod)

## 📊 Test Rapide

### Créer une campagne
```bash
curl -X POST "http://127.0.0.1:8001/api/v1/prospecting/campaigns" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test Campagne",
    "product_description": "Solutions digitales pour PME ivoiriennes", 
    "target_sectors": ["technologie", "finance"],
    "prospect_count": 5
  }'
```

### Démarrer la campagne
```bash
curl -X POST "http://127.0.0.1:8001/api/v1/prospecting/campaigns/1/start"
```

Les agents IA vont automatiquement :
1. 🔍 Rechercher des entreprises pertinentes
2. 📋 Qualifier les prospects
3. ✍️ Créer du contenu personnalisé
4. 💾 Sauvegarder les résultats

## 📚 Documentation Détaillée

- **Backend** : [backend/README.md](backend/README.md)
- **Frontend** : [frontend/README.md](frontend/README.md)
- **Documentation API** : http://127.0.0.1:8001/docs

## 🔧 Architecture

```
┌─────────────────┐    HTTP/WS     ┌─────────────────┐
│                 │ ◄─────────────► │                 │
│  React Frontend │                │  FastAPI Backend│
│  (Port 3002)    │                │  (Port 8001)    │
│                 │                │                 │
└─────────────────┘                └─────────────────┘
                                           │
                                           ▼
                                   ┌─────────────────┐
                                   │   CrewAI Agents │
                                   │   - Researcher  │
                                   │   - Specialist  │
                                   │   - Writer      │
                                   └─────────────────┘
                                           │
                                           ▼
                                   ┌─────────────────┐
                                   │  SQLite Database│
                                   │  - Campaigns    │
                                   │  - Prospects    │
                                   │  - Activities   │
                                   └─────────────────┘
```

## 🎯 Cas d'Usage

1. **Création de campagne** via interface web
2. **Démarrage des agents IA** automatiques
3. **Monitoring temps réel** des activités
4. **Consultation des prospects** identifiés  
5. **Export des données** en CSV

---

**La plateforme est prête à l'usage !** 🎉

Pour toute question :
- Consulter la doc API : http://127.0.0.1:8001/docs
- Vérifier les logs en temps réel
- Tester les WebSockets temps réel