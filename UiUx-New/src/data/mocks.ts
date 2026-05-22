/* ─────────────────────────────────────────────────────────────────────────
   Mock data — content lifted verbatim from UiUx so the client sees
   exactly the same numbers / strings, just rendered in the new shell.
   ───────────────────────────────────────────────────────────────────────── */

import type { JobStatus, ModuleKey } from './workflow';

/* ─── Jobs ─── */

export interface Job {
  id: string;
  code: string;            // WF-2024-0001
  plate: string;
  customerName: string;
  carModel: string;
  status: JobStatus;
  currentStep: number;
  completedModules: ModuleKey[];     // for module progress derivation
  activeModule: ModuleKey;
  assignedTo: string;                // technician
  serviceAdvisor: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedTotal: number;            // RM
  hasQ2: boolean;
}

const day = 86_400_000;
const hour = 3_600_000;

export const JOBS: Job[] = [
  { id: 'wf-1', code: 'WF-2024-0001', plate: 'WXY 1234', customerName: 'Ahmad bin Abdullah', carModel: 'Honda Civic 2020',
    status: 'diagnosis', currentStep: 7, completedModules: ['check-in','vehicle','communication'], activeModule: 'diagnosis',
    assignedTo: 'Mohd Rizal', serviceAdvisor: 'Sarah Lee',
    createdAt: new Date(Date.now() - day * 2), updatedAt: new Date(Date.now() - hour * 1), estimatedTotal: 2700, hasQ2: false },

  { id: 'wf-2', code: 'WF-2024-0002', plate: 'ABC 5678', customerName: 'Sarah Lee', carModel: 'Toyota Vios 2019',
    status: 'awaiting', currentStep: 10, completedModules: ['check-in','vehicle','communication','diagnosis','estimate'], activeModule: 'authorization',
    assignedTo: 'Kumar Wong', serviceAdvisor: 'Sarah Lee',
    createdAt: new Date(Date.now() - day * 3), updatedAt: new Date(Date.now() - hour * 4), estimatedTotal: 1450, hasQ2: false },

  { id: 'wf-3', code: 'WF-2024-0003', plate: 'JKL 9012', customerName: 'Raj Kumar', carModel: 'Perodua Myvi 2021',
    status: 'repair', currentStep: 14, completedModules: ['check-in','vehicle','communication','diagnosis','estimate','authorization'], activeModule: 'repair',
    assignedTo: 'Ahmad Hassan', serviceAdvisor: 'Sarah Lee',
    createdAt: new Date(Date.now() - day * 5), updatedAt: new Date(Date.now() - hour * 2), estimatedTotal: 3892, hasQ2: true },

  { id: 'wf-4', code: 'WF-2024-0004', plate: 'PQR 4567', customerName: 'Lim Tan Wei', carModel: 'Proton X70 2022',
    status: 'qc', currentStep: 16, completedModules: ['check-in','vehicle','communication','diagnosis','estimate','authorization','repair'], activeModule: 'repair',
    assignedTo: 'Mohd Rizal', serviceAdvisor: 'Sarah Lee',
    createdAt: new Date(Date.now() - day * 6), updatedAt: new Date(Date.now() - hour * 6), estimatedTotal: 4210, hasQ2: false },

  { id: 'wf-5', code: 'WF-2024-0005', plate: 'DEF 8765', customerName: 'Nurul Aisha', carModel: 'Mazda CX-5 2020',
    status: 'ready', currentStep: 18, completedModules: ['check-in','vehicle','communication','diagnosis','estimate','authorization','repair'], activeModule: 'close-out',
    assignedTo: 'Kumar Wong', serviceAdvisor: 'Sarah Lee',
    createdAt: new Date(Date.now() - day * 7), updatedAt: new Date(Date.now() - day * 1), estimatedTotal: 1850, hasQ2: false },

  { id: 'wf-6', code: 'WF-2024-0006', plate: 'GHI 3210', customerName: 'Tan Mei Ling', carModel: 'Honda HR-V 2021',
    status: 'intake', currentStep: 2, completedModules: ['check-in'], activeModule: 'vehicle',
    assignedTo: 'Ahmad Hassan', serviceAdvisor: 'Sarah Lee',
    createdAt: new Date(Date.now() - hour * 3), updatedAt: new Date(Date.now() - hour * 1), estimatedTotal: 0, hasQ2: false },

  { id: 'wf-7', code: 'WF-2024-0007', plate: 'MNO 5432', customerName: 'Krishnan Pillai', carModel: 'Toyota Hilux 2019',
    status: 'delivered', currentStep: 19, completedModules: ['check-in','vehicle','communication','diagnosis','estimate','authorization','repair','close-out'], activeModule: 'close-out',
    assignedTo: 'Mohd Rizal', serviceAdvisor: 'Sarah Lee',
    createdAt: new Date(Date.now() - day * 10), updatedAt: new Date(Date.now() - day * 2), estimatedTotal: 2200, hasQ2: false },
];

