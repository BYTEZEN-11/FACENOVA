import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useReport } from '../../hooks/useReports';
import { Loader } from '../common/Loader';
import { TrustGauge } from '../analysis/TrustGauge';
import { IndicatorChart } from '../analysis/IndicatorChart';
import {
  formatDateTime,
  getClassificationLabel,
} from '../../utils/formatters';
import { INPUT_TYPE_LABELS, ROUTES } from '../../utils/constants';

export function ReportDetail({ id }) {
  const { report, loading, error } = useReport(id);

  if (loading) return <Loader text="Loading report..." />;
  if (error) {
    return (
      <Card padding="md">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <Button onClick={() => window.history.back()} className="mt-3">
          Go back
        </Button>
      </Card>
    );
  }
  if (!report) return null;

  const {
    analysis,
    extractedClaims = [],
    sources = [],
    inputType,
    inputContent,
    createdAt,
  } = report;

  const inputTypeLabel =
    INPUT_TYPE_LABELS[inputType] ||
    (typeof inputType === 'string'
      ? inputType.charAt(0).toUpperCase() + inputType.slice(1)
      : 'Unknown');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text)' }}
          >
            Report Details
          </h1>
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            {inputTypeLabel} · {formatDateTime(createdAt)}
          </p>
        </div>
        <Button variant="ghost" onClick={() => window.history.back()}>
          ← Back
        </Button>
      </div>

      <Card padding="lg">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <TrustGauge
            score={analysis.trustScore}
            classification={analysis.classification}
          />
          <div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--text)' }}
            >
              {getClassificationLabel(analysis.classification)}
            </h2>
            <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
              Confidence: {(analysis.confidence * 100).toFixed(0)}%
            </p>
            {analysis.reasoning && (
              <ul className="space-y-2">
                {analysis.reasoning.map((r, i) => (
                  <li
                    key={i}
                    className="text-sm flex gap-2"
                    style={{ color: 'var(--text)' }}
                  >
                    <span
                      style={{ color: 'var(--brand-hover)' }}
                      aria-hidden="true"
                    >
                      •
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <h3
          className="text-lg font-semibold mb-3"
          style={{ color: 'var(--text)' }}
        >
          Input
        </h3>
        <p
          className="text-sm whitespace-pre-wrap break-words"
          style={{ color: 'var(--text)' }}
        >
          {inputContent}
        </p>
      </Card>

      <Card padding="lg">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--text)' }}
        >
          Manipulation Indicators
        </h3>
        <IndicatorChart indicators={analysis.indicators} />
      </Card>

      {extractedClaims.length > 0 && (
        <Card padding="lg">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--text)' }}
          >
            Extracted Claims
          </h3>
          <div className="space-y-3">
            {extractedClaims.map((c, i) => (
              <div
                key={i}
                className="border-l-4 pl-4 py-2"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <p
                  className="text-sm italic"
                  style={{ color: 'var(--text)' }}
                >
                  &ldquo;{c.text}&rdquo;
                </p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span
                    className={
                      c.verified ? 'badge badge-success' : 'badge badge-warning'
                    }
                  >
                    {c.verified ? '✓ Verified' : '⚠ Unverified'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {sources.length > 0 && (
        <Card padding="lg">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--text)' }}
          >
            Sources
          </h3>
          <ul className="space-y-2">
            {sources.map((s, i) => (
              <li key={i} className="text-sm flex justify-between">
                <a
                  href={s.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: 'var(--brand-hover)' }}
                >
                  {s.name}
                </a>
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Credibility: {s.credibilityScore || 'N/A'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
