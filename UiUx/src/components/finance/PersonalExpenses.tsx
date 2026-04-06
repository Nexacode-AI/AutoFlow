import { useState, useRef } from 'react';
import {
  Upload, AlertTriangle, Loader2, CheckCircle2, RotateCcw, Eye
} from 'lucide-react';
import {
  PersonalExpenseTransaction,
  PersonalExpenseCategory,
  PERSONAL_EXPENSE_CATEGORY_LABELS,
} from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Mock pre-seeded transactions
// * Data source: replace with API — personal-expenses endpoint filtered by adminId
// ─────────────────────────────────────────────────────────────────────────────
const seedTransactions: PersonalExpenseTransaction[] = [
  { id: 'pe1',  adminId: '1', adminName: 'Admin 1', description: 'Monthly internet subscription - category_3',      amount: 129.00, category: 'category_3', isOthers: false, isRecategorized: false, date: new Date('2026-04-01'), pdfStatus: 'extracted' },
  { id: 'pe2',  adminId: '1', adminName: 'Admin 1', description: 'Petrol reimbursement - category_1',               amount: 210.00, category: 'category_1', isOthers: false, isRecategorized: false, date: new Date('2026-04-02'), pdfStatus: 'extracted' },
  { id: 'pe3',  adminId: '1', adminName: 'Admin 1', description: 'Office stationery purchase',                      amount: 85.50,  category: 'others',     isOthers: true,  isRecategorized: false, date: new Date('2026-04-03'), pdfStatus: 'extracted' },
  { id: 'pe4',  adminId: '1', adminName: 'Admin 1', description: 'Team lunch - category_5',                        amount: 310.00, category: 'category_5', isOthers: false, isRecategorized: false, date: new Date('2026-04-04'), pdfStatus: 'extracted' },
  { id: 'pe5',  adminId: '1', adminName: 'Admin 1', description: 'Workshop equipment maintenance - category_2',    amount: 450.00, category: 'category_2', isOthers: false, isRecategorized: false, date: new Date('2026-03-28'), pdfStatus: 'extracted' },
  { id: 'pe6',  adminId: '1', adminName: 'Admin 1', description: 'Staff welfare expenses',                         amount: 175.00, category: 'others',     isOthers: true,  isRecategorized: false, date: new Date('2026-03-25'), pdfStatus: 'extracted' },
  { id: 'pe7',  adminId: '1', adminName: 'Admin 1', description: 'Vehicle insurance renewal - category_4',         amount: 890.00, category: 'category_4', isOthers: false, isRecategorized: false, date: new Date('2026-03-20'), pdfStatus: 'extracted' },
  { id: 'pe8',  adminId: '2', adminName: 'Admin 2', description: 'Marketing campaign ads - category_6',            amount: 620.00, category: 'category_6', isOthers: false, isRecategorized: false, date: new Date('2026-04-01'), pdfStatus: 'extracted' },
  { id: 'pe9',  adminId: '2', adminName: 'Admin 2', description: 'Software subscription renewal - category_3',     amount: 299.00, category: 'category_3', isOthers: false, isRecategorized: false, date: new Date('2026-04-02'), pdfStatus: 'extracted' },
  { id: 'pe10', adminId: '2', adminName: 'Admin 2', description: 'Courier charges for client docs',                amount: 45.00,  category: 'others',     isOthers: true,  isRecategorized: false, date: new Date('2026-04-03'), pdfStatus: 'extracted' },
  { id: 'pe11', adminId: '2', adminName: 'Admin 2', description: 'Client entertainment - category_5',              amount: 530.00, category: 'category_5', isOthers: false, isRecategorized: false, date: new Date('2026-03-30'), pdfStatus: 'extracted' },
  { id: 'pe12', adminId: '2', adminName: 'Admin 2', description: 'Training material - category_7',                 amount: 180.00, category: 'category_7', isOthers: false, isRecategorized: false, date: new Date('2026-03-22'), pdfStatus: 'extracted' },
  { id: 'pe13', adminId: '2', adminName: 'Admin 2', description: 'Cleaning supplies and consumables - category_2', amount: 92.00,  category: 'category_2', isOthers: false, isRecategorized: false, date: new Date('2026-03-18'), pdfStatus: 'extracted' },
];

const CATEGORIES = (Object.keys(PERSONAL_EXPENSE_CATEGORY_LABELS) as PersonalExpenseCategory[]).filter(k => k !== 'others');

// * PDF extraction: replace with NLP/regex against real bank statement descriptions
function detectCategory(description: string): PersonalExpenseCategory {
  const lower = description.toLowerCase();
  for (const cat of CATEGORIES) {
    if (lower.includes(cat)) return cat;
  }
  return 'others';
}

