from fastapi import APIRouter

from app.api.v1.endpoints import prospecting, prospects, agents, auth, analytics, system

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

api_router.include_router(
    auth.router, 
    prefix="/auth", 
    tags=["auth"]
)

api_router.include_router(
    analytics.router, 
    prefix="/analytics", 
    tags=["analytics"]
)

api_router.include_router(
    system.router, 
    prefix="/system", 
    tags=["system"]
)