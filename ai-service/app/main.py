import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from app.api.routes import analyze, health
from app.core.config import settings
from app.core.constants import API
from app.core.logging import setup_logging
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f'{API.SERVICE_NAME} starting up')
    yield
    logger.info(f'{API.SERVICE_NAME} shutting down')
app = FastAPI(title=API.SERVICE_NAME, description='Microservice for fake news, claim extraction, and trust scoring', version=API.SERVICE_VERSION, lifespan=lifespan, docs_url=API.DOCS_URL, redoc_url=API.REDOC_URL, openapi_url=API.OPENAPI_URL)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

@app.middleware('http')
async def add_process_time_header(request: Request, call_next):
    start = time.time()
    try:
        response = await call_next(request)
    except Exception as exc:
        logger.exception(f'Unhandled error: {exc}')
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={'success': False, 'error': {'code': 'INTERNAL_ERROR', 'message': 'Internal server error'}})
    process_time = round((time.time() - start) * 1000, 2)
    response.headers['X-Process-Time'] = str(process_time)
    if process_time > 1000:
        logger.warning(f'Slow request: {request.url.path} took {process_time}ms')
    return response

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={'success': False, 'error': {'code': 'VALIDATION_ERROR', 'message': 'Request validation failed', 'details': exc.errors()}})
app.include_router(health.router)
app.include_router(analyze.router)
if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app.main:app', host=settings.host, port=settings.port, reload=settings.env == 'development', log_level=settings.log_level.lower())
