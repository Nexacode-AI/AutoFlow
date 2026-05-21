import { useState } from 'react';
import { Plus, Trash2, Wrench } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field, Input } from '@/design/primitives/Input';
import { Select } from '@/design/primitives/Select';
import { Badge } from '@/design/primitives/Badge';
import { StepBlock } from '../StepBlock';
import { PARTS_CATALOG, ACTIVE_PARTS } from '@/data/mocks';
import { fmtMoney } from '@/lib/format';

export function DiagnosisModule() {
  const [parts, setParts] = useState(ACTIVE_PARTS);

  return (
    <div className="space-y-4">
      <StepBlock number={6} name="Troubleshooting" description="Diagnose vehicle issues, document findings" timeLimit={30} status="done">
        <Field label="Issue category">
          <Select defaultValue="Brakes">
            <option>Engine</option>
            <option>Transmission</option>
            <option>Brakes</option>
            <option>Electrical</option>
            <option>AC System</option>
            <option>Suspension</option>
          </Select>
        </Field>
        <Field label="Issue description">
          <textarea
            rows={3}
            defaultValue="Brake pads worn (front), AC compressor not engaging, engine oil overdue."
            className="w-full p-2.5 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed"
          />
        </Field>
        <Field label="Recommended action">
          <textarea
            rows={2}
            defaultValue="Replace front brake pads, recharge AC gas + replace cabin filter, full engine oil service."
            className="w-full p-2.5 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed"
          />
        </Field>
      </StepBlock>

      <StepBlock number={7} name="Spare Parts Needed" description="List required parts and quantities" timeLimit={15} status="active">
        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                {['Part', 'Category', 'Qty', 'Est. supplier', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parts.map(p => (
                <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]">
                  <td className="px-3 h-10">
                    <p className="text-[13px] text-[var(--color-text-primary)]">{p.name}</p>
                    <p className="text-[10px] font-mono text-[var(--color-text-tertiary)]">{p.id}</p>
                  </td>
                  <td className="px-3 h-10"><Badge tone="neutral">{categoryOf(p.id)}</Badge></td>
                  <td className="px-3 h-10 tabular text-[var(--color-text-primary)]">{p.qty}</td>
                  <td className="px-3 h-10 tabular text-[var(--color-text-primary)]">{fmtMoney(p.supplierPrice)}</td>
                  <td className="px-3 h-10 text-right">
                    <Button variant="ghost" iconOnly size="sm" onClick={() => setParts(ps => ps.filter(x => x.id !== p.id))} aria-label="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" leading={<Plus className="w-3.5 h-3.5" />}>Add part</Button>
          <Button variant="primary" leading={<Wrench className="w-3.5 h-3.5" />}>Confirm parts list</Button>
        </div>
      </StepBlock>
    </div>
  );
}

function categoryOf(id: string) {
  for (const [cat, items] of Object.entries(PARTS_CATALOG)) {
    if (items.some(i => i.id === id)) return cat;
  }
  return '—';
}
