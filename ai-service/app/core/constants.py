from __future__ import annotations
from typing import Dict, List, Tuple

class TrustScore:
    REAL_THRESHOLD: float = 65.0
    FAKE_THRESHOLD: float = 35.0
    MODEL_WEIGHT: float = 0.55
    INDICATOR_WEIGHT: float = 0.3
    CLAIM_WEIGHT: float = 0.15

class IndicatorWeights:
    CLICKBAIT: float = 0.3
    EMOTIONAL: float = 0.3
    SENSATIONAL: float = 0.25
    MISLEADING: float = 0.15
    MISLEADING_WEIGHTS: Tuple[float, float, float] = (0.35, 0.4, 0.25)
    REFUTED_PENALTY: float = 18.0
    REFUTED_MAX_PENALTY: float = 60.0
    VERIFIED_BONUS: float = 6.0
    VERIFIED_MAX_BONUS: float = 20.0
    REFUTED_RATIO_OVERRIDE: float = 0.34
    REFUTED_HARD_CAP: float = 35.0
    DOCUMENT_REFUTED_CAP: float = 30.0

class ClickbaitWeights:
    HIGH_PHRASE_SCORE: float = 35.0
    MEDIUM_PHRASE_SCORE: float = 15.0
    EXCESSIVE_PUNCT_MAX: float = 20.0
    EXCESSIVE_PUNCT_UNIT: float = 10.0
    ALL_CAPS_SCORE: float = 15.0
    TITLE_CASE_SCORE: float = 10.0
    LISTICLE_SCORE: float = 12.0
    TITLE_CASE_MIN_WORDS: int = 8
    TITLE_CASE_RATIO: float = 0.5

class EmotionalWeights:
    FEAR_PER_HIT: float = 8.0
    FEAR_CAP: float = 30.0
    ANGER_PER_HIT: float = 7.0
    ANGER_CAP: float = 30.0
    URGENCY_PER_HIT: float = 10.0
    URGENCY_CAP: float = 25.0
    DIVISION_PER_HIT: float = 6.0
    DIVISION_CAP: float = 20.0
    EXCLAMATION_UNIT: float = 2.0
    EXCLAMATION_THRESHOLD: int = 2
    EXCLAMATION_CAP: float = 15.0
    SHOUTING_UNIT: float = 3.0
    SHOUTING_THRESHOLD: int = 2
    SHOUTING_CAP: float = 10.0

class SensationalWeights:
    SENSATIONAL_PER_HIT: float = 6.0
    SENSATIONAL_CAP: float = 25.0
    POWER_PER_HIT: float = 5.0
    POWER_CAP: float = 15.0
    CONSPIRACY_PER_HIT: float = 10.0
    CONSPIRACY_CAP: float = 30.0
    VAGUE_PER_HIT: float = 7.0
    VAGUE_CAP: float = 20.0
    ALL_CAPS_UNIT: float = 3.0
    ALL_CAPS_THRESHOLD: int = 2
    ALL_CAPS_CAP: float = 10.0
    EXCESSIVE_PUNCT_SCORE: float = 8.0
