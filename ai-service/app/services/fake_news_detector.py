from dataclasses import asdict
from typing import Dict, List, Optional, Tuple
from app.core.constants import FactVerification as F, IndicatorWeights as IW, REFUTED_CUES
from app.indicators import ClickbaitDetector, EmotionalDetector, SensationalDetector
from app.models import Ensemble
from app.schemas.analyze import AnalysisResult, ClaimSchema, IndicatorSchema, SourceSchema, TextAnalysisResult
from .claim_extractor import ClaimExtractor
from .fact_verifier import FactVerifier
from .nlp_pipeline import NLPPipeline, ProcessedText
from .trust_scorer import TrustScorer
import re
_REFUTED_DOC_RE = re.compile('|'.join(REFUTED_CUES), re.IGNORECASE)

class FakeNewsDetector:
    MODEL_VERSIONS: dict = {}

    def __init__(self, use_transformer: bool=False):
        self.pipeline = NLPPipeline()
        self.ensemble = Ensemble(use_transformer=use_transformer)
        self.claim_extractor = ClaimExtractor(self.pipeline)
        self.clickbait = ClickbaitDetector()
        self.emotional = EmotionalDetector()
        self.sensational = SensationalDetector()
        self.trust_scorer = TrustScorer()
        self.fact_verifier = FactVerifier()

    def analyze_text(self, text: str, extract_claims: bool=True, fact_check: bool=True) -> TextAnalysisResult:
        processed = self.pipeline.process(text)
        indicators = self._score_indicators(processed.cleaned)
        document_has_refuted_cue = bool(_REFUTED_DOC_RE.search(text or ''))
        claims: List[ClaimSchema] = []
        verified_count = 0
        refuted_count = 0
        if extract_claims:
            raw_claims = self.claim_extractor.extract(processed)
            for c in raw_claims:
                if fact_check:
                    verification = self.fact_verifier.verify_claim(c.text)
                    is_refuted = not verification['verified'] and verification.get('confidence_modifier', F.NEUTRAL_CONFIDENCE) <= F.REFUTED_CONFIDENCE
                    is_verified = bool(verification['verified'])
                    if is_refuted:
                        refuted_count += 1
                    elif is_verified:
                        verified_count += 1
                    claims.append(ClaimSchema(text=c.text, verified=is_verified, confidence=c.confidence * verification.get('confidence_modifier', F.NEUTRAL_CONFIDENCE), sources=verification.get('sources', []), verification_note=verification.get('note')))
                else:
                    claims.append(ClaimSchema(text=c.text, confidence=c.confidence))
        probs = self.ensemble.predict(processed.cleaned, indicators)
        total_claims = len(claims)
        if total_claims > 0:
            verified_ratio = verified_count / total_claims
        else:
            verified_ratio = F.NEUTRAL_CONFIDENCE
        trust = self.trust_scorer.compute(probs, indicators, verified_ratio, refuted_count=refuted_count, verified_count=verified_count, total_claims=total_claims, document_has_refuted_cue=document_has_refuted_cue)
        sources: List[SourceSchema] = []
        for c in claims:
            for s in c.sources:
                if s and s not in [x.url for x in sources]:
                    sources.append(SourceSchema(name=self._domain_name(s), url=s, credibility_score=70, agreement='neutral'))
        analysis = AnalysisResult(classification=trust.classification, trust_score=trust.trust_score, confidence=trust.confidence, reasoning=trust.reasoning, indicators=IndicatorSchema(clickbait=indicators['clickbait'], emotional_manipulation=indicators['emotional_manipulation'], sensationalism=indicators['sensationalism'], misleading_patterns=indicators['misleading_patterns']))
        return TextAnalysisResult(analysis=analysis, extracted_claims=claims, sources=sources, processing_time=0.0, model_versions=self.ensemble.get_model_versions())

    def _score_indicators(self, text: str) -> Dict[str, float]:
        clickbait_score, _ = self.clickbait.score(text)
        emotional_score, _ = self.emotional.score(text)
        sensational_score, _ = self.sensational.score(text)
        cb_w, sens_w, emo_w = IW.MISLEADING_WEIGHTS
        misleading = round(clickbait_score * cb_w + sensational_score * sens_w + emotional_score * emo_w, 2)
        return {'clickbait': clickbait_score, 'emotional_manipulation': emotional_score, 'sensationalism': sensational_score, 'misleading_patterns': misleading}

    @staticmethod
    def _domain_name(url: str) -> str:
        try:
            from urllib.parse import urlparse
            host = urlparse(url).netloc
            return host.replace('www.', '') if host else url
        except Exception:
            return url
