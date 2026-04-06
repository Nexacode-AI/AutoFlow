import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { DETAILED_WORKFLOW_STEPS } from '../types';
import {
    ArrowLeft,
    Check,
    Clock,
    Camera,
    MessageSquare,
    Wrench,
    Package,
    DollarSign,
    FileText,
    Send,
    Upload,
    X,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Circle
} from 'lucide-react';

// Mock workflow data - In production, this would come from API
const MOCK_WORKFLOW_DATA = {
    'WF-2024-001': {
        id: 'WF-2024-001',
        plateNumber: 'ABC-1234',
        customer: 'John Doe',
        status: 'COMPLETED',
        currentStep: 20,
        completedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        created: '10/02/2024',
        stepData: {
            1: {
                workflowName: 'Honda Civic Brake Repair',
                description: 'Complete brake system overhaul',
                priority: 'High',
                estimatedDays: '3-5 days'
            },
            2: {
                inspectionItems: ['Brake pads worn', 'Brake fluid low', 'Rotors need resurfacing'],
                inspectorName: 'Ahmad bin Abdullah',
                inspectionDate: '10/02/2024'
            },
            3: {
                groupName: 'WF-2024-001 - Honda Civic Repair',
                members: ['Customer: John Doe', 'Technician: Ahmad', 'Manager: Sarah'],
                createdDate: '10/02/2024'
            },
            4: {
                bodyPhotos: ['car_body_front.jpg', 'car_body_side.jpg', 'car_body_rear.jpg', 'car_body_other_side.jpg'],
                chassisNumber: 'MHFCV1234567890',
                chassisPhoto: 'chassis_number.jpg',
                uploadedBy: 'Ahmad bin Abdullah',
                uploadDate: '10/02/2024',
                verifiedBy: 'Ahmad bin Abdullah',
                verificationDate: '10/02/2024'
            },
            5: {
                customerName: 'John Doe',
                phone: '+60123456789',
                email: 'john.doe@email.com',
                address: '123 Jalan Ampang, KL',
                updatedBy: 'Sarah Lee',
                updateDate: '10/02/2024'
            },
            6: {
                issues: ['Brake pads worn to 2mm', 'Brake fluid contaminated', 'Front rotors scored'],
                recommendations: ['Replace brake pads', 'Flush brake fluid', 'Resurface rotors'],
                technicianNotes: 'Customer reported squeaking noise when braking',
                reportedBy: 'Ahmad bin Abdullah',
                reportDate: '11/02/2024'
            },
            7: {
                parts: [
                    { name: 'Brake Pads (Front)', quantity: 1, specification: 'Ceramic - OEM Quality' },
                    { name: 'Brake Pads (Rear)', quantity: 1, specification: 'Ceramic - OEM Quality' },
                    { name: 'Brake Fluid', quantity: 2, specification: 'DOT 4 - 1L bottles' },
                    { name: 'Brake Disc (Front)', quantity: 2, specification: 'Ventilated - Premium' }
                ],
                listedBy: 'Ahmad bin Abdullah',
                listDate: '11/02/2024'
            },
            8: {
                pricing: [
                    { part: 'Brake Pads (Front)', price: 'RM 280', availability: 'In Stock' },
                    { part: 'Brake Pads (Rear)', price: 'RM 240', availability: 'In Stock' },
                    { part: 'Brake Fluid (2L)', price: 'RM 60', availability: 'In Stock' },
                    { part: 'Brake Disc (Front) x2', price: 'RM 520', availability: 'Available in 2 days' }
                ],
                checkedBy: 'Sarah Lee',
                checkDate: '11/02/2024'
            },
            9: {
                calculations: [
                    { part: 'Brake Pads (Front)', cost: 280, markup: 700, margin: '60%' },
                    { part: 'Brake Pads (Rear)', cost: 240, markup: 600, margin: '60%' },
                    { part: 'Brake Fluid', cost: 60, markup: 150, margin: '60%' },
                    { part: 'Brake Disc (Front)', cost: 520, markup: 1300, margin: '60%' }
                ],
                totalCost: 1100,
                totalMarkup: 2750,
                calculatedBy: 'Sarah Lee',
                date: '11/02/2024'
            },
            10: {
                quotationSent: '11/02/2024 11:45 AM',
                customerApproved: '11/02/2024 2:30 PM',
                status: 'Confirmed'
            },
            11: {
                pdfGenerated: 'PDF quotation generated',
                sentVia: 'Email & WhatsApp',
                validUntil: '18/02/2024'
            },
            12: {
                orderNumber: 'SP-2024-0156',
                supplier: 'Auto Parts Premium Sdn Bhd',
                eta: '13/02/2024',
                orderStatus: 'Confirmed'
            },
            13: {
                receivedDate: '13/02/2024 3:00 PM',
                verifiedBy: 'Ahmad bin Abdullah',
                status: 'Ready for Installation'
            },
            14: {
                photoSets: [
                    { type: 'Before Work', count: 6, uploadTime: '13/02/2024 9:00 AM' },
                    { type: 'Old Parts Removed', count: 8, uploadTime: '13/02/2024 11:30 AM' },
                    { type: 'New Parts Installed', count: 6, uploadTime: '13/02/2024 3:00 PM' },
                    { type: 'After Completion', count: 8, uploadTime: '13/02/2024 5:30 PM' }
                ],
                uploadedBy: 'Ahmad bin Abdullah',
                totalPhotos: 28
            },
            15: {
                completedDate: '13/02/2024 5:30 PM',
                testDrive: 'Passed',
                systemsCheck: 'All systems OK'
            },
            16: {
                inspector: 'Encik Rahman',
                qcStatus: 'Passed',
                approvedDate: '14/02/2024 9:00 AM'
            },
            17: {
                services: ['Exterior wash & wax', 'Interior vacuum & cleaning', 'Final polish & detailing'],
                status: 'Ready for customer'
            },
            18: {
                invoiceNumber: 'INV-2024-0089',
                amount: 'RM 2,750',
                sentDate: '14/02/2024 10:00 AM',
                deliveryMethods: 'WhatsApp, Email & SMS'
            },
            19: {
                payment: 'RM 2,750',
                method: 'Online Banking',
                confirmedDate: '14/02/2024 2:00 PM'
            },
            20: {
                deliveredDate: '14/02/2024 4:30 PM',
                customer: 'John Doe',
                workflowStatus: 'CLOSED'
            }
        }
    },
    'WF-2024-002': {
        id: 'WF-2024-002',
        plateNumber: 'XYZ-5678',
        customer: 'Jane Smith',
        status: 'TROUBLESHOOTING',
        currentStep: 3,
        completedSteps: [1, 2],
        created: '12/02/2024',
        stepData: {
            1: {
                workflowName: 'Toyota Camry Engine Service',
                description: 'Regular engine maintenance and oil change',
                priority: 'Medium',
                estimatedDays: '1-2 days'
            },
            2: {
                inspectionItems: ['Engine oil dirty', 'Air filter clogged', 'Spark plugs worn'],
                inspectorName: 'Rahman Ibrahim',
                inspectionDate: '12/02/2024'
            },
            7: {
                parts: [
                    { name: 'Engine Oil Filter', quantity: 1, specification: 'OEM Standard' },
                    { name: 'Air Filter', quantity: 1, specification: 'High Performance' },
                    { name: 'Spark Plugs', quantity: 4, specification: 'Iridium' }
                ],
                listedBy: 'Rahman Ibrahim',
                listDate: '12/02/2024'
            },
            8: {
                pricing: [
                    { part: 'Engine Oil Filter', price: 'RM 25', availability: 'In Stock' },
                    { part: 'Air Filter', price: 'RM 45', availability: 'In Stock' },
                    { part: 'Spark Plugs', price: 'RM 120', availability: 'Available in 1 day' }
                ],
                checkedBy: 'Sarah Lee',
                checkDate: '12/02/2024'
            },
            9: {
                calculations: [
                    { part: 'Engine Oil Filter', cost: 25, markup: 62.5, margin: '60%' },
                    { part: 'Air Filter', cost: 45, markup: 112.5, margin: '60%' },
                    { part: 'Spark Plugs', cost: 120, markup: 300, margin: '60%' }
                ],
                totalCost: 190,
                totalMarkup: 475,
                calculatedBy: 'Sarah Lee',
                date: '12/02/2024'
            },
            14: {
                photoSets: [
                    { type: 'Before Work', count: 4, uploadTime: '13/02/2024 9:00 AM' },
                    { type: 'During Repair', count: 8, uploadTime: '13/02/2024 2:00 PM' },
                    { type: 'After Completion', count: 6, uploadTime: '13/02/2024 5:00 PM' }
                ],
                uploadedBy: 'Rahman Ibrahim',
                totalPhotos: 18
            }
        }
    }
};

