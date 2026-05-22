import { useState, Fragment } from 'react';
import {
  Plus, X, Check, Copy, MessageSquare, Star, Percent, Wallet, Package, Pencil,
} from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Tabs } from '@/design/primitives/Tabs';
import { Card, CardLabel } from '@/design/primitives/Card';
import {
  SUPPLIERS, SPO12_PARTS, SPO12_GRADES, SPO12_INIT_COSTS, SPO12_INIT_CHARGE,
  WORKFLOW_CODE, PLATE_NUMBER, CHASSIS_NUMBER, ACTIVE_JOB,
  type Spo12Grade,
} from '@/data/mocks';
import { fmtMoney } from '@/lib/format';
import { cn } from '@/lib/cn';

type Supplier = { id: string; name: string; color: string };
type Part = { id: string; name: string };

const MARKUPS = [40, 55, 70] as const;

const GRADE_META: Record<Spo12Grade, { color: string; bg: string }> = {
  ORI:    { color: '#2D8654', bg: 'rgba(45,134,84,0.10)'  },
  OEM:    { color: '#B86E00', bg: 'rgba(184,110,0,0.10)'  },
  USED:   { color: '#C2410C', bg: 'rgba(194,65,12,0.10)'  },
  LABOUR: { color: '#6B3FA0', bg: 'rgba(107,63,160,0.10)' },
};

const calcMU = (cost: number, pct: number) => Math.round(cost * (1 + pct / 100));

const TABS = [
  { value: 'parts',    label: 'Parts Table' },
  { value: 'summary',  label: 'Summary' },
  { value: 'whatsapp', label: 'WhatsApp Orders' },
] as const;
type Tab = (typeof TABS)[number]['value'];

