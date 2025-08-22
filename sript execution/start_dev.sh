#!/bin/bash

# AI Agent Prospecting Platform - Development Startup Script
echo "🚀 Starting AI Agent Prospecting Platform"
echo "========================================"

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to start backend
start_backend() {
    echo "🔧 Starting Backend (FastAPI)..."
    cd "$(dirname "$0")"
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "❌ Virtual environment not found. Please run setup_project.sh first."
        exit 1
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        echo "⚠️  .env file not found. Copying from .env.example..."
        cp .env.example .env
        echo "📝 Please edit .env file with your API keys before continuing."
        read -p "Press Enter when ready..."
    fi
    
    # Start the backend
    echo "🌐 Backend starting on http://localhost:8000"
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to start..."
    for i in {1..30}; do
        if check_port 8000; then
            echo "✅ Backend started successfully"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            echo "❌ Backend failed to start"
            kill $BACKEND_PID 2>/dev/null
            exit 1
        fi
    done
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend (React)..."
    
    # Check if frontend directory exists
    if [ ! -d "frontend" ]; then
        echo "❌ Frontend directory not found."
        exit 1
    fi
    
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    # Start the frontend
    echo "🌐 Frontend starting on http://localhost:3000"
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    echo "⏳ Waiting for frontend to start..."
    for i in {1..30}; do
        if check_port 3000; then
            echo "✅ Frontend started successfully"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            echo "❌ Frontend failed to start"
            kill $FRONTEND_PID 2>/dev/null
            exit 1
        fi
    done
    
    cd ..
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped"
    fi
    
    echo "👋 Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if ports are already in use
if check_port 8000; then
    echo "⚠️  Port 8000 is already in use. Please stop the service or change the port."
    exit 1
fi

if check_port 3000; then
    echo "⚠️  Port 3000 is already in use. Please stop the service or change the port."
    exit 1
fi

# Start services
start_backend
start_frontend

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🔍 Health Check: http://localhost:8000/health"
echo ""
echo "💡 Tips:"
echo "  - Use Ctrl+C to stop all services"
echo "  - Check logs above for any errors"
echo "  - Edit .env file to configure API keys"
echo ""
echo "⏳ Services running... Press Ctrl+C to stop"

# Wait for user to stop services
wait