/* ─── Active job (for Repair Order page demo) ─── */
export const ACTIVE_JOB = JOBS[0];

export const WORKFLOW_CODE = ACTIVE_JOB.code;
export const PLATE_NUMBER  = ACTIVE_JOB.plate;
export const CHASSIS_NUMBER = 'MH1234567890';

/* ─── Part types ───────────────────────────────────────────────────────────
   Every part is purchasable as one of two grades. This ORI/OM split — and the
   warranty that comes with each — is the core concept of the Parts catalog.
   ─────────────────────────────────────────────────────────────────────────── */

export type PartType = 'ORI' | 'OM';

export const PART_TYPE_META: Record<PartType, {
  label: string; full: string; warranty: string; warrantyMonths: number; tone: 'accent' | 'warning';
}> = {
  ORI: { label: 'ORI', full: 'Original',           warranty: '1-year warranty',  warrantyMonths: 12, tone: 'accent'  },
  OM:  { label: 'OM',  full: 'Other Manufacturer', warranty: '6-month warranty', warrantyMonths: 6,  tone: 'warning' },
};

/* ─── Parts catalog ───────────────────────────────────────────────────────
   Each catalog part carries both an ORI price (genuine, 1-yr) and an OM price
   (aftermarket, 6-mo). OM runs ~60-75% of ORI.
   ─────────────────────────────────────────────────────────────────────────── */

export interface CatalogPart {
  id: string;
  name: string;
  oriPrice: number;
  omPrice: number;
}

export const PARTS_CATALOG: Record<string, CatalogPart[]> = {
  'Brake System': [
    { id: 'BP-F-001', name: 'Brake Pads (Front)', oriPrice: 150, omPrice: 105 },
    { id: 'BP-R-002', name: 'Brake Pads (Rear)',  oriPrice: 130, omPrice: 92  },
    { id: 'BD-F-003', name: 'Brake Disc (Front)', oriPrice: 280, omPrice: 190 },
    { id: 'BC-004',   name: 'Brake Caliper',      oriPrice: 320, omPrice: 225 },
  ],
  'Engine Parts': [
    { id: 'EO-5W30-4L', name: 'Engine Oil 5W-30 (4L)', oriPrice: 85,  omPrice: 62  },
    { id: 'OF-001',     name: 'Oil Filter',             oriPrice: 25,  omPrice: 16  },
    { id: 'AF-002',     name: 'Air Filter',             oriPrice: 45,  omPrice: 30  },
    { id: 'SP-003',     name: 'Spark Plugs (set of 4)', oriPrice: 120, omPrice: 84  },
  ],
  'Electrical': [
    { id: 'BAT-001', name: 'Car Battery (55Ah)',  oriPrice: 350, omPrice: 245 },
    { id: 'ALT-002', name: 'Alternator',          oriPrice: 480, omPrice: 330 },
    { id: 'FUS-003', name: 'Fuse Box Set',        oriPrice: 60,  omPrice: 40  },
  ],
  'AC System': [
    { id: 'ACF-001', name: 'AC Filter / Cabin Filter', oriPrice: 55,  omPrice: 36  },
    { id: 'ACG-002', name: 'AC Gas Refill (R134a)',    oriPrice: 120, omPrice: 88  },
    { id: 'ACP-003', name: 'AC Compressor',            oriPrice: 950, omPrice: 640 },
  ],
  'Suspension': [
    { id: 'SA-001', name: 'Shock Absorber (Front pair)', oriPrice: 420, omPrice: 290 },
    { id: 'CS-002', name: 'Coil Spring (Front)',         oriPrice: 180, omPrice: 125 },
    { id: 'BJ-003', name: 'Ball Joint',                  oriPrice: 95,  omPrice: 64  },
  ],
};

