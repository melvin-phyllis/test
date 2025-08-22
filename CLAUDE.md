# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Agent Prospecting Platform - Backend FastAPI avec intégration CrewAI pour la prospection automatisée.

## Common Commands

### Development
```bash
# Start development server
uvicorn app.main:app --reload

# Install dependencies
pip install -r requirements.txt

# Database migrations
alembic upgrade head
alembic revision --autogenerate -m "Description"

# Health check
curl http://localhost:8000/health
```

### Docker
```bash
# Build and run with Docker
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f api
```

### Testing
```bash
# Run tests
python -m pytest

# Code formatting
black app/
flake8 app/
```

## Architecture Overview

```
Backend/
├── app/
│   ├── api/v1/endpoints/    # API endpoints
│   ├── core/               # Configuration & database
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic services
│   ├── crew_integration/   # CrewAI integration
│   └── utils/             # Utilities and helpers
├── src/ai_agent_crew/     # CrewAI code integration
├── alembic/               # Database migrations
└── logs/                  # Application logs
```

### Key Components
- **FastAPI**: Modern async web framework
- **SQLAlchemy**: Async ORM with PostgreSQL/SQLite support
- **CrewAI**: Multi-agent system for prospecting
- **WebSockets**: Real-time monitoring
- **Alembic**: Database migration management

### Database Models
- `Campaign`: Prospecting campaigns
- `Prospect`: Identified prospects
- `AgentActivity`: Agent monitoring logs
- `User`: Authentication (future)

## Configuration

Required environment variables in `.env`:
```bash
OPENAI_API_KEY="your-key"
SECRET_KEY="your-secret"
DATABASE_URL="sqlite+aiosqlite:///./prospecting.db"
```

## Development Notes

- All database operations are async
- Use dependency injection for database sessions
- WebSocket connections managed by ConnectionManager
- Logging configured with loguru
- API documentation auto-generated at `/docs`