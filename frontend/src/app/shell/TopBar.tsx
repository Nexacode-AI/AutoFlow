import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { NOTIFICATIONS } from '@/data/mocks';

interface Props { onSearch: () => void; }

const PRETTY: Record<string, string> = {
  '': 'Dashboard',
  jobs: 'Job Board',
  parts: 'Parts',
  finance: 'Finance',
  reports: 'Reports',
  settings: 'Settings',
  'repair-order': 'Repair Order',
};

function useCrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return [{ label: 'Dashboard', to: '/' }];
  return parts.map((p, i) => ({
    label: PRETTY[p] ?? p,
    to: '/' + parts.slice(0, i + 1).join('/'),
  }));
}

export function TopBar({ onSearch }: Props) {
  const crumbs = useCrumbs();
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <header className="h-12 shrink-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 flex items-center gap-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-[12px] min-w-0">
        {crumbs.map((c, i) => (
          <div key={c.to} className="flex items-center gap-1 min-w-0">
            {i > 0 && <span className="text-[var(--color-text-tertiary)]">/</span>}
            {i === crumbs.length - 1 ? (
              <span className="text-[var(--color-text-primary)] font-medium truncate">{c.label}</span>
            ) : (
              <Link to={c.to} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors truncate">
                {c.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search trigger */}
      <button
        onClick={onSearch}
        className="hidden md:flex items-center gap-2 h-8 px-2.5 w-[320px] rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[12px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-hover)] transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">Search jobs, parts, customers…</span>
        <kbd className="font-mono text-[10px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-1 py-0.5">⌘K</kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" iconOnly aria-label="Help">
          <HelpCircle className="w-3.5 h-3.5" />
        </Button>
        <button
          aria-label="Notifications"
          className="relative w-8 h-8 inline-flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <Bell className="w-3.5 h-3.5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-danger)] ring-2 ring-[var(--color-surface)]" />
          )}
        </button>
      </div>
    </header>
  );
}
