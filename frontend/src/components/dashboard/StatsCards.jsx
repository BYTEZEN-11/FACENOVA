import { Card } from '../common/Card';
import { formatNumber, formatPercentage } from '../../utils/formatters';

export function StatsCards({ stats }) {
  if (!stats) return null;
  const total = stats.totalReports || 0;
  const breakdown = stats.classificationBreakdown || {};
  const avg = stats.avgTrustScore || 0;

  const items = [
    {
      label: 'Total Analyses',
      value: formatNumber(total),
      sub: 'all time',
      accent: 'from-blue-500 to-cyan-500',
      icon: '📊',
    },
    {
      label: 'Avg Trust Score',
      value: formatPercentage(avg, 1),
      sub: 'across all checks',
      accent: 'from-purple-500 to-pink-500',
      icon: '🎯',
    },
    {
      label: 'Likely True',
      value: formatNumber(breakdown.real || 0),
      sub: 'verified content',
      accent: 'from-emerald-500 to-green-500',
      icon: '✓',
    },
    {
      label: 'Likely Fake',
      value: formatNumber(breakdown.fake || 0),
      sub: 'flagged content',
      accent: 'from-rose-500 to-orange-500',
      icon: '⚠',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it) => (
        <Card key={it.label} padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                {it.label}
              </p>
              <p
                className="text-2xl font-bold mt-2"
                style={{ color: 'var(--text)' }}
              >
                {it.value}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--text-subtle)' }}
              >
                {it.sub}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${it.accent} flex items-center justify-center text-lg`}
              aria-hidden="true"
            >
              {it.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
