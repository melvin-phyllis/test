from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import csv
import io
import json

from app.core.database import get_db
from app.models.campaign import Campaign
from app.models.prospect import Prospect
from app.services.crewai_service import crewai_service
from app.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)

@router.get("/health")
async def health_check():
    """System health check"""
    return {
        "status": "healthy",
        "service": "ai_prospecting_api",
        "version": "1.0.0"
    }

@router.get("/crew/info")
async def get_crew_info():
    """Get CrewAI system information"""
    try:
        return crewai_service.get_crew_info()
    except Exception as e:
        logger.error(f"Error getting crew info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    type: str = "prospects",  # "prospects" or "campaigns"
    db: AsyncSession = Depends(get_db)
):
    """Upload and process CSV/JSON files"""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file selected")
        
        # Read file content
        contents = await file.read()
        
        # Determine file type and process
        if file.filename.endswith('.csv'):
            return await process_csv_file(contents, type, db)
        elif file.filename.endswith('.json'):
            return await process_json_file(contents, type, db)
        else:
            raise HTTPException(
                status_code=400, 
                detail="Unsupported file format. Please use CSV or JSON"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

async def process_csv_file(contents: bytes, file_type: str, db: AsyncSession):
    """Process CSV file upload"""
    try:
        # Decode content
        content_str = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(content_str))
        
        imported_count = 0
        errors = []
        
        if file_type == "prospects":
            for row_num, row in enumerate(csv_reader, start=2):
                try:
                    # Basic validation
                    required_fields = ["company_name", "campaign_id"]
                    missing_fields = [field for field in required_fields if not row.get(field)]
                    
                    if missing_fields:
                        errors.append(f"Row {row_num}: Missing required fields: {', '.join(missing_fields)}")
                        continue
                    
                    # Create prospect
                    prospect = Prospect(
                        campaign_id=int(row["campaign_id"]),
                        company_name=row["company_name"],
                        website=row.get("website"),
                        sector=row.get("sector"),
                        location=row.get("location"),
                        contact_name=row.get("contact_name"),
                        contact_position=row.get("contact_position"),
                        email=row.get("email"),
                        phone=row.get("phone"),
                        quality_score=float(row["quality_score"]) if row.get("quality_score") else None,
                        status=row.get("status", "new")
                    )
                    
                    db.add(prospect)
                    imported_count += 1
                    
                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")
            
            await db.commit()
            
        elif file_type == "campaigns":
            for row_num, row in enumerate(csv_reader, start=2):
                try:
                    # Basic validation
                    required_fields = ["name", "product_description"]
                    missing_fields = [field for field in required_fields if not row.get(field)]
                    
                    if missing_fields:
                        errors.append(f"Row {row_num}: Missing required fields: {', '.join(missing_fields)}")
                        continue
                    
                    # Create campaign
                    campaign = Campaign(
                        name=row["name"],
                        product_description=row["product_description"],
                        target_location=row.get("target_location"),
                        target_sectors=row.get("target_sectors", "").split(",") if row.get("target_sectors") else [],
                        prospect_count=int(row["prospect_count"]) if row.get("prospect_count") else 10
                    )
                    
                    db.add(campaign)
                    imported_count += 1
                    
                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")
            
            await db.commit()
        
        logger.info(f"CSV import completed: {imported_count} {file_type} imported")
        
        return {
            "success": True,
            "imported": imported_count,
            "errors": errors,
            "message": f"Successfully imported {imported_count} {file_type}"
        }
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Error processing CSV file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CSV processing failed: {str(e)}")

async def process_json_file(contents: bytes, file_type: str, db: AsyncSession):
    """Process JSON file upload"""
    try:
        # Parse JSON
        data = json.loads(contents.decode('utf-8'))
        
        imported_count = 0
        errors = []
        
        # Ensure data is a list
        if not isinstance(data, list):
            data = [data]
        
        if file_type == "prospects":
            for idx, item in enumerate(data):
                try:
                    # Basic validation
                    if "company_name" not in item or "campaign_id" not in item:
                        errors.append(f"Item {idx + 1}: Missing required fields")
                        continue
                    
                    # Create prospect
                    prospect = Prospect(
                        campaign_id=item["campaign_id"],
                        company_name=item["company_name"],
                        website=item.get("website"),
                        sector=item.get("sector"),
                        location=item.get("location"),
                        contact_name=item.get("contact_name"),
                        contact_position=item.get("contact_position"),
                        email=item.get("email"),
                        phone=item.get("phone"),
                        quality_score=item.get("quality_score"),
                        status=item.get("status", "new")
                    )
                    
                    db.add(prospect)
                    imported_count += 1
                    
                except Exception as e:
                    errors.append(f"Item {idx + 1}: {str(e)}")
        
        elif file_type == "campaigns":
            for idx, item in enumerate(data):
                try:
                    # Basic validation
                    if "name" not in item or "product_description" not in item:
                        errors.append(f"Item {idx + 1}: Missing required fields")
                        continue
                    
                    # Create campaign
                    campaign = Campaign(
                        name=item["name"],
                        product_description=item["product_description"],
                        target_location=item.get("target_location"),
                        target_sectors=item.get("target_sectors", []),
                        prospect_count=item.get("prospect_count", 10)
                    )
                    
                    db.add(campaign)
                    imported_count += 1
                    
                except Exception as e:
                    errors.append(f"Item {idx + 1}: {str(e)}")
        
        await db.commit()
        
        logger.info(f"JSON import completed: {imported_count} {file_type} imported")
        
        return {
            "success": True,
            "imported": imported_count,
            "errors": errors,
            "message": f"Successfully imported {imported_count} {file_type}"
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON format: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        await db.rollback()
        logger.error(f"Error processing JSON file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"JSON processing failed: {str(e)}")