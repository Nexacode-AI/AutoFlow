import { useWorkflow } from '../contexts/WorkflowContext';
import { useAuth } from '../contexts/AuthContext';
import { WorkflowStatus, Role } from '../types';
import {
  Car,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { Link } from 'react-router';
import SuperAdminDashboard from './SuperAdminDashboard';

export default function Dashboard() {
  const { workflows } = useWorkflow();
  const { user } = useAuth();

  // Show SuperAdmin dashboard for superadmin users
  if (user?.role === Role.SUPERADMIN) {
    return <SuperAdminDashboard />;
  }

  const stats = {
    total: workflows.length,
    pending: workflows.filter(w => w.status === WorkflowStatus.PENDING).length,
    troubleshooting: workflows.filter(w => w.status === WorkflowStatus.TROUBLESHOOTING).length,
    workProgress: workflows.filter(w => w.status === WorkflowStatus.WORK_PROGRESS).length,
    completed: workflows.filter(w => w.status === WorkflowStatus.COMPLETED).length,
  };

  const recentWorkflows = workflows
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const statCards = [
    {
      label: 'Total Workflows',
      value: stats.total,
      icon: Car,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-gray-500',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      label: 'Troubleshooting',
      value: stats.troubleshooting,
      icon: AlertCircle,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Work Progress',
      value: stats.workProgress,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
  ];

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

  return (
    <div className="space-y-6">
      <div>
        <h2>Welcome back, {user?.name}!</h2>
        <p className="text-gray-600 mt-1">Here's what's happening in your workshop today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div className={`text-3xl font-bold ${stat.textColor}`}>
                {stat.value}
              </div>
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/workflows"
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Car className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold">View All Workflows</h3>
              <p className="text-sm text-gray-600">Manage active workflows</p>
            </div>
          </div>
        </Link>

        {(user?.role === 'admin' || user?.role === 'bay') && (
          <Link
            to="/workflows"
            state={{ createNew: true }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Create New Workflow</h3>
                <p className="text-sm text-gray-600">Start a new job</p>
              </div>
            </div>
          </Link>
        )}

        <Link
          to="/reports"
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">View Reports</h3>
              <p className="text-sm text-gray-600">Analytics & insights</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Workflows */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold">Recent Workflows</h3>
        </div>
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
              {recentWorkflows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No workflows yet. Create your first workflow to get started.
                  </td>
                </tr>
              ) : (
                recentWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {workflow.uniqueCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {workflow.plateNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Step {workflow.currentStep}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {workflow.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/workflows/${workflow.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