export function SparePartOrder() {
  const [suppliers, setSuppliers]     = useState<Supplier[]>(SUPPLIERS);
  const [selectedIds, setSelectedIds] = useState<string[]>(['suan-huat', 'stuttgart', 'bavaria']);
  const [markup, setMarkup]           = useState<40 | 55 | 70>(55);
  const [tab, setTab]                 = useState<Tab>('parts');
  const [costs, setCosts]             = useState<Record<string, string>>(SPO12_INIT_COSTS);
  const [charge, setCharge]           = useState<Record<string, string>>(SPO12_INIT_CHARGE);
  const [ordered, setOrdered]         = useState<Record<string, boolean>>({ 'ignition-coil': true });
  const [parts, setParts]             = useState<Part[]>(SPO12_PARTS);

  const [showAddSup, setShowAddSup]   = useState(false);
  const [addSupName, setAddSupName]   = useState('');
  const [showAddPart, setShowAddPart] = useState(false);
  const [addPartName, setAddPartName] = useState('');

  const selectedSuppliers = suppliers.filter(s => selectedIds.includes(s.id));
  const getCost = (partId: string, grade: string, supId: string) =>
    parseFloat(costs[`${partId}_${grade}_${supId}`] || '') || 0;

  /* customer charge amount is DERIVED: parts = cost × (1+markup), labour = cost */
  const chargeAmount = (partId: string, grade: Spo12Grade) => {
    const sup = charge[`${partId}_${grade}`];
    if (!sup) return 0;
    const c = getCost(partId, grade, sup);
    return grade === 'LABOUR' ? c : calcMU(c, markup);
  };

  const addSupplier = () => {
    if (!addSupName.trim()) return;
    const id = addSupName.trim().toLowerCase().replace(/\s+/g, '-');
    const palette = ['#0EA5E9', '#84CC16', '#F43F5E', '#8B5CF6', '#14B8A6'];
    setSuppliers(p => [...p, { id, name: addSupName.trim(), color: palette[p.length % palette.length] }]);
    setSelectedIds(p => [...p, id]);
    setAddSupName(''); setShowAddSup(false);
  };
  const addPart = () => {
    if (!addPartName.trim()) return;
    setParts(p => [...p, { id: addPartName.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(), name: addPartName.trim() }]);
    setAddPartName(''); setShowAddPart(false);
  };

  return (
    <div className="space-y-4">

      {/* ① Select suppliers */}
      <NumberedSection num={1} title="Select suppliers for this job" hint="Tick suppliers to show their pricing columns">
        <div className="flex flex-wrap gap-2">
          {suppliers.map(sup => {
            const sel = selectedIds.includes(sup.id);
            return (
              <button
                key={sup.id}
                onClick={() => setSelectedIds(p => p.includes(sup.id) ? p.filter(x => x !== sup.id) : [...p, sup.id])}
                className={cn(
                  'flex items-center gap-1.5 h-7 px-2.5 rounded-[var(--radius-md)] text-[12px] font-medium border transition-colors bg-[var(--color-surface)]',
                  sel ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)] border-[var(--color-border)]',
                )}
                style={sel ? { borderColor: sup.color } : undefined}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sel ? sup.color : 'var(--color-border-strong)' }} />
                {sup.name}
              </button>
            );
          })}
          {showAddSup ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus value={addSupName} onChange={e => setAddSupName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addSupplier(); if (e.key === 'Escape') { setShowAddSup(false); setAddSupName(''); } }}
                placeholder="Supplier name"
                className="h-7 px-2.5 text-[12px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)]"
              />
              <Button variant="primary" size="sm" onClick={addSupplier}>Add</Button>
              <button onClick={() => { setShowAddSup(false); setAddSupName(''); }} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <button onClick={() => setShowAddSup(true)}
              className="flex items-center gap-1 h-7 px-2.5 rounded-[var(--radius-md)] text-[12px] text-[var(--color-text-tertiary)] border border-dashed border-[var(--color-border-hover)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
              <Plus className="w-3 h-3" /> Add supplier
            </button>
          )}
        </div>
        <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2.5">
          <span className="font-medium text-[var(--color-text-secondary)]">{selectedSuppliers.length} supplier(s) selected.</span> Unticked suppliers are hidden from the pricing matrix.
        </p>
      </NumberedSection>

      {/* ② Markup */}
      <NumberedSection num={2} title="Markup % — parts only, labour excluded">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-[var(--color-text-tertiary)]">Active markup</span>
          <div className="inline-flex items-center bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-0.5">
            {MARKUPS.map(pct => (
              <button key={pct} onClick={() => setMarkup(pct)}
                className={cn('h-7 px-3 rounded-[var(--radius-sm)] text-[12px] font-semibold transition-colors',
                  markup === pct ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]')}>
                {pct}%
              </button>
            ))}
          </div>
          <span className="text-[11px] text-[var(--color-text-tertiary)]">All 3 shown under each cost. <span className="text-[var(--color-accent)] font-medium">Bold</span> = active.</span>
        </div>
      </NumberedSection>

      <Tabs value={tab} onChange={setTab} tabs={TABS} />

      {tab === 'parts' && (
        <PartsCards
          parts={parts} selectedSuppliers={selectedSuppliers} markup={markup}
          costs={costs} setCosts={setCosts} charge={charge} setCharge={setCharge}
          ordered={ordered} setOrdered={setOrdered} getCost={getCost} chargeAmount={chargeAmount}
          showAddPart={showAddPart} setShowAddPart={setShowAddPart}
          addPartName={addPartName} setAddPartName={setAddPartName} addPart={addPart}
        />
      )}
      {tab === 'summary' && (
        <SummaryTab parts={parts} suppliers={suppliers} selectedSuppliers={selectedSuppliers}
          markup={markup} charge={charge} ordered={ordered} getCost={getCost} chargeAmount={chargeAmount} />
      )}
      {tab === 'whatsapp' && (
        <WhatsAppTab parts={parts} suppliers={selectedSuppliers} charge={charge} getCost={getCost} />
      )}
    </div>
  );
}

