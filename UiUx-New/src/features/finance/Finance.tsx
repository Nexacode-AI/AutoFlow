import { useState } from 'react';
import { Upload, FileText, Download } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { PageHeader } from '@/design/primitives/PageHeader';
import { Card, CardLabel } from '@/design/primitives/Card';
import { Badge } from '@/design/primitives/Badge';
import { KPI } from '@/design/primitives/KPI';
import { Tabs } from '@/design/primitives/Tabs';
import { PlateBadge } from '@/design/primitives/PlateBadge';
import { fmtMoney, fmtDate } from '@/lib/format';

const TABS = [
  { value: 'company',  label: 'Company expenses', count: 12 },
  { value: 'personal', label: 'Personal expenses', count: 34 },
] as const;
type Tab = (typeof TABS)[number]['value'];

const COMPANY = [
  { id: 'c1', code: 'WF-2024-0001', plate: 'WXY 1234', customer: 'Ahmad bin Abdullah', parts: 5, total: 425,  status: 'extracted', date: new Date(Date.now() - 86400000 * 1) },
  { id: 'c2', code: 'WF-2024-0003', plate: 'JKL 9012', customer: 'Raj Kumar',          parts: 7, total: 1280, status: 'processing', date: new Date(Date.now() - 86400000 * 2) },
  { id: 'c3', code: 'WF-2024-0007', plate: 'MNO 5432', customer: 'Krishnan Pillai',     parts: 3, total: 580,  status: 'extracted', date: new Date(Date.now() - 86400000 * 3) },
];

const PERSONAL = [
  { id: 'p1', admin: 'Admin 1', description: 'Petronas Mesra fuel',     amount: 150,  category: 'Category 3', date: new Date(Date.now() - 86400000 * 1) },
  { id: 'p2', admin: 'Admin 2', description: 'Tealive coffee',           amount: 12,   category: 'Others',     date: new Date(Date.now() - 86400000 * 1) },
  { id: 'p3', admin: 'Admin 1', description: 'Office stationery',        amount: 78,   category: 'Category 2', date: new Date(Date.now() - 86400000 * 2) },
  { id: 'p4', admin: 'Admin 2', description: 'Shopee parts shipment',    amount: 245,  category: 'Category 5', date: new Date(Date.now() - 86400000 * 3) },
];

export function Finance() {
  const [tab, setTab] = useState<Tab>('company');

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="Finance"
        subtitle="Track company expenses (bank slips) and personal admin expenses."
        actions={
          <>
            <Button variant="secondary" leading={<Download className="w-3.5 h-3.5" />}>Export</Button>
            <Button variant="primary" leading={<Upload className="w-3.5 h-3.5" />}>Upload PDF</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Company total"   value={fmtMoney(12450)} delta={{ value: 8.3 }}  spark={[800,1200,1600,1100,1400,1900,2100]} />
        <KPI label="Personal total"  value={fmtMoney(3820)}  delta={{ value: -2.1 }} spark={[400,520,480,610,520,450,420]} />
        <KPI label="Pending PDFs"    value="3"                delta={{ value: 0 }}    hint="Processing" />
        <KPI label="Recategorized"   value="7"                delta={{ value: 4.0 }}  hint="Others → fixed" />
      </div>

      <Tabs value={tab} onChange={setTab} tabs={TABS} />

      {tab === 'company' ? (
        <Card padding="none" className="overflow-hidden">
          <div className="px-4 h-11 border-b border-[var(--color-border)] flex items-center justify-between">
            <CardLabel>Bank slip uploads</CardLabel>
            <span className="text-[11px] tabular text-[var(--color-text-tertiary)]">{COMPANY.length} records</span>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                {['Workflow', 'Plate', 'Customer', 'Parts', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9 first:pl-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPANY.map(c => (
                <tr key={c.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]">
                  <td className="px-4 h-11 font-mono text-[12px] text-[var(--color-text-tertiary)]">{c.code}</td>
                  <td className="px-4 h-11"><PlateBadge plate={c.plate} size="sm" /></td>
                  <td className="px-4 h-11 text-[var(--color-text-primary)]">{c.customer}</td>
                  <td className="px-4 h-11 tabular text-[var(--color-text-secondary)]">{c.parts}</td>
                  <td className="px-4 h-11 tabular font-medium text-[var(--color-text-primary)]">{fmtMoney(c.total)}</td>
                  <td className="px-4 h-11"><Badge tone={c.status === 'extracted' ? 'success' : 'warning'} dot>{c.status}</Badge></td>
                  <td className="px-4 h-11 text-[var(--color-text-tertiary)]">{fmtDate(c.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="px-4 h-11 border-b border-[var(--color-border)] flex items-center justify-between">
            <CardLabel>Bank statement transactions</CardLabel>
            <span className="text-[11px] tabular text-[var(--color-text-tertiary)]">{PERSONAL.length} transactions</span>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                {['Date', 'Admin', 'Description', 'Category', 'Amount'].map(h => (
                  <th key={h} className={`text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9 first:pl-4 ${h === 'Amount' ? 'text-right pr-4' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERSONAL.map(p => (
                <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]">
                  <td className="px-4 h-11 text-[var(--color-text-tertiary)]">{fmtDate(p.date)}</td>
                  <td className="px-4 h-11"><Badge tone="neutral">{p.admin}</Badge></td>
                  <td className="px-4 h-11 text-[var(--color-text-primary)]">{p.description}</td>
                  <td className="px-4 h-11"><Badge tone={p.category === 'Others' ? 'warning' : 'neutral'}>{p.category}</Badge></td>
                  <td className="px-4 h-11 tabular font-medium text-[var(--color-text-primary)] text-right pr-4">{fmtMoney(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Card padding="lg" className="border-dashed">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] flex items-center justify-center">
              <FileText className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[var(--color-text-primary)]">Drop PDF here to auto-extract</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">Bank slips (company) or statements (personal)</p>
            </div>
          </div>
          <Button variant="secondary" leading={<Upload className="w-3.5 h-3.5" />}>Browse files</Button>
        </div>
      </Card>
    </div>
  );
}
