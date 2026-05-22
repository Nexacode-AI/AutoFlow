import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <div
        className={cn(
          'relative inline-flex items-center h-8 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors',
          'focus-within:border-[var(--color-accent)] focus-within:shadow-[0_0_0_3px_var(--color-accent-ring)]',
          className,
        )}
      >
        <select
          ref={ref}
          className="appearance-none bg-transparent outline-none pl-2.5 pr-7 text-[13px] text-[var(--color-text-primary)] h-full cursor-pointer"
          {...rest}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-2 w-3.5 h-3.5 text-[var(--color-text-tertiary)] pointer-events-none" />
      </div>
    );
  },
);
