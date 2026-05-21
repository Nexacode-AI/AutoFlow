import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, LayoutGrid, Rows3, Filter } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Input } from '@/design/primitives/Input';
import { PageHeader } from '@/design/primitives/PageHeader';
import { PlateBadge } from '@/design/primitives/PlateBadge';
import { Badge } from '@/design/primitives/Badge';
import { Avatar } from '@/design/primitives/Avatar';
import { Card } from '@/design/primitives/Card';
import { JOBS } from '@/data/mocks';
import { STATUS_META, STATUS_FLOW } from '@/data/workflow';
import { fmtMoney, fmtRelative } from '@/lib/format';
import { cn } from '@/lib/cn';

type View = 'board' | 'list';

const KANBAN_COLS = STATUS_FLOW.filter(s => s.key !== 'delivered');

export function JobBoard() {
  const [view, setView] = useState<View>('board');
  const [q, setQ] = useState('');

  const filtered = JOBS.filter(j =>
    !q.trim() ||
    j.plate.toLowerCase().includes(q.toLowerCase()) ||
    j.code.toLowerCase().includes(q.toLowerCase()) ||
    j.customerName.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="px-8 py-6 max-w-[1500px] mx-auto space-y-5">
      <PageHeader
        title="Job Board"
        subtitle={`${filtered.length} active jobs · drag to update status`}
        actions={
          <>
            <div className="hidden md:flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-0.5">
              <button
                onClick={() => setView('board')}
                className={cn(
                  'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[var(--radius-sm)] text-[12px] font-medium transition-colors',
                  view === 'board' ? 'bg-[var(--color-surface-active)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]',
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Board
              </button>
              <button
                onClick={() => setView('list')}
                className={cn(
                  'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[var(--radius-sm)] text-[12px] font-medium transition-colors',
                  view === 'list' ? 'bg-[var(--color-surface-active)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]',
                )}
              >
                <Rows3 className="w-3.5 h-3.5" /> List
              </button>
            </div>
            <Link to="/jobs/new">
              <Button variant="primary" leading={<Plus className="w-3.5 h-3.5" />}>New job</Button>
            </Link>
          </>
        }
      />

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by plate, code, or customer…"
          leading={<Search className="w-3.5 h-3.5" />}
          value={q}
          onChange={e => setQ(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="secondary" leading={<Filter className="w-3.5 h-3.5" />}>Filter</Button>
      </div>

      {view === 'board' ? <BoardView jobs={filtered} /> : <ListView jobs={filtered} />}
    </div>
  );
}

function BoardView({ jobs }: { jobs: typeof JOBS }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {KANBAN_COLS.map(col => {
        const cards = jobs.filter(j => j.status === col.key);
        return (
          <div key={col.key} className="flex flex-col gap-2.5 min-w-0">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Badge tone={col.tone as any} dot>{col.label}</Badge>
              </div>
              <span className="text-[11px] tabular text-[var(--color-text-tertiary)]">{cards.length}</span>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {cards.length === 0 ? (
                <div className="border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 text-center">
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">Empty</p>
                </div>
              ) : (
                cards.map(j => (
                  <Link key={j.id} to={`/jobs/${j.code}`} className="block">
                    <Card interactive padding="sm">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <PlateBadge plate={j.plate} size="sm" />
                        {j.hasQ2 && <Badge tone="accent">Q2</Badge>}
                      </div>
                      <p className="text-[12px] font-medium text-[var(--color-text-primary)] truncate">{j.customerName}</p>
                      <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">{j.carModel}</p>
                      <div className="mt-2.5 pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Avatar name={j.assignedTo} size="xs" />
                          <span className="text-[10px] text-[var(--color-text-tertiary)] truncate">{fmtRelative(j.updatedAt)}</span>
                        </div>
                        {j.estimatedTotal > 0 && (
                          <span className="text-[11px] font-mono font-medium tabular text-[var(--color-text-primary)]">
                            {fmtMoney(j.estimatedTotal)}
                          </span>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ jobs }: { jobs: typeof JOBS }) {
  return (
    <Card padding="none" className="overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
            {['Code', 'Plate', 'Customer', 'Vehicle', 'Status', 'Step', 'Total', 'Updated', ''].map(h => (
              <th key={h} className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9 first:pl-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.map(j => (
            <tr key={j.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)] transition-colors">
              <td className="px-3 first:pl-4 h-10 font-mono text-[12px] text-[var(--color-text-tertiary)]">{j.code}</td>
              <td className="px-3 h-10"><PlateBadge plate={j.plate} size="sm" /></td>
              <td className="px-3 h-10 text-[var(--color-text-primary)]">{j.customerName}</td>
              <td className="px-3 h-10 text-[var(--color-text-secondary)]">{j.carModel}</td>
              <td className="px-3 h-10"><Badge tone={STATUS_META[j.status].tone as any} dot>{STATUS_META[j.status].label}</Badge></td>
              <td className="px-3 h-10 tabular text-[var(--color-text-tertiary)]">{j.currentStep}/19</td>
              <td className="px-3 h-10 tabular text-[var(--color-text-primary)]">{j.estimatedTotal ? fmtMoney(j.estimatedTotal) : '—'}</td>
              <td className="px-3 h-10 text-[var(--color-text-tertiary)]">{fmtRelative(j.updatedAt)}</td>
              <td className="px-3 h-10 text-right pr-4">
                <Link to={`/jobs/${j.code}`} className="text-[12px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">Open</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
