import secrets
from fastapi import Header, HTTPException, status
from app.core.config import settings

async def verify_api_key(x_api_key: str=Header(..., alias='X-API-Key')) -> bool:
    if not x_api_key or not secrets.compare_digest(x_api_key, settings.api_key):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={'error': {'code': 'INVALID_API_KEY', 'message': 'Invalid or missing API key'}})
    return True
