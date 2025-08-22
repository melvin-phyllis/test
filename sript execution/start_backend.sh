#!/bin/bash

# Script de démarrage du backend
echo "🔧 Démarrage du Backend AI Agent Prospecting Platform..."

cd backend || exit 1

echo "🔧 Correction des permissions de la base de données..."
./fix_permissions.sh

echo "📦 Activation de l'environnement virtuel..."
source venv/bin/activate

echo "🚀 Lancement du serveur FastAPI..."
echo "Backend sera disponible sur: http://127.0.0.1:8001"
echo "Documentation API: http://127.0.0.1:8001/docs"

./venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001