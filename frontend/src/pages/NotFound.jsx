import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { COPY, ROUTES } from '../utils/constants';

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card padding="lg" className="text-center max-w-md">
        <div className="text-6xl mb-4" aria-hidden="true">
          🔍
        </div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--text)' }}
        >
          404
        </h1>
        <h2
          className="text-lg font-semibold mb-1"
          style={{ color: 'var(--text)' }}
        >
          {COPY.NOT_FOUND_TITLE}
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
          {COPY.NOT_FOUND_SUBTITLE}
        </p>
        <Link to={ROUTES.HOME}>
          <Button>{COPY.NOT_FOUND_HOME}</Button>
        </Link>
      </Card>
    </div>
  );
}
