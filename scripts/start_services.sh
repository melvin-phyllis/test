#!/bin/bash

# Script de démarrage des services AI Agent Prospecting Platform
# =============================================================

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage des services AI Agent Prospecting Platform..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "README.md" ]; then
    log_error "Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python3 n'est pas installé"
        exit 1
    fi
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier pnpm
    if ! command -v pnpm &> /dev/null; then
        log_warning "pnpm n'est pas installé, installation..."
        npm install -g pnpm
    fi
    
    log_success "Prérequis vérifiés"
}

# Démarrer le backend
start_backend() {
    log_info "Démarrage du backend..."
    
    cd backend
    
    # Vérifier que le fichier .env existe
    if [ ! -f ".env" ]; then
        log_warning "Fichier .env manquant, création depuis env_config.txt..."
        if [ -f "env_config.txt" ]; then
            cp env_config.txt .env
            log_warning "⚠️  IMPORTANT: Éditez backend/.env avec vos vraies clés API"
        else
            log_error "Fichier env_config.txt manquant"
            exit 1
        fi
    fi
    
    # Vérifier l'environnement virtuel
    if [ ! -d "venv" ]; then
        log_error "Environnement virtuel manquant. Exécutez d'abord: python3 -m venv venv"
        exit 1
    fi
    
    # Activer l'environnement virtuel et démarrer
    log_info "Activation de l'environnement virtuel..."
    source venv/bin/activate
    
    # Installer les dépendances si nécessaire
    if [ ! -d "venv/lib/python3.12/site-packages/fastapi" ]; then
        log_info "Installation des dépendances Python..."
        pip install -r requirements.txt
    fi
    
    # Démarrer le serveur
    log_info "Démarrage du serveur FastAPI sur le port 8000..."
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    
    # Attendre que le serveur démarre
    log_info "Attente du démarrage du backend..."
    for i in {1..30}; do
        if curl -s http://localhost:8000/api/v1/system/health > /dev/null 2>&1; then
            log_success "Backend démarré avec succès (PID: $BACKEND_PID)"
            break
        fi
        sleep 1
    done
    
    if [ $i -eq 30 ]; then
        log_error "Le backend n'a pas démarré dans les temps"
        exit 1
    fi
    
    cd ..
}

# Démarrer le frontend
start_frontend() {
    log_info "Démarrage du frontend..."
    
    cd frontend
    
    # Vérifier que le fichier .env.local existe
    if [ ! -f ".env.local" ]; then
        log_warning "Fichier .env.local manquant, création depuis env_frontend.txt..."
        if [ -f "env_frontend.txt" ]; then
            cp env_frontend.txt .env.local
        else
            log_error "Fichier env_frontend.txt manquant"
            exit 1
        fi
    fi
    
    # Installer les dépendances si nécessaire
    if [ ! -d "node_modules" ]; then
        log_info "Installation des dépendances Node.js..."
        pnpm install
    fi
    
    # Démarrer le serveur de développement
    log_info "Démarrage du serveur Next.js sur le port 3001..."
    pnpm dev &
    FRONTEND_PID=$!
    
    # Attendre que le serveur démarre
    log_info "Attente du démarrage du frontend..."
    for i in {1..30}; do
        if curl -s http://localhost:3001/ > /dev/null 2>&1; then
            log_success "Frontend démarré avec succès (PID: $FRONTEND_PID)"
            break
        fi
        sleep 1
    done
    
    if [ $i -eq 30 ]; then
        log_error "Le frontend n'a pas démarré dans les temps"
        exit 1
    fi
    
    cd ..
}

# Fonction principale
main() {
    log_info "Démarrage des services..."
    
    # Vérifier les prérequis
    check_prerequisites
    
    # Arrêter les services existants
    log_info "Arrêt des services existants..."
    pkill -f "uvicorn app.main:app" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    
    # Démarrer le backend
    start_backend
    
    # Démarrer le frontend
    start_frontend
    
    # Afficher les informations de connexion
    echo ""
    log_success "🎉 Tous les services sont démarrés !"
    echo ""
    echo "📱 Frontend: http://localhost:3001"
    echo "🔧 Backend:  http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo ""
    echo "🛑 Pour arrêter les services: pkill -f 'uvicorn\|next'"
    echo ""
    
    # Sauvegarder les PIDs
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    log_info "Services démarrés avec succès !"
}

# Exécuter la fonction principale
main "$@"
