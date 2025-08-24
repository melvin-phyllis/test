from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete, update
from typing import List, Optional
from pydantic import ValidationError
import csv
import io
import json
from datetime import datetime

from app.core.database import get_db
from app.schemas.campaign import (
    CampaignCreate, CampaignUpdate, CampaignResponse, CampaignStats
)
from app.models.campaign import Campaign, CampaignStatus
from app.models.prospect import Prospect
from app.services.crewai_service import crewai_service
from app.utils.logger import setup_logger
from app.services.prospect_parser import ProspectParser
from pathlib import Path

router = APIRouter()
logger = setup_logger(__name__)
parser = ProspectParser()

@router.post("/campaigns", response_model=CampaignResponse)
async def create_campaign(
    campaign: CampaignCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new prospecting campaign"""
    try:
        logger.info(f"Received campaign data: {campaign.model_dump()}")
        db_campaign = Campaign(**campaign.model_dump())
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
        # Check if campaign exists
        result = await db.execute(
            select(Campaign).where(Campaign.id == campaign_id)
        )
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Update campaign fields
        update_data = campaign_update.model_dump(exclude_unset=True)
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

@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(
    campaign_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a campaign"""
    try:
        # Check if campaign exists
        result = await db.execute(
            select(Campaign).where(Campaign.id == campaign_id)
        )
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Check if campaign is running
        if campaign.status == CampaignStatus.RUNNING:
            raise HTTPException(status_code=400, detail="Cannot delete a running campaign")
        
        # Delete associated prospects first
        await db.execute(delete(Prospect).where(Prospect.campaign_id == campaign_id))
        
        # Delete the campaign
        await db.execute(delete(Campaign).where(Campaign.id == campaign_id))
        await db.commit()
        
        logger.info(f"Deleted campaign {campaign_id}")
        return {"message": "Campaign deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting campaign {campaign_id}: {str(e)}")
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
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns/{campaign_id}/export")
async def export_campaign(
    campaign_id: int,
    format: str = Query("csv", pattern="^(csv|json|xlsx)$"),
    db: AsyncSession = Depends(get_db)
):
    """Export campaign data"""
    try:
        # Check if campaign exists
        result = await db.execute(
            select(Campaign).where(Campaign.id == campaign_id)
        )
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Get campaign prospects
        prospects_result = await db.execute(
            select(Prospect).where(Prospect.campaign_id == campaign_id)
        )
        prospects = prospects_result.scalars().all()
        
        # Prepare data
        campaign_data = {
            "campaign": {
                "id": campaign.id,
                "name": campaign.name,
                "product_description": campaign.product_description,
                "target_location": campaign.target_location,
                "target_sectors": campaign.target_sectors,
                "status": campaign.status.value,
                "created_at": campaign.created_at.isoformat() if campaign.created_at else None,
                "prospect_count": len(prospects)
            },
            "prospects": [
                {
                    "id": p.id,
                    "company_name": p.company_name,
                    "website": p.website,
                    "sector": p.sector,
                    "location": p.location,
                    "contact_name": p.contact_name,
                    "contact_position": p.contact_position,
                    "email": p.email,
                    "phone": p.phone,
                    "quality_score": p.quality_score,
                    "status": p.status,
                    "created_at": p.created_at.isoformat() if p.created_at else None
                }
                for p in prospects
            ]
        }
        
        if format == "json":
            content = json.dumps(campaign_data, indent=2, ensure_ascii=False)
            media_type = "application/json"
            filename = f"campaign_{campaign_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
        elif format == "csv":
            output = io.StringIO()
            fieldnames = [
                "company_name", "website", "sector", "location", "contact_name",
                "contact_position", "email", "phone", "quality_score", "status", "created_at"
            ]
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            # Toujours écrire l'en-tête même si aucun prospect (fichier non vide)
            writer.writeheader()
            for prospect_data in campaign_data["prospects"]:
                writer.writerow(prospect_data)
            content = output.getvalue()
            media_type = "text/csv"
            filename = f"campaign_{campaign_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            
        else:  # xlsx would require openpyxl, using csv for now
            raise HTTPException(status_code=400, detail="XLSX format not implemented yet")
        
        logger.info(f"Exported campaign {campaign_id} in {format} format")
        
        return Response(
            content=content,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting campaign {campaign_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/campaigns/{campaign_id}/reparse")
async def reparse_campaign_results(
    campaign_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Reparser et enregistrer les prospects depuis le résultat brut sauvegardé"""
    try:
        # Vérifier campagne
        result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
        campaign = result.scalar_one_or_none()
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")

        raw_path = Path("data") / f"campaign_{campaign_id}_raw.txt"
        if not raw_path.exists():
            raise HTTPException(status_code=404, detail="Raw result file not found for this campaign")

        content = raw_path.read_text(encoding="utf-8", errors="ignore")
        prospects_data = await parser.parse_crewai_result(content)

        saved = 0
        for p in prospects_data:
            prospect = Prospect(campaign_id=campaign_id, **p)
            db.add(prospect)
            saved += 1
        await db.commit()

        # Mettre à jour le résumé
        await db.execute(
            update(Campaign)
            .where(Campaign.id == campaign_id)
            .values(
                results_summary={
                    **(campaign.results_summary or {}),
                    "prospects_found": (campaign.results_summary or {}).get("prospects_found", 0) + saved,
                    "reparsed": True,
                }
            )
        )
        await db.commit()

        logger.info(f"Reparsed {saved} prospects for campaign {campaign_id}")
        return {"campaign_id": campaign_id, "parsed": saved}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reparsing campaign {campaign_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
