import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import {
  getClassificationColor,
  getClassificationLabel,
  timeAgo,
  truncate,
} from '../../utils/formatters';
import { INPUT_TYPE_LABELS, ROUTES } from '../../utils/constants';

export function ReportCard({ report }) {
  const c = getClassificationColor(report.analysis?.classification);
  const typeLabel =
    INPUT_TYPE_LABELS[report.inputType] ||
    (typeof report.inputType === 'string'
      ? report.inputType.charAt(0).toUpperCase() + report.inputType.slice(1)
      : 'Report');

  return (
    <Link to={ROUTES.REPORT_DETAIL(report._id)} className="block">
      <Card className="hover:-translate-y-0.5 transition-all" padding="md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                {typeLabel}
              </span>
              <span className={`badge ${c.bg} ${c.text} ${c.border}`}>
                {getClassificationLabel(report.analysis?.classification)}
              </span>
            </div>
            <p
              className="text-sm line-clamp-2"
              style={{ color: 'var(--text)' }}
            >
              {truncate(report.inputContent, 140)}
            </p>
            <p
              className="text-xs mt-2"
              style={{ color: 'var(--text-subtle)' }}
            >
              {timeAgo(report.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className={`text-2xl font-bold ${c.text}`}>
              {Math.round(report.analysis?.trustScore || 0)}
            </div>
            <div
              className="text-xs"
              style={{ color: 'var(--text-subtle)' }}
            >
              trust
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