HIGH_CLICKBAIT_PHRASES: List[str] = ["\\byou'?ll never believe\\b", "\\bwhat they (don'?t want|don'?t want you) to know\\b", '\\bthe truth (about|behind|that)\\b', '\\b\\d+ (things|ways|reasons|secrets) (you|that)\\b', '\\bshocking(ly)?\\b', '\\bthis is why\\b', '\\bdoctors hate (him|this|them)\\b', '\\bone weird trick\\b', '\\bgo(?:es)? viral\\b', '\\bchanged (everything|my life)\\b']
MEDIUM_CLICKBAIT_PHRASES: List[str] = ["\\b(can'?t|couldn'?t) (stop|believe)\\b", '\\b(secret|hidden) (truth|reason|meaning)\\b', '\\b(amazing|incredible|unbelievable)\\b', '\\b(must|need) to (see|read|watch|know)\\b', '\\b(reasons|things) why\\b']
CONSPIRACY_CUE_PATTERNS: List[str] = ['\\bwake up\\b', '\\bopen your eyes\\b', '\\bdo your research\\b', "\\bthey (don'?t want|wants?) you to know\\b", '\\bmainstream media\\b', '\\bcover[- ]?up\\b', '\\bfalse flag\\b', '\\bcrisis actor\\b', '\\bcrisis actors\\b', '\\bdeep state\\b', '\\bnew world order\\b', '\\bplandemic\\b', '\\bscamdemic\\b', '\\bclimate hoax\\b', '\\belection fraud\\b', '\\bchemtrails?\\b', '\\bbig pharma\\b', '\\bbig tech\\b', '\\bsheeple\\b', '\\bthey are lying\\b']
VAGUE_CUE_PATTERNS: List[str] = ['\\bmany people say\\b', '\\beveryone knows\\b', '\\bit is (said|believed|known) that\\b', '\\bsources say\\b', '\\banonymous source\\b', '\\bunnamed source\\b', '\\bsome say\\b', '\\bthey say\\b', '\\bviral (post|video|message)\\b', '\\bforwarded (message|whatsapp)\\b', '\\baccording to (rumors|rumours|whatsapp|social media)\\b']
SENSATIONAL_ADJECTIVES: set = {'shocking', 'stunning', 'incredible', 'unbelievable', 'mind-blowing', 'jaw-dropping', 'bombshell', 'explosive', 'scandalous', 'outrageous', 'horrific', 'devastating', 'unprecedented', 'epic', 'massive', 'huge', 'breaking', 'exclusive', 'urgent', 'viral', 'sensational', 'miracle'}
CONSPIRACY_PHRASES: List[str] = ['wake up', 'open your eyes', 'do your research', "they don't want you to know", 'mainstream media', 'mainstream media lies', 'cover up', 'cover-up', 'false flag', 'crisis actor', 'crisis actors', 'sheep', 'sheeple', 'big pharma', 'big tech', 'deep state', 'the elites', 'new world order', 'plandemic', 'scamdemic', 'climate hoax', 'election fraud']
VAGUE_ATTRIBUTION: List[str] = ['\\bmany people say\\b', '\\beveryone knows\\b', '\\bit is (said|believed|known) that\\b', '\\bsources say\\b', '\\banonymous source\\b', '\\bunnamed source\\b', '\\bsome say\\b', '\\bthey say\\b', '\\bviral (post|video|message)\\b', '\\bforwarded (message|whatsapp)\\b', '\\baccording to (rumors|rumours|whatsapp|social media)\\b']
POWER_WORDS: set = {'free', 'instantly', 'guaranteed', 'proven', 'secret', 'revealed', 'exposed', 'banned', 'censored', 'leaked', 'scandal'}
FEAR_WORDS: set = {'danger', 'dangerous', 'threat', 'threatened', 'warning', 'alert', 'panic', 'scared', 'afraid', 'terrifying', 'horrifying', 'horror', 'doom', 'catastrophe', 'catastrophic', 'disaster', 'crisis', 'emergency', 'urgent', 'deadly', 'fatal', 'kill', 'killing', 'destroy', 'destruction', 'obliterate', 'annihilate', 'apocalypse'}
ANGER_WORDS: set = {'outrage', 'outraged', 'furious', 'rage', 'enraged', 'infuriating', 'disgusting', 'disgust', 'vile', 'hateful', 'hate', 'evil', 'wicked', 'corrupt', 'corruption', 'shameful', 'shame', 'betrayal', 'betrayed', 'sickening', 'sick', 'appalling', 'horrific', 'atrocious', 'monstrous'}
URGENCY_PHRASES: List[str] = ['now', 'immediately', 'urgent', 'hurry', 'quickly', 'breaking', 'just in', 'happening now', 'right now', 'this instant', 'asap', "before it's too late", 'last chance', "don't miss", 'running out', 'limited time', 'act now', 'share before', 'before they delete']
DIVISION_PHRASES: List[str] = ['they', 'them', 'those people', 'elites', 'sheeple', 'woke', 'snowflake', 'libtard', 'trumpers', 'leftists', 'radicals', 'enemies', 'traitors', 'patriots', 'real americans', 'real indians', 'us vs them', 'us versus them', 'the other side']

