import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Dialog({ open, onClose, title, description, children, footer, width = 460 }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(15,15,14,0.32)] backdrop-blur-[2px]" />
      <div
        onClick={e => e.stopPropagation()}
        style={{ width }}
        className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-overlay)] overflow-hidden"
      >
        <header className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 border-b border-[var(--color-border)]">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">{title}</h2>
            {description && <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 -mr-1 -mt-0.5 inline-flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </header>
        <div className="px-5 py-5 space-y-5">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
