import re
from typing import List, Tuple
from app.core.constants import ANGER_WORDS, DIVISION_PHRASES, FEAR_WORDS, URGENCY_PHRASES, EmotionalWeights as W

def _word_bounded_patterns(phrases: List[str]) -> List[re.Pattern]:
    return [re.compile(f"(?<![A-Za-z0-9']){re.escape(p)}(?![A-Za-z0-9'])", re.IGNORECASE) for p in phrases]

class EmotionalDetector:
    _URGENCY_PATTERNS = _word_bounded_patterns(URGENCY_PHRASES)
    _DIVISION_PATTERNS = _word_bounded_patterns(DIVISION_PHRASES)

    def score(self, text: str) -> Tuple[float, List[str]]:
        if not text:
            return (0.0, [])
        categories: List[str] = []
        score = 0.0
        text_lower = text.lower()
        words = set(re.findall("\\b[a-z']+\\b", text_lower))
        fear_hits = words & FEAR_WORDS
        if fear_hits:
            score += min(W.FEAR_CAP, len(fear_hits) * W.FEAR_PER_HIT)
            categories.append(f'fear_language({len(fear_hits)})')
        anger_hits = words & ANGER_WORDS
        if anger_hits:
            score += min(W.ANGER_CAP, len(anger_hits) * W.ANGER_PER_HIT)
            categories.append(f'anger_language({len(anger_hits)})')
        urgency_hits = sum((1 for p in self._URGENCY_PATTERNS if p.search(text)))
        if urgency_hits:
            score += min(W.URGENCY_CAP, urgency_hits * W.URGENCY_PER_HIT)
            categories.append(f'urgency_cues({urgency_hits})')
        division_hits = sum((1 for p in self._DIVISION_PATTERNS if p.search(text)))
        if division_hits:
            score += min(W.DIVISION_CAP, division_hits * W.DIVISION_PER_HIT)
            categories.append(f'division_language({division_hits})')
        exclamations = text.count('!')
        if exclamations >= W.EXCLAMATION_THRESHOLD:
            score += min(W.EXCLAMATION_CAP, exclamations * W.EXCLAMATION_UNIT)
            categories.append('excessive_exclamations')
        shouting = len(re.findall('\\b[A-Z]{2,}\\b', text))
        if shouting >= W.SHOUTING_THRESHOLD:
            score += min(W.SHOUTING_CAP, shouting * W.SHOUTING_UNIT)
            categories.append('shouting')
        score = max(0.0, min(100.0, score))
        return (score, categories)
