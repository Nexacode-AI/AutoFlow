import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Phone, Mail, User, Car, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Badge } from '@/design/primitives/Badge';
import { PlateBadge } from '@/design/primitives/PlateBadge';
import { Avatar } from '@/design/primitives/Avatar';
import { Card, CardLabel } from '@/design/primitives/Card';
import { ACTIVE_JOB, ACTIVITY, ACTIVE_PARTS } from '@/data/mocks';
import { STATUS_META } from '@/data/workflow';
import { fmtRelative, fmtMoney, fmtDate } from '@/lib/format';
import { StatusPipeline } from './StatusPipeline';
import { ModuleSidebar } from './ModuleSidebar';
import { CheckInModule } from './modules/CheckInModule';
import { VehicleModule } from './modules/VehicleModule';
import { CommunicationModule } from './modules/CommunicationModule';
import { DiagnosisModule } from './modules/DiagnosisModule';
import { EstimateModule } from './modules/EstimateModule';
import { AuthorizationModule } from './modules/AuthorizationModule';
import { RepairModule } from './modules/RepairModule';
import { CloseOutModule } from './modules/CloseOutModule';
import type { ModuleKey } from '@/data/workflow';
import { MODULES } from '@/data/workflow';

const MODULE_VIEW: Record<ModuleKey, () => JSX.Element> = {
  'check-in':      CheckInModule,
  'vehicle':       VehicleModule,
  'communication': CommunicationModule,
  'diagnosis':     DiagnosisModule,
  'estimate':      EstimateModule,
  'authorization': AuthorizationModule,
  'repair':        RepairModule,
  'close-out':     CloseOutModule,
};

export function RepairOrder() {
  const nav = useNavigate();
  const job = ACTIVE_JOB;
  const [active, setActive] = useState<ModuleKey>(job.activeModule);

  const ModuleView = MODULE_VIEW[active];
  const moduleDef = MODULES.find(m => m.key === active)!;
  const total = ACTIVE_PARTS.reduce((s, p) => s + p.markupPrice * p.qty, 0);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">

      {/* ── Job header ── */}
      <div className="shrink-0 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="px-6 pt-4 pb-3 flex items-center gap-4">
          <Button variant="ghost" size="sm" iconOnly onClick={() => nav('/jobs')} aria-label="Back">
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <PlateBadge plate={job.plate} size="lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[16px] font-semibold text-[var(--color-text-primary)] truncate">{job.customerName}</h1>
                <Badge tone={STATUS_META[job.status].tone as any} dot>{STATUS_META[job.status].label}</Badge>
                {job.hasQ2 && <Badge tone="accent">Q2 active</Badge>}
              </div>
              <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
                <span className="font-mono">{job.code}</span> · {job.carModel} · Updated {fmtRelative(job.updatedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">Total</span>
              <span className="text-[15px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(total)}</span>
            </div>
            <Button variant="secondary">Save draft</Button>
            <Button variant="primary">Mark step complete</Button>
            <Button variant="ghost" iconOnly aria-label="More"><MoreHorizontal className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Status pipeline */}
        <div className="px-6 pb-4">
          <StatusPipeline current={job.status} />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Module sidebar */}
        <ModuleSidebar
          active={active}
          onChange={setActive}
          completed={job.completedModules}
          currentStep={job.currentStep}
        />

        {/* Module content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[920px] mx-auto px-8 py-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">Module</p>
                <h2 className="text-[20px] font-semibold text-[var(--color-text-primary)] mt-0.5">{moduleDef.name}</h2>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">{moduleDef.description}</p>
              </div>
              <Button variant="ghost" size="sm" trailing={<ChevronDown className="w-3 h-3" />}>Detailed timeline</Button>
            </div>

            <ModuleView />
          </div>
        </div>

        {/* Right pane: vehicle + customer + activity */}
        <aside className="w-[300px] shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto">
          <div className="p-4 space-y-4">
            <Card padding="md">
              <CardLabel>Customer</CardLabel>
              <div className="mt-2.5 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Avatar name={job.customerName} size="md" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{job.customerName}</p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)]">3 previous visits</p>
                  </div>
                </div>
                <div className="space-y-1 text-[12px] text-[var(--color-text-secondary)]">
                  <Row icon={<Phone className="w-3 h-3" />} value="+60 12-345 6789" />
                  <Row icon={<Mail className="w-3 h-3" />} value="ahmad@example.com" />
                </div>
              </div>
            </Card>

            <Card padding="md">
              <CardLabel>Vehicle</CardLabel>
              <div className="mt-2.5 space-y-1.5 text-[12px] text-[var(--color-text-secondary)]">
                <Row icon={<Car className="w-3 h-3" />} value={job.carModel} />
                <Row icon={<User className="w-3 h-3" />} value={`Tech: ${job.assignedTo}`} />
                <Row icon={<Calendar className="w-3 h-3" />} value={`Created ${fmtDate(job.createdAt)}`} />
              </div>
            </Card>

            <Card padding="none">
              <div className="px-3 h-10 border-b border-[var(--color-border)] flex items-center">
                <CardLabel>Activity</CardLabel>
              </div>
              <ul className="divide-y divide-[var(--color-border)]">
                {ACTIVITY.slice(0, 5).map(a => (
                  <li key={a.id} className="px-3 py-2.5 flex items-start gap-2">
                    <Avatar name={a.who} size="xs" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-[var(--color-text-primary)] leading-snug">
                        <span className="font-medium">{a.who}</span>{' '}
                        <span className="text-[var(--color-text-secondary)]">{a.action}</span>
                      </p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">{fmtRelative(a.time)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ icon, value }: { icon: any; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[var(--color-text-tertiary)]">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
