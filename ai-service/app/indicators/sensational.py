import re
from typing import List, Tuple
from app.core.constants import CONSPIRACY_PHRASES, POWER_WORDS, SENSATIONAL_ADJECTIVES, VAGUE_ATTRIBUTION, SensationalWeights as W

class SensationalDetector:
    _VAGUE_PATTERNS = [re.compile(p) for p in VAGUE_ATTRIBUTION]

    def score(self, text: str) -> Tuple[float, List[str]]:
        if not text:
            return (0.0, [])
        categories: List[str] = []
        score = 0.0
        text_lower = text.lower()
        words = set(re.findall("\\b[a-z']+\\b", text_lower))
        sens_hits = words & SENSATIONAL_ADJECTIVES
        if sens_hits:
            score += min(W.SENSATIONAL_CAP, len(sens_hits) * W.SENSATIONAL_PER_HIT)
            categories.append(f'sensational_adjectives({len(sens_hits)})')
        power_hits = words & POWER_WORDS
        if power_hits:
            score += min(W.POWER_CAP, len(power_hits) * W.POWER_PER_HIT)
            categories.append(f'power_words({len(power_hits)})')
        conspir_hits = sum((1 for phrase in CONSPIRACY_PHRASES if phrase in text_lower))
        if conspir_hits:
            score += min(W.CONSPIRACY_CAP, conspir_hits * W.CONSPIRACY_PER_HIT)
            categories.append(f'conspiracy_framing({conspir_hits})')
        vague_hits = sum((1 for pattern in self._VAGUE_PATTERNS if pattern.search(text_lower)))
        if vague_hits:
            score += min(W.VAGUE_CAP, vague_hits * W.VAGUE_PER_HIT)
            categories.append(f'vague_attribution({vague_hits})')
        all_caps = len(re.findall('\\b[A-Z]{3,}\\b', text))
        if all_caps >= W.ALL_CAPS_THRESHOLD:
            score += min(W.ALL_CAPS_CAP, all_caps * W.ALL_CAPS_UNIT)
            categories.append('all_caps')
        if re.search('[!?]{2,}', text):
            score += W.EXCESSIVE_PUNCT_SCORE
            categories.append('excessive_punctuation')
        score = max(0.0, min(100.0, score))
        return (score, categories)
