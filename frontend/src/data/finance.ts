/* ─────────────────────────────────────────────────────────────────────────
   Finance mock data — ported verbatim from UiUx.
   Three areas: Company Expenses, Personal Expenses, Profit Calculator.
   ───────────────────────────────────────────────────────────────────────── */

import type { PartType } from './mocks';

/* ─── Company Expenses ─── */

export type ExpenseStatus = 'in_progress' | 'completed';
export type PdfStatus = 'pending' | 'processing' | 'extracted';

export interface CompanyExpensePart {
  id: string;
  partName: string;
  partType: PartType;
  quantity: number;
  pdfStatus: PdfStatus;
  extractedAmount?: number;
  isManuallyEdited?: boolean;
}

export interface CompanyExpenseRecord {
  id: string;
  workflowId: string;
  plateNumber: string;
  workflowCode: string;
  customerName: string;
  status: ExpenseStatus;
  createdAt: Date;
  parts: CompanyExpensePart[];
}

export const COMPANY_EXPENSES: CompanyExpenseRecord[] = [
  {
    id: 'ce1', workflowId: 'wf-1', plateNumber: 'WXY 1234', workflowCode: 'WF-2024-0001',
    customerName: 'Ahmad bin Abdullah', status: 'in_progress', createdAt: new Date('2026-04-01'),
    parts: [
      { id: 'cep1', partName: 'Brake Pads (Front)', partType: 'ORI', quantity: 1, pdfStatus: 'extracted', extractedAmount: 152.00 },
      { id: 'cep2', partName: 'Brake Disc (Front)',  partType: 'ORI', quantity: 1, pdfStatus: 'extracted', extractedAmount: 318.00, isManuallyEdited: true },
      { id: 'cep3', partName: 'Brake Fluid',         partType: 'OM',  quantity: 2, pdfStatus: 'pending' },
    ],
  },
  {
    id: 'ce2', workflowId: 'wf-2', plateNumber: 'ABC 5678', workflowCode: 'WF-2024-0002',
    customerName: 'Sarah Lee', status: 'completed', createdAt: new Date('2026-03-28'),
    parts: [
      { id: 'cep4', partName: 'Engine Oil Filter',      partType: 'ORI', quantity: 1, pdfStatus: 'extracted', extractedAmount: 43.00 },
      { id: 'cep5', partName: 'Air Filter',             partType: 'OM',  quantity: 1, pdfStatus: 'extracted', extractedAmount: 36.50 },
      { id: 'cep6', partName: 'Spark Plugs (Set of 4)', partType: 'ORI', quantity: 1, pdfStatus: 'extracted', extractedAmount: 118.00 },
    ],
  },
  {
    id: 'ce3', workflowId: 'wf-3', plateNumber: 'JKL 9012', workflowCode: 'WF-2024-0003',
    customerName: 'Raj Kumar', status: 'in_progress', createdAt: new Date('2026-04-04'),
    parts: [
      { id: 'cep7', partName: 'Shock Absorber (Front)', partType: 'ORI', quantity: 2, pdfStatus: 'pending' },
      { id: 'cep8', partName: 'Coil Spring',            partType: 'ORI', quantity: 2, pdfStatus: 'pending' },
    ],
  },
];

/* mock amounts a "PDF parser" would return for known part names */
export const MOCK_EXTRACTED: Record<string, number> = {
  'Shock Absorber (Front)': 274.00,
  'Coil Spring':            158.00,
  'Brake Fluid':             33.00,
};

export const extractAmount = (partName: string): number =>
  MOCK_EXTRACTED[partName] ?? Math.round((Math.random() * 200 + 50) * 100) / 100;

/* ─── Personal Expenses ─── */

export type PersonalCategory =
  | 'fuel_transport'
  | 'utilities'
  | 'meals_entertainment'
  | 'office_stationery'
  | 'training_development'
  | 'marketing_advertising'
  | 'equipment_maintenance'
  | 'others';

