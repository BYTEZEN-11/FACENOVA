import { useState } from 'react';
import { useReports } from '../../hooks/useReports';
import { Loader } from '../common/Loader';
import { ReportCard } from './ReportCard';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input, Select } from '../common/Input';
import { COPY, HISTORY_PAGE_SIZE_OPTIONS, INPUT_TYPE_LABELS, INPUT_TYPES } from '../../utils/constants';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: INPUT_TYPES.TEXT, label: INPUT_TYPE_LABELS[INPUT_TYPES.TEXT] },
  { value: INPUT_TYPES.URL, label: INPUT_TYPE_LABELS[INPUT_TYPES.URL] },
  { value: INPUT_TYPES.IMAGE, label: INPUT_TYPE_LABELS[INPUT_TYPES.IMAGE] },
];

export function ReportList() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const params = { page, limit: 12 };
  if (type) params.type = type;
  if (search) params.search = search;

  const { reports, pagination, loading, error, refetch } = useReports(params);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  if (loading) return <Loader text="Loading reports..." />;
  if (error) {
    return (
      <Card padding="md">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <Button onClick={refetch} className="mt-3">Retry</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card padding="md">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Search reports..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1"
          />
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            options={TYPE_OPTIONS}
          />
          <Button type="submit">Search</Button>
        </form>
      </Card>

      {reports.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p style={{ color: 'var(--text-muted)' }}>
            {search || type ? 'No reports match your filters.' : COPY.HISTORY_EMPTY}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reports.map((r) => (
            <ReportCard key={r._id} report={r} />
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </Button>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="ghost"
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