export const ALL_PARTS = Object.entries(PARTS_CATALOG).flatMap(([category, items]) =>
  items.map(p => ({ ...p, category })),
);

/* ─── Step 12 — Multi-Supplier Pricing Tool seed data (verbatim from UiUx) ─── */

export const SPO12_GRADES = ['ORI', 'OEM', 'USED', 'LABOUR'] as const;
export type Spo12Grade = (typeof SPO12_GRADES)[number];

export const SPO12_PARTS: { id: string; name: string }[] = [
  { id: 'crank-sensor',  name: 'Crank Sensor' },
  { id: 'ignition-coil', name: 'Ignition Coil' },
  { id: 'agm-battery',   name: 'AGM Battery 92AH' },
];

/* key = `${partId}_${grade}_${supplierId}` */
export const SPO12_INIT_COSTS: Record<string, string> = {
  'crank-sensor_ORI_suan-huat': '380', 'crank-sensor_ORI_stuttgart': '400', 'crank-sensor_ORI_bavaria': '420',
  'crank-sensor_OEM_suan-huat': '130', 'crank-sensor_OEM_stuttgart': '150', 'crank-sensor_OEM_bavaria': '160',
  'crank-sensor_LABOUR_suan-huat': '100', 'crank-sensor_LABOUR_stuttgart': '120', 'crank-sensor_LABOUR_bavaria': '110',
  'ignition-coil_ORI_suan-huat': '180', 'ignition-coil_ORI_stuttgart': '170', 'ignition-coil_ORI_bavaria': '195',
  'ignition-coil_OEM_suan-huat': '70',  'ignition-coil_OEM_stuttgart': '80',  'ignition-coil_OEM_bavaria': '75',
  'ignition-coil_USED_suan-huat': '40',
  'ignition-coil_LABOUR_suan-huat': '80', 'ignition-coil_LABOUR_stuttgart': '90', 'ignition-coil_LABOUR_bavaria': '85',
  'agm-battery_ORI_suan-huat': '1250', 'agm-battery_ORI_stuttgart': '1300', 'agm-battery_ORI_bavaria': '1280',
  'agm-battery_LABOUR_suan-huat': '50', 'agm-battery_LABOUR_stuttgart': '60', 'agm-battery_LABOUR_bavaria': '55',
};

/* key = `${partId}_${grade}` → supplierId chosen to charge */
export const SPO12_INIT_CHARGE: Record<string, string> = {
  'crank-sensor_ORI': 'suan-huat',  'crank-sensor_LABOUR': 'suan-huat',
  'ignition-coil_ORI': 'stuttgart', 'ignition-coil_LABOUR': 'suan-huat',
  'agm-battery_ORI': 'suan-huat',   'agm-battery_LABOUR': 'suan-huat',
};

export const SPO12_INIT_CHARGE_AMT: Record<string, string> = {
  'crank-sensor_ORI': '589',  'crank-sensor_LABOUR': '100',
  'ignition-coil_ORI': '620', 'ignition-coil_LABOUR': '80',
  'agm-battery_ORI': '1938',  'agm-battery_LABOUR': '50',
};

