import time
from fastapi import APIRouter, Depends
from app.core.config import settings
from app.core.constants import API
from app.schemas.responses import HealthResponse
router = APIRouter()
_START_TIME = time.time()

@router.get('/health', response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status='healthy', version=API.SERVICE_VERSION, models_loaded=False, uptime_seconds=round(time.time() - _START_TIME, 2), timestamp=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()))

@router.get('/')
async def root() -> dict:
    return {'service': API.SERVICE_NAME, 'version': API.SERVICE_VERSION, 'env': settings.env, 'endpoints': {'health': '/health', 'analyze_text': f'{API.PREFIX}/analyze/text', 'analyze_url': f'{API.PREFIX}/analyze/url', 'analyze_image': f'{API.PREFIX}/analyze/image', 'docs': API.DOCS_URL}}
