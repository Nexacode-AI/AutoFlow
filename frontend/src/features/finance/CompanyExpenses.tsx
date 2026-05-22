import { useState, useRef } from 'react';
import {
  Upload, Check, Clock, Loader2, Pencil, X, Plus, ChevronDown, ChevronRight, Info,
} from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Card, CardLabel } from '@/design/primitives/Card';
import { Badge } from '@/design/primitives/Badge';
import { Input } from '@/design/primitives/Input';
import { Select } from '@/design/primitives/Select';
import { PlateBadge } from '@/design/primitives/PlateBadge';
import {
  COMPANY_EXPENSES, extractAmount,
  type CompanyExpenseRecord, type CompanyExpensePart,
} from '@/data/finance';
import type { PartType } from '@/data/mocks';
import { fmtMoney, fmtDate } from '@/lib/format';
import { cn } from '@/lib/cn';

export function CompanyExpenses() {
  const [records, setRecords] = useState<CompanyExpenseRecord[]>(COMPANY_EXPENSES);
  const update = (r: CompanyExpenseRecord) => setRecords(p => p.map(x => x.id === r.id ? r : x));

  const total = records.reduce((s, r) => s + r.parts.reduce((ps, p) => ps + (p.extractedAmount ?? 0), 0), 0);
  const verified = records.filter(r => r.status === 'completed')
    .reduce((s, r) => s + r.parts.reduce((ps, p) => ps + (p.extractedAmount ?? 0), 0), 0);
  const pendingPdfs = records.reduce((s, r) => s + r.parts.filter(p => p.pdfStatus === 'pending').length, 0);
  const completed = records.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total records"   value={String(records.length)} sub={`${completed} completed`} />
        <Stat label="Total expenses"  value={fmtMoney(total)} sub="All records" />
        <Stat label="Verified"        value={fmtMoney(verified)} sub="Completed records" tone="success" />
        <Stat label="Pending PDFs"    value={String(pendingPdfs)} sub="Awaiting upload" tone={pendingPdfs > 0 ? 'warning' : undefined} />
      </div>

      <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-info-bg)] bg-[var(--color-info-bg)]/40 px-3.5 py-2.5">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--color-info)]" />
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          <span className="font-medium text-[var(--color-text-primary)]">Bank slip PDFs</span> are used only to extract the amount, then discarded — no file is stored.
        </p>
      </div>

      <div className="space-y-3">
        {records.map(r => <ExpenseCard key={r.id} record={r} onUpdate={update} />)}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: 'success' | 'warning' }) {
  return (
    <Card padding="md">
      <CardLabel>{label}</CardLabel>
      <p className={cn(
        'text-[22px] font-semibold tabular mt-1.5',
        tone === 'success' ? 'text-[var(--color-success)]' :
        tone === 'warning' ? 'text-[var(--color-warning)]' :
        'text-[var(--color-text-primary)]',
      )}>{value}</p>
      <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{sub}</p>
    </Card>
  );
}

