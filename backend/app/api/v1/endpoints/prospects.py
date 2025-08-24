from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List, Optional
import csv
import io
import json
from datetime import datetime

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
    limit: int = Query(100, ge=1, le=1000),
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
        update_data = prospect_update.model_dump(exclude_unset=True)
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

@router.post("/bulk-update")
async def bulk_update_prospects(
    updates: dict,  # {"updates": [{"id": int, "data": {...}}]}
    db: AsyncSession = Depends(get_db)
):
    """Bulk update multiple prospects"""
    try:
        updated_count = 0
        errors = []
        
        updates_list = updates.get("updates", [])
        
        for update_item in updates_list:
            try:
                prospect_id = update_item["id"]
                update_data = update_item["data"]
                
                # Check if prospect exists
                result = await db.execute(
                    select(Prospect).where(Prospect.id == prospect_id)
                )
                prospect = result.scalar_one_or_none()
                
                if not prospect:
                    errors.append(f"Prospect {prospect_id} not found")
                    continue
                
                # Update fields
                for field, value in update_data.items():
                    if hasattr(prospect, field):
                        setattr(prospect, field, value)
                
                updated_count += 1
                
            except Exception as e:
                errors.append(f"Error updating prospect {update_item.get('id', 'unknown')}: {str(e)}")
        
        await db.commit()
        
        logger.info(f"Bulk updated {updated_count} prospects")
        return {"updated": updated_count, "errors": errors}
        
    except Exception as e:
        logger.error(f"Error in bulk update: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export")
async def export_prospects(
    campaign_id: Optional[int] = Query(None),
    format: str = Query("csv", pattern="^(csv|json)$"),
    db: AsyncSession = Depends(get_db)
):
    """Export prospects data"""
    try:
        query = select(Prospect)
        
        if campaign_id:
            query = query.where(Prospect.campaign_id == campaign_id)
        
        result = await db.execute(query)
        prospects = result.scalars().all()
        
        # Prepare data
        prospects_data = [
            {
                "id": p.id,
                "campaign_id": p.campaign_id,
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
        
        if format == "json":
            content = json.dumps(prospects_data, indent=2, ensure_ascii=False)
            media_type = "application/json"
            filename = f"prospects_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
        else:  # csv
            output = io.StringIO()
            if prospects_data:
                fieldnames = ["id", "campaign_id", "company_name", "website", "sector", "location", 
                             "contact_name", "contact_position", "email", "phone", "quality_score", 
                             "status", "created_at"]
                writer = csv.DictWriter(output, fieldnames=fieldnames)
                writer.writeheader()
                for prospect_data in prospects_data:
                    writer.writerow(prospect_data)
            content = output.getvalue()
            media_type = "text/csv"
            filename = f"prospects_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        logger.info(f"Exported {len(prospects)} prospects in {format} format")
        
        return Response(
            content=content,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"Error exporting prospects: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{prospect_id}/enrich", response_model=ProspectResponse)
async def enrich_prospect(
    prospect_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Enrich prospect data (placeholder for future AI enhancement)"""
    try:
        result = await db.execute(
            select(Prospect).where(Prospect.id == prospect_id)
        )
        prospect = result.scalar_one_or_none()
        
        if not prospect:
            raise HTTPException(status_code=404, detail="Prospect not found")
        
        # Placeholder for enrichment logic
        # Could integrate with external APIs, AI services, etc.
        logger.info(f"Enrichment requested for prospect {prospect_id}")
        
        # For now, just return the prospect unchanged
        return prospect
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enriching prospect {prospect_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))