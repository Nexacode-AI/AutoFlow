import { FileText, Send, Check, CreditCard } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field, Input } from '@/design/primitives/Input';
import { Select } from '@/design/primitives/Select';
import { Badge } from '@/design/primitives/Badge';
import { StepBlock } from '../StepBlock';
import { ACTIVE_PARTS } from '@/data/mocks';
import { fmtMoney } from '@/lib/format';

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
  const parts = ACTIVE_PARTS.reduce((s, p) => s + p.markupPrice * p.qty, 0);
  const labour = 500;
  const tax = (parts + labour) * 0.06;
  const total = parts + labour + tax;

  return (
    <div className="space-y-4">

      <StepBlock number={17} name="Car Wash" description="Final wash and detailing" timeLimit={30} status="pending">
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

      <StepBlock number={18} name="Invoice" description="Generate and send invoice to customer" timeLimit={10} status="pending">
        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-4 space-y-1.5 text-[13px]">
          <Row label="Parts" value={fmtMoney(parts)} />
          <Row label="Labour" value={fmtMoney(labour)} />
          <Row label="Service tax (6%)" value={fmtMoney(tax)} />
          <div className="border-t border-[var(--color-border)] pt-2 mt-2 flex items-center justify-between">
            <span className="text-[var(--color-text-tertiary)]">Total</span>
            <span className="text-[18px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(total)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Field label="Send to" required>
            <Input defaultValue="ahmad@example.com" type="email" />
          </Field>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" leading={<FileText className="w-3.5 h-3.5" />}>Generate PDF</Button>
          <Button variant="primary" leading={<Send className="w-3.5 h-3.5" />}>Send invoice</Button>
        </div>
      </StepBlock>

      <StepBlock number={19} name="Payment" description="Record customer payment" timeLimit={15} status="pending">
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

      <StepBlock number={20} name="Delivery" description="Vehicle handover to customer" timeLimit={20} status="pending">
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

      <StepBlock number={21} name="Customer Feedback" description="Satisfaction rating" timeLimit={5} status="pending">
        <Field label="Rating">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <button key={i} className="text-[24px] text-[var(--color-text-disabled)] hover:text-[var(--color-warning)] transition-colors leading-none">★</button>
            ))}
          </div>
        </Field>
        <Field label="Comments">
          <textarea
            rows={2}
            placeholder="Customer feedback…"
            className="w-full p-2.5 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed"
          />
        </Field>
        <Badge tone="success">Workflow ready to close</Badge>
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
