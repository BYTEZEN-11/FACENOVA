import { CLASSIFICATION_META, CLASSIFICATIONS } from '../../utils/constants';

const FALLBACK = CLASSIFICATION_META[CLASSIFICATIONS.SUSPICIOUS];

export function TrustGauge({ score = 0, classification = 'suspicious' }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const meta = CLASSIFICATION_META[classification] || FALLBACK;

  const stroke = {
    real: '#10b981',
    suspicious: '#f59e0b',
    fake: '#ef4444',
  }[classification] || '#f59e0b';

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-48 h-48 -rotate-90" viewBox="0 0 180 180" aria-hidden="true">
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            className="text-[var(--border-subtle)]"
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke={stroke}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span
            className={`text-4xl font-bold ${meta.textClass}`}
            aria-label={`Trust score ${clamped.toFixed(0)} out of 100`}
          >
            {clamped.toFixed(0)}
          </span>
          <span className="text-xs mt-1" style={{ color: 'var(--text-subtle)' }}>
            Trust Score
          </span>
        </div>
      </div>
      <p className={`mt-4 text-lg font-semibold ${meta.textClass}`}>{meta.label}</p>
    </div>
  );
}
