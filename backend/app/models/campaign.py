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
    target_location = Column(String(255), default="France")
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