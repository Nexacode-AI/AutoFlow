import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Minimal empty state — small mono icon, one specific sentence, one CTA.
 *  No illustrations, no cartoons. */
export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.5} />
      </div>
      <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{title}</p>
      {description && (
        <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
