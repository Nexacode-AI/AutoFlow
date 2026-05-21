import { Send, Copy, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field, Input } from '@/design/primitives/Input';
import { Badge } from '@/design/primitives/Badge';
import { StepBlock } from '../StepBlock';
import { ACTIVE_JOB, WORKFLOW_CODE, ACTIVE_PARTS } from '@/data/mocks';
import { fmtMoney } from '@/lib/format';

const APPROVAL_LINK = 'https://autoflow.app/client-approval?token=abc123xyz789secure';

export function AuthorizationModule() {
  const total = ACTIVE_PARTS.reduce((s, p) => s + p.markupPrice * p.qty, 0);

  return (
    <div className="space-y-4">
      <StepBlock number={10} name="Customer Approval" description="Send approval link to customer" timeLimit={30} status="active">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Customer email" required>
            <Input defaultValue="ahmad@example.com" type="email" />
          </Field>
          <Field label="Quotation total">
            <Input defaultValue={fmtMoney(total)} readOnly className="font-mono" />
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
            <p>Estimated total: <span className="font-mono font-semibold text-[var(--color-text-primary)]">{fmtMoney(total)}</span></p>
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
    </div>
  );
}
