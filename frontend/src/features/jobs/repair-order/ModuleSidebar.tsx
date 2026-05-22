import {
  ClipboardCheck, Car, MessageSquare, Search as SearchIcon, Calculator,
  BadgeCheck, Wrench, CheckCheck, Check,
} from 'lucide-react';
import { MODULES, type ModuleKey, stepsByModule } from './module-map';
import { cn } from '@/lib/cn';

const ICONS: Record<string, any> = {
  ClipboardCheck, Car, MessageSquare, Search: SearchIcon, Calculator,
  BadgeCheck, Wrench, CheckCheck,
};

interface Props {
  active: ModuleKey;
  onChange: (k: ModuleKey) => void;
  completed: ModuleKey[];
  currentStep: number;
}

export function ModuleSidebar({ active, onChange, completed, currentStep }: Props) {
  return (
    <nav className="w-[260px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto">
      <div className="px-4 pt-4 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">Modules</p>
      </div>
      <ul className="px-2 pb-3 space-y-0.5">
        {MODULES.map(m => {
          const Icon = ICONS[m.icon];
          const isActive = active === m.key;
          const isDone = completed.includes(m.key);
          const steps = stepsByModule(m.key);
          const stepsDone = steps.filter(s => s.number < currentStep).length;
          const total = steps.length;

          return (
            <li key={m.key}>
              <button
                onClick={() => onChange(m.key)}
                className={cn(
                  'group relative w-full text-left px-2.5 py-2 rounded-[var(--radius-md)] transition-colors',
                  isActive ? 'bg-[var(--color-accent-subtle)]' : 'hover:bg-[var(--color-surface-hover)]',
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-[var(--color-accent)]" />
                )}
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    'w-6 h-6 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0',
                    isDone   && 'bg-[var(--color-success)] text-white',
                    !isDone && isActive  && 'bg-[var(--color-accent)] text-white',
                    !isDone && !isActive && 'bg-[var(--color-surface-active)] text-[var(--color-text-tertiary)]',
                  )}>
                    {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : <Icon className="w-3.5 h-3.5" strokeWidth={1.7} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-[13px] font-medium truncate leading-tight',
                      isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]',
                    )}>{m.name}</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 tabular">
                      {stepsDone}/{total} steps {isDone && '· complete'}
                    </p>
                  </div>
                </div>
                {/* tiny progress bar */}
                <div className="mt-2 h-[2px] rounded-full bg-[var(--color-border)] overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', isDone ? 'bg-[var(--color-success)]' : 'bg-[var(--color-accent)]')}
                    style={{ width: `${(stepsDone / total) * 100}%` }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
