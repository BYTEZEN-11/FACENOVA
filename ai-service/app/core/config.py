import secrets
from functools import lru_cache
from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from app.core.constants import API, Log

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', case_sensitive=False, extra='ignore')
    env: str = 'development'
    host: str = API.DEFAULT_HOST
    port: int = API.DEFAULT_PORT
    log_level: str = Log.DEFAULT_LEVEL
    api_key: str = ''
    use_transformer_models: bool = False
    model_cache_dir: str = './models'
    spacy_model: str = 'en_core_web_sm'
    fact_check_api_key: str = ''
    whois_api_key: str = ''
    allowed_origins: str = 'http://localhost:3000,http://localhost:5173'

    @field_validator('api_key')
    @classmethod
    def _ensure_api_key(cls, v: str) -> str:
        if not v:
            generated = secrets.token_urlsafe(32)
            print(f'[ai-service] WARNING: API_KEY not set — generated an ephemeral key for this process: {generated}', flush=True)
            return generated
        if len(v) < 32:
            raise ValueError('API_KEY must be at least 32 characters')
        return v

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(',') if o.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()
settings = get_settings()
