import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportsApi } from '../api/reports.api';
import { createAbortController } from '../api/client';

export function useReports(params = {}) {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    page = 1,
    limit = 20,
    search = '',
    classification,
    type,
  } = params;

  const fetch = useCallback(async () => {
    const controller = createAbortController();
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.list(params, { signal: controller.signal });

      if (controller.signal.aborted) return;
      setReports(data.data.reports);
      setPagination(data.data.pagination);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setError(err.response?.data?.error?.message || 'Failed to fetch reports');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }

  }, [page, limit, search, classification, type]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { reports, pagination, loading, error, refetch: fetch };
}

export function useReport(id) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return undefined;
    }
    const controller = createAbortController();
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const data = await reportsApi.get(id, { signal: controller.signal });
        if (cancelled) return;
        setReport(data.data.report);
      } catch (err) {
        if (cancelled) return;
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        setError(err.response?.data?.error?.message || 'Failed to fetch report');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id]);

  return { report, loading, error };
}

export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    const controller = createAbortController();
    setLoading(true);
    try {
      const data = await reportsApi.getStats({ signal: controller.signal });
      if (controller.signal.aborted) return;
      setStats(data.data);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setError(err.response?.data?.error?.message || 'Failed to fetch stats');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stats, loading, error, refetch: fetch };
}
