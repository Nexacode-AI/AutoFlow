import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  PowerOff,
  Search,
  Truck,
  Zap,
} from 'lucide-react';
import { Badge } from '@/design/primitives/Badge';
import { Button } from '@/design/primitives/Button';
import { Dialog } from '@/design/primitives/Dialog';
import { Field, Input } from '@/design/primitives/Input';
import { PageHeader } from '@/design/primitives/PageHeader';
import { Card } from '@/design/primitives/Card';
import { cn } from '@/lib/cn';
import { ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/auth/useAuthStore';
import { suppliersApi, type Supplier } from '@/services/suppliers';


// ── Helpers ────────────────────────────────────────────────────────────────

function formatPhone(phone: string | null): string | null {
  if (!phone) return null;
  // Pretty-print Malaysian numbers: 60XXXXXXXXX → +60 XX-XXXX XXXX
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('60') && digits.length >= 10) {
    const local = digits.slice(2);
    if (local.length === 9)  return `+60 ${local.slice(0,2)}-${local.slice(2,6)} ${local.slice(6)}`;
    if (local.length === 10) return `+60 ${local.slice(0,3)}-${local.slice(3,7)} ${local.slice(7)}`;
  }
  return phone;
}


// ── Sub-components ─────────────────────────────────────────────────────────

function WaButton({ link }: { link: string }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      title="Open WhatsApp"
      className="inline-flex items-center gap-1 px-2 h-6 rounded-[var(--radius-sm)] bg-[#25D36615] text-[#128C7E] hover:bg-[#25D36625] transition-colors text-[11px] font-medium"
    >
      <MessageCircle className="w-3 h-3" />
      WhatsApp
    </a>
  );
}

function EmptyState({ hasSearch, isAdmin, onAdd }: { hasSearch: boolean; isAdmin: boolean; onAdd: () => void }) {
  return (
    <div className="py-16 text-center">
      <Truck className="w-6 h-6 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-50" strokeWidth={1.4} />
      <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
        {hasSearch ? 'No suppliers match your search' : 'No suppliers yet'}
      </p>
      <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
        {hasSearch ? 'Try a different search term.' : 'Add your first parts supplier to get started.'}
      </p>
      {isAdmin && !hasSearch && (
        <Button variant="secondary" size="sm" className="mt-3" leading={<Plus className="w-3 h-3" />} onClick={onAdd}>
          Add supplier
        </Button>
      )}
    </div>
  );
}


// ── Main Page ──────────────────────────────────────────────────────────────

export function Suppliers() {
  const user        = useAuthStore((s) => s.user);
  const isAdmin     = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const [suppliers, setSuppliers]       = useState<Supplier[]>([]);
  const [search, setSearch]             = useState('');
  const [debouncedSearch, setDebSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const [modal, setModal]               = useState<'create' | Supplier | null>(null);
  const [deactivateTarget, setDeact]    = useState<Supplier | null>(null);

  // debounce search 300 ms
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebSearch(search), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await suppliersApi.list({
        search: debouncedSearch.trim() || undefined,
        include_inactive: showInactive || undefined,
      });
      setSuppliers(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load suppliers.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, showInactive]);

  useEffect(() => { void load(); }, [load]);

  const activeCount = suppliers.filter((s) => s.is_active).length;

  return (
    <div className="px-8 py-6 max-w-[1200px] mx-auto space-y-5">
      <PageHeader
        title="Suppliers"
        subtitle={`${activeCount} active supplier${activeCount !== 1 ? 's' : ''} · parts procurement contacts`}
        actions={isAdmin ? (
          <Button variant="primary" leading={<Plus className="w-3.5 h-3.5" />} onClick={() => setModal('create')}>
            Add supplier
          </Button>
        ) : null}
      />

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger)] rounded-[var(--radius-md)] text-[13px] text-[var(--color-danger)]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button className="ml-auto text-[11px] underline hover:no-underline" onClick={load}>Retry</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers…"
          leading={<Search className="w-3.5 h-3.5" />}
          className="max-w-xs"
        />
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-text-tertiary)]" />}
        {isSuperAdmin && (
          <label className="ml-auto flex items-center gap-2 cursor-pointer select-none">
            <div
              role="checkbox"
              aria-checked={showInactive}
              onClick={() => setShowInactive((v) => !v)}
              className={cn(
                'relative w-8 h-4.5 rounded-full transition-colors cursor-pointer',
                showInactive ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border-strong,#b8b4ab)]',
              )}
              style={{ height: '18px' }}
            >
              <span className={cn(
                'absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform',
                showInactive ? 'translate-x-[18px]' : 'translate-x-[2px]',
              )} />
            </div>
            <span className="text-[12px] text-[var(--color-text-secondary)]">Show inactive</span>
          </label>
        )}
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        {loading && suppliers.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--color-accent)]" />
          </div>
        ) : suppliers.length === 0 ? (
          <EmptyState
            hasSearch={!!debouncedSearch}
            isAdmin={isAdmin}
            onAdd={() => setModal('create')}
          />
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                <Th>Name</Th>
                <Th>Contact</Th>
                <Th>Email</Th>
                <Th>Notes</Th>
                <Th>Status</Th>
                {isAdmin && <th className="px-4 h-9 w-28" />}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr
                  key={s.id}
                  className={cn(
                    'border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)] transition-colors',
                    !s.is_active && 'opacity-50',
                  )}
                >
                  {/* Name */}
                  <td className="px-4 h-12">
                    <span className="font-medium text-[var(--color-text-primary)]">{s.name}</span>
                  </td>

                  {/* Contact */}
                  <td className="px-4 h-12">
                    <div className="flex flex-col gap-0.5">
                      {s.phone && (
                        <span className="flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)]">
                          <Phone className="w-3 h-3 shrink-0" />
                          {formatPhone(s.phone)}
                        </span>
                      )}
                      {s.wa_link && <WaButton link={s.wa_link} />}
                      {!s.phone && !s.wa_link && (
                        <span className="text-[11px] text-[var(--color-text-tertiary)]">—</span>
                      )}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 h-12 text-[12px] text-[var(--color-text-secondary)]">
                    {s.email ? (
                      <a href={`mailto:${s.email}`} className="hover:underline hover:text-[var(--color-accent)]">
                        {s.email}
                      </a>
                    ) : (
                      <span className="text-[var(--color-text-tertiary)]">—</span>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="px-4 h-12 max-w-[260px]">
                    {s.notes ? (
                      <span className="text-[12px] text-[var(--color-text-secondary)] line-clamp-2 leading-snug">
                        {s.notes}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 h-12">
                    <Badge tone={s.is_active ? 'success' : 'neutral'}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>

                  {/* Actions */}
                  {isAdmin && (
                    <td className="px-4 h-12">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setModal(s)}
                          title="Edit"
                          className="w-7 h-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {s.is_active ? (
                          <button
                            onClick={() => setDeact(s)}
                            title="Deactivate"
                            className="w-7 h-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
                          >
                            <PowerOff className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                await suppliersApi.update(s.id, { is_active: true });
                                await load();
                              } catch (e) {
                                setError(e instanceof ApiError ? e.message : 'Failed to reactivate.');
                              }
                            }}
                            title="Reactivate"
                            className="w-7 h-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-success,#2d8654)] hover:bg-[var(--color-success-bg,#e6f4ec)] transition-colors"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Modals */}
      {modal !== null && (
        <SupplierModal
          mode={modal === 'create' ? 'create' : 'edit'}
          existing={modal !== 'create' ? (modal as Supplier) : undefined}
          onClose={() => setModal(null)}
          onSaved={async () => { setModal(null); await load(); }}
        />
      )}

      {deactivateTarget !== null && (
        <DeactivateDialog
          supplier={deactivateTarget}
          onClose={() => setDeact(null)}
          onDeactivated={async () => { setDeact(null); await load(); }}
        />
      )}
    </div>
  );
}


