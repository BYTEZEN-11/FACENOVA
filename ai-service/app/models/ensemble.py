from typing import Dict, List
from app.core.constants import Ensemble as EnsembleCfg
from .bert_classifier import BertClassifier
from .classifier_base import ClassifierBase
from .distilbert_classifier import DistilbertClassifier
from .roberta_classifier import RobertaClassifier

class Ensemble:

    def __init__(self, use_transformer: bool=False, weights: Dict[str, float]=None):
        self.classifiers: List[ClassifierBase] = [BertClassifier(use_transformer=use_transformer), RobertaClassifier(use_transformer=use_transformer), DistilbertClassifier(use_transformer=use_transformer)]
        self.weights = weights if weights is not None else EnsembleCfg.DEFAULT_WEIGHTS

    def predict(self, text: str, indicators: Dict[str, float]=None) -> Dict[str, float]:
        votes: Dict[str, float] = {'real': 0.0, 'fake': 0.0, 'suspicious': 0.0}
        total_weight = 0.0
        for clf in self.classifiers:
            weight = self.weights.get(clf.name, 0.33)
            preds = clf.predict(text, indicators)
            for k, v in preds.items():
                votes[k] += weight * v
            total_weight += weight
        if total_weight > 0:
            for k in votes:
                votes[k] = round(votes[k] / total_weight, 4)
        return votes

    def get_model_versions(self) -> Dict[str, str]:
        versions: Dict[str, str] = {}
        for clf in self.classifiers:
            real_model = getattr(clf, '_model', None)
            if real_model is not None:
                versions[clf.name] = 'loaded'
            else:
                versions[clf.name] = 'heuristic-fallback'
        return versions
