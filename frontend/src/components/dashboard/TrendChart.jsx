import { Card } from '../common/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

export function TrendChart({ dailyTrend = [] }) {
  if (!dailyTrend.length) {
    return (
      <Card padding="md">
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--text)' }}
        >
          7-Day Trend
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Run more analyses to see trends over time.
        </p>
      </Card>
    );
  }
  const data = dailyTrend.map((d) => ({
    date: d._id,
    real: d.realCount || 0,
    fake: d.fakeCount || 0,
    suspicious: d.suspiciousCount || 0,
  }));

  return (
    <Card padding="md">
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: 'var(--text)' }}
      >
        7-Day Trend
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="var(--text-subtle)" fontSize={11} />
            <YAxis stroke="var(--text-subtle)" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
              }}
              labelStyle={{ color: 'var(--text-muted)' }}
            />
            <Legend wrapperStyle={{ color: 'var(--text-muted)' }} />
            <Line type="monotone" dataKey="real" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="suspicious" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="fake" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
