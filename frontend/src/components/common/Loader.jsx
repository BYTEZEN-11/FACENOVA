import clsx from 'clsx';

export function Loader({ size = 'md', text, className }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={clsx('animate-spin rounded-full', sizes[size])}
        style={{
          borderColor: 'var(--brand)',
          borderTopColor: 'transparent',
        }}
      />
      {text && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {text}
        </p>
      )}
    </div>
  );
}

export function FullPageLoader({ text = 'Loading...' }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50"
      style={{ background: 'var(--overlay)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader size="xl" />
        <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
          {text}
        </p>
      </div>
    </div>
  );
}

export function InlineLoader({ text }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
      <Loader size="sm" />
      {text && <span className="text-sm">{text}</span>}
    </span>
  );
}
