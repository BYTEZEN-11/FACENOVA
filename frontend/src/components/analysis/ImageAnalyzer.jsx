import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import { ResultCard } from './ResultCard';
import { useAnalysis } from '../../hooks/useAnalysis';

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ImageAnalyzer() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { analyzeImage, loading, result, reset } = useAnalysis();

  const previewUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Only JPEG, PNG, WebP, and GIF images are supported');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB}MB`);
      return;
    }
    setError('');

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const url = URL.createObjectURL(f);
    previewUrlRef.current = url;
    setFile(f);
    setPreview(url);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image');
      return;
    }
    const res = await analyzeImage(file);
    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success('Image analyzed');
    }
  };

  const handleClear = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setFile(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    reset();
  };

  if (result) {
    return <ResultCard result={result} onReset={handleClear} />;
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-dark-700 hover:border-primary-500/50 rounded-2xl p-8 text-center cursor-pointer transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="space-y-3">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-xl shadow-lg"
            />
            <p className="text-sm text-dark-300">{file?.name}</p>
            <p className="text-xs text-dark-500">
              {(file?.size / 1024 / 1024).toFixed(2)}MB
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-5xl">📷</div>
            <p className="text-white font-medium">Drop an image or click to browse</p>
            <p className="text-xs text-dark-400">
              JPEG, PNG, WebP, GIF up to {MAX_SIZE_MB}MB
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-3">
        <Button onClick={handleSubmit} loading={loading} disabled={!file || loading}>
          {loading ? 'Analyzing...' : 'Analyze Image'}
        </Button>
        <Button variant="ghost" onClick={handleClear} disabled={loading}>
          Clear
        </Button>
      </div>
      {loading && (
        <div className="flex justify-center py-8">
          <Loader text="Running image analysis..." />
        </div>
      )}
    </div>
  );
}
