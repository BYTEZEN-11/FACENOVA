import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { TrustGauge } from './TrustGauge';
import { IndicatorChart } from './IndicatorChart';
import { formatPercentage, getClassificationLabel } from '../../utils/formatters';

export function ResultCard({ result, onReset }) {
  if (!result) return null;
  const { analysis, extractedClaims = [], sources = [] } = result;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card padding="lg">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <TrustGauge
            score={analysis.trustScore}
            classification={analysis.classification}
          />
          <div className="space-y-4">
            <div>
              <h3
                className="text-sm mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Verdict
              </h3>
              <p
                className="text-2xl font-bold"
                style={{ color: 'var(--text)' }}
              >
                {getClassificationLabel(analysis.classification)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3
                  className="text-xs uppercase mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Trust
                </h3>
                <p
                  className="text-xl font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  {formatPercentage(analysis.trustScore, 1)}
                </p>
              </div>
              <div>
                <h3
                  className="text-xs uppercase mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Confidence
                </h3>
                <p
                  className="text-xl font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  {formatPercentage(analysis.confidence * 100, 1)}
                </p>
              </div>
            </div>
          </div>
        </div>
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

      {analysis.reasoning && analysis.reasoning.length > 0 && (
        <Card padding="lg">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--text)' }}
          >
            Reasoning
          </h3>
          <ul className="space-y-2">
            {analysis.reasoning.map((r, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm"
                style={{ color: 'var(--text)' }}
              >
                <span
                  className="mt-0.5"
                  style={{ color: 'var(--brand)' }}
                  aria-hidden="true"
                >
                  •
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {extractedClaims.length > 0 && (
        <Card padding="lg">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--text)' }}
          >
            Extracted Claims ({extractedClaims.length})
          </h3>
          <div className="space-y-3">
            {extractedClaims.map((c, i) => (
              <div
                key={i}
                className="border-l-4 pl-4 py-2 transition-colors"
                style={{
                  borderColor: 'var(--border-subtle)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <p
                  className="text-sm italic"
                  style={{ color: 'var(--text)' }}
                >
                  &ldquo;{c.text}&rdquo;
                </p>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className={c.verified ? 'badge badge-success' : 'badge badge-warning'}>
                    {c.verified ? '✓ Verified' : '⚠ Unverified'}
                  </span>
                  <span className="badge badge-info">
                    Confidence: {(c.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {sources && sources.length > 0 && (
        <Card padding="lg">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--text)' }}
          >
            Cross-Reference Sources
          </h3>
          <ul className="space-y-2">
            {sources.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <a
                  href={s.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: 'var(--brand-hover)' }}
                >
                  {s.name}
                </a>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Credibility: {s.credibilityScore || 'N/A'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex gap-3">
        <Button onClick={onReset}>New Analysis</Button>
        {result.reportId && (
          <Button
            variant="secondary"
            onClick={() => (window.location.href = `/reports/${result.reportId}`)}
          >
            View Full Report
          </Button>
        )}
      </div>
    </div>
  );
}
