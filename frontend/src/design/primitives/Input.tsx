import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode;
  trailing?: ReactNode;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { leading, trailing, invalid, className, ...rest },
  ref,
) {
  return (
    <div
      className={cn(
        'flex items-center h-8 rounded-[var(--radius-md)] bg-[var(--color-surface)] border transition-colors',
        invalid
          ? 'border-[var(--color-danger)]'
          : 'border-[var(--color-border)] focus-within:border-[var(--color-accent)] focus-within:shadow-[0_0_0_3px_var(--color-accent-ring)]',
        className,
      )}
    >
      {leading && <span className="pl-2.5 text-[var(--color-text-tertiary)] flex items-center">{leading}</span>}
      <input
        ref={ref}
        className="flex-1 bg-transparent outline-none px-2.5 text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] min-w-0"
        {...rest}
      />
      {trailing && <span className="pr-2.5 text-[var(--color-text-tertiary)]">{trailing}</span>}
    </div>
  );
});

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, hint, error, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
          {label}
          {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[11px] text-[var(--color-danger)]">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-[var(--color-text-tertiary)]">{hint}</p>
      ) : null}
    </div>
  );
}