export const CATEGORY_LABELS: Record<PersonalCategory, string> = {
  fuel_transport:        'Fuel & Transport',
  utilities:             'Utilities',
  meals_entertainment:   'Meals & Entertainment',
  office_stationery:     'Office & Stationery',
  training_development:  'Training & Development',
  marketing_advertising: 'Marketing & Advertising',
  equipment_maintenance: 'Equipment & Maintenance',
  others:                'Others',
};

export const REAL_CATEGORIES = (Object.keys(CATEGORY_LABELS) as PersonalCategory[])
  .filter(c => c !== 'others');

/* ─── Profit Calculator ─── */

export interface ProfitPart {
  name: string;
  qty: number;
  quotedPrice: number;   // markup price per unit
  actualCost: number;    // bank-slip cost per unit
}

export interface WorkflowProfit {
  workflowId: string;
  workflowCode: string;
  plateNumber: string;
  customerName: string;
  completedDate: string;
  revenue: number;
  actualCost: number;
  grossProfit: number;
  profitMargin: number;
  parts: ProfitPart[];
}

export const PROFIT_DATA: WorkflowProfit[] = [
  {
    workflowId: 'wf-2', workflowCode: 'WF-2024-0002', plateNumber: 'ABC 5678',
    customerName: 'Sarah Lee', completedDate: '31 Mar 2026',
    revenue: 317.60, actualCost: 197.50, grossProfit: 120.10, profitMargin: 37.8,
    parts: [
      { name: 'Engine Oil Filter',      qty: 1, quotedPrice: 68.80,  actualCost: 43.00  },
      { name: 'Air Filter',             qty: 1, quotedPrice: 58.40,  actualCost: 36.50  },
      { name: 'Spark Plugs (Set of 4)', qty: 1, quotedPrice: 190.40, actualCost: 118.00 },
    ],
  },
  {
    workflowId: 'wf-4', workflowCode: 'WF-2024-0004', plateNumber: 'PQR 4567',
    customerName: 'Lim Tan Wei', completedDate: '25 Mar 2026',
    revenue: 1248.00, actualCost: 528.00, grossProfit: 720.00, profitMargin: 57.7,
    parts: [
      { name: 'Battery (DIN65)', qty: 1, quotedPrice: 448.00, actualCost: 280.00 },
      { name: 'Alternator',      qty: 1, quotedPrice: 800.00, actualCost: 248.00 },
    ],
  },
  {
    workflowId: 'wf-5', workflowCode: 'WF-2024-0005', plateNumber: 'DEF 8765',
    customerName: 'Nurul Aisha', completedDate: '18 Mar 2026',
    revenue: 2160.00, actualCost: 1350.00, grossProfit: 810.00, profitMargin: 37.5,
    parts: [
      { name: 'Headlight Assembly', qty: 2, quotedPrice: 912.00, actualCost: 760.00 },
      { name: 'Bumper (Front)',     qty: 1, quotedPrice: 720.00, actualCost: 450.00 },
      { name: 'Wiper Blade (Set)',  qty: 1, quotedPrice: 192.00, actualCost: 65.00  },
      { name: 'Brake Fluid',        qty: 2, quotedPrice: 168.00, actualCost: 37.50  },
    ],
  },
  {
    workflowId: 'wf-6', workflowCode: 'WF-2024-0006', plateNumber: 'GHI 3210',
    customerName: 'Tan Mei Ling', completedDate: '01 Apr 2026',
    revenue: 960.00, actualCost: 640.00, grossProfit: 320.00, profitMargin: 33.3,
    parts: [
      { name: 'Shock Absorber (Front)', qty: 2, quotedPrice: 672.00, actualCost: 548.00 },
      { name: 'Coil Spring',            qty: 2, quotedPrice: 288.00, actualCost: 92.00  },
    ],
  },
];
