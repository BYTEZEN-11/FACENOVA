import re
from dataclasses import dataclass
from typing import List
from app.core.constants import ClaimExtraction as C
from .nlp_pipeline import NLPPipeline, ProcessedText

@dataclass
class Claim:
    text: str
    confidence: float
    sentence_index: int
    has_quantifier: bool = False
    has_named_entity: bool = False
    is_past_tense: bool = False

class ClaimExtractor:

    def __init__(self, nlp_pipeline: NLPPipeline):
        self.pipeline = nlp_pipeline

    def extract(self, processed: ProcessedText, max_claims: int=C.MAX_CLAIMS) -> List[Claim]:
        claims: List[Claim] = []
        for idx, sentence in enumerate(processed.sentences):
            claim = self._evaluate_sentence(sentence, idx)
            if claim is not None:
                claims.append(claim)
            if len(claims) >= max_claims:
                break
        claims.sort(key=lambda c: c.confidence, reverse=True)
        return claims[:max_claims]

    def _evaluate_sentence(self, sentence: str, idx: int) -> Claim | None:
        s = sentence.strip()
        if not s or len(s) < C.MIN_SENTENCE_LEN:
            return None
        if s.endswith('?'):
            return None
        if re.match("^(please|kindly|do|don't|never|always)\\b", s, re.IGNORECASE):
            return None
        lower = s.lower()
        words = set(re.findall("\\b[a-z']+\\b", lower))
        has_claim_verb = bool(words & C.CLAIM_VERBS)
        if not has_claim_verb:
            return None
        opinion_cues = {'i think', 'i believe', 'i feel', 'in my opinion', 'imo', 'i guess'}
        if any((lower.startswith(c) for c in opinion_cues)):
            return None
        has_quantifier = bool(words & C.QUANTIFIERS)
        has_named_entity = self._has_named_entity(s)
        is_past_tense = any((word.endswith('ed') or word in {'was', 'were', 'had', 'did', 'said'} for word in words))
        confidence = C.BASE_CONFIDENCE
        if has_claim_verb:
            confidence += C.CLAIM_VERB_BONUS
        if has_quantifier:
            confidence += C.QUANTIFIER_BONUS
        if has_named_entity:
            confidence += C.NAMED_ENTITY_BONUS
        if is_past_tense:
            confidence += C.PAST_TENSE_BONUS
        wc = len(s.split())
        if C.MIN_WORDS_FOR_LENGTH_BONUS <= wc <= C.MAX_WORDS_FOR_LENGTH_BONUS:
            confidence += C.LENGTH_BONUS
        confidence = min(C.MAX_CONFIDENCE, confidence)
        return Claim(text=s, confidence=round(confidence, 3), sentence_index=idx, has_quantifier=has_quantifier, has_named_entity=has_named_entity, is_past_tense=is_past_tense)

    def _has_named_entity(self, sentence: str) -> bool:
        if re.search('\\b[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)+\\b', sentence):
            return True
        if re.search('\\b\\d+(?:[\\.,]\\d+)?\\b', sentence):
            return True
        if re.search('\\b(19|20)\\d{2}\\b', sentence):
            return True
        return False
