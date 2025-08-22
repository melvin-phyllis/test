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