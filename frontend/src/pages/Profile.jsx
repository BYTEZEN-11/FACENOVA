import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatters';
import { COPY, ROLE_LABELS } from '../utils/constants';

export function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--text)' }}
        >
          {COPY.PROFILE_TITLE}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {COPY.PROFILE_SUBTITLE}
        </p>
      </div>
      <Card padding="lg">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--brand), #a855f7)',
              color: '#fff',
            }}
            aria-hidden="true"
          >
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: 'var(--text)' }}
            >
              {user.name}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt
              className="text-xs uppercase tracking-wide mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Role
            </dt>
            <dd style={{ color: 'var(--text)' }}>
              {ROLE_LABELS[user.role] || user.role || 'User'}
            </dd>
          </div>
          <div>
            <dt
              className="text-xs uppercase tracking-wide mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Member Since
            </dt>
            <dd style={{ color: 'var(--text)' }}>
              {formatDate(user.createdAt) || '—'}
            </dd>
          </div>
          <div>
            <dt
              className="text-xs uppercase tracking-wide mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Status
            </dt>
            <dd>
              <span className={user.isActive ? 'badge badge-success' : 'badge badge-danger'}>
                {user.isActive ? 'Active' : 'Disabled'}
              </span>
            </dd>
          </div>
          <div>
            <dt
              className="text-xs uppercase tracking-wide mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Last Login
            </dt>
            <dd style={{ color: 'var(--text)' }}>
              {formatDate(user.lastLogin) || '—'}
            </dd>
          </div>
        </dl>

        <div
          className="mt-6 pt-6"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <Button variant="ghost" disabled>
            Change Password (coming soon)
          </Button>
        </div>
      </Card>
    </div>
  );
}
