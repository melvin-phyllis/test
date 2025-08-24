#!/bin/bash

# Script d'arrêt des services AI Agent Prospecting Platform
# ========================================================

echo "🛑 Arrêt des services AI Agent Prospecting Platform..."

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

# Arrêter le backend
log_info "Arrêt du backend..."
if pkill -f "uvicorn app.main:app" 2>/dev/null; then
    log_success "Backend arrêté"
else
    log_warning "Aucun processus backend trouvé"
fi

# Arrêter le frontend
log_info "Arrêt du frontend..."
if pkill -f "next dev" 2>/dev/null; then
    log_success "Frontend arrêté"
else
    log_warning "Aucun processus frontend trouvé"
fi

# Nettoyer les fichiers PID
if [ -f ".backend.pid" ]; then
    rm .backend.pid
    log_info "Fichier PID backend supprimé"
fi

if [ -f ".frontend.pid" ]; then
    rm .frontend.pid
    log_info "Fichier PID frontend supprimé"
fi

log_success "🎉 Tous les services ont été arrêtés !"
