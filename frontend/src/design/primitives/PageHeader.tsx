import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}

/** Flat page header — no banner, no gradient, no oversized icon. */
export function PageHeader({ title, subtitle, actions, meta }: Props) {
  return (
    <div className="flex items-start justify-between gap-6 pb-5 border-b border-[var(--color-border)]">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold leading-7 text-[var(--color-text-primary)]">{title}</h1>
        {subtitle && (
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">{subtitle}</p>
        )}
        {meta && <div className="mt-2">{meta}</div>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
