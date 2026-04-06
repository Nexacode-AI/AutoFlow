import { useState } from 'react';
import { Role } from '../types';
import {
    Shield,
    Users,
    Workflow,
    Settings,
    BarChart3,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    Clock,
    AlertCircle,
    Upload,
    FileText,
    Camera,
    DollarSign,
    Package,
    Wrench,
    MessageSquare,
    Send,
    Check,
    X
} from 'lucide-react';

export default function SuperAdminDashboard() {
    const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
    const [isEmailPreviewExpanded, setIsEmailPreviewExpanded] = useState(true);

    // Generate WhatsApp group name from workflow data
    const generateWhatsAppGroupName = (workflowCode: string, plateNumber: string) => {
        return `${workflowCode} - ${plateNumber} Repair`;
    };

    // Generate WhatsApp group creation link
    const generateWhatsAppGroupLink = (workflowCode: string, carModel: string) => {
        const message = `Please create a WhatsApp group with the name ${workflowCode} - ${carModel} and add the customer, service advisor, and bay mechanic.`;
        return `https://api.whatsapp.com/send/?text=${encodeURIComponent(message)}&type=custom_url&app_absent=0`;
    };

    const getRoleBadgeColor = (role: Role) => {
        switch (role) {
            case Role.SUPERADMIN:
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case Role.ADMIN:
                return 'bg-indigo-100 text-indigo-800 border-indigo-300';
            case Role.MANAGEMENT:
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case Role.BAY:
                return 'bg-teal-100 text-teal-800 border-teal-300';
            case Role.SA:
                return 'bg-cyan-100 text-cyan-800 border-cyan-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getRoleLabel = (role: Role) => {
        switch (role) {
            case Role.SUPERADMIN:
                return 'SuperAdmin';
            case Role.ADMIN:
                return 'Admin';
            case Role.MANAGEMENT:
                return 'Management';
            case Role.BAY:
                return 'Bay Team';
            case Role.SA:
                return 'Service Advisor';
            default:
                return role;
        }
    };

    // Production-level UI components for each step
    const getStepUI = (stepNumber: number) => {
        switch (stepNumber) {
            case 1: // Create Workflow
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Enter vehicle plate number to create new workflow</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number *</label>
                                <input type="text" placeholder="e.g., WXY 1234" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Code (Auto-generated)</label>
                                <input type="text" value="WF-2024-0001" disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                <Check className="w-4 h-4" /> Create Workflow
                            </button>
                            <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">
                                Cancel
                            </button>
                        </div>
                    </div>
                );

            case 2: // Inspection Sheet
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Complete vehicle inspection checklist and get customer approval</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-indigo-600" />
                                <label className="text-gray-700">Exterior condition checked</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-indigo-600" />
                                <label className="text-gray-700">Interior condition checked</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-indigo-600" />
                                <label className="text-gray-700">Existing damages documented</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-indigo-600" />
                                <label className="text-gray-700">Customer approval received</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                            <textarea rows={3} placeholder="Add any additional notes..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Mark as Complete
                        </button>
                    </div>
                );

            case 4: // Car Body Photo
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Upload photos of vehicle from all angles</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Front View</p>
                                <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700">Upload</button>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Back View</p>
                                <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700">Upload</button>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Left Side</p>
                                <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700">Upload</button>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Right Side</p>
                                <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700">Upload</button>
                            </div>
                        </div>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Complete Photo Upload
                        </button>
                    </div>
                );

            case 6: // Update Customer Details
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Fill in complete customer and vehicle information</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                                <input type="text" placeholder="Ahmad bin Abdullah" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                                <input type="tel" placeholder="+60 12-345 6789" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Car Model *</label>
                                <input type="text" placeholder="Honda Civic 2020" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (km) *</label>
                                <input type="number" placeholder="45230" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Chassis Number *</label>
                                <input type="text" placeholder="MH1234567890" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Car Plate Number *</label>
                                <input type="text" placeholder="WXY 1234" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Save Customer Details
                        </button>
                    </div>
                );

            case 8: // Spare Parts Needed
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Select required spare parts from catalog</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Select Parts Category</h4>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4">
                                <option>-- Select Category --</option>
                                <option>Brake System</option>
                                <option>Engine Parts</option>
                                <option>Electrical</option>
                                <option>AC System</option>
                            </select>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" className="w-5 h-5" />
                                        <div>
                                            <p className="font-medium">Brake Pads (Front)</p>
                                            <p className="text-sm text-gray-600">Part #: BP-F-001</p>
                                        </div>
                                    </div>
                                    <input type="number" placeholder="Qty" className="w-20 px-3 py-1 border border-gray-300 rounded" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" className="w-5 h-5" />
                                        <div>
                                            <p className="font-medium">Engine Oil (5W-30)</p>
                                            <p className="text-sm text-gray-600">Part #: EO-5W30-4L</p>
                                        </div>
                                    </div>
                                    <input type="number" placeholder="Qty" className="w-20 px-3 py-1 border border-gray-300 rounded" />
                                </div>
                            </div>
                        </div>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Confirm Parts Selection
                        </button>
                    </div>
                );

            case 10: // Mark Up
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Set markup prices ensuring 60% profit margin</p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800"><strong>⚠️ Minimum Margin:</strong> 60% profit margin required</p>
                        </div>
                        <div className="space-y-3">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-semibold">Brake Pads (Front)</h4>
                                    <span className="text-sm text-gray-600">Qty: 1</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Supplier Price</label>
                                        <input type="number" value="150" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Markup Price (RM)</label>
                                        <input type="number" placeholder="375" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Profit Margin</label>
                                        <div className="px-3 py-2 bg-green-50 border border-green-300 rounded-lg text-green-700 font-semibold">
                                            60%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total Cost:</span>
                                <span>RM 1,080</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold text-green-600">
                                <span>Total Markup:</span>
                                <span>RM 2,700</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mt-2">
                                <span>Overall Margin:</span>
                                <span className="font-semibold">60%</span>
                            </div>
                        </div>
                        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Generate Quotation
                        </button>
                    </div>
                );

            case 12: // Quotation
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Generate and send PDF quotation to customer</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-6 bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Quotation Preview</h3>
                                <span className="text-sm text-gray-600">WF-2024-0001</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Customer:</span>
                                    <span className="font-medium">Ahmad bin Abdullah</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Vehicle:</span>
                                    <span className="font-medium">Honda Civic 2020 (WXY 1234)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="font-medium">03/02/2026</span>
                                </div>
                            </div>
                            <hr className="my-4" />
                            <div className="text-right">
                                <p className="text-2xl font-bold text-indigo-600">RM 2,700</p>
                                <p className="text-sm text-gray-600">Total Amount</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Generate PDF
                            </button>
                            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                                <Send className="w-4 h-4" /> Send to Customer
                            </button>
                        </div>
                    </div>
                );

            case 17: // QC
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Perform quality control inspection</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">All repairs completed as specified</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Test drive completed successfully</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">No additional issues found</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Vehicle ready for delivery</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Inspector Name</label>
                            <input type="text" placeholder="Encik Rahman" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div className="flex gap-3">
                            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                                <Check className="w-4 h-4" /> Approve QC
                            </button>
                            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
                                <X className="w-4 h-4" /> Reject - Needs Rework
                            </button>
                        </div>
                    </div>
                );

            case 3: // WhatsApp Group
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Create WhatsApp group for workflow communication</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Group Name *</label>
                            <input 
                                type="text" 
                                value={generateWhatsAppGroupName('WF-2024-0001', 'WXY 1234')} 
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" 
                            />
                            <p className="text-xs text-gray-500 mt-1">Auto-generated from Workflow Code and Plate Number</p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-900 mb-2">Add Members:</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-2 bg-white rounded">
                                    <input type="checkbox" checked className="w-4 h-4" readOnly />
                                    <span className="text-sm">Customer (+60 12-345 6789)</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-white rounded">
                                    <input type="checkbox" checked className="w-4 h-4" readOnly />
                                    <span className="text-sm">Service Advisor</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-white rounded">
                                    <input type="checkbox" checked className="w-4 h-4" readOnly />
                                    <span className="text-sm">Bay Mechanic</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Group Link (Auto-generated after creation)</label>
                            <input type="url" placeholder="https://chat.whatsapp.com/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" readOnly />
                        </div>
                        <a 
                            href={generateWhatsAppGroupLink('WF-2024-0001', 'Honda Civic Repair')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 w-fit"
                        >
                            <MessageSquare className="w-4 h-4" /> Create WhatsApp Group
                        </a>
                    </div>
                );

            case 5: // Chassis Number Photo
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Upload clear photo of chassis number plate</p>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 cursor-pointer">
                            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-700 font-medium mb-2">Click to upload chassis number photo</p>
                            <p className="text-sm text-gray-500">Ensure the chassis number is clearly visible</p>
                            <button className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                                Choose File
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chassis Number (Verify from photo)</label>
                            <input type="text" placeholder="MH1234567890" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Confirm Chassis Photo
                        </button>
                    </div>
                );

            case 7: // Troubleshooting
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Diagnose vehicle issues and document findings</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Category *</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option>-- Select Category --</option>
                                <option>Engine</option>
                                <option>Transmission</option>
                                <option>Brakes</option>
                                <option>Electrical</option>
                                <option>AC System</option>
                                <option>Suspension</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description *</label>
                            <textarea rows={4} placeholder="Describe the issue in detail..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis Result *</label>
                            <textarea rows={3} placeholder="What was found during troubleshooting..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Recommended Action *</label>
                            <textarea rows={2} placeholder="What needs to be done..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                            <Wrench className="w-4 h-4" /> Save Troubleshooting Report
                        </button>
                    </div>
                );

            case 9: // Spare Part Price/Availability
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Check supplier prices and availability for selected parts</p>
                        </div>
                        <div className="space-y-3">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold">Brake Pads (Front)</h4>
                                        <p className="text-sm text-gray-600">Part #: BP-F-001 | Qty: 1</p>
                                    </div>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">In Stock</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Supplier Price (RM)</label>
                                        <input type="number" value="150" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Delivery Time</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                            <option>Same Day</option>
                                            <option>1-2 Days</option>
                                            <option>3-5 Days</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <div className="flex justify-between">
                                <span className="font-semibold">Total Supplier Cost:</span>
                                <span className="text-lg font-bold">RM 1,080</span>
                            </div>
                        </div>
                        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Confirm Prices
                        </button>
                    </div>
                );

            case 11: // Spare Part Confirmation
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Send approval request to customer via email with secure link</p>
                        </div>

                        {/* Parts Summary */}
                        <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <h4 className="font-semibold mb-4">Parts Summary for Customer Approval</h4>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span>Brake Pads (Front) x1</span>
                                    <span className="font-medium">RM 375</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Engine Oil (5W-30) x1</span>
                                    <span className="font-medium">RM 240</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Air Filter x1</span>
                                    <span className="font-medium">RM 85</span>
                                </div>
                            </div>
                            <hr className="my-3" />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total Amount:</span>
                                <span className="text-indigo-600">RM 2,700</span>
                            </div>
                        </div>

                        {/* Customer Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Email *</label>
                            <input 
                                type="email" 
                                placeholder="john.doe@email.com" 
                                defaultValue="john.doe@email.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                            />
                        </div>

                        {/* Email Preview */}
                        <div className="border-2 border-indigo-200 rounded-lg bg-indigo-50 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-indigo-900">📧 Email Preview</h4>
                                    <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded">Draft</span>
                                </div>
                                <button
                                    onClick={() => setIsEmailPreviewExpanded(!isEmailPreviewExpanded)}
                                    className="text-indigo-700 hover:text-indigo-900 p-1 hover:bg-indigo-100 rounded transition-colors"
                                >
                                    {isEmailPreviewExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                            </div>
                            
                            {isEmailPreviewExpanded && (
                            <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
                                <div className="border-b pb-2">
                                    <p className="text-xs text-gray-600">To: john.doe@email.com</p>
                                    <p className="text-xs text-gray-600">From: AutoWorkshop &lt;noreply@autoworkshop.com&gt;</p>
                                    <p className="text-sm font-semibold mt-2">Subject: Parts Approval Required - WF-2024-0001</p>
                                </div>
                                
                                <div className="text-sm text-gray-700 space-y-2">
                                    <p>Dear John Doe,</p>
                                    <p>We have completed the diagnosis for your vehicle <strong>Honda Civic 2020 (WXY 1234)</strong>.</p>
                                    <p>The following parts are required for the repair:</p>
                                    
                                    <div className="bg-gray-50 rounded p-3 my-2">
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span>• Brake Pads (Front) x1</span>
                                                <span>RM 375</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>• Engine Oil (5W-30) x1</span>
                                                <span>RM 240</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>• Air Filter x1</span>
                                                <span>RM 85</span>
                                            </div>
                                            <div className="border-t pt-1 mt-2 flex justify-between font-bold">
                                                <span>Total Amount:</span>
                                                <span>RM 2,700</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <p className="font-semibold text-indigo-700">👉 Please click the link below to approve or decline:</p>
                                    
                                    <div className="bg-indigo-100 border border-indigo-300 rounded p-3 my-2">
                                        <a 
                                            href="/client-approval?token=abc123xyz789secure"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:text-indigo-800 underline break-all text-xs font-bold"
                                        >
                                            https://yourworkshop.com/client-approval?token=abc123xyz789secure
                                        </a>
                                        <p className="text-xs text-gray-600 mt-1">🔒 This secure link expires in 48 hours</p>
                                    </div>
                                    
                                    <p className="text-xs text-gray-600">If you have any questions, please contact us at +60 12-345 6789.</p>
                                    <p className="text-xs text-gray-600">Best regards,<br/>AutoWorkshop Team</p>
                                </div>
                            </div>
                            )}
                        </div>

                        {/* Generated Token Info */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-900 mb-2">🔑 Secure Token Generated</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Token:</span>
                                    <code className="bg-white px-2 py-1 rounded text-xs border">abc123xyz789secure</code>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Workflow:</span>
                                    <span className="font-medium">WF-2024-0001</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Expires:</span>
                                    <span className="font-medium">17/02/2026 14:30</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Status:</span>
                                    <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded text-xs">Pending</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                <Send className="w-4 h-4" /> Send Approval Email
                            </button>
                            <a 
                                href="/client-approval?token=abc123xyz789secure"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" /> Preview Approval Page
                            </a>
                        </div>
                    </div>
                );

            case 13: // Spare Part Order
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Place order with supplier for approved parts</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option>-- Select Supplier --</option>
                                <option>ABC Auto Parts Sdn Bhd</option>
                                <option>XYZ Motor Supply</option>
                                <option>Premium Parts Malaysia</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Order Number *</label>
                            <input type="text" placeholder="PO-2024-0001" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order Date *</label>
                                <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery *</label>
                                <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes</label>
                            <textarea rows={2} placeholder="Any special instructions..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Place Order
                        </button>
                    </div>
                );

            case 14: // Spare Parts in Workshop
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Confirm receipt of spare parts from supplier</p>
                        </div>
                        <div className="space-y-3">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold">Brake Pads (Front)</h4>
                                    <span className="text-sm text-gray-600">Qty Ordered: 1</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Qty Received</label>
                                        <input type="number" placeholder="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Condition</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                            <option>Good</option>
                                            <option>Damaged</option>
                                            <option>Wrong Item</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Received By *</label>
                            <input type="text" placeholder="Staff name" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Notes</label>
                            <textarea rows={2} placeholder="Any issues or remarks..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Confirm Parts Received
                        </button>
                    </div>
                );

            case 15: // Work Progress Photos
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Upload photos documenting repair progress</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Before Repair</p>
                                <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700">Upload</button>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">During Repair</p>
                                <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700">Upload</button>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 cursor-pointer">
                                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">After Repair</p>
                                <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700">Upload</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Progress Description</label>
                            <textarea rows={3} placeholder="Describe the work completed..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Save Progress Update
                        </button>
                    </div>
                );

            case 16: // Work Complete
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Mark all repair work as completed</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">All parts installed correctly</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">All repairs completed as per work order</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Vehicle tested and functional</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Work area cleaned</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Completed By *</label>
                            <input type="text" placeholder="Mechanic name" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Completion Notes</label>
                            <textarea rows={2} placeholder="Any final remarks..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Mark Work Complete
                        </button>
                    </div>
                );

            case 18: // Car Wash
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Complete vehicle washing and detailing</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-blue-600" />
                                <label className="text-gray-700">Exterior wash completed</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-blue-600" />
                                <label className="text-gray-700">Interior vacuum and cleaning</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-blue-600" />
                                <label className="text-gray-700">Windows cleaned</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-blue-600" />
                                <label className="text-gray-700">Tire shine applied</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Washed By</label>
                            <input type="text" placeholder="Staff name" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Complete Car Wash
                        </button>
                    </div>
                );

            case 19: // Send Receipt
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Generate and send invoice/receipt to customer</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-6 bg-white">
                            <h4 className="font-semibold mb-4">Invoice Summary</h4>
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between">
                                    <span>Parts Cost:</span>
                                    <span>RM 2,700</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Labor Cost:</span>
                                    <span>RM 500</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Service Tax (6%):</span>
                                    <span>RM 192</span>
                                </div>
                                <hr className="my-2" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Amount:</span>
                                    <span className="text-indigo-600">RM 3,392</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Send To *</label>
                            <input type="email" placeholder="customer@email.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div className="flex gap-3">
                            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Generate PDF
                            </button>
                            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                                <Send className="w-4 h-4" /> Send Receipt
                            </button>
                        </div>
                    </div>
                );

            case 20: // Receive Payment
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Record customer payment</p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                            <div className="flex justify-between text-lg">
                                <span className="font-semibold">Total Amount Due:</span>
                                <span className="text-2xl font-bold text-indigo-600">RM 3,392</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option>-- Select Method --</option>
                                <option>Cash</option>
                                <option>Credit Card</option>
                                <option>Debit Card</option>
                                <option>Online Banking</option>
                                <option>QR Payment (DuitNow)</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid (RM) *</label>
                                <input type="number" placeholder="3392.00" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                                <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Reference</label>
                            <input type="text" placeholder="TXN-123456" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Notes</label>
                            <textarea rows={2} placeholder="Any additional notes..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Confirm Payment Received
                        </button>
                    </div>
                );

            case 21: // Car Delivery
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800"><strong>User Action:</strong> Complete vehicle handover to customer</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Customer ID verified</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Payment confirmed</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Vehicle inspection with customer completed</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">All documents handed over</label>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 text-green-600" />
                                <label className="text-gray-700">Customer signature obtained</label>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Delivered By *</label>
                                <input type="text" placeholder="Staff name" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date & Time *</label>
                                <input type="datetime-local" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Feedback</label>
                            <textarea rows={3} placeholder="Customer comments or feedback..." className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Satisfaction Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} className="text-3xl text-gray-300 hover:text-yellow-400">★</button>
                                ))}
                            </div>
                        </div>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Complete Delivery & Close Workflow
                        </button>
                    </div>
                );

            default:
                return (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">Production UI for this step coming soon</p>
                        <p className="text-sm text-gray-500 mt-2">This step will have interactive forms, buttons, and input fields</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div
                style={{
                    background: 'linear-gradient(to right, #7c3aed, #8b5cf6, #6366f1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
                className="rounded-xl p-8 text-white border border-purple-300"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                        className="p-2 rounded-lg"
                    >
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">SuperAdmin Control Panel</h1>
                </div>
                <p style={{ color: '#f3e8ff' }} className="text-lg font-medium">Complete system access and oversight - Production-Level View</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Workflows</p>
                            <p className="text-3xl font-bold text-gray-900">24</p>
                        </div>
                        <Workflow className="w-12 h-12 text-indigo-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Users</p>
                            <p className="text-3xl font-bold text-gray-900">12</p>
                        </div>
                        <Users className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">System Steps</p>
                            <p className="text-3xl font-bold text-gray-900">21</p>
                        </div>
                        <BarChart3 className="w-12 h-12 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Completion Rate</p>
                            <p className="text-3xl font-bold text-gray-900">87%</p>
                        </div>
                        <CheckCircle className="w-12 h-12 text-teal-600" />
                    </div>
                </div>
            </div>

            {/* User Management Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">User Management</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
                    </div>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Add New User
                    </button>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-900">12</div>
                        <div className="text-sm text-purple-700">Total Users</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-900">9</div>
                        <div className="text-sm text-green-700">Active Users</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-900">2</div>
                        <div className="text-sm text-blue-700">Admins</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-orange-900">1</div>
                        <div className="text-sm text-orange-700">Pending</div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search users by name, email, or role..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <select className="px-4 py-2 border border-gray-300 rounded-lg">
                        <option>All Roles</option>
                        <option>SuperAdmin</option>
                        <option>Admin</option>
                        <option>Management</option>
                        <option>Bay Team</option>
                        <option>Service Advisor</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>Pending</option>
                    </select>
                </div>

                {/* Users Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflows</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* SuperAdmin */}
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">SA</div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">Super Administrator</div>
                                            <div className="text-sm text-gray-500">superadmin@workshop.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium border bg-purple-100 text-purple-800 border-purple-300">SuperAdmin</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Just now</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">24</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                    <button className="text-gray-600 hover:text-gray-900">View</button>
                                </td>
                            </tr>

                            {/* Admin Users */}
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">AH</div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">Ahmad Hassan</div>
                                            <div className="text-sm text-gray-500">ahmad.hassan@workshop.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium border bg-indigo-100 text-indigo-800 border-indigo-300">Admin</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5 mins ago</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">18</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                    <button className="text-red-600 hover:text-red-900">Deactivate</button>
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">LT</div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">Lim Tan Wei</div>
                                            <div className="text-sm text-gray-500">lim.tan@workshop.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium border bg-indigo-100 text-indigo-800 border-indigo-300">Admin</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 hour ago</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                    <button className="text-red-600 hover:text-red-900">Deactivate</button>
                                </td>
                            </tr>

                            {/* Management */}
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">RK</div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">Raj Kumar</div>
                                            <div className="text-sm text-gray-500">raj.kumar@workshop.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium border bg-blue-100 text-blue-800 border-blue-300">Management</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 hours ago</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">22</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                    <button className="text-red-600 hover:text-red-900">Deactivate</button>
                                </td>
                            </tr>

                            {/* Bay Team */}
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">MR</div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">Mohd Rizal</div>
                                            <div className="text-sm text-gray-500">mohd.rizal@workshop.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium border bg-teal-100 text-teal-800 border-teal-300">Bay Team</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">30 mins ago</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">12</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                    <button className="text-red-600 hover:text-red-900">Deactivate</button>
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">KW</div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">Kumar Wong</div>
                                            <div className="text-sm text-gray-500">kumar.wong@workshop.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium border bg-teal-100 text-teal-800 border-teal-300">Bay Team</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">45 mins ago</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">9</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                    <button className="text-red-600 hover:text-red-900">Deactivate</button>
                                </td>
                            </tr>

                            {/* Service Advisors */}
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">SL</div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">Sarah Lee</div>
                                            <div className="text-sm text-gray-500">sarah.lee@workshop.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium border bg-cyan-100 text-cyan-800 border-cyan-300">Service Advisor</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15 mins ago</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">16</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                    <button className="text-red-600 hover:text-red-900">Deactivate</button>
                                </td>
                            </tr>

                            {/* Pending User */}
                            <tr className="hover:bg-gray-50 bg-yellow-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold">NP</div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">New Pending User</div>
                                            <div className="text-sm text-gray-500">pending@workshop.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium border bg-gray-100 text-gray-800 border-gray-300">Bay Team</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Never</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                                    <button className="text-red-600 hover:text-red-900">Reject</button>
                                </td>
                            </tr>

                            {/* Inactive User */}
                            <tr className="hover:bg-gray-50 opacity-60">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold">IA</div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">Inactive Account</div>
                                            <div className="text-sm text-gray-500">inactive@workshop.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium border bg-gray-100 text-gray-800 border-gray-300">Service Advisor</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">30 days ago</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-green-600 hover:text-green-900 mr-3">Activate</button>
                                    <button className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div>
                    <h3 className="text-lg font-semibold">System Settings</h3>
                    <p className="text-sm text-gray-600 mt-1">Configure system-wide settings and preferences</p>
                </div>

                {/* Workshop Information */}
                <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-600" />
                        Workshop Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Workshop Name</label>
                            <input type="text" value="Premium Auto Workshop Sdn Bhd" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                            <input type="text" value="SSM-1234567-X" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                            <input type="tel" value="+60 3-1234 5678" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input type="email" value="info@premiumauto.com.my" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <textarea rows={2} value="No. 123, Jalan Industri 4/5, Taman Perindustrian, 47100 Puchong, Selangor" className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        </div>
                    </div>
                    <button className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                        Save Workshop Info
                    </button>
                </div>

                {/* Workflow Configuration */}
                <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-blue-600" />
                        Workflow Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Default Profit Margin (%)</label>
                            <input type="number" value="60" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <p className="text-xs text-gray-500 mt-1">Minimum profit margin for parts markup</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Service Tax (%)</label>
                            <input type="number" value="6" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <p className="text-xs text-gray-500 mt-1">Government service tax rate</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Archive After (days)</label>
                            <input type="number" value="90" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <p className="text-xs text-gray-500 mt-1">Completed workflows auto-archive period</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Code Prefix</label>
                            <input type="text" value="WF" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                            <p className="text-xs text-gray-500 mt-1">Prefix for workflow unique codes</p>
                        </div>
                    </div>
                    <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Save Workflow Config
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="border-2 border-red-300 rounded-lg p-6 bg-red-50">
                    <h4 className="font-semibold mb-4 text-red-900 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Danger Zone
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                            <div>
                                <p className="font-medium text-gray-900">Clear All Notifications</p>
                                <p className="text-sm text-gray-600">Remove all system notifications</p>
                            </div>
                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Clear</button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                            <div>
                                <p className="font-medium text-gray-900">Reset All Settings</p>
                                <p className="text-sm text-gray-600">Restore default system settings</p>
                            </div>
                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Reset</button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                            <div>
                                <p className="font-medium text-gray-900">Delete All Archived Workflows</p>
                                <p className="text-sm text-gray-600">Permanently delete archived data</p>
                            </div>
                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
