import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../common/Button';
import { Textarea } from '../common/Input';
import { Loader } from '../common/Loader';
import { ResultCard } from './ResultCard';
import { useAnalysis } from '../../hooks/useAnalysis';
import { validators } from '../../utils/validators';

const MIN_LENGTH = 20;

export function TextAnalyzer() {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const { analyzeText, loading, result, reset } = useAnalysis();

  const handleAnalyze = async () => {
    const err = validators.text(text, MIN_LENGTH);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    const res = await analyzeText(text, { extractClaims: true, factCheck: true });
    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success('Analysis complete');
    }
  };

  const handleClear = () => {
    setText('');
    setError('');
    reset();
  };

  if (result) {
    return <ResultCard result={result} onReset={handleClear} />;
  }

  return (
    <div className="space-y-4">
      <Textarea
        label="Paste the article, social media post, or claim you want to verify"
        placeholder="Example: 'Breaking: Government announces all private colleges will be closed next month!'"
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
        error={error}
        helper={`${text.length} characters (minimum ${MIN_LENGTH})`}
        required
      />
      <div className="flex gap-3">
        <Button onClick={handleAnalyze} loading={loading} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Text'}
        </Button>
        <Button variant="ghost" onClick={handleClear} disabled={loading}>
          Clear
        </Button>
      </div>
      {loading && (
        <div className="flex justify-center py-8">
          <Loader text="Running multi-model analysis..." />
        </div>
      )}
    </div>
  );
}
