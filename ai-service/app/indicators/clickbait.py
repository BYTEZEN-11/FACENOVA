import re
from typing import List, Tuple
from app.core.constants import HIGH_CLICKBAIT_PHRASES, MEDIUM_CLICKBAIT_PHRASES, ClickbaitWeights as W

class ClickbaitDetector:

    def score(self, text: str) -> Tuple[float, List[str]]:
        if not text:
            return (0.0, [])
        matches: List[str] = []
        score = 0.0
        text_lower = text.lower()
        for pattern in HIGH_CLICKBAIT_PHRASES:
            if re.search(pattern, text_lower):
                score += W.HIGH_PHRASE_SCORE
                matches.append(f'clickbait: {pattern[:40]}')
        for pattern in MEDIUM_CLICKBAIT_PHRASES:
            if re.search(pattern, text_lower):
                score += W.MEDIUM_PHRASE_SCORE
                matches.append(f'hook: {pattern[:40]}')
        exclamations = len(re.findall('[!?]{2,}', text))
        if exclamations >= 1:
            score += min(W.EXCESSIVE_PUNCT_MAX, exclamations * W.EXCESSIVE_PUNCT_UNIT)
            matches.append('excessive_punctuation')
        all_caps_words = re.findall('\\b[A-Z]{3,}\\b', text)
        if len(all_caps_words) >= 2:
            score += W.ALL_CAPS_SCORE
            matches.append('all_caps')
        words = re.findall('\\b[A-Za-z]+\\b', text[:200])
        if len(words) >= 5:
            caps = sum((1 for w in words if w[0].isupper()))
            ratio = caps / len(words)
            if ratio > W.TITLE_CASE_RATIO and len(words) > W.TITLE_CASE_MIN_WORDS:
                score += W.TITLE_CASE_SCORE
                matches.append('title_case_heavy')
        if re.search('\\b(top\\s*\\d+|\\d+\\s+(things|ways|reasons|secrets))\\b', text_lower):
            score += W.LISTICLE_SCORE
            matches.append('listicle_pattern')
        score = max(0.0, min(100.0, score))
        return (score, matches)
