from app.services.claim_extractor import ClaimExtractor
from app.services.nlp_pipeline import NLPPipeline

def test_extracts_claim_with_past_tense_verb():
    pipeline = NLPPipeline()
    extractor = ClaimExtractor(pipeline)
    processed = pipeline.process('The government announced a new policy yesterday. The markets reacted strongly.')
    claims = extractor.extract(processed)
    assert len(claims) >= 1
    assert any((c.is_past_tense for c in claims))

def test_skips_questions():
    pipeline = NLPPipeline()
    extractor = ClaimExtractor(pipeline)
    processed = pipeline.process('Is the policy good? What do you think about it?')
    claims = extractor.extract(processed)
    assert all((not c.text.endswith('?') for c in claims))

def test_max_claims_respected():
    pipeline = NLPPipeline()
    extractor = ClaimExtractor(pipeline)
    text = 'The minister said the budget increased by 5%. The president announced new reforms. The court ruled the law unconstitutional. The agency reported a 10% rise in cases. The mayor confirmed the funding.'
    processed = pipeline.process(text)
    claims = extractor.extract(processed, max_claims=2)
    assert len(claims) <= 2

def test_confidence_boost_for_named_entities():
    pipeline = NLPPipeline()
    extractor = ClaimExtractor(pipeline)
    a = extractor.extract(pipeline.process('John Smith said something vaguely.'))
    b = extractor.extract(pipeline.process('The President announced 5 million dollars in new funding for schools.'))
    if a and b:
        assert b[0].confidence >= a[0].confidence - 0.01
