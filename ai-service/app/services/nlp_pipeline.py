import re
import unicodedata
from dataclasses import dataclass
from typing import List, Optional, Tuple

@dataclass
class ProcessedText:
    original: str
    cleaned: str
    tokens: List[str]
    sentences: List[str]
    lemmas: List[str]
    word_count: int
    language: str = 'en'

class NLPPipeline:

    def __init__(self, spacy_model: str='en_core_web_sm'):
        self.nlp = None
        self.spacy_available = False
        try:
            import spacy
            self.nlp = spacy.load(spacy_model)
            self.spacy_available = True
        except Exception:
            self.nlp = None
            self.spacy_available = False

    def process(self, text: str) -> ProcessedText:
        if not isinstance(text, str):
            return ProcessedText(original='', cleaned='', tokens=[], sentences=[], lemmas=[], word_count=0)
        cleaned = self._clean(text)
        tokens, lemmas, sentences = self._tokenize(cleaned)
        return ProcessedText(original=text, cleaned=cleaned, tokens=tokens, sentences=sentences, lemmas=lemmas, word_count=len(tokens), language='en')

    def _clean(self, text: str) -> str:
        text = unicodedata.normalize('NFKC', text)
        text = ''.join((ch for ch in text if unicodedata.category(ch)[0] != 'C' or ch in '\n\t'))
        text = re.sub('https?://\\S+', '[URL]', text)
        text = re.sub('@\\w+', '[USER]', text)
        text = re.sub('([!?])\\1{2,}', '\\1\\1', text)
        text = re.sub('(.)\\1{3,}', '\\1\\1', text)
        text = re.sub('\\s+', ' ', text).strip()
        return text

    def _tokenize(self, text: str) -> Tuple[List[str], List[str], List[str]]:
        if self.nlp is not None:
            doc = self.nlp(text)
            tokens = [token.text for token in doc if not token.is_space]
            lemmas = [token.lemma_ for token in doc if not token.is_space]
            sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]
            return (tokens, lemmas, sentences)
        tokens = re.findall("\\b\\w[\\w'-]*\\b", text)
        sentences = re.split('(?<=[.!?])\\s+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        lemmas = [t.lower() for t in tokens]
        return (tokens, lemmas, sentences)

    def extract_keywords(self, text: str, top_n: int=10) -> List[str]:
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as', 'this', 'that', 'these', 'those', 'it', 'its', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'can', 'could', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'we', 'they', 'them', 'his', 'her', 'their', 'our'}
        tokens = re.findall('\\b[a-z]{3,}\\b', text.lower())
        freq: dict = {}
        for tok in tokens:
            if tok in stop_words:
                continue
            freq[tok] = freq.get(tok, 0) + 1
        sorted_kw = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        return [w for w, _ in sorted_kw[:top_n]]
