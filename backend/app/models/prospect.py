from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, JSON
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
    extra_data = Column(JSON, default=dict)
    
    # Relationships
    campaign = relationship("Campaign", back_populates="prospects")