import re
from abc import ABC, abstractmethod
from typing import Dict
from app.core.constants import CONSPIRACY_CUE_PATTERNS, REFUTED_CUES, VAGUE_CUE_PATTERNS, VERIFIED_CUES

class ClassifierBase(ABC):
    name: str = 'base'

    @abstractmethod
    def predict(self, text: str) -> Dict[str, float]:
        pass

    def is_loaded(self) -> bool:
        return True
_REFUTED_RE = re.compile('|'.join(REFUTED_CUES), re.IGNORECASE)
_VERIFIED_RE = re.compile('|'.join(VERIFIED_CUES), re.IGNORECASE)
_CONSPIRACY_RE = re.compile('|'.join(CONSPIRACY_CUE_PATTERNS), re.IGNORECASE)
_VAGUE_RE = re.compile('|'.join(VAGUE_CUE_PATTERNS), re.IGNORECASE)

class HeuristicClassifier(ClassifierBase):
    name = 'heuristic-v1'

    def __init__(self, name: str='heuristic-v1', bias: float=0.0, sensitivity: float=1.0):
        self.name = name
        self.bias = float(bias)
        self.sensitivity = float(sensitivity)

    def predict(self, text: str, indicators: Dict[str, float]=None) -> Dict[str, float]:
        indicators = indicators or {}
        text_stripped = (text or '').strip()
        if not text_stripped:
            return {'real': 0.33, 'fake': 0.34, 'suspicious': 0.33}
        words = text_stripped.split()
        word_count = len(words)
        clickbait = indicators.get('clickbait', 0)
        emotional = indicators.get('emotional_manipulation', 0)
        sensational = indicators.get('sensationalism', 0)
        misleading = indicators.get('misleading_patterns', 0)
        manipulation_score = clickbait * 0.3 + emotional * 0.3 + sensational * 0.25 + misleading * 0.15
        manipulation_score = manipulation_score + self.bias
        refuted_hits = len(_REFUTED_RE.findall(text_stripped))
        verified_hits = len(_VERIFIED_RE.findall(text_stripped))
        conspiracy_hits = len(_CONSPIRACY_RE.findall(text_stripped))
        vague_hits = len(_VAGUE_RE.findall(text_stripped))
        cue_shift = min(100.0, refuted_hits * 40.0) - min(40.0, verified_hits * 15.0)
        cue_shift += min(60.0, conspiracy_hits * 20.0 + vague_hits * 12.0)
        manipulation_score = manipulation_score + cue_shift
        length_factor = 1.0
        if word_count < 15:
            length_factor = 1.15
        elif word_count > 200:
            length_factor = 0.95
        unique = len(set((w.lower() for w in words)))
        diversity = unique / max(1, word_count)
        if diversity < 0.4 and manipulation_score > 50:
            manipulation_score *= 1.2
        p_fake = min(1.0, max(0.0, manipulation_score / 100.0 * length_factor * self.sensitivity))
        if 0.2 < p_fake < 0.7:
            p_suspicious = 0.5 * (1 - abs(p_fake - 0.5) * 2)
        else:
            p_suspicious = 0.15
        p_real = max(0.02, 1.0 - p_fake - p_suspicious)
        total = p_real + p_fake + p_suspicious
        return {'real': round(p_real / total, 4), 'fake': round(p_fake / total, 4), 'suspicious': round(p_suspicious / total, 4)}
