import io
import time
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from loguru import logger
from PIL import Image
from app.api.deps import get_detector
from app.core.config import settings
from app.core.constants import API, Limits, TrustScore
from app.core.security import verify_api_key
from app.schemas.analyze import AnalyzeTextRequest, ImageAnalysisResult, IndicatorSchema, SourceSchema, TextAnalysisResult, UrlAnalysisResult
from app.schemas.responses import SuccessResponse
from app.services.fake_news_detector import FakeNewsDetector
router = APIRouter(prefix=API.PREFIX, tags=['analyze'])

@router.post('/analyze/text', response_model=SuccessResponse[TextAnalysisResult], dependencies=[Depends(verify_api_key)])
async def analyze_text(payload: AnalyzeTextRequest, detector: FakeNewsDetector=Depends(get_detector)) -> SuccessResponse[TextAnalysisResult]:
    start = time.time()
    if not (payload.text and payload.text.strip()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={'error': {'code': 'EMPTY_TEXT', 'message': 'Text must contain non-whitespace characters'}})
    try:
        options = payload.options or {}
        result = detector.analyze_text(text=payload.text, extract_claims=options.extract_claims, fact_check=options.fact_check)
        result.processing_time = round(time.time() - start, 4)
        logger.info(f'text analyzed in {result.processing_time}s | score={result.analysis.trust_score} class={result.analysis.classification}')
        return SuccessResponse(data=result, message='Text analyzed successfully')
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception('Text analysis failed')
        msg = str(exc) if settings.env == 'development' else 'Analysis failed'
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={'error': {'code': 'ANALYSIS_FAILED', 'message': msg}})

@router.post('/analyze/url', response_model=SuccessResponse[UrlAnalysisResult], dependencies=[Depends(verify_api_key)])
async def analyze_url(payload: dict, detector: FakeNewsDetector=Depends(get_detector)) -> SuccessResponse[UrlAnalysisResult]:
    start = time.time()
    url = payload.get('url', '')
    text = payload.get('text', '')
    domain = payload.get('domain', '')
    if not text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={'error': {'code': 'MISSING_TEXT', 'message': 'text field required'}})
    options = payload.get('options') or {}
    result = detector.analyze_text(text=text, extract_claims=options.get('extract_claims', True), fact_check=options.get('fact_check', True))
    credibility = _quick_credibility(domain)
    adjusted_score = result.analysis.trust_score * 0.7 + credibility * 0.3
    if credibility < 30:
        adjusted_score *= 0.7
    adjusted_score = max(0.0, min(100.0, round(adjusted_score, 2)))
    result.analysis.trust_score = adjusted_score
    if adjusted_score >= TrustScore.REAL_THRESHOLD:
        result.analysis.classification = 'real'
    elif adjusted_score <= TrustScore.FAKE_THRESHOLD:
        result.analysis.classification = 'fake'
    else:
        result.analysis.classification = 'suspicious'
    url_result = UrlAnalysisResult(analysis=result.analysis, extracted_claims=result.extracted_claims, sources=result.sources, processing_time=round(time.time() - start, 4), model_versions=result.model_versions, source_credibility=credibility, source_reputation=_reputation(credibility), domain=domain or url)
    return SuccessResponse(data=url_result, message='URL analyzed successfully')

@router.post('/analyze/image', response_model=SuccessResponse[ImageAnalysisResult], dependencies=[Depends(verify_api_key)])
async def analyze_image(image: UploadFile=File(...), options: Optional[str]=Form(None), detector: FakeNewsDetector=Depends(get_detector)) -> SuccessResponse[ImageAnalysisResult]:
    start = time.time()
    if image.content_type not in Limits.ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={'error': {'code': 'INVALID_IMAGE', 'message': 'Unsupported image type'}})
    raw = await image.read()
    if len(raw) > Limits.IMAGE_MAX_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail={'error': {'code': 'IMAGE_TOO_LARGE', 'message': 'Max 10MB'}})
    if len(raw) < Limits.IMAGE_MIN_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={'error': {'code': 'INVALID_IMAGE', 'message': 'File too small to be an image'}})
    try:
        img = Image.open(io.BytesIO(raw))
        img.load()
        width, height = img.size
        format_name = img.format or 'UNKNOWN'
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={'error': {'code': 'INVALID_IMAGE', 'message': f'Could not parse image: {exc}'}})
    analysis_dict = {'classification': 'suspicious', 'trust_score': 50.0, 'confidence': 0.3, 'reasoning': ['Image-based analysis is heuristic only', f'Image: {width}x{height} {format_name}', 'For verified OCR/deepfake detection, enable transformer models'], 'indicators': {'clickbait': 0, 'emotional_manipulation': 0, 'sensationalism': 0, 'misleading_patterns': 0}}
    return SuccessResponse(data=ImageAnalysisResult(analysis=analysis_dict, extracted_claims=[], sources=[], ocr_text=None, reverse_image_results=[], deepfake_probability=0.0, processing_time=round(time.time() - start, 4), model_versions={'image': 'placeholder-v1'}), message='Image analyzed (heuristic mode)')

def _quick_credibility(domain: str) -> float:
    from app.core.constants import TRUSTED_SOURCES
    if not domain:
        return 50.0
    domain = domain.lower().replace('www.', '')
    if domain in TRUSTED_SOURCES:
        return float(TRUSTED_SOURCES[domain])
    score = 50.0
    tld = domain.split('.')[-1]
    if tld in {'gov', 'edu'}:
        score += 25
    elif tld in {'xyz', 'top', 'click', 'tk', 'ml', 'ga', 'cf'}:
        score -= 25
    sensational = ['truth', 'exposed', 'leaked', 'scandal', 'shocking', 'revealed']
    if any((k in domain for k in sensational)):
        score -= 15
    return max(0.0, min(100.0, score))

def _reputation(score: float) -> str:
    if score >= 80:
        return 'trusted'
    if score >= 60:
        return 'reliable'
    if score >= 40:
        return 'questionable'
    if score >= 20:
        return 'unreliable'
    return 'unknown'
