import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME, APP_TAGLINE, ROUTES } from '../utils/constants';

const FEATURES = [
  {
    icon: '📝',
    title: 'Text Analysis',
    desc: 'Detect clickbait, emotional manipulation, and misleading patterns in any text.',
  },
  {
    icon: '🔗',
    title: 'URL Verification',
    desc: 'Extract article content and check source credibility before sharing.',
  },
  {
    icon: '🖼',
    title: 'Image Analysis',
    desc: 'Spot manipulated images and verify extracted text via OCR.',
  },
  {
    icon: '🎯',
    title: 'Trust Scoring',
    desc: 'Get a clear 0-100 trust score with explainable reasoning.',
  },
  {
    icon: '🔍',
    title: 'Claim Extraction',
    desc: 'Pull out factual claims and cross-check them with trusted sources.',
  },
  {
    icon: '📊',
    title: 'Dashboard',
    desc: 'Track your verification history and trends over time.',
  },
];

const STEPS = [
  { n: 1, t: 'Submit', d: 'Paste text, URL, or upload image' },
  { n: 2, t: 'Analyze', d: 'Multi-model AI pipeline' },
  { n: 3, t: 'Score', d: 'Trust score with reasoning' },
  { n: 4, t: 'Decide', d: 'Make informed decisions' },
];

export function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="text-center max-w-4xl mx-auto py-16">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6"
          style={{
            background: 'color-mix(in srgb, var(--brand) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--brand) 30%, transparent)',
            color: 'var(--brand-hover)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: 'var(--brand-hover)' }}
            aria-hidden="true"
          />
          AI-Powered Misinformation Detection
        </div>
        <h1
          className="text-4xl sm:text-6xl font-bold mb-6 leading-tight"
          style={{ color: 'var(--text)' }}
        >
          Verify before you{' '}
          <span className="gradient-text">share.</span>
        </h1>
        <p
          className="text-lg mb-8 max-w-2xl mx-auto"
          style={{ color: 'var(--text-muted)' }}
        >
          {APP_TAGLINE}. Multi-model AI analysis for text, URLs, and images.
          Cross-referenced against trusted sources. Explainable verdicts in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isAuthenticated ? (
            <Link to={ROUTES.ANALYZE}>
              <Button size="lg">Start Analyzing →</Button>
            </Link>
          ) : (
            <>
              <Link to={ROUTES.REGISTER}>
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Link to={ROUTES.LOGIN}>
                <Button variant="secondary" size="lg">Sign In</Button>
              </Link>
            </>
          )}
        </div>
      </section>

      <section id="features" className="py-16">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold mb-3"
            style={{ color: 'var(--text)' }}
          >
            Powerful Features
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Everything you need to combat misinformation
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              padding="md"
              className="hover:-translate-y-1 transition-transform"
            >
              <div className="text-4xl mb-3" aria-hidden="true">
                {f.icon}
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--text)' }}
              >
                {f.title}
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                {f.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section id="how" className="py-16">
        <Card padding="lg" className="text-center max-w-3xl mx-auto">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--text)' }}
          >
            How {APP_NAME} works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div
                  className="w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold mb-2"
                  style={{
                    background: 'color-mix(in srgb, var(--brand) 20%, transparent)',
                    color: 'var(--brand-hover)',
                  }}
                >
                  {s.n}
                </div>
                <h3
                  className="font-semibold mb-1"
                  style={{ color: 'var(--text)' }}
                >
                  {s.t}
                </h3>
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
