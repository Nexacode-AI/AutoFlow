import { useNavigate } from 'react-router-dom';
import { Car, ArrowRight, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field, Input } from '@/design/primitives/Input';

export function Login() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Left: form */}
      <div className="flex-1 flex flex-col px-8 py-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-text-primary)] flex items-center justify-center">
            <Car className="w-4 h-4 text-[var(--color-bg)]" strokeWidth={1.8} />
          </div>
          <span className="text-[14px] font-semibold tracking-tight">AutoFlow</span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[360px] space-y-6">
            <div>
              <h1 className="text-[24px] font-semibold leading-8">Sign in</h1>
              <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                Welcome back. Sign in to continue to your workshop.
              </p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); nav('/'); }}
              className="space-y-3"
            >
              <Field label="Email" required>
                <Input type="email" defaultValue="sarah@premiumauto.com.my" />
              </Field>
              <Field label="Password" required>
                <Input type="password" defaultValue="••••••••••" />
              </Field>
              <div className="flex items-center justify-between text-[12px]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-[var(--color-accent)]" />
                  <span className="text-[var(--color-text-secondary)]">Remember me</span>
                </label>
                <a href="#" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium">Forgot password?</a>
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full" trailing={<ArrowRight className="w-3.5 h-3.5" />}>
                Sign in
              </Button>
            </form>

            <p className="text-[11px] text-[var(--color-text-tertiary)] text-center">
              By signing in you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-[var(--color-text-tertiary)]">© 2026 AutoFlow · Premium Auto Workshop</p>
      </div>

      {/* Right: brand panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-10 bg-[var(--color-surface-sunken)] border-l border-[var(--color-border)]">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] font-semibold">
          <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
          The workshop operating system
        </div>

        <div className="max-w-md space-y-6">
          <h2 className="text-[28px] font-semibold leading-tight tracking-tight">
            Move every car through your shop without losing track of anything.
          </h2>
          <ul className="space-y-3 text-[14px] text-[var(--color-text-secondary)]">
            {[
              { icon: Shield, text: 'Customer approvals via secure link — no more lost phone calls.' },
              { icon: Zap,    text: '60-second job creation. From plate scan to bay assignment.' },
              { icon: CheckCircle2, text: '19-step workflow, fully audit-trailed for warranty disputes.' },
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <f.icon className="w-4 h-4 mt-0.5 text-[var(--color-accent)] shrink-0" strokeWidth={1.7} />
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-[11px] font-mono text-[var(--color-text-tertiary)]">v0.1 · build {Date.now().toString(36).slice(-6)}</div>
      </div>
    </div>
  );
}