function ExpenseCard({ record, onUpdate }: { record: CompanyExpenseRecord; onUpdate: (r: CompanyExpenseRecord) => void }) {
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [pName, setPName] = useState('');
  const [pType, setPType] = useState<PartType>('ORI');
  const [pQty, setPQty] = useState('1');

  const isCompleted = record.status === 'completed';
  const total = record.parts.reduce((s, p) => s + (p.extractedAmount ?? 0), 0);
  const extracted = record.parts.filter(p => p.pdfStatus === 'extracted').length;
  const allExtracted = record.parts.every(p => p.pdfStatus === 'extracted');

  const runExtract = (partId: string) => {
    onUpdate({ ...record, parts: record.parts.map(p => p.id === partId ? { ...p, pdfStatus: 'processing' } : p) });
    const part = record.parts.find(p => p.id === partId)!;
    setTimeout(() => {
      onUpdate({
        ...record,
        parts: record.parts.map(p => p.id === partId
          ? { ...p, pdfStatus: 'extracted', extractedAmount: extractAmount(part.partName) }
          : p),
      });
    }, 1400);
  };
  const editAmount = (partId: string, amount: number) =>
    onUpdate({ ...record, parts: record.parts.map(p => p.id === partId ? { ...p, extractedAmount: amount, isManuallyEdited: true } : p) });

  const addPart = () => {
    if (!pName.trim()) return;
    onUpdate({ ...record, parts: [...record.parts, {
      id: 'cep-' + Date.now(), partName: pName.trim(), partType: pType,
      quantity: Math.max(1, parseInt(pQty) || 1), pdfStatus: 'pending',
    }] });
    setPName(''); setPType('ORI'); setPQty('1'); setAdding(false);
  };

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-4 h-14 hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {open ? <ChevronDown className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
                : <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />}
          <PlateBadge plate={record.plateNumber} size="md" />
          <div className="min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{record.customerName}</span>
              <Badge tone={isCompleted ? 'success' : 'info'} dot>{isCompleted ? 'Completed' : 'In progress'}</Badge>
            </div>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">
              <span className="font-mono">{record.workflowCode}</span> · {fmtDate(record.createdAt)} · {extracted}/{record.parts.length} PDFs processed
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">Total expenses</p>
          <p className="text-[15px] font-semibold tabular text-[var(--color-text-primary)]">{total > 0 ? fmtMoney(total) : '—'}</p>
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--color-border)]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9">Part</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9">PDF status</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9">Amount (bank slip)</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9">Action</th>
              </tr>
            </thead>
            <tbody>
              {record.parts.map(p => (
                <PartRow key={p.id} part={p} readOnly={isCompleted} onExtract={() => runExtract(p.id)} onEdit={amt => editAmount(p.id, amt)} />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
                <td colSpan={2} className="px-4 h-10 text-[12px] font-medium text-[var(--color-text-secondary)]">
                  {record.parts.length} part{record.parts.length !== 1 ? 's' : ''}
                </td>
                <td className="px-4 h-10 text-right text-[13px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>

          {/* Add missed part */}
          {!isCompleted && (
            <div className="px-4 py-3 border-t border-[var(--color-border)]">
              {adding ? (
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Part name</label>
                    <Input value={pName} onChange={e => setPName(e.target.value)} placeholder="e.g. Engine Mount" onKeyDown={e => e.key === 'Enter' && addPart()} autoFocus />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Type</label>
                    <Select value={pType} onChange={e => setPType(e.target.value as PartType)}>
                      <option value="ORI">ORI</option>
                      <option value="OM">OM</option>
                    </Select>
                  </div>
                  <div className="w-16">
                    <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Qty</label>
                    <Input value={pQty} onChange={e => setPQty(e.target.value)} type="number" />
                  </div>
                  <Button variant="primary" onClick={addPart}>Add part</Button>
                  <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
                </div>
              ) : (
                <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
                  <Plus className="w-3.5 h-3.5" /> Add missed part
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
            <span className="text-[11px] text-[var(--color-text-tertiary)]">{extracted}/{record.parts.length} bank slips processed</span>
            {isCompleted ? (
              <Button variant="secondary" size="sm" leading={<Pencil className="w-3 h-3" />} onClick={() => onUpdate({ ...record, status: 'in_progress' })}>Reopen</Button>
            ) : (
              <Button variant="primary" size="sm" leading={<Check className="w-3 h-3" />} disabled={!allExtracted}
                onClick={() => onUpdate({ ...record, status: 'completed' })}>Mark complete</Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function PartRow({ part, readOnly, onExtract, onEdit }: {
  part: CompanyExpensePart; readOnly: boolean; onExtract: () => void; onEdit: (amt: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const save = () => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) onEdit(n);
    setEditing(false);
  };

  return (
    <tr className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]">
      <td className="px-4 py-2.5">
        <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{part.partName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge tone={part.partType === 'ORI' ? 'accent' : 'neutral'}>{part.partType}</Badge>
          <span className="text-[11px] text-[var(--color-text-tertiary)] tabular">× {part.quantity}</span>
        </div>
      </td>
      <td className="px-4">
        {part.pdfStatus === 'extracted' && <Badge tone="success" dot>Extracted</Badge>}
        {part.pdfStatus === 'processing' && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-info)]">
            <Loader2 className="w-3 h-3 animate-spin" /> Processing…
          </span>
        )}
        {part.pdfStatus === 'pending' && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-warning)]">
            <Clock className="w-3 h-3" /> Awaiting PDF
          </span>
        )}
      </td>
      <td className="px-4 text-right">
        {part.pdfStatus === 'extracted' ? (
          editing ? (
            <div className="flex items-center justify-end gap-1.5">
              <Input value={val} onChange={e => setVal(e.target.value)} type="number" autoFocus
                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
                className="w-24" leading={<span className="text-[11px]">RM</span>} />
              <button onClick={save} className="text-[var(--color-success)] p-0.5"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => setEditing(false)} className="text-[var(--color-text-tertiary)] p-0.5"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <span className="text-[13px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(part.extractedAmount ?? 0)}</span>
              {part.isManuallyEdited && <Badge tone="warning">Edited</Badge>}
              {!readOnly && (
                <button onClick={() => { setVal(String(part.extractedAmount ?? '')); setEditing(true); }}
                  className="text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]" title="Override amount">
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>
          )
        ) : <span className="text-[13px] text-[var(--color-text-tertiary)]">—</span>}
      </td>
      <td className="px-4 py-2.5 text-right">
        {readOnly ? <span className="text-[12px] text-[var(--color-text-tertiary)]">—</span> : (
          <>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={e => { if (e.target.files?.length) { onExtract(); e.target.value = ''; } }} />
            <Button variant={part.pdfStatus === 'extracted' ? 'secondary' : 'primary'} size="sm"
              disabled={part.pdfStatus === 'processing'}
              leading={<Upload className="w-3 h-3" />}
              onClick={() => fileRef.current?.click()}>
              {part.pdfStatus === 'extracted' ? 'Re-upload' : 'Upload PDF'}
            </Button>
          </>
        )}
      </td>
    </tr>
  );
}
