#!/bin/bash

# AI Agent Prospecting Platform - Setup Script
echo "🚀 AI Agent Prospecting Platform - Setup"
echo "========================================"

# Check Python version
echo "🐍 Checking Python version..."
python_version=$(python3 --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Python found: $python_version"
else
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists, if not copy from example
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env file to add your API keys:"
    echo "   - OPENAI_API_KEY=your-openai-key"
    echo "   - SERPER_API_KEY=your-serper-key (optional)"
    echo "   - SECRET_KEY=your-secret-key"
else
    echo "✅ .env file already exists"
fi

# Create logs directory
mkdir -p logs
echo "✅ Logs directory created"

# Initialize database
echo "🗄️  Initializing database..."
alembic upgrade head 2>/dev/null || echo "⚠️  Alembic migrations skipped (run manually if needed)"

# Run installation tests
echo "🧪 Running installation tests..."
python test_installation.py

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run: source venv/bin/activate"
echo "3. Run: uvicorn app.main:app --reload"
echo "4. Visit: http://localhost:8000/docs"
echo ""
echo "🔧 Development commands:"
echo "  uvicorn app.main:app --reload  # Start dev server"
echo "  python test_installation.py    # Run tests"
echo "  python -m src.ai_agent_crew.main --test-tools  # Test CrewAI tools"
echo ""
echo "🐳 Docker commands:"
echo "  docker-compose up --build      # Run with Docker"
echo "  docker-compose up -d           # Run in background"