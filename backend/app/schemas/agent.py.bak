from pydantic import BaseModel, Field
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
    extra_data: Optional[Dict[str, Any]] = Field(default_factory=dict)

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
    extra_data: Dict[str, Any]
    
    class Config:
        from_attributes = True

# Real-time agent status
class AgentStatus(BaseModel):
    agent_name: str
    status: str  # idle, working, completed, error
    current_task: Optional[str] = None
    progress: float = Field(default=0.0, ge=0.0, le=100.0)
    last_activity: datetime