class FactVerification:
    REFUTED_CONFIDENCE: float = 0.1
    VERIFIED_CONFIDENCE: float = 0.9
    NEUTRAL_CONFIDENCE: float = 0.5
    MIN_CLAIM_LEN: int = 5
REFUTED_CUES: List[str] = ['\\ball private colleges\\b', '\\bearth is flat\\b', '\\bvaccines? cause autism\\b', '\\bcovid(?:-\\d+)? is (?:a )?hoax\\b', '\\b5g causes covid\\b', '\\bchemtrails?\\b', '\\bsandy hook hoax\\b', '\\bmoon landing (?:was )?fake\\b']
VERIFIED_CUES: List[str] = ['\\baccording to reuters\\b', '\\baccording to (?:the )?associated press\\b', '\\baccording to bbc\\b', '\\bofficial statement\\b', '\\bpress release\\b', '\\bpeer[- ]reviewed\\b']
TRUSTED_SOURCES: Dict[str, int] = {'reuters.com': 96, 'apnews.com': 95, 'bbc.com': 94, 'bbc.co.uk': 94, 'npr.org': 92, 'nytimes.com': 89, 'washingtonpost.com': 88, 'theguardian.com': 88, 'wsj.com': 89, 'economist.com': 90, 'snopes.com': 95, 'factcheck.org': 96, 'politifact.com': 93, 'who.int': 96, 'cdc.gov': 96, 'nih.gov': 95}

class ClaimExtraction:
    CLAIM_VERBS: set = {'is', 'are', 'was', 'were', 'has', 'have', 'had', 'says', 'said', 'announces', 'announced', 'reports', 'reported', 'confirms', 'confirmed', 'denies', 'denied', 'reveals', 'revealed', 'claims', 'claimed', 'states', 'stated', 'shows', 'showed', 'found', 'finds', 'discovered', 'proved', 'proven'}
    QUANTIFIERS: set = {'all', 'every', 'none', 'no', 'many', 'most', 'some', 'few', 'million', 'billion', 'thousand', 'hundred', '%', 'percent', 'first', 'last', 'next', 'always', 'never', 'only'}
    MIN_SENTENCE_LEN: int = 12
    MAX_CLAIMS: int = 8
    BASE_CONFIDENCE: float = 0.5
    CLAIM_VERB_BONUS: float = 0.15
    QUANTIFIER_BONUS: float = 0.1
    NAMED_ENTITY_BONUS: float = 0.15
    PAST_TENSE_BONUS: float = 0.1
    LENGTH_BONUS: float = 0.05
    MAX_CONFIDENCE: float = 0.95
    MIN_WORDS_FOR_LENGTH_BONUS: int = 8
    MAX_WORDS_FOR_LENGTH_BONUS: int = 30

class Limits:
    TEXT_MIN: int = 10
    TEXT_MAX: int = 50000
    URL_MAX: int = 2048
    IMAGE_MAX_BYTES: int = 10 * 1024 * 1024
    IMAGE_MIN_BYTES: int = 8
    ALLOWED_IMAGE_TYPES: set = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}

class Ensemble:
    DEFAULT_WEIGHTS: Dict[str, float] = {'bert-base-uncased': 0.4, 'roberta-base': 0.4, 'distilbert-base-uncased': 0.2}

class API:
    VERSION: str = 'v1'
    PREFIX: str = '/api/v1'
    DEFAULT_PORT: int = 8000
    DEFAULT_HOST: str = '0.0.0.0'
    SERVICE_NAME: str = 'AI Fake News Detection'
    SERVICE_VERSION: str = '1.0.0'
    DOCS_URL: str = '/docs'
    REDOC_URL: str = '/redoc'
    OPENAPI_URL: str = '/openapi.json'
    RATE_LIMIT_WINDOW_MS: int = 60 * 1000
    RATE_LIMIT_MAX: int = 300

class Log:
    DEFAULT_LEVEL: str = 'INFO'
    FILE_PATTERN: str = 'logs/ai-service-{time:YYYY-MM-DD}.log'
    ROTATION: str = '20 MB'
    RETENTION: str = '14 days'
    COMPRESSION: str = 'zip'
