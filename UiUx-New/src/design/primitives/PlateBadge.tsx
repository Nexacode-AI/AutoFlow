import { cn } from '@/lib/cn';

interface Props {
  plate: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = {
  sm: 'h-5 px-1.5 text-[11px]',
  md: 'h-6 px-2 text-[12px]',
  lg: 'h-8 px-3 text-[15px]',
};

/** Monospace plate badge — the brand. Used on every job surface. */
export function PlateBadge({ plate, size = 'md', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-semibold tracking-[0.02em] rounded-[var(--radius-sm)] border',
        'bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--color-text-primary)]',
        SIZE[size],
        className,
      )}
    >
      {plate.toUpperCase()}
    </span>
  );
}
