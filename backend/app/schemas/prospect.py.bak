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
    extra_data: Optional[Dict[str, Any]] = Field(default_factory=dict)

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
    extra_data: Dict[str, Any]
    
    class Config:
        from_attributes = True