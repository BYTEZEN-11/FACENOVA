import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';
import { ResultCard } from './ResultCard';
import { useAnalysis } from '../../hooks/useAnalysis';
import { validators } from '../../utils/validators';

export function UrlAnalyzer() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const { analyzeUrl, loading, result, reset } = useAnalysis();

  const handleAnalyze = async () => {
    const err = validators.url(url);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    const res = await analyzeUrl(url, { extractClaims: true, factCheck: true });
    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success('Article extracted and analyzed');
    }
  };

  const handleClear = () => {
    setUrl('');
    setError('');
    reset();
  };

  if (result) {
    return <ResultCard result={result} onReset={handleClear} />;
  }

  return (
    <div className="space-y-4">
      <Input
        label="Paste an article URL"
        type="url"
        placeholder="https://example.com/news/article"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        error={error}
        helper="We'll fetch the article, extract content, and analyze it"
        required
      />
      <div className="flex gap-3">
        <Button onClick={handleAnalyze} loading={loading} disabled={loading}>
          {loading ? 'Fetching...' : 'Analyze URL'}
        </Button>
        <Button variant="ghost" onClick={handleClear} disabled={loading}>
          Clear
        </Button>
      </div>
      {loading && (
        <div className="flex justify-center py-8">
          <Loader text="Fetching and analyzing article..." />
        </div>
      )}
    </div>
  );
}
