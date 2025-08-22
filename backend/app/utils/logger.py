from loguru import logger
import sys
from app.core.config import settings

def setup_logger(name: str):
    """Setup logger with consistent configuration"""
    
    # Remove default handler
    logger.remove()
    
    # Add console handler
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level}</level> | <cyan>{name}</cyan> | {message}",
        level="DEBUG" if settings.DEBUG else "INFO",
        colorize=True
    )
    
    # Add file handler
    logger.add(
        "logs/app.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name} | {message}",
        level="INFO",
        rotation="10 MB",
        retention="7 days"
    )
    
    return logger.bind(name=name)