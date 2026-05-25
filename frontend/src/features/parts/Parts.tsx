import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Plus, Search, Package, ShieldCheck, FolderPlus,
  Pencil, Trash2, AlertCircle, Loader2,
} from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Input, Field } from '@/design/primitives/Input';
import { Select } from '@/design/primitives/Select';
import { PageHeader } from '@/design/primitives/PageHeader';
import { Card, CardLabel } from '@/design/primitives/Card';
import { Badge } from '@/design/primitives/Badge';
import { Dialog } from '@/design/primitives/Dialog';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/lib/auth/useAuthStore';
import { catalogueApi, type Category, type CataloguePart } from '@/services/catalogue';
import { ApiError } from '@/lib/api';

// ── Grade display helpers ──────────────────────────────────────────────────

const GRADE_META = {
  ORI: { label: 'ORI — Original', full: 'Genuine manufacturer part', tone: 'accent' as const, defaultWarranty: 12 },
  OM:  { label: 'OM — Alternative', full: 'Aftermarket / non-branded part', tone: 'warning' as const, defaultWarranty: 6 },
};

function WarrantyLabel({ months }: { months: number }) {
  if (months === 0) return <span className="text-[11px] text-[var(--color-text-tertiary)]">No warranty</span>;
  if (months < 12)  return <Badge tone="warning">{months}-mo</Badge>;
  if (months === 12) return <Badge tone="accent">1-yr</Badge>;
  return <Badge tone="accent">{Math.round(months / 12)}-yr</Badge>;
}

// ── Main Component ─────────────────────────────────────────────────────────

