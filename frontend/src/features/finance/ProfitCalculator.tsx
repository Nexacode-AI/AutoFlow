import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardLabel } from '@/design/primitives/Card';
import { Badge } from '@/design/primitives/Badge';
import { PlateBadge } from '@/design/primitives/PlateBadge';
import { PROFIT_DATA, type WorkflowProfit } from '@/data/finance';
import { fmtMoney } from '@/lib/format';
import { cn } from '@/lib/cn';

const marginTone = (m: number): 'success' | 'warning' | 'danger' =>
  m >= 50 ? 'success' : m >= 30 ? 'warning' : 'danger';

const marginColor = (m: number) =>
  m >= 50 ? 'text-[var(--color-success)]' : m >= 30 ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]';

function MarginIcon({ m }: { m: number }) {
  if (m >= 50) return <TrendingUp className="w-3 h-3" />;
  if (m >= 30) return <Minus className="w-3 h-3" />;
  return <TrendingDown className="w-3 h-3" />;
}

export function ProfitCalculator() {
  const revenue = PROFIT_DATA.reduce((s, d) => s + d.revenue, 0);
  const cost = PROFIT_DATA.reduce((s, d) => s + d.actualCost, 0);
  const profit = PROFIT_DATA.reduce((s, d) => s + d.grossProfit, 0);
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total revenue"  value={fmtMoney(revenue)} sub="Quoted to customers" tone="accent" />
        <Stat label="Total cost"     value={fmtMoney(cost)}    sub="Actual bank payments" />
        <Stat label="Gross profit"   value={fmtMoney(profit)}  sub="Revenue − cost" tone="success" />
        <Stat label="Overall margin" value={`${margin.toFixed(1)}%`} sub="60% is the target" marginValue={margin} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[11px] text-[var(--color-text-tertiary)]">
        <span className="inline-flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-[var(--color-success)]" /> ≥ 50% — on target</span>
        <span className="inline-flex items-center gap-1.5"><Minus className="w-3.5 h-3.5 text-[var(--color-warning)]" /> 30–49% — below target</span>
        <span className="inline-flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-[var(--color-danger)]" /> &lt; 30% — needs review</span>
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-4 h-11 border-b border-[var(--color-border)] flex items-center justify-between">
          <CardLabel>Profit by workflow</CardLabel>
          <span className="text-[11px] text-[var(--color-text-tertiary)]">Click a row for per-part breakdown</span>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
              {['Plate / Workflow', 'Customer', 'Completed', 'Revenue', 'Actual cost', 'Gross profit', 'Margin', ''].map((h, i) => (
                <th key={h} className={cn(
                  'text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9',
                  i >= 3 && i <= 5 ? 'text-right' : i === 6 ? 'text-center' : 'text-left',
                )}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROFIT_DATA.map(d => <ProfitRow key={d.workflowId} data={d} />)}
          </tbody>
          <tfoot>
            <tr className="border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
              <td colSpan={3} className="px-4 h-11 text-[12px] font-medium text-[var(--color-text-secondary)]">
                Totals — {PROFIT_DATA.length} workflows
              </td>
              <td className="px-4 h-11 text-right text-[13px] font-semibold tabular text-[var(--color-accent)]">{fmtMoney(revenue)}</td>
              <td className="px-4 h-11 text-right text-[13px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(cost)}</td>
              <td className="px-4 h-11 text-right text-[13px] font-semibold tabular text-[var(--color-success)]">{fmtMoney(profit)}</td>
              <td className="px-4 h-11 text-center">
                <Badge tone={marginTone(margin)}>{margin.toFixed(1)}%</Badge>
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </Card>

      <p className="text-[11px] text-[var(--color-text-tertiary)] text-center">
        Only workflows with completed company-expense records appear here. Revenue = quoted markup price · Cost = actual bank payment from PDFs.
      </p>
    </div>
  );
}

function Stat({ label, value, sub, tone, marginValue }: {
  label: string; value: string; sub: string; tone?: 'accent' | 'success'; marginValue?: number;
}) {
  const color = marginValue !== undefined ? marginColor(marginValue)
    : tone === 'accent' ? 'text-[var(--color-accent)]'
    : tone === 'success' ? 'text-[var(--color-success)]'
    : 'text-[var(--color-text-primary)]';
  return (
    <Card padding="md">
      <CardLabel>{label}</CardLabel>
      <p className={cn('text-[22px] font-semibold tabular mt-1.5', color)}>{value}</p>
      <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{sub}</p>
    </Card>
  );
}

function ProfitRow({ data }: { data: WorkflowProfit }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr onClick={() => setOpen(o => !o)}
        className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)] cursor-pointer">
        <td className="px-4 h-12">
          <div className="flex items-center gap-2">
            <PlateBadge plate={data.plateNumber} size="sm" />
            <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">{data.workflowCode}</span>
          </div>
        </td>
        <td className="px-4 h-12 text-[var(--color-text-primary)]">{data.customerName}</td>
        <td className="px-4 h-12 text-[var(--color-text-tertiary)]">{data.completedDate}</td>
        <td className="px-4 h-12 text-right tabular font-medium text-[var(--color-accent)]">{fmtMoney(data.revenue)}</td>
        <td className="px-4 h-12 text-right tabular text-[var(--color-text-secondary)]">{fmtMoney(data.actualCost)}</td>
        <td className={cn('px-4 h-12 text-right tabular font-semibold', marginColor(data.profitMargin))}>{fmtMoney(data.grossProfit)}</td>
        <td className="px-4 h-12 text-center">
          <Badge tone={marginTone(data.profitMargin)}>
            <MarginIcon m={data.profitMargin} /> {data.profitMargin.toFixed(1)}%
          </Badge>
        </td>
        <td className="px-4 h-12 text-center text-[var(--color-text-tertiary)]">
          {open ? <ChevronDown className="w-4 h-4 inline" /> : <ChevronRight className="w-4 h-4 inline" />}
        </td>
      </tr>
      {open && (
        <tr className="bg-[var(--color-surface-sunken)]">
          <td colSpan={8} className="px-4 py-3">
            <div className="border-l-2 border-[var(--color-accent)] pl-3">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-[10px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">
                    <th className="text-left pb-1.5 pr-4">Part</th>
                    <th className="text-center pb-1.5 pr-4">Qty</th>
                    <th className="text-right pb-1.5 pr-4">Quoted</th>
                    <th className="text-right pb-1.5 pr-4">Actual cost</th>
                    <th className="text-right pb-1.5 pr-4">Part profit</th>
                    <th className="text-right pb-1.5">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {data.parts.map((p, i) => {
                    const profit = (p.quotedPrice - p.actualCost) * p.qty;
                    const m = p.quotedPrice > 0 ? ((p.quotedPrice - p.actualCost) / p.quotedPrice) * 100 : 0;
                    return (
                      <tr key={i} className="border-t border-[var(--color-border)]">
                        <td className="py-1.5 pr-4 text-[var(--color-text-primary)]">{p.name}</td>
                        <td className="py-1.5 pr-4 text-center tabular text-[var(--color-text-tertiary)]">{p.qty}</td>
                        <td className="py-1.5 pr-4 text-right tabular text-[var(--color-accent)]">{fmtMoney(p.quotedPrice * p.qty)}</td>
                        <td className="py-1.5 pr-4 text-right tabular text-[var(--color-text-secondary)]">{fmtMoney(p.actualCost * p.qty)}</td>
                        <td className={cn('py-1.5 pr-4 text-right tabular font-medium', marginColor(m))}>{fmtMoney(profit)}</td>
                        <td className={cn('py-1.5 text-right tabular font-medium', marginColor(m))}>{m.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
