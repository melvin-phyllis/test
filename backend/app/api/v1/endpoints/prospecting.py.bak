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
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/crew/info")
async def get_crew_info():
    """Get CrewAI configuration information"""
    try:
        return crewai_service.get_crew_info()
    except Exception as e:
        logger.error(f"Error getting crew info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """API health check"""
    return {"status": "healthy", "service": "prospecting"}