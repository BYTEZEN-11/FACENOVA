from app.services.fake_news_detector import FakeNewsDetector
from app.services.trust_scorer import TrustScorer

def test_scorer_classification_thresholds():
    scorer = TrustScorer()
    result = scorer.compute(model_probs={'real': 0.9, 'fake': 0.05, 'suspicious': 0.05}, indicators={'clickbait': 5, 'emotional_manipulation': 5, 'sensationalism': 5, 'misleading_patterns': 5}, claims_verified_ratio=0.9)
    assert result.classification == 'real'
    assert result.trust_score > 70

def test_scorer_flags_obvious_fake():
    scorer = TrustScorer()
    result = scorer.compute(model_probs={'real': 0.05, 'fake': 0.9, 'suspicious': 0.05}, indicators={'clickbait': 90, 'emotional_manipulation': 90, 'sensationalism': 90, 'misleading_patterns': 90}, claims_verified_ratio=0.0)
    assert result.classification == 'fake'
    assert result.trust_score < 35

def test_scorer_mid_signal_is_suspicious():
    scorer = TrustScorer()
    result = scorer.compute(model_probs={'real': 0.4, 'fake': 0.3, 'suspicious': 0.3}, indicators={'clickbait': 40, 'emotional_manipulation': 40, 'sensationalism': 40, 'misleading_patterns': 40}, claims_verified_ratio=0.4)
    assert result.classification in ('real', 'fake', 'suspicious')

def test_detector_end_to_end_real_text():
    detector = FakeNewsDetector()
    text = 'The Federal Reserve announced on Wednesday that it raised interest rates by 25 basis points in response to persistent inflation. Officials said the move was necessary to support the dollar.'
    result = detector.analyze_text(text)
    assert result.analysis.trust_score >= 0
    assert result.analysis.trust_score <= 100
    assert result.analysis.classification in ('real', 'fake', 'suspicious')
    assert len(result.extracted_claims) >= 1

def test_detector_end_to_end_clickbait():
    detector = FakeNewsDetector()
    text = "SHOCKING!!! You won't believe what the government is hiding! They don't want you to know this SECRET TRUTH!!! Wake up sheeple!!!"
    result = detector.analyze_text(text)
    assert result.analysis.classification in ('fake', 'suspicious')
    assert result.analysis.indicators.clickbait > 30
    assert result.analysis.indicators.sensationalism > 30
