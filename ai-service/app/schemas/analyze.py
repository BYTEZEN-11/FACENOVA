from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from app.core.constants import Limits

class AnalysisOptions(BaseModel):
    extract_claims: bool = Field(default=True, description='Extract factual claims')
    fact_check: bool = Field(default=True, description='Cross-check with sources')
    include_reasoning: bool = Field(default=True, description='Include reasoning steps')
    language: str = Field(default='en', description='Content language (ISO 639-1)')

class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=Limits.TEXT_MIN, max_length=Limits.TEXT_MAX, description='Text to analyze')
    options: Optional[AnalysisOptions] = Field(default_factory=AnalysisOptions)

    @field_validator('text')
    @classmethod
    def strip_text(cls, v: str) -> str:
        return v.strip()

class AnalyzeUrlRequest(BaseModel):
    url: str = Field(..., min_length=7, max_length=Limits.URL_MAX, description='Article URL')
    options: Optional[AnalysisOptions] = Field(default_factory=AnalysisOptions)

class AnalyzeImageRequest(BaseModel):
    options: Optional[AnalysisOptions] = Field(default_factory=AnalysisOptions)

class IndicatorSchema(BaseModel):
    clickbait: float = Field(default=0, ge=0, le=100)
    emotional_manipulation: float = Field(default=0, ge=0, le=100)
    sensationalism: float = Field(default=0, ge=0, le=100)
    misleading_patterns: float = Field(default=0, ge=0, le=100)

class ClaimSchema(BaseModel):
    text: str
    verified: bool = False
    confidence: float = Field(default=0, ge=0, le=1)
    sources: List[str] = Field(default_factory=list)
    verification_note: Optional[str] = None

class SourceSchema(BaseModel):
    name: str
    url: Optional[str] = None
    credibility_score: float = Field(default=50, ge=0, le=100)
    agreement: str = Field(default='unverified')

class AnalysisResult(BaseModel):
    classification: str
    trust_score: float = Field(ge=0, le=100)
    confidence: float = Field(ge=0, le=1)
    reasoning: List[str] = Field(default_factory=list)
    indicators: IndicatorSchema = Field(default_factory=IndicatorSchema)

class TextAnalysisResult(BaseModel):
    analysis: AnalysisResult
    extracted_claims: List[ClaimSchema] = Field(default_factory=list)
    sources: List[SourceSchema] = Field(default_factory=list)
    processing_time: float = 0.0
    model_versions: dict = Field(default_factory=dict)

class UrlAnalysisResult(TextAnalysisResult):
    source_credibility: float = 0.0
    source_reputation: str = 'unknown'
    domain: str = ''

class ImageAnalysisResult(BaseModel):
    analysis: AnalysisResult
    extracted_claims: List[ClaimSchema] = Field(default_factory=list)
    sources: List[SourceSchema] = Field(default_factory=list)
    ocr_text: Optional[str] = None
    reverse_image_results: List[SourceSchema] = Field(default_factory=list)
    deepfake_probability: float = Field(default=0, ge=0, le=1)
    processing_time: float = 0.0
    model_versions: dict = Field(default_factory=dict)