export default function WorkflowDetailPage() {
    const navigate = useNavigate();
    const { workflowId } = useParams<{ workflowId: string }>();
    const [expandedStep, setExpandedStep] = useState<number | null>(null);

    // Get workflow data
    const workflow = workflowId ? MOCK_WORKFLOW_DATA[workflowId as keyof typeof MOCK_WORKFLOW_DATA] : null;

    if (!workflow) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Workflow Not Found</h2>
                    <p className="text-gray-600 mb-4">The workflow you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/workflows')}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        Back to Workflows
                    </button>
                </div>
            </div>
        );
    }

    const getStepStatus = (stepNumber: number) => {
        if (workflow.completedSteps.includes(stepNumber)) return 'completed';
        if (stepNumber === workflow.currentStep) return 'current';
        return 'upcoming';
    };

    const toggleStep = (stepNumber: number) => {
        // Only allow viewing completed steps and current step
        if (workflow.completedSteps.includes(stepNumber) || stepNumber === workflow.currentStep) {
            setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
        }
    };

    const renderStepData = (stepNumber: number) => {
        const data = workflow.stepData[stepNumber as keyof typeof workflow.stepData];
        if (!data) {
            return (
                <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                    No data available for this step yet
                </div>
            );
        }

        // Render different layouts based on step number
        switch (stepNumber) {
            case 1: // Create Workflow
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Workflow Name</label>
                                    <p className="text-sm font-semibold text-gray-900 mt-1">{data.workflowName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Priority</label>
                                    <p className="text-sm font-semibold text-gray-900 mt-1">{data.priority}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Description</label>
                                <p className="text-sm text-gray-900 mt-1">{data.description}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Estimated Duration</label>
                                <p className="text-sm text-gray-900 mt-1">{data.estimatedDays}</p>
                            </div>
                        </div>
                    </div>
                );

            case 2: // Inspection Sheet
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-600">Inspection Items</label>
                            <ul className="mt-2 space-y-1">
                                {data.inspectionItems?.map((item: string, idx: number) => (
                                    <li key={idx} className="text-sm text-gray-900 flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Inspector</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.inspectorName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Inspection Date</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.inspectionDate}</p>
                            </div>
                        </div>
                    </div>
                );

            case 3: // WhatsApp Group
                return (
                    <div className="space-y-4">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <label className="text-xs font-medium text-green-900">Group Name</label>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{data.groupName}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-600">Members</label>
                            <ul className="mt-2 space-y-1">
                                {data.members?.map((member: string, idx: number) => (
                                    <li key={idx} className="text-sm text-gray-900 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        {member}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600">Created Date</label>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{data.createdDate}</p>
                        </div>
                    </div>
                );

            case 4: // Vehicle Photos (Body + Chassis)
                return (
                    <div className="space-y-4">
                        {/* Car Body Photos - 4 Views */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                Car Body Photos (4 Views Required)
                            </label>
                            <div className="mt-3 grid grid-cols-4 gap-3">
                                {data.bodyPhotos?.map((photo: string, idx: number) => (
                                    <div key={idx} className="bg-white border-2 border-blue-300 p-3 rounded-lg text-center">
                                        <Camera className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                        <p className="text-xs font-medium text-gray-700">View {idx + 1}</p>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{photo}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chassis Number Photo - Separate Upload */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <label className="text-sm font-semibold text-green-900 flex items-center gap-2 mb-3">
                                <Camera className="w-4 h-4" />
                                Chassis Number Photo (Separate Upload)
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Chassis Number</label>
                                    <p className="text-sm text-gray-900 mt-1 font-mono bg-white px-3 py-2 rounded border border-green-300">{data.chassisNumber}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Chassis Photo</label>
                                    <div className="mt-1 bg-white border-2 border-green-300 p-3 rounded-lg text-center">
                                        <Camera className="w-10 h-10 text-green-400 mx-auto mb-1" />
                                        <p className="text-xs text-gray-600 truncate">{data.chassisPhoto}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Uploaded By</label>
                                <p className="text-sm text-gray-900 mt-1">{data.uploadedBy}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Upload Date</label>
                                <p className="text-sm text-gray-900 mt-1">{data.uploadDate}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Verified By</label>
                                <p className="text-sm text-gray-900 mt-1">{data.verifiedBy}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Verification Date</label>
                                <p className="text-sm text-gray-900 mt-1">{data.verificationDate}</p>
                            </div>
                        </div>
                    </div>
                );

            case 5: // Update Customer Details
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Customer Name</label>
                                    <p className="text-sm font-semibold text-gray-900 mt-1">{data.customerName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Phone</label>
                                    <p className="text-sm font-semibold text-gray-900 mt-1">{data.phone}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Email</label>
                                <p className="text-sm text-gray-900 mt-1">{data.email}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Address</label>
                                <p className="text-sm text-gray-900 mt-1">{data.address}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Updated By</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.updatedBy}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Update Date</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.updateDate}</p>
                            </div>
                        </div>
                    </div>
                );

            case 6: // Troubleshooting
                return (
                    <div className="space-y-4">
                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                            <label className="text-xs font-medium text-red-900">Issues Found</label>
                            <ul className="mt-2 space-y-1">
                                {data.issues?.map((issue: string, idx: number) => (
                                    <li key={idx} className="text-sm text-gray-900 flex items-center gap-2">
                                        <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                                        {issue}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <label className="text-xs font-medium text-green-900">Recommendations</label>
                            <ul className="mt-2 space-y-1">
                                {data.recommendations?.map((rec: string, idx: number) => (
                                    <li key={idx} className="text-sm text-gray-900 flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-600">Technician Notes</label>
                            <p className="text-sm text-gray-900 mt-1">{data.technicianNotes}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Reported By</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.reportedBy}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Report Date</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.reportDate}</p>
                            </div>
                        </div>
                    </div>
                );

            case 7: // Spare Parts Needed
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-600 mb-3 block">Required Parts</label>
                            <div className="space-y-2">
                                {data.parts?.map((part: any, idx: number) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{part.name}</p>
                                                <p className="text-xs text-gray-600 mt-0.5">Spec: {part.specification}</p>
                                            </div>
                                            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded">
                                                Qty: {part.quantity}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Listed By</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.listedBy}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">List Date</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.listDate}</p>
                            </div>
                        </div>
                    </div>
                );

            case 8: // Spare Part Price/Availability
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-600 mb-3 block">Parts Pricing & Availability</label>
                            <div className="space-y-2">
                                {data.pricing?.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900">{item.part}</p>
                                                <p className="text-xs text-gray-600 mt-0.5">{item.availability}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-green-600">{item.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Checked By</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.checkedBy}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Check Date</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.checkDate}</p>
                            </div>
                        </div>
                    </div>
                );

            case 9: // Mark Up
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-600 mb-3 block">Markup Calculations (60% Margin)</label>
                            <div className="space-y-2">
                                {data.calculations?.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                                        <p className="text-sm font-semibold text-gray-900 mb-2">{item.part}</p>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div>
                                                <span className="text-gray-600">Cost:</span>
                                                <span className="font-medium text-gray-900 ml-1">RM {item.cost}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Markup:</span>
                                                <span className="font-medium text-green-600 ml-1">RM {item.markup}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Margin:</span>
                                                <span className="font-medium text-indigo-600 ml-1">{item.margin}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Total Cost</label>
                                    <p className="text-lg font-bold text-gray-900 mt-1">RM {data.totalCost}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Total Markup Price</label>
                                    <p className="text-lg font-bold text-green-600 mt-1">RM {data.totalMarkup}</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Calculated By</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.calculatedBy}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Date</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.date}</p>
                            </div>
                        </div>
                    </div>
                );

            case 10: // Spare Part Confirmation
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Quotation Sent</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.quotationSent}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Customer Approved</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.customerApproved}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Status</label>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                    {data.status}
                                </span>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-green-800">
                                <Check className="w-4 h-4 inline mr-1" />
                                Customer has confirmed all spare parts
                            </p>
                        </div>
                    </div>
                );

            case 11: // Quotation
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Quotation Status</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.pdfGenerated}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Delivery Methods</label>
                                    <p className="text-sm text-gray-900 mt-1">{data.sentVia}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Valid Until</label>
                                    <p className="text-sm text-gray-900 mt-1">{data.validUntil}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 12: // Spare Part Order
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Order Number</label>
                                    <p className="text-sm font-mono font-semibold text-gray-900 mt-1">{data.orderNumber}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Supplier</label>
                                    <p className="text-sm font-semibold text-gray-900 mt-1">{data.supplier}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Estimated Delivery</label>
                                    <p className="text-sm text-gray-900 mt-1">{data.eta}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Order Status</label>
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                        {data.orderStatus || 'Processing'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 13: // Spare Parts in Workshop
                return (
                    <div className="space-y-4">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <p className="text-sm font-medium text-green-800">
                                <Package className="w-4 h-4 inline mr-1" />
                                All spare parts received and verified
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Received Date</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.receivedDate}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Verified By</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.verifiedBy}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Status</label>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                    {data.status || 'Ready'}
                                </span>
                            </div>
                        </div>
                    </div>
                );

            case 14: // Work Progress Photos
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-600 mb-3 block">Photo Sets</label>
                            <div className="space-y-2">
                                {data.photoSets?.map((set: any, idx: number) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{set.type}</p>
                                                <p className="text-xs text-gray-600 mt-0.5">{set.uploadTime}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-indigo-600">
                                                <Camera className="w-4 h-4" />
                                                <span className="text-sm font-medium">{set.count} photos</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Uploaded By</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.uploadedBy}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Total Photos</label>
                                <p className="text-sm font-bold text-gray-900 mt-1">{data.totalPhotos} photos</p>
                            </div>
                        </div>
                    </div>
                );

            case 15: // QC (Quality Control)
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Inspector</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.inspector}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">QC Status</label>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                    {data.qcStatus}
                                </span>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Approved Date</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.approvedDate}</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-green-800">
                                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                                Quality control approved for delivery
                            </p>
                        </div>
                    </div>
                );

            case 16: // Car Wash
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-sm font-medium text-blue-800">
                                <Check className="w-4 h-4 inline mr-1" />
                                Vehicle cleaning completed
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-600 mb-2 block">Services Completed</label>
                            <ul className="space-y-1">
                                {(data.services || ['Exterior wash', 'Interior vacuum', 'Final polish']).map((service: string, idx: number) => (
                                    <li key={idx} className="text-sm text-gray-900 flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        {service}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600">Status</label>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{data.status || 'Ready for customer'}</p>
                        </div>
                    </div>
                );

            case 17: // Send Receipt
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Invoice Number</label>
                                    <p className="text-sm font-mono font-semibold text-gray-900 mt-1">{data.invoiceNumber}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Amount</label>
                                    <p className="text-lg font-bold text-green-600 mt-1">{data.amount}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Sent Date</label>
                                    <p className="text-sm font-semibold text-gray-900 mt-1">{data.sentDate}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600">Delivery Methods</label>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{data.deliveryMethods || 'WhatsApp & Email'}</p>
                        </div>
                    </div>
                );

            case 18: // Receive Payment
                return (
                    <div className="space-y-4">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <p className="text-sm font-medium text-green-800">
                                <DollarSign className="w-4 h-4 inline mr-1" />
                                Payment received and confirmed
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Payment Amount</label>
                                <p className="text-lg font-bold text-green-600 mt-1">{data.payment}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Payment Method</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.method}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Confirmed Date</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.confirmedDate}</p>
                            </div>
                        </div>
                    </div>
                );

            case 19: // Car Delivery
                return (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
                            <p className="text-sm font-semibold text-green-800">
                                <CheckCircle2 className="w-5 h-5 inline mr-1" />
                                Workflow Completed - Vehicle Delivered
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Delivery Date</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.deliveredDate}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Customer</label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{data.customer}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Workflow Status</label>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-800 text-white mt-1">
                                    {data.workflowStatus || 'CLOSED'}
                                </span>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-600">
                                Final inspection completed and vehicle handed over to customer with all documents
                            </p>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                        No data available for this step yet
                    </div>
                );
        }
    };

    const progress = (workflow.completedSteps.length / DETAILED_WORKFLOW_STEPS.length) * 100;

    // Group steps into phases for visual representation
    const workflowPhases = [
        { name: 'Initial Setup', steps: [1, 2, 3, 4, 5], icon: FileText },
        { name: 'Diagnosis', steps: [6], icon: Wrench },
        { name: 'Parts & Pricing', steps: [7, 8, 9, 10, 11, 12, 13], icon: Package },
        { name: 'Repair Work', steps: [14, 15, 16, 17], icon: Wrench },
        { name: 'Completion', steps: [18, 19, 20], icon: Send }
    ];

    const getPhaseStatus = (phase: typeof workflowPhases[0]) => {
        const allCompleted = phase.steps.every(step => workflow.completedSteps.includes(step));
        const someCompleted = phase.steps.some(step => workflow.completedSteps.includes(step));
        const isCurrent = phase.steps.includes(workflow.currentStep);
        
        if (allCompleted) return 'completed';
        if (isCurrent || someCompleted) return 'in-progress';
        return 'pending';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/workflows')}
                                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="font-medium">Back to Workflows</span>
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{workflow.id}</h1>
                                <p className="text-sm text-gray-600">
                                    {workflow.plateNumber} - {workflow.customer}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Progress</p>
                                <p className="text-lg font-bold text-indigo-600">
                                    {workflow.completedSteps.length} / {DETAILED_WORKFLOW_STEPS.length} Steps
                                </p>
                            </div>
                            <div className="relative w-16 h-16">
                                <svg className="transform -rotate-90 w-16 h-16">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        className="text-gray-200"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 28}`}
                                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                                        className="text-green-600 transition-all duration-500"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-bold text-green-600">{Math.round(progress)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Workflow Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-4 gap-6">
                        <div>
                            <label className="text-xs font-medium text-gray-600">Status</label>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {workflow.status.replace('_', ' ')}
                                </span>
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600">Current Step</label>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                Step {workflow.currentStep} / {DETAILED_WORKFLOW_STEPS.length}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600">Created</label>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{workflow.created}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600">Completed Steps</label>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                {workflow.completedSteps.length} steps
                            </p>
                        </div>
                    </div>
                </div>

                {/* Visual Workflow Phases */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Workflow Progress</h2>
                    <div className="flex items-center justify-between gap-4">
                        {workflowPhases.map((phase, index) => {
                            const status = getPhaseStatus(phase);
                            const Icon = phase.icon;
                            const completedInPhase = phase.steps.filter(s => workflow.completedSteps.includes(s)).length;
                            const totalInPhase = phase.steps.length;
                            
                            return (
                                <div key={phase.name} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        {/* Phase Icon */}
                                        <div
                                            className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-all ${
                                                status === 'completed'
                                                    ? 'bg-green-500 shadow-lg shadow-green-200'
                                                    : status === 'in-progress'
                                                    ? 'bg-indigo-600 shadow-lg shadow-indigo-200 animate-pulse'
                                                    : 'bg-gray-200'
                                            }`}
                                        >
                                            {status === 'completed' ? (
                                                <Check className="w-8 h-8 text-white" />
                                            ) : (
                                                <Icon className={`w-8 h-8 ${status === 'in-progress' ? 'text-white' : 'text-gray-400'}`} />
                                            )}
                                        </div>
                                        
                                        {/* Phase Name */}
                                        <p className={`text-sm font-semibold text-center mb-1 ${
                                            status === 'completed' ? 'text-green-600' :
                                            status === 'in-progress' ? 'text-indigo-600' :
                                            'text-gray-500'
                                        }`}>
                                            {phase.name}
                                        </p>
                                        
                                        {/* Phase Progress */}
                                        <p className="text-xs text-gray-600">
                                            {completedInPhase}/{totalInPhase} steps
                                        </p>
                                    </div>
                                    
                                    {/* Connector Line */}
                                    {index < workflowPhases.length - 1 && (
                                        <div className="flex-1 h-1 mx-2 relative" style={{ maxWidth: '60px' }}>
                                            <div className="absolute inset-0 bg-gray-200 rounded"></div>
                                            <div
                                                className={`absolute inset-0 rounded transition-all duration-500 ${
                                                    status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                                                }`}
                                                style={{
                                                    width: status === 'completed' ? '100%' : '0%'
                                                }}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Steps List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Workflow Steps</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Click on <span className="text-green-600 font-medium">completed</span> or <span className="text-indigo-600 font-medium">current</span> steps to view registered data (read-only)
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-gray-600">Completed</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                    <span className="text-gray-600">In Progress</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                    <span className="text-gray-600">Upcoming</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {DETAILED_WORKFLOW_STEPS.map((step) => {
                            const status = getStepStatus(step.number);
                            const isExpanded = expandedStep === step.number;
                            const canView = status === 'completed' || status === 'current';

                            return (
                                <div key={step.number} className={`transition-all ${isExpanded ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                                    <button
                                        onClick={() => toggleStep(step.number)}
                                        disabled={!canView}
                                        className={`w-full p-4 flex items-center gap-4 text-left ${
                                            !canView ? 'cursor-not-allowed opacity-50' : 'cursor-pointer group'
                                        }`}
                                    >
                                        {/* Step Number/Status Icon */}
                                        <div
                                            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-transform ${
                                                canView ? 'group-hover:scale-110' : ''
                                            } ${
                                                status === 'completed'
                                                    ? 'bg-green-500 text-white shadow-md'
                                                    : status === 'current'
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            {status === 'completed' ? (
                                                <Check className="w-6 h-6" />
                                            ) : status === 'current' ? (
                                                <Clock className="w-6 h-6" />
                                            ) : (
                                                step.number
                                            )}
                                        </div>

                                        {/* Step Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">{step.name}</h3>
                                                {status === 'completed' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        ✓ Completed
                                                    </span>
                                                )}
                                                {status === 'current' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 animate-pulse">
                                                        ● In Progress
                                                    </span>
                                                )}
                                                {canView && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                        👁 View Only
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>
                                        </div>

                                        {/* Expand Icon */}
                                        {canView && (
                                            <div className="flex-shrink-0">
                                                {isExpanded ? (
                                                    <ChevronUp className="w-5 h-5 text-indigo-600" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                                                )}
                                            </div>
                                        )}
                                    </button>

                                    {/* Expanded Content */}
                                    {isExpanded && canView && (
                                        <div className="px-4 pb-4 pl-20 bg-indigo-50">
                                            <div className="bg-white rounded-lg p-4 border-2 border-indigo-200 shadow-sm">
                                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                                                    <h4 className="text-sm font-bold text-gray-900">Registered Data</h4>
                                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                                                        🔒 Read-Only
                                                    </span>
                                                </div>
                                                {renderStepData(step.number)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
