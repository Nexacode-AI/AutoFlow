import { useState } from 'react';
import { Car, Check, X, Shield } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Card, CardLabel } from '@/design/primitives/Card';
import { Badge } from '@/design/primitives/Badge';
import { PlateBadge } from '@/design/primitives/PlateBadge';
import { ACTIVE_JOB, ACTIVE_PARTS, WORKFLOW_CODE } from '@/data/mocks';
import { fmtMoney } from '@/lib/format';

type Choice = 'ORI' | 'OM';

const VARIANTS: Record<string, { ORI: number; OM: number }> = {
  'BP-F-001':  { ORI: 180, OM: 140 },
  'EO-5W30-4L':{ ORI: 95,  OM: 75  },
  'AF-002':    { ORI: 55,  OM: 35  },
  'ACG-002':   { ORI: 120, OM: 95  },
  'OF-001':    { ORI: 35,  OM: 22  },
};

export function CustomerApproval() {
  const [choices, setChoices] = useState<Record<string, Choice>>(
    Object.fromEntries(ACTIVE_PARTS.map(p => [p.id, 'ORI'])),
  );
  const [submitted, setSubmitted] = useState(false);

  const total = ACTIVE_PARTS.reduce((s, p) => s + (VARIANTS[p.id]?.[choices[p.id]] ?? 0) * p.qty, 0);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-[720px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-text-primary)] flex items-center justify-center">
              <Car className="w-4 h-4 text-[var(--color-bg)]" strokeWidth={1.8} />
            </div>
            <span className="text-[14px] font-semibold tracking-tight">AutoFlow</span>
          </div>
          <Badge tone="accent" dot>Secure approval</Badge>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-6 py-8 space-y-5">
        {submitted ? (
          <Card padding="lg" className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-success-bg)] flex items-center justify-center">
              <Check className="w-5 h-5 text-[var(--color-success)]" strokeWidth={2.5} />
            </div>
            <h1 className="text-[22px] font-semibold mt-4">Thank you, {ACTIVE_JOB.customerName.split(' ')[0]}</h1>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-2">
              Your approval has been received. Our workshop will begin work shortly and notify you of any updates.
            </p>
          </Card>
        ) : (
          <>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">Parts Approval</p>
              <h1 className="text-[22px] font-semibold mt-1">Please review your repair quotation</h1>
              <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                Choose Original (ORI) or Original Manufacturer (OM) parts for each item below.
              </p>
            </div>

            {/* Job summary */}
            <Card padding="md">
              <div className="flex items-center gap-3">
                <PlateBadge plate={ACTIVE_JOB.plate} size="lg" />
                <div>
                  <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{ACTIVE_JOB.customerName}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">
                    {ACTIVE_JOB.carModel} · <span className="font-mono">{WORKFLOW_CODE}</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Parts list */}
            <Card padding="none" className="overflow-hidden">
              <div className="px-4 h-11 border-b border-[var(--color-border)] flex items-center">
                <CardLabel>Parts &amp; pricing</CardLabel>
              </div>
              <ul className="divide-y divide-[var(--color-border)]">
                {ACTIVE_PARTS.map(p => {
                  const v = VARIANTS[p.id];
                  if (!v) return null;
                  const choice = choices[p.id];
                  return (
                    <li key={p.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{p.name}</p>
                          <p className="text-[11px] text-[var(--color-text-tertiary)] tabular">Quantity: {p.qty}</p>
                        </div>
                        <span className="text-[14px] font-semibold tabular text-[var(--color-text-primary)]">
                          {fmtMoney((v[choice] ?? 0) * p.qty)}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {(['ORI', 'OM'] as const).map(opt => (
                          <button
                            key={opt}
                            onClick={() => setChoices(c => ({ ...c, [p.id]: opt }))}
                            className={`text-left px-3 py-2 rounded-[var(--radius-md)] border transition-colors ${
                              choice === opt
                                ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                                : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.04em]">
                                {opt === 'ORI' ? 'Original' : 'Original Manufacturer'}
                              </span>
                              {choice === opt && <Check className="w-3.5 h-3.5 text-[var(--color-accent)]" strokeWidth={2.5} />}
                            </div>
                            <p className="text-[14px] font-semibold tabular mt-0.5">{fmtMoney(v[opt])}</p>
                          </button>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="px-4 h-12 border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)] flex items-center justify-between">
                <span className="text-[12px] text-[var(--color-text-tertiary)] uppercase tracking-[0.04em]">Total</span>
                <span className="text-[18px] font-semibold tabular text-[var(--color-text-primary)]">{fmtMoney(total)}</span>
              </div>
            </Card>

            {/* Trust */}
            <div className="flex items-start gap-2 text-[12px] text-[var(--color-text-tertiary)]">
              <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p>
                This is a secure approval link generated for you. It expires in 48 hours.
                Need help? Call us at <span className="text-[var(--color-text-primary)] font-medium">+60 3-1234 5678</span>.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="danger" leading={<X className="w-3.5 h-3.5" />}>Decline</Button>
              <Button variant="primary" size="lg" leading={<Check className="w-3.5 h-3.5" />} onClick={() => setSubmitted(true)}>
                Approve {fmtMoney(total)}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
