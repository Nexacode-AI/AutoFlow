import { useState } from 'react';
import {
  Search, Plus, Settings, Bell, MoreHorizontal, Wrench, Car,
  ArrowRight, FileText, Package, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Input, Field } from '@/design/primitives/Input';
import { Select } from '@/design/primitives/Select';
import { Card, CardHeader, CardLabel } from '@/design/primitives/Card';
import { Badge } from '@/design/primitives/Badge';
import { Avatar } from '@/design/primitives/Avatar';
import { PlateBadge } from '@/design/primitives/PlateBadge';
import { KPI } from '@/design/primitives/KPI';
import { PageHeader } from '@/design/primitives/PageHeader';
import { EmptyState } from '@/design/primitives/EmptyState';
import { Tabs } from '@/design/primitives/Tabs';
import { fmtMoney } from '@/lib/format';

const TABS = [
  { value: 'colors',  label: 'Colors' },
  { value: 'type',    label: 'Typography' },
  { value: 'buttons', label: 'Buttons', count: 12 },
  { value: 'inputs',  label: 'Inputs' },
  { value: 'cards',   label: 'Cards' },
  { value: 'data',    label: 'Data' },
] as const;

type Tab = (typeof TABS)[number]['value'];

export function PrimitivesShowcase() {
  const [tab, setTab] = useState<Tab>('colors');

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-8 py-8 space-y-8">
        <PageHeader
          title="Design Primitives"
          subtitle="Phase 1 foundation — atomic components, tokens, and typography."
          meta={
            <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-tertiary)]">
              <span className="font-mono">v0.1</span>
              <span>·</span>
              <span>AutoFlow design system</span>
            </div>
          }
          actions={
            <>
              <Button variant="ghost" size="md" leading={<Settings className="w-3.5 h-3.5" />}>Settings</Button>
              <Button variant="primary" size="md" leading={<Plus className="w-3.5 h-3.5" />}>New Job</Button>
            </>
          }
        />

        <Tabs value={tab} onChange={setTab} tabs={TABS} />

        {tab === 'colors' && <ColorsPanel />}
        {tab === 'type' && <TypePanel />}
        {tab === 'buttons' && <ButtonsPanel />}
        {tab === 'inputs' && <InputsPanel />}
        {tab === 'cards' && <CardsPanel />}
        {tab === 'data' && <DataPanel />}
      </div>
    </div>
  );
}

/* ─────── Colors ─────── */

const SWATCH_GROUPS = [
  {
    name: 'Surfaces',
    items: [
      ['bg',              '#FBFBF9'],
      ['surface',         '#FFFFFF'],
      ['surface-hover',   '#F5F4F0'],
      ['surface-active',  '#EFEDE7'],
      ['surface-sunken',  '#F7F6F2'],
    ],
  },
  {
    name: 'Borders',
    items: [
      ['border',         '#E8E6E0'],
      ['border-hover',   '#D6D3CC'],
      ['border-strong',  '#B8B4AB'],
    ],
  },
  {
    name: 'Text',
    items: [
      ['text-primary',    '#1A1A1A'],
      ['text-secondary',  '#5C5C5C'],
      ['text-tertiary',   '#8B8780'],
      ['text-disabled',   '#BAB6AD'],
    ],
  },
  {
    name: 'Accent',
    items: [
      ['accent',          '#4F7CFF'],
      ['accent-hover',    '#3D68F0'],
      ['accent-active',   '#2F56D4'],
    ],
  },
  {
    name: 'Semantic',
    items: [
      ['success',  '#2D8654'],
      ['warning',  '#B86E00'],
      ['danger',   '#C03A2B'],
      ['info',     '#1C6FBE'],
    ],
  },
] as const;

