import { useState } from 'react';
import { Camera, Check, Truck, ClipboardCheck, X, Upload } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field, Input } from '@/design/primitives/Input';
import { Select } from '@/design/primitives/Select';
import { Badge } from '@/design/primitives/Badge';
import { StepBlock } from '../StepBlock';
import { ACTIVE_PARTS, SUPPLIERS } from '@/data/mocks';
import { fmtMoney } from '@/lib/format';

const PROGRESS_PHOTOS = ['Before', 'During', 'After fixed'];
const QC_CHECKS = [
  'All repairs completed as specified',
  'Test drive completed successfully',
  'No additional issues found',
  'Vehicle ready for delivery',
];

export function RepairModule() {
  const [ordered, setOrdered] = useState<Record<string, boolean>>({ 'BP-F-001': true, 'AF-002': true });

  return (
    <div className="space-y-4">

      <StepBlock number={12} name="Spare Part Order" description="Multi-supplier order management" timeLimit={30} status="active">
        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                {['Part', 'Supplier', 'Charge', 'Status'].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACTIVE_PARTS.map(p => (
                <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]">
                  <td className="px-3 h-10">
                    <p className="text-[13px] text-[var(--color-text-primary)]">{p.name}</p>
                    <p className="text-[10px] font-mono text-[var(--color-text-tertiary)]">{p.id} × {p.qty}</p>
                  </td>
                  <td className="px-3 h-10">
                    <Select defaultValue={SUPPLIERS[0].id} className="h-7">
                      {SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                  </td>
                  <td className="px-3 h-10 tabular font-medium text-[var(--color-text-primary)]">{fmtMoney(p.markupPrice)}</td>
                  <td className="px-3 h-10">
                    <button
                      onClick={() => setOrdered(o => ({ ...o, [p.id]: !o[p.id] }))}
                      className={`inline-flex items-center gap-1 h-6 px-2 rounded-[var(--radius-sm)] text-[11px] font-medium transition-colors ${
                        ordered[p.id]
                          ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                          : 'bg-[var(--color-surface-active)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)]'
                      }`}
                    >
                      {ordered[p.id] ? <><Check className="w-3 h-3" /> Ordered</> : 'Pending'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StepBlock>

      <StepBlock number={13} name="Parts Received" description="Confirm receipt from supplier" timeLimit={10} status="pending">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Received by" required>
            <Input placeholder="Staff name" />
          </Field>
          <Field label="Condition">
            <Select defaultValue="good">
              <option value="good">Good</option>
              <option value="damaged">Damaged</option>
              <option value="wrong">Wrong item</option>
            </Select>
          </Field>
        </div>
        <Button variant="primary" leading={<Truck className="w-3.5 h-3.5" />}>Confirm parts received</Button>
      </StepBlock>

      <StepBlock number={14} name="Work Progress Photos" description="Document repair progress" timeLimit={30} status="pending">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PROGRESS_PHOTOS.map(name => (
            <div key={name} className="aspect-[4/3] border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-colors">
              <Camera className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.5} />
              <span className="text-[11px] text-[var(--color-text-secondary)]">{name}</span>
            </div>
          ))}
        </div>
        <Button variant="secondary" leading={<Upload className="w-3.5 h-3.5" />}>Upload photos</Button>
      </StepBlock>

      <StepBlock number={15} name="Work Complete" description="Mark all repair work as completed" timeLimit={10} status="pending">
        <Field label="Completion notes">
          <textarea
            rows={2}
            placeholder="Any final remarks…"
            className="w-full p-2.5 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed"
          />
        </Field>
        <Button variant="primary" leading={<Check className="w-3.5 h-3.5" />}>Mark work complete</Button>
      </StepBlock>

      <StepBlock number={16} name="QC Inspection" description="Quality control sign-off" timeLimit={20} status="pending">
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
