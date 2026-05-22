import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Wrench } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { KPI } from '@/design/primitives/KPI';
import { Card, CardLabel } from '@/design/primitives/Card';
import { Badge } from '@/design/primitives/Badge';
import { PlateBadge } from '@/design/primitives/PlateBadge';
import { Avatar } from '@/design/primitives/Avatar';
import { JOBS, NOTIFICATIONS, ACTIVITY } from '@/data/mocks';
import { STATUS_META } from '@/data/workflow';
import { fmtMoney, fmtRelative } from '@/lib/format';

export function Dashboard() {
  const active = JOBS.filter(j => j.status !== 'delivered');
  const awaiting = JOBS.filter(j => j.status === 'awaiting').length;
  const inRepair = JOBS.filter(j => j.status === 'repair').length;
  const ready = JOBS.filter(j => j.status === 'ready').length;
  const revToday = JOBS.filter(j => j.status === 'delivered').reduce((s, j) => s + j.estimatedTotal, 0);

  const needsAttention = JOBS.filter(j => j.status === 'awaiting' || j.status === 'qc').slice(0, 4);

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-6 pb-5 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-[22px] font-semibold leading-7">Today</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/jobs/new">
          <Button variant="primary" leading={<Plus className="w-3.5 h-3.5" />}>New job</Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Active jobs"        value={active.length}        delta={{ value: 12.4 }} spark={[3,5,4,7,6,9,active.length]} hint={`${inRepair} in repair`} />
        <KPI label="Awaiting approval"  value={awaiting}              delta={{ value: -2.3 }} spark={[5,4,3,4,3,2,awaiting]} hint="Customer response pending" />
        <KPI label="Ready for pickup"   value={ready}                 delta={{ value: 4.1 }}  spark={[1,2,1,3,2,3,ready]} hint="Notify customer" />
        <KPI label="Revenue today"      value={fmtMoney(revToday)}    delta={{ value: 8.6 }}  spark={[800,1200,900,1400,1100,1700,revToday/10]} />
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active queue table */}
        <Card padding="none" className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--color-border)]">
            <CardLabel>Today's queue</CardLabel>
            <Link to="/jobs" className="text-[12px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] inline-flex items-center gap-1">
              View board <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                {['Plate', 'Customer', 'Status', 'Total', 'Updated'].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.slice(0, 6).map(j => (
                <tr key={j.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer">
                  <td className="px-4 h-9"><PlateBadge plate={j.plate} size="sm" /></td>
                  <td className="px-4 h-9 text-[var(--color-text-primary)]">{j.customerName}</td>
                  <td className="px-4 h-9"><Badge tone={STATUS_META[j.status].tone as any} dot>{STATUS_META[j.status].label}</Badge></td>
                  <td className="px-4 h-9 tabular text-[var(--color-text-primary)]">{j.estimatedTotal ? fmtMoney(j.estimatedTotal) : '—'}</td>
                  <td className="px-4 h-9 text-[var(--color-text-tertiary)]">{fmtRelative(j.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Side panels */}
        <div className="space-y-5">
          {/* Needs attention */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-4 h-11 border-b border-[var(--color-border)] flex items-center justify-between">
              <CardLabel>Needs attention</CardLabel>
              <Badge tone="warning">{needsAttention.length}</Badge>
            </div>
            <ul className="divide-y divide-[var(--color-border)]">
              {needsAttention.map(j => (
                <li key={j.id} className="px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <PlateBadge plate={j.plate} size="sm" />
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">{fmtRelative(j.updatedAt)}</span>
                  </div>
                  <p className="text-[12px] text-[var(--color-text-primary)] mt-1.5 truncate">
                    {j.status === 'awaiting' ? 'Quotation sent — awaiting customer response' : 'QC pending sign-off'}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          {/* Activity */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-4 h-11 border-b border-[var(--color-border)] flex items-center justify-between">
              <CardLabel>Recent activity</CardLabel>
            </div>
            <ul className="divide-y divide-[var(--color-border)]">
              {ACTIVITY.slice(0, 5).map(a => (
                <li key={a.id} className="px-4 py-2.5 flex items-start gap-3">
                  <Avatar name={a.who} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-[var(--color-text-primary)]">
                      <span className="font-medium">{a.who}</span>{' '}
                      <span className="text-[var(--color-text-secondary)]">{a.action}</span>
                    </p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{fmtRelative(a.time)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
