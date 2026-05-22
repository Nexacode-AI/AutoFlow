import { useState } from 'react';
import { MessageSquare, Check, Copy, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field, Input } from '@/design/primitives/Input';
import { Badge } from '@/design/primitives/Badge';
import { StepBlock } from '../StepBlock';
import { WORKFLOW_CODE, PLATE_NUMBER, ACTIVE_JOB } from '@/data/mocks';

const GROUP_NAME = `${WORKFLOW_CODE} - ${PLATE_NUMBER} Repair`;
const GROUP_LINK = 'https://chat.whatsapp.com/AbCdEf123456';

const MEMBERS = [
  { name: ACTIVE_JOB.customerName, role: 'Customer',        phone: '+60 12-345 6789' },
  { name: 'Sarah Lee',             role: 'Service Advisor', phone: '+60 17-998 1234' },
  { name: 'Mohd Rizal',            role: 'Bay Mechanic',    phone: '+60 11-110 5566' },
];

/* Template message — same intent as the UiUx WhatsApp step */
const TEMPLATE_MESSAGE =
`*WhatsApp Group Setup — AutoFlow*
━━━━━━━━━━━━━━━━━━━━━━━━

Please create a WhatsApp group:

Group name : ${GROUP_NAME}
Workflow   : ${WORKFLOW_CODE}
Vehicle    : ${ACTIVE_JOB.carModel} (${PLATE_NUMBER})

Add the following members:
${MEMBERS.map(m => `  • ${m.role} — ${m.name} (${m.phone})`).join('\n')}

This group is for repair updates, photos and customer
approvals for the above vehicle.

Thank you.
Autoflow Service Centre`;

const WA_LINK = `https://api.whatsapp.com/send/?text=${encodeURIComponent(TEMPLATE_MESSAGE)}&type=custom_url&app_absent=0`;

export function CommunicationModule() {
  const [msgCopied, setMsgCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const openWhatsApp = () => window.open(WA_LINK, '_blank', 'noopener,noreferrer');

  const copyMessage = () => {
    navigator.clipboard.writeText(TEMPLATE_MESSAGE).then(() => {
      setMsgCopied(true);
      setTimeout(() => setMsgCopied(false), 2200);
    });
  };
  const copyLink = () => {
    navigator.clipboard.writeText(GROUP_LINK).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2200);
    });
  };

  return (
    <div className="space-y-4">
      <StepBlock number={3} name="WhatsApp Group" description="Create communication channel with customer + workshop team" timeLimit={5} status="done">
        <Field label="Group name (auto-generated)">
          <Input defaultValue={GROUP_NAME} readOnly />
        </Field>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] mb-2">Members</p>
          <ul className="border border-[var(--color-border)] rounded-[var(--radius-md)] divide-y divide-[var(--color-border)]">
            {MEMBERS.map(m => (
              <li key={m.name} className="flex items-center justify-between px-3 h-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-4 h-4 rounded-[3px] bg-[var(--color-success)] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <p className="text-[13px] text-[var(--color-text-primary)] truncate">{m.name}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge tone="neutral">{m.role}</Badge>
                  <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">{m.phone}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Template message preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">Template message</p>
            <button
              onClick={copyMessage}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
            >
              {msgCopied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy message</>}
            </button>
          </div>
          <pre className="text-[12px] leading-relaxed font-mono text-[var(--color-text-secondary)] bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 whitespace-pre-wrap max-h-56 overflow-y-auto">
{TEMPLATE_MESSAGE}
          </pre>
        </div>

        <Field label="Group link (added after group is created)">
          <Input defaultValue={GROUP_LINK} readOnly className="font-mono" />
        </Field>

        <div className="flex items-center gap-2">
          <Button variant="primary" leading={<MessageSquare className="w-3.5 h-3.5" />} onClick={openWhatsApp}>
            Open in WhatsApp
          </Button>
          <Button
            variant="secondary"
            leading={linkCopied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
            onClick={copyLink}
          >
            {linkCopied ? 'Link copied' : 'Copy link'}
          </Button>
        </div>
      </StepBlock>
    </div>
  );
}
