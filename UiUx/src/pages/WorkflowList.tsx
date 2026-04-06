import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useWorkflow } from '../contexts/WorkflowContext';
import { useAuth } from '../contexts/AuthContext';
import { WorkflowStatus, Workflow } from '../types';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';

// Mock workflow data for demonstration
const mockWorkflows: Workflow[] = [
  {
    id: 'wf-001',
    uniqueCode: 'WF-2024-001',
    plateNumber: 'ABC-1234',
    status: WorkflowStatus.WORK_PROGRESS,
    currentStep: 8,
    createdAt: new Date('2024-02-10T09:30:00'),
    createdBy: 'admin',
    details: {
      customerName: 'John Doe',
      contactNumber: '+1234567890',
      mileage: 45000,
    }
  },
  {
    id: 'wf-002',
    uniqueCode: 'WF-2024-002',
    plateNumber: 'XYZ-5678',
    status: WorkflowStatus.TROUBLESHOOTING,
    currentStep: 3,
    createdAt: new Date('2024-02-12T14:20:00'),
    createdBy: 'bay1',
    details: {
      customerName: 'Jane Smith',
      contactNumber: '+0987654321',
      mileage: 62000,
    }
  }
];

export default function WorkflowList() {
  const { workflows: contextWorkflows, createWorkflow, deleteWorkflow } = useWorkflow();
  const { user } = useAuth();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');

  // Combine context workflows with mock data
  const allWorkflows = [...contextWorkflows, ...mockWorkflows];

  useEffect(() => {
    if (location.state?.createNew) {
      setShowCreateModal(true);
    }
  }, [location.state]);

  const filteredWorkflows = allWorkflows
    .filter(w => {
      const matchesSearch = w.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.uniqueCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.details.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const handleCreateWorkflow = () => {
    if (plateNumber.trim()) {
      createWorkflow(plateNumber);
      setPlateNumber('');
      setShowCreateModal(false);
    }
  };

  const handleDeleteWorkflow = (workflowId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('Are you sure you want to delete this workflow? This can only be done at Step 1.')) {
      const success = deleteWorkflow(workflowId);
      if (!success) {
        alert('Cannot delete workflow. Either it has progressed past Step 1 or you do not have permission.');
      }
    }
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.PENDING:
        return 'bg-gray-100 text-gray-800';
      case WorkflowStatus.TROUBLESHOOTING:
        return 'bg-orange-100 text-orange-800';
      case WorkflowStatus.WORK_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case WorkflowStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCreateWorkflow = user?.role === 'admin' || user?.role === 'bay' || user?.role === 'superadmin';
  const canDeleteWorkflow = user?.role === 'admin' || user?.role === 'management';

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Workflows</h2>
          <p className="text-gray-600 mt-1">Manage all workshop workflows</p>
        </div>
        {canCreateWorkflow && (
          <Link
            to="/workflows/create"
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Workflow
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by plate number, workflow ID, or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value={WorkflowStatus.PENDING}>Pending</option>
              <option value={WorkflowStatus.TROUBLESHOOTING}>Troubleshooting</option>
              <option value={WorkflowStatus.WORK_PROGRESS}>Work Progress</option>
              <option value={WorkflowStatus.COMPLETED}>Completed</option>
            </select>
          </div>
        </div>
      </div>


      {/* Workflows Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workflow ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plate Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Step
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWorkflows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-gray-500">
                        {searchTerm || statusFilter !== 'all'
                          ? 'No workflows match your filters.'
                          : 'No workflows yet. Create your first workflow to get started.'}
                      </p>
                      {canCreateWorkflow && !searchTerm && statusFilter === 'all' && (
                        <Link
                          to="/workflows/create"
                          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                          <Plus className="w-5 h-5" />
                          Create Workflow
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {workflow.uniqueCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {workflow.plateNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {workflow.details.customerName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Step {workflow.currentStep} / 21
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {workflow.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                      <Link
                        to={`/workflows/${workflow.uniqueCode}`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        View
                      </Link>
                      {canDeleteWorkflow && workflow.currentStep === 1 && (
                        <button
                          onClick={(e) => handleDeleteWorkflow(workflow.id, e)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete workflow (only at Step 1)"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Create New Workflow</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Car Plate Number *
                </label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC1234"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  This is Step 1 of the workflow. Enter the plate number of the car arriving at the workshop.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setPlateNumber('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWorkflow}
                  disabled={!plateNumber.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Create Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
