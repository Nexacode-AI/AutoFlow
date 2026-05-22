import { useState } from 'react';
import { Car, Check, Send } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Card } from '@/design/primitives/Card';
import { Badge } from '@/design/primitives/Badge';
import { PlateBadge } from '@/design/primitives/PlateBadge';
import { Field } from '@/design/primitives/Input';
import { ACTIVE_JOB, WORKFLOW_CODE } from '@/data/mocks';

export function CustomerFeedback() {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-[640px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-text-primary)] flex items-center justify-center">
              <Car className="w-4 h-4 text-[var(--color-bg)]" strokeWidth={1.8} />
            </div>
            <span className="text-[14px] font-semibold tracking-tight">AutoFlow</span>
          </div>
          <Badge tone="accent">Customer feedback</Badge>
        </div>
      </header>

      <main className="max-w-[640px] mx-auto px-6 py-10 space-y-5">
        {submitted ? (
          <Card padding="lg" className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-success-bg)] flex items-center justify-center">
              <Check className="w-5 h-5 text-[var(--color-success)]" strokeWidth={2.5} />
            </div>
            <h1 className="text-[22px] font-semibold mt-4">Thank you for your feedback</h1>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-2">
              Your rating helps us improve the workshop experience for every customer.
            </p>
          </Card>
        ) : (
          <>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">Rate your service</p>
              <h1 className="text-[24px] font-semibold mt-1">How was your experience?</h1>
              <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                Hi {ACTIVE_JOB.customerName.split(' ')[0]}, thanks for choosing us. We'd love your honest feedback.
              </p>
            </div>

            <Card padding="md">
              <div className="flex items-center gap-3">
                <PlateBadge plate={ACTIVE_JOB.plate} size="md" />
                <div>
                  <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{ACTIVE_JOB.carModel}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] font-mono">{WORKFLOW_CODE}</p>
                </div>
              </div>
            </Card>

            <Card padding="lg" className="space-y-5">
              <Field label="Overall rating">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      onClick={() => setRating(i)}
                      className={`text-[36px] leading-none transition-colors ${
                        i <= rating ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-disabled)] hover:text-[var(--color-warning)]/60'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-3 text-[12px] text-[var(--color-text-tertiary)] tabular">
                      {rating} / 5
                    </span>
                  )}
                </div>
              </Field>

              <Field label="What went well?">
                <textarea
                  rows={3}
                  placeholder="Tell us what you liked…"
                  className="w-full p-3 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed"
                />
              </Field>

              <Field label="Anything we could improve?">
                <textarea
                  rows={3}
                  placeholder="Optional…"
                  className="w-full p-3 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed"
                />
              </Field>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-[var(--color-text-tertiary)]">
                  Submitted feedback is private to the workshop.
                </p>
                <Button variant="primary" size="lg" leading={<Send className="w-3.5 h-3.5" />} onClick={() => setSubmitted(true)} disabled={rating === 0}>
                  Submit feedback
                </Button>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
