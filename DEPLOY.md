# Guide de Déploiement - AI Agent Prospecting Platform

Ce guide vous permet de déployer la plateforme complète (backend + frontend) en développement ou production.

## 🚀 Démarrage Rapide (Développement)

### Option 1: Script automatique (Recommandé)

```bash
# Démarrer backend + frontend automatiquement
./scripts/start_dev.sh
```

### Option 2: Démarrage manuel

```bash
# 1. Backend (Terminal 1)
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 2. Frontend (Terminal 2)
cd frontend
pnpm install
pnpm dev
```

### Option 3: Docker Compose

```bash
# Développement avec base de données
docker-compose up --build

# Production complète (backend + frontend + nginx)
docker-compose -f docker-compose.full.yml up --build
```

## 📋 Prérequis

### Développement Local
- Python 3.11+
- Node.js 18+
- npm ou yarn

### Production
- Docker & Docker Compose
- Nginx (optionnel)
- PostgreSQL (optionnel, SQLite par défaut)

## ⚙️ Configuration

### 1. Variables d'environnement Backend

Copier et éditer `.env`:

```bash
cp .env.example .env
```

Variables obligatoires:
```bash
OPENAI_API_KEY="sk-your-openai-key"
SECRET_KEY="your-super-secret-key-change-this"
```

Variables optionnelles:
```bash
DATABASE_URL="postgresql://user:password@localhost/prospecting"
REDIS_URL="redis://localhost:6379"
SERPER_API_KEY="your-serper-key"
DEBUG=true
```

### 2. Configuration Frontend

Le frontend est basé sur Next.js (App Router).

Variables d'environnement frontend (optionnel):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## 🏗️ Installation Complète

### 1. Setup initial

```bash
# Cloner et installer
git clone <repo-url>
cd ai-agent-prospecting-platform

# Exécuter le script d'installation
./setup_project.sh
```

### 2. Configuration des clés API

Éditer le fichier `.env`:

```bash
# OpenAI (obligatoire)
OPENAI_API_KEY="sk-proj-..."

# Serper pour recherche web (optionnel)
SERPER_API_KEY="your-serper-key"

# Clé secrète (obligatoire)
SECRET_KEY="$(openssl rand -hex 32)"
```

### 3. Initialisation base de données

```bash
# Activer l'environnement virtuel
source venv/bin/activate

# Créer les tables
alembic upgrade head
```

### 4. Test de l'installation

```bash
# Test backend
python test_installation.py

# Test CrewAI standalone
python -m src.ai_agent_crew.main --test-tools
```

## 🌐 URLs d'accès

### Développement
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentation API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Production (avec nginx)
- **Application**: http://localhost
- **API**: http://localhost/api
- **WebSocket**: ws://localhost/ws

## 🐳 Déploiement Docker

### Développement complet

```bash
# Backend + Base de données
docker-compose up --build

# Accès:
# - API: http://localhost:8000
# - Docs: http://localhost:8000/docs
# - PostgreSQL: localhost:5432
```

### Production complète

```bash
# Backend + Frontend + Base de données + Nginx
docker-compose -f docker-compose.full.yml up --build

# Accès:
# - Application: http://localhost
# - API via proxy: http://localhost/api
```

## 🔧 Scripts de Gestion

### Backend

```bash
# Démarrer en développement
uvicorn app.main:app --reload

# Démarrer en production
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Tests
python test_installation.py
python -m pytest

# Migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head

# Linting
black app/
flake8 app/
```

### Frontend

```bash
cd frontend

# Développement
npm run dev

# Build production
npm run build

# Prévisualisation build
npm run preview

# Linting
npm run lint
npm run lint:fix
```

## 📊 Monitoring et Logs

### Logs Backend

```bash
# Logs en temps réel
tail -f logs/app.log

# Logs Docker
docker-compose logs -f api
```

### Logs Frontend

```bash
# Logs développement
# Affichés dans la console du navigateur

# Logs production
docker-compose logs -f frontend
```

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# CrewAI info
curl http://localhost:8000/api/v1/prospecting/crew/info

# WebSocket test
wscat -c ws://localhost:8000/ws/1
```

## 🚀 Mise en Production

### 1. Configuration Production

```bash
# Variables d'environnement production
DEBUG=false
DATABASE_URL="postgresql://user:password@prod-db/prospecting"
SECRET_KEY="$(openssl rand -hex 32)"
BACKEND_CORS_ORIGINS=["https://yourdomain.com"]
```

### 2. Base de données Production

```bash
# PostgreSQL recommandé
DATABASE_URL="postgresql://user:password@localhost/prospecting"

# Ou MySQL
DATABASE_URL="mysql://user:password@localhost/prospecting"

# Migrations
alembic upgrade head
```

### 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
    }
    
    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 4. SSL/HTTPS

```bash
# Certbot pour Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

### 5. Process Management

```bash
# Systemd service pour le backend
sudo systemctl enable prospecting-api
sudo systemctl start prospecting-api

# PM2 pour Node.js (si applicable)
pm2 start npm --name "prospecting-frontend" -- run preview
pm2 save
pm2 startup
```

## 🔐 Sécurité

### Variables Sensibles

- ✅ Utiliser des clés secrètes fortes
- ✅ Changer `SECRET_KEY` en production
- ✅ Sécuriser les clés API OpenAI
- ✅ Configurer CORS correctement

### Base de Données

- ✅ Utiliser des mots de passe forts
- ✅ Restreindre l'accès réseau
- ✅ Sauvegardes régulières
- ✅ Chiffrement en transit (SSL)

### Application

- ✅ HTTPS en production
- ✅ Headers de sécurité (CSP, HSTS)
- ✅ Rate limiting
- ✅ Validation des données

## 📈 Performance

### Backend Optimisation

```bash
# Workers multiples
uvicorn app.main:app --workers 4

# Gunicorn alternative
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Optimisation

```bash
# Build optimisé
npm run build

# Analyse du bundle
npm run build -- --analyze
```

### Base de Données

- Index sur les colonnes fréquemment interrogées
- Connection pooling
- Requêtes optimisées
- Cache Redis pour les données fréquentes

## 🆘 Dépannage

### Erreurs Communes

**Backend ne démarre pas:**
```bash
# Vérifier les dépendances
pip install -r requirements.txt

# Vérifier la configuration
python -c "from app.core.config import settings; print(settings.dict())"

# Vérifier la base de données
alembic current
```

**Frontend ne se connecte pas:**
```bash
# Vérifier la configuration des URLs (NEXT_PUBLIC_API_URL)
# Vérifier les CORS du backend
# Tester l'API directement: curl http://localhost:8000/health
```

**WebSocket ne fonctionne pas:**
```bash
# Tester la connexion
wscat -c ws://localhost:8000/ws/1

# Vérifier les logs backend
tail -f logs/app.log
```

**CrewAI ne fonctionne pas:**
```bash
# Tester les tools
python -m src.ai_agent_crew.main --test-tools

# Vérifier les clés API
echo $OPENAI_API_KEY
```

### Logs et Debugging

```bash
# Backend verbose
DEBUG=true uvicorn app.main:app --log-level debug

# Frontend debugging
# Ouvrir les DevTools du navigateur
# Onglet Network pour les requêtes API
# Onglet Console pour les erreurs JavaScript

# Base de données
# Activer echo=True dans database.py pour voir les requêtes SQL
```

## 📞 Support

- Documentation: `/docs` endpoint du backend
- Health check: `/health` endpoint
- CrewAI info: `/api/v1/prospecting/crew/info`
- Logs: fichier `logs/app.log`
