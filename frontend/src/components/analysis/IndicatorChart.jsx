import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export function IndicatorChart({ indicators = {} }) {
  const data = [
    { name: 'Clickbait', value: indicators.clickbait || 0 },
    { name: 'Emotional', value: indicators.emotionalManipulation || 0 },
    { name: 'Sensational', value: indicators.sensationalism || 0 },
    { name: 'Misleading', value: indicators.misleadingPatterns || 0 },
  ];

  const colorFor = (v) =>
    v >= 70 ? '#ef4444' : v >= 40 ? '#f59e0b' : '#10b981';

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
          <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
          <YAxis type="category" dataKey="name" stroke="#94a3b8" width={90} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
            }}
            labelStyle={{ color: 'var(--text-muted)' }}
            formatter={(v) => `${v}/100`}
            cursor={{ fill: 'transparent' }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={colorFor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
