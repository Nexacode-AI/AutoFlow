import { Check, ClipboardCheck } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field, Input } from '@/design/primitives/Input';
import { StepBlock } from '../StepBlock';
import { ACTIVE_JOB, WORKFLOW_CODE, PLATE_NUMBER } from '@/data/mocks';

const CHECKLIST = [
  'Exterior condition checked',
  'Interior condition checked',
  'Existing damages documented',
  'Customer approval received',
];

export function CheckInModule() {
  return (
    <div className="space-y-4">
      <StepBlock number={1} name="Create Workflow" description="Plate number entry, generate workflow code" timeLimit={5} status="done">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Plate number" required>
            <Input defaultValue={PLATE_NUMBER} />
          </Field>
          <Field label="Workflow code (auto-generated)">
            <Input defaultValue={WORKFLOW_CODE} disabled className="font-mono" />
          </Field>
        </div>
      </StepBlock>

      <StepBlock number={2} name="Inspection Sheet" description="Receive complaints, get approval" timeLimit={15} status="done">
        <ul className="space-y-2">
          {CHECKLIST.map(item => (
            <li key={item} className="flex items-center gap-2.5 px-3 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)]">
              <span className="w-4 h-4 rounded-[3px] bg-[var(--color-success)] flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </span>
              <span className="text-[13px] text-[var(--color-text-primary)]">{item}</span>
            </li>
          ))}
        </ul>
        <Field label="Inspector notes">
          <textarea
            rows={3}
            defaultValue="Customer reported: brake squeaking on cold starts. AC blowing warm air. Mileage 45,230 km."
            className="w-full p-2.5 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed"
          />
        </Field>
      </StepBlock>

      <StepBlock number={5} name="Customer Details" description="Confirm customer information" timeLimit={10} status="active">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Customer name" required>
            <Input defaultValue={ACTIVE_JOB.customerName} />
          </Field>
          <Field label="Contact number" required>
            <Input defaultValue="+60 12-345 6789" type="tel" />
          </Field>
          <Field label="Email">
            <Input defaultValue="ahmad@example.com" type="email" />
          </Field>
          <Field label="Car model" required>
            <Input defaultValue={ACTIVE_JOB.carModel} />
          </Field>
          <Field label="Mileage (km)">
            <Input defaultValue="45230" type="number" />
          </Field>
          <Field label="Chassis number">
            <Input defaultValue="MH1234567890" className="font-mono" />
          </Field>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" leading={<ClipboardCheck className="w-3.5 h-3.5" />}>Save customer details</Button>
          <Button variant="ghost">Mark complete</Button>
        </div>
      </StepBlock>
    </div>
  );
}
