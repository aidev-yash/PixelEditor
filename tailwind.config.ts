import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        rule: 'var(--rule)',
        instrument: 'var(--instrument)',
        signal: 'var(--signal)',
        'signal-soft': 'var(--signal-soft)',
        local: 'var(--local)',
        'local-soft': 'var(--local-soft)',
        caution: 'var(--caution)',
        'caution-soft': 'var(--caution-soft)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['var(--font-display)', 'Georgia', 'Times New Roman', 'serif'],
      },
      fontSize: {
        // A single editorial ramp. Tailwind's defaults are replaced through 4xl
        // and extended beyond it, so the scale stays monotonic — the default
        // 5xl (3rem) is smaller than the 4xl below, which made
        // `text-4xl sm:text-5xl` shrink at the breakpoint.
        '2xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
        xs: ['0.8125rem', { lineHeight: '1.15rem' }],
        sm: ['0.875rem', { lineHeight: '1.35rem' }],
        base: ['1rem', { lineHeight: '1.65rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.3125rem', { lineHeight: '1.85rem' }],
        '2xl': ['1.75rem', { lineHeight: '2.05rem' }],
        '3xl': ['2.375rem', { lineHeight: '2.6rem' }],
        '4xl': ['3.25rem', { lineHeight: '3.35rem' }],
        '5xl': ['4rem', { lineHeight: '4.1rem', letterSpacing: '-0.01em' }],
        '6xl': ['4.75rem', { lineHeight: '4.85rem', letterSpacing: '-0.015em' }],
      },
      maxWidth: {
        shell: '1180px',
        prose: '68ch',
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
};

export default config;
