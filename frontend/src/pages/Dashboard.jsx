import { Link } from 'react-router-dom';
import { StatsCards } from '../components/dashboard/StatsCards';
import { RecentReports } from '../components/dashboard/RecentReports';
import { TrendChart } from '../components/dashboard/TrendChart';
import { useStats } from '../hooks/useReports';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/common/Loader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { COPY, ROUTES } from '../utils/constants';

export function Dashboard() {
  const { user } = useAuth();
  const { stats, loading, error } = useStats();

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: 'var(--text)' }}
          >
            {COPY.DASHBOARD_WELCOME}
            {user?.name ? `, ${user.name}` : ''}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {COPY.DASHBOARD_SUBTITLE}
          </p>
        </div>
        <Link to={ROUTES.ANALYZE}>
          <Button>New Analysis</Button>
        </Link>
      </div>

      <div className="space-y-6">
        <StatsCards stats={stats} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart dailyTrend={stats?.dailyTrend || []} />
          <RecentReports reports={stats?.recentReports || []} />
        </div>
      </div>
    </div>
  );
}
