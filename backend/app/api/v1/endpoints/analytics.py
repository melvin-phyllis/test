from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.campaign import Campaign
from app.models.prospect import Prospect
from app.models.agent import AgentActivity
from app.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)

@router.get("/")
async def get_analytics(
    days: int = Query(30, ge=1, le=365),
    campaign_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get analytics data"""
    try:
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Base queries
        campaigns_query = select(Campaign).where(Campaign.created_at >= start_date)
        prospects_query = select(Prospect).where(Prospect.created_at >= start_date)
        activities_query = select(AgentActivity).where(AgentActivity.started_at >= start_date)
        
        if campaign_id:
            campaigns_query = campaigns_query.where(Campaign.id == campaign_id)
            prospects_query = prospects_query.where(Prospect.campaign_id == campaign_id)
            activities_query = activities_query.where(AgentActivity.campaign_id == campaign_id)
        
        # Total campaigns
        total_campaigns_result = await db.execute(
            select(func.count(Campaign.id)).where(Campaign.created_at >= start_date)
        )
        total_campaigns = total_campaigns_result.scalar() or 0
        
        # Total prospects
        total_prospects_result = await db.execute(
            select(func.count(Prospect.id)).where(Prospect.created_at >= start_date)
        )
        total_prospects = total_prospects_result.scalar() or 0
        
        # Campaign status distribution
        campaigns_by_status_result = await db.execute(
            select(Campaign.status, func.count(Campaign.id))
            .where(Campaign.created_at >= start_date)
            .group_by(Campaign.status)
        )
        campaigns_by_status = dict(campaigns_by_status_result.all())
        
        # Prospects by status
        prospects_by_status_result = await db.execute(
            select(Prospect.status, func.count(Prospect.id))
            .where(Prospect.created_at >= start_date)
            .group_by(Prospect.status)
        )
        prospects_by_status = dict(prospects_by_status_result.all())
        
        # Prospects by sector
        prospects_by_sector_result = await db.execute(
            select(Prospect.sector, func.count(Prospect.id))
            .where(Prospect.created_at >= start_date)
            .group_by(Prospect.sector)
        )
        prospects_by_sector = dict(prospects_by_sector_result.all())
        
        # Agent activity stats
        total_activities_result = await db.execute(
            select(func.count(AgentActivity.id))
            .where(AgentActivity.started_at >= start_date)
        )
        total_activities = total_activities_result.scalar() or 0
        
        # Activities by agent
        activities_by_agent_result = await db.execute(
            select(AgentActivity.agent_name, func.count(AgentActivity.id))
            .where(AgentActivity.started_at >= start_date)
            .group_by(AgentActivity.agent_name)
        )
        activities_by_agent = dict(activities_by_agent_result.all())
        
        # Activities by status
        activities_by_status_result = await db.execute(
            select(AgentActivity.status, func.count(AgentActivity.id))
            .where(AgentActivity.started_at >= start_date)
            .group_by(AgentActivity.status)
        )
        activities_by_status = dict(activities_by_status_result.all())
        
        # Average quality score
        avg_quality_result = await db.execute(
            select(func.avg(Prospect.quality_score))
            .where(Prospect.created_at >= start_date)
            .where(Prospect.quality_score.isnot(None))
        )
        avg_quality_score = avg_quality_result.scalar() or 0.0
        
        # Daily trends - prospects created per day
        daily_prospects_result = await db.execute(
            select(
                func.date(Prospect.created_at).label('date'),
                func.count(Prospect.id).label('count')
            )
            .where(Prospect.created_at >= start_date)
            .group_by(func.date(Prospect.created_at))
            .order_by(func.date(Prospect.created_at))
        )
        daily_prospects = [
            {"date": str(date), "count": count}
            for date, count in daily_prospects_result.all()
        ]
        
        # Top performing campaigns
        top_campaigns_result = await db.execute(
            select(
                Campaign.id,
                Campaign.name,
                func.count(Prospect.id).label('prospect_count'),
                func.avg(Prospect.quality_score).label('avg_quality')
            )
            .join(Prospect, Campaign.id == Prospect.campaign_id, isouter=True)
            .where(Campaign.created_at >= start_date)
            .group_by(Campaign.id, Campaign.name)
            .order_by(func.count(Prospect.id).desc())
            .limit(10)
        )
        top_campaigns = [
            {
                "id": campaign_id,
                "name": name,
                "prospect_count": prospect_count or 0,
                "avg_quality": float(avg_quality or 0.0)
            }
            for campaign_id, name, prospect_count, avg_quality in top_campaigns_result.all()
        ]
        
        # Success metrics
        conversion_rate = 0.0
        if total_prospects > 0:
            qualified_prospects_result = await db.execute(
                select(func.count(Prospect.id))
                .where(Prospect.created_at >= start_date)
                .where(Prospect.status == "qualified")
            )
            qualified_prospects = qualified_prospects_result.scalar() or 0
            conversion_rate = (qualified_prospects / total_prospects) * 100
        
        analytics_data = {
            "overview": {
                "total_campaigns": total_campaigns,
                "total_prospects": total_prospects,
                "total_activities": total_activities,
                "avg_quality_score": float(avg_quality_score),
                "conversion_rate": round(conversion_rate, 2),
                "period_days": days
            },
            "campaigns": {
                "by_status": campaigns_by_status,
                "top_performing": top_campaigns
            },
            "prospects": {
                "by_status": prospects_by_status,
                "by_sector": prospects_by_sector,
                "daily_trends": daily_prospects
            },
            "agents": {
                "activities_by_agent": activities_by_agent,
                "activities_by_status": activities_by_status
            },
            "filters": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "campaign_id": campaign_id
            }
        }
        
        logger.info(f"Generated analytics for {days} days period")
        return analytics_data
        
    except Exception as e:
        logger.error(f"Error generating analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db)
):
    """Get quick dashboard statistics"""
    try:
        # Quick overview stats
        total_campaigns = await db.execute(select(func.count(Campaign.id)))
        total_prospects = await db.execute(select(func.count(Prospect.id)))
        active_campaigns = await db.execute(
            select(func.count(Campaign.id)).where(Campaign.status == "running")
        )
        recent_activities = await db.execute(
            select(func.count(AgentActivity.id))
            .where(AgentActivity.started_at >= datetime.now() - timedelta(hours=24))
        )
        
        return {
            "total_campaigns": total_campaigns.scalar() or 0,
            "total_prospects": total_prospects.scalar() or 0,
            "active_campaigns": active_campaigns.scalar() or 0,
            "recent_activities": recent_activities.scalar() or 0,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))