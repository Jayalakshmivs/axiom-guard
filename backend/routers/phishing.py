"""
Phishing Detection Router
URL analysis for detecting phishing threats
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime

from services.phishing_detector import PhishingDetector
from utils.logger import setup_logger

logger = setup_logger()
router = APIRouter()

# Initialize detector
detector = PhishingDetector()


class ScanRequest(BaseModel):
    url: str


class ScanResult(BaseModel):
    url: str
    status: str  # safe, warning, danger
    confidence: float
    details: str
    threat_type: Optional[str]
    findings: List[str]
    timestamp: str


class ScanHistory(BaseModel):
    url: str
    status: str
    time: str
    timestamp: int
    confidence: float


# In-memory storage (use database in production)
scan_history: List[dict] = []
stats = {
    "urls_scanned": 0,
    "threats_blocked": 0,
    "safe_urls": 0,
    "warnings": 0
}


@router.post("/scan", response_model=ScanResult)
async def scan_url(request: ScanRequest):
    """
    Scan a URL for phishing threats
    
    - **url**: The URL to scan
    - Returns threat analysis with confidence score
    """
    try:
        result = await detector.analyze(request.url)
        
        # Update stats
        stats["urls_scanned"] += 1
        if result["status"] == "danger":
            stats["threats_blocked"] += 1
        elif result["status"] == "warning":
            stats["warnings"] += 1
        else:
            stats["safe_urls"] += 1
        
        # Add to history
        scan_history.insert(0, {
            "url": request.url,
            "status": result["status"],
            "time": "Just now",
            "timestamp": int(datetime.utcnow().timestamp() * 1000),
            "confidence": result["confidence"]
        })
        
        # Keep only last 100 scans
        if len(scan_history) > 100:
            scan_history.pop()
        
        logger.info(f"URL scanned: {request.url} - Status: {result['status']}")
        
        return ScanResult(
            url=request.url,
            status=result["status"],
            confidence=result["confidence"],
            details=result["details"],
            threat_type=result.get("threat_type"),
            findings=result.get("findings", []),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error scanning URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.get("/history", response_model=List[ScanHistory])
async def get_history(limit: int = 20):
    """Get recent scan history"""
    return [ScanHistory(**s) for s in scan_history[:limit]]


@router.get("/stats")
async def get_stats():
    """Get phishing detection statistics"""
    return {
        "urls_scanned": stats["urls_scanned"],
        "threats_blocked": stats["threats_blocked"],
        "safe_urls": stats["safe_urls"],
        "warnings": stats["warnings"]
    }
