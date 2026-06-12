import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Loader2, AlertTriangle, RotateCcw, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Card, CardLabel } from '@/design/primitives/Card';
import { Badge } from '@/design/primitives/Badge';
import { Select } from '@/design/primitives/Select';
import { Avatar } from '@/design/primitives/Avatar';
import { CATEGORY_LABELS, REAL_CATEGORIES, type PersonalCategory } from '@/data/finance';
import {
  getSummary,
  listTransactions,
  recategorizeTransaction,
  uploadBankStatement,
  type SummaryResponse,
  type TransactionResponse,
} from '@/lib/finance/api';
import { useAuthStore } from '@/lib/auth/useAuthStore';
import { fmtMoney, fmtDate } from '@/lib/format';
import { cn } from '@/lib/cn';

const ALL_CATS: PersonalCategory[] = [...REAL_CATEGORIES, 'others'];

/** Parse an ISO date-only string (YYYY-MM-DD) as a *local* date, not UTC. */
const localDate = (iso: string) => new Date(`${iso}T00:00:00`);

// ── Top-level component ───────────────────────────────────────────────────────

export function PersonalExpenses() {
  // Transactions: backend returns only the current admin's rows
  // (super_admin receives everyone's). Summary: combined totals, shared.
  const [txns, setTxns] = useState<TransactionResponse[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [txnData, summaryData] = await Promise.all([listTransactions(), getSummary()]);
      setTxns(txnData);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const refreshSummary = async () => {
    try {
      setSummary(await getSummary());
    } catch {
      // non-fatal: keep showing the previous summary
    }
  };

  const handleRecat = async (expenseId: string, cat: PersonalCategory) => {
    try {
      const updated = await recategorizeTransaction(expenseId, cat);
      setTxns(prev => prev.map(t => (t.expense_id === expenseId ? updated : t)));
      refreshSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const handleUpload = (newTxns: TransactionResponse[]) => {
    setTxns(prev => [...newTxns, ...prev]);
    refreshSummary();
  };

  // Combined totals come from the summary endpoint (shared across admins)
  const catTotals: Record<string, { total: number; count: number }> = {};
  summary?.categories.forEach(c => { catTotals[c.category] = { total: c.total, count: c.count }; });
  const grand = summary?.grand_total ?? 0;
  const unresolved = summary?.unresolved_count ?? 0;

  // Group visible transactions per admin (only ever >1 panel for super_admin)
  const adminMap = new Map<string, { name: string; txns: TransactionResponse[] }>();
  for (const t of txns) {
    if (!adminMap.has(t.admin_id)) adminMap.set(t.admin_id, { name: t.admin_name, txns: [] });
    adminMap.get(t.admin_id)!.txns.push(t);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-[var(--color-text-tertiary)]">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-[13px]">Loading transactions…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />
        <p className="text-[13px] text-[var(--color-text-secondary)]">{error}</p>
        <Button variant="secondary" size="sm" leading={<RefreshCw className="w-3 h-3" />} onClick={fetchAll}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Category breakdown — combined totals across all admins */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-4 h-11 border-b border-[var(--color-border)] flex items-center justify-between">
          <CardLabel>Expense breakdown by category</CardLabel>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--color-text-tertiary)]">Combined — all admins</span>
            <button onClick={fetchAll} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {ALL_CATS.map(cat => {
              const isOthers = cat === 'others';
              const entry = catTotals[cat];
              return (
                <div key={cat} className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <p className={cn(
                    'text-[17px] font-semibold tabular mt-1',
                    isOthers && (entry?.total ?? 0) > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-primary)]',
                  )}>
                    {fmtMoney(entry?.total ?? 0)}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 tabular">
                    {entry?.count ?? 0} txn
                  </p>
                </div>
              );
            })}
          </div>

          {unresolved > 0 && (
            <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)]/50 px-3 py-2.5 mt-3">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--color-warning)]" />
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                <span className="font-medium text-[var(--color-text-primary)]">
                  {unresolved} transaction{unresolved > 1 ? 's' : ''}
                </span>{' '}
                could not be auto-categorized. Reassign them in the tables below.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] border border-[var(--color-border)] px-4 h-11 mt-3">
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">Total personal expenses</span>
            <span className="text-[17px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(grand)}</span>
          </div>
        </div>
      </Card>

      {/* Per-admin panels — regular admins only ever see their own */}
      {txns.length === 0 ? (
        user && (
          <AdminPanel
            adminId={user.user_id}
            adminName={user.name}
            txns={[]}
            onUpload={handleUpload}
            onRecat={handleRecat}
          />
        )
      ) : (
        Array.from(adminMap.entries()).map(([adminId, { name, txns: adminTxns }]) => (
          <AdminPanel
            key={adminId}
            adminId={adminId}
            adminName={name}
            txns={adminTxns}
            onUpload={handleUpload}
            onRecat={handleRecat}
          />
        ))
      )}
    </div>
  );
}

