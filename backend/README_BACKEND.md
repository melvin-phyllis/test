# 🚀 AI Agent Prospecting Platform - Backend

Plateforme de prospection automatisée avec agents IA spécialisés pour le marché ivoirien.

## 📁 Architecture Backend

```
├── app/                    # Application FastAPI
│   ├── api/               # Endpoints API
│   ├── core/              # Configuration et sécurité
│   ├── db/                # Base de données et modèles
│   ├── models/            # Modèles SQLAlchemy
│   ├── schemas/           # Schémas Pydantic
│   └── services/          # Logique métier
├── src/                   # Agents IA CrewAI
│   └── ai_agent_crew/     # Système multi-agents
├── alembic/               # Migrations de base de données
└── requirements.txt       # Dépendances Python
```

## 🛠️ Installation et Configuration

### 1. Prérequis
```bash
# Python 3.12+
python3 --version

# Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

### 2. Installation des dépendances
```bash
pip install -r requirements.txt
```

### 3. Configuration des variables d'environnement
```bash
# Créer un fichier .env (optionnel)
echo "DATABASE_URL=sqlite:///./ai_prospecting.db" > .env
echo "SECRET_KEY=your-secret-key-here" >> .env
```

### 4. Initialisation de la base de données
```bash
# Les tables sont créées automatiquement au démarrage
# Pas besoin de migration manuelle pour SQLite
```

## 🚀 Démarrage du Backend

### Commande de démarrage
```bash
# Activer l'environnement virtuel
source venv/bin/activate

# Lancer le serveur de développement
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Vérification du fonctionnement
```bash
# Test de santé de l'API
curl http://127.0.0.1:8000/health

# Documentation interactive
open http://127.0.0.1:8000/docs
```

## 📊 Endpoints API Principaux

### Campagnes de Prospection
- `POST /api/v1/prospecting/campaigns` - Créer une campagne
- `GET /api/v1/prospecting/campaigns` - Lister les campagnes
- `GET /api/v1/prospecting/campaigns/{id}` - Détails d'une campagne
- `POST /api/v1/prospecting/campaigns/{id}/start` - Démarrer une campagne
- `POST /api/v1/prospecting/campaigns/{id}/stop` - Arrêter une campagne

### Prospects
- `GET /api/v1/prospects/` - Lister les prospects
- `GET /api/v1/prospects/{id}` - Détails d'un prospect
- `PUT /api/v1/prospects/{id}` - Modifier un prospect

### Agents IA
- `GET /api/v1/agents/status` - Statut des agents
- `GET /api/v1/agents/activity` - Activité des agents
- `GET /api/v1/agents/stats` - Statistiques des agents

## 🤖 Système d'Agents IA

### Agents CrewAI Disponibles

1. **Market Researcher** 🔍
   - Recherche d'entreprises ivoiriennes
   - Analyse des secteurs porteurs
   - Identification des besoins

2. **Prospecting Specialist** 🎯
   - Recherche d'informations de contact
   - Qualification des prospects
   - Scoring de qualité

3. **Content Writer** ✍️
   - Création de contenus personnalisés
   - Messages de prospection
   - Adaptation culturelle

### Outils Personnalisés

- **IvorianBusinessSearchTool** - Recherche d'entreprises locales
- **ContactFinderTool** - Recherche de contacts
- **MarketAnalysisTool** - Analyse de marché

## 💾 Base de Données

### Structure des Tables
- `campaigns` - Campagnes de prospection
- `prospects` - Prospects identifiés
- `agent_activities` - Activités des agents
- `users` - Utilisateurs (pour l'authentification future)

### Exemple de Création de Campagne
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/prospecting/campaigns" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Campagne Digitalisation",
    "product_description": "Solutions digitales pour PME ivoiriennes",
    "target_location": "Abidjan, Côte d'\''Ivoire",
    "target_sectors": ["technologie", "finance", "commerce"],
    "prospect_count": 10
  }'
```

## 🌐 WebSockets Temps Réel

### Connexion WebSocket
```javascript
const ws = new WebSocket('ws://127.0.0.1:8000/ws/campaign/{campaign_id}');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Message temps réel:', data);
};
```

## 📝 Logs et Monitoring

### Localisation des logs
- Logs console : sortie standard
- Logs base de données : via SQLAlchemy
- Logs agents IA : dans les tâches CrewAI

### Monitoring des Agents
```bash
# Statut des agents
curl http://127.0.0.1:8000/api/v1/agents/status

# Activités récentes
curl http://127.0.0.1:8000/api/v1/agents/activity?limit=10
```

## 🛡️ Sécurité et Configuration

### Variables d'Environnement
- `DATABASE_URL` - URL de la base de données
- `SECRET_KEY` - Clé secrète pour JWT
- `OPENAI_API_KEY` - Clé API OpenAI (pour CrewAI)

### CORS Configuration
Le backend accepte les connexions depuis :
- `http://localhost:3000` (React dev)
- `http://localhost:3001`  
- `http://localhost:3002`

## 🐛 Dépannage

### Erreurs Courantes

1. **Port déjà utilisé**
   ```bash
   # Changer le port
   python -m uvicorn app.main:app --reload --port 8002
   ```

2. **Problème avec CrewAI**
   ```bash
   # Vérifier la version
   pip show crewai
   
   # Reinstaller si nécessaire
   pip install --upgrade crewai[tools]
   ```

3. **Base de données SQLite verrouillée**
   ```bash
   # Supprimer le fichier de base de données
   rm prospecting.db
   # Redémarrer le serveur
   ```

4. **Erreur "attempt to write a readonly database"**
   ```bash
   # Corriger les permissions
   ./fix_permissions.sh
   
   # Ou manuellement
   chmod 664 prospecting.db
   chmod 775 .
   ```

## 🔧 Développement

### Tests
```bash
# Lancer les tests (si configurés)
python -m pytest

# Tests manuels
python test_websocket.py
```

### Structure du Code
- `app/main.py` - Point d'entrée FastAPI
- `app/api/v1/` - Versions des API
- `src/ai_agent_crew/` - Système multi-agents
- `app/services/crewai_service.py` - Service CrewAI

---

## 📞 Support

Pour toute question sur le backend :
- Consulter la documentation API : http://127.0.0.1:8000/docs
- Vérifier les logs en temps réel
- Tester les endpoints avec curl ou Postman

**Backend URL**: http://127.0.0.1:8000
**API Docs**: http://127.0.0.1:8000/docs
**Status**: http://127.0.0.1:8000/health
