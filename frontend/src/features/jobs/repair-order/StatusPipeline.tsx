import { Check } from 'lucide-react';
import { STATUS_FLOW, type JobStatus } from '@/data/workflow';
import { cn } from '@/lib/cn';

interface Props { current: JobStatus; }

export function StatusPipeline({ current }: Props) {
  const currentIdx = STATUS_FLOW.findIndex(s => s.key === current);

  return (
    <div className="flex items-center w-full">
      {STATUS_FLOW.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors',
                done   && 'bg-[var(--color-success)] text-white',
                active && 'bg-[var(--color-accent)] text-white ring-4 ring-[var(--color-accent-subtle)]',
                !done && !active && 'bg-[var(--color-surface-active)] text-[var(--color-text-tertiary)] border border-[var(--color-border)]',
              )}>
                {done ? <Check className="w-3 h-3" strokeWidth={2.5} /> : <span className="text-[10px] font-semibold tabular">{i + 1}</span>}
              </div>
              <span className={cn(
                'text-[12px] font-medium truncate',
                active ? 'text-[var(--color-text-primary)]' : done ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-tertiary)]',
              )}>
                {s.label}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={cn(
                'flex-1 h-px mx-3 shrink',
                done ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]',
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
