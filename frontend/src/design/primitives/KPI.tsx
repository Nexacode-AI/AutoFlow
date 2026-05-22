import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  label: string;
  value: ReactNode;
  delta?: { value: number; suffix?: string };
  hint?: string;
  spark?: number[];
  className?: string;
}

/** Premium KPI card: small label, big tabular number, optional delta + sparkline.
 *  NO oversized colored icon. NO tinted background. */
export function KPI({ label, value, delta, hint, spark, className }: Props) {
  const up = (delta?.value ?? 0) >= 0;
  return (
    <div className={cn(
      'rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-4',
      'flex flex-col gap-3',
      className,
    )}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">
          {label}
        </span>
        {delta && (
          <span className={cn(
            'inline-flex items-center gap-0.5 text-[11px] font-medium tabular',
            up ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
          )}>
            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta.value).toFixed(1)}{delta.suffix ?? '%'}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <span className="text-[28px] font-semibold tabular leading-none text-[var(--color-text-primary)]">
          {value}
        </span>
        {spark && spark.length > 1 && <Spark data={spark} up={up} />}
      </div>

      {hint && <span className="text-[11px] text-[var(--color-text-tertiary)]">{hint}</span>}
    </div>
  );
}

function Spark({ data, up }: { data: number[]; up: boolean }) {
  const w = 64, h = 20;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        fill="none"
        stroke={up ? 'var(--color-success)' : 'var(--color-danger)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
