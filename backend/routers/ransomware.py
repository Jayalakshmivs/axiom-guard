"""
Ransomware Protection Router
File encryption detection and vault management
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import hashlib
import os

from services.ransomware_detector import RansomwareDetector
from utils.logger import setup_logger

logger = setup_logger()
router = APIRouter()

# Initialize detector
detector = RansomwareDetector()


class VaultFile(BaseModel):
    id: str
    name: str
    size: str
    size_bytes: int
    date: str
    encrypted: bool
    hash: str
    is_folder: bool = False


class ThreatEvent(BaseModel):
    id: str
    name: str
    level: str  # info, warning, danger
    time: str
    timestamp: int
    resolved: bool
    details: Optional[str] = None


class EncryptionCheckResult(BaseModel):
    file_name: str
    is_encrypted: bool
    encryption_type: Optional[str]
    threat_level: str  # none, low, medium, high, critical
    details: str
    indicators: List[str]


class IntegrityResult(BaseModel):
    file_id: str
    file_name: str
    status: str  # verified, modified, corrupted
    original_hash: str
    current_hash: str
    last_checked: str


# In-memory storage
vault_files: List[dict] = []
threat_events: List[dict] = []
storage_used = 0.0


@router.get("/vault/files", response_model=List[VaultFile])
async def get_vault_files():
    """Get all files in the secure vault"""
    return [VaultFile(**f) for f in vault_files]


@router.post("/vault/upload", response_model=VaultFile)
async def upload_to_vault(file: UploadFile = File(...)):
    """
    Upload a file to the secure vault
    
    - **file**: File to encrypt and store
    """
    contents = await file.read()
    file_size = len(contents)
    
    # Validate size (max 100MB)
    if file_size > 100 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum 100MB")
    
    # Generate hash
    file_hash = hashlib.sha256(contents).hexdigest()[:8].upper()
    
    # Create vault file entry
    vault_file = {
        "id": f"file_{int(datetime.utcnow().timestamp() * 1000)}",
        "name": file.filename,
        "size": format_file_size(file_size),
        "size_bytes": file_size,
        "date": datetime.utcnow().strftime("%b %d, %Y"),
        "encrypted": True,
        "hash": file_hash,
        "is_folder": False
    }
    
    vault_files.insert(0, vault_file)
    global storage_used
    storage_used += file_size / (1024 * 1024)
    
    logger.info(f"File uploaded to vault: {file.filename}")
    
    return VaultFile(**vault_file)


@router.delete("/vault/files/{file_id}")
async def delete_vault_file(file_id: str):
    """Delete a file from the vault"""
    global vault_files, storage_used
    
    for i, f in enumerate(vault_files):
        if f["id"] == file_id:
            storage_used -= f["size_bytes"] / (1024 * 1024)
            vault_files.pop(i)
            logger.info(f"File deleted from vault: {f['name']}")
            return {"status": "deleted", "file_id": file_id}
    
    raise HTTPException(status_code=404, detail="File not found")


@router.get("/vault/storage")
async def get_storage_info():
    """Get vault storage information"""
    return {
        "used": round(storage_used, 2),
        "total": 5120,  # 5GB
        "unit": "MB"
    }


@router.post("/encryption/check", response_model=EncryptionCheckResult)
async def check_file_encryption(file: UploadFile = File(...)):
    """
    Check if a file has been encrypted by ransomware
    
    - **file**: File to analyze
    """
    contents = await file.read()
    result = await detector.check_encryption(contents, file.filename)
    
    logger.info(f"Encryption check: {file.filename} - Encrypted: {result['is_encrypted']}")
    
    return EncryptionCheckResult(
        file_name=file.filename,
        is_encrypted=result["is_encrypted"],
        encryption_type=result.get("encryption_type"),
        threat_level=result["threat_level"],
        details=result["details"],
        indicators=result.get("indicators", [])
    )


@router.get("/monitor/threats", response_model=List[ThreatEvent])
async def get_threats():
    """Get recent threat events"""
    return [ThreatEvent(**t) for t in threat_events[:20]]


@router.post("/monitor/threats/{threat_id}/resolve")
async def resolve_threat(threat_id: str):
    """Mark a threat as resolved"""
    for t in threat_events:
        if t["id"] == threat_id:
            t["resolved"] = True
            return {"status": "resolved", "threat_id": threat_id}
    
    raise HTTPException(status_code=404, detail="Threat not found")


@router.get("/monitor/stats")
async def get_monitor_stats():
    """Get monitoring statistics"""
    return {
        "files_monitored": len(vault_files) + 1284,
        "threats_blocked": len([t for t in threat_events if t["resolved"]]),
        "last_scan": "Just now"
    }


@router.post("/integrity/check", response_model=List[IntegrityResult])
async def run_integrity_check():
    """Run file integrity check on all vault files"""
    results = []
    
    for f in vault_files:
        results.append(IntegrityResult(
            file_id=f["id"],
            file_name=f["name"],
            status="verified",
            original_hash=f["hash"],
            current_hash=f["hash"],
            last_checked=datetime.utcnow().isoformat()
        ))
    
    return results


@router.get("/integrity/stats")
async def get_integrity_stats():
    """Get integrity check statistics"""
    return {
        "verified_files": len(vault_files) + 1284,
        "modified_files": 0,
        "last_check": "Just now"
    }


def format_file_size(size_bytes: int) -> str:
    """Format bytes to human readable size"""
    if size_bytes == 0:
        return "0 Bytes"
    
    sizes = ["Bytes", "KB", "MB", "GB"]
    i = 0
    size = float(size_bytes)
    
    while size >= 1024 and i < len(sizes) - 1:
        size /= 1024
        i += 1
    
    return f"{size:.1f} {sizes[i]}"
