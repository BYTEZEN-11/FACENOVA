import { ReportList } from '../components/reports/ReportList';
import { COPY } from '../utils/constants';

export function History() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--text)' }}
        >
          {COPY.HISTORY_TITLE}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>{COPY.HISTORY_SUBTITLE}</p>
      </div>
      <ReportList />
    </div>
  );
}
