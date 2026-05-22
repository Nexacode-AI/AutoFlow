import { useState } from 'react';
import {
  Send, Copy, Link as LinkIcon, RefreshCw, Plus, Trash2, FileText, Check, X,
} from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field, Input } from '@/design/primitives/Input';
import { Select } from '@/design/primitives/Select';
import { Badge } from '@/design/primitives/Badge';
import { StepBlock } from '../StepBlock';
import {
  ACTIVE_JOB, WORKFLOW_CODE, PLATE_NUMBER, ACTIVE_PARTS,
  PARTS_CATALOG, type PartType,
} from '@/data/mocks';
import { fmtMoney, fmtDate } from '@/lib/format';

const CATEGORIES = Object.keys(PARTS_CATALOG);

const APPROVAL_LINK = 'https://autoflow.app/client-approval?token=abc123xyz789secure';
const SERVICE_TAX = 0.06;

type LineItem = { id: string; name: string; qty: number; price: number; partType?: PartType };

export function AuthorizationModule() {
  const total = ACTIVE_PARTS.reduce((s, p) => s + p.markupPrice * p.qty, 0);

  /* ── Step 11: quotation builder ── */
  const [items, setItems] = useState<LineItem[]>(
    () => ACTIVE_PARTS.map(p => ({ id: p.id, name: p.name, qty: p.qty, price: p.markupPrice })),
  );
  const [labour, setLabour] = useState('500');
  const [adding, setAdding] = useState(false);
  const [addCategory, setAddCategory] = useState('');
  const [addPartId, setAddPartId] = useState('');
  const [addType, setAddType] = useState<PartType>('ORI');
  const [addQty, setAddQty] = useState('1');
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const partsTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const labourNum = parseFloat(labour) || 0;
  const tax = (partsTotal + labourNum) * SERVICE_TAX;
  const grand = partsTotal + labourNum + tax;

  const catalogPart = PARTS_CATALOG[addCategory]?.find(p => p.id === addPartId);
  const addUnitPrice = catalogPart ? (addType === 'ORI' ? catalogPart.oriPrice : catalogPart.omPrice) : 0;

  const resetAdd = () => { setAdding(false); setAddCategory(''); setAddPartId(''); setAddType('ORI'); setAddQty('1'); };

  const removeItem = (id: string) => { setItems(i => i.filter(x => x.id !== id)); setGenerated(false); };
  const addItem = () => {
    if (!catalogPart) return;
    setItems(i => [...i, {
      id: 'li-' + Date.now(),
      name: catalogPart.name,
      qty: Math.max(1, parseInt(addQty) || 1),
      price: addUnitPrice,
      partType: addType,
    }]);
    resetAdd();
    setGenerated(false);
  };

  const customerMessage =
`Dear ${ACTIVE_JOB.customerName},

Your quotation for ${ACTIVE_JOB.carModel} (${PLATE_NUMBER}) is ready.

Workflow : ${WORKFLOW_CODE}
Date     : ${fmtDate(new Date())}
Total    : ${fmtMoney(grand)} (incl. 6% service tax)

Please review and approve via the secure link:
${APPROVAL_LINK}

Thank you,
Autoflow Service Centre`;

  const copyMessage = () => {
    navigator.clipboard.writeText(customerMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div className="space-y-4">

      {/* ── Step 10 ── */}
      <StepBlock number={10} name="Spare Part Confirmation" description="Customer confirms quotation via secure link" timeLimit={30} status="active">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Customer email" required>
            <Input defaultValue="ahmad@example.com" type="email" />
          </Field>
          <Field label="Quotation total">
            <Input value={fmtMoney(grand)} readOnly className="font-mono" />
          </Field>
        </div>

        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
          <div className="px-4 h-10 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-sunken)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">Email preview</p>
            <Badge tone="neutral">Draft</Badge>
          </div>
          <div className="p-4 space-y-2 text-[13px] text-[var(--color-text-secondary)]">
            <p>Dear {ACTIVE_JOB.customerName},</p>
            <p>We have completed diagnosis for your {ACTIVE_JOB.carModel} ({ACTIVE_JOB.plate}).</p>
            <p>Estimated total: <span className="font-mono font-semibold text-[var(--color-text-primary)]">{fmtMoney(grand)}</span></p>
            <p>Please review and approve via the secure link below:</p>
            <div className="bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-2.5 flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] shrink-0" />
              <code className="text-[11px] font-mono text-[var(--color-accent)] break-all">{APPROVAL_LINK}</code>
            </div>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">Link expires in 48 hours.</p>
          </div>
        </div>

        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-warning-bg)]/40 px-3 py-2.5">
          <div className="flex items-center justify-between text-[12px]">
            <div className="space-y-0.5">
              <p className="font-medium text-[var(--color-text-primary)]">Approval status</p>
              <p className="text-[var(--color-text-tertiary)]">Token <code className="font-mono">abc123xyz789secure</code> · Workflow {WORKFLOW_CODE}</p>
            </div>
            <Badge tone="warning" dot>Pending response</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" leading={<Send className="w-3.5 h-3.5" />}>Send approval email</Button>
          <Button variant="secondary" leading={<Copy className="w-3.5 h-3.5" />}>Copy link</Button>
          <Button variant="ghost" leading={<RefreshCw className="w-3.5 h-3.5" />}>Refresh status</Button>
        </div>
      </StepBlock>

      {/* ── Step 11: quotation builder ── */}
      <StepBlock number={11} name="Quotation" description="Build and generate the PDF quotation" timeLimit={10} status="active">

        {/* Line items */}
        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Description</th>
                <th className="text-center text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Qty</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Unit price</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Subtotal</th>
                <th className="px-3 h-9 w-10" />
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-3 h-11">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-text-primary)]">{it.name}</span>
                      {it.partType && <Badge tone={it.partType === 'ORI' ? 'accent' : 'neutral'}>{it.partType}</Badge>}
                    </div>
                  </td>
                  <td className="px-3 h-11 text-center tabular text-[var(--color-text-secondary)]">{it.qty}</td>
                  <td className="px-3 h-11 text-right tabular text-[var(--color-text-secondary)]">{fmtMoney(it.price)}</td>
                  <td className="px-3 h-11 text-right tabular font-medium text-[var(--color-text-primary)]">{fmtMoney(it.price * it.qty)}</td>
                  <td className="px-3 h-11 text-right">
                    <button onClick={() => removeItem(it.id)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)]" aria-label="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add part from catalog */}
          <div className="px-3 py-2.5 border-t border-[var(--color-border)]">
            {adding ? (
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Category</label>
                    <Select value={addCategory} onChange={e => { setAddCategory(e.target.value); setAddPartId(''); }} className="w-full">
                      <option value="">— Select —</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Part</label>
                    <Select value={addPartId} onChange={e => setAddPartId(e.target.value)} className="w-full" disabled={!addCategory}>
                      <option value="">— Select —</option>
                      {(PARTS_CATALOG[addCategory] ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Grade</label>
                    <div className="inline-flex items-center bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-0.5 h-8">
                      {(['ORI', 'OM'] as PartType[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setAddType(t)}
                          className={`h-7 px-3 rounded-[var(--radius-sm)] text-[12px] font-semibold transition-colors ${
                            addType === t
                              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]'
                              : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="w-16">
                    <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Qty</label>
                    <Input value={addQty} onChange={e => setAddQty(e.target.value)} type="number" />
                  </div>
                  <div className="w-28">
                    <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Unit price</label>
                    <Input value={catalogPart ? addUnitPrice.toFixed(2) : ''} readOnly placeholder="—" leading={<span className="text-[12px]">RM</span>} />
                  </div>
                  <Button variant="primary" onClick={addItem} disabled={!catalogPart}>Add part</Button>
                  <Button variant="ghost" onClick={resetAdd}>Cancel</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
                <Plus className="w-3.5 h-3.5" /> Add part
              </button>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-4 space-y-2">
          <Row label="Parts subtotal" value={fmtMoney(partsTotal)} />
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[var(--color-text-tertiary)]">Labour</span>
            <Input value={labour} onChange={e => { setLabour(e.target.value); setGenerated(false); }} type="number"
              className="w-28" leading={<span className="text-[12px] font-medium">RM</span>} />
          </div>
          <Row label="Service tax (6%)" value={fmtMoney(tax)} />
          <div className="border-t border-[var(--color-border)] pt-2 mt-1 flex items-center justify-between">
            <span className="text-[13px] font-medium text-[var(--color-text-primary)]">Grand total</span>
            <span className="text-[18px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(grand)}</span>
          </div>
        </div>

        {/* Generate */}
        <div className="flex items-center gap-2">
          <Button variant="primary" leading={<FileText className="w-3.5 h-3.5" />} onClick={() => setGenerated(true)}>
            {generated ? 'Regenerate PDF' : 'Generate Quotation PDF'}
          </Button>
          {generated && (
            <Button variant="ghost" leading={<X className="w-3.5 h-3.5" />} onClick={() => setGenerated(false)}>Clear</Button>
          )}
        </div>

        {/* Generated quotation */}
        {generated && (
          <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
            <div className="px-4 h-10 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-sunken)]">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-success)]">
                <Check className="w-3.5 h-3.5" /> Quotation generated
              </span>
              <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">{WORKFLOW_CODE}.pdf</span>
            </div>
            {/* Document preview */}
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">Autoflow Service Centre</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">Quotation · {fmtDate(new Date())}</p>
                </div>
                <div className="text-right text-[11px] text-[var(--color-text-tertiary)]">
                  <p className="font-mono text-[var(--color-text-secondary)]">{WORKFLOW_CODE}</p>
                  <p>{ACTIVE_JOB.customerName}</p>
                  <p>{ACTIVE_JOB.carModel} · {PLATE_NUMBER}</p>
                </div>
              </div>
              <div className="border-t border-[var(--color-border)] pt-3 space-y-1.5">
                {items.map(it => (
                  <div key={it.id} className="flex items-center justify-between text-[12px]">
                    <span className="text-[var(--color-text-secondary)]">{it.name} × {it.qty}</span>
                    <span className="tabular text-[var(--color-text-primary)]">{fmtMoney(it.price * it.qty)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[var(--color-text-secondary)]">Labour</span>
                  <span className="tabular text-[var(--color-text-primary)]">{fmtMoney(labourNum)}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[var(--color-text-secondary)]">Service tax (6%)</span>
                  <span className="tabular text-[var(--color-text-primary)]">{fmtMoney(tax)}</span>
                </div>
              </div>
              <div className="border-t border-[var(--color-border)] pt-2 flex items-center justify-between">
                <span className="text-[13px] font-medium text-[var(--color-text-primary)]">Total</span>
                <span className="text-[18px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(grand)}</span>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)] flex items-center gap-2">
              <Button variant="secondary" size="sm" leading={copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} onClick={copyMessage}>
                {copied ? 'Copied' : 'Copy customer message'}
              </Button>
              <Button variant="secondary" size="sm" leading={<FileText className="w-3 h-3" />}>Download PDF</Button>
            </div>
          </div>
        )}
      </StepBlock>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-[var(--color-text-tertiary)]">{label}</span>
      <span className="text-[13px] tabular text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}
