import { forwardRef } from 'react';
import clsx from 'clsx';

const baseFieldProps = (error) =>
  error
    ? {
        style: {
          borderColor: 'color-mix(in srgb, var(--danger) 60%, transparent)',
        },
      }
    : {};

export const Input = forwardRef(function Input(
  { label, error, helper, className, type = 'text', leftIcon, rightIcon, required, ...props },
  ref,
) {
  return (
    <div className="w-full">
      {label && (
        <label className="label">
          {label}
          {required && (
            <span className="ml-1" style={{ color: 'var(--danger)' }}>
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-subtle)' }}
          >
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={clsx('input', leftIcon && 'pl-10', rightIcon && 'pr-10', className)}
          {...baseFieldProps(error)}
          aria-invalid={Boolean(error)}
          required={required}
          {...props}
        />
        {rightIcon && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-subtle)' }}
          >
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="mt-1.5 text-sm" style={{ color: 'var(--text-subtle)' }}>
          {helper}
        </p>
      )}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, helper, className, rows = 4, required, ...props },
  ref,
) {
  return (
    <div className="w-full">
      {label && (
        <label className="label">
          {label}
          {required && (
            <span className="ml-1" style={{ color: 'var(--danger)' }}>
              *
            </span>
          )}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={clsx('input resize-y', className)}
        {...baseFieldProps(error)}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="mt-1.5 text-sm" style={{ color: 'var(--text-subtle)' }}>
          {helper}
        </p>
      )}
    </div>
  );
});

export function Select({ label, error, helper, className, options = [], ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <select className={clsx('input', className)} {...props}>
        {options.map((opt) =>
          typeof opt === 'string' ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ),
        )}
      </select>
      {error && (
        <p className="mt-1.5 text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="mt-1.5 text-sm" style={{ color: 'var(--text-subtle)' }}>
          {helper}
        </p>
      )}
    </div>
  );
}
