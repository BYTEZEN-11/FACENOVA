import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import { validators } from '../utils/validators';
import { COPY, LIMITS, ROUTES } from '../utils/constants';

export function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const nameErr = validators.name(form.name);
    if (nameErr) newErrors.name = nameErr;
    const emailErr = validators.email(form.email);
    if (emailErr) newErrors.email = emailErr;
    const passwordErr = validators.password(form.password);
    if (passwordErr) newErrors.password = passwordErr;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const res = await register(form.name, form.email, form.password);
    if (res.success) {
      toast.success('Account created!');
      navigate(ROUTES.DASHBOARD, { replace: true });
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
          {COPY.REGISTER_TITLE}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {COPY.REGISTER_SUBTITLE}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            placeholder="Jane Doe"
            value={form.name}
            onChange={update('name')}
            error={errors.name}
            maxLength={LIMITS.NAME_MAX}
            required
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            maxLength={LIMITS.EMAIL_MAX}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder={`At least ${LIMITS.PASSWORD_MIN} characters`}
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            helper="Must include uppercase, lowercase, number, and special character"
            maxLength={LIMITS.PASSWORD_MAX}
            required
            autoComplete="new-password"
          />
          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'Creating account...' : COPY.REGISTER_SUBMIT}
          </Button>
        </form>
        <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
          {COPY.REGISTER_HAVE_ACCOUNT}{' '}
          <Link
            to={ROUTES.LOGIN}
            className="font-medium"
            style={{ color: 'var(--brand-hover)' }}
          >
            {COPY.REGISTER_SIGNIN}
          </Link>
        </p>
      </Card>
    </div>
  );
}
