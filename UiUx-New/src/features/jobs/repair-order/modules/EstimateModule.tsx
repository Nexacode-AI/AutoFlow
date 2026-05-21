import { useState } from 'react';
import { FileText, Plus, Copy } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Badge } from '@/design/primitives/Badge';
import { StepBlock } from '../StepBlock';
import { ACTIVE_PARTS, SUPPLIERS } from '@/data/mocks';
import { fmtMoney } from '@/lib/format';

const MARKUP_OPTIONS = [40, 55, 70] as const;

export function EstimateModule() {
  const [markup, setMarkup] = useState<40 | 55 | 70>(55);
  const [supplier, setSupplier] = useState(SUPPLIERS[0].id);

  const totalCost   = ACTIVE_PARTS.reduce((s, p) => s + p.supplierPrice * p.qty, 0);
  const totalMarkup = ACTIVE_PARTS.reduce((s, p) => s + p.markupPrice * p.qty, 0);
  const margin = ((totalMarkup - totalCost) / totalMarkup) * 100;

  return (
    <div className="space-y-4">

      <StepBlock number={8} name="Supplier Pricing" description="Check supplier prices and availability" timeLimit={20} status="done">
        <div className="flex items-center gap-1 mb-2">
          {SUPPLIERS.map(s => (
            <button
              key={s.id}
              onClick={() => setSupplier(s.id)}
              className={`h-7 px-2.5 rounded-[var(--radius-md)] text-[12px] font-medium transition-colors border ${
                supplier === s.id
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent-active)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: s.color }} />
              {s.name}
            </button>
          ))}
        </div>

        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                {['Part', 'Qty', 'Supplier price', 'Availability'].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACTIVE_PARTS.map(p => (
                <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]">
                  <td className="px-3 h-10">
                    <p className="text-[13px] text-[var(--color-text-primary)]">{p.name}</p>
                    <p className="text-[10px] font-mono text-[var(--color-text-tertiary)]">{p.id}</p>
                  </td>
                  <td className="px-3 h-10 tabular text-[var(--color-text-primary)]">{p.qty}</td>
                  <td className="px-3 h-10 tabular text-[var(--color-text-primary)]">{fmtMoney(p.supplierPrice)}</td>
                  <td className="px-3 h-10"><Badge tone="success">In stock</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-[var(--color-text-tertiary)]">Subtotal: <span className="text-[var(--color-text-primary)] font-medium tabular">{fmtMoney(totalCost)}</span></p>
      </StepBlock>

      <StepBlock number={9} name="Markup Pricing" description="Apply margin (≥60% minimum)" timeLimit={10} status="active">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] mb-2">Markup percentage</p>
          <div className="inline-flex items-center bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-0.5">
            {MARKUP_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setMarkup(opt)}
                className={`h-7 px-3 rounded-[var(--radius-sm)] text-[12px] font-semibold transition-colors ${
                  markup === opt
                    ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {opt}%
              </button>
            ))}
          </div>
        </div>

        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                {['Part', 'Cost', 'Markup', 'Margin'].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACTIVE_PARTS.map(p => {
                const m = ((p.markupPrice - p.supplierPrice) / p.markupPrice) * 100;
                return (
                  <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-3 h-10 text-[var(--color-text-primary)]">{p.name}</td>
                    <td className="px-3 h-10 tabular text-[var(--color-text-secondary)]">{fmtMoney(p.supplierPrice)}</td>
                    <td className="px-3 h-10 tabular text-[var(--color-text-primary)] font-medium">{fmtMoney(p.markupPrice)}</td>
                    <td className="px-3 h-10"><Badge tone={m >= 60 ? 'success' : 'warning'}>{m.toFixed(0)}%</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 h-10 flex items-center justify-between text-[12px]">
            <span className="text-[var(--color-text-tertiary)]">Overall margin</span>
            <div className="flex items-center gap-4">
              <span className="text-[var(--color-text-tertiary)]">Cost <span className="tabular text-[var(--color-text-primary)] font-medium">{fmtMoney(totalCost)}</span></span>
              <span className="text-[var(--color-text-tertiary)]">Markup <span className="tabular text-[var(--color-text-primary)] font-medium">{fmtMoney(totalMarkup)}</span></span>
              <Badge tone={margin >= 60 ? 'success' : 'warning'}>{margin.toFixed(1)}% margin</Badge>
            </div>
          </div>
        </div>
      </StepBlock>

      <StepBlock number={11} name="Quotation PDF" description="Generate quotation document" timeLimit={10} status="pending">
        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] text-[var(--color-text-tertiary)] uppercase tracking-[0.04em]">Total</p>
            <p className="text-[26px] font-semibold tabular text-[var(--color-text-primary)] mt-1">{fmtMoney(totalMarkup)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" leading={<Copy className="w-3.5 h-3.5" />}>Add Q2 revision</Button>
            <Button variant="primary" leading={<FileText className="w-3.5 h-3.5" />}>Generate PDF</Button>
          </div>
        </div>
      </StepBlock>
    </div>
  );
}
