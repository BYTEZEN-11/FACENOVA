import clsx from 'clsx';

export function Card({ children, className, glass = false, padding = 'md', ...props }) {
  const padSizes = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  return (
    <div
      className={clsx(
        glass ? 'glass' : 'card',
        padSizes[padding],
        'animate-fade-in',
        className,
      )}
      style={{ color: 'var(--text)' }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={clsx('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return (
    <h3
      className={clsx('text-lg font-semibold', className)}
      style={{ color: 'var(--text)' }}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p
      className={clsx('text-sm mt-1', className)}
      style={{ color: 'var(--text-muted)' }}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return (
    <div
      className={clsx('mt-6 flex items-center gap-3', className)}
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {children}
    </div>
  );
}
