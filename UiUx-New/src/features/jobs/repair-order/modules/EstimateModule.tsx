import { useState } from 'react';
import { Info, Check } from 'lucide-react';
import { Badge } from '@/design/primitives/Badge';
import { Input } from '@/design/primitives/Input';
import { Select } from '@/design/primitives/Select';
import { StepBlock } from '../StepBlock';
import { ACTIVE_PARTS, SUPPLIERS } from '@/data/mocks';
import { fmtMoney } from '@/lib/format';

const MIN_MARGIN = 60;                                  // workshop's minimum profit margin %
const QUICK_FILL = [60, 70, 80] as const;               // target-margin quick fills
const AVAILABILITY = ['In stock', 'To order', 'Out of stock'] as const;

type PriceMap = Record<string, Record<string, string>>;   // supplierId → partId → price
type AvailMap = Record<string, Record<string, string>>;   // supplierId → partId → availability

/* Suan Huat comes pre-filled (quote already received); other suppliers start blank */
const initPrices = (): PriceMap => {
  const map: PriceMap = {};
  SUPPLIERS.forEach(s => {
    map[s.id] = {};
    ACTIVE_PARTS.forEach(p => {
      map[s.id][p.id] = s.id === 'suan-huat' ? String(p.supplierPrice) : '';
    });
  });
  return map;
};
const initAvail = (): AvailMap => {
  const map: AvailMap = {};
  SUPPLIERS.forEach(s => {
    map[s.id] = {};
    ACTIVE_PARTS.forEach(p => { map[s.id][p.id] = 'In stock'; });
  });
  return map;
};

