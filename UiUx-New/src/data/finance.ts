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
  | 'category_1' | 'category_2' | 'category_3' | 'category_4'
  | 'category_5' | 'category_6' | 'category_7' | 'others';

export const CATEGORY_LABELS: Record<PersonalCategory, string> = {
  category_1: 'Category 1',
  category_2: 'Category 2',
  category_3: 'Category 3',
  category_4: 'Category 4',
  category_5: 'Category 5',
  category_6: 'Category 6',
  category_7: 'Category 7',
  others:     'Others',
};

export const REAL_CATEGORIES = (Object.keys(CATEGORY_LABELS) as PersonalCategory[])
  .filter(c => c !== 'others');

export interface PersonalTransaction {
  id: string;
  adminId: '1' | '2';
  adminName: string;
  description: string;
  amount: number;
  category: PersonalCategory;
  isOthers: boolean;
  isRecategorized: boolean;
  date: Date;
}

export const PERSONAL_EXPENSES: PersonalTransaction[] = [
  { id: 'pe1',  adminId: '1', adminName: 'Admin 1', description: 'Monthly internet subscription - category_3',      amount: 129.00, category: 'category_3', isOthers: false, isRecategorized: false, date: new Date('2026-04-01') },
  { id: 'pe2',  adminId: '1', adminName: 'Admin 1', description: 'Petrol reimbursement - category_1',               amount: 210.00, category: 'category_1', isOthers: false, isRecategorized: false, date: new Date('2026-04-02') },
  { id: 'pe3',  adminId: '1', adminName: 'Admin 1', description: 'Office stationery purchase',                      amount: 85.50,  category: 'others',     isOthers: true,  isRecategorized: false, date: new Date('2026-04-03') },
  { id: 'pe4',  adminId: '1', adminName: 'Admin 1', description: 'Team lunch - category_5',                         amount: 310.00, category: 'category_5', isOthers: false, isRecategorized: false, date: new Date('2026-04-04') },
  { id: 'pe5',  adminId: '1', adminName: 'Admin 1', description: 'Workshop equipment maintenance - category_2',     amount: 450.00, category: 'category_2', isOthers: false, isRecategorized: false, date: new Date('2026-03-28') },
  { id: 'pe6',  adminId: '1', adminName: 'Admin 1', description: 'Staff welfare expenses',                          amount: 175.00, category: 'others',     isOthers: true,  isRecategorized: false, date: new Date('2026-03-25') },
  { id: 'pe7',  adminId: '1', adminName: 'Admin 1', description: 'Vehicle insurance renewal - category_4',          amount: 890.00, category: 'category_4', isOthers: false, isRecategorized: false, date: new Date('2026-03-20') },
  { id: 'pe8',  adminId: '2', adminName: 'Admin 2', description: 'Marketing campaign ads - category_6',             amount: 620.00, category: 'category_6', isOthers: false, isRecategorized: false, date: new Date('2026-04-01') },
  { id: 'pe9',  adminId: '2', adminName: 'Admin 2', description: 'Software subscription renewal - category_3',      amount: 299.00, category: 'category_3', isOthers: false, isRecategorized: false, date: new Date('2026-04-02') },
  { id: 'pe10', adminId: '2', adminName: 'Admin 2', description: 'Courier charges for client docs',                 amount: 45.00,  category: 'others',     isOthers: true,  isRecategorized: false, date: new Date('2026-04-03') },
  { id: 'pe11', adminId: '2', adminName: 'Admin 2', description: 'Client entertainment - category_5',               amount: 530.00, category: 'category_5', isOthers: false, isRecategorized: false, date: new Date('2026-03-30') },
  { id: 'pe12', adminId: '2', adminName: 'Admin 2', description: 'Training material - category_7',                  amount: 180.00, category: 'category_7', isOthers: false, isRecategorized: false, date: new Date('2026-03-22') },
  { id: 'pe13', adminId: '2', adminName: 'Admin 2', description: 'Cleaning supplies and consumables - category_2',  amount: 92.00,  category: 'category_2', isOthers: false, isRecategorized: false, date: new Date('2026-03-18') },
];

export const MOCK_BANK_ROWS = [
  { desc: 'Workshop tools purchase - category_2',     amount: 340.00 },
  { desc: 'Monthly phone bill payment - category_3',  amount: 88.00  },
  { desc: 'Client meeting expenses',                   amount: 215.50 },
  { desc: 'Training workshop fee - category_7',        amount: 450.00 },
  { desc: 'Printing and stationery supplies',          amount: 67.00  },
];

export const detectCategory = (description: string): PersonalCategory => {
  const lower = description.toLowerCase();
  for (const cat of REAL_CATEGORIES) if (lower.includes(cat)) return cat;
  return 'others';
};

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
