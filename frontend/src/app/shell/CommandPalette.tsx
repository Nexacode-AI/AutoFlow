import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { useEffect } from 'react';
import {
  Car, ClipboardList, Package, Wallet, BarChart3, Settings, Plus, FileText, Search,
} from 'lucide-react';
import { JOBS } from '@/data/mocks';
import { PlateBadge } from '@/design/primitives/PlateBadge';
import { STATUS_META } from '@/data/workflow';

interface Props { open: boolean; onClose: () => void; }

export function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate();
  const go = (to: string) => { navigate(to); onClose(); };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(15,15,14,0.32)] backdrop-blur-[2px]" />
      <div onClick={e => e.stopPropagation()} className="relative w-full max-w-[560px]">
        <Command
          label="Command palette"
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-overlay)] overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 h-12 border-b border-[var(--color-border)]">
            <Search className="w-4 h-4 text-[var(--color-text-tertiary)]" />
            <Command.Input
              autoFocus
              placeholder="Search jobs, parts, customers, or navigate…"
              className="flex-1 bg-transparent outline-none text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
            />
            <kbd className="font-mono text-[10px] text-[var(--color-text-tertiary)] bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded px-1.5 py-0.5">esc</kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-1.5">
            <Command.Empty className="py-10 text-center text-[13px] text-[var(--color-text-tertiary)]">
              No results.
            </Command.Empty>

            <Command.Group heading="Jobs" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:text-[var(--color-text-tertiary)]">
              {JOBS.slice(0, 5).map(j => (
                <Command.Item
                  key={j.id}
                  value={`${j.code} ${j.plate} ${j.customerName}`}
                  onSelect={() => go(`/jobs/${j.code}`)}
                  className="flex items-center gap-3 px-2 py-2 rounded-[var(--radius-md)] cursor-pointer aria-selected:bg-[var(--color-surface-hover)]"
                >
                  <PlateBadge plate={j.plate} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{j.customerName}</p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">{j.carModel}</p>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">{STATUS_META[j.status].label}</span>
                  <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">{j.code}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:text-[var(--color-text-tertiary)]">
              <PaletteItem icon={Plus}      label="Create new job"          shortcut="N" onSelect={() => go('/jobs/new')} />
              <PaletteItem icon={FileText}  label="Generate today's report" shortcut="R" onSelect={() => go('/reports')} />
            </Command.Group>

            <Command.Group heading="Navigate" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:text-[var(--color-text-tertiary)]">
              <PaletteItem icon={Car}             label="Dashboard"  onSelect={() => go('/')} />
              <PaletteItem icon={ClipboardList}   label="Job Board"  onSelect={() => go('/jobs')} />
              <PaletteItem icon={Package}         label="Parts"      onSelect={() => go('/parts')} />
              <PaletteItem icon={Wallet}          label="Finance"    onSelect={() => go('/finance')} />
              <PaletteItem icon={BarChart3}       label="Reports"    onSelect={() => go('/reports')} />
              <PaletteItem icon={Settings}        label="Settings"   onSelect={() => go('/settings')} />
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function PaletteItem({ icon: Icon, label, shortcut, onSelect }: {
  icon: any; label: string; shortcut?: string; onSelect: () => void;
}) {
  return (
    <Command.Item
      value={label}
      onSelect={onSelect}
      className="flex items-center gap-3 px-2 py-2 rounded-[var(--radius-md)] cursor-pointer aria-selected:bg-[var(--color-surface-hover)]"
    >
      <Icon className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.6} />
      <span className="flex-1 text-[13px] text-[var(--color-text-primary)]">{label}</span>
      {shortcut && (
        <kbd className="font-mono text-[10px] text-[var(--color-text-tertiary)] bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded px-1.5 py-0.5">{shortcut}</kbd>
      )}
    </Command.Item>
  );
}
