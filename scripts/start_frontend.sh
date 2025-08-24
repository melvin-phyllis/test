#!/bin/bash

# Script de démarrage du frontend
echo "🎨 Démarrage du Frontend AI Agent Prospecting Platform..."

cd frontend || exit 1

echo "📦 Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances pnpm..."
    pnpm install
fi

echo "🚀 Lancement du serveur de développement Next.js..."
echo "Frontend sera disponible sur: http://localhost:3000/"

pnpm dev