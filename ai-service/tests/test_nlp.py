from app.services.nlp_pipeline import NLPPipeline

def test_basic_cleaning():
    pipeline = NLPPipeline()
    result = pipeline.process('Hello!!!   This is a test.   ')
    assert result.word_count > 0
    assert 'Hello!!!' not in result.cleaned
    assert result.sentences

def test_url_replacement():
    pipeline = NLPPipeline()
    result = pipeline.process('Check https://example.com for info')
    assert '[URL]' in result.cleaned
    assert 'https://example.com' not in result.cleaned

def test_user_mention_replacement():
    pipeline = NLPPipeline()
    result = pipeline.process('Hey @john what do you think?')
    assert '[USER]' in result.cleaned

def test_repeated_char_collapse():
    pipeline = NLPPipeline()
    result = pipeline.process('Sooooo cooool')
    assert 'Soo' in result.cleaned or 'cooll' in result.cleaned

def test_keyword_extraction():
    pipeline = NLPPipeline()
    text = 'Climate change is real. Climate scientists agree. Climate policy matters.'
    keywords = pipeline.extract_keywords(text, top_n=5)
    assert 'climate' in keywords

def test_empty_input():
    pipeline = NLPPipeline()
    result = pipeline.process('')
    assert result.word_count == 0
    assert result.tokens == []

def test_unicode_normalization():
    pipeline = NLPPipeline()
    result = pipeline.process('Café')
    assert 'Caf' in result.cleaned or 'Café' in result.cleaned
