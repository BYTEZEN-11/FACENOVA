from dataclasses import dataclass
from typing import Dict, List, Optional
from app.core.constants import IndicatorWeights, TrustScore

@dataclass
class TrustResult:
    trust_score: float
    classification: str
    confidence: float
    reasoning: List[str]

class TrustScorer:

    def __init__(self, model_weight: float=TrustScore.MODEL_WEIGHT, indicator_weight: float=TrustScore.INDICATOR_WEIGHT, claim_weight: float=TrustScore.CLAIM_WEIGHT, real_threshold: float=TrustScore.REAL_THRESHOLD, fake_threshold: float=TrustScore.FAKE_THRESHOLD):
        assert abs(model_weight + indicator_weight + claim_weight - 1.0) < 1e-06, 'Trust-score weights must sum to 1.0'
        self.MODEL_WEIGHT = model_weight
        self.INDICATOR_WEIGHT = indicator_weight
        self.CLAIM_WEIGHT = claim_weight
        self.REAL_THRESHOLD = real_threshold
        self.FAKE_THRESHOLD = fake_threshold

    def compute(self, model_probs: Dict[str, float], indicators: Dict[str, float], claims_verified_ratio: float, refuted_count: int=0, verified_count: int=0, total_claims: int=0, document_has_refuted_cue: bool=False, reasoning: Optional[List[str]]=None) -> TrustResult:
        reasoning = list(reasoning or [])
        real_prob = model_probs.get('real', 0.0)
        fake_prob = model_probs.get('fake', 0.0)
        suspicious_prob = model_probs.get('suspicious', 0.0)
        model_score = real_prob * 100.0
        indicator_penalty = indicators.get('clickbait', 0) * IndicatorWeights.CLICKBAIT + indicators.get('emotional_manipulation', 0) * IndicatorWeights.EMOTIONAL + indicators.get('sensationalism', 0) * IndicatorWeights.SENSATIONAL + indicators.get('misleading_patterns', 0) * IndicatorWeights.MISLEADING
        indicator_score = max(0.0, 100.0 - indicator_penalty)
        claim_score = max(0.0, min(100.0, claims_verified_ratio * 100.0))
        trust = model_score * self.MODEL_WEIGHT + indicator_score * self.INDICATOR_WEIGHT + claim_score * self.CLAIM_WEIGHT
        refuted_penalty = min(IndicatorWeights.REFUTED_MAX_PENALTY, refuted_count * IndicatorWeights.REFUTED_PENALTY)
        trust -= refuted_penalty
        verified_bonus = min(IndicatorWeights.VERIFIED_MAX_BONUS, verified_count * IndicatorWeights.VERIFIED_BONUS)
        trust += verified_bonus
        trust = max(0.0, min(100.0, round(trust, 2)))
        classification = self._classify(trust)
        if total_claims > 0:
            refuted_ratio = refuted_count / total_claims
            if refuted_ratio >= IndicatorWeights.REFUTED_RATIO_OVERRIDE:
                trust = min(trust, IndicatorWeights.REFUTED_HARD_CAP)
                classification = 'fake'
        if document_has_refuted_cue:
            trust = min(trust, IndicatorWeights.DOCUMENT_REFUTED_CAP)
            classification = 'fake'
        sorted_probs = sorted([real_prob, fake_prob, suspicious_prob], reverse=True)
        if len(sorted_probs) >= 2:
            margin = sorted_probs[0] - sorted_probs[1]
        else:
            margin = 0.0
        confidence = round(max(0.1, min(0.99, 0.5 + margin)), 3)
        if not reasoning:
            reasoning = self._build_reasoning(trust, classification, model_score, indicator_penalty, claim_score, refuted_count, verified_count, total_claims, document_has_refuted_cue)
        return TrustResult(trust_score=trust, classification=classification, confidence=confidence, reasoning=reasoning)

    def _classify(self, trust: float) -> str:
        if trust >= self.REAL_THRESHOLD:
            return 'real'
        if trust <= self.FAKE_THRESHOLD:
            return 'fake'
        return 'suspicious'

    def _build_reasoning(self, trust: float, classification: str, model_score: float, indicator_penalty: float, claim_score: float, refuted_count: int, verified_count: int, total_claims: int, document_has_refuted_cue: bool) -> List[str]:
        reasons = []
        if classification == 'real':
            reasons.append(f'Model ensemble rates this content as likely real ({model_score:.0f}/100).')
        elif classification == 'fake':
            reasons.append(f'Model ensemble rates this content as likely fake ({model_score:.0f}/100).')
        else:
            reasons.append(f'Model ensemble gives a mixed signal ({model_score:.0f}/100).')
        if indicator_penalty > 60:
            reasons.append(f'High manipulation indicators detected (penalty {indicator_penalty:.0f}/100).')
        elif indicator_penalty > 30:
            reasons.append(f'Moderate manipulation indicators (penalty {indicator_penalty:.0f}/100).')
        else:
            reasons.append(f'Low manipulation indicators (penalty {indicator_penalty:.0f}/100).')
        if total_claims > 0:
            reasons.append(f'Verified {verified_count}/{total_claims} claims and refuted {refuted_count}.')
        elif claim_score < 30:
            reasons.append('Few or no claims could be verified against trusted sources.')
        elif claim_score > 70:
            reasons.append('Most claims were corroborated by trusted sources.')
        if document_has_refuted_cue:
            reasons.append('Text contains phrases matching known-refuted misinformation patterns.')
        reasons.append(f'Final trust score: {trust:.1f}/100.')
        return reasons
