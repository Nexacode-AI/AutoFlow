import { useState } from 'react';
import { Plus, Search, Package, ShieldCheck, FolderPlus } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Input, Field } from '@/design/primitives/Input';
import { Select } from '@/design/primitives/Select';
import { PageHeader } from '@/design/primitives/PageHeader';
import { Card, CardLabel } from '@/design/primitives/Card';
import { Badge } from '@/design/primitives/Badge';
import { Dialog } from '@/design/primitives/Dialog';
import { PARTS_CATALOG, PART_TYPE_META, type PartType, type CatalogPart } from '@/data/mocks';
import { fmtMoney } from '@/lib/format';
import { cn } from '@/lib/cn';

type Catalog = Record<string, CatalogPart[]>;

export function Parts() {
  const [catalog, setCatalog] = useState<Catalog>(() =>
    Object.fromEntries(Object.entries(PARTS_CATALOG).map(([k, v]) => [k, [...v]])),
  );
  const categories = Object.keys(catalog);
  const [cat, setCat] = useState(categories[0]);
  const [q, setQ] = useState('');

  const [catModal, setCatModal] = useState(false);
  const [partModal, setPartModal] = useState(false);

  const items = catalog[cat].filter(p =>
    !q.trim() || p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()),
  );
  const totalParts = Object.values(catalog).flat().length;

  const addCategory = (name: string) => {
    setCatalog(c => ({ ...c, [name]: [] }));
    setCat(name);
  };
  const addPart = (category: string, part: CatalogPart) => {
    setCatalog(c => ({ ...c, [category]: [...c[category], part] }));
    setCat(category);
  };

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="Parts Catalog"
        subtitle={`${categories.length} categories · ${totalParts} parts · every part priced as ORI or OM`}
        actions={
          <>
            <Button variant="secondary" leading={<FolderPlus className="w-3.5 h-3.5" />} onClick={() => setCatModal(true)}>
              Add category
            </Button>
            <Button variant="primary" leading={<Plus className="w-3.5 h-3.5" />} onClick={() => setPartModal(true)}>
              Add part
            </Button>
          </>
        }
      />

      {/* Grade legend — the core ORI/OM concept, stated once, applied everywhere */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(['ORI', 'OM'] as PartType[]).map(t => {
          const m = PART_TYPE_META[t];
          return (
            <Card key={t} padding="md" className="flex items-start gap-3">
              <div className={cn(
                'w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0',
                t === 'ORI' ? 'bg-[var(--color-accent-subtle)]' : 'bg-[var(--color-warning-bg)]',
              )}>
                <ShieldCheck className={cn('w-4 h-4', t === 'ORI' ? 'text-[var(--color-accent)]' : 'text-[var(--color-warning)]')} strokeWidth={1.7} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{m.label}</span>
                  <span className="text-[12px] text-[var(--color-text-tertiary)]">— {m.full}</span>
                </div>
                <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
                  Comes with a <span className="font-medium text-[var(--color-text-primary)]">{m.warranty}</span>.
                  {t === 'ORI'
                    ? ' Genuine part — recommended for newer vehicles.'
                    : ' Aftermarket part — a lower-cost alternative.'}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5">
        {/* Category sidebar */}
        <Card padding="none" className="overflow-hidden h-fit">
          <div className="px-4 h-10 border-b border-[var(--color-border)] flex items-center justify-between">
            <CardLabel>Categories</CardLabel>
            <button
              onClick={() => setCatModal(true)}
              aria-label="Add category"
              className="w-5 h-5 inline-flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="p-1.5">
            {categories.map(c => (
              <li key={c}>
                <button
                  onClick={() => setCat(c)}
                  className={cn(
                    'relative w-full text-left px-2.5 h-8 rounded-[var(--radius-md)] text-[13px] transition-colors flex items-center justify-between',
                    cat === c
                      ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-active)] font-medium'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]',
                  )}
                >
                  {cat === c && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-[var(--color-accent)]" />}
                  <span className="truncate">{c}</span>
                  <span className="text-[11px] tabular text-[var(--color-text-tertiary)]">{catalog[c].length}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Catalog table — ORI + OM priced side by side */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-4 h-12 border-b border-[var(--color-border)] flex items-center gap-3">
            <Input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={`Search ${cat}…`}
              leading={<Search className="w-3.5 h-3.5" />}
              className="max-w-sm flex-1"
            />
            <span className="text-[11px] text-[var(--color-text-tertiary)] tabular ml-auto">{items.length} parts</span>
          </div>

          {items.length === 0 ? (
            <div className="py-14 text-center">
              <Package className="w-5 h-5 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-60" strokeWidth={1.5} />
              <p className="text-[13px] font-medium text-[var(--color-text-primary)]">No parts in {cat}</p>
              <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">Add a part to this category to get started.</p>
              <Button variant="secondary" size="sm" className="mt-3" leading={<Plus className="w-3 h-3" />} onClick={() => setPartModal(true)}>
                Add part
              </Button>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border)]">
                  <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9">Part ID</th>
                  <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9">Name</th>
                  <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9 border-l border-[var(--color-border)]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" /> ORI · 1-year
                    </span>
                  </th>
                  <th className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-4 h-9 border-l border-[var(--color-border)]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)]" /> OM · 6-month
                    </span>
                  </th>
                  <th className="px-4 h-9 w-12" />
                </tr>
              </thead>
              <tbody>
                {items.map(p => {
                  const saving = Math.round(((p.oriPrice - p.omPrice) / p.oriPrice) * 100);
                  return (
                    <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]">
                      <td className="px-4 h-12 font-mono text-[12px] text-[var(--color-text-tertiary)]">{p.id}</td>
                      <td className="px-4 h-12 text-[var(--color-text-primary)] font-medium">{p.name}</td>
                      <td className="px-4 h-12 border-l border-[var(--color-border)]">
                        <div className="flex items-center gap-2">
                          <span className="tabular font-semibold text-[var(--color-text-primary)]">{fmtMoney(p.oriPrice)}</span>
                          <Badge tone="accent">1-yr</Badge>
                        </div>
                      </td>
                      <td className="px-4 h-12 border-l border-[var(--color-border)]">
                        <div className="flex items-center gap-2">
                          <span className="tabular font-semibold text-[var(--color-text-primary)]">{fmtMoney(p.omPrice)}</span>
                          <Badge tone="warning">6-mo</Badge>
                          <span className="text-[11px] text-[var(--color-success)] tabular">−{saving}%</span>
                        </div>
                      </td>
                      <td className="px-4 h-12 text-right">
                        <button className="text-[12px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">Edit</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {catModal && (
        <AddCategoryDialog
          existing={categories}
          onClose={() => setCatModal(false)}
          onAdd={name => { addCategory(name); setCatModal(false); }}
        />
      )}
      {partModal && (
        <AddPartDialog
          categories={categories}
          defaultCategory={cat}
          onClose={() => setPartModal(false)}
          onAdd={(category, part) => { addPart(category, part); setPartModal(false); }}
        />
      )}
    </div>
  );
}

/* ─── Add Category ─── */

function AddCategoryDialog({ existing, onClose, onAdd }: {
  existing: string[];
  onClose: () => void;
  onAdd: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Category name is required.'); return; }
    if (existing.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setError('A category with this name already exists.'); return;
    }
    onAdd(trimmed);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Add category"
      description="Group related parts together — e.g. Brake System, Engine Parts."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>Create category</Button>
        </>
      }
    >
      <Field label="Category name" required error={error}>
        <Input
          autoFocus
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          placeholder="e.g. Transmission"
          invalid={!!error}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
      </Field>
      <Field label="Description" hint="Optional — a short note about what belongs here.">
        <textarea
          rows={2}
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Clutch, gearbox and drivetrain components…"
          className="w-full p-2.5 text-[13px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-ring)] resize-none leading-relaxed"
        />
      </Field>
    </Dialog>
  );
}

/* ─── Add Part ─── */

function AddPartDialog({ categories, defaultCategory, onClose, onAdd }: {
  categories: string[];
  defaultCategory: string;
  onClose: () => void;
  onAdd: (category: string, part: CatalogPart) => void;
}) {
  const [category, setCategory] = useState(defaultCategory);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [ori, setOri] = useState('');
  const [om, setOm] = useState('');
  const [error, setError] = useState('');

  const oriNum = parseFloat(ori);
  const omNum = parseFloat(om);
  const saving = oriNum > 0 && omNum > 0 ? Math.round(((oriNum - omNum) / oriNum) * 100) : null;

  const submit = () => {
    if (!name.trim())                     { setError('Part name is required.'); return; }
    if (!id.trim())                       { setError('Part ID is required.'); return; }
    if (!ori || isNaN(oriNum) || oriNum < 0) { setError('Enter a valid ORI price.'); return; }
    if (!om  || isNaN(omNum)  || omNum < 0)  { setError('Enter a valid OM price.'); return; }
    onAdd(category, { id: id.trim().toUpperCase(), name: name.trim(), oriPrice: oriNum, omPrice: omNum });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Add part"
      description="Every part is priced for both grades — ORI (1-year) and OM (6-month)."
      width={520}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>Add to catalog</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category" required>
          <Select value={category} onChange={e => setCategory(e.target.value)} className="w-full">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Part ID" required>
          <Input value={id} onChange={e => { setId(e.target.value); setError(''); }} placeholder="BP-F-001" className="font-mono" />
        </Field>
      </div>

      <Field label="Part name" required>
        <Input
          autoFocus
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          placeholder="e.g. Brake Pads (Front)"
          invalid={!!error && !name.trim()}
        />
      </Field>

      {/* ORI / OM pricing — same Field+grid pattern as the rows above */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="ORI price · 1-year" required>
          <Input
            value={ori}
            onChange={e => { setOri(e.target.value); setError(''); }}
            placeholder="150.00"
            type="number"
            leading={<span className="text-[12px] font-medium">RM</span>}
          />
        </Field>
        <Field label="OM price · 6-month" required>
          <Input
            value={om}
            onChange={e => { setOm(e.target.value); setError(''); }}
            placeholder="105.00"
            type="number"
            leading={<span className="text-[12px] font-medium">RM</span>}
          />
        </Field>
      </div>

      <p className="text-[11px] text-[var(--color-text-tertiary)] -mt-2.5">
        {saving !== null
          ? <>OM is <span className="text-[var(--color-success)] font-medium tabular">{saving}% cheaper</span> than ORI for this part.</>
          : 'OM typically runs 25–35% below ORI.'}
      </p>

      {error && (
        <p className="text-[12px] text-[var(--color-danger)] -mt-2.5">{error}</p>
      )}
    </Dialog>
  );
}
