from typing import Generic, Optional, TypeVar
from pydantic import BaseModel
T = TypeVar('T')

class SuccessResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T
    message: Optional[str] = None

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail

class HealthResponse(BaseModel):
    status: str
    version: str
    models_loaded: bool
    uptime_seconds: float
    timestamp: str
