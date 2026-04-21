# main.py
# This is the entry point for the FastAPI application. It sets up CORS and registers the API routers.

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health, agents, tasks
import logging
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="EXECRA AI Backend",
    description="Multi-agent platform for startup founders"
)

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(agents.router)
app.include_router(tasks.router)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info(f"[EXECRA] {request.method} {request.url.path} → {response.status_code} ({process_time:.2f}ms)")
    return response

@app.on_event("startup")
async def startup_event():
    logger.info("EXECRA AI Backend running on port 8000")
