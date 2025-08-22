# ================================
# PROJET COMPLET - BACKEND FASTAPI + CREWAI
# ================================

# Structure complète du projet
"""
ai_agent_prospecting_backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── api.py
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── prospecting.py
│   │           ├── agents.py
│   │           ├── prospects.py
│   │           └── websocket.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── campaign.py
│   │   ├── prospect.py
│   │   ├── agent.py
│   │   └── user.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── campaign.py
│   │   ├── prospect.py
│   │   ├── agent.py
│   │   └── websocket.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── crewai_service.py
│   │   ├── monitoring_service.py
│   │   ├── websocket_manager.py
│   │   └── prospect_parser.py
│   ├── crew_integration/
│   │   ├── __init__.py
│   │   ├── enhanced_crew.py
│   │   ├── monitored_agent.py
│   │   └── task_tracker.py
│   └── utils/
│       ├── __init__.py
│       ├── logger.py
│       └── helpers.py
├── src/
│   └── ai_agent_crew/  # Votre code CrewAI existant
│       ├── __init__.py
│       ├── crew.py
│       ├── main.py
│       ├── config/
│       │   ├── agents.yaml
│       │   └── tasks.yaml
│       └── tools/
│           ├── __init__.py
│           └── custom_tool.py
├── alembic/
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
├── requirements.txt
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── README.md
"""

# ================================
# requirements.txt
# ================================
"""
# FastAPI Core
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6

# Database
sqlalchemy==2.0.23
alembic==1.13.0
psycopg2-binary==2.9.9  # For PostgreSQL
aiosqlite==0.19.0  # For SQLite async

# Pydantic
pydantic==2.5.0
pydantic-settings==2.1.0

# Background tasks & Caching
redis==5.0.1
celery==5.3.4

# CrewAI (votre système existant)
crewai[tools]>=0.141.0,<1.0.0

# WebSockets
websockets==12.0

# Utilities
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dateutil==2.8.2
httpx==0.25.2

# Monitoring & Logging
loguru==0.7.2
prometheus-client==0.19.0
"""

# ================================
# .env.example
# ================================
"""
# API Configuration
PROJECT_NAME="AI Agent Prospecting Platform"
VERSION="1.0.0"
DEBUG=true
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL="sqlite+aiosqlite:///./prospecting.db"
# DATABASE_URL="postgresql://user:password@localhost/prospecting"

# Redis
REDIS_URL="redis://localhost:6379"

# API Keys
OPENAI_API_KEY="your-openai-key"
SERPER_API_KEY="your-serper-key"

# Security
SECRET_KEY="your-super-secret-key-change-this-in-production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CrewAI Config
CREW_CONFIG_PATH="src/ai_agent_crew/config"

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8080"]
"""

# ================================
# app/__init__.py
# ================================
"""AI Agent Prospecting Platform Backend"""

# ================================
# app/main.py
# ================================
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn
import json

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import init_db
from app.services.websocket_manager import manager
from app.utils.logger import setup_logger

# Setup logging
logger = setup_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting AI Agent Prospecting Platform...")
    await init_db()
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Plateforme de prospection automatisée avec agents IA spécialisés",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# WebSocket endpoint for real-time monitoring
@app.websocket("/ws/{campaign_id}")
async def websocket_endpoint(websocket: WebSocket, campaign_id: int):
    await manager.connect(websocket, campaign_id)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, campaign_id)
        logger.info(f"Client disconnected from campaign {campaign_id}")

@app.get("/")
async def root():
    return {
        "message": "AI Agent Prospecting Platform API",
        "version": settings.VERSION,
        "docs_url": "/docs" if settings.DEBUG else None
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.VERSION}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )

# ================================
# app/core/config.py
# ================================
from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # API Configuration
    PROJECT_NAME: str = "AI Agent Prospecting Platform"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./prospecting.db"
    
    # Redis for caching and queues
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API Keys
    OPENAI_API_KEY: str
    SERPER_API_KEY: Optional[str] = None
    
    # CrewAI Config
    CREW_CONFIG_PATH: str = "src/ai_agent_crew/config"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# ================================
# app/core/database.py
# ================================
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import asyncio

from app.core.config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
Base = declarative_base()

async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        # Import all models to ensure they are registered
        from app.models import campaign, prospect, agent, user
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

async def get_db() -> AsyncSession:
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# ================================
# app/models/campaign.py
# ================================
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum

from app.core.database import Base

class CampaignStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    product_description = Column(Text, nullable=False)
    target_location = Column(String(255), default="Côte d'Ivoire")
    target_sectors = Column(JSON, default=list)
    prospect_count = Column(Integer, default=10)
    status = Column(SQLEnum(CampaignStatus), default=CampaignStatus.PENDING)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Configuration and results
    config = Column(JSON, default=dict)
    results_summary = Column(JSON, default=dict)
    
    # Relationships
    prospects = relationship("Prospect", back_populates="campaign", cascade="all, delete-orphan")
    activities = relationship("AgentActivity", back_populates="campaign", cascade="all, delete-orphan")

# ================================
# app/models/prospect.py
# ================================
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class Prospect(Base):
    __tablename__ = "prospects"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    
    # Company information
    company_name = Column(String(255), nullable=False, index=True)
    website = Column(String(500))
    description = Column(Text)
    sector = Column(String(100), index=True)
    location = Column(String(255))
    
    # Contact information
    contact_name = Column(String(255))
    contact_position = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    whatsapp = Column(String(50))
    
    # Metrics
    quality_score = Column(Float, default=0.0)
    status = Column(String(50), default="identified", index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Additional data
    metadata = Column(JSON, default=dict)
    
    # Relationships
    campaign = relationship("Campaign", back_populates="prospects")

# ================================
# app/models/agent.py
# ================================
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class AgentActivity(Base):
    __tablename__ = "agent_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    
    # Agent information
    agent_name = Column(String(100), nullable=False, index=True)
    agent_role = Column(String(100))
    
    # Task information
    task_name = Column(String(255))
    task_description = Column(Text)
    status = Column(String(50), index=True)  # started, running, completed, failed
    
    # Messages and logs
    message = Column(Text)
    error_message = Column(Text)
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Additional data
    metadata = Column(JSON, default=dict)
    
    # Relationships
    campaign = relationship("Campaign", back_populates="activities")

# ================================
# app/models/user.py
# ================================
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime

from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True)
    full_name = Column(String(255))
    
    # Authentication
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

