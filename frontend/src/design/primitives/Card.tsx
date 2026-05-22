import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PAD = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' };

export function Card({ interactive, padding = 'md', className, children, ...rest }: Props) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]',
        interactive && 'transition-colors hover:border-[var(--color-border-hover)] cursor-pointer',
        PAD[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      {children}
    </div>
  );
}

export function CardLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">
      {children}
    </span>
  );
}
