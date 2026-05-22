import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
  | 'intake' | 'diagnosis' | 'repair' | 'qc' | 'ready' | 'blocked';

const TONE: Record<Tone, string> = {
  neutral:   'bg-[var(--color-surface-active)] text-[var(--color-text-secondary)]',
  accent:    'bg-[var(--color-accent-subtle)] text-[var(--color-accent-active)]',
  success:   'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  warning:   'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  danger:    'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  info:      'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  intake:    'bg-[var(--color-status-intake-bg)] text-[var(--color-status-intake)]',
  diagnosis: 'bg-[var(--color-status-diagnosis-bg)] text-[var(--color-status-diagnosis)]',
  repair:    'bg-[var(--color-status-repair-bg)] text-[var(--color-status-repair)]',
  qc:        'bg-[var(--color-status-qc-bg)] text-[var(--color-status-qc)]',
  ready:     'bg-[var(--color-status-ready-bg)] text-[var(--color-status-ready)]',
  blocked:   'bg-[var(--color-status-blocked-bg)] text-[var(--color-status-blocked)]',
};

interface Props {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

export function Badge({ tone = 'neutral', dot, children, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 h-5 px-2 rounded-[var(--radius-sm)] text-[11px] font-medium whitespace-nowrap',
        TONE[tone],
        className,
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