/* ─── Numbered section wrapper ─── */
function NumberedSection({ num, title, hint, children }: { num: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-3.5">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="w-5 h-5 rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] text-[10px] flex items-center justify-center font-bold shrink-0">{num}</span>
        <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--color-text-primary)]">{title}</span>
        {hint && <span className="text-[11px] text-[var(--color-text-tertiary)]">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PARTS — one card per part. Matrix: rows = suppliers, cols = grades.
   Each cell = editable cost + markup preview + cheapest ★.
   Footer row = customer charge selector per grade.
   ════════════════════════════════════════════════════════════════════════ */
function PartsCards(p: {
  parts: Part[]; selectedSuppliers: Supplier[]; markup: 40 | 55 | 70;
  costs: Record<string, string>; setCosts: (f: (c: Record<string, string>) => Record<string, string>) => void;
  charge: Record<string, string>; setCharge: (f: (c: Record<string, string>) => Record<string, string>) => void;
  ordered: Record<string, boolean>; setOrdered: (f: (o: Record<string, boolean>) => Record<string, boolean>) => void;
  getCost: (p: string, g: string, s: string) => number;
  chargeAmount: (p: string, g: Spo12Grade) => number;
  showAddPart: boolean; setShowAddPart: (v: boolean) => void;
  addPartName: string; setAddPartName: (v: string) => void; addPart: () => void;
}) {
  const { parts, selectedSuppliers, markup, costs, setCosts, charge, setCharge, ordered, setOrdered, getCost, chargeAmount } = p;

  return (
    <div className="space-y-3">
      {parts.map(part => (
        <PartCard
          key={part.id}
          part={part}
          selectedSuppliers={selectedSuppliers}
          markup={markup}
          costs={costs} setCosts={setCosts}
          charge={charge} setCharge={setCharge}
          ordered={!!ordered[part.id]}
          setOrdered={v => setOrdered(o => ({ ...o, [part.id]: v }))}
          getCost={getCost} chargeAmount={chargeAmount}
        />
      ))}

      {p.showAddPart ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus value={p.addPartName} onChange={e => p.setAddPartName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') p.addPart(); if (e.key === 'Escape') p.setShowAddPart(false); }}
            placeholder="Part name"
            className="flex-1 h-8 px-2.5 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)]"
          />
          <Button variant="primary" onClick={p.addPart}>Add part</Button>
          <Button variant="ghost" onClick={() => p.setShowAddPart(false)}>Cancel</Button>
        </div>
      ) : (
        <button onClick={() => p.setShowAddPart(true)}
          className="flex items-center justify-center gap-1.5 w-full text-[12px] text-[var(--color-text-tertiary)] border border-dashed border-[var(--color-border-hover)] rounded-[var(--radius-md)] py-2.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add part
        </button>
      )}
    </div>
  );
}

function PartCard({ part, selectedSuppliers, markup, costs, setCosts, charge, setCharge, ordered, setOrdered, getCost, chargeAmount }: {
  part: Part; selectedSuppliers: Supplier[]; markup: 40 | 55 | 70;
  costs: Record<string, string>; setCosts: (f: (c: Record<string, string>) => Record<string, string>) => void;
  charge: Record<string, string>; setCharge: (f: (c: Record<string, string>) => Record<string, string>) => void;
  ordered: boolean; setOrdered: (v: boolean) => void;
  getCost: (p: string, g: string, s: string) => number;
  chargeAmount: (p: string, g: Spo12Grade) => number;
}) {
  return (
    <Card padding="none" className="overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
        <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{part.name}</span>
        {ordered ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-success)]">
            <span className="w-4 h-4 rounded-[3px] bg-[var(--color-success)] flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </span>
            Ordered
          </span>
        ) : (
          <label className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)] cursor-pointer">
            <input type="checkbox" className="w-3.5 h-3.5 accent-[var(--color-accent)]" onChange={e => setOrdered(e.target.checked)} />
            Mark as ordered
          </label>
        )}
      </div>

      {/* Matrix: rows = suppliers, cols = grades */}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9 w-36">Supplier</th>
              {SPO12_GRADES.map(g => (
                <th key={g} className="text-center h-9 px-2">
                  <span className="inline-block px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-bold" style={{ color: GRADE_META[g].color, background: GRADE_META[g].bg }}>{g}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedSuppliers.map(sup => (
              <tr key={sup.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sup.color }} />
                    <span className="font-medium text-[var(--color-text-secondary)]">{sup.name}</span>
                  </div>
                </td>
                {SPO12_GRADES.map(grade => {
                  const key = `${part.id}_${grade}_${sup.id}`;
                  const val = costs[key] || '';
                  const num = parseFloat(val) || 0;
                  const isLabour = grade === 'LABOUR';
                  const valid = selectedSuppliers.map(s => getCost(part.id, grade, s.id)).filter(c => c > 0);
                  const cheapest = num > 0 && valid.length > 0 && num === Math.min(...valid);
                  return (
                    <td key={grade} className="px-2 py-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="relative">
                          {cheapest && <Star className="absolute -top-1.5 -right-1.5 w-3 h-3 text-[var(--color-warning)] fill-[var(--color-warning)]" />}
                          <input
                            type="number" value={val} placeholder="—"
                            onChange={e => setCosts(c => ({ ...c, [key]: e.target.value }))}
                            className={cn('w-20 h-7 px-1.5 text-[12px] text-center rounded-[var(--radius-sm)] border outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)]',
                              val
                                ? 'bg-[var(--color-warning-bg)]/40 border-[var(--color-border)] font-medium text-[var(--color-text-primary)]'
                                : 'bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--color-text-tertiary)]')}
                          />
                        </div>
                        {num > 0 && !isLabour && (
                          <div className="flex items-center gap-0.5 text-[10px] tabular text-[var(--color-text-tertiary)] leading-none">
                            {MARKUPS.map((pct, i) => (
                              <Fragment key={pct}>
                                {i > 0 && <span className="text-[var(--color-border-strong)]">/</span>}
                                <span className={markup === pct ? 'text-[var(--color-accent)] font-bold' : ''}>{calcMU(num, pct)}</span>
                              </Fragment>
                            ))}
                          </div>
                        )}
                        {num > 0 && isLabour && <span className="text-[10px] italic text-[var(--color-text-tertiary)]">fixed</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {/* Customer charge footer — one cell per grade */}
          <tfoot>
            <tr className="border-t border-[var(--color-border)] bg-[var(--color-warning-bg)]/30">
              <td className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--color-warning)]">Customer charge</td>
              {SPO12_GRADES.map(grade => {
                const rk = `${part.id}_${grade}`;
                const amt = chargeAmount(part.id, grade);
                return (
                  <td key={grade} className="px-2 py-2">
                    <select
                      value={charge[rk] || ''}
                      onChange={e => setCharge(c => ({ ...c, [rk]: e.target.value }))}
                      className="w-full h-7 text-[11px] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-1.5 bg-[var(--color-surface)] outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="">— Select —</option>
                      {selectedSuppliers.filter(s => getCost(part.id, grade, s.id) > 0).map(s => {
                        const c = getCost(part.id, grade, s.id);
                        const a = grade === 'LABOUR' ? c : calcMU(c, markup);
                        return <option key={s.id} value={s.id}>{s.name} · RM{a}</option>;
                      })}
                    </select>
                    {amt > 0 && (
                      <p className="text-[10px] text-center mt-0.5 tabular font-semibold text-[var(--color-warning)]">{fmtMoney(amt)}</p>
                    )}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SUMMARY — 4 premium KPIs + per-part roll-up table.
   ════════════════════════════════════════════════════════════════════════ */
function SummaryTab(p: {
  parts: Part[]; suppliers: Supplier[]; selectedSuppliers: Supplier[]; markup: number;
  charge: Record<string, string>; ordered: Record<string, boolean>;
  getCost: (p: string, g: string, s: string) => number;
  chargeAmount: (p: string, g: Spo12Grade) => number;
}) {
  const { parts, suppliers, selectedSuppliers, markup, charge, ordered, getCost, chargeAmount } = p;

  const rows = parts.map(part => {
    const partGrade = (['ORI', 'OEM', 'USED'] as Spo12Grade[]).find(g => charge[`${part.id}_${g}`]);
    const supId = partGrade ? charge[`${part.id}_${partGrade}`] : '';
    const cost = partGrade ? getCost(part.id, partGrade, supId) : 0;
    const chargeRm = partGrade ? chargeAmount(part.id, partGrade) : 0;
    const labourSup = charge[`${part.id}_LABOUR`];
    const labourCost = labourSup ? getCost(part.id, 'LABOUR', labourSup) : 0;
    const valid = partGrade ? selectedSuppliers.map(s => getCost(part.id, partGrade, s.id)).filter(c => c > 0) : [];
    const cheapest = !!partGrade && cost > 0 && valid.length > 0 && cost === Math.min(...valid);
    return {
      part, partGrade,
      supName: suppliers.find(s => s.id === supId)?.name ?? '—',
      cost, chargeRm, labourCost,
      labourSupName: suppliers.find(s => s.id === labourSup)?.name ?? '',
      isOrdered: !!ordered[part.id], cheapest,
    };
  });

  const totalCharge = parts.reduce((s, part) =>
    s + SPO12_GRADES.reduce((gs, g) => gs + chargeAmount(part.id, g), 0), 0);
  const orderedCount = parts.filter(part => ordered[part.id]).length;

  /* Cheapest supplier = who wins most often on the ORI grade */
  const wins: Record<string, number> = {};
  parts.forEach(part => {
    const cs = selectedSuppliers.map(s => ({ id: s.id, c: getCost(part.id, 'ORI', s.id) })).filter(x => x.c > 0);
    if (cs.length) {
      const min = Math.min(...cs.map(x => x.c));
      const w = cs.find(x => x.c === min)!.id;
      wins[w] = (wins[w] ?? 0) + 1;
    }
  });
  const topId = Object.entries(wins).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topName = suppliers.find(s => s.id === topId)?.name ?? '—';
  const topWins = topId ? wins[topId] : 0;

  return (
    <div className="space-y-4">
      {/* KPIs — premium muted, not loud */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={Star}    label="Cheapest supplier"     value={topName}            sub={`Cheapest on ${topWins}/${parts.length} parts`} />
        <Kpi icon={Percent} label="Selected markup"        value={`${markup}%`}       sub="Applied to all parts" />
        <Kpi icon={Wallet}  label="Total customer charge"  value={fmtMoney(totalCharge)} sub="Parts + labour combined" />
        <Kpi icon={Package} label="Parts ordered"          value={`${orderedCount} / ${parts.length}`} sub={`${parts.length - orderedCount} pending`} />
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="px-4 h-10 border-b border-[var(--color-border)] flex items-center">
          <CardLabel>Per-part selection</CardLabel>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                {['Part', 'Type', 'Supplier', 'Cost', 'Markup', 'Charge', 'Labour', 'Ordered', 'Cheapest'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.part.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-3 h-11 font-semibold text-[var(--color-text-primary)] whitespace-nowrap">{r.part.name}</td>
                  <td className="px-3 h-11">
                    {r.partGrade
                      ? <span className="inline-block px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-bold" style={{ color: GRADE_META[r.partGrade].color, background: GRADE_META[r.partGrade].bg }}>{r.partGrade}</span>
                      : <span className="text-[var(--color-text-tertiary)]">—</span>}
                  </td>
                  <td className="px-3 h-11 text-[var(--color-text-secondary)] whitespace-nowrap">{r.supName}</td>
                  <td className="px-3 h-11 tabular text-[var(--color-text-secondary)]">{r.cost > 0 ? fmtMoney(r.cost) : '—'}</td>
                  <td className="px-3 h-11 tabular text-[var(--color-text-secondary)]">{r.partGrade ? `${markup}%` : '—'}</td>
                  <td className="px-3 h-11 tabular font-semibold text-[var(--color-text-primary)]">{r.chargeRm > 0 ? fmtMoney(r.chargeRm) : '—'}</td>
                  <td className="px-3 h-11 text-[var(--color-text-secondary)] whitespace-nowrap">
                    {r.labourCost > 0 ? `${fmtMoney(r.labourCost)} · ${r.labourSupName}` : '—'}
                  </td>
                  <td className="px-3 h-11 whitespace-nowrap">
                    {r.isOrdered
                      ? <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-success)]"><Check className="w-3 h-3" /> Done</span>
                      : <span className="text-[11px] text-[var(--color-text-tertiary)]">Pending</span>}
                  </td>
                  <td className="px-3 h-11">
                    {r.cheapest
                      ? <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-warning)]"><Star className="w-3 h-3 fill-current" /> Yes</span>
                      : <span className="text-[11px] text-[var(--color-text-tertiary)]">No</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[var(--color-accent-subtle)] border-t border-[var(--color-border)]">
                <td colSpan={5} className="px-3 h-10 font-semibold text-[var(--color-accent-active)]">Total customer charge</td>
                <td colSpan={4} className="px-3 h-10 tabular font-bold text-[var(--color-accent-active)]">{fmtMoney(totalCharge)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub }: { icon: typeof Star; label: string; value: string; sub: string }) {
  return (
    <Card padding="md">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={1.7} />
        <CardLabel>{label}</CardLabel>
      </div>
      <p className="text-[20px] font-semibold tabular text-[var(--color-text-primary)] leading-tight">{value}</p>
      <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{sub}</p>
    </Card>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   WHATSAPP — editable per-supplier messages, send via api.whatsapp.com
   ════════════════════════════════════════════════════════════════════════ */
function WhatsAppTab({ parts, suppliers, charge, getCost }: {
  parts: Part[]; suppliers: Supplier[];
  charge: Record<string, string>;
  getCost: (p: string, g: string, s: string) => number;
}) {
  const buildMsg = (sup: Supplier) => {
    const items = parts.flatMap(part =>
      SPO12_GRADES
        .filter(g => charge[`${part.id}_${g}`] === sup.id && getCost(part.id, g, sup.id) > 0)
        .map(g => `${part.name} (${g})`),
    );
    return { items, text:
`Dear ${sup.name},

Please prepare the following parts for:
Job: ${WORKFLOW_CODE}
Car: ${ACTIVE_JOB.carModel} · ${PLATE_NUMBER}
Chassis: ${CHASSIS_NUMBER}

${items.map((it, i) => `${i + 1}. ${it}`).join('\n')}

Kindly confirm availability and ETA.

Thank you,
Autoflow Service Centre` };
  };

  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [editing, setEditing]     = useState<string | null>(null);
  const [copied, setCopied]       = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-[var(--color-text-tertiary)]">
        Per-supplier WhatsApp order messages — built from your Customer Charge selections. Editable before sending.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {suppliers.map(sup => {
          const { items, text } = buildMsg(sup);
          const msg = overrides[sup.id] ?? text;
          const empty = items.length === 0;
          const isEditing = editing === sup.id;

          return (
            <Card key={sup.id} padding="none" className="overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-3.5 h-10 border-b border-[var(--color-border)]" style={{ background: `${sup.color}14` }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: sup.color }} />
                  <span className="text-[13px] font-semibold" style={{ color: sup.color }}>{sup.name}</span>
                </div>
                <span className="text-[11px] text-[var(--color-text-tertiary)] tabular">{items.length} part(s)</span>
              </div>

              {empty ? (
                <div className="p-5 text-center text-[12px] text-[var(--color-text-tertiary)]">
                  No parts assigned to this supplier.
                </div>
              ) : (
                <textarea
                  value={msg}
                  readOnly={!isEditing}
                  onChange={e => setOverrides(o => ({ ...o, [sup.id]: e.target.value }))}
                  rows={9}
                  className={cn('m-3 p-2.5 text-[12px] font-mono leading-relaxed rounded-[var(--radius-md)] border resize-none outline-none',
                    isEditing
                      ? 'bg-[var(--color-surface)] border-[var(--color-accent)] text-[var(--color-text-primary)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)]'
                      : 'bg-[var(--color-surface-sunken)] border-[var(--color-border)] text-[var(--color-text-secondary)]')}
                />
              )}

              <div className="mt-auto px-3 py-2.5 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" disabled={empty}
                  leading={<Pencil className="w-3 h-3" />}
                  onClick={() => setEditing(isEditing ? null : sup.id)}>
                  {isEditing ? 'Done' : 'Edit'}
                </Button>
                <Button variant="secondary" size="sm" disabled={empty}
                  leading={copied === sup.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  onClick={() => { navigator.clipboard.writeText(msg); setCopied(sup.id); setTimeout(() => setCopied(null), 2000); }}>
                  {copied === sup.id ? 'Copied' : 'Copy'}
                </Button>
                <Button variant="primary" size="sm" disabled={empty}
                  leading={<MessageSquare className="w-3 h-3" />}
                  onClick={() => window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(msg)}&type=custom_url&app_absent=0`, '_blank', 'noopener,noreferrer')}>
                  Send WhatsApp
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
