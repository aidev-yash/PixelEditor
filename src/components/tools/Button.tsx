'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'border-instrument bg-instrument text-white hover:opacity-90',
  secondary: 'border-rule bg-surface text-ink hover:border-instrument hover:bg-paper',
  ghost: 'border-transparent bg-transparent text-ink-muted hover:text-ink',
  danger: 'border-danger bg-surface text-danger hover:bg-danger-soft',
};

export function Button({
  variant = 'secondary',
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button
      type="button"
      {...props}
      className={[
        'inline-flex items-center justify-center gap-2 border px-4 py-2 text-sm font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}
