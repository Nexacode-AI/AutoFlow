import { Download } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { PageHeader } from '@/design/primitives/PageHeader';
import { Card, CardLabel } from '@/design/primitives/Card';
import { KPI } from '@/design/primitives/KPI';
import { Select } from '@/design/primitives/Select';
import { Badge } from '@/design/primitives/Badge';
import { fmtMoney } from '@/lib/format';

const REVENUE_TREND = [4200, 5100, 4800, 6200, 5400, 7100, 6800, 7400, 8200, 7900, 8400, 9100];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const TOP_PARTS = [
  { name: 'Brake Pads (Front)',     count: 24, revenue: 9000 },
  { name: 'Engine Oil 5W-30 (4L)',  count: 19, revenue: 4560 },
  { name: 'Air Filter',             count: 17, revenue: 2210 },
  { name: 'AC Gas Refill',          count: 12, revenue: 3840 },
  { name: 'Spark Plugs (set of 4)', count: 9,  revenue: 2160 },
];

const TOP_TECH = [
  { name: 'Mohd Rizal',   jobs: 18, avgTime: '4h 32m' },
  { name: 'Kumar Wong',   jobs: 14, avgTime: '5h 12m' },
  { name: 'Ahmad Hassan', jobs: 11, avgTime: '4h 48m' },
];

export function Reports() {
  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="Reports"
        subtitle="Revenue, throughput, parts & technician performance."
        actions={
          <>
            <Select defaultValue="30">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </Select>
            <Button variant="secondary" leading={<Download className="w-3.5 h-3.5" />}>Export</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Revenue"          value={fmtMoney(81400)} delta={{ value: 14.2 }} spark={REVENUE_TREND.slice(-7)} />
        <KPI label="Jobs completed"   value="48"               delta={{ value: 6.8 }}  spark={[3,5,4,7,6,9,11]} />
        <KPI label="Avg. ticket"      value={fmtMoney(1696)}   delta={{ value: 3.4 }}  spark={[1400,1500,1450,1600,1700,1650,1696]} hint="per closed job" />
        <KPI label="On-time delivery" value="92%"              delta={{ value: 2.1 }}  spark={[85,87,86,90,89,91,92]} />
      </div>

      {/* Revenue chart */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-4 h-11 border-b border-[var(--color-border)] flex items-center justify-between">
          <div>
            <CardLabel>Monthly revenue</CardLabel>
          </div>
          <Badge tone="success">+14.2%</Badge>
        </div>
        <div className="p-5">
          <RevenueChart data={REVENUE_TREND} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card padding="none" className="overflow-hidden">
          <div className="px-4 h-11 border-b border-[var(--color-border)] flex items-center">
            <CardLabel>Top parts sold</CardLabel>
          </div>
          <ul className="divide-y divide-[var(--color-border)]">
            {TOP_PARTS.map(p => (
              <li key={p.name} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-[var(--color-text-primary)]">{p.name}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] tabular">{p.count} units sold</p>
                </div>
                <span className="text-[13px] font-medium tabular text-[var(--color-text-primary)]">{fmtMoney(p.revenue)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="none" className="overflow-hidden">
          <div className="px-4 h-11 border-b border-[var(--color-border)] flex items-center">
            <CardLabel>Technician performance</CardLabel>
          </div>
          <ul className="divide-y divide-[var(--color-border)]">
            {TOP_TECH.map(t => (
              <li key={t.name} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-[var(--color-text-primary)]">{t.name}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] tabular">Avg. {t.avgTime}</p>
                </div>
                <span className="text-[13px] font-medium tabular text-[var(--color-text-primary)]">{t.jobs} jobs</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function RevenueChart({ data }: { data: number[] }) {
  const w = 720, h = 180, pad = 24;
  const max = Math.max(...data);
  const barW = (w - pad * 2) / data.length - 6;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block overflow-visible">
      {data.map((v, i) => {
        const barH = (v / max) * (h - pad * 2);
        const x = pad + i * ((w - pad * 2) / data.length) + 3;
        const y = h - pad - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill="var(--color-accent)" opacity={0.85} />
            <text x={x + barW / 2} y={h - 6} fontSize="10" textAnchor="middle" fill="var(--color-text-tertiary)" className="font-mono">{MONTHS[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}
