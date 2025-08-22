from fastapi import APIRouter

from app.api.v1.endpoints import prospecting, prospects, agents

api_router = APIRouter()

api_router.include_router(
    prospecting.router, 
    prefix="/prospecting", 
    tags=["prospecting"]
)

api_router.include_router(
    prospects.router, 
    prefix="/prospects", 
    tags=["prospects"]
)

api_router.include_router(
    agents.router, 
    prefix="/agents", 
    tags=["agents"]
)