# ================================
# app/schemas/campaign.py
# ================================
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.campaign import CampaignStatus

class CampaignBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    product_description: str = Field(..., min_length=10)
    target_location: str = Field(default="Côte d'Ivoire")
    target_sectors: List[str] = Field(default_factory=list)
    prospect_count: int = Field(default=10, ge=1, le=100)

class CampaignCreate(CampaignBase):
    config: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    product_description: Optional[str] = None
    target_location: Optional[str] = None
    target_sectors: Optional[List[str]] = None
    prospect_count: Optional[int] = None
    status: Optional[CampaignStatus] = None
    config: Optional[Dict[str, Any]] = None

class CampaignResponse(CampaignBase):
    id: int
    status: CampaignStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    results_summary: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        from_attributes = True

# Campaign statistics
class CampaignStats(BaseModel):
    total_prospects: int
    prospects_by_status: Dict[str, int]
    prospects_by_sector: Dict[str, int]
    average_quality_score: float
    completion_rate: float

# ================================
# app/schemas/prospect.py
# ================================
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

class ProspectBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    website: Optional[str] = None
    description: Optional[str] = None
    sector: Optional[str] = None
    location: Optional[str] = None
    
    contact_name: Optional[str] = None
    contact_position: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None

class ProspectCreate(ProspectBase):
    campaign_id: int
    quality_score: float = Field(default=0.0, ge=0.0, le=10.0)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class ProspectUpdate(BaseModel):
    company_name: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    sector: Optional[str] = None
    location: Optional[str] = None
    contact_name: Optional[str] = None
    contact_position: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    quality_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    status: Optional[str] = None

class ProspectResponse(ProspectBase):
    id: int
    campaign_id: int
    quality_score: float
    status: str
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]
    
    class Config:
        from_attributes = True

# ================================
# app/schemas/agent.py
# ================================
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class AgentActivityCreate(BaseModel):
    campaign_id: int
    agent_name: str
    agent_role: Optional[str] = None
    task_name: Optional[str] = None
    task_description: Optional[str] = None
    status: str
    message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AgentActivityResponse(BaseModel):
    id: int
    campaign_id: int
    agent_name: str
    agent_role: Optional[str]
    task_name: Optional[str]
    task_description: Optional[str]
    status: str
    message: Optional[str]
    error_message: Optional[str]
    started_at: datetime
    completed_at: Optional[datetime]
    metadata: Dict[str, Any]
    
    class Config:
        from_attributes = True

# Real-time agent status
class AgentStatus(BaseModel):
    agent_name: str
    status: str  # idle, working, completed, error
    current_task: Optional[str] = None
    progress: float = Field(default=0.0, ge=0.0, le=100.0)
    last_activity: datetime

# ================================
# app/schemas/websocket.py
# ================================
from pydantic import BaseModel
from typing import Any, Optional, Dict
from datetime import datetime

class WebSocketMessage(BaseModel):
    type: str  # agent_activity, campaign_status, error, etc.
    campaign_id: int
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AgentActivityMessage(BaseModel):
    type: str = "agent_activity"
    campaign_id: int
    agent_name: str
    status: str
    task_name: Optional[str] = None
    message: Optional[str] = None
    progress: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CampaignStatusMessage(BaseModel):
    type: str = "campaign_status"
    campaign_id: int
    status: str
    message: str
    progress: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# ================================
# app/services/websocket_manager.py
# ================================
from fastapi import WebSocket
from typing import List, Dict
import json
import asyncio
from datetime import datetime