const mockNewDescriptions = [
  { desc: 'Workshop tools purchase - category_2', amount: 340.00 },
  { desc: 'Monthly phone bill payment - category_3', amount: 88.00 },
  { desc: 'Client meeting expenses', amount: 215.50 },
  { desc: 'Training workshop fee - category_7', amount: 450.00 },
  { desc: 'Printing and stationery supplies', amount: 67.00 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Category summary section
// ─────────────────────────────────────────────────────────────────────────────
function CategorySummary({ transactions }: { transactions: PersonalExpenseTransaction[] }) {
  const totals: Record<string, number> = {};
  transactions.forEach(t => { totals[t.category] = (totals[t.category] ?? 0) + t.amount; });
  const grandTotal = transactions.reduce((s, t) => s + t.amount, 0);
  const othersUnresolved = transactions.filter(t => t.isOthers && !t.isRecategorized).length;

  const allCats: PersonalExpenseCategory[] = [...CATEGORIES, 'others'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Expense Breakdown by Category</h3>
        <p className="text-sm text-gray-500 mt-0.5">Combined totals across both admins</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {allCats.map(cat => (
            <div key={cat} className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {PERSONAL_EXPENSE_CATEGORY_LABELS[cat as PersonalExpenseCategory]}
              </div>
              <div className={`text-xl font-bold ${cat === 'others' && totals[cat] > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                RM {(totals[cat] ?? 0).toFixed(2)}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {transactions.filter(t => t.category === cat).length} transaction(s)
              </div>
            </div>
          ))}
        </div>

        {othersUnresolved > 0 && (
          <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
            <span>
              <strong>{othersUnresolved} transaction{othersUnresolved > 1 ? 's' : ''}</strong> could not be auto-categorized. Please reassign them to the correct category in the table below.
            </span>
          </div>
        )}

        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-5 py-3">
          <span className="text-sm font-semibold text-gray-700">Total Personal Expenses (All)</span>
          <span className="text-xl font-bold text-gray-900">RM {grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction row
// ─────────────────────────────────────────────────────────────────────────────
function TxRow({
  tx,
  canEdit,
  onRecategorize,
}: {
  tx: PersonalExpenseTransaction;
  canEdit: boolean;
  onRecategorize: (id: string, cat: PersonalExpenseCategory) => void;
}) {
  const [selecting, setSelecting] = useState(false);
  const isWarning = tx.isOthers && !tx.isRecategorized;

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50 ${isWarning ? 'bg-amber-50/50' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {tx.date.toLocaleDateString('en-MY')}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
        <div className="truncate" title={tx.description}>{tx.description}</div>
        {tx.isRecategorized && (
          <div className="text-xs text-indigo-500 flex items-center gap-1 mt-0.5">
            <RotateCcw className="w-3 h-3" /> Manually reassigned
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isWarning ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" /> Others
            </span>
            {canEdit && (
              selecting ? (
                <select
                  autoFocus
                  className="text-xs border border-indigo-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue=""
                  onChange={e => { if (e.target.value) { onRecategorize(tx.id, e.target.value as PersonalExpenseCategory); setSelecting(false); } }}
                  onBlur={() => setSelecting(false)}
                >
                  <option value="" disabled>Select category…</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{PERSONAL_EXPENSE_CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              ) : (
                <button onClick={() => setSelecting(true)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline">
                  Reassign
                </button>
              )
            )}
          </div>
        ) : (
          <span className="inline-flex text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">
            {PERSONAL_EXPENSE_CATEGORY_LABELS[tx.category]}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
        RM {tx.amount.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" /> Extracted
        </span>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin panel (one table per admin)
// ─────────────────────────────────────────────────────────────────────────────
function AdminPanel({
  adminId, adminName, transactions, canEdit, onNewTransaction, onRecategorize,
}: {
  adminId: string;
  adminName: string;
  transactions: PersonalExpenseTransaction[];
  canEdit: boolean;
  onNewTransaction: (t: PersonalExpenseTransaction) => void;
  onRecategorize: (id: string, cat: PersonalExpenseCategory) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const total = transactions.reduce((s, t) => s + t.amount, 0);
  const othersCount = transactions.filter(t => t.isOthers && !t.isRecategorized).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    e.target.value = ''; // * PDF discarded immediately — no storage
    // * PDF extraction: replace setTimeout with real bank-statement parser
    setTimeout(() => {
      const mock = mockNewDescriptions[Math.floor(Math.random() * mockNewDescriptions.length)];
      const detectedCat = detectCategory(mock.desc);
      onNewTransaction({
        id: 'pe-' + Date.now(),
        adminId, adminName,
        description: mock.desc,
        amount: mock.amount,
        category: detectedCat,
        isOthers: detectedCat === 'others',
        isRecategorized: false,
        date: new Date(),
        pdfStatus: 'extracted',
      });
      setUploading(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h3 className="font-semibold text-gray-900">{adminName}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} &middot; RM {total.toFixed(2)} total
            {othersCount > 0 && (
              <span className="ml-2 text-amber-600 font-medium">&middot; {othersCount} to reassign</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit ? (
            <>
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting…</> : <><Upload className="w-4 h-4" /> Upload Bank PDF</>}
              </button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <Eye className="w-3.5 h-3.5" /> View only
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  No transactions yet. Upload a bank PDF to get started.
                </td>
              </tr>
            ) : (
              [...transactions]
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map(tx => (
                  <TxRow key={tx.id} tx={tx} canEdit={canEdit} onRecategorize={onRecategorize} />
                ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200">
              <td colSpan={3} className="px-6 py-3 text-sm font-semibold text-gray-700">Subtotal — {adminName}</td>
              <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">RM {total.toFixed(2)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main PersonalExpenses component
// ─────────────────────────────────────────────────────────────────────────────
type ViewMode = 'my' | 'other' | 'combined';

export default function PersonalExpenses() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PersonalExpenseTransaction[]>(seedTransactions);
  const [view, setView] = useState<ViewMode>('combined');

  // * Auth: replace role check with real session-scoped ownership
  const isAdmin1 = user?.role === Role.ADMIN;
  const isAdmin2 = user?.role === Role.ADMIN2;
  const isSuperAdmin = user?.role === Role.SUPERADMIN;
  const isAnyAdmin = isAdmin1 || isAdmin2 || isSuperAdmin;

  const myAdminId   = isAdmin1 ? '1' : isAdmin2 ? '2' : null;
  const myAdminName = isAdmin1 ? 'Admin 1' : isAdmin2 ? 'Admin 2' : null;
  const otherAdminId   = isAdmin1 ? '2' : isAdmin2 ? '1' : null;
  const otherAdminName = isAdmin1 ? 'Admin 2' : isAdmin2 ? 'Admin 1' : null;

  const admin1Txs = transactions.filter(t => t.adminId === '1');
  const admin2Txs = transactions.filter(t => t.adminId === '2');

  const handleNewTransaction = (tx: PersonalExpenseTransaction) => setTransactions(prev => [tx, ...prev]);

  const handleRecategorize = (id: string, cat: PersonalExpenseCategory) => {
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, category: cat, isOthers: false, isRecategorized: true } : t)
    );
  };

  if (!isAnyAdmin) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-sm text-gray-500">
        <Eye className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        Personal expenses are only visible to Admin accounts.
      </div>
    );
  }

  const viewTabs: { key: ViewMode; label: string }[] = isAdmin1 || isAdmin2 ? [
    { key: 'my',       label: `My Expenses (${myAdminName})` },
    { key: 'other',    label: `${otherAdminName}'s Expenses` },
    { key: 'combined', label: 'Combined View' },
  ] : [];

  return (
    <div className="space-y-6">
      <CategorySummary transactions={transactions} />

      {/* View tabs — only for actual admin logins */}
      {viewTabs.length > 0 && (
        <div className="flex border-b border-gray-200">
          {viewTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                view === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Panels */}
      {isSuperAdmin || view === 'combined' ? (
        <div className="space-y-4">
          <AdminPanel adminId="1" adminName="Admin 1" transactions={admin1Txs} canEdit={isAdmin1 || isSuperAdmin} onNewTransaction={handleNewTransaction} onRecategorize={handleRecategorize} />
          <AdminPanel adminId="2" adminName="Admin 2" transactions={admin2Txs} canEdit={isAdmin2} onNewTransaction={handleNewTransaction} onRecategorize={handleRecategorize} />
        </div>
      ) : view === 'my' ? (
        <AdminPanel adminId={myAdminId!} adminName={myAdminName!} transactions={transactions.filter(t => t.adminId === myAdminId)} canEdit={true} onNewTransaction={handleNewTransaction} onRecategorize={handleRecategorize} />
      ) : (
        <AdminPanel adminId={otherAdminId!} adminName={otherAdminName!} transactions={transactions.filter(t => t.adminId === otherAdminId)} canEdit={false} onNewTransaction={handleNewTransaction} onRecategorize={handleRecategorize} />
      )}

      <p className="text-xs text-gray-400 text-center">
        {/* * Auth: enforce server-side ownership — client-side role check is UI-only */}
        You can only upload and edit your own expenses. The other admin's records are read-only.
      </p>
    </div>
  );
}
