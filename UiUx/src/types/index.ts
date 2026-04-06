export enum Role {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  ADMIN2 = 'admin2',
  MANAGEMENT = 'management',
  BAY = 'bay',
  SA = 'sa'
}

// ─── Finance: Company Expenses ────────────────────────────────────────────────

export type CompanyExpenseStatus = 'in_progress' | 'completed';

export interface CompanyExpensePart {
  id: string;
  partName: string;
  partType: 'ORI' | 'OM';
  quantity: number;
  // * PDF extraction: integrate real PDF parser here (e.g., pdf-parse / AWS Textract)
  pdfStatus: 'pending' | 'processing' | 'extracted';
  extractedAmount?: number;      // amount pulled from bank slip PDF
  isManuallyEdited?: boolean;    // true if admin overrode the extracted value
}

export interface CompanyExpenseRecord {
  id: string;
  workflowId: string;
  plateNumber: string;
  workflowCode: string;
  customerName?: string;
  parts: CompanyExpensePart[];
  status: CompanyExpenseStatus;
  createdAt: Date;
}

// ─── Finance: Personal Expenses ───────────────────────────────────────────────

// * Category names: replace CATEGORY_1–7 with actual business category names
export type PersonalExpenseCategory =
  | 'category_1'
  | 'category_2'
  | 'category_3'
  | 'category_4'
  | 'category_5'
  | 'category_6'
  | 'category_7'
  | 'others';

export const PERSONAL_EXPENSE_CATEGORY_LABELS: Record<PersonalExpenseCategory, string> = {
  category_1: 'Category 1', // * Replace with actual name
  category_2: 'Category 2', // * Replace with actual name
  category_3: 'Category 3', // * Replace with actual name
  category_4: 'Category 4', // * Replace with actual name
  category_5: 'Category 5', // * Replace with actual name
  category_6: 'Category 6', // * Replace with actual name
  category_7: 'Category 7', // * Replace with actual name
  others: 'Others',
};

export interface PersonalExpenseTransaction {
  id: string;
  adminId: string;        // '1' = Admin 1, '2' = Admin 2
  adminName: string;
  description: string;   // extracted from PDF description field
  amount: number;
  category: PersonalExpenseCategory;
  isOthers: boolean;     // true if auto-categorized as 'others'
  isRecategorized: boolean; // true after admin manually fixed an 'others' entry
  date: Date;
  // * PDF extraction: replace mock timeout with real bank-statement parser
  pdfStatus: 'pending' | 'processing' | 'extracted';
}

export enum WorkflowStatus {
  PENDING = 'PENDING',
  TROUBLESHOOTING = 'TROUBLESHOOTING',
  WORK_PROGRESS = 'WORK_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum StepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum PhotoType {
  BODY = 'BODY',
  CHASSIS = 'CHASSIS',
  AFTER_REMOVAL = 'AFTER_REMOVAL',
  OLD_PART = 'OLD_PART',
  NEW_PART = 'NEW_PART',
  AFTER_FIXED = 'AFTER_FIXED'
}

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  phone?: string;
}

export interface WorkflowDetails {
  customerName?: string;
  contactNumber?: string;
  carModel?: string;
  mileage?: number;
  chassisNumber?: string;
  whatsappGroupLink?: string;
}

