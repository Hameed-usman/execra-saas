# health.py
# This file defines the health check route to ensure the server and DB are online.

from fastapi import APIRouter
from app.core.database import test_connection

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
async def health_check():
    """Returns the health status of the API and the database connection."""
    try:
        await test_connection()
        return {
            "status": "ok", 
            "service": "execra-ai-backend", 
            "db": "connected"
        }
    except Exception as e:
        return {
            "status": "ok", 
            "service": "execra-ai-backend", 
            "db": "error", 
            "detail": str(e)
        }
