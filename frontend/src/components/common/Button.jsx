import { forwardRef } from 'react';
import clsx from 'clsx';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5',
  lg: 'px-7 py-3.5 text-lg rounded-2xl',
};

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className,
    loading,
    disabled,
    type = 'button',
    leftIcon,
    rightIcon,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={clsx(variants[variant], sizes[size], className)}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          className="animate-spin h-4 w-4 rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      ) : leftIcon ? (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}
      {children}
      {rightIcon && !loading && (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});