function ColorsPanel() {
  return (
    <div className="space-y-6">
      {SWATCH_GROUPS.map(g => (
        <div key={g.name}>
          <CardLabel>{g.name}</CardLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-2">
            {g.items.map(([name, hex]) => (
              <div key={name} className="hairline rounded-[var(--radius-lg)] overflow-hidden">
                <div className="h-14" style={{ background: hex }} />
                <div className="p-2.5 bg-[var(--color-surface)]">
                  <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{name}</p>
                  <p className="text-[11px] font-mono text-[var(--color-text-tertiary)]">{hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────── Type ─────── */

function TypePanel() {
  return (
    <Card padding="lg">
      <div className="space-y-5">
        <Row name="Display" cls="text-[30px] leading-9 font-semibold" sample="The quick brown fox" />
        <Row name="H1"      cls="text-[22px] leading-7 font-semibold" sample="The quick brown fox" />
        <Row name="H2"      cls="text-[18px] leading-6 font-semibold" sample="The quick brown fox" />
        <Row name="H3"      cls="text-[15px] leading-5 font-semibold" sample="The quick brown fox" />
        <Row name="Body"    cls="text-[13px] leading-5"               sample="The quick brown fox jumps over the lazy dog." />
        <Row name="Label"   cls="text-[12px] leading-4 font-medium"   sample="Workshop name" />
        <Row name="Caption" cls="text-[11px] leading-4 font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]" sample="Operations" />
        <Row name="Mono"    cls="text-[13px] font-mono font-medium tabular" sample="WF-2024-0001 · WXY 1234 · RM 2,700.00" />
      </div>
    </Card>
  );
}
function Row({ name, cls, sample }: { name: string; cls: string; sample: string }) {
  return (
    <div className="flex items-baseline gap-6 pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0">
      <div className="w-24 shrink-0">
        <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] font-medium">{name}</p>
      </div>
      <p className={cls}>{sample}</p>
    </div>
  );
}

/* ─────── Buttons ─────── */

function ButtonsPanel() {
  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardLabel>Primary · Secondary · Ghost · Danger</CardLabel>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Button variant="primary">Create job</Button>
          <Button variant="secondary">Save draft</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </Card>

      <Card padding="lg">
        <CardLabel>Sizes</CardLabel>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
      </Card>

      <Card padding="lg">
        <CardLabel>With icons</CardLabel>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Button variant="primary" leading={<Plus className="w-3.5 h-3.5" />}>New job</Button>
          <Button variant="secondary" trailing={<ArrowRight className="w-3.5 h-3.5" />}>View all</Button>
          <Button variant="ghost" iconOnly aria-label="More"><MoreHorizontal className="w-4 h-4" /></Button>
          <Button variant="secondary" iconOnly aria-label="Notifications"><Bell className="w-3.5 h-3.5" /></Button>
        </div>
      </Card>
    </div>
  );
}

/* ─────── Inputs ─────── */

function InputsPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card padding="lg" className="space-y-4">
        <CardLabel>Fields</CardLabel>
        <Field label="Plate number" required>
          <Input defaultValue="WXY 1234" leading={<Car className="w-3.5 h-3.5" />} />
        </Field>
        <Field label="Customer name">
          <Input placeholder="Ahmad bin Abdullah" />
        </Field>
        <Field label="Email" hint="We'll send the approval link here.">
          <Input type="email" placeholder="ahmad@example.com" />
        </Field>
        <Field label="Invalid input" error="Phone number is required.">
          <Input invalid defaultValue="" />
        </Field>
      </Card>

      <Card padding="lg" className="space-y-4">
        <CardLabel>Select &amp; Search</CardLabel>
        <Field label="Category">
          <Select defaultValue="brakes">
            <option value="engine">Engine Parts</option>
            <option value="brakes">Brake System</option>
            <option value="electrical">Electrical</option>
            <option value="ac">AC System</option>
          </Select>
        </Field>
        <Field label="Search jobs">
          <Input placeholder="Search by plate, customer, or ID…" leading={<Search className="w-3.5 h-3.5" />} />
        </Field>
        <div className="pt-2">
          <CardLabel>Plate badges</CardLabel>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <PlateBadge plate="WXY 1234" size="sm" />
            <PlateBadge plate="ABC 5678" size="md" />
            <PlateBadge plate="JKL 9012" size="lg" />
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─────── Cards ─────── */

function CardsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <CardLabel>KPI cards</CardLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          <KPI label="Active jobs"      value="24"  delta={{ value: 12.4 }} spark={[3,5,4,7,6,9,11]} hint="vs last week" />
          <KPI label="Revenue today"    value={fmtMoney(8420)} delta={{ value: 4.1 }} spark={[5,4,6,8,7,9,12]} />
          <KPI label="Awaiting parts"   value="7"   delta={{ value: -2.3 }} spark={[8,7,9,6,5,4,3]} hint="3 overdue" />
          <KPI label="Completion rate"  value="87%" delta={{ value: 1.2 }} spark={[80,82,85,84,86,87,87]} />
        </div>
      </div>

      <div>
        <CardLabel>Job card</CardLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          {SAMPLE_JOBS.map(j => (
            <Card key={j.plate} interactive padding="md">
              <CardHeader>
                <PlateBadge plate={j.plate} size="md" />
                <Badge tone={j.tone as any} dot>{j.status}</Badge>
              </CardHeader>
              <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{j.customer}</p>
              <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">{j.model}</p>
              <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono">{j.code}</span>
                <div className="flex items-center gap-1.5">
                  <Avatar name={j.tech} size="xs" />
                  <span className="text-[11px] text-[var(--color-text-secondary)]">{j.tech}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <CardLabel>Empty state</CardLabel>
        <Card padding="none" className="mt-2">
          <EmptyState
            icon={Wrench}
            title="No jobs in this column"
            description="Drag a job here or create one from the top-right."
            action={<Button variant="secondary" size="sm" leading={<Plus className="w-3 h-3" />}>Create job</Button>}
          />
        </Card>
      </div>
    </div>
  );
}

const SAMPLE_JOBS = [
  { plate: 'WXY 1234', code: 'WF-2024-0001', customer: 'Ahmad bin Abdullah', model: 'Honda Civic 2020', status: 'Diagnosis',  tone: 'diagnosis', tech: 'Mohd Rizal' },
  { plate: 'ABC 5678', code: 'WF-2024-0002', customer: 'Sarah Lee',          model: 'Toyota Vios 2019', status: 'In repair',  tone: 'repair',    tech: 'Kumar Wong' },
  { plate: 'JKL 9012', code: 'WF-2024-0003', customer: 'Raj Kumar',          model: 'Perodua Myvi 2021',status: 'Ready',      tone: 'ready',     tech: 'Ahmad H.' },
];

/* ─────── Data ─────── */

function DataPanel() {
  return (
    <div className="space-y-6">
      <div>
        <CardLabel>Status pills</CardLabel>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge tone="intake" dot>Intake</Badge>
          <Badge tone="diagnosis" dot>Diagnosis</Badge>
          <Badge tone="repair" dot>In repair</Badge>
          <Badge tone="qc" dot>QC</Badge>
          <Badge tone="ready" dot>Ready</Badge>
          <Badge tone="blocked" dot>Blocked</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
          <Badge tone="info">Info</Badge>
        </div>
      </div>

      <div>
        <CardLabel>Sample table</CardLabel>
        <Card padding="none" className="mt-2 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
                {['Plate', 'Customer', 'Status', 'Cost', 'Updated', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-text-tertiary)] px-3 h-9 first:pl-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ROWS.map((r, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)] transition-colors">
                  <td className="px-3 first:pl-4 h-9"><PlateBadge plate={r.plate} size="sm" /></td>
                  <td className="px-3 h-9 text-[var(--color-text-primary)]">{r.customer}</td>
                  <td className="px-3 h-9"><Badge tone={r.tone as any} dot>{r.status}</Badge></td>
                  <td className="px-3 h-9 tabular text-[var(--color-text-primary)]">{fmtMoney(r.cost)}</td>
                  <td className="px-3 h-9 text-[var(--color-text-tertiary)]">{r.updated}</td>
                  <td className="px-3 h-9 text-right pr-4">
                    <Button variant="ghost" iconOnly size="sm" aria-label="More"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div>
        <CardLabel>Iconography (curated set)</CardLabel>
        <Card padding="lg" className="mt-2">
          <div className="flex flex-wrap gap-4 text-[var(--color-text-secondary)]">
            {[Car, Wrench, Package, FileText, Bell, Settings, AlertTriangle, Search, Plus, ArrowRight].map((Ico, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Ico className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">1.5px</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

const SAMPLE_ROWS = [
  { plate: 'WXY 1234', customer: 'Ahmad bin Abdullah', status: 'Diagnosis', tone: 'diagnosis', cost: 2700, updated: '12 min ago' },
  { plate: 'ABC 5678', customer: 'Sarah Lee',          status: 'In repair', tone: 'repair',    cost: 1450, updated: '1 hr ago' },
  { plate: 'JKL 9012', customer: 'Raj Kumar',          status: 'Ready',     tone: 'ready',     cost: 980,  updated: '3 hr ago' },
  { plate: 'PQR 4567', customer: 'Lim Tan Wei',        status: 'Blocked',   tone: 'blocked',   cost: 3210, updated: 'yesterday' },
];
