import { useState } from 'react';
import { Camera, Check, ClipboardCheck, X, Upload, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field, Input } from '@/design/primitives/Input';
import { Select } from '@/design/primitives/Select';
import { Badge } from '@/design/primitives/Badge';
import { Card } from '@/design/primitives/Card';
import { StepBlock } from '../StepBlock';
import { SparePartOrder } from './SparePartOrder';
import {
  SPO12_PARTS, SPO12_INIT_COSTS, SPO12_INIT_CHARGE, SUPPLIERS, type Spo12Grade,
} from '@/data/mocks';
import { cn } from '@/lib/cn';

const PROGRESS_PHOTOS = ['Before', 'During', 'After fixed'];
const QC_CHECKS = [
  'All repairs completed as specified',
  'Test drive completed successfully',
  'No additional issues found',
  'Vehicle ready for delivery',
];

/* ─── Step 13 — derive ordered lines from Step 12 charge selections ─── */
type Condition = 'Good' | 'Damaged' | 'Wrong Item';
type OrderedLine = { id: string; partName: string; grade: Spo12Grade; supplierName: string; supplierColor: string; cost: number; qty: number };

const ORDERED_LINES: OrderedLine[] = Object.entries(SPO12_INIT_CHARGE)
  .filter(([k]) => !k.endsWith('_LABOUR'))
  .map(([key, supId]) => {
    const [partId, grade] = key.split('_') as [string, Spo12Grade];
    const part = SPO12_PARTS.find(p => p.id === partId);
    const sup = SUPPLIERS.find(s => s.id === supId);
    const cost = parseFloat(SPO12_INIT_COSTS[`${partId}_${grade}_${supId}`] || '0') || 0;
    return { id: key, partName: part?.name ?? partId, grade, supplierName: sup?.name ?? supId, supplierColor: sup?.color ?? '#999', cost, qty: 1 };
  });

const CONDITION_TONE: Record<Condition, 'success' | 'danger' | 'warning'> = {
  'Good': 'success', 'Damaged': 'danger', 'Wrong Item': 'warning',
};

