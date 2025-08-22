from typing import Dict, Any, Optional
import asyncio
from datetime import datetime
import traceback
import sys
import os
from pathlib import Path

# Add src to path for CrewAI imports
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from src.ai_agent_crew.crew import ProspectingCrewManager
from app.models.campaign import Campaign, CampaignStatus
from app.models.prospect import Prospect
from app.models.agent import AgentActivity
from app.services.websocket_manager import manager
from app.services.prospect_parser import ProspectParser
from app.core.database import AsyncSessionLocal
from app.utils.logger import setup_logger
from sqlalchemy import select, update

logger = setup_logger(__name__)

class CrewAIService:
    def __init__(self):
        self.running_campaigns: Dict[int, ProspectingCrewManager] = {}
        self.prospect_parser = ProspectParser()
    
    async def start_campaign(self, campaign_id: int) -> Dict[str, Any]:
        """Start a prospecting campaign"""
        try:
            async with AsyncSessionLocal() as db:
                # Get campaign details
                result = await db.execute(
                    select(Campaign).where(Campaign.id == campaign_id)
                )
                campaign = result.scalar_one_or_none()
                
                if not campaign:
                    raise ValueError(f"Campaign {campaign_id} not found")
                
                if campaign.status == CampaignStatus.RUNNING:
                    return {
                        "campaign_id": campaign_id,
                        "status": "already_running",
                        "message": "Campaign is already running"
                    }
                
                # Prepare inputs for CrewAI
                inputs = {
                    'product': campaign.product_description,
                    'current_year': str(datetime.now().year),
                    'target_location': campaign.target_location,
                    'target_sectors': campaign.target_sectors or [],
                    'prospect_count': campaign.prospect_count
                }
                
                # Update campaign status
                await db.execute(
                    update(Campaign)
                    .where(Campaign.id == campaign_id)
                    .values(
                        status=CampaignStatus.RUNNING,
                        started_at=datetime.utcnow()
                    )
                )
                await db.commit()
                
                # Create crew manager with WebSocket callback
                crew_manager = ProspectingCrewManager(
                    websocket_callback=manager.broadcast_to_campaign,
                    campaign_id=campaign_id
                )
                self.running_campaigns[campaign_id] = crew_manager
                
                # Run campaign in background
                asyncio.create_task(
                    self._run_campaign_background(campaign_id, crew_manager, inputs)
                )
                
                # Notify via WebSocket (both global and campaign-specific)
                message = {
                    "type": "campaign_status",
                    "campaign_id": campaign_id,
                    "status": "started",
                    "message": "Campaign started successfully",
                    "timestamp": datetime.utcnow().isoformat()
                }
                await manager.broadcast_to_campaign(campaign_id, message)
                await manager.broadcast(message)  # Also send globally
                
                logger.info(f"Campaign {campaign_id} started successfully")
                
                return {
                    "campaign_id": campaign_id,
                    "status": "started",
                    "message": "Campaign started successfully"
                }
                
        except Exception as e:
            logger.error(f"Error starting campaign {campaign_id}: {str(e)}")
            await self._mark_campaign_failed(campaign_id, str(e))
            raise
    
    async def _run_campaign_background(
        self, 
        campaign_id: int, 
        crew_manager: ProspectingCrewManager, 
        inputs: Dict[str, Any]
    ):
        """Run campaign in background"""
        try:
            logger.info(f"Starting background execution for campaign {campaign_id}")
            
            # Notify start of execution
            message = {
                "type": "campaign_status",
                "campaign_id": campaign_id,
                "status": "executing",
                "message": "AI agents are working...",
                "timestamp": datetime.utcnow().isoformat()
            }
            await manager.broadcast_to_campaign(campaign_id, message)
            await manager.broadcast(message)
            
            # Execute the crew
            result = await asyncio.get_event_loop().run_in_executor(
                None, crew_manager.run_prospecting_campaign, inputs
            )
            
            # Process and save results
            await self._process_campaign_results(campaign_id, result)
            
            # Update campaign status to completed
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(Campaign)
                    .where(Campaign.id == campaign_id)
                    .values(
                        status=CampaignStatus.COMPLETED,
                        completed_at=datetime.utcnow()
                    )
                )
                await db.commit()
            
            # Notify completion
            message = {
                "type": "campaign_status",
                "campaign_id": campaign_id,
                "status": "completed",
                "message": "Campaign completed successfully",
                "timestamp": datetime.utcnow().isoformat()
            }
            await manager.broadcast_to_campaign(campaign_id, message)
            await manager.broadcast(message)
            
            logger.info(f"Campaign {campaign_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Campaign {campaign_id} failed: {str(e)}")
            logger.error(traceback.format_exc())
            await self._mark_campaign_failed(campaign_id, str(e))
            
        finally:
            # Cleanup
            if campaign_id in self.running_campaigns:
                del self.running_campaigns[campaign_id]
    
    async def _mark_campaign_failed(self, campaign_id: int, error_message: str):
        """Mark campaign as failed"""
        try:
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(Campaign)
                    .where(Campaign.id == campaign_id)
                    .values(
                        status=CampaignStatus.FAILED,
                        completed_at=datetime.utcnow(),
                        results_summary={"error": error_message}
                    )
                )
                await db.commit()
            
            # Notify failure
            await manager.broadcast_to_campaign(campaign_id, {
                "type": "campaign_status",
                "campaign_id": campaign_id,
                "status": "failed",
                "message": f"Campaign failed: {error_message}",
                "timestamp": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error marking campaign {campaign_id} as failed: {str(e)}")
    
    async def _process_campaign_results(self, campaign_id: int, result: Any):
        """Process and save campaign results"""
        try:
            # Parse prospects from the result
            prospects_data = await self.prospect_parser.parse_crewai_result(result)
            
            async with AsyncSessionLocal() as db:
                saved_prospects = []
                
                for prospect_data in prospects_data:
                    prospect = Prospect(
                        campaign_id=campaign_id,
                        **prospect_data
                    )
                    db.add(prospect)
                    saved_prospects.append(prospect)
                
                await db.commit()
                
                # Update campaign results summary
                await db.execute(
                    update(Campaign)
                    .where(Campaign.id == campaign_id)
                    .values(
                        results_summary={
                            "prospects_found": len(saved_prospects),
                            "processing_completed": True,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                    )
                )
                await db.commit()
                
                logger.info(f"Processed {len(saved_prospects)} prospects for campaign {campaign_id}")
                
                # Notify results processed
                await manager.broadcast_to_campaign(campaign_id, {
                    "type": "results_processed",
                    "campaign_id": campaign_id,
                    "prospects_count": len(saved_prospects),
                    "message": f"Found and saved {len(saved_prospects)} prospects",
                    "timestamp": datetime.utcnow().isoformat()
                })
                
        except Exception as e:
            logger.error(f"Error processing results for campaign {campaign_id}: {str(e)}")
    
    async def stop_campaign(self, campaign_id: int) -> Dict[str, Any]:
        """Stop a running campaign"""
        try:
            if campaign_id not in self.running_campaigns:
                return {
                    "campaign_id": campaign_id,
                    "status": "not_running",
                    "message": "Campaign is not currently running"
                }
            
            # Remove from running campaigns
            del self.running_campaigns[campaign_id]
            
            # Update database status
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(Campaign)
                    .where(Campaign.id == campaign_id)
                    .values(
                        status=CampaignStatus.CANCELLED,
                        completed_at=datetime.utcnow()
                    )
                )
                await db.commit()
            
            # Notify via WebSocket
            await manager.broadcast_to_campaign(campaign_id, {
                "type": "campaign_status",
                "campaign_id": campaign_id,
                "status": "cancelled",
                "message": "Campaign was cancelled",
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return {
                "campaign_id": campaign_id,
                "status": "cancelled",
                "message": "Campaign stopped successfully"
            }
            
        except Exception as e:
            logger.error(f"Error stopping campaign {campaign_id}: {str(e)}")
            raise
    
    async def get_campaign_status(self, campaign_id: int) -> Dict[str, Any]:
        """Get current status of a campaign"""
        try:
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(Campaign).where(Campaign.id == campaign_id)
                )
                campaign = result.scalar_one_or_none()
                
                if not campaign:
                    return {"status": "not_found", "campaign_id": campaign_id}
                
                is_running = campaign_id in self.running_campaigns
                
                return {
                    "campaign_id": campaign_id,
                    "status": campaign.status.value,
                    "is_running": is_running,
                    "created_at": campaign.created_at.isoformat() if campaign.created_at else None,
                    "started_at": campaign.started_at.isoformat() if campaign.started_at else None,
                    "completed_at": campaign.completed_at.isoformat() if campaign.completed_at else None,
                    "results_summary": campaign.results_summary or {}
                }
                
        except Exception as e:
            logger.error(f"Error getting status for campaign {campaign_id}: {str(e)}")
            raise
    
    def get_crew_info(self) -> Dict[str, Any]:
        """Get information about CrewAI configuration"""
        try:
            crew_manager = ProspectingCrewManager()
            return crew_manager.get_crew_info()
        except Exception as e:
            logger.error(f"Error getting crew info: {str(e)}")
            return {"error": str(e)}

# Global service instance
crewai_service = CrewAIService()