from app.schemas.websocket import WebSocketMessage
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class ConnectionManager:
    def __init__(self):
        # Active connections by campaign_id
        self.campaign_connections: Dict[int, List[WebSocket]] = {}
        # All active connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, campaign_id: Optional[int] = None):
        """Connect a client to WebSocket"""
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if campaign_id:
            if campaign_id not in self.campaign_connections:
                self.campaign_connections[campaign_id] = []
            self.campaign_connections[campaign_id].append(websocket)
            logger.info(f"Client connected to campaign {campaign_id}")

    def disconnect(self, websocket: WebSocket, campaign_id: Optional[int] = None):
        """Disconnect a client from WebSocket"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if campaign_id and campaign_id in self.campaign_connections:
            if websocket in self.campaign_connections[campaign_id]:
                self.campaign_connections[campaign_id].remove(websocket)
                
            # Remove empty campaign connection lists
            if not self.campaign_connections[campaign_id]:
                del self.campaign_connections[campaign_id]
                
        logger.info(f"Client disconnected from campaign {campaign_id}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send message to specific client"""
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error marking campaign {campaign_id} as failed: {str(e)}")
    
    async def _process_campaign_results(self, campaign_id: int, result: Any):
        """Process and save campaign results"""
        try:
            # Parse prospects from the result
            prospects_data = await self.prospect_parser.parse_crewai_result(result)
            
            async with AsyncSessionLocal() as db:
                saved_prospects = []
                
                for prospect_data in prospects_data:
                    prospect = Prospect(
                        campaign_id=campaign_id,
                        **prospect_data
                    )
                    db.add(prospect)
                    saved_prospects.append(prospect)
                
                await db.commit()
                
                # Update campaign results summary
                await db.execute(
                    update(Campaign)
                    .where(Campaign.id == campaign_id)
                    .values(
                        results_summary={
                            "prospects_found": len(saved_prospects),
                            "processing_completed": True,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                    )
                )
                await db.commit()
                
                logger.info(f"Processed {len(saved_prospects)} prospects for campaign {campaign_id}")
                
        except Exception as e:
            logger.error(f"Error processing results for campaign {campaign_id}: {str(e)}")
    
    async def stop_campaign(self, campaign_id: int) -> Dict[str, Any]:
        """Stop a running campaign"""
        try:
            if campaign_id not in self.running_campaigns:
                return {
                    "campaign_id": campaign_id,
                    "status": "not_running",
                    "message": "Campaign is not currently running"
                }
            
            # Remove from running campaigns
            del self.running_campaigns[campaign_id]
            
            # Update database status
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(Campaign)
                    .where(Campaign.id == campaign_id)
                    .values(
                        status=CampaignStatus.CANCELLED,
                        completed_at=datetime.utcnow()
                    )
                )
                await db.commit()
            
            # Notify via WebSocket
            await manager.broadcast_to_campaign(campaign_id, {
                "type": "campaign_status",
                "campaign_id": campaign_id,
                "status": "cancelled",
                "message": "Campaign was cancelled",
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return {
                "campaign_id": campaign_id,
                "status": "cancelled",
                "message": "Campaign stopped successfully"
            }
            
        except Exception as e:
            logger.error(f"Error stopping campaign {campaign_id}: {str(e)}")
            raise
    
    async def get_campaign_status(self, campaign_id: int) -> Dict[str, Any]:
        """Get current status of a campaign"""
        try:
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(Campaign).where(Campaign.id == campaign_id)
                )
                campaign = result.scalar_one_or_none()
                
                if not campaign:
                    return {"status": "not_found", "campaign_id": campaign_id}
                
                is_running = campaign_id in self.running_campaigns
                
                return {
                    "campaign_id": campaign_id,
                    "status": campaign.status.value,
                    "is_running": is_running,
                    "created_at": campaign.created_at.isoformat() if campaign.created_at else None,
                    "started_at": campaign.started_at.isoformat() if campaign.started_at else None,
                    "completed_at": campaign.completed_at.isoformat() if campaign.completed_at else None,
                    "results_summary": campaign.results_summary or {}
                }
                
        except Exception as e:
            logger.error(f"Error getting status for campaign {campaign_id}: {str(e)}")
            raise

# Global service instance
crewai_service = CrewAIService()

# ================================
# app/services/prospect_parser.py
# ================================
import re
from typing import Dict, Any, List
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class ProspectParser:
    """Parse prospects from CrewAI output"""
    
    async def parse_crewai_result(self, result: Any) -> List[Dict[str, Any]]:
        """Parse CrewAI result and extract prospect information"""
        try:
            # Convert result to string if needed
            result_text = str(result) if not isinstance(result, str) else result
            
            # Extract prospect information using regex patterns
            prospects = self._extract_prospects_from_text(result_text)
            
            return prospects
            
        except Exception as e:
            logger.error(f"Error parsing CrewAI result: {str(e)}")
            return []
    
    def _extract_prospects_from_text(self, text: str) -> List[Dict[str, Any]]:
        """Extract prospect data from text using regex patterns"""
        prospects = []
        
        # Pattern to match prospect information
        # This pattern is based on your existing output format
        prospect_pattern = r'## 2\. Liste (?:ComplÃ¨te des? )?Prospects? IdentifiÃ©s?\s*\n(.*?)(?=\n## 3\.|$)'
        
        match = re.search(prospect_pattern, text, re.DOTALL)
        if match:
            prospect_text = match.group(1).strip()
            prospect_data = self._parse_single_prospect(prospect_text)
            if prospect_data:
                prospects.append(prospect_data)
        
        return prospects
    
    def _parse_single_prospect(self, text: str) -> Dict[str, Any]:
        """Parse individual prospect data"""
        prospect = {}
        
        # Extract company name
        name_match = re.search(r'Nom de l\'entreprise[:\s]*([^\n]+)', text, re.IGNORECASE)
        if name_match:
            prospect['company_name'] = name_match.group(1).strip()
        
        # Extract website
        website_match = re.search(r'Site web[:\s]*([^\n]+)', text, re.IGNORECASE)
        if website_match:
            website = website_match.group(1).strip()
            if website != "Non trouvé":
                prospect['website'] = website
        
        # Extract description
        desc_match = re.search(r'Description[:\s]*([^\n]+)', text, re.IGNORECASE)
        if desc_match:
            prospect['description'] = desc_match.group(1).strip()
        
        # Extract contact name and position
        contact_match = re.search(r'contact clé[:\s]*([^\n]+)', text, re.IGNORECASE)
        if contact_match:
            contact_info = contact_match.group(1).strip()
            if contact_info != "Non trouvé":
                # Try to split name and position
                if ',' in contact_info:
                    parts = contact_info.split(',', 1)
                    prospect['contact_name'] = parts[0].strip()
                    prospect['contact_position'] = parts[1].strip()
                else:
                    prospect['contact_name'] = contact_info
        
        # Extract email
        email_match = re.search(r'e-mail[:\s]*([^\n]+)', text, re.IGNORECASE)
        if email_match:
            email = email_match.group(1).strip()
            if email != "Non trouvé" and '@' in email:
                prospect['email'] = email
        
        # Extract phone
        phone_match = re.search(r'téléphone[:\s]*([^\n]+)', text, re.IGNORECASE)
        if phone_match:
            phone = phone_match.group(1).strip()
            if phone != "Non trouvé":
                prospect['phone'] = phone
        
        # Extract WhatsApp
        whatsapp_match = re.search(r'WhatsApp[:\s]*([^\n]+)', text, re.IGNORECASE)
        if whatsapp_match:
            whatsapp = whatsapp_match.group(1).strip()
            if whatsapp != "Non trouvé":
                prospect['whatsapp'] = whatsapp
        
        # Set default values
        prospect['location'] = prospect.get('location', 'Côte d\'Ivoire')
        prospect['quality_score'] = 5.0  # Default score
        prospect['status'] = 'identified'
        
        return prospect if prospect.get('company_name') else {}

# ================================
# app/crew_integration/enhanced_crew.py
# ================================
from crewai import Agent, Crew, Process, Task
from typing import Dict, Any, List
import asyncio
from datetime import datetime
import sys
import os

# Add the src directory to the path to import your existing CrewAI code
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from app.services.websocket_manager import manager
from app.models.agent import AgentActivity
from app.core.database import AsyncSessionLocal
from app.utils.logger import setup_logger
from src.ai_agent_crew.crew import AiAgentCrew

logger = setup_logger(__name__)

class MonitoredAgent(Agent):
    """Enhanced Agent with monitoring capabilities"""
    
    def __init__(self, campaign_id: int, original_agent: Agent, *args, **kwargs):
        # Initialize with original agent properties
        super().__init__(
            role=original_agent.role,
            goal=original_agent.goal,
            backstory=original_agent.backstory,
            tools=original_agent.tools or [],
            verbose=original_agent.verbose,
            *args,
            **kwargs
        )
        
        self.campaign_id = campaign_id
        self.original_agent = original_agent
        self.current_task = None

    async def _log_activity(self, status: str, message: str, task_name: str = None):
        """Log agent activity to database and WebSocket"""
        try:
            # Save to database
            async with AsyncSessionLocal() as db:
                activity = AgentActivity(
                    campaign_id=self.campaign_id,
                    agent_name=self.role,
                    agent_role=self.role,
                    task_name=task_name,
                    status=status,
                    message=message,
                    started_at=datetime.utcnow() if status == "started" else None,
                    completed_at=datetime.utcnow() if status in ["completed", "failed"] else None
                )
                db.add(activity)
                await db.commit()
            
            # Broadcast via WebSocket
            await manager.broadcast_to_campaign(
                self.campaign_id,
                {
                    "type": "agent_activity",
                    "campaign_id": self.campaign_id,
                    "agent_name": self.role,
                    "status": status,
                    "task_name": task_name,
                    "message": message,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Error logging activity for agent {self.role}: {str(e)}")

class EnhancedCrewAI:
    """Enhanced CrewAI with monitoring capabilities"""
    
    def __init__(self, campaign_id: int):
        self.campaign_id = campaign_id
        logger.info(f"Initializing Enhanced CrewAI for campaign {campaign_id}")
        
    async def run_campaign(self, inputs: Dict[str, Any]) -> Any:
        """Run the prospecting campaign with monitoring"""
        try:
            logger.info(f"Starting campaign {self.campaign_id} with inputs: {inputs}")
            
            # Broadcast campaign start
            await manager.broadcast_to_campaign(
                self.campaign_id,
                {
                    "type": "campaign_status",
                    "campaign_id": self.campaign_id,
                    "status": "initializing",
                    "message": "Initializing agents and tasks...",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
            # Create original crew instance
            original_crew_instance = AiAgentCrew()
            original_crew = original_crew_instance.crew()
            
            logger.info(f"Original crew created with {len(original_crew.agents)} agents")
            
            # Create monitored agents
            monitored_agents = []
            for agent in original_crew.agents:
                monitored_agent = MonitoredAgent(self.campaign_id, agent)
                monitored_agents.append(monitored_agent)
                
                await monitored_agent._log_activity(
                    "initialized", 
                    f"Agent {agent.role} initialized and ready",
                    "initialization"
                )
            
            # Create monitored crew
            monitored_crew = Crew(
                agents=monitored_agents,
                tasks=original_crew.tasks,
                process=Process.sequential,
                verbose=True
            )
            
            # Broadcast execution start
            await manager.broadcast_to_campaign(
                self.campaign_id,
                {
                    "type": "campaign_status",
                    "campaign_id": self.campaign_id,
                    "status": "running",
                    "message": "Executing prospecting tasks...",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
            # Execute crew in thread pool to avoid blocking
            result = await asyncio.get_event_loop().run_in_executor(
                None, monitored_crew.kickoff, inputs
            )
            
            logger.info(f"Campaign {self.campaign_id} execution completed")
            
            # Broadcast completion
            await manager.broadcast_to_campaign(
                self.campaign_id,
                {
                    "type": "campaign_status",
                    "campaign_id": self.campaign_id,
                    "status": "processing_results",
                    "message": "Processing and saving results...",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error in campaign {self.campaign_id}: {str(e)}")
            
            # Broadcast error
            await manager.broadcast_to_campaign(
                self.campaign_id,
                {
                    "type": "campaign_status",
                    "campaign_id": self.campaign_id,
                    "status": "error",
                    "message": f"Campaign failed: {str(e)}",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
            raise

# ================================
# app/api/v1/api.py
# ================================
from fastapi import APIRouter

from app.api.v1.endpoints import prospecting, agents, prospects, websocket

api_router = APIRouter()

api_router.include_router(
    prospecting.router, 
    prefix="/prospecting", 
    tags=["prospecting"]
)

api_router.include_router(
    agents.router, 
    prefix="/agents", 
    tags=["agents"]
)

api_router.include_router(
    prospects.router, 
    prefix="/prospects", 
    tags=["prospects"]
)

api_router.include_router(
    websocket.router, 
    prefix="/ws", 
    tags=["websocket"]
)

# ================================
# app/api/v1/endpoints/prospects.py
# ================================
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List, Optional

from app.core.database import get_db
from app.schemas.prospect import ProspectResponse, ProspectUpdate
from app.models.prospect import Prospect
from app.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)

@router.get("/", response_model=List[ProspectResponse])
async def list_prospects(
    campaign_id: Optional[int] = Query(None),
    sector: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List prospects with optional filtering"""
    try:
        query = select(Prospect).offset(skip).limit(limit)
        
        if campaign_id:
            query = query.where(Prospect.campaign_id == campaign_id)
        if sector:
            query = query.where(Prospect.sector == sector)
        if status:
            query = query.where(Prospect.status == status)
            
        query = query.order_by(Prospect.created_at.desc())
        
        result = await db.execute(query)
        prospects = result.scalars().all()
        
        return prospects
        
    except Exception as e:
        logger.error(f"Error listing prospects: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{prospect_id}", response_model=ProspectResponse)
async def get_prospect(
    prospect_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific prospect"""
    try:
        result = await db.execute(
            select(Prospect).where(Prospect.id == prospect_id)
        )
        prospect = result.scalar_one_or_none()
        
        if not prospect:
            raise HTTPException(status_code=404, detail="Prospect not found")
            
        return prospect
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting prospect {prospect_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{prospect_id}", response_model=ProspectResponse)
async def update_prospect(
    prospect_id: int,
    prospect_update: ProspectUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a prospect"""
    try:
        result = await db.execute(
            select(Prospect).where(Prospect.id == prospect_id)
        )
        prospect = result.scalar_one_or_none()
        
        if not prospect:
            raise HTTPException(status_code=404, detail="Prospect not found")
        
        # Update fields
        update_data = prospect_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(prospect, field, value)
        
        await db.commit()
        await db.refresh(prospect)
        
        logger.info(f"Updated prospect {prospect_id}")
        return prospect
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating prospect {prospect_id}: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{prospect_id}")
async def delete_prospect(
    prospect_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a prospect"""
    try:
        result = await db.execute(
            select(Prospect).where(Prospect.id == prospect_id)
        )
        prospect = result.scalar_one_or_none()
        
        if not prospect:
            raise HTTPException(status_code=404, detail="Prospect not found")
        
        await db.execute(
            delete(Prospect).where(Prospect.id == prospect_id)
        )
        await db.commit()
        
        logger.info(f"Deleted prospect {prospect_id}")
        return {"message": "Prospect deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting prospect {prospect_id}: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ================================
# app/api/v1/endpoints/agents.py
# ================================
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.core.database import get_db
from app.schemas.agent import AgentActivityResponse, AgentStatus
from app.models.agent import AgentActivity
from app.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)

@router.get("/activity", response_model=List[AgentActivityResponse])
async def get_agent_activity(
    campaign_id: Optional[int] = Query(None),
    agent_name: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get agent activity logs"""
    try:
        query = select(AgentActivity).offset(skip).limit(limit)
        
        if campaign_id:
            query = query.where(AgentActivity.campaign_id == campaign_id)
        if agent_name:
            query = query.where(AgentActivity.agent_name == agent_name)
        if status:
            query = query.where(AgentActivity.status == status)
            
        query = query.order_by(AgentActivity.started_at.desc())
        
        result = await db.execute(query)
        activities = result.scalars().all()
        
        return activities
        
    except Exception as e:
        logger.error(f"Error getting agent activity: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status", response_model=List[AgentStatus])
async def get_agents_status(
    campaign_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get current status of all agents"""
    try:
        # Get latest activity for each agent
        subquery = (
            select(
                AgentActivity.agent_name,
                func.max(AgentActivity.started_at).label('latest_activity')
            )
            .group_by(AgentActivity.agent_name)
        )
        
        if campaign_id:
            subquery = subquery.where(AgentActivity.campaign_id == campaign_id)
            
        subquery = subquery.subquery()
        
        # Get full activity records for latest activities
        query = (
            select(AgentActivity)
            .join(
                subquery,
                (AgentActivity.agent_name == subquery.c.agent_name) &
                (AgentActivity.started_at == subquery.c.latest_activity)
            )
        )
        
        if campaign_id:
            query = query.where(AgentActivity.campaign_id == campaign_id)
            
        result = await db.execute(query)
        latest_activities = result.scalars().all()
        
        # Convert to AgentStatus format
        agent_statuses = []
        for activity in latest_activities:
            # Determine current status
            current_status = "idle"
            if activity.status == "started" or activity.status == "running":
                current_status = "working"
            elif activity.status == "completed":
                current_status = "completed"
            elif activity.status == "failed":
                current_status = "error"
                
            agent_status = AgentStatus(
                agent_name=activity.agent_name,
                status=current_status,
                current_task=activity.task_name,
                progress=100.0 if activity.status == "completed" else 
                        0.0 if activity.status == "failed" else 50.0,
                last_activity=activity.started_at
            )
            agent_statuses.append(agent_status)
        
        return agent_statuses
        
    except Exception as e:
        logger.error(f"Error getting agents status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_agent_stats(
    campaign_id: Optional[int] = Query(None),
    hours: int = Query(24, ge=1, le=168),  # Last N hours, max 1 week
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Get agent statistics"""
    try:
        since = datetime.utcnow() - timedelta(hours=hours)
        
        query = select(AgentActivity).where(AgentActivity.started_at >= since)
        
        if campaign_id:
            query = query.where(AgentActivity.campaign_id == campaign_id)
            
        result = await db.execute(query)
        activities = result.scalars().all()
        
        # Calculate statistics
        stats = {
            "total_activities": len(activities),
            "activities_by_agent": {},
            "activities_by_status": {},
            "average_task_duration": 0.0,
            "success_rate": 0.0
        }
        
        # Group by agent
        for activity in activities:
            agent_name = activity.agent_name
            if agent_name not in stats["activities_by_agent"]:
                stats["activities_by_agent"][agent_name] = 0
            stats["activities_by_agent"][agent_name] += 1
            
            # Group by status
            status = activity.status
            if status not in stats["activities_by_status"]:
                stats["activities_by_status"][status] = 0
            stats["activities_by_status"][status] += 1
        
        # Calculate success rate
        completed = stats["activities_by_status"].get("completed", 0)
        failed = stats["activities_by_status"].get("failed", 0)
        total_finished = completed + failed
        
        if total_finished > 0:
            stats["success_rate"] = (completed / total_finished) * 100
        
        # Calculate average duration for completed tasks
        completed_activities = [a for a in activities 
                             if a.status == "completed" and a.completed_at]
        if completed_activities:
            total_duration = sum(
                (a.completed_at - a.started_at).total_seconds() 
                for a in completed_activities
            )
            stats["average_task_duration"] = total_duration / len(completed_activities)
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting agent stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ================================
# app/api/v1/endpoints/websocket.py
# ================================
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, Any
import json

from app.services.websocket_manager import manager
from app.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)

@router.websocket("/campaign/{campaign_id}")
async def websocket_campaign_endpoint(websocket: WebSocket, campaign_id: int):
    """WebSocket endpoint for campaign monitoring"""
    await manager.connect(websocket, campaign_id)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                })
            elif message.get("type") == "subscribe":
                # Handle subscription to specific events
                await websocket.send_json({
                    "type": "subscribed",
                    "campaign_id": campaign_id,
                    "message": f"Subscribed to campaign {campaign_id} updates"
                })
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, campaign_id)
        logger.info(f"Client disconnected from campaign {campaign_id}")
    except Exception as e:
        logger.error(f"WebSocket error for campaign {campaign_id}: {str(e)}")
        manager.disconnect(websocket, campaign_id)

@router.get("/connections")
async def get_connection_stats():
    """Get WebSocket connection statistics"""
    return {
        "total_connections": manager.get_total_connection_count(),
        "campaign_connections": {
            campaign_id: len(connections) 
            for campaign_id, connections in manager.campaign_connections.items()
        }
    }

# ================================
# app/utils/logger.py
# ================================
from loguru import logger
import sys
from app.core.config import settings

def setup_logger(name: str):
    """Setup logger with consistent configuration"""
    
    # Remove default handler
    logger.remove()
    
    # Add console handler
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level}</level> | <cyan>{name}</cyan> | {message}",
        level="DEBUG" if settings.DEBUG else "INFO",
        colorize=True
    )
    
    # Add file handler
    logger.add(
        "logs/app.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name} | {message}",
        level="INFO",
        rotation="10 MB",
        retention="7 days"
    )
    
    return logger.bind(name=name)

# ================================
# app/utils/helpers.py
# ================================
from typing import Any, Dict, Optional
import hashlib
import json
from datetime import datetime

def generate_hash(data: str) -> str:
    """Generate MD5 hash from string"""
    return hashlib.md5(data.encode()).hexdigest()

def serialize_datetime(obj: Any) -> Any:
    """JSON serializer for datetime objects"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

def safe_get(dictionary: Dict, key: str, default: Any = None) -> Any:
    """Safely get value from dictionary"""
    return dictionary.get(key, default)

def truncate_string(text: str, max_length: int = 100) -> str:
    """Truncate string to max length"""
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."

# ================================
# docker-compose.yml
# ================================
"""
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/prospecting
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SERPER_API_KEY=${SERPER_API_KEY}
    depends_on:
      - db
      - redis
    volumes:
      - ./src:/app/src  # Mount your existing CrewAI code
      - ./logs:/app/logs
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=prospecting
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
"""

# ================================
# Dockerfile
# ================================
"""
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \\
    && apt-get install -y --no-install-recommends \\
        gcc \\
        g++ \\
        libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
"""

# ================================
# alembic.ini
# ================================
"""
[alembic]
script_location = alembic
prepend_sys_path = .
version_path_separator = os
sqlalchemy.url = sqlite:///./prospecting.db

[post_write_hooks]

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
"""

# ================================
# alembic/env.py
# ================================
"""
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.config import settings
from app.core.database import Base
from app.models import campaign, prospect, agent, user

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = settings.DATABASE_URL
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
"""

# ================================
# README.md
# ================================
"""
# AI Agent Prospecting Platform - Backend

Plateforme de prospection automatisée utilisant des agents IA spécialisés avec FastAPI et CrewAI.

## Fonctionnalités

- 🤖 **Agents IA Spécialisés**: Market Researcher, Prospecting Specialist, Content Writer
- 📊 **Monitoring Temps Réel**: WebSockets pour suivre l'activité des agents
- 🎯 **Gestion de Campagnes**: Création, lancement et suivi de campagnes
- 📈 **Métriques & Analytics**: Statistiques détaillées sur les performances
- 🔍 **Gestion des Prospects**: CRUD complet avec filtrage et recherche
- 🚀 **API REST Moderne**: Documentation OpenAPI intégrée

## Installation

### Prérequis
- Python 3.11+
- PostgreSQL (optionnel, SQLite par défaut)
- Redis (optionnel pour les fonctionnalités avancées)

### Installation locale

1. **Cloner le projet**
```bash
git clone <repo-url>
cd ai-agent-prospecting-backend
```

2. **Créer l'environnement virtuel**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\\Scripts\\activate  # Windows
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Configuration**
```bash
cp .env.example .env
# Éditer le fichier .env avec vos clés API
```

5. **Initialiser la base de données**
```bash
alembic upgrade head
```

6. **Lancer l'application**
```bash
uvicorn app.main:app --reload
```

### Installation avec Docker

```bash
# Construire et lancer
docker-compose up --build

# En arrière-plan
docker-compose up -d
```

## Configuration

### Variables d'environnement (.env)

```bash
# API
PROJECT_NAME="AI Agent Prospecting Platform"
DEBUG=true

# Base de données
DATABASE_URL="sqlite+aiosqlite:///./prospecting.db"
# DATABASE_URL="postgresql://user:password@localhost/prospecting"

# API Keys (obligatoires)
OPENAI_API_KEY="your-openai-key"
SERPER_API_KEY="your-serper-key"

# Sécurité
SECRET_KEY="your-super-secret-key"
```

## Utilisation

### 1. Créer une campagne

```bash
curl -X POST "http://localhost:8000/api/v1/prospecting/campaigns" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Ma première campagne",
    "product_description": "Solution IA pour PME",
    "target_location": "Côte d\\'Ivoire",
    "prospect_count": 5
  }'
```

### 2. Lancer la campagne

```bash
curl -X POST "http://localhost:8000/api/v1/prospecting/campaigns/1/start"
```

### 3. Suivre en temps réel

Connectez-vous au WebSocket: `ws://localhost:8000/ws/1` (ID campagne)

### 4. Consulter les résultats

```bash
# Liste des prospects
curl "http://localhost:8000/api/v1/prospects/?campaign_id=1"

# Statistiques
curl "http://localhost:8000/api/v1/prospecting/campaigns/1/stats"
```

## API Endpoints

### Campagnes
- `GET /api/v1/prospecting/campaigns` - Lister les campagnes
- `POST /api/v1/prospecting/campaigns` - Créer une campagne
- `GET /api/v1/prospecting/campaigns/{id}` - Détails d'une campagne
- `PUT /api/v1/prospecting/campaigns/{id}` - Modifier une campagne
- `POST /api/v1/prospecting/campaigns/{id}/start` - Lancer une campagne
- `POST /api/v1/prospecting/campaigns/{id}/stop` - Arrêter une campagne
- `GET /api/v1/prospecting/campaigns/{id}/status` - Statut d'une campagne
- `GET /api/v1/prospecting/campaigns/{id}/stats` - Statistiques

### Prospects
- `GET /api/v1/prospects/` - Lister les prospects
- `GET /api/v1/prospects/{id}` - Détails d'un prospect
- `PUT /api/v1/prospects/{id}` - Modifier un prospect
- `DELETE /api/v1/prospects/{id}` - Supprimer un prospect

### Agents
- `GET /api/v1/agents/activity` - Activité des agents
- `GET /api/v1/agents/status` - Statut actuel des agents
- `GET /api/v1/agents/stats` - Statistiques des agents

### WebSockets
- `WS /ws/{campaign_id}` - Monitoring temps réel

## Architecture

```
Backend/
├── app/
│   ├── api/          # Endpoints API
│   ├── core/         # Configuration & DB
│   ├── models/       # Modèles SQLAlchemy
│   ├── schemas/      # Schémas Pydantic
│   ├── services/     # Services métier
│   ├── crew_integration/  # Intégration CrewAI
│   └── utils/        # Utilitaires
├── src/              # Votre code CrewAI existant
├── alembic/          # Migrations DB
└── logs/             # Logs applicatifs
```

## Monitoring WebSocket

Messages en temps réel:

```json
{
  "type": "agent_activity",
  "campaign_id": 1,
  "agent_name": "market_researcher",
  "status": "started",
  "task_name": "Recherche PME",
  "message": "Début de recherche...",
  "timestamp": "2025-08-21T10:30:00Z"
}
```

## Déploiement

### Production avec Docker

```bash
# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Variables d'environnement production

```bash
DEBUG=false
DATABASE_URL="postgresql://user:password@prod-db/prospecting"
SECRET_KEY="strong-production-key"
```

## Développement

### Structure des tâches

```bash
# Tests
python -m pytest

# Linting
black app/
flake8 app/

# Migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

### Ajouter de nouveaux endpoints

1. Créer le schéma Pydantic dans `schemas/`
2. Ajouter l'endpoint dans `api/v1/endpoints/`
3. Inclure le router dans `api/v1/api.py`

## Support

Pour toute question ou problème:

1. Consultez la documentation: http://localhost:8000/docs
2. Vérifiez les logs: `tail -f logs/app.log`
3. Testez avec: `curl http://localhost:8000/health`

---

**Made with ❤️ by Thierry - AI Engineer in Abidjan, Côte d'Ivoire**
"""

# ================================
# Installation et utilisation rapide
# ================================

"""
GUIDE D'INSTALLATION RAPIDE:

1. Créer la structure:
mkdir ai_agent_prospecting_backend
cd ai_agent_prospecting_backend

2. Copier votre code CrewAI existant dans src/:
cp -r /path/to/your/crewai/code src/

3. Créer la structure backend:
mkdir -p app/{api/v1/endpoints,core,models,schemas,services,crew_integration,utils}
mkdir -p alembic/versions
mkdir logs

4. Copier tous les fichiers depuis cet artifact dans les bons dossiers

5. Installer:
pip install -r requirements.txt

6. Configurer:
cp .env.example .env
# Éditer .env avec vos clés

7. Lancer:
uvicorn app.main:app --reload

8. Tester:
curl http://localhost:8000/health

9. Documentation:
http://localhost:8000/docs

C'est parti! 🚀
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from app.core.database import get_db
from app.schemas.campaign import (
    CampaignCreate, CampaignUpdate, CampaignResponse, CampaignStats
)
from app.models.campaign import Campaign, CampaignStatus
from app.models.prospect import Prospect
from app.services.crewai_service import crewai_service
from app.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)

@router.post("/campaigns", response_model=CampaignResponse)
async def create_campaign(
    campaign: CampaignCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new prospecting campaign"""
    try:
        db_campaign = Campaign(**campaign.dict())
        db.add(db_campaign)
        await db.commit()
        await db.refresh(db_campaign)
        
        logger.info(f"Created campaign {db_campaign.id}: {db_campaign.name}")
        return db_campaign
        
    except Exception as e:
        logger.error(f"Error creating campaign: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns", response_model=List[CampaignResponse])
async def list_campaigns(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[CampaignStatus] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all campaigns with optional filtering"""
    try:
        query = select(Campaign).offset(skip).limit(limit)
        
        if status:
            query = query.where(Campaign.status == status)
            
        query = query.order_by(Campaign.created_at.desc())
        
        result = await db.execute(query)
        campaigns = result.scalars().all()
        
        return campaigns
        
    except Exception as e:
        logger.error(f"Error listing campaigns: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific campaign"""
    try:
        result = await db.execute(
            select(Campaign).where(Campaign.id == campaign_id)
        )
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
            
        return campaign
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting campaign {campaign_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: int,
    campaign_update: CampaignUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a campaign"""
    try:
        result = await db.execute(
            select(Campaign).where(Campaign.id == campaign_id)
        )
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Update fields
        update_data = campaign_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(campaign, field, value)
        
        await db.commit()
        await db.refresh(campaign)
        
        logger.info(f"Updated campaign {campaign_id}")
        return campaign
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating campaign {campaign_id}: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/campaigns/{campaign_id}/start")
async def start_campaign(
    campaign_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Start a prospecting campaign"""
    try:
        # Check if campaign exists
        result = await db.execute(
            select(Campaign).where(Campaign.id == campaign_id)
        )
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        if campaign.status == CampaignStatus.RUNNING:
            raise HTTPException(status_code=400, detail="Campaign is already running")
        
        # Start the campaign
        result = await crewai_service.start_campaign(campaign_id)
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting campaign {campaign_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/campaigns/{campaign_id}/stop")
async def stop_campaign(campaign_id: int):
    """Stop a running campaign"""
    try:
        result = await crewai_service.stop_campaign(campaign_id)
        return result
        
    except Exception as e:
        logger.error(f"Error stopping campaign {campaign_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns/{campaign_id}/status")
async def get_campaign_status(campaign_id: int):
    """Get campaign status and progress"""
    try:
        result = await crewai_service.get_campaign_status(campaign_id)
        return result
        
    except Exception as e:
        logger.error(f"Error getting status for campaign {campaign_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns/{campaign_id}/stats", response_model=CampaignStats)
async def get_campaign_stats(
    campaign_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get campaign statistics"""
    try:
        # Check if campaign exists
        result = await db.execute(
            select(Campaign).where(Campaign.id == campaign_id)
        )
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Get prospect statistics
        total_prospects_result = await db.execute(
            select(func.count(Prospect.id)).where(Prospect.campaign_id == campaign_id)
        )
        total_prospects = total_prospects_result.scalar() or 0
        
        # Get prospects by status
        status_result = await db.execute(
            select(Prospect.status, func.count(Prospect.id))
            .where(Prospect.campaign_id == campaign_id)
            .group_by(Prospect.status)
        )
        prospects_by_status = dict(status_result.all())
        
        # Get prospects by sector
        sector_result = await db.execute(
            select(Prospect.sector, func.count(Prospect.id))
            .where(Prospect.campaign_id == campaign_id)
            .group_by(Prospect.sector)
        )
        prospects_by_sector = dict(sector_result.all())
        
        # Get average quality score
        score_result = await db.execute(
            select(func.avg(Prospect.quality_score)).where(Prospect.campaign_id == campaign_id)
        )
        avg_quality_score = score_result.scalar() or 0.0
        
        # Calculate completion rate
        completion_rate = 0.0
        if campaign.prospect_count > 0:
            completion_rate = (total_prospects / campaign.prospect_count) * 100
        
        return CampaignStats(
            total_prospects=total_prospects,
            prospects_by_status=prospects_by_status,
            prospects_by_sector=prospects_by_sector,
            average_quality_score=float(avg_quality_score),
            completion_rate=min(completion_rate, 100.0)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting stats for campaign {campaign_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)).error(f"Error sending message: {e}")
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)

    async def send_json_message(self, message: dict, websocket: WebSocket):
        """Send JSON message to specific client"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending JSON message: {e}")
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        if not self.active_connections:
            return
            
        # Send to all connections
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            if connection in self.active_connections:
                self.active_connections.remove(connection)

    async def broadcast_to_campaign(self, campaign_id: int, message: dict):
        """Broadcast message to all clients connected to specific campaign"""
        if campaign_id not in self.campaign_connections:
            return
            
        connections = self.campaign_connections[campaign_id].copy()
        disconnected = []
        
        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to campaign {campaign_id}: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection, campaign_id)

    def get_campaign_connection_count(self, campaign_id: int) -> int:
        """Get number of active connections for a campaign"""
        return len(self.campaign_connections.get(campaign_id, []))

    def get_total_connection_count(self) -> int:
        """Get total number of active connections"""
        return len(self.active_connections)

# Global instance
manager = ConnectionManager()

# ================================
# app/services/crewai_service.py
# ================================
from typing import Dict, Any, Optional
import asyncio
from datetime import datetime
import traceback

from app.crew_integration.enhanced_crew import EnhancedCrewAI
from app.models.campaign import Campaign, CampaignStatus
from app.models.prospect import Prospect
from app.models.agent import AgentActivity
from app.services.websocket_manager import manager
from app.services.prospect_parser import ProspectParser
from app.core.database import AsyncSessionLocal
from app.utils.logger import setup_logger
from sqlalchemy import select, update

logger = setup_logger(__name__)

class CrewAIService:
    def __init__(self):
        self.running_campaigns: Dict[int, EnhancedCrewAI] = {}
        self.prospect_parser = ProspectParser()
    
    async def start_campaign(self, campaign_id: int) -> Dict[str, Any]:
        """Start a prospecting campaign"""
        try:
            async with AsyncSessionLocal() as db:
                # Get campaign details
                result = await db.execute(
                    select(Campaign).where(Campaign.id == campaign_id)
                )
                campaign = result.scalar_one_or_none()
                
                if not campaign:
                    raise ValueError(f"Campaign {campaign_id} not found")
                
                if campaign.status == CampaignStatus.RUNNING:
                    return {
                        "campaign_id": campaign_id,
                        "status": "already_running",
                        "message": "Campaign is already running"
                    }
                
                # Prepare inputs for CrewAI
                inputs = {
                    'product': campaign.product_description,
                    'current_year': str(datetime.now().year),
                    'target_location': campaign.target_location,
                    'target_sectors': campaign.target_sectors,
                    'prospect_count': campaign.prospect_count
                }
                
                # Update campaign status
                await db.execute(
                    update(Campaign)
                    .where(Campaign.id == campaign_id)
                    .values(
                        status=CampaignStatus.RUNNING,
                        started_at=datetime.utcnow()
                    )
                )
                await db.commit()
                
                # Create enhanced crew for monitoring
                enhanced_crew = EnhancedCrewAI(campaign_id)
                self.running_campaigns[campaign_id] = enhanced_crew
                
                # Run campaign in background
                asyncio.create_task(
                    self._run_campaign_background(campaign_id, enhanced_crew, inputs)
                )
                
                # Notify via WebSocket
                await manager.broadcast_to_campaign(campaign_id, {
                    "type": "campaign_status",
                    "campaign_id": campaign_id,
                    "status": "started",
                    "message": "Campaign started successfully",
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                logger.info(f"Campaign {campaign_id} started successfully")
                
                return {
                    "campaign_id": campaign_id,
                    "status": "started",
                    "message": "Campaign started successfully"
                }
                
        except Exception as e:
            logger.error(f"Error starting campaign {campaign_id}: {str(e)}")
            await self._mark_campaign_failed(campaign_id, str(e))
            raise
    
    async def _run_campaign_background(
        self, 
        campaign_id: int, 
        enhanced_crew: EnhancedCrewAI, 
        inputs: Dict[str, Any]
    ):
        """Run campaign in background"""
        try:
            logger.info(f"Starting background execution for campaign {campaign_id}")
            
            # Execute the crew
            result = await enhanced_crew.run_campaign(inputs)
            
            # Process and save results
            await self._process_campaign_results(campaign_id, result)
            
            # Update campaign status to completed
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(Campaign)
                    .where(Campaign.id == campaign_id)
                    .values(
                        status=CampaignStatus.COMPLETED,
                        completed_at=datetime.utcnow()
                    )
                )
                await db.commit()
            
            # Notify completion
            await manager.broadcast_to_campaign(campaign_id, {
                "type": "campaign_status",
                "campaign_id": campaign_id,
                "status": "completed",
                "message": "Campaign completed successfully",
                "timestamp": datetime.utcnow().isoformat()
            })
            
            logger.info(f"Campaign {campaign_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Campaign {campaign_id} failed: {str(e)}")
            logger.error(traceback.format_exc())
            await self._mark_campaign_failed(campaign_id, str(e))
            
        finally:
            # Cleanup
            if campaign_id in self.running_campaigns:
                del self.running_campaigns[campaign_id]
    
    async def _mark_campaign_failed(self, campaign_id: int, error_message: str):
        """Mark campaign as failed"""
        try:
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(Campaign)
                    .where(Campaign.id == campaign_id)
                    .values(
                        status=CampaignStatus.FAILED,
                        completed_at=datetime.utcnow(),
                        results_summary={"error": error_message}
                    )
                )
                await db.commit()
            
            # Notify failure
            await manager.broadcast_to_campaign(campaign_id, {
                "type": "campaign_status",
                "campaign_id": campaign_id,
                "status": "failed",
                "message": f"Campaign failed: {error_message}",
                "timestamp": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            logger