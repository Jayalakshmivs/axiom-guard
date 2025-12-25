"""
Logging configuration
"""

import sys
from loguru import logger


def setup_logger():
    """Configure and return logger"""
    # Remove default handler
    logger.remove()
    
    # Add custom handler
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO"
    )
    
    # Add file handler
    logger.add(
        "logs/axiom_javelin.log",
        rotation="10 MB",
        retention="7 days",
        level="DEBUG"
    )
    
    return logger
