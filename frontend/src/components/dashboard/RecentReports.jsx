import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import {
  getClassificationColor,
  getClassificationLabel,
  timeAgo,
  truncate,
} from '../../utils/formatters';
import { INPUT_TYPE_LABELS, ROUTES } from '../../utils/constants';

export function RecentReports({ reports = [] }) {
  if (!reports.length) {
    return (
      <Card padding="md">
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--text)' }}
        >
          Recent Reports
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No reports yet. Run your first analysis to see it here.
        </p>
      </Card>
    );
  }
  return (
    <Card padding="md">
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: 'var(--text)' }}
      >
        Recent Reports
      </h3>
      <div className="space-y-3">
        {reports.map((r) => {
          const colors = getClassificationColor(r.analysis?.classification);
          const typeLabel =
            INPUT_TYPE_LABELS[r.inputType] || r.inputType || 'Report';
          return (
            <Link
              key={r._id}
              to={ROUTES.REPORT_DETAIL(r._id)}
              className="block p-3 rounded-lg transition-colors"
              style={{ border: '1px solid transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'color-mix(in srgb, var(--text) 5%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm truncate"
                    style={{ color: 'var(--text)' }}
                  >
                    {truncate(r.inputContent, 80)}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {typeLabel} · {timeAgo(r.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold ${colors.text}`}>
                    {Math.round(r.analysis?.trustScore || 0)}
                  </span>
                  <span
                    className={`badge ${colors.bg} ${colors.text} ${colors.border} text-xs`}
                  >
                    {getClassificationLabel(r.analysis?.classification)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
