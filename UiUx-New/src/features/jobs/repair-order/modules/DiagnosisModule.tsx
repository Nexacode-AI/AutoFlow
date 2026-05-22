import { useState } from 'react';
import { Plus, Minus, Trash2, Check, Copy, MessageSquare, FileText, X } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field } from '@/design/primitives/Input';
import { Select } from '@/design/primitives/Select';
import { StepBlock } from '../StepBlock';
import { PARTS_CATALOG, WORKFLOW_CODE, PLATE_NUMBER, CHASSIS_NUMBER } from '@/data/mocks';
import { fmtMoney } from '@/lib/format';

type SelectedPart = { id: string; name: string; price: number; qty: number };

const CATEGORIES = Object.keys(PARTS_CATALOG);

export function DiagnosisModule() {
  /* ── Step 7: spare parts selection ── */
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<Record<string, SelectedPart>>({});
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedList = Object.values(selected);
  const total = selectedList.reduce((s, p) => s + p.price * p.qty, 0);

  const togglePart = (p: { id: string; name: string; oriPrice: number }) => {
    setSelected(prev => {
      if (prev[p.id]) {
        const next = { ...prev };
        delete next[p.id];
        return next;
      }
      return { ...prev, [p.id]: { id: p.id, name: p.name, price: p.oriPrice, qty: 1 } };
    });
    setMessage('');
  };

  const updateQty = (id: string, delta: number) => {
    setSelected(prev => ({
      ...prev,
      [id]: { ...prev[id], qty: Math.max(1, prev[id].qty + delta) },
    }));
    setMessage('');
  };

  const removePart = (id: string) => {
    setSelected(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setMessage('');
  };

  const generateMessage = () => {
    if (selectedList.length === 0) return;
    const dateStr = new Date().toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' });
    const lines = selectedList
      .map((p, i) =>
`  ${String(i + 1).padStart(2, ' ')}. ${p.name}
      Part ID    : ${p.id}
      Quantity   : ${p.qty} unit${p.qty > 1 ? 's' : ''}
      Unit Price : ${fmtMoney(p.price)}
      Subtotal   : ${fmtMoney(p.price * p.qty)}`)
      .join('\n\n');

    setMessage(
`*SPARE PARTS ENQUIRY*
━━━━━━━━━━━━━━━━━━━━━━━━

Workshop      : Autoflow Service Centre
Workflow Code : ${WORKFLOW_CODE}
Vehicle Plate : ${PLATE_NUMBER}
Chassis No.   : ${CHASSIS_NUMBER}
Date          : ${dateStr}

━━━━━━━━━━━━━━━━━━━━━━━━
PARTS REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━

${lines}

━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL ESTIMATED COST : ${fmtMoney(total)}
━━━━━━━━━━━━━━━━━━━━━━━━

Kindly confirm the following:
  • Parts availability (In Stock / To Order)
  • Your best quoted price per unit
  • Expected delivery date / lead time

Please reply at your earliest convenience.

Thank you.
Autoflow Service Centre
Ref: ${WORKFLOW_CODE}`);
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const shareWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send/?text=${encodeURIComponent(message)}&type=custom_url&app_absent=0`,
      '_blank', 'noopener,noreferrer',
    );
  };

  return (
    <div className="space-y-4">
      {/* ── Step 6 ── */}
      <StepBlock number={6} name="Troubleshooting" description="Diagnose vehicle issues, document findings" timeLimit={30} status="done">
        <Field label="Issue category">
          <Select defaultValue="Brakes">
            <option>Engine</option>
            <option>Transmission</option>
            <option>Brakes</option>
            <option>Electrical</option>
            <option>AC System</option>
            <option>Suspension</option>
          </Select>
        </Field>
        <Field label="Issue description">
          <textarea
            rows={3}
            defaultValue="Brake pads worn (front), AC compressor not engaging, engine oil overdue."
            className="w-full p-2.5 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed"
          />
        </Field>
        <Field label="Recommended action">
          <textarea
            rows={2}
            defaultValue="Replace front brake pads, recharge AC gas + replace cabin filter, full engine oil service."
            className="w-full p-2.5 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed"
          />
        </Field>
      </StepBlock>

      {/* ── Step 7 — interactive parts selection ── */}
      <StepBlock number={7} name="Spare Parts Needed" description="Select required parts, then generate the supplier enquiry" timeLimit={15} status="active">

        {/* Category picker */}
        <Field label="Parts category">
          <Select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">— Select a category —</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>

        {/* Parts in category — add one by one */}
        {category && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] mb-2">
              {category} — tap to add
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PARTS_CATALOG[category].map(p => {
                const isAdded = !!selected[p.id];
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePart(p)}
                    className={`flex items-center justify-between gap-2 px-3 h-11 rounded-[var(--radius-md)] border text-left transition-colors ${
                      isAdded
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{p.name}</p>
                      <p className="text-[10px] font-mono text-[var(--color-text-tertiary)]">{p.id} · {fmtMoney(p.oriPrice)}</p>
                    </div>
                    <span className={`w-5 h-5 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 ${
                      isAdded ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-active)] text-[var(--color-text-tertiary)]'
                    }`}>
                      {isAdded ? <Check className="w-3 h-3" strokeWidth={3} /> : <Plus className="w-3 h-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected parts list */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] mb-2">
            Selected parts {selectedList.length > 0 && `(${selectedList.length})`}
          </p>
          {selectedList.length === 0 ? (
            <div className="border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] py-6 text-center">
              <p className="text-[12px] text-[var(--color-text-tertiary)]">No parts added yet. Pick a category above.</p>
            </div>
          ) : (
            <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                    <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Part</th>
                    <th className="text-center text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Qty</th>
                    <th className="text-right text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Unit price</th>
                    <th className="text-right text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9">Subtotal</th>
                    <th className="px-3 h-9 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {selectedList.map(p => (
                    <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                      <td className="px-3 h-11">
                        <p className="text-[13px] text-[var(--color-text-primary)]">{p.name}</p>
                        <p className="text-[10px] font-mono text-[var(--color-text-tertiary)]">{p.id}</p>
                      </td>
                      <td className="px-3 h-11">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => updateQty(p.id, -1)}
                            className="w-5 h-5 rounded-[var(--radius-sm)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-surface-hover)]">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center tabular text-[var(--color-text-primary)]">{p.qty}</span>
                          <button onClick={() => updateQty(p.id, 1)}
                            className="w-5 h-5 rounded-[var(--radius-sm)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-surface-hover)]">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 h-11 text-right tabular text-[var(--color-text-secondary)]">{fmtMoney(p.price)}</td>
                      <td className="px-3 h-11 text-right tabular font-medium text-[var(--color-text-primary)]">{fmtMoney(p.price * p.qty)}</td>
                      <td className="px-3 h-11 text-right">
                        <button onClick={() => removePart(p.id)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)]" aria-label="Remove">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
                    <td colSpan={3} className="px-3 h-10 text-[12px] font-medium text-[var(--color-text-secondary)]">
                      Total estimated cost
                    </td>
                    <td className="px-3 h-10 text-right text-[13px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(total)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Generate supplier message */}
        <div className="flex items-center gap-2">
          <Button variant="primary" leading={<FileText className="w-3.5 h-3.5" />} disabled={selectedList.length === 0} onClick={generateMessage}>
            Generate supplier message
          </Button>
          {message && (
            <Button variant="ghost" leading={<X className="w-3.5 h-3.5" />} onClick={() => setMessage('')}>Clear</Button>
          )}
        </div>

        {/* Generated message + share */}
        {message && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">Supplier enquiry message</p>
              <button onClick={copyMessage} className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
                {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy message</>}
              </button>
            </div>
            <pre className="text-[12px] leading-relaxed font-mono text-[var(--color-text-secondary)] bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 whitespace-pre-wrap max-h-72 overflow-y-auto">
{message}
            </pre>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="primary" leading={<MessageSquare className="w-3.5 h-3.5" />} onClick={shareWhatsApp}>
                Share via WhatsApp
              </Button>
              <Button variant="secondary" leading={<Copy className="w-3.5 h-3.5" />} onClick={copyMessage}>
                {copied ? 'Copied' : 'Copy message'}
              </Button>
            </div>
          </div>
        )}
      </StepBlock>
    </div>
  );
}
