import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types & mock data
// * Data source: join company-expense records (actual cost) with workflow markup
//   prices — only shows when company expense record is marked 'completed'
// ─────────────────────────────────────────────────────────────────────────────
interface WorkflowProfit {
  workflowId: string;
  workflowCode: string;
  plateNumber: string;
  customerName: string;
  completedDate: string;
  revenue: number;      // sum of markupPrice × qty from workflow (quoted to customer)
  actualCost: number;   // sum of extractedAmount from company expense PDFs (real payment)
  grossProfit: number;
  profitMargin: number; // (grossProfit / revenue) × 100
  partCount: number;
  parts: {
    name: string;
    qty: number;
    quotedPrice: number;  // markupPrice per unit from workflow step 10
    actualCost: number;   // extractedAmount per unit from bank slip
  }[];
}

// * Revenue = markup price applied in workflow step 10 (after 60% margin)
// * Actual cost = extracted from bank slip PDFs in Company Expenses
const mockProfitData: WorkflowProfit[] = [
  {
    workflowId: 'wf-mock-2',
    workflowCode: 'WF7X9M3C',
    plateNumber: 'ABC 5678',
    customerName: 'Lim Wei Xiang',
    completedDate: '31 Mar 2026',
    revenue: 317.60,
    actualCost: 197.50,
    grossProfit: 120.10,
    profitMargin: 37.8,
    partCount: 3,
    parts: [
      { name: 'Engine Oil Filter',      qty: 1, quotedPrice: 68.80,  actualCost: 43.00 },
      { name: 'Air Filter',             qty: 1, quotedPrice: 58.40,  actualCost: 36.50 },
      { name: 'Spark Plugs (Set of 4)', qty: 1, quotedPrice: 190.40, actualCost: 118.00 },
    ],
  },
  {
    workflowId: 'wf-mock-4',
    workflowCode: 'WF1K8P2N',
    plateNumber: 'GHJ 3456',
    customerName: 'Raj Kumar',
    completedDate: '25 Mar 2026',
    revenue: 1248.00,
    actualCost: 528.00,
    grossProfit: 720.00,
    profitMargin: 57.7,
    partCount: 2,
    parts: [
      { name: 'Battery (DIN65)', qty: 1, quotedPrice: 448.00, actualCost: 280.00 },
      { name: 'Alternator',      qty: 1, quotedPrice: 800.00, actualCost: 248.00 },
    ],
  },
  {
    workflowId: 'wf-mock-5',
    workflowCode: 'WF9Z3R7L',
    plateNumber: 'KLM 7890',
    customerName: 'Nurul Ain',
    completedDate: '18 Mar 2026',
    revenue: 2160.00,
    actualCost: 1350.00,
    grossProfit: 810.00,
    profitMargin: 37.5,
    partCount: 4,
    parts: [
      { name: 'Headlight Assembly', qty: 2, quotedPrice: 912.00,  actualCost: 760.00 },
      { name: 'Bumper (Front)',      qty: 1, quotedPrice: 720.00,  actualCost: 450.00 },
      { name: 'Wiper Blade (Set)',   qty: 1, quotedPrice: 192.00,  actualCost: 65.00  },
      { name: 'Brake Fluid',        qty: 2, quotedPrice: 168.00,  actualCost: 37.50  },
    ],
  },
  {
    workflowId: 'wf-mock-6',
    workflowCode: 'WF5M2Q9H',
    plateNumber: 'PQR 0011',
    customerName: 'Azman Yusof',
    completedDate: '1 Apr 2026',
    revenue: 960.00,
    actualCost: 640.00,
    grossProfit: 320.00,
    profitMargin: 33.3,
    partCount: 2,
    parts: [
      { name: 'Shock Absorber (Front)', qty: 2, quotedPrice: 672.00, actualCost: 548.00 },
      { name: 'Coil Spring',            qty: 2, quotedPrice: 288.00, actualCost: 92.00  },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function marginTextColor(m: number) {
  if (m >= 50) return 'text-green-700';
  if (m >= 30) return 'text-amber-600';
  return 'text-red-600';
}

function marginBadge(m: number) {
  if (m >= 50) return 'bg-green-100 text-green-800';
  if (m >= 30) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

function MarginIcon({ m }: { m: number }) {
  if (m >= 50) return <TrendingUp className="w-4 h-4 text-green-600" />;
  if (m >= 30) return <Minus className="w-4 h-4 text-amber-600" />;
  return <TrendingDown className="w-4 h-4 text-red-600" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-workflow row (expandable)
// ─────────────────────────────────────────────────────────────────────────────
function WorkflowRow({ data }: { data: WorkflowProfit }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
        onClick={() => setExpanded(v => !v)}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-semibold text-gray-900">{data.plateNumber}</div>
          <div className="text-xs text-gray-400 font-mono">{data.workflowCode}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{data.customerName}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.completedDate}</td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-indigo-700">
          RM {data.revenue.toFixed(2)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-700">
          RM {data.actualCost.toFixed(2)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
          <span className={marginTextColor(data.profitMargin)}>RM {data.grossProfit.toFixed(2)}</span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${marginBadge(data.profitMargin)}`}>
            <MarginIcon m={data.profitMargin} />
            {data.profitMargin.toFixed(1)}%
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-400">
          {expanded ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
        </td>
      </tr>

      {/* Part breakdown */}
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={8} className="px-6 py-0">
            <div className="py-3 pl-4 border-l-4 border-indigo-300">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <th className="pb-2 text-left pr-4">Part</th>
                    <th className="pb-2 text-center pr-4">Qty</th>
                    <th className="pb-2 text-right pr-4">Quoted (per unit)</th>
                    <th className="pb-2 text-right pr-4">Actual Cost (per unit)</th>
                    <th className="pb-2 text-right pr-4">Part Profit</th>
                    <th className="pb-2 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.parts.map((part, i) => {
                    const partProfit = (part.quotedPrice - part.actualCost) * part.qty;
                    const partMargin = part.quotedPrice > 0 ? ((part.quotedPrice - part.actualCost) / part.quotedPrice) * 100 : 0;
                    return (
                      <tr key={i}>
                        <td className="py-2 pr-4 text-gray-800">{part.name}</td>
                        <td className="py-2 pr-4 text-center text-gray-500">{part.qty}</td>
                        <td className="py-2 pr-4 text-right text-indigo-700 font-medium">
                          RM {(part.quotedPrice * part.qty).toFixed(2)}
                        </td>
                        <td className="py-2 pr-4 text-right text-gray-700 font-medium">
                          RM {(part.actualCost * part.qty).toFixed(2)}
                        </td>
                        <td className={`py-2 pr-4 text-right font-semibold ${marginTextColor(partMargin)}`}>
                          RM {partProfit.toFixed(2)}
                        </td>
                        <td className={`py-2 text-right font-semibold ${marginTextColor(partMargin)}`}>
                          {partMargin.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ProfitCalculator component
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfitCalculator() {
  const totalRevenue  = mockProfitData.reduce((s, d) => s + d.revenue, 0);
  const totalCost     = mockProfitData.reduce((s, d) => s + d.actualCost, 0);
  const totalProfit   = mockProfitData.reduce((s, d) => s + d.grossProfit, 0);
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue',  value: `RM ${totalRevenue.toFixed(2)}`,  sub: 'Quoted to customers', color: 'text-indigo-700' },
          { label: 'Total Cost',     value: `RM ${totalCost.toFixed(2)}`,     sub: 'Actual bank payments', color: 'text-gray-900' },
          { label: 'Gross Profit',   value: `RM ${totalProfit.toFixed(2)}`,   sub: 'Revenue − Cost', color: 'text-green-700' },
          { label: 'Overall Margin', value: `${overallMargin.toFixed(1)}%`,   sub: '60% is the target', color: marginTextColor(overallMargin) },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-500 mb-1">{card.label}</div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-green-600" /> Margin ≥ 50% — On target</div>
        <div className="flex items-center gap-1.5"><Minus className="w-3.5 h-3.5 text-amber-500" /> Margin 30–49% — Below target</div>
        <div className="flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-red-500" /> Margin &lt; 30% — Needs review</div>
        {/* * Target: 60% profit margin is the workshop goal set in workflow step 10 (Mark Up) */}
      </div>

      {/* Main table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Profit by Workflow</h3>
          <p className="text-sm text-gray-500 mt-0.5">Click a row to view per-part breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate / Workflow</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Profit</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {mockProfitData
                .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
                .map(data => <WorkflowRow key={data.workflowId} data={data} />)
              }
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td colSpan={3} className="px-6 py-3 text-sm font-semibold text-gray-700">
                  Totals — {mockProfitData.length} workflows
                </td>
                <td className="px-6 py-3 text-right text-sm font-bold text-indigo-700">RM {totalRevenue.toFixed(2)}</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">RM {totalCost.toFixed(2)}</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-green-700">RM {totalProfit.toFixed(2)}</td>
                <td className="px-6 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${marginBadge(overallMargin)}`}>
                    <MarginIcon m={overallMargin} /> {overallMargin.toFixed(1)}%
                  </span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        {/* * Data join: profit calculator populates only when company expense record is marked 'completed' */}
        Only workflows with completed company expense records appear here.
        Revenue = quoted markup price (step 10). Cost = actual bank payment extracted from PDFs.
      </p>
    </div>
  );
}