export function Parts() {
  const user          = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const [categories, setCategories]     = useState<Category[]>([]);
  const [parts, setParts]               = useState<CataloguePart[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [partsLoading, setPartsLoading] = useState(false);
  const [error, setError]               = useState('');

  const [catModal, setCatModal]       = useState<'create' | Category | null>(null);
  const [partModal, setPartModal]     = useState<'create' | CataloguePart | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    { type: 'category'; item: Category } | { type: 'part'; item: CataloguePart } | null
  >(null);

  // Generation counter for loadParts — prevents stale results from rapid
  // category switching (only the latest request's result is applied).
  const partsSeq = useRef(0);

  // Ref so loadCategories can read the current selectedCatId without needing it
  // as a useCallback dep (which would create stale closures inside onConfirm).
  const catIdRef = useRef(selectedCatId);
  useEffect(() => { catIdRef.current = selectedCatId; }, [selectedCatId]);

  const loadCategories = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const cats = await catalogueApi.getCategories();
      setCategories(cats);
      if (cats.length > 0 && !catIdRef.current) setSelectedCatId(cats[0].id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadParts = useCallback(async () => {
    if (!isAuthenticated) return;
    const seq = ++partsSeq.current;
    setPartsLoading(true);
    try {
      const p = await catalogueApi.getParts({
        category_id: selectedCatId || undefined,
        search: search.trim() || undefined,
      });
      if (seq !== partsSeq.current) return; // discard stale result
      setParts(p);
    } catch (e) {
      if (seq === partsSeq.current) setError(e instanceof ApiError ? e.message : 'Failed to load parts');
    } finally {
      if (seq === partsSeq.current) setPartsLoading(false);
    }
  }, [isAuthenticated, selectedCatId, search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void loadCategories(); }, [loadCategories]); // re-fires when isAuthenticated changes
  useEffect(() => { if (!loading) void loadParts(); }, [selectedCatId, search, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentCat  = categories.find((c) => c.id === selectedCatId);
  const totalParts  = categories.reduce((s, c) => s + c.parts_count, 0);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <p className="text-[13px] text-[var(--color-text-tertiary)]">Please sign in to view the parts catalogue.</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="Parts Catalogue"
        subtitle={`${categories.length} categories · ${totalParts} parts · each part graded ORI or OM`}
        actions={isAdmin ? (
          <>
            <Button variant="secondary" leading={<FolderPlus className="w-3.5 h-3.5" />} onClick={() => setCatModal('create')}>
              Add category
            </Button>
            <Button variant="primary" leading={<Plus className="w-3.5 h-3.5" />} onClick={() => setPartModal('create')}>
              Add part
            </Button>
          </>
        ) : null}
      />

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger)] rounded-[var(--radius-md)] text-[13px] text-[var(--color-danger)]">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button className="ml-auto text-[11px] underline hover:no-underline" onClick={() => { setError(''); void loadCategories(); }}>Retry</button>
        </div>
      )}

      {/* Grade legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(['ORI', 'OM'] as const).map((g) => {
          const m = GRADE_META[g];
          return (
            <Card key={g} padding="md" className="flex items-start gap-3">
              <div className={cn('w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0', g === 'ORI' ? 'bg-[var(--color-accent-subtle)]' : 'bg-[var(--color-warning-bg)]')}>
                <ShieldCheck className={cn('w-4 h-4', g === 'ORI' ? 'text-[var(--color-accent)]' : 'text-[var(--color-warning)]')} strokeWidth={1.7} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{m.label}</span>
                </div>
                <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
                  {m.full} — default warranty: <span className="font-medium text-[var(--color-text-primary)]">{m.defaultWarranty} months</span>.
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--color-accent)]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5">
          {/* Category sidebar */}
          <Card padding="none" className="overflow-hidden h-fit">
            <div className="px-4 h-10 border-b border-[var(--color-border)] flex items-center justify-between">
              <CardLabel>Categories</CardLabel>
              {isAdmin && (
                <button onClick={() => setCatModal('create')} aria-label="Add category"
                  className="w-5 h-5 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <ul className="p-1.5">
              <li>
                <button onClick={() => setSelectedCatId('')}
                  className={cn('relative w-full text-left px-2.5 h-8 rounded-[var(--radius-md)] text-[13px] transition-colors flex items-center justify-between',
                    selectedCatId === '' ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-active)] font-medium' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]')}>
                  {selectedCatId === '' && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-[var(--color-accent)]" />}
                  <span className="truncate">All parts</span>
                  <span className="text-[11px] tabular text-[var(--color-text-tertiary)]">{totalParts}</span>
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id} className="group relative">
                  {/* Category select button — no interactive children to avoid invalid nested <button> */}
                  <button onClick={() => setSelectedCatId(c.id)}
                    className={cn('relative w-full text-left px-2.5 h-8 rounded-[var(--radius-md)] text-[13px] transition-colors flex items-center justify-between',
                      selectedCatId === c.id ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-active)] font-medium' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]')}>
                    {selectedCatId === c.id && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-[var(--color-accent)]" />}
                    <span className="truncate flex items-center gap-1.5">
                      {c.icon && <span className="text-[14px]">{c.icon}</span>}
                      {c.name}
                    </span>
                    <span className="text-[11px] tabular text-[var(--color-text-tertiary)] group-hover:hidden">{c.parts_count}</span>
                  </button>
                  {/* Edit / Delete — siblings of the button, absolutely positioned to avoid nested <button> */}
                  {isAdmin && (
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                      <button onClick={() => setCatModal(c)} title="Edit" className="w-5 h-5 inline-flex items-center justify-center rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => setDeleteTarget({ type: 'category', item: c })} title="Delete" className="w-5 h-5 inline-flex items-center justify-center rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"><Trash2 className="w-3 h-3" /></button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          {/* Parts table */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-4 h-12 border-b border-[var(--color-border)] flex items-center gap-3">
              <Input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={currentCat ? `Search in ${currentCat.name}…` : 'Search all parts…'}
                leading={<Search className="w-3.5 h-3.5" />} className="max-w-sm flex-1" />
              {partsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-text-tertiary)]" />}
              <span className="text-[11px] text-[var(--color-text-tertiary)] tabular ml-auto">{parts.length} parts</span>
            </div>

            {parts.length === 0 && !partsLoading ? (
              <div className="py-14 text-center">
                <Package className="w-5 h-5 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-60" strokeWidth={1.5} />
                <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
                  {search ? 'No parts match your search' : `No parts in ${currentCat?.name ?? 'this catalogue'}`}
                </p>
                <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
                  {search ? 'Try a different search term.' : 'Add a part to get started.'}
                </p>
                {isAdmin && !search && (
                  <Button variant="secondary" size="sm" className="mt-3" leading={<Plus className="w-3 h-3" />} onClick={() => setPartModal('create')}>
                    Add part
                  </Button>
                )}
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                    <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9">Name</th>
                    <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9">Category</th>
                    <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9">Grade</th>
                    <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9">Warranty</th>
                    {isAdmin && <th className="px-4 h-9 w-20" />}
                  </tr>
                </thead>
                <tbody>
                  {parts.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]">
                      <td className="px-4 h-11 text-[var(--color-text-primary)] font-medium">{p.name}</td>
                      <td className="px-4 h-11 text-[var(--color-text-secondary)] text-[12px]">{p.category_name}</td>
                      <td className="px-4 h-11"><Badge tone={p.grade === 'ORI' ? 'accent' : 'warning'}>{p.grade}</Badge></td>
                      <td className="px-4 h-11"><WarrantyLabel months={p.warranty_months} /></td>
                      {isAdmin && (
                        <td className="px-4 h-11">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => setPartModal(p)} title="Edit"
                              className="w-7 h-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteTarget({ type: 'part', item: p })} title="Delete"
                              className="w-7 h-7 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {catModal !== null && (
        <CategoryModal
          mode={catModal === 'create' ? 'create' : 'edit'}
          existing={catModal !== 'create' ? catModal as Category : undefined}
          allNames={categories.map((c) => c.name)}
          onClose={() => setCatModal(null)}
          onSave={async (data) => {
            if (catModal === 'create') await catalogueApi.createCategory(data);
            else await catalogueApi.updateCategory((catModal as Category).id, data);
            setCatModal(null);
            await loadCategories();
            await loadParts();
          }}
        />
      )}

      {partModal !== null && (
        <PartModal
          mode={partModal === 'create' ? 'create' : 'edit'}
          existing={partModal !== 'create' ? partModal as CataloguePart : undefined}
          categories={categories}
          defaultCategoryId={selectedCatId || categories[0]?.id || ''}
          onClose={() => setPartModal(null)}
          onSave={async (data) => {
            if (partModal === 'create') await catalogueApi.createPart(data as Parameters<typeof catalogueApi.createPart>[0]);
            else await catalogueApi.updatePart((partModal as CataloguePart).id, data);
            setPartModal(null);
            await loadCategories();
            await loadParts();
          }}
        />
      )}

      {deleteTarget !== null && (
        <DeleteDialog
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (deleteTarget.type === 'category') {
              // Always refresh categories, even if the delete throws (e.g. 404 from
              // a double-tap) so the sidebar never stays out of sync with the server.
              await catalogueApi.deleteCategory(deleteTarget.item.id)
                .catch((err) => { void loadCategories(); throw err; });
              if (selectedCatId === deleteTarget.item.id) setSelectedCatId('');
              await loadCategories(); // useEffect will fire loadParts if selection changed
            } else {
              await catalogueApi.deletePart(deleteTarget.item.id)
                .catch((err) => { void loadCategories().then(() => loadParts()); throw err; });
              await loadCategories();
              await loadParts();
            }
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}

// ── Category Modal ─────────────────────────────────────────────────────────

interface CategoryModalProps {
  mode: 'create' | 'edit';
  existing?: Category;
  allNames: string[];
  onClose: () => void;
  onSave: (data: { name: string; description?: string | null; icon?: string | null; sort_order?: number }) => Promise<void>;
}

function CategoryModal({ mode, existing, allNames, onClose, onSave }: CategoryModalProps) {
  const [name, setName]             = useState(existing?.name ?? '');
  const [description, setDesc]      = useState(existing?.description ?? '');
  const [icon, setIcon]             = useState(existing?.icon ?? '');
  const [sortOrder, setSortOrder]   = useState(String(existing?.sort_order ?? 0));
  const [error, setError]           = useState('');
  const [saving, setSaving]         = useState(false);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Category name is required.'); return; }
    const taken = allNames
      .filter((n) => mode === 'edit' ? n !== existing?.name : true)
      .some((n) => n.toLowerCase() === trimmed.toLowerCase());
    if (taken) { setError('A category with this name already exists.'); return; }
    setSaving(true);
    try {
      await onSave({ name: trimmed, description: description.trim() || null, icon: icon.trim() || null, sort_order: parseInt(sortOrder, 10) || 0 });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save.');
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose}
      title={mode === 'create' ? 'Add category' : 'Edit category'}
      description="Group related parts — e.g. Brakes, Engine, Electrical."
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={saving}>{saving ? 'Saving…' : mode === 'create' ? 'Create category' : 'Save changes'}</Button>
      </>}>
      <Field label="Category name" required error={error}>
        <Input autoFocus value={name} onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder="e.g. Brakes" invalid={!!error} onKeyDown={(e) => e.key === 'Enter' && void submit()} />
      </Field>
      <Field label="Icon (emoji)" hint="Optional — shown next to the category name.">
        <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🛑" className="max-w-[100px]" />
      </Field>
      <Field label="Description" hint="Optional short note.">
        <textarea rows={2} value={description} onChange={(e) => setDesc(e.target.value)}
          placeholder="Brake pads, discs, calipers…"
          className="w-full p-2.5 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed" />
      </Field>
      <Field label="Sort order" hint="Lower = higher in the list.">
        <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="max-w-[100px]" />
      </Field>
    </Dialog>
  );
}

// ── Part Modal ─────────────────────────────────────────────────────────────

interface PartModalProps {
  mode: 'create' | 'edit';
  existing?: CataloguePart;
  categories: Category[];
  defaultCategoryId: string;
  onClose: () => void;
  onSave: (data: { category_id?: string; name?: string; grade?: 'ORI' | 'OM'; warranty_months?: number }) => Promise<void>;
}

function PartModal({ mode, existing, categories, defaultCategoryId, onClose, onSave }: PartModalProps) {
  const [categoryId, setCategoryId] = useState(existing?.category_id ?? defaultCategoryId);
  const [name, setName]             = useState(existing?.name ?? '');
  const [grade, setGrade]           = useState<'ORI' | 'OM'>(existing?.grade ?? 'ORI');
  const [warranty, setWarranty]     = useState(String(existing?.warranty_months ?? GRADE_META['ORI'].defaultWarranty));
  const [error, setError]           = useState('');
  const [saving, setSaving]         = useState(false);

  const handleGradeChange = (g: 'ORI' | 'OM') => {
    setGrade(g);
    if (mode === 'create') setWarranty(String(GRADE_META[g].defaultWarranty));
  };

  const submit = async () => {
    if (!name.trim()) { setError('Part name is required.'); return; }
    if (!categoryId)  { setError('Please select a category.'); return; }
    const w = parseInt(warranty, 10);
    if (isNaN(w) || w < 0) { setError('Enter a valid warranty (0 or more months).'); return; }
    setSaving(true);
    try {
      await onSave({ category_id: categoryId, name: name.trim(), grade, warranty_months: w });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save.');
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose}
      title={mode === 'create' ? 'Add part' : 'Edit part'}
      description="Staff browse this catalogue when selecting parts during diagnosis."
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={saving}>{saving ? 'Saving…' : mode === 'create' ? 'Add part' : 'Save changes'}</Button>
      </>}>
      <Field label="Category" required>
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full">
          <option value="">Select a category…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>)}
        </Select>
      </Field>
      <Field label="Part name" required error={error && !name ? error : undefined}>
        <Input autoFocus value={name} onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder="e.g. Brake Pad Set (Front)" invalid={!!error && !name} />
      </Field>
      <Field label="Grade" required>
        <div className="flex gap-2">
          {(['ORI', 'OM'] as const).map((g) => (
            <button key={g} type="button" onClick={() => handleGradeChange(g)}
              className={cn('flex-1 h-9 rounded-[var(--radius-md)] border text-[13px] font-medium transition-colors',
                grade === g
                  ? g === 'ORI' ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)] text-[var(--color-accent-active)]'
                                : 'bg-[var(--color-warning-bg)] border-[var(--color-warning)] text-[var(--color-warning)]'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]')}>
              {g}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">{GRADE_META[grade].full}</p>
      </Field>
      <Field label="Warranty (months)" hint="0 = no warranty." error={error && name ? error : undefined}>
        <Input type="number" value={warranty} onChange={(e) => { setWarranty(e.target.value); setError(''); }}
          className="max-w-[140px]" min={0} invalid={!!error && !!name} />
      </Field>
    </Dialog>
  );
}

// ── Delete Confirmation ────────────────────────────────────────────────────

interface DeleteDialogProps {
  target: { type: 'category'; item: Category } | { type: 'part'; item: CataloguePart };
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteDialog({ target, onClose, onConfirm }: DeleteDialogProps) {
  const [error, setError]     = useState('');
  const [deleting, setDel]    = useState(false);

  const label = target.type === 'category' ? `category "${target.item.name}"` : `part "${target.item.name}"`;

  const confirm = async () => {
    setDel(true);
    try { await onConfirm(); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Delete failed.'); setDel(false); }
  };

  return (
    <Dialog open onClose={onClose} title={`Delete ${target.type}`}
      footer={<>
        <Button variant="ghost" onClick={onClose} disabled={deleting}>Cancel</Button>
        <Button variant="danger" onClick={confirm} disabled={deleting}>{deleting ? 'Deleting…' : 'Yes, delete'}</Button>
      </>}>
      <p className="text-[13px] text-[var(--color-text-secondary)]">
        Are you sure you want to delete the {label}?{' '}
        {target.type === 'category' && 'This is only possible if no parts are linked.'}
        {target.type === 'part' && "The part is soft-deleted — past job records are preserved."}
      </p>
      {error && (
        <p className="text-[12px] text-[var(--color-danger)] bg-[var(--color-danger-bg)] px-3 py-2 rounded-[var(--radius-md)]">{error}</p>
      )}
    </Dialog>
  );
}
