import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Field, Input } from '@/design/primitives/Input';
import * as authApi from '@/lib/auth/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-text-primary)] flex items-center justify-center">
            <Car className="w-4 h-4 text-[var(--color-bg)]" strokeWidth={1.8} />
          </div>
          <span className="text-[14px] font-semibold tracking-tight">AutoFlow</span>
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] p-8 shadow-sm">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h1 className="text-[20px] font-semibold">Check your email</h1>
              <p className="text-[14px] text-[var(--color-text-secondary)]">
                If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
              </p>
              <Link to="/login">
                <Button variant="ghost" size="md" className="w-full mt-4" leading={<ArrowLeft className="w-3.5 h-3.5" />}>
                  Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-[20px] font-semibold">Forgot password?</h1>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-[13px] text-red-800">{error}</p>
                  </div>
                )}

                <Field label="Email" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </Field>

                <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </Button>

                <Link to="/login">
                  <Button variant="ghost" size="md" className="w-full" leading={<ArrowLeft className="w-3.5 h-3.5" />}>
                    Back to login
                  </Button>
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
