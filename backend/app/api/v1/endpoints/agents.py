from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.core.database import get_db
from app.schemas.agent import AgentActivityResponse, AgentStatus
from app.models.agent import AgentActivity
from app.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)

@router.get("/activity", response_model=List[AgentActivityResponse])
async def get_agent_activity(
    campaign_id: Optional[int] = Query(None),
    agent_name: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get agent activity logs"""
    try:
        query = select(AgentActivity).offset(skip).limit(limit)
        
        if campaign_id:
            query = query.where(AgentActivity.campaign_id == campaign_id)
        if agent_name:
            query = query.where(AgentActivity.agent_name == agent_name)
        if status:
            query = query.where(AgentActivity.status == status)
            
        query = query.order_by(AgentActivity.started_at.desc())
        
        result = await db.execute(query)
        activities = result.scalars().all()
        
        return activities
        
    except Exception as e:
        logger.error(f"Error getting agent activity: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status", response_model=List[AgentStatus])
async def get_agents_status(
    campaign_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get current status of all agents"""
    try:
        # Get latest activity for each agent
        subquery = (
            select(
                AgentActivity.agent_name,
                func.max(AgentActivity.started_at).label('latest_activity')
            )
            .group_by(AgentActivity.agent_name)
        )
        
        if campaign_id:
            subquery = subquery.where(AgentActivity.campaign_id == campaign_id)
            
        subquery = subquery.subquery()
        
        # Get full activity records for latest activities
        query = (
            select(AgentActivity)
            .join(
                subquery,
                (AgentActivity.agent_name == subquery.c.agent_name) &
                (AgentActivity.started_at == subquery.c.latest_activity)
            )
        )
        
        if campaign_id:
            query = query.where(AgentActivity.campaign_id == campaign_id)
            
        result = await db.execute(query)
        latest_activities = result.scalars().all()
        
        # Convert to AgentStatus format
        agent_statuses = []
        for activity in latest_activities:
            # Determine current status
            current_status = "idle"
            if activity.status == "started" or activity.status == "running":
                current_status = "working"
            elif activity.status == "completed":
                current_status = "completed"
            elif activity.status == "failed":
                current_status = "error"
                
            agent_status = AgentStatus(
                agent_name=activity.agent_name,
                status=current_status,
                current_task=activity.task_name,
                progress=100.0 if activity.status == "completed" else 
                        0.0 if activity.status == "failed" else 50.0,
                last_activity=activity.started_at
            )
            agent_statuses.append(agent_status)
        
        return agent_statuses
        
    except Exception as e:
        logger.error(f"Error getting agents status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_agent_stats(
    campaign_id: Optional[int] = Query(None),
    hours: int = Query(24, ge=1, le=168),  # Last N hours, max 1 week
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Get agent statistics"""
    try:
        since = datetime.utcnow() - timedelta(hours=hours)
        
        query = select(AgentActivity).where(AgentActivity.started_at >= since)
        
        if campaign_id:
            query = query.where(AgentActivity.campaign_id == campaign_id)
            
        result = await db.execute(query)
        activities = result.scalars().all()
        
        # Calculate statistics
        stats = {
            "total_activities": len(activities),
            "activities_by_agent": {},
            "activities_by_status": {},
            "average_task_duration": 0.0,
            "success_rate": 0.0
        }
        
        # Group by agent
        for activity in activities:
            agent_name = activity.agent_name
            if agent_name not in stats["activities_by_agent"]:
                stats["activities_by_agent"][agent_name] = 0
            stats["activities_by_agent"][agent_name] += 1
            
            # Group by status
            status = activity.status
            if status not in stats["activities_by_status"]:
                stats["activities_by_status"][status] = 0
            stats["activities_by_status"][status] += 1
        
        # Calculate success rate
        completed = stats["activities_by_status"].get("completed", 0)
        failed = stats["activities_by_status"].get("failed", 0)
        total_finished = completed + failed
        
        if total_finished > 0:
            stats["success_rate"] = (completed / total_finished) * 100
        
        # Calculate average duration for completed tasks
        completed_activities = [a for a in activities 
                             if a.status == "completed" and a.completed_at]
        if completed_activities:
            total_duration = sum(
                (a.completed_at - a.started_at).total_seconds() 
                for a in completed_activities
            )
            stats["average_task_duration"] = total_duration / len(completed_activities)
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting agent stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))