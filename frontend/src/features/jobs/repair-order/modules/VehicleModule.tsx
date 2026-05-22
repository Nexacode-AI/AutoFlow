import { Camera, Upload, Check } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field, Input } from '@/design/primitives/Input';
import { StepBlock } from '../StepBlock';

const BODY_PHOTOS = ['Front', 'Back', 'Left side', 'Right side'];

export function VehicleModule() {
  return (
    <div className="space-y-4">
      <StepBlock number={4} name="Vehicle Photos" description="Body + chassis verification photos" timeLimit={10} status="done">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] mb-2">Body photos</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BODY_PHOTOS.map(name => (
              <div key={name} className="aspect-[4/3] border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-colors group relative">
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[var(--color-success)] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </span>
                <Camera className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.5} />
                <span className="text-[11px] text-[var(--color-text-secondary)]">{name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] mb-2">Chassis verification</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="aspect-[4/3] border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-colors relative">
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[var(--color-success)] flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </span>
              <Camera className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={1.5} />
              <span className="text-[11px] text-[var(--color-text-secondary)]">Chassis number plate</span>
            </div>
            <Field label="Chassis number (verify from photo)">
              <Input defaultValue="MH1234567890" className="font-mono" />
            </Field>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button variant="primary" leading={<Upload className="w-3.5 h-3.5" />}>Upload more</Button>
          <Button variant="ghost">All photos optional</Button>
        </div>
      </StepBlock>
    </div>
  );
}