export function RepairModule() {
  const [received, setReceived] = useState<Record<string, { qty: string; condition: Condition }>>(
    () => Object.fromEntries(ORDERED_LINES.map(l => [l.id, { qty: String(l.qty), condition: 'Good' as Condition }])),
  );

  const update = (id: string, field: 'qty' | 'condition', value: string) =>
    setReceived(r => ({ ...r, [id]: { ...r[id], [field]: value as any } }));

  const markAllGood = () => setReceived(Object.fromEntries(
    ORDERED_LINES.map(l => [l.id, { qty: String(l.qty), condition: 'Good' as Condition }]),
  ));

  const goodCount   = ORDERED_LINES.filter(l => received[l.id].condition === 'Good' && Number(received[l.id].qty) > 0).length;
  const hasIssues   = ORDERED_LINES.some(l => received[l.id].condition !== 'Good');
  const allReceived = ORDERED_LINES.every(l => Number(received[l.id].qty) > 0);
  const uniqueSuppliers = new Set(ORDERED_LINES.map(l => l.supplierName)).size;

  return (
    <div className="space-y-4">

      <StepBlock number={12} name="Spare Part Order" description="Multi-supplier pricing & order management" timeLimit={30} status="active">
        <SparePartOrder />
      </StepBlock>

      <StepBlock number={13} name="Spare Parts in Workshop" description="Confirm receipt of each part ordered in Step 12" timeLimit={10} status="active">

        {ORDERED_LINES.length === 0 ? (
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)]/40 px-3.5 py-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-warning)] shrink-0" />
            <p className="text-[12px] text-[var(--color-text-secondary)]">No parts order found. Complete Step 12 first.</p>
          </div>
        ) : (
          <>
            {/* Receipt confirmation card */}
            <Card padding="none" className="overflow-hidden">
              {/* header */}
              <div className="flex items-center justify-between px-4 h-11 bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-[var(--color-accent)]" strokeWidth={1.7} />
                  <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">Parts receipt confirmation</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">
                    {ORDERED_LINES.length} parts · {uniqueSuppliers} supplier{uniqueSuppliers !== 1 ? 's' : ''}
                  </span>
                  <button onClick={markAllGood}
                    className="text-[11px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] border border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-surface)] px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors">
                    Mark all as good
                  </button>
                </div>
              </div>

              {/* per-line rows */}
              <ul className="divide-y divide-[var(--color-border)]">
                {ORDERED_LINES.map(line => {
                  const r = received[line.id];
                  return (
                    <li key={line.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{line.partName}</span>
                          <Badge tone={line.grade === 'ORI' ? 'success' : line.grade === 'OEM' ? 'warning' : 'neutral'}>{line.grade}</Badge>
                          <span className="text-[11px] text-[var(--color-text-tertiary)]">
                            Ordered: {line.qty} unit ·
                            <span className="inline-flex items-center gap-1 ml-1">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: line.supplierColor }} />
                              {line.supplierName}
                            </span>
                          </span>
                        </div>
                        <Badge tone={CONDITION_TONE[r.condition]} dot>{r.condition}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Qty received">
                          <Input
                            type="number" min="0" max={line.qty}
                            value={r.qty}
                            onChange={e => update(line.id, 'qty', e.target.value)}
                            invalid={Number(r.qty) === 0}
                          />
                        </Field>
                        <Field label="Condition">
                          <Select value={r.condition} onChange={e => update(line.id, 'condition', e.target.value)}>
                            <option>Good</option>
                            <option>Damaged</option>
                            <option>Wrong Item</option>
                          </Select>
                        </Field>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* summary footer */}
              <div className="flex items-center justify-between px-4 h-11 bg-[var(--color-surface-sunken)] border-t border-[var(--color-border)]">
                <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">Parts received in good condition</span>
                <span className={cn('text-[13px] font-semibold tabular',
                  goodCount === ORDERED_LINES.length ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]',
                )}>
                  {goodCount} / {ORDERED_LINES.length}
                </span>
              </div>
            </Card>

            {/* issues banner */}
            {hasIssues && (
              <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)]/40 px-3.5 py-2.5">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-[var(--color-warning)] shrink-0" />
                <p className="text-[12px] text-[var(--color-text-secondary)]">
                  Some parts have issues. Contact the supplier to arrange replacements before proceeding to repair.
                </p>
              </div>
            )}

            {/* receiver + complete */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Received by" required>
                <Input placeholder="Staff name" defaultValue="Mohd Rizal" />
              </Field>
              <Field label="Receipt notes">
                <Input placeholder="Any remarks…" />
              </Field>
            </div>

            <Button variant="primary" leading={<Check className="w-3.5 h-3.5" />} disabled={!allReceived}>
              Confirm all parts received
            </Button>
          </>
        )}
      </StepBlock>

      {/* Step 14 — Work Progress Photos + Work Complete merged */}
      <StepBlock number={14} name="Work Progress & Complete" description="Document repair progress and mark work complete" timeLimit={15} status="pending">
        {/* Photos */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] mb-2">Repair progress photos</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PROGRESS_PHOTOS.map(name => (
              <div key={name} className="aspect-[4/3] border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-colors">
                <Camera className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.5} />
                <span className="text-[11px] text-[var(--color-text-secondary)]">{name}</span>
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" className="mt-2.5" leading={<Upload className="w-3 h-3" />}>Upload photos</Button>
        </div>

        {/* Completion notes */}
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] mb-2">Completion details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <Field label="Completed by" required>
              <Input placeholder="Mechanic name" defaultValue="Mohd Rizal" />
            </Field>
            <Field label="Date completed">
              <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
          </div>
          <Field label="Progress / completion notes">
            <textarea
              rows={3}
              placeholder="Describe the work completed, any deviations, parts swapped…"
              className="w-full p-2.5 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed"
            />
          </Field>
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--color-border)] pt-4">
          <Button variant="primary" leading={<Check className="w-3.5 h-3.5" />}>Mark work complete</Button>
          <Button variant="ghost" leading={<Upload className="w-3.5 h-3.5" />}>Save progress only</Button>
        </div>
      </StepBlock>

      {/* Step 15 — QC (renumbered from 16) */}
      <StepBlock number={15} name="Quality Control" description="QC inspection and sign-off" timeLimit={20} status="pending">
        <ul className="space-y-2">
          {QC_CHECKS.map(c => (
            <li key={c} className="flex items-center gap-2.5 px-3 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)]">
              <input type="checkbox" className="w-4 h-4 accent-[var(--color-accent)]" />
              <span className="text-[13px] text-[var(--color-text-primary)]">{c}</span>
            </li>
          ))}
        </ul>
        <Field label="Inspector name">
          <Input placeholder="Encik Rahman" />
        </Field>
        <div className="flex items-center gap-2">
          <Button variant="primary" leading={<ClipboardCheck className="w-3.5 h-3.5" />}>Approve QC</Button>
          <Button variant="danger" leading={<X className="w-3.5 h-3.5" />}>Reject — needs rework</Button>
        </div>
      </StepBlock>
    </div>
  );
}
