import { useState } from 'react';
import { Settings as Cog, Workflow, AlertCircle, Users } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { PageHeader } from '@/design/primitives/PageHeader';
import { Card, CardLabel } from '@/design/primitives/Card';
import { Field, Input } from '@/design/primitives/Input';
import { Tabs } from '@/design/primitives/Tabs';
import { useAuthStore } from '@/lib/auth/useAuthStore';
import { UserManagement } from './UserManagement';

export function SettingsPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';

  // Build tabs based on user role
  const TABS = [
    { value: 'workshop', label: 'Workshop' },
    { value: 'workflow', label: 'Workflow' },
    ...(isSuperAdmin ? [{ value: 'users', label: 'Users' }] : []),
    { value: 'danger', label: 'Danger zone' },
  ] as const;
  type Tab = (typeof TABS)[number]['value'];

  const [tab, setTab] = useState<Tab>('workshop');

  return (
    <div className="px-8 py-6 max-w-[920px] mx-auto space-y-5">
      <PageHeader title="Settings" subtitle="System configuration and workshop preferences." />
      <Tabs value={tab} onChange={setTab} tabs={TABS} />

      {tab === 'workshop' && (
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Cog className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
            <CardLabel>Workshop information</CardLabel>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Workshop name">
              <Input defaultValue="Premium Auto Workshop Sdn Bhd" />
            </Field>
            <Field label="Registration number">
              <Input defaultValue="SSM-1234567-X" className="font-mono" />
            </Field>
            <Field label="Contact number">
              <Input defaultValue="+60 3-1234 5678" type="tel" />
            </Field>
            <Field label="Email">
              <Input defaultValue="info@premiumauto.com.my" type="email" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Address">
                <textarea
                  rows={2}
                  defaultValue="No. 123, Jalan Industri 4/5, Taman Perindustrian, 47100 Puchong, Selangor"
                  className="w-full p-2.5 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed"
                />
              </Field>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button variant="primary">Save changes</Button>
          </div>
        </Card>
      )}

      {tab === 'workflow' && (
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Workflow className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
            <CardLabel>Workflow configuration</CardLabel>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Default profit margin (%)" hint="Minimum margin for parts markup.">
              <Input defaultValue="60" type="number" />
            </Field>
            <Field label="Service tax (%)" hint="Government service tax rate.">
              <Input defaultValue="6" type="number" />
            </Field>
            <Field label="Auto-archive after (days)" hint="Completed workflows auto-archive period.">
              <Input defaultValue="90" type="number" />
            </Field>
            <Field label="Workflow code prefix" hint="Prefix for workflow unique codes.">
              <Input defaultValue="WF" className="font-mono" />
            </Field>
          </div>
          <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button variant="primary">Save configuration</Button>
          </div>
        </Card>
      )}

      {tab === 'users' && isSuperAdmin && (
        <UserManagement />
      )}

      {tab === 'danger' && (
        <Card padding="lg" className="border-[var(--color-danger-bg)]">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-3.5 h-3.5 text-[var(--color-danger)]" />
            <CardLabel><span className="text-[var(--color-danger)]">Danger zone</span></CardLabel>
          </div>
          <div className="space-y-2">
            {[
              { title: 'Clear all notifications',       desc: 'Remove all system notifications.',  action: 'Clear'  },
              { title: 'Reset all settings',            desc: 'Restore defaults.',                  action: 'Reset'  },
              { title: 'Delete all archived workflows', desc: 'Permanently delete archived data.', action: 'Delete' },
            ].map(d => (
              <div key={d.title} className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--color-danger-bg)]/30 border border-[var(--color-danger-bg)]">
                <div>
                  <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{d.title}</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">{d.desc}</p>
                </div>
                <Button variant="danger" size="sm">{d.action}</Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
