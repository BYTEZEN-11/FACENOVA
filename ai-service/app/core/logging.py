import sys
from loguru import logger
from app.core.config import settings
from app.core.constants import Log

def setup_logging() -> None:
    logger.remove()
    logger.add(sys.stdout, format='<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | <level>{message}</level>', level=settings.log_level.upper(), colorize=True)
    logger.add(Log.FILE_PATTERN, rotation=Log.ROTATION, retention=Log.RETENTION, compression=Log.COMPRESSION, level='DEBUG', format='{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}')
    logger.info(f'Logging initialized (level={settings.log_level})')

def get_logger(name: str=None):
    return logger.bind(module=name) if name else logger
