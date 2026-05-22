import { cn } from '@/lib/cn';

interface Tab<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  tabs: readonly Tab<T>[];
  className?: string;
}

export function Tabs<T extends string>({ value, onChange, tabs, className }: Props<T>) {
  return (
    <div className={cn('flex items-end gap-0.5 border-b border-[var(--color-border)]', className)}>
      {tabs.map(t => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              'relative h-9 px-3 text-[13px] font-medium transition-colors -mb-px border-b-2',
              active
                ? 'text-[var(--color-text-primary)] border-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]',
            )}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span
                className={cn(
                  'ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold tabular',
                  active
                    ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-active)]'
                    : 'bg-[var(--color-surface-active)] text-[var(--color-text-tertiary)]',
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
