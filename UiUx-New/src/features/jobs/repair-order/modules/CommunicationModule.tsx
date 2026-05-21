import { MessageSquare, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field, Input } from '@/design/primitives/Input';
import { Badge } from '@/design/primitives/Badge';
import { StepBlock } from '../StepBlock';
import { WORKFLOW_CODE, PLATE_NUMBER, ACTIVE_JOB } from '@/data/mocks';

const GROUP_NAME = `${WORKFLOW_CODE} - ${PLATE_NUMBER} Repair`;

export function CommunicationModule() {
  return (
    <div className="space-y-4">
      <StepBlock number={3} name="WhatsApp Group" description="Create communication channel with customer + workshop team" timeLimit={5} status="done">
        <Field label="Group name (auto-generated)">
          <Input defaultValue={GROUP_NAME} readOnly />
        </Field>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] mb-2">Members</p>
          <ul className="border border-[var(--color-border)] rounded-[var(--radius-md)] divide-y divide-[var(--color-border)]">
            {[
              { name: ACTIVE_JOB.customerName, role: 'Customer',         phone: '+60 12-345 6789' },
              { name: 'Sarah Lee',            role: 'Service Advisor',  phone: '+60 17-998 1234' },
              { name: 'Mohd Rizal',           role: 'Bay Mechanic',     phone: '+60 11-110 5566' },
            ].map(m => (
              <li key={m.name} className="flex items-center justify-between px-3 h-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-4 h-4 rounded-[3px] bg-[var(--color-success)] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] text-[var(--color-text-primary)] truncate">{m.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge tone="neutral">{m.role}</Badge>
                  <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">{m.phone}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Field label="Group link (added after group is created)">
          <Input defaultValue="https://chat.whatsapp.com/AbCdEf123456" readOnly className="font-mono" />
        </Field>

        <div className="flex items-center gap-2">
          <Button variant="primary" leading={<MessageSquare className="w-3.5 h-3.5" />}>Open in WhatsApp</Button>
          <Button variant="secondary" leading={<ExternalLink className="w-3.5 h-3.5" />}>Copy link</Button>
        </div>
      </StepBlock>
    </div>
  );
}