// ── Table header cell ──────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9">
      {children}
    </th>
  );
}


// ── Supplier Modal (Create / Edit) ─────────────────────────────────────────

interface SupplierModalProps {
  mode: 'create' | 'edit';
  existing?: Supplier;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

function SupplierModal({ mode, existing, onClose, onSaved }: SupplierModalProps) {
  const [name, setName]   = useState(existing?.name ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [wa, setWa]       = useState(existing?.whatsapp_number ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) { setError('Supplier name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || null,
        whatsapp_number: wa.trim() || null,
        email: email.trim() || null,
        notes: notes.trim() || null,
      };
      if (mode === 'create') {
        await suppliersApi.create(payload);
      } else {
        await suppliersApi.update(existing!.id, payload);
      }
      await onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={mode === 'create' ? 'Add supplier' : 'Edit supplier'}
      description="Suppliers are used when requesting part prices and placing orders."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : mode === 'create' ? 'Create supplier' : 'Save changes'}
          </Button>
        </>
      }
    >
      <Field label="Supplier name" required error={error && !name.trim() ? error : undefined}>
        <Input
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder="e.g. Suan Huat Auto Parts"
          invalid={!!error && !name.trim()}
          onKeyDown={(e) => e.key === 'Enter' && void submit()}
        />
      </Field>

      <Field label="Phone number" hint="Optional — for voice calls.">
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="012-345 6789"
        />
      </Field>

      <Field
        label="WhatsApp number"
        hint="Include country code, digits only (e.g. 60123456789). Used to generate a direct wa.me link."
      >
        <Input
          value={wa}
          onChange={(e) => setWa(e.target.value)}
          placeholder="60123456789"
        />
      </Field>

      <Field label="Email address" hint="Optional.">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="supplier@example.com"
        />
      </Field>

      <Field label="Notes" hint="Speciality, payment terms, lead times, etc.">
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Best pricing for brakes. Cash on delivery."
          className="w-full p-2.5 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed"
        />
      </Field>

      {error && (
        <p className="text-[12px] text-[var(--color-danger)] bg-[var(--color-danger-bg)] px-3 py-2 rounded-[var(--radius-md)]">
          {error}
        </p>
      )}
    </Dialog>
  );
}


// ── Deactivate Dialog ──────────────────────────────────────────────────────

interface DeactivateDialogProps {
  supplier: Supplier;
  onClose: () => void;
  onDeactivated: () => Promise<void>;
}

function DeactivateDialog({ supplier, onClose, onDeactivated }: DeactivateDialogProps) {
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    setError('');
    try {
      await suppliersApi.deactivate(supplier.id);
      await onDeactivated();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to deactivate supplier.');
      setLoading(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Deactivate supplier"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={confirm} disabled={loading}>
            {loading ? 'Deactivating…' : 'Yes, deactivate'}
          </Button>
        </>
      }
    >
      <p className="text-[13px] text-[var(--color-text-secondary)]">
        Are you sure you want to deactivate <strong className="text-[var(--color-text-primary)]">{supplier.name}</strong>?
      </p>
      <p className="text-[13px] text-[var(--color-text-secondary)] mt-2">
        This supplier will no longer appear when selecting contacts for new jobs.
        Past orders and enquiries linked to this supplier are preserved.
      </p>
      {error && (
        <p className="mt-3 text-[12px] text-[var(--color-danger)] bg-[var(--color-danger-bg)] px-3 py-2 rounded-[var(--radius-md)]">
          {error}
        </p>
      )}
    </Dialog>
  );
}
