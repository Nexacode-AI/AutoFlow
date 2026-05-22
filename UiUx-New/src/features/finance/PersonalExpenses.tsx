import { useState, useRef } from 'react';
import { Upload, Loader2, AlertTriangle, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Card, CardLabel } from '@/design/primitives/Card';
import { Badge } from '@/design/primitives/Badge';
import { Select } from '@/design/primitives/Select';
import { Avatar } from '@/design/primitives/Avatar';
import {
  PERSONAL_EXPENSES, CATEGORY_LABELS, REAL_CATEGORIES, MOCK_BANK_ROWS, detectCategory,
  type PersonalTransaction, type PersonalCategory,
} from '@/data/finance';
import { fmtMoney, fmtDate } from '@/lib/format';
import { cn } from '@/lib/cn';

const ALL_CATS: PersonalCategory[] = [...REAL_CATEGORIES, 'others'];

export function PersonalExpenses() {
  const [txns, setTxns] = useState<PersonalTransaction[]>(PERSONAL_EXPENSES);

  const addTxn = (t: PersonalTransaction) => setTxns(p => [t, ...p]);
  const recategorize = (id: string, cat: PersonalCategory) =>
    setTxns(p => p.map(t => t.id === id ? { ...t, category: cat, isOthers: false, isRecategorized: true } : t));

  const totals: Record<string, number> = {};
  txns.forEach(t => { totals[t.category] = (totals[t.category] ?? 0) + t.amount; });
  const grand = txns.reduce((s, t) => s + t.amount, 0);
  const unresolved = txns.filter(t => t.isOthers && !t.isRecategorized).length;

  return (
    <div className="space-y-5">
      {/* Category breakdown */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-4 h-11 border-b border-[var(--color-border)] flex items-center justify-between">
          <CardLabel>Expense breakdown by category</CardLabel>
          <span className="text-[11px] text-[var(--color-text-tertiary)]">Combined — both admins</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {ALL_CATS.map(cat => {
              const isOthers = cat === 'others';
              const amt = totals[cat] ?? 0;
              return (
                <div key={cat} className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">{CATEGORY_LABELS[cat]}</p>
                  <p className={cn('text-[17px] font-semibold tabular mt-1', isOthers && amt > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-primary)]')}>
                    {fmtMoney(amt)}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 tabular">
                    {txns.filter(t => t.category === cat).length} txn
                  </p>
                </div>
              );
            })}
          </div>

          {unresolved > 0 && (
            <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)]/50 px-3 py-2.5 mt-3">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--color-warning)]" />
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                <span className="font-medium text-[var(--color-text-primary)]">{unresolved} transaction{unresolved > 1 ? 's' : ''}</span> could not be auto-categorized. Reassign them in the tables below.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-4 h-11 mt-3">
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">Total personal expenses</span>
            <span className="text-[17px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(grand)}</span>
          </div>
        </div>
      </Card>

      {/* Admin panels */}
      <AdminPanel adminId="1" adminName="Admin 1" txns={txns.filter(t => t.adminId === '1')} onAdd={addTxn} onRecat={recategorize} />
      <AdminPanel adminId="2" adminName="Admin 2" txns={txns.filter(t => t.adminId === '2')} onAdd={addTxn} onRecat={recategorize} />
    </div>
  );
}

function AdminPanel({ adminId, adminName, txns, onAdd, onRecat }: {
  adminId: '1' | '2'; adminName: string; txns: PersonalTransaction[];
  onAdd: (t: PersonalTransaction) => void;
  onRecat: (id: string, cat: PersonalCategory) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const total = txns.reduce((s, t) => s + t.amount, 0);
  const others = txns.filter(t => t.isOthers && !t.isRecategorized).length;

  const upload = () => {
    setUploading(true);
    setTimeout(() => {
      const row = MOCK_BANK_ROWS[Math.floor(Math.random() * MOCK_BANK_ROWS.length)];
      const cat = detectCategory(row.desc);
      onAdd({
        id: 'pe-' + Date.now(), adminId, adminName,
        description: row.desc, amount: row.amount, category: cat,
        isOthers: cat === 'others', isRecategorized: false, date: new Date(),
      });
      setUploading(false);
    }, 1600);
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <Avatar name={adminName} size="md" />
          <div>
            <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{adminName}</p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] tabular">
              {txns.length} txn · {fmtMoney(total)}
              {others > 0 && <span className="text-[var(--color-warning)]"> · {others} to reassign</span>}
            </p>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={e => { if (e.target.files?.length) { upload(); e.target.value = ''; } }} />
        <Button variant="primary" size="sm" disabled={uploading}
          leading={uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          onClick={() => fileRef.current?.click()}>
          {uploading ? 'Extracting…' : 'Upload bank PDF'}
        </Button>
      </div>

      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
            {['Date', 'Description', 'Category', 'Amount', 'Status'].map((h, i) => (
              <th key={h} className={cn(
                'text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9',
                i === 3 ? 'text-right' : i === 4 ? 'text-center' : 'text-left',
              )}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {txns.length === 0 ? (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-[12px] text-[var(--color-text-tertiary)]">No transactions yet. Upload a bank PDF.</td></tr>
          ) : (
            [...txns].sort((a, b) => b.date.getTime() - a.date.getTime()).map(t => (
              <TxRow key={t.id} tx={t} onRecat={onRecat} />
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
            <td colSpan={3} className="px-4 h-10 text-[12px] font-medium text-[var(--color-text-secondary)]">Subtotal — {adminName}</td>
            <td className="px-4 h-10 text-right text-[13px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(total)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </Card>
  );
}

function TxRow({ tx, onRecat }: { tx: PersonalTransaction; onRecat: (id: string, cat: PersonalCategory) => void }) {
  const [selecting, setSelecting] = useState(false);
  const warn = tx.isOthers && !tx.isRecategorized;

  return (
    <tr className={cn('border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]', warn && 'bg-[var(--color-warning-bg)]/30')}>
      <td className="px-4 h-12 text-[var(--color-text-tertiary)] whitespace-nowrap">{fmtDate(tx.date)}</td>
      <td className="px-4 h-12 text-[var(--color-text-primary)] max-w-xs">
        <p className="truncate">{tx.description}</p>
        {tx.isRecategorized && (
          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-accent)] mt-0.5">
            <RotateCcw className="w-2.5 h-2.5" /> Manually reassigned
          </span>
        )}
      </td>
      <td className="px-4 h-12">
        {warn ? (
          <div className="flex items-center gap-2">
            <Badge tone="warning" dot>Others</Badge>
            {selecting ? (
              <Select autoFocus defaultValue="" className="h-7"
                onChange={e => { if (e.target.value) { onRecat(tx.id, e.target.value as PersonalCategory); setSelecting(false); } }}
                onBlur={() => setSelecting(false)}>
                <option value="" disabled>Select category…</option>
                {REAL_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </Select>
            ) : (
              <button onClick={() => setSelecting(true)} className="text-[12px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline">
                Reassign
              </button>
            )}
          </div>
        ) : (
          <Badge tone="accent">{CATEGORY_LABELS[tx.category]}</Badge>
        )}
      </td>
      <td className="px-4 h-12 text-right text-[13px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(tx.amount)}</td>
      <td className="px-4 h-12 text-center">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-success)]">
          <Check className="w-3 h-3" /> Extracted
        </span>
      </td>
    </tr>
  );
}
