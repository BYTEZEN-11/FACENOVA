from functools import lru_cache
from app.services.fake_news_detector import FakeNewsDetector

@lru_cache
def get_detector() -> FakeNewsDetector:
    return FakeNewsDetector(use_transformer=False)
