import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { APP_NAME, ROUTES } from '../../utils/constants';
import { Button } from './Button';

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'text-[var(--text)] bg-[color-mix(in_srgb,var(--brand)_15%,transparent)] border border-[color-mix(in_srgb,var(--brand)_35%,transparent)]'
      : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)]'
  }`;

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  return (
    <nav
      className="sticky top-0 z-40 backdrop-blur-md border-b"
      style={{
        background: 'color-mix(in srgb, var(--bg) 70%, transparent)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand)] to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg" aria-hidden="true">
                🛡
              </span>
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>
              {APP_NAME}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to={ROUTES.HOME} end className={navLinkClass}>
              Home
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to={ROUTES.DASHBOARD} className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to={ROUTES.ANALYZE} className={navLinkClass}>
                  Analyze
                </NavLink>
                <NavLink to={ROUTES.HISTORY} className={navLinkClass}>
                  History
                </NavLink>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {theme === 'dark' ? '☀' : '🌙'}
            </button>

            {isAuthenticated ? (
              <>
                <NavLink
                  to={ROUTES.PROFILE}
                  className="hidden sm:inline-block text-sm px-3 py-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {user?.name || 'Profile'}
                </NavLink>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink
                  to={ROUTES.LOGIN}
                  className="text-sm px-3 py-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Login
                </NavLink>
                <Link to={ROUTES.REGISTER}>
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
