import re
from typing import Dict, List
from app.core.constants import REFUTED_CUES, TRUSTED_SOURCES, VERIFIED_CUES, FactVerification as F

class FactVerifier:
    _REFUTED_RE = re.compile('|'.join(REFUTED_CUES), re.IGNORECASE)
    _VERIFIED_RE = re.compile('|'.join(VERIFIED_CUES), re.IGNORECASE)

    def __init__(self, api_key: str=''):
        self.api_key = api_key

    def verify_claim(self, claim: str) -> Dict:
        if not claim or len(claim.strip()) < F.MIN_CLAIM_LEN:
            return {'verified': False, 'sources': [], 'confidence_modifier': F.NEUTRAL_CONFIDENCE, 'note': 'Claim too short to verify'}
        claim_text = claim.strip()
        if self._REFUTED_RE.search(claim_text):
            return {'verified': False, 'sources': ['https://www.snopes.com', 'https://www.factcheck.org'], 'confidence_modifier': F.REFUTED_CONFIDENCE, 'note': 'Claim matches known refuted misinformation patterns'}
        if self._VERIFIED_RE.search(claim_text):
            return {'verified': True, 'sources': [f'https://{s}' for s in ['reuters.com', 'apnews.com']], 'confidence_modifier': F.VERIFIED_CONFIDENCE, 'note': 'Claim includes attribution to a trusted source'}
        return {'verified': False, 'sources': [], 'confidence_modifier': F.NEUTRAL_CONFIDENCE, 'note': 'No matching trusted source found'}

    def get_trusted_sources(self) -> List[Dict]:
        return [{'domain': d, 'credibility': s} for d, s in TRUSTED_SOURCES.items()]
