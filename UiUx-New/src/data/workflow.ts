/* ─────────────────────────────────────────────────────────────────────────
   The 19-step workflow definition (verbatim from UiUx) + the 8-module
   grouping that's used in the UI. Status pipeline is derived from
   module-completion state.
   ───────────────────────────────────────────────────────────────────────── */

export interface Step {
  number: number;
  name: string;
  description: string;
  roles: string[];
  estMinutes: number;
}

export const STEPS: Step[] = [
  { number: 1,  name: 'Create Workflow',           description: 'Plate number entry, generate workflow code',     roles: ['admin', 'sa', 'bay'],  estMinutes: 5  },
  { number: 2,  name: 'Inspection Sheet',          description: 'Receive complaints, get approval',                roles: ['bay'],                  estMinutes: 10 },
  { number: 3,  name: 'WhatsApp Group',            description: 'Create communication channel with customer',      roles: ['sa'],                   estMinutes: 5  },
  { number: 4,  name: 'Vehicle Photos',            description: 'Photograph car body and chassis number',          roles: ['bay'],                  estMinutes: 10 },
  { number: 5,  name: 'Update Customer Details',   description: 'Enter customer information',                      roles: ['admin', 'sa'],          estMinutes: 5  },
  { number: 6,  name: 'Troubleshooting',           description: 'Diagnose issues, document findings',              roles: ['bay'],                  estMinutes: 30 },
  { number: 7,  name: 'Spare Parts Needed',        description: 'List required parts and quantities',              roles: ['bay'],                  estMinutes: 15 },
  { number: 8,  name: 'Spare Part Price',          description: 'Get supplier prices and availability',            roles: ['admin', 'management'],  estMinutes: 30 },
  { number: 9,  name: 'Mark Up',                   description: 'Calculate pricing with 60% margin',               roles: ['admin', 'management'],  estMinutes: 10 },
  { number: 10, name: 'Spare Part Confirmation',   description: 'Customer confirms quotation',                     roles: ['sa'],                   estMinutes: 30 },
  { number: 11, name: 'Quotation',                 description: 'Generate PDF quotation',                          roles: ['admin'],                estMinutes: 10 },
  { number: 12, name: 'Spare Part Order',          description: 'Place orders with selected suppliers',            roles: ['admin'],                estMinutes: 15 },
  { number: 13, name: 'Spare Parts Received',      description: 'Confirm parts received in workshop',              roles: ['bay'],                  estMinutes: 10 },
  { number: 14, name: 'Work Progress Photos',      description: 'Photograph repair progress',                      roles: ['bay'],                  estMinutes: 10 },
  { number: 15, name: 'Work Complete',             description: 'Mark all repair work as completed',               roles: ['bay'],                  estMinutes: 5  },
  { number: 16, name: 'Quality Control',           description: 'QC inspection and sign-off',                      roles: ['management'],           estMinutes: 15 },
  { number: 17, name: 'Car Wash',                  description: 'Final wash and detailing',                        roles: ['bay'],                  estMinutes: 20 },
  { number: 18, name: 'Send Receipt',              description: 'Generate and send invoice to customer',           roles: ['admin'],                estMinutes: 5  },
  { number: 19, name: 'Receive Payment',           description: 'Record customer payment',                         roles: ['admin'],                estMinutes: 10 },
];

/* ─── 8 modules — the new UX surface ─── */

export type ModuleKey =
  | 'check-in' | 'vehicle' | 'communication' | 'diagnosis'
  | 'estimate' | 'authorization' | 'repair' | 'close-out';

export interface Module {
  key: ModuleKey;
  name: string;
  description: string;
  steps: number[];      // step numbers this module contains
  icon: string;         // lucide icon name
}

export const MODULES: Module[] = [
  { key: 'check-in',      name: 'Check-in',           description: 'Customer & vehicle intake',         steps: [1, 2, 5],          icon: 'ClipboardCheck' },
  { key: 'vehicle',       name: 'Vehicle',            description: 'Body photos & chassis verification',steps: [4],                icon: 'Car'            },
  { key: 'communication', name: 'Communication',      description: 'WhatsApp group & customer comms',   steps: [3],                icon: 'MessageSquare'  },
  { key: 'diagnosis',     name: 'Diagnosis',          description: 'Troubleshooting & parts needed',    steps: [6, 7],             icon: 'Search'         },
  { key: 'estimate',      name: 'Estimate',           description: 'Pricing, markup, quotation PDF',    steps: [8, 9, 11],         icon: 'Calculator'     },
  { key: 'authorization', name: 'Authorization',      description: 'Customer approval flow',            steps: [10],               icon: 'BadgeCheck'     },
  { key: 'repair',        name: 'Parts & Repair',     description: 'Order, fit, document, QC',          steps: [12, 13, 14, 15, 16], icon: 'Wrench'       },
  { key: 'close-out',     name: 'Close-out',          description: 'Wash, invoice, payment',            steps: [17, 18, 19],       icon: 'CheckCheck'     },
];

/* ─── Status pipeline — derived from module completion ─── */

export type JobStatus = 'intake' | 'diagnosis' | 'awaiting' | 'repair' | 'qc' | 'ready' | 'delivered';

export const STATUS_FLOW: { key: JobStatus; label: string; tone: 'intake' | 'diagnosis' | 'warning' | 'repair' | 'qc' | 'ready' | 'success' }[] = [
  { key: 'intake',    label: 'Intake',            tone: 'intake'    },
  { key: 'diagnosis', label: 'Diagnosis',         tone: 'diagnosis' },
  { key: 'awaiting',  label: 'Awaiting Approval', tone: 'warning'   },
  { key: 'repair',    label: 'In Repair',         tone: 'repair'    },
  { key: 'qc',        label: 'QC',                tone: 'qc'        },
  { key: 'ready',     label: 'Ready',             tone: 'ready'     },
  { key: 'delivered', label: 'Delivered',         tone: 'success'   },
];

export const STATUS_LABEL: Record<JobStatus, string> = Object.fromEntries(
  STATUS_FLOW.map(s => [s.key, s.label]),
) as Record<JobStatus, string>;

export const STATUS_TONE: Record<JobStatus, string> = Object.fromEntries(
  STATUS_FLOW.map(s => [s.key, s.tone]),
) as Record<JobStatus, string>;

export const STATUS_META: Record<JobStatus, { label: string; tone: string }> = Object.fromEntries(
  STATUS_FLOW.map(s => [s.key, { label: s.label, tone: s.tone }]),
) as Record<JobStatus, { label: string; tone: string }>;
