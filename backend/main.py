"""
AXIOM JAVELIN - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
import uvicorn
from datetime import datetime
import os

# Import routers
from routers import deepfake, phishing, ransomware
from models.database import init_db
from utils.logger import setup_logger

# Setup logging
logger = setup_logger()

# Create FastAPI app
app = FastAPI(
    title="AXIOM JAVELIN API",
    description="Security Guardian Backend - Deepfake Detection, Phishing Protection, Ransomware Defense",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(deepfake.router, prefix="/api/deepfake", tags=["Deepfake Detection"])
app.include_router(phishing.router, prefix="/api/phishing", tags=["Phishing Detection"])
app.include_router(ransomware.router, prefix="/api/ransomware", tags=["Ransomware Protection"])


@app.on_event("startup")
async def startup_event():
    """Initialize database and load models on startup"""
    logger.info("Starting AXIOM JAVELIN Backend...")
    await init_db()
    logger.info("Database initialized")
    logger.info("AXIOM JAVELIN Backend started successfully!")


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "name": "AXIOM JAVELIN API",
        "version": "1.0.0",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "deepfake": "/api/deepfake",
            "phishing": "/api/phishing",
            "ransomware": "/api/ransomware",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "true").lower() == "true"
    )
