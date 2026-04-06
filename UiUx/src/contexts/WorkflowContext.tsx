import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Workflow,
  WorkflowStep,
  WorkflowPart,
  Photo,
  Notification,
  Document,
  SupplierMessage,
  AuditLog,
  WorkflowStatus,
  StepStatus,
  WORKFLOW_STEPS,
  Part,
  PartsCategory
} from '../types';
import { useAuth } from './AuthContext';

interface WorkflowContextType {
  workflows: Workflow[];
  workflowSteps: Record<string, WorkflowStep[]>;
  workflowParts: Record<string, WorkflowPart[]>;
  photos: Record<string, Photo[]>;
  notifications: Notification[];
  documents: Record<string, Document[]>;
  supplierMessages: Record<string, SupplierMessage[]>;
  auditLogs: Record<string, AuditLog[]>;
  parts: Part[];
  categories: PartsCategory[];
  createWorkflow: (plateNumber: string) => Workflow;
  updateWorkflowDetails: (workflowId: string, details: any) => void;
  completeStep: (workflowId: string, stepNumber: number, notes?: string) => void;
  addWorkflowParts: (workflowId: string, partIds: string[], quantities: number[]) => void;
  updatePartPricing: (workflowPartId: string, supplierPrice: number, markupPrice: number) => void;
  confirmParts: (workflowId: string) => void;
  uploadPhoto: (workflowId: string, stepNumber: number, photoType: string, file: File, partId?: string) => Promise<void>;
  createSupplierMessage: (workflowId: string, message: string) => void;
  generateQuotation: (workflowId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  deleteWorkflow: (workflowId: string) => boolean;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// Mock data
const mockCategories: PartsCategory[] = [
  { id: 'cat1', name: 'Engine Parts', description: 'Engine components' },
  { id: 'cat2', name: 'Brake System', description: 'Brake components' },
  { id: 'cat3', name: 'Suspension', description: 'Suspension parts' },
  { id: 'cat4', name: 'Electrical', description: 'Electrical components' },
  { id: 'cat5', name: 'Body Parts', description: 'Body and exterior' },
  { id: 'cat6', name: 'Interior', description: 'Interior components' },
];

const mockParts: Part[] = [
  { id: 'p1',  categoryId: 'cat1', name: 'Engine Oil Filter',      description: 'Standard oil filter',         isActive: true,  price: 45.00,  partType: 'ORI' },
  { id: 'p2',  categoryId: 'cat1', name: 'Air Filter',             description: 'Engine air filter',           isActive: true,  price: 38.00,  partType: 'OM'  },
  { id: 'p3',  categoryId: 'cat1', name: 'Spark Plugs (Set of 4)', description: 'Iridium spark plugs',          isActive: true,  price: 120.00, partType: 'ORI' },
  { id: 'p4',  categoryId: 'cat2', name: 'Brake Pads (Front)',     description: 'Ceramic brake pads',          isActive: true,  price: 180.00, partType: 'ORI' },
  { id: 'p5',  categoryId: 'cat2', name: 'Brake Pads (Rear)',      description: 'Ceramic brake pads',          isActive: true,  price: 150.00, partType: 'OM'  },
  { id: 'p6',  categoryId: 'cat2', name: 'Brake Disc (Front)',     description: 'Ventilated disc',              isActive: true,  price: 320.00, partType: 'ORI' },
  { id: 'p7',  categoryId: 'cat2', name: 'Brake Fluid',            description: 'DOT 4 brake fluid',           isActive: true,  price: 35.00,  partType: 'OM'  },
  { id: 'p8',  categoryId: 'cat3', name: 'Shock Absorber (Front)', description: 'Gas shock absorber',          isActive: true,  price: 280.00, partType: 'ORI' },
  { id: 'p9',  categoryId: 'cat3', name: 'Shock Absorber (Rear)',  description: 'Gas shock absorber',          isActive: true,  price: 250.00, partType: 'OM'  },
  { id: 'p10', categoryId: 'cat3', name: 'Coil Spring',            description: 'Front coil spring',           isActive: true,  price: 160.00, partType: 'ORI' },
  { id: 'p11', categoryId: 'cat4', name: 'Battery',                description: '12V car battery DIN65',       isActive: true,  price: 280.00, partType: 'ORI' },
  { id: 'p12', categoryId: 'cat4', name: 'Alternator',             description: 'Alternator unit',             isActive: true,  price: 520.00, partType: 'ORI' },
  { id: 'p13', categoryId: 'cat5', name: 'Headlight Assembly',     description: 'LED headlight unit',          isActive: true,  price: 380.00, partType: 'OM'  },
  { id: 'p14', categoryId: 'cat5', name: 'Bumper (Front)',         description: 'Front bumper cover',          isActive: true,  price: 450.00, partType: 'ORI' },
  { id: 'p15', categoryId: 'cat6', name: 'Floor Mats',             description: 'Rubber floor mats set',       isActive: true,  price: 85.00,  partType: 'OM'  },

  // ── Paired ORI / OM entries (same part, different manufacturer) ──
  { id: 'p16', categoryId: 'cat1', name: 'Timing Belt',            description: 'ORI — OEM timing belt',        isActive: true,  price: 220.00, partType: 'ORI' },
  { id: 'p17', categoryId: 'cat1', name: 'Timing Belt',            description: 'OM — Aftermarket timing belt', isActive: true,  price: 120.00, partType: 'OM'  },

  { id: 'p18', categoryId: 'cat1', name: 'Radiator Hose',          description: 'ORI — OEM upper radiator hose',        isActive: true,  price: 95.00,  partType: 'ORI' },
  { id: 'p19', categoryId: 'cat1', name: 'Radiator Hose',          description: 'OM — Aftermarket radiator hose',       isActive: true,  price: 48.00,  partType: 'OM'  },

  { id: 'p20', categoryId: 'cat5', name: 'Wiper Blade (Set)',      description: 'ORI — OEM front wiper blades',         isActive: true,  price: 65.00,  partType: 'ORI' },
  { id: 'p21', categoryId: 'cat5', name: 'Wiper Blade (Set)',      description: 'OM — Aftermarket wiper blades',        isActive: true,  price: 32.00,  partType: 'OM'  },
];

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<Record<string, WorkflowStep[]>>({});
  const [workflowParts, setWorkflowParts] = useState<Record<string, WorkflowPart[]>>({});
  const [photos, setPhotos] = useState<Record<string, Photo[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [documents, setDocuments] = useState<Record<string, Document[]>>({});
  const [supplierMessages, setSupplierMessages] = useState<Record<string, SupplierMessage[]>>({});
  const [auditLogs, setAuditLogs] = useState<Record<string, AuditLog[]>>({});

  const generateUniqueCode = () => {
    return 'WF' + Date.now().toString(36).toUpperCase();
  };

  const addAuditLog = (workflowId: string, action: string, details?: any) => {
    if (!user) return;
    
    const log: AuditLog = {
      id: Date.now().toString(),
      workflowId,
      userId: user.id,
      userName: user.name,
      action,
      details,
      createdAt: new Date()
    };

    setAuditLogs(prev => ({
      ...prev,
      [workflowId]: [...(prev[workflowId] || []), log]
    }));
  };

  const addNotification = (workflowId: string, message: string, role?: string, delay: number = 0) => {
    const notification: Notification = {
      id: Date.now().toString() + Math.random(),
      workflowId,
      role: role as any,
      message,
      priority: 'medium',
      read: false,
      createdAt: new Date(),
      sentAt: delay > 0 ? undefined : new Date(),
      scheduledFor: delay > 0 ? new Date(Date.now() + delay) : undefined
    };

    if (delay > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, sentAt: new Date() } : n
        ));
      }, delay);
    }

    setNotifications(prev => [...prev, notification]);
  };

  const createWorkflow = (plateNumber: string): Workflow => {
    if (!user) throw new Error('Not authenticated');

    const workflow: Workflow = {
      id: Date.now().toString(),
      uniqueCode: generateUniqueCode(),
      plateNumber,
      status: WorkflowStatus.PENDING,
      currentStep: 1,
      details: {},
      createdBy: user.id,
      createdAt: new Date()
    };

    // Initialize steps
    const steps: WorkflowStep[] = WORKFLOW_STEPS.map((step, index) => ({
      id: workflow.id + '-step-' + step.number,
      workflowId: workflow.id,
      stepNumber: step.number,
      stepName: step.name,
      status: index === 0 ? StepStatus.COMPLETED : StepStatus.PENDING,
      completedAt: index === 0 ? new Date() : undefined,
      completedBy: index === 0 ? user.id : undefined
    }));

    setWorkflows(prev => [...prev, workflow]);
    setWorkflowSteps(prev => ({ ...prev, [workflow.id]: steps }));
    setWorkflowParts(prev => ({ ...prev, [workflow.id]: [] }));
    setPhotos(prev => ({ ...prev, [workflow.id]: [] }));
    setDocuments(prev => ({ ...prev, [workflow.id]: [] }));
    setSupplierMessages(prev => ({ ...prev, [workflow.id]: [] }));
    setAuditLogs(prev => ({ ...prev, [workflow.id]: [] }));

    addAuditLog(workflow.id, 'Workflow Created', { plateNumber });
    addNotification(workflow.id, `New workflow created for ${plateNumber}`, 'sa', 0);

    return workflow;
  };

  const updateWorkflowDetails = (workflowId: string, details: any) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, details: { ...w.details, ...details } } : w
    ));
    addAuditLog(workflowId, 'Customer Details Updated', details);
  };

  const completeStep = (workflowId: string, stepNumber: number, notes?: string) => {
    if (!user) return;

    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    // Update step status
    setWorkflowSteps(prev => ({
      ...prev,
      [workflowId]: prev[workflowId].map(step =>
        step.stepNumber === stepNumber
          ? { ...step, status: StepStatus.COMPLETED, completedAt: new Date(), completedBy: user.id, notes }
          : step
      )
    }));

    // Update workflow current step and status
    let newStatus = workflow.status;
    if (stepNumber === 5) {
      newStatus = WorkflowStatus.TROUBLESHOOTING;
    } else if (stepNumber === 14) {
      newStatus = WorkflowStatus.WORK_PROGRESS;
    } else if (stepNumber === 21) {
      newStatus = WorkflowStatus.COMPLETED;
    }

    setWorkflows(prev => prev.map(w =>
      w.id === workflowId
        ? { ...w, currentStep: stepNumber + 1, status: newStatus, completedAt: stepNumber === 21 ? new Date() : undefined }
        : w
    ));

    addAuditLog(workflowId, `Step ${stepNumber} Completed`, { stepName: WORKFLOW_STEPS.find(s => s.number === stepNumber)?.name });

    // Handle notifications based on step
    const notificationMap: Record<number, { role: string; delay: number; message: string }> = {
      1: { role: 'sa', delay: 0, message: 'New workflow awaiting inspection approval' },
      2: { role: 'bay', delay: 0, message: 'Inspection approved, proceed with WhatsApp group creation' },
      3: { role: 'bay', delay: 0, message: 'WhatsApp group created, upload car body photos' },
      4: { role: 'bay', delay: 0, message: 'Car body photos uploaded, upload chassis photo' },
      5: { role: 'bay', delay: 0, message: 'Chassis photo uploaded, update customer details' },
      8: { role: 'admin', delay: 0, message: 'Parts selected, please get supplier prices' },
      9: { role: 'admin', delay: 0, message: 'Supplier prices updated, apply markup' },
      10: { role: 'admin', delay: 600000, message: 'Quotation sent, awaiting customer confirmation' }, // 10 min
      11: { role: 'admin', delay: 0, message: 'Customer confirmed parts, proceed with ordering' },
      13: { role: 'bay', delay: 900000, message: 'Parts ordered, confirm when received' }, // 15 min
      14: { role: 'bay', delay: 0, message: 'Parts received, start work' },
      16: { role: 'bay', delay: 0, message: 'Work complete, proceed with QC' },
      17: { role: 'bay', delay: 0, message: 'QC passed, wash the car' },
      18: { role: 'admin', delay: 0, message: 'Car washed, send receipt to customer' },
      19: { role: 'admin', delay: 900000, message: 'Receipt sent, confirm payment received' }, // 15 min
      20: { role: 'admin', delay: 0, message: 'Payment received, deliver car to customer' },
    };

    const notification = notificationMap[stepNumber];
    if (notification) {
      addNotification(workflowId, notification.message, notification.role, notification.delay);
    }

    // Auto-generate quotation at step 10
    if (stepNumber === 10) {
      setTimeout(() => generateQuotation(workflowId), 100);
    }

    // Auto-generate final PDF at step 21
    if (stepNumber === 21) {
      const doc: Document = {
        id: Date.now().toString(),
        workflowId,
        documentType: 'SUMMARY',
        filePath: `/documents/${workflowId}_summary.pdf`,
        createdBy: user.id,
        createdAt: new Date()
      };
      setDocuments(prev => ({
        ...prev,
        [workflowId]: [...(prev[workflowId] || []), doc]
      }));
    }
  };

  const addWorkflowParts = (workflowId: string, partIds: string[], quantities: number[]) => {
    const newParts: WorkflowPart[] = partIds.map((partId, index) => {
      const part = mockParts.find(p => p.id === partId);
      const category = mockCategories.find(c => c.id === part?.categoryId);
      
      const warranty = part?.partType === 'ORI' ? '1 Year' : '6 Months';
      return {
        id: Date.now().toString() + index,
        workflowId,
        partId,
        partName: part?.name || '',
        categoryName: category?.name || '',
        partType: part?.partType || 'OM',
        warranty,
        cataloguePrice: part?.price || 0,
        quantity: quantities[index] || 1,
        confirmed: false
      };
    });

    setWorkflowParts(prev => ({
      ...prev,
      [workflowId]: [...(prev[workflowId] || []), ...newParts]
    }));

    // Auto-complete step 8 (Spare Parts Needed)
    completeStep(workflowId, 8);
    
    // Auto-complete step 7 (Troubleshooting)
    completeStep(workflowId, 7);

    addAuditLog(workflowId, 'Parts Added', { count: partIds.length });
  };

  const updatePartPricing = (workflowPartId: string, supplierPrice: number, markupPrice: number) => {
    const profitMargin = ((markupPrice - supplierPrice) / supplierPrice) * 100;

    setWorkflowParts(prev => {
      const updated = { ...prev };
      for (const wfId in updated) {
        updated[wfId] = updated[wfId].map(part =>
          part.id === workflowPartId
            ? { ...part, supplierPrice, markupPrice, profitMargin }
            : part
        );
      }
      return updated;
    });
  };

  const confirmParts = (workflowId: string) => {
    setWorkflowParts(prev => ({
      ...prev,
      [workflowId]: prev[workflowId].map(part => ({
        ...part,
        confirmed: true,
        confirmedAt: new Date()
      }))
    }));

    completeStep(workflowId, 11);
    addAuditLog(workflowId, 'Parts Confirmed by Customer');
  };

  const uploadPhoto = async (workflowId: string, stepNumber: number, photoType: string, file: File, partId?: string) => {
    if (!user) return;

    // Simulate file upload
    const url = URL.createObjectURL(file);

    const photo: Photo = {
      id: Date.now().toString(),
      workflowId,
      stepNumber,
      photoType: photoType as any,
      partId,
      url,
      uploadedBy: user.id,
      uploadedAt: new Date()
    };

    setPhotos(prev => ({
      ...prev,
      [workflowId]: [...(prev[workflowId] || []), photo]
    }));

    addAuditLog(workflowId, 'Photo Uploaded', { stepNumber, photoType });
  };

  const createSupplierMessage = (workflowId: string, message: string) => {
    if (!user) return;

    const supplierMessage: SupplierMessage = {
      id: Date.now().toString(),
      workflowId,
      messageText: message,
      createdBy: user.id,
      createdAt: new Date()
    };

    setSupplierMessages(prev => ({
      ...prev,
      [workflowId]: [...(prev[workflowId] || []), supplierMessage]
    }));

    addAuditLog(workflowId, 'Supplier Message Created');
  };

  const generateQuotation = (workflowId: string) => {
    if (!user) return;

    const googleFormUrl = `https://forms.google.com/mock/${workflowId}`;

    const doc: Document = {
      id: Date.now().toString(),
      workflowId,
      documentType: 'QUOTATION',
      filePath: `/documents/${workflowId}_quotation.pdf`,
      googleFormUrl,
      createdBy: user.id,
      createdAt: new Date()
    };

    setDocuments(prev => ({
      ...prev,
      [workflowId]: [...(prev[workflowId] || []), doc]
    }));

    addAuditLog(workflowId, 'Quotation Generated', { googleFormUrl });
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const deleteWorkflow = (workflowId: string): boolean => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return false;

    // Can only delete if at step 1 and user is Admin or Management
    if (workflow.currentStep > 1) {
      return false;
    }

    if (user?.role !== 'admin' && user?.role !== 'management') {
      return false;
    }

    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    return true;
  };

  return (
    <WorkflowContext.Provider value={{
      workflows,
      workflowSteps,
      workflowParts,
      photos,
      notifications,
      documents,
      supplierMessages,
      auditLogs,
      parts: mockParts,
      categories: mockCategories,
      createWorkflow,
      updateWorkflowDetails,
      completeStep,
      addWorkflowParts,
      updatePartPricing,
      confirmParts,
      uploadPhoto,
      createSupplierMessage,
      generateQuotation,
      markNotificationRead,
      deleteWorkflow
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}