export function EstimateModule() {
  const [supplier, setSupplier] = useState(SUPPLIERS[0].id);
  const [prices, setPrices] = useState<PriceMap>(initPrices);
  const [avail, setAvail] = useState<AvailMap>(initAvail);

  /* Step 9 — markup price is entered manually per part (seeded from catalog) */
  const [markupPrices, setMarkupPrices] = useState<Record<string, string>>(
    () => Object.fromEntries(ACTIVE_PARTS.map(p => [p.id, String(p.markupPrice)])),
  );

  const costOf = (partId: string) => parseFloat(prices[supplier]?.[partId] ?? '') || 0;
  const markupOf = (partId: string) => parseFloat(markupPrices[partId] ?? '') || 0;

  /* margin = (sellingPrice − cost) / sellingPrice × 100 — null when no markup set */
  const calcMargin = (cost: number, markup: number): number | null =>
    markup > 0 ? ((markup - cost) / markup) * 100 : null;

  const setPrice = (partId: string, value: string) =>
    setPrices(p => ({ ...p, [supplier]: { ...p[supplier], [partId]: value } }));
  const setAvailability = (partId: string, value: string) =>
    setAvail(a => ({ ...a, [supplier]: { ...a[supplier], [partId]: value } }));
  const updateMarkup = (partId: string, value: string) =>
    setMarkupPrices(prev => ({ ...prev, [partId]: value }));

  /* quick fill — set every markup price so the part hits the target margin */
  const applyTargetMargin = (pct: number) =>
    setMarkupPrices(Object.fromEntries(ACTIVE_PARTS.map(p => {
      const cost = costOf(p.id);
      return [p.id, cost > 0 ? (cost / (1 - pct / 100)).toFixed(2) : ''];
    })));

  const filledCount = ACTIVE_PARTS.filter(p => prices[supplier]?.[p.id]).length;
  const totalCost   = ACTIVE_PARTS.reduce((s, p) => s + costOf(p.id) * p.qty, 0);
  const totalMarkup = ACTIVE_PARTS.reduce((s, p) => s + markupOf(p.id) * p.qty, 0);
  const margin = totalMarkup > 0 ? ((totalMarkup - totalCost) / totalMarkup) * 100 : 0;

  /* step is valid only when every part meets the 60% minimum */
  const allValid = ACTIVE_PARTS.every(p => {
    const m = calcMargin(costOf(p.id), markupOf(p.id));
    return m !== null && m >= MIN_MARGIN;
  });

  const supplierName = SUPPLIERS.find(s => s.id === supplier)?.name ?? '';

  return (
    <div className="space-y-4">

      <StepBlock number={8} name="Supplier Pricing" description="Enter the prices each supplier quotes back on WhatsApp" timeLimit={20} status="active">
        {/* Supplier chips */}
        <div className="flex flex-wrap items-center gap-1">
          {SUPPLIERS.map(s => {
            const done = ACTIVE_PARTS.every(p => prices[s.id]?.[p.id]);
            return (
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
                {done && <span className="ml-1.5 text-[var(--color-success)]">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Manual-entry hint */}
        <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-info-bg)] bg-[var(--color-info-bg)]/40 px-3 py-2">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--color-info)]" />
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            Enter the prices <span className="font-medium text-[var(--color-text-primary)]">{supplierName}</span> quoted in their WhatsApp reply.
            Each supplier's prices are saved separately so you can compare.
          </p>
        </div>

        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Part</th>
                <th className="text-center text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Qty</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Supplier price</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Availability</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVE_PARTS.map(p => {
                const cost = costOf(p.id);
                return (
                  <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-3 py-2">
                      <p className="text-[13px] text-[var(--color-text-primary)]">{p.name}</p>
                      <p className="text-[10px] font-mono text-[var(--color-text-tertiary)]">{p.id}</p>
                    </td>
                    <td className="px-3 text-center tabular text-[var(--color-text-primary)]">{p.qty}</td>
                    <td className="px-3 py-2">
                      <Input
                        value={prices[supplier]?.[p.id] ?? ''}
                        onChange={e => setPrice(p.id, e.target.value)}
                        placeholder="0.00"
                        type="number"
                        className="w-32"
                        leading={<span className="text-[12px] font-medium">RM</span>}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Select value={avail[supplier]?.[p.id] ?? 'In stock'} onChange={e => setAvailability(p.id, e.target.value)} className="h-8">
                        {AVAILABILITY.map(a => <option key={a} value={a}>{a}</option>)}
                      </Select>
                    </td>
                    <td className="px-3 text-right tabular font-medium text-[var(--color-text-primary)]">
                      {cost > 0 ? fmtMoney(cost * p.qty) : <span className="text-[var(--color-text-tertiary)]">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
                <td colSpan={4} className="px-3 h-10 text-[12px] font-medium text-[var(--color-text-secondary)]">
                  {filledCount}/{ACTIVE_PARTS.length} prices entered for {supplierName}
                </td>
                <td className="px-3 h-10 text-right text-[13px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(totalCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </StepBlock>

      <StepBlock number={9} name="Markup Pricing" description={`Set the selling price per part — ${MIN_MARGIN}% minimum margin`} timeLimit={10} status="active">
        {/* Minimum-margin notice */}
        <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)]/40 px-3 py-2">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--color-warning)]" />
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            Every part must reach at least a <span className="font-medium text-[var(--color-text-primary)]">{MIN_MARGIN}% profit margin</span>.
            Margin = (selling price − cost) ÷ selling price.
          </p>
        </div>

        {/* Quick fill */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">Quick fill</span>
          <div className="inline-flex items-center bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-0.5">
            {QUICK_FILL.map(pct => (
              <button
                key={pct}
                onClick={() => applyTargetMargin(pct)}
                className="h-7 px-3 rounded-[var(--radius-sm)] text-[12px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {pct}% margin
              </button>
            ))}
          </div>
        </div>

        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Part</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Cost</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Markup price</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Margin</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVE_PARTS.map(p => {
                const cost = costOf(p.id);
                const m = calcMargin(cost, markupOf(p.id));
                const below = m !== null && m < MIN_MARGIN;
                return (
                  <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-3 py-2 text-[var(--color-text-primary)]">{p.name}</td>
                    <td className="px-3 py-2 text-right tabular text-[var(--color-text-secondary)]">{cost > 0 ? fmtMoney(cost) : '—'}</td>
                    <td className="px-3 py-2">
                      <Input
                        value={markupPrices[p.id] ?? ''}
                        onChange={e => updateMarkup(p.id, e.target.value)}
                        placeholder="0.00"
                        type="number"
                        className="w-32"
                        invalid={below}
                        leading={<span className="text-[12px] font-medium">RM</span>}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      {m === null
                        ? <span className="text-[12px] text-[var(--color-text-tertiary)]">—</span>
                        : <Badge tone={m >= MIN_MARGIN ? 'success' : 'danger'}>{m.toFixed(0)}%</Badge>}
                    </td>
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
              <Badge tone={margin >= MIN_MARGIN ? 'success' : 'warning'}>{margin.toFixed(1)}% margin</Badge>
            </div>
          </div>
        </div>

        {/* Validity status */}
        <div className={`flex items-center gap-2 text-[12px] ${allValid ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
          {allValid
            ? <><Check className="w-3.5 h-3.5" /> All parts meet the {MIN_MARGIN}% minimum — ready to quote.</>
            : <><Info className="w-3.5 h-3.5" /> One or more parts are below the {MIN_MARGIN}% minimum margin.</>}
        </div>
      </StepBlock>

    </div>
  );
}
