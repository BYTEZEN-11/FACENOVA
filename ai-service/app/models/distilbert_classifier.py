from typing import Dict
from .classifier_base import ClassifierBase, HeuristicClassifier

class DistilbertClassifier(ClassifierBase):
    name = 'distilbert-base-uncased'

    def __init__(self, use_transformer: bool=False):
        self.use_transformer = use_transformer
        self._fallback = HeuristicClassifier(name='distilbert-heuristic', bias=0.0, sensitivity=1.1)
        self._model = None
        self._tokenizer = None
        if use_transformer:
            self._load_transformer()

    def _load_transformer(self):
        try:
            from transformers import AutoModelForSequenceClassification, AutoTokenizer
            self._tokenizer = AutoTokenizer.from_pretrained('distilbert-base-uncased')
            self._model = AutoModelForSequenceClassification.from_pretrained('distilbert-base-uncased', num_labels=3)
        except Exception as exc:
            print(f'DistilbertClassifier: transformer load failed: {exc}')
            self._model = None

    def predict(self, text: str, indicators: Dict[str, float]=None) -> Dict[str, float]:
        if self._model is None:
            return self._fallback.predict(text, indicators)
        try:
            import torch
            inputs = self._tokenizer(text, return_tensors='pt', truncation=True, max_length=512)
            with torch.no_grad():
                outputs = self._model(**inputs)
            probs = outputs.logits.softmax(dim=-1)[0].tolist()
            return {'real': float(probs[0]), 'fake': float(probs[1]), 'suspicious': float(probs[2])}
        except Exception:
            return self._fallback.predict(text, indicators)