export interface Workflow {
  id: string;
  uniqueCode: string;
  plateNumber: string;
  status: WorkflowStatus;
  currentStep: number;
  details: WorkflowDetails;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface WorkflowStep {
  id: string;
  workflowId: string;
  stepNumber: number;
  stepName: string;
  status: StepStatus;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
}

export interface PartsCategory {
  id: string;
  name: string;
  description?: string;
}

export type PartType = 'ORI' | 'OM';

export interface Part {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  isActive: boolean;
  price: number;
  partType: PartType;
}

export interface WorkflowPart {
  id: string;
  workflowId: string;
  partId: string;
  partName: string;
  categoryName: string;
  partType: PartType;
  warranty: string;
  cataloguePrice: number;
  quantity: number;
  supplierPrice?: number;
  markupPrice?: number;
  profitMargin?: number;
  confirmed: boolean;
  confirmedAt?: Date;
}

export interface Photo {
  id: string;
  workflowId: string;
  stepNumber: number;
  photoType: PhotoType;
  partId?: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Notification {
  id: string;
  workflowId: string;
  userId?: string;
  role?: Role;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
}

export interface Document {
  id: string;
  workflowId: string;
  documentType: 'QUOTATION' | 'RECEIPT' | 'SUMMARY';
  filePath: string;
  googleFormUrl?: string;
  createdBy: string;
  createdAt: Date;
}

export interface SupplierMessage {
  id: string;
  workflowId: string;
  messageText: string;
  createdBy: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  workflowId: string;
  userId: string;
  userName: string;
  action: string;
  details?: any;
  createdAt: Date;
}

export const WORKFLOW_STEPS = [
  { number: 1, name: 'Create Workflow', description: 'Car arrives, plate number entry' },
  { number: 2, name: 'Inspection Sheet', description: 'Receive complaints, get approval' },
  { number: 3, name: 'WhatsApp Group', description: 'Create communication channel' },
  { number: 4, name: 'Car Body Photo', description: 'Photograph entire car body' },
  { number: 5, name: 'Chassis Number Photo', description: 'Photograph chassis number' },
  { number: 6, name: 'Update Customer Details', description: 'Enter customer information' },
  { number: 7, name: 'Troubleshooting', description: 'Diagnose issues' },
  { number: 8, name: 'Spare Parts Needed', description: 'Select required parts' },
  { number: 9, name: 'Spare Part Price/Availability', description: 'Get supplier prices' },
  { number: 10, name: 'Mark Up', description: 'Calculate pricing with 60% margin' },
  { number: 11, name: 'Spare Part Confirmation', description: 'Customer confirms parts' },
  { number: 12, name: 'Quotation', description: 'Generate PDF quotation' },
  { number: 13, name: 'Spare Part Order', description: 'Order from suppliers' },
  { number: 14, name: 'Spare Parts in Workshop', description: 'Confirm parts received' },
  { number: 15, name: 'Work Progress Photos', description: 'Upload work progress photos' },
  { number: 16, name: 'QC (Quality Control)', description: 'Quality inspection' },
  { number: 17, name: 'Car Wash', description: 'Clean vehicle' },
  { number: 18, name: 'Send Receipt', description: 'Send receipt to customer' },
  { number: 19, name: 'Receive Payment', description: 'Confirm payment' },
  { number: 20, name: 'Car Delivery', description: 'Vehicle delivery' }
];

// Detailed step information with roles and actions
export interface StepDetail {
  number: number;
  name: string;
  description: string;
  roles: Role[];
  actions: string[];
  mockData?: string[];
}

export const DETAILED_WORKFLOW_STEPS: StepDetail[] = [
  {
    number: 1,
    name: 'Create Workflow',
    description: 'Car arrives, plate number entry',
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.SA, Role.BAY],
    actions: ['Enter plate number', 'Generate unique workflow code', 'Initial vehicle check-in'],
    mockData: ['Plate: WXY 1234', 'Code: WF-2024-0001', 'Date: 03/02/2026']
  },
  {
    number: 2,
    name: 'Inspection Sheet',
    description: 'Receive complaints, get approval',
    roles: [Role.SUPERADMIN, Role.BAY],
    actions: ['Fill inspection checklist', 'Document vehicle condition', 'Note existing damages'],
    mockData: ['Mileage: 45,230 km', 'Fuel Level: 3/4', 'Tire Condition: Good']
  },
  {
    number: 3,
    name: 'WhatsApp Group',
    description: 'Create communication channel',
    roles: [Role.SUPERADMIN, Role.SA],
    actions: ['Create customer WhatsApp group', 'Add workshop team', 'Send welcome message'],
    mockData: ['Group: WF-2024-0001 - Ahmad Honda', 'Members: 4', 'Status: Active']
  },
  {
    number: 4,
    name: 'Vehicle Photos',
    description: 'Photograph car body and chassis number',
    roles: [Role.SUPERADMIN, Role.BAY],
    actions: ['Take front, back, left, right photos', 'Photograph chassis number', 'Upload to system', 'Verify chassis number'],
    mockData: ['Body photos: 4 uploaded', 'Chassis: MH1234567890', 'All verified']
  },
  {
    number: 5,
    name: 'Update Customer Details',
    description: 'Enter customer information',
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.SA],
    actions: ['Confirm customer name', 'Update contact number', 'Add car model details'],
    mockData: ['Name: Ahmad bin Abdullah', 'Phone: +60 12-345 6789', 'Model: Honda Civic 2020']
  },
  {
    number: 6,
    name: 'Troubleshooting',
    description: 'Diagnose issues',
    roles: [Role.SUPERADMIN, Role.BAY],
    actions: ['Diagnose issues', 'Test components', 'Document findings'],
    mockData: ['Issue: Brake pads worn', 'Oil leak detected', 'AC not cooling properly']
  },
  {
    number: 7,
    name: 'Spare Parts Needed',
    description: 'Select required parts',
    roles: [Role.SUPERADMIN, Role.BAY],
    actions: ['List required parts', 'Specify quantities', 'Note part specifications'],
    mockData: ['Brake pads (front): 1 set', 'Engine oil: 4L', 'AC compressor: 1 unit']
  },
  {
    number: 8,
    name: 'Spare Part Price/Availability',
    description: 'Get supplier prices',
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.MANAGEMENT],
    actions: ['Check supplier prices', 'Verify availability', 'Get delivery timeline'],
    mockData: ['Brake pads: RM 150 (In stock)', 'Oil: RM 80 (Available)', 'Compressor: RM 850 (2 days)']
  },
  {
    number: 9,
    name: 'Mark Up',
    description: 'Calculate pricing with 60% margin',
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.MANAGEMENT],
    actions: ['Calculate markup prices', 'Ensure 60% profit margin', 'Get approval if below threshold'],
    mockData: ['Cost: RM 1,080', 'Markup: RM 2,700', 'Margin: 60%']
  },
  {
    number: 10,
    name: 'Spare Part Confirmation',
    description: 'Customer confirms parts',
    roles: [Role.SUPERADMIN, Role.SA],
    actions: ['Send quotation to customer', 'Get customer approval', 'Confirm parts order'],
    mockData: ['Quotation sent: 11:45 AM', 'Customer approved: 2:30 PM', 'Status: Confirmed']
  },
  {
    number: 11,
    name: 'Quotation',
    description: 'Generate PDF quotation',
    roles: [Role.SUPERADMIN, Role.SA, Role.ADMIN],
    actions: ['Generate PDF quotation', 'Email to customer', 'WhatsApp copy'],
    mockData: ['PDF generated', 'Sent via email & WhatsApp', 'Valid until: 10/02/2026']
  },
  {
    number: 12,
    name: 'Spare Part Order',
    description: 'Order from suppliers',
    roles: [Role.SUPERADMIN, Role.ADMIN],
    actions: ['Place order with supplier', 'Confirm delivery date', 'Track order status'],
    mockData: ['Order #: SP-2024-0156', 'Supplier: Auto Parts Sdn Bhd', 'ETA: 05/02/2026']
  },
  {
    number: 13,
    name: 'Spare Parts in Workshop',
    description: 'Confirm parts received',
    roles: [Role.SUPERADMIN, Role.BAY, Role.ADMIN],
    actions: ['Receive parts delivery', 'Verify quantities', 'Update inventory'],
    mockData: ['Received: 05/02/2026 3:00 PM', 'All items verified', 'Ready for installation']
  },
  {
    number: 14,
    name: 'Work Progress Photos',
    description: 'Upload work progress photos',
    roles: [Role.SUPERADMIN, Role.BAY],
    actions: ['Photo before work', 'During repair photos', 'After completion photos'],
    mockData: ['Before: 6 photos', 'During: 12 photos', 'After: 8 photos']
  },
  {
    number: 15,
    name: 'QC (Quality Control)',
    description: 'Quality inspection',
    roles: [Role.SUPERADMIN, Role.MANAGEMENT, Role.ADMIN],
    actions: ['Inspect completed work', 'Verify all repairs done', 'Approve for delivery'],
    mockData: ['Inspector: Encik Rahman', 'QC Status: Passed', 'Approved: 06/02/2026 4:00 PM']
  },
  {
    number: 16,
    name: 'Car Wash',
    description: 'Clean vehicle',
    roles: [Role.SUPERADMIN, Role.BAY],
    actions: ['Exterior wash', 'Interior vacuum', 'Final polish'],
    mockData: ['Wash completed', 'Interior cleaned', 'Ready for customer']
  },
  {
    number: 17,
    name: 'Send Receipt',
    description: 'Send receipt to customer',
    roles: [Role.SUPERADMIN, Role.SA, Role.ADMIN],
    actions: ['Generate invoice', 'Send via WhatsApp/Email', 'Confirm payment method'],
    mockData: ['Invoice #: INV-2024-0089', 'Amount: RM 2,700', 'Sent: 06/02/2026 5:00 PM']
  },
  {
    number: 18,
    name: 'Receive Payment',
    description: 'Confirm payment',
    roles: [Role.SUPERADMIN, Role.SA, Role.ADMIN],
    actions: ['Receive payment from customer', 'Issue receipt', 'Update payment status'],
    mockData: ['Payment: RM 2,700', 'Method: Bank Transfer', 'Confirmed: 06/02/2026 6:00 PM']
  },
  {
    number: 19,
    name: 'Car Delivery',
    description: 'Vehicle delivery',
    roles: [Role.SUPERADMIN, Role.SA, Role.BAY],
    actions: ['Final vehicle inspection', 'Customer walkthrough', 'Hand over keys and documents'],
    mockData: ['Delivered: 07/02/2026 10:00 AM', 'Customer: Ahmad bin Abdullah', 'Workflow Closed']
  }
];
