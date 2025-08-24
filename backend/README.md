# 🔧 Backend - AI Agent Prospecting Platform

Plateforme de prospection automatisée avec agents IA spécialisés pour le marché ivoirien.

## 🚀 Démarrage Rapide

```bash
# 1. Activer l'environnement virtuel
source venv/bin/activate

# 2. Lancer le serveur
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend disponible sur** : http://127.0.0.1:8000
**Documentation API** : http://127.0.0.1:8000/docs

## 📁 Structure du Backend

```
backend/
├── app/                    # Application FastAPI
│   ├── api/               # Endpoints API
│   ├── core/              # Configuration
│   ├── db/                # Base de données
│   ├── models/            # Modèles SQLAlchemy
│   ├── schemas/           # Schémas Pydantic
│   └── services/          # Services métier
├── src/                   # Agents IA CrewAI
│   └── ai_agent_crew/     # Système multi-agents
├── alembic/               # Migrations DB
├── venv/                  # Environnement virtuel
└── requirements.txt       # Dépendances
```

## 🤖 Agents IA

1. **Market Researcher** - Recherche d'entreprises
2. **Prospecting Specialist** - Qualification prospects
3. **Content Writer** - Contenus personnalisés

## 📊 API Endpoints

- `GET /health` - Santé de l'API
- `POST /api/v1/prospecting/campaigns` - Créer campagne
- `GET /api/v1/prospecting/campaigns` - Lister campagnes
- `POST /api/v1/prospecting/campaigns/{id}/start` - Démarrer
- `GET /api/v1/prospects/` - Lister prospects
- `GET /api/v1/agents/status` - Statut agents

## 🔗 WebSockets

- `ws://127.0.0.1:8000/ws/campaign/{id}` - Updates temps réel

---

**Documentation complète** : [README_BACKEND.md](README_BACKEND.md)
