import { cn } from '@/lib/cn';

interface Props {
  name: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const SIZE = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-[12px]',
};

/** Initials avatar — flat single-color bg per Linear/Stripe convention */
export function Avatar({ name, size = 'sm', className }: Props) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold tabular shrink-0',
        'bg-[var(--color-surface-active)] text-[var(--color-text-secondary)]',
        SIZE[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
