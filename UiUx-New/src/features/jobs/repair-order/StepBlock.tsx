import { type ReactNode } from 'react';
import { Check, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge } from '@/design/primitives/Badge';
import { stepRoles, ROLE_LABEL } from '@/data/workflow';

interface Props {
  number: number;
  name: string;
  description?: string;
  status?: 'pending' | 'active' | 'done';
  timeLimit?: number;       // minutes
  children: ReactNode;
}

/** A single step card inside a module — premium hairline frame, no shadows */
export function StepBlock({ number, name, description, status = 'active', timeLimit, children }: Props) {
  const roles = stepRoles(number);

  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
      <header className="flex items-start gap-3 px-4 py-3 border-b border-[var(--color-border)]">
        <div className={cn(
          'mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0',
          status === 'done'    && 'bg-[var(--color-success)] text-white',
          status === 'active'  && 'bg-[var(--color-accent)] text-white',
          status === 'pending' && 'bg-[var(--color-surface-active)] text-[var(--color-text-tertiary)] border border-[var(--color-border)]',
        )}>
          {status === 'done'
            ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
            : <span className="text-[10px] font-semibold tabular">{number}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">{name}</h3>
            <Badge tone="neutral" className="font-mono">Step {number}</Badge>
          </div>
          {description && <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">{description}</p>}

          {/* Authorized roles — who may action this step */}
          {roles.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <ShieldCheck className="w-3 h-3 text-[var(--color-text-tertiary)]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">
                Authorized
              </span>
              {roles.map(r => (
                <Badge key={r} tone={r === 'superadmin' ? 'accent' : 'neutral'}>
                  {ROLE_LABEL[r]}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {timeLimit && (
          <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)] tabular shrink-0">
            <Clock className="w-3 h-3" />
            {timeLimit} min limit
          </div>
        )}
      </header>
      <div className="p-4 space-y-4">{children}</div>
    </section>
  );
}