/* ─── Suppliers (verbatim) ─── */

export const SUPPLIERS = [
  { id: 'suan-huat',  name: 'Suan Huat',      color: '#4F7CFF' },
  { id: 'stuttgart',  name: 'Stuttgart',      color: '#2D8654' },
  { id: 'bavaria',    name: 'Bavaria',        color: '#6B3FA0' },
  { id: 'ramon',      name: 'Ramon',          color: '#B86E00' },
  { id: 'ba-auto',    name: 'BA Auto',        color: '#C03A2B' },
  { id: 'other',      name: 'Other Supplier', color: '#5C5C5C' },
];

/* ─── Selected parts on active job (for Estimate module) ─── */

export const ACTIVE_PARTS = [
  { id: 'BP-F-001',  name: 'Brake Pads (Front)',     qty: 1, supplierPrice: 150,  markupPrice: 375  },
  { id: 'EO-5W30-4L',name: 'Engine Oil 5W-30 (4L)',  qty: 1, supplierPrice: 85,   markupPrice: 240  },
  { id: 'AF-002',    name: 'Air Filter',             qty: 1, supplierPrice: 45,   markupPrice: 130  },
  { id: 'ACG-002',   name: 'AC Gas Refill (R134a)',  qty: 1, supplierPrice: 120,  markupPrice: 320  },
  { id: 'OF-001',    name: 'Oil Filter',             qty: 1, supplierPrice: 25,   markupPrice: 80   },
];

/* ─── Customers list (Parts module / customer search) ─── */

export const CUSTOMERS = [
  { name: 'Ahmad bin Abdullah', phone: '+60 12-345 6789', email: 'ahmad@example.com',  visits: 4 },
  { name: 'Sarah Lee',          phone: '+60 17-998 1234', email: 'sarah.l@example.com', visits: 2 },
  { name: 'Raj Kumar',          phone: '+60 13-665 0098', email: 'raj@example.com',     visits: 7 },
  { name: 'Lim Tan Wei',        phone: '+60 16-220 7741', email: 'limtw@example.com',   visits: 1 },
  { name: 'Nurul Aisha',        phone: '+60 11-301 5566', email: 'nurul@example.com',   visits: 3 },
];

/* ─── Notifications ─── */

export const NOTIFICATIONS = [
  { id: 'n1', title: 'WF-2024-0002 parts approved',  body: 'Sarah Lee approved RM 1,450 quotation',  time: new Date(Date.now() - hour),       priority: 'high' as const,   read: false },
  { id: 'n2', title: 'WF-2024-0004 ready for QC',    body: 'Lim Tan Wei · Proton X70',               time: new Date(Date.now() - hour * 3),   priority: 'medium' as const, read: false },
  { id: 'n3', title: 'Parts arrived: Stuttgart',     body: 'Brake pads x4 for WF-2024-0003',         time: new Date(Date.now() - hour * 5),   priority: 'low' as const,    read: false },
  { id: 'n4', title: 'WF-2024-0005 awaiting pickup', body: 'Nurul Aisha · Mazda CX-5',               time: new Date(Date.now() - day),        priority: 'medium' as const, read: true },
];

/* ─── Activity log (for repair order right pane) ─── */

export const ACTIVITY = [
  { id: 'a1', who: 'Sarah Lee',   action: 'sent quotation to customer',     time: new Date(Date.now() - hour) },
  { id: 'a2', who: 'Mohd Rizal',  action: 'completed troubleshooting',      time: new Date(Date.now() - hour * 2) },
  { id: 'a3', who: 'Mohd Rizal',  action: 'uploaded 4 vehicle photos',      time: new Date(Date.now() - hour * 3) },
  { id: 'a4', who: 'Sarah Lee',   action: 'created WhatsApp group',         time: new Date(Date.now() - hour * 4) },
  { id: 'a5', who: 'Ahmad Hassan',action: 'created workflow WF-2024-0001',  time: new Date(Date.now() - hour * 5) },
];
