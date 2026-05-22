import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconOnly?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] active:bg-[var(--color-accent-active)] shadow-[var(--shadow-sm)]',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-text-primary)] hairline hover:bg-[var(--color-surface-hover)]',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]',
  danger:
    'bg-transparent text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]',
};

const SIZE: Record<Size, string> = {
  sm: 'h-7 text-[12px] px-2.5 gap-1.5 rounded-[var(--radius-md)]',
  md: 'h-8 text-[13px] px-3 gap-2 rounded-[var(--radius-md)]',
  lg: 'h-10 text-[14px] px-4 gap-2 rounded-[var(--radius-md)]',
};

const ICON_ONLY: Record<Size, string> = {
  sm: 'w-7 h-7 p-0',
  md: 'w-8 h-8 p-0',
  lg: 'w-10 h-10 p-0',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'secondary', size = 'md', iconOnly, leading, trailing, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors',
        'disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
        VARIANT[variant],
        SIZE[size],
        iconOnly && ICON_ONLY[size],
        className,
      )}
      {...rest}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
});
