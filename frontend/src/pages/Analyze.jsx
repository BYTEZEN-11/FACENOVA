import { useState } from 'react';
import { Card } from '../components/common/Card';
import { TextAnalyzer } from '../components/analysis/TextAnalyzer';
import { UrlAnalyzer } from '../components/analysis/UrlAnalyzer';
import { ImageAnalyzer } from '../components/analysis/ImageAnalyzer';
import { COPY, INPUT_TYPES } from '../utils/constants';
import clsx from 'clsx';

const TABS = [
  { id: INPUT_TYPES.TEXT, label: 'Text', icon: '📝' },
  { id: INPUT_TYPES.URL, label: 'URL', icon: '🔗' },
  { id: INPUT_TYPES.IMAGE, label: 'Image', icon: '🖼' },
];

export function Analyze() {
  const [active, setActive] = useState(INPUT_TYPES.TEXT);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--text)' }}
        >
          {COPY.ANALYZE_TITLE}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {COPY.ANALYZE_SUBTITLE}
        </p>
      </div>

      <Card padding="md" className="mb-6">
        <div
          className="flex gap-2 -mx-6 px-6"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active === tab.id}
              onClick={() => setActive(tab.id)}
              className={clsx(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
              )}
              style={{
                borderColor: active === tab.id ? 'var(--brand)' : 'transparent',
                color: active === tab.id ? 'var(--text)' : 'var(--text-muted)',
              }}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <Card padding="lg">
        {active === INPUT_TYPES.TEXT && <TextAnalyzer />}
        {active === INPUT_TYPES.URL && <UrlAnalyzer />}
        {active === INPUT_TYPES.IMAGE && <ImageAnalyzer />}
      </Card>
    </div>
  );
}
