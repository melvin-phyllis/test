#!/bin/bash

# Script de démarrage du frontend
echo "🎨 Démarrage du Frontend AI Agent Prospecting Platform..."

cd frontend || exit 1

echo "📦 Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances NPM..."
    npm install
fi

echo "🚀 Lancement du serveur de développement Vite..."
echo "Frontend sera disponible sur: http://localhost:3001/"

npm run dev