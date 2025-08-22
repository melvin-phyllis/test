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