#!/bin/bash

# AI Agent Prospecting Platform - Script de démarrage Dev (unifié)
echo "🚀 Démarrage AI Agent Prospecting Platform"
echo "========================================"

# Toujours travailler depuis la racine du projet
ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
cd "$ROOT_DIR" || exit 1

# Vérifier si un port est utilisé
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

start_backend() {
    echo "🔧 Démarrage du Backend (FastAPI)..."
    cd "$ROOT_DIR/backend" || exit 1

    if [ ! -d "venv" ]; then
        echo "❌ Environnement virtuel introuvable dans backend/venv. Lance d'abord scripts/setup_project.sh"
        exit 1
    fi

    # Active le venv
    source venv/bin/activate

    # Vérifie .env
    if [ ! -f ".env" ]; then
        echo "⚠️  backend/.env manquant. Copie depuis .env.example..."
        cp .env.example .env
        echo "📝 Édite backend/.env pour renseigner tes clés API."
        read -p "Appuie sur Entrée pour continuer..."
    fi

    echo "🌐 Backend sur http://localhost:8000"
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!

    echo "⏳ Attente du backend..."
    for i in {1..30}; do
        if check_port 8000; then
            echo "✅ Backend démarré"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            echo "❌ Échec démarrage backend"
            kill $BACKEND_PID 2>/dev/null
            exit 1
        fi
    done

    cd "$ROOT_DIR" || exit 1
}

start_frontend() {
    echo "🎨 Démarrage du Frontend (Next.js)..."
    cd "$ROOT_DIR/frontend" || exit 1

    if [ ! -d "node_modules" ]; then
        echo "📦 Installation des dépendances..."
        npm install
    fi

    echo "🌐 Frontend sur http://localhost:3000"
    npm run dev &
    FRONTEND_PID=$!

    echo "⏳ Attente du frontend..."
    for i in {1..30}; do
        if check_port 3000; then
            echo "✅ Frontend démarré"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            echo "❌ Échec démarrage frontend"
            kill $FRONTEND_PID 2>/dev/null
            exit 1
        fi
    done

    cd "$ROOT_DIR" || exit 1
}

cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend arrêté"
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend arrêté"
    fi
    echo "👋 Au revoir !"
    exit 0
}

trap cleanup SIGINT SIGTERM

if check_port 8000; then
    echo "⚠️  Le port 8000 est déjà utilisé. Libère-le ou change le port."
    exit 1
fi

if check_port 3000; then
    echo "⚠️  Le port 3000 est déjà utilisé. Libère-le ou change le port."
    exit 1
fi

start_backend
start_frontend

echo ""
echo "🎉 Services démarrés !"
echo "📱 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:8000"
echo "📚 Docs API: http://localhost:8000/docs"
echo "🔍 Health: http://localhost:8000/health"
echo ""
echo "⏳ Appuie sur Ctrl+C pour arrêter"

wait