// ── Per-admin panel ───────────────────────────────────────────────────────────

function AdminPanel({
  adminId,
  adminName,
  txns,
  onUpload,
  onRecat,
}: {
  adminId: string;
  adminName: string;
  txns: TransactionResponse[];
  onUpload: (txns: TransactionResponse[]) => void;
  onRecat: (expenseId: string, cat: PersonalCategory) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const total = txns.reduce((s, t) => s + t.amount, 0);
  const others = txns.filter(t => t.category === 'others' && !t.is_recategorized).length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';   // reset so same file can be re-uploaded

    setUploading(true);
    setUploadError(null);
    try {
      const result = await uploadBankStatement(file, adminId);
      onUpload(result.transactions);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
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

        <div className="flex items-center gap-2">
          {uploadError && (
            <span className="text-[11px] text-[var(--color-warning)]">{uploadError}</span>
          )}
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
          <Button
            variant="primary"
            size="sm"
            disabled={uploading}
            leading={uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? 'Extracting…' : 'Upload bank PDF'}
          </Button>
        </div>
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
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-[12px] text-[var(--color-text-tertiary)]">
                No transactions yet. Upload a bank PDF.
              </td>
            </tr>
          ) : (
            [...txns]
              .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
              .map(t => <TxRow key={t.expense_id} tx={t} onRecat={onRecat} />)
          )}
        </tbody>
        <tfoot>
          <tr className="border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
            <td colSpan={3} className="px-4 h-10 text-[12px] font-medium text-[var(--color-text-secondary)]">
              Subtotal — {adminName}
            </td>
            <td className="px-4 h-10 text-right text-[13px] font-semibold tabular text-[var(--color-text-primary)]">
              {fmtMoney(total)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </Card>
  );
}

// ── Transaction row ───────────────────────────────────────────────────────────

function TxRow({
  tx,
  onRecat,
}: {
  tx: TransactionResponse;
  onRecat: (expenseId: string, cat: PersonalCategory) => void;
}) {
  const [selecting, setSelecting] = useState(false);
  const warn = tx.category === 'others' && !tx.is_recategorized;

  return (
    <tr className={cn(
      'border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]',
      warn && 'bg-[var(--color-warning-bg)]/30',
    )}>
      <td className="px-4 h-12 text-[var(--color-text-tertiary)] whitespace-nowrap">
        {fmtDate(localDate(tx.transaction_date))}
      </td>
      <td className="px-4 h-12 text-[var(--color-text-primary)] max-w-xs">
        <p className="truncate">{tx.description}</p>
        {tx.is_recategorized && (
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
              <Select
                autoFocus
                defaultValue=""
                className="h-7"
                onChange={e => {
                  if (e.target.value) {
                    onRecat(tx.expense_id, e.target.value as PersonalCategory);
                    setSelecting(false);
                  }
                }}
                onBlur={() => setSelecting(false)}
              >
                <option value="" disabled>Select category…</option>
                {REAL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </Select>
            ) : (
              <button
                onClick={() => setSelecting(true)}
                className="text-[12px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline"
              >
                Reassign
              </button>
            )}
          </div>
        ) : (
          <Badge tone="accent">{CATEGORY_LABELS[tx.category as PersonalCategory] ?? tx.category_label}</Badge>
        )}
      </td>
      <td className="px-4 h-12 text-right text-[13px] font-semibold tabular text-[var(--color-text-primary)]">
        {fmtMoney(tx.amount)}
      </td>
      <td className="px-4 h-12 text-center">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-success)]">
          <Check className="w-3 h-3" /> Extracted
        </span>
      </td>
    </tr>
  );
}
