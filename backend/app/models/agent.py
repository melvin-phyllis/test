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
    extra_data = Column(JSON, default=dict)
    
    # Relationships
    campaign = relationship("Campaign", back_populates="activities")