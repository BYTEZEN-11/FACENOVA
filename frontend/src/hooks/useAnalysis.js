import { useState, useCallback } from 'react';
import { analyzeApi } from '../api/analyze.api';

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyzeText = useCallback(async (text, options) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeApi.analyzeText(text, options);
      setResult(data.data);
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Analysis failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeUrl = useCallback(async (url, options) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeApi.analyzeUrl(url, options);
      setResult(data.data);
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Analysis failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeImage = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeApi.analyzeImage(file);
      setResult(data.data);
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Image analysis failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { loading, error, result, analyzeText, analyzeUrl, analyzeImage, reset };
}
