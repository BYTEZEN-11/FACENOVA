import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import { validators } from '../utils/validators';
import { COPY, ROUTES } from '../utils/constants';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const emailErr = validators.email(form.email);
    if (emailErr) newErrors.email = emailErr;
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const res = await login(form.email, form.password);
    if (res.success) {
      toast.success('Welcome back!');
      const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
      navigate(from, { replace: true });
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card padding="lg" className="w-full max-w-md">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--text)' }}
        >
          {COPY.LOGIN_TITLE}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {COPY.LOGIN_SUBTITLE}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            required
            autoComplete="current-password"
          />
          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'Signing in...' : COPY.LOGIN_SUBMIT}
          </Button>
        </form>
        <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
          {COPY.LOGIN_NO_ACCOUNT}{' '}
          <Link
            to={ROUTES.REGISTER}
            className="font-medium"
            style={{ color: 'var(--brand-hover)' }}
          >
            {COPY.LOGIN_SIGNUP}
          </Link>
        </p>
      </Card>
    </div>
  );
}
