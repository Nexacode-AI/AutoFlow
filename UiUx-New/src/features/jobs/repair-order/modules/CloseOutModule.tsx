import { useState } from 'react';
import {
  FileText, Send, Check, CreditCard, Copy, MessageSquare, Clock, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field, Input } from '@/design/primitives/Input';
import { Select } from '@/design/primitives/Select';
import { Badge } from '@/design/primitives/Badge';
import { Card } from '@/design/primitives/Card';
import { StepBlock } from '../StepBlock';
import {
  ACTIVE_PARTS, ACTIVE_JOB, WORKFLOW_CODE, PLATE_NUMBER, CHASSIS_NUMBER,
} from '@/data/mocks';
import { fmtMoney, fmtDate } from '@/lib/format';
import { cn } from '@/lib/cn';

const SERVICE_TAX = 0.08;

const WASH_CHECKS = [
  'Exterior wash completed',
  'Interior vacuum and cleaning',
  'Windows cleaned',
  'Tire shine applied',
];

const DELIVERY_CHECKS = [
  'Customer ID verified',
  'Payment confirmed',
  'Vehicle inspection with customer completed',
  'All documents handed over',
  'Customer signature obtained',
];

export function CloseOutModule() {
  /* Step 17 — Send Receipt state */
  const [laborCost, setLaborCost] = useState('150');
  const [receiptMsg, setReceiptMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const partsTotal = ACTIVE_PARTS.reduce((s, p) => s + p.markupPrice * p.qty, 0);
  const labor      = parseFloat(laborCost) || 0;
  const subtotal   = partsTotal + labor;
  const tax        = subtotal * SERVICE_TAX;
  const total      = subtotal + tax;
  const inspection = new Date();
  inspection.setMonth(inspection.getMonth() + 6);
  const receiptNo  = `RCP-${WORKFLOW_CODE.replace('WF-', '')}`;

  const generateReceipt = () => {
    const dateStr = fmtDate(new Date());
    const inspStr = fmtDate(inspection);
    const divider = '─'.repeat(45);
    const lines = ACTIVE_PARTS
      .map((p, i) => `  ${String(i + 1).padStart(2)}. ${p.name.padEnd(32)} RM ${(p.markupPrice * p.qty).toFixed(2)}`)
      .join('\n');
    setReceiptMsg(
`AUTOFLOW SERVICE CENTRE
Official Service Receipt
${'='.repeat(45)}
Workflow Ref   : ${WORKFLOW_CODE}
Receipt No.    : ${receiptNo}
Date           : ${dateStr}
${divider}
Customer       : ${ACTIVE_JOB.customerName}
Vehicle        : ${ACTIVE_JOB.carModel} (${PLATE_NUMBER})
Chassis No.    : ${CHASSIS_NUMBER}
${divider}
PARTS REPLACED:
${lines}
  ${divider}
  Parts Subtotal                       RM ${partsTotal.toFixed(2)}
  Labor Charges                        RM ${labor.toFixed(2)}
  ${divider}
  Subtotal                             RM ${subtotal.toFixed(2)}
  Service Tax (8%)                     RM ${tax.toFixed(2)}
${'='.repeat(45)}
  TOTAL AMOUNT                         RM ${total.toFixed(2)}
${'='.repeat(45)}

* Your next scheduled inspection date is: ${inspStr}

Thank you for choosing Autoflow Service Centre!
For enquiries: +60 3-1234 5678
www.autoflowservice.com`);
  };

  const copyReceipt = () => {
    navigator.clipboard.writeText(receiptMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendWhatsApp = () =>
    window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(receiptMsg)}&type=custom_url&app_absent=0`, '_blank', 'noopener,noreferrer');

  /* Step 20 — Customer Feedback Request state */
  const FEEDBACK_LINK = `${window.location.origin}/client-feedback?token=feedback-${WORKFLOW_CODE.toLowerCase()}`;
  const defaultFeedbackMsg =
`Hi ${ACTIVE_JOB.customerName},

Thank you for choosing Autoflow Service Centre for your ${ACTIVE_JOB.carModel} (${PLATE_NUMBER}) service!

We hope you're satisfied with the work. We'd love to hear your feedback — it only takes 2 minutes:

${FEEDBACK_LINK}

Your Service Advisor: Sarah Lee
Contact: +60 3-1234 5678

Thank you,
Autoflow Service Centre`;

  const [fbMsg, setFbMsg]         = useState(defaultFeedbackMsg);
  const [fbCopied, setFbCopied]   = useState(false);
  const [fbResponded, setFbResponded] = useState(false);   // toggle to simulate response

  const copyFb = () => {
    navigator.clipboard.writeText(fbMsg);
    setFbCopied(true);
    setTimeout(() => setFbCopied(false), 2000);
  };
  const sendFb = () =>
    window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(fbMsg)}&type=custom_url&app_absent=0`, '_blank', 'noopener,noreferrer');

  return (
    <div className="space-y-4">

      <StepBlock number={16} name="Car Wash" description="Final wash and detailing" timeLimit={20} status="pending">
        <ul className="space-y-2">
          {WASH_CHECKS.map(c => (
            <li key={c} className="flex items-center gap-2.5 px-3 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)]">
              <input type="checkbox" className="w-4 h-4 accent-[var(--color-accent)]" />
              <span className="text-[13px] text-[var(--color-text-primary)]">{c}</span>
            </li>
          ))}
        </ul>
        <Button variant="primary" leading={<Check className="w-3.5 h-3.5" />}>Complete car wash</Button>
      </StepBlock>

      <StepBlock number={17} name="Send Receipt" description="Review the invoice, set labor, generate and send the receipt via WhatsApp" timeLimit={5} status="active">

        {ACTIVE_PARTS.length === 0 ? (
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)]/40 px-3.5 py-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-warning)] shrink-0" />
            <p className="text-[12px] text-[var(--color-text-secondary)]">No quotation parts found. Complete earlier steps first.</p>
          </div>
        ) : (
          <>
            {/* Invoice summary card */}
            <Card padding="none" className="overflow-hidden">
              <div className="flex items-center gap-2 px-4 h-10 bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                <FileText className="w-3.5 h-3.5 text-[var(--color-accent)]" strokeWidth={1.7} />
                <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">Invoice summary</span>
              </div>

              <ul className="divide-y divide-[var(--color-border)]">
                {ACTIVE_PARTS.map(p => (
                  <li key={p.id} className="px-4 py-2.5 flex items-center justify-between text-[13px]">
                    <div>
                      <span className="font-medium text-[var(--color-text-primary)]">{p.name}</span>
                      <span className="ml-2 text-[11px] text-[var(--color-text-tertiary)] tabular">× {p.qty}</span>
                    </div>
                    <span className="tabular font-semibold text-[var(--color-text-secondary)]">{fmtMoney(p.markupPrice * p.qty)}</span>
                  </li>
                ))}
              </ul>

              {/* Labor input row */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
                <span className="text-[13px] font-medium text-[var(--color-text-primary)]">Labor charges</span>
                <div className="w-32">
                  <Input value={laborCost} onChange={e => { setLaborCost(e.target.value); setReceiptMsg(''); }}
                    type="number" leading={<span className="text-[12px] font-medium">RM</span>} />
                </div>
              </div>

              {/* Breakdown */}
              <div className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
                <Row label="Parts subtotal" value={fmtMoney(partsTotal)} />
                <Row label="Labor" value={fmtMoney(labor)} />
                <Row label="Subtotal" value={fmtMoney(subtotal)} />
                <Row label="Service tax (8%)" value={fmtMoney(tax)} />
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] font-bold text-[var(--color-text-primary)]">Total amount</span>
                  <span className="text-[16px] font-bold tabular text-[var(--color-accent)]">{fmtMoney(total)}</span>
                </div>
              </div>

              {/* Inspection date notice */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-accent-subtle)]">
                <Clock className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                <p className="text-[12px] text-[var(--color-text-secondary)]">
                  Next scheduled inspection: <span className="font-semibold text-[var(--color-text-primary)]">{fmtDate(inspection)}</span> (6 months from today)
                </p>
              </div>
            </Card>

            {/* Generate */}
            {!receiptMsg && (
              <Button variant="primary" leading={<FileText className="w-3.5 h-3.5" />} onClick={generateReceipt}>
                Generate receipt message
              </Button>
            )}

            {/* Editable receipt */}
            {receiptMsg && (
              <Card padding="none" className="overflow-hidden">
                <div className="flex items-center justify-between px-4 h-10 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[var(--color-accent)]" strokeWidth={1.7} />
                    <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">Receipt message</span>
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">· editable before sending</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="secondary" size="sm"
                      leading={copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      onClick={copyReceipt}>
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button variant="primary" size="sm"
                      leading={<MessageSquare className="w-3 h-3" />}
                      onClick={sendWhatsApp}>
                      Send via WhatsApp
                    </Button>
                  </div>
                </div>
                <textarea
                  value={receiptMsg}
                  onChange={e => setReceiptMsg(e.target.value)}
                  rows={22}
                  spellCheck={false}
                  className="w-full p-4 font-mono text-[12px] leading-relaxed text-[var(--color-text-secondary)] bg-[var(--color-surface)] border-0 focus:outline-none resize-y"
                />
              </Card>
            )}

            {receiptMsg && (
              <Button variant="primary" leading={<Send className="w-3.5 h-3.5" />}>
                Mark as sent &amp; complete
              </Button>
            )}
          </>
        )}
      </StepBlock>

      <StepBlock number={18} name="Receive Payment" description="Record customer payment" timeLimit={10} status="pending">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Payment method" required>
            <Select defaultValue="card">
              <option value="cash">Cash</option>
              <option value="card">Credit / Debit card</option>
              <option value="online">Online banking</option>
              <option value="qr">QR Payment (DuitNow)</option>
            </Select>
          </Field>
          <Field label="Amount paid (RM)" required>
            <Input defaultValue={total.toFixed(2)} type="number" className="font-mono" />
          </Field>
          <Field label="Payment date" required>
            <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </Field>
          <Field label="Transaction reference">
            <Input placeholder="TXN-123456" />
          </Field>
        </div>
        <Button variant="primary" leading={<CreditCard className="w-3.5 h-3.5" />}>Confirm payment received</Button>
      </StepBlock>

      <StepBlock number={19} name="Car Delivery" description="Vehicle handover to customer" timeLimit={20} status="pending">
        <ul className="space-y-2">
          {DELIVERY_CHECKS.map(c => (
            <li key={c} className="flex items-center gap-2.5 px-3 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)]">
              <input type="checkbox" className="w-4 h-4 accent-[var(--color-accent)]" />
              <span className="text-[13px] text-[var(--color-text-primary)]">{c}</span>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Delivered by" required>
            <Input placeholder="Staff name" />
          </Field>
          <Field label="Delivery date & time" required>
            <Input type="datetime-local" />
          </Field>
        </div>
        <Button variant="primary" leading={<Check className="w-3.5 h-3.5" />}>Complete delivery</Button>
      </StepBlock>

      <StepBlock number={20} name="Customer Feedback" description="Send feedback link via WhatsApp and track the customer's response" timeLimit={5} status="active">

        {/* Feedback link */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center gap-2 px-4 h-10 bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--color-accent)]" strokeWidth={1.7} />
            <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">Customer feedback request</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">· editable before sending</span>
            <div className="ml-auto flex items-center gap-1.5">
              <Button variant="secondary" size="sm"
                leading={fbCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                onClick={copyFb}>
                {fbCopied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="primary" size="sm"
                leading={<MessageSquare className="w-3 h-3" />}
                onClick={sendFb}>
                Send via WhatsApp
              </Button>
            </div>
          </div>
          <textarea
            value={fbMsg}
            onChange={e => setFbMsg(e.target.value)}
            rows={11}
            spellCheck={false}
            className="w-full p-4 font-mono text-[12px] leading-relaxed text-[var(--color-text-secondary)] bg-[var(--color-surface)] border-0 focus:outline-none resize-y"
          />
        </Card>

        {/* Response status */}
        <Card padding="md" className={cn(fbResponded ? 'border-[var(--color-success)]/40' : '')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn('w-7 h-7 rounded-full flex items-center justify-center',
                fbResponded ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-surface-sunken)] text-[var(--color-text-tertiary)]')}>
                {fbResponded ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : <Clock className="w-3.5 h-3.5" />}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                  {fbResponded ? 'Feedback received' : 'Awaiting customer response'}
                </p>
                <p className="text-[11px] text-[var(--color-text-tertiary)]">
                  {fbResponded ? 'Customer submitted feedback via the secure link' : 'Link sent — customer will respond at their convenience'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setFbResponded(r => !r)}>
              {fbResponded ? 'Reset' : 'Refresh status'}
            </Button>
          </div>

          {fbResponded && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-2.5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] mb-1">Rating</p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className={cn('text-[18px] leading-none', i <= 5 ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-disabled)]')}>★</span>
                  ))}
                  <span className="ml-2 text-[12px] tabular text-[var(--color-text-secondary)]">5 / 5</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] mb-1">Comments</p>
                <p className="text-[13px] text-[var(--color-text-secondary)] italic">
                  "Excellent service. Brake feels new, car was returned clean. Will be back for next service."
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Close workflow */}
        <div className="flex items-center justify-between gap-3">
          <Badge tone="success">Workflow ready to close</Badge>
          <Button variant="primary" leading={<Check className="w-3.5 h-3.5" />}>
            Close workflow
          </Button>
        </div>
      </StepBlock>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-text-tertiary)]">{label}</span>
      <span className="tabular text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}
