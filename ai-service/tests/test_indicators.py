from app.indicators import ClickbaitDetector, EmotionalDetector, SensationalDetector

def test_clickbait_detects_listicle():
    detector = ClickbaitDetector()
    score, _ = detector.score("7 things you didn't know about the moon")
    assert score > 30

def test_clickbait_detects_curiosity_gap():
    detector = ClickbaitDetector()
    score, _ = detector.score("What they don't want you to know about vaccines")
    assert score > 30

def test_clickbait_neutral_text():
    detector = ClickbaitDetector()
    score, _ = detector.score('The weather in Paris is mild today.')
    assert score < 20

def test_emotional_detects_fear():
    detector = EmotionalDetector()
    score, _ = detector.score('This is a deadly threat! Danger looms over us!')
    assert score > 20

def test_sensational_detects_conspiracy():
    detector = SensationalDetector()
    score, _ = detector.score('Wake up sheeple! Do your research! The deep state is real!')
    assert score > 20

def test_sensational_detects_vague_attribution():
    detector = SensationalDetector()
    score, _ = detector.score('Many people say that something is happening. Sources say.')
    assert score > 10
