import { useState, useRef } from 'react';
import {
  Upload, CheckCircle2, Clock, AlertTriangle, Pencil,
  Check, X, PackagePlus, Loader2, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { CompanyExpenseRecord, CompanyExpensePart } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// * Data source: join workflow context (workflowParts) when expense record exists
// ─────────────────────────────────────────────────────────────────────────────
const seedRecords: CompanyExpenseRecord[] = [
  {
    id: 'ce1',
    workflowId: 'wf-mock-1',
    plateNumber: 'WXY 1234',
    workflowCode: 'WF4B2K1A',
    customerName: 'Ahmad bin Abdullah',
    status: 'in_progress',
    createdAt: new Date('2026-04-01'),
    parts: [
      { id: 'cep1', partName: 'Brake Pads (Front)', partType: 'ORI', quantity: 1, pdfStatus: 'extracted', extractedAmount: 152.00 },
      { id: 'cep2', partName: 'Brake Disc (Front)',  partType: 'ORI', quantity: 1, pdfStatus: 'extracted', extractedAmount: 318.00, isManuallyEdited: true },
      { id: 'cep3', partName: 'Brake Fluid',         partType: 'OM',  quantity: 2, pdfStatus: 'pending' },
    ],
  },
  {
    id: 'ce2',
    workflowId: 'wf-mock-2',
    plateNumber: 'ABC 5678',
    workflowCode: 'WF7X9M3C',
    customerName: 'Lim Wei Xiang',
    status: 'completed',
    createdAt: new Date('2026-03-28'),
    parts: [
      { id: 'cep4', partName: 'Engine Oil Filter',      partType: 'ORI', quantity: 1, pdfStatus: 'extracted', extractedAmount: 43.00 },
      { id: 'cep5', partName: 'Air Filter',             partType: 'OM',  quantity: 1, pdfStatus: 'extracted', extractedAmount: 36.50 },
      { id: 'cep6', partName: 'Spark Plugs (Set of 4)', partType: 'ORI', quantity: 1, pdfStatus: 'extracted', extractedAmount: 118.00 },
    ],
  },
  {
    id: 'ce3',
    workflowId: 'wf-mock-3',
    plateNumber: 'DEF 9012',
    workflowCode: 'WF2R5T8Q',
    customerName: 'Siti Rahmah',
    status: 'in_progress',
    createdAt: new Date('2026-04-04'),
    parts: [
      { id: 'cep7', partName: 'Shock Absorber (Front)', partType: 'ORI', quantity: 2, pdfStatus: 'pending' },
      { id: 'cep8', partName: 'Coil Spring',            partType: 'ORI', quantity: 2, pdfStatus: 'pending' },
    ],
  },
];

const mockExtractedAmounts: Record<string, number> = {
  'Shock Absorber (Front)': 274.00,
  'Coil Spring':            158.00,
  'Brake Fluid':             33.00,
};

function getExtractedAmount(partName: string): number {
  return mockExtractedAmounts[partName] ?? Math.round((Math.random() * 200 + 50) * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// Part row inside the table
// ─────────────────────────────────────────────────────────────────────────────
interface PartRowProps {
  part: CompanyExpensePart;
  onExtract: (partId: string) => void;
  onAmountEdit: (partId: string, amount: number) => void;
  readOnly: boolean;
}

function PartRow({ part, onExtract, onAmountEdit, readOnly }: PartRowProps) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    // * PDF is NOT stored — discarded immediately after extraction trigger
    onExtract(part.id);
    e.target.value = '';
  };

  const saveEdit = () => {
    const n = parseFloat(editVal);
    if (!isNaN(n) && n >= 0) onAmountEdit(part.id, n);
    setEditing(false);
  };

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100">
      {/* Part name */}
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{part.partName}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            part.partType === 'ORI' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'
          }`}>{part.partType}</span>
          <span className="text-xs text-gray-400">× {part.quantity}</span>
        </div>
      </td>

      {/* PDF status */}
      <td className="px-6 py-4 whitespace-nowrap">
        {part.pdfStatus === 'extracted' && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Extracted
          </span>
        )}
        {part.pdfStatus === 'processing' && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
            <Loader2 className="w-3 h-3 animate-spin" /> Processing…
          </span>
        )}
        {part.pdfStatus === 'pending' && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3" /> Awaiting PDF
          </span>
        )}
      </td>

      {/* Extracted amount */}
      <td className="px-6 py-4 text-right whitespace-nowrap">
        {part.pdfStatus === 'extracted' ? (
          <div className="flex items-center justify-end gap-2">
            {editing ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">RM</span>
                <input
                  autoFocus
                  type="number"
                  value={editVal}
                  onChange={e => setEditVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false); }}
                  className="w-24 text-right text-sm border border-indigo-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={saveEdit} className="text-green-600 hover:text-green-700 p-0.5">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600 p-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="text-sm font-semibold text-gray-900">
                  RM {(part.extractedAmount ?? 0).toFixed(2)}
                </span>
                {part.isManuallyEdited && (
                  <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                    Edited
                  </span>
                )}
                {!readOnly && (
                  <button
                    onClick={() => { setEditVal(String(part.extractedAmount ?? '')); setEditing(true); }}
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Override extracted amount"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>

      {/* Upload action */}
      <td className="px-6 py-4 text-center whitespace-nowrap">
        {!readOnly ? (
          <>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={part.pdfStatus === 'processing'}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                part.pdfStatus === 'extracted'
                  ? 'border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 bg-white'
                  : 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Upload className="w-3.5 h-3.5" />
              {part.pdfStatus === 'extracted' ? 'Re-upload' : 'Upload PDF'}
            </button>
          </>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Expense card per workflow
// ─────────────────────────────────────────────────────────────────────────────
interface ExpenseCardProps {
  record: CompanyExpenseRecord;
  onUpdate: (updated: CompanyExpenseRecord) => void;
}

function ExpenseCard({ record, onUpdate }: ExpenseCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [showAddPart, setShowAddPart] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newPartType, setNewPartType] = useState<'ORI' | 'OM'>('ORI');
  const [newPartQty, setNewPartQty] = useState(1);

  const isCompleted = record.status === 'completed';
  const allExtracted = record.parts.every(p => p.pdfStatus === 'extracted');
  const extractedCount = record.parts.filter(p => p.pdfStatus === 'extracted').length;
  const totalExpense = record.parts.reduce((s, p) => s + (p.extractedAmount ?? 0), 0);

  const handleExtract = (partId: string) => {
    // Set to processing
    const processing = { ...record, parts: record.parts.map(p => p.id === partId ? { ...p, pdfStatus: 'processing' as const } : p) };
    onUpdate(processing);
    // * PDF extraction: replace setTimeout with real async parser
    setTimeout(() => {
      const part = record.parts.find(p => p.id === partId)!;
      onUpdate({
        ...record,
        parts: record.parts.map(p =>
          p.id === partId ? { ...p, pdfStatus: 'extracted', extractedAmount: getExtractedAmount(part.partName) } : p
        ),
      });
    }, 1500);
  };

  const handleAmountEdit = (partId: string, amount: number) => {
    onUpdate({ ...record, parts: record.parts.map(p => p.id === partId ? { ...p, extractedAmount: amount, isManuallyEdited: true } : p) });
  };

  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    const newPart: CompanyExpensePart = {
      id: 'cep-' + Date.now(),
      partName: newPartName.trim(),
      partType: newPartType,
      quantity: newPartQty,
      pdfStatus: 'pending',
    };
    onUpdate({ ...record, parts: [...record.parts, newPart] });
    setNewPartName(''); setNewPartType('ORI'); setNewPartQty(1); setShowAddPart(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Card header */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer select-none border-b border-gray-100"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-900">{record.plateNumber}</span>
              <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{record.workflowCode}</code>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isCompleted ? <><CheckCircle2 className="w-3 h-3" /> Completed</> : <><Clock className="w-3 h-3" /> In Progress</>}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {record.customerName || 'Customer'} &middot; {record.createdAt.toLocaleDateString('en-MY')} &middot; {extractedCount}/{record.parts.length} PDFs processed
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Expenses</div>
            <div className="text-lg font-bold text-gray-900">
              {totalExpense > 0 ? `RM ${totalExpense.toFixed(2)}` : '—'}
            </div>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
        </div>
      </div>

      {expanded && (
        <>
          {/* Parts table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDF Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (from bank slip)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {record.parts.map(part => (
                  <PartRow key={part.id} part={part} onExtract={handleExtract} onAmountEdit={handleAmountEdit} readOnly={isCompleted} />
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td colSpan={2} className="px-6 py-3 text-sm font-semibold text-gray-700">
                    Total — {record.parts.length} part{record.parts.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                    RM {totalExpense.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Add missed part */}
          {!isCompleted && (
            <div className="px-6 py-3 border-t border-gray-100">
              {showAddPart ? (
                <div className="flex flex-wrap items-end gap-3 py-1">
                  <div className="flex-1 min-w-40">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Part Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Engine Mount"
                      value={newPartName}
                      onChange={e => setNewPartName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddPart()}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newPartType}
                      onChange={e => setNewPartType(e.target.value as 'ORI' | 'OM')}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ORI">ORI</option>
                      <option value="OM">OM</option>
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                    <input
                      type="number" min={1} value={newPartQty}
                      onChange={e => setNewPartQty(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button onClick={handleAddPart} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Add Part</button>
                  <button onClick={() => setShowAddPart(false)} className="text-gray-500 hover:text-gray-700 text-sm px-2 py-2">Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddPart(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <PackagePlus className="w-4 h-4" /> Add missed part
                </button>
              )}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-xs text-gray-500">
              {extractedCount}/{record.parts.length} bank slips processed
            </span>
            {isCompleted ? (
              <button
                onClick={() => onUpdate({ ...record, status: 'in_progress' })}
                className="inline-flex items-center gap-1.5 text-sm font-medium border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors bg-white"
              >
                <Pencil className="w-3.5 h-3.5" /> Reopen
              </button>
            ) : (
              <button
                onClick={() => onUpdate({ ...record, status: 'completed' })}
                disabled={!allExtracted}
                title={!allExtracted ? 'Upload all bank slip PDFs before completing' : ''}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function CompanyExpenses() {
  const [records, setRecords] = useState<CompanyExpenseRecord[]>(seedRecords);

  const handleUpdate = (updated: CompanyExpenseRecord) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const totalExpenses = records.reduce((s, r) => s + r.parts.reduce((ps, p) => ps + (p.extractedAmount ?? 0), 0), 0);
  const completedExpenses = records.filter(r => r.status === 'completed').reduce((s, r) => s + r.parts.reduce((ps, p) => ps + (p.extractedAmount ?? 0), 0), 0);
  const pendingPdfs = records.reduce((s, r) => s + r.parts.filter(p => p.pdfStatus === 'pending').length, 0);
  const completedCount = records.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Records', value: records.length, sub: `${completedCount} completed`, color: 'text-gray-900' },
          { label: 'Total Expenses', value: `RM ${totalExpenses.toFixed(2)}`, sub: 'All records', color: 'text-gray-900' },
          { label: 'Verified Expenses', value: `RM ${completedExpenses.toFixed(2)}`, sub: 'Completed records', color: 'text-green-700' },
          { label: 'Pending PDFs', value: pendingPdfs, sub: 'Awaiting upload', color: pendingPdfs > 0 ? 'text-amber-600' : 'text-gray-400' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-500 mb-1">{card.label}</div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* PDF notice */}
      <div className="flex items-start gap-2 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
        <span>
          <strong>Bank slip PDFs</strong> are used only for amount extraction and discarded immediately — no file is stored.
          {/* * Storage: integrate temporary secure upload + auto-delete pipeline after parsing */}
        </span>
      </div>

      {/* Expense cards */}
      <div className="space-y-4">
        {records.map(record => (
          <ExpenseCard key={record.id} record={record} onUpdate={handleUpdate} />
        ))}
      </div>
    </div>
  );
}
