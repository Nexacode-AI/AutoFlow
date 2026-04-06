import { useWorkflow } from '../contexts/WorkflowContext';
import { WorkflowStatus } from '../types';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';

export default function Reports() {
  const { workflows, workflowParts } = useWorkflow();

  // Calculate statistics
  const totalWorkflows = workflows.length;
  const completedWorkflows = workflows.filter(w => w.status === WorkflowStatus.COMPLETED).length;
  const inProgressWorkflows = workflows.filter(w => 
    w.status === WorkflowStatus.TROUBLESHOOTING || w.status === WorkflowStatus.WORK_PROGRESS
  ).length;
  const completionRate = totalWorkflows > 0 ? (completedWorkflows / totalWorkflows) * 100 : 0;

  // Calculate revenue (from completed workflows)
  const totalRevenue = workflows
    .filter(w => w.status === WorkflowStatus.COMPLETED)
    .reduce((sum, w) => {
      const parts = workflowParts[w.id] || [];
      return sum + parts.reduce((partSum, part) => 
        partSum + (part.markupPrice || 0) * part.quantity, 0
      );
    }, 0);

  const totalCost = workflows
    .filter(w => w.status === WorkflowStatus.COMPLETED)
    .reduce((sum, w) => {
      const parts = workflowParts[w.id] || [];
      return sum + parts.reduce((partSum, part) => 
        partSum + (part.supplierPrice || 0) * part.quantity, 0
      );
    }, 0);

  const totalProfit = totalRevenue - totalCost;
  const overallMargin = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // Most used parts
  const partUsage: Record<string, { name: string; count: number; category: string }> = {};
  Object.values(workflowParts).forEach(parts => {
    parts.forEach(part => {
      if (!partUsage[part.partId]) {
        partUsage[part.partId] = { name: part.partName, count: 0, category: part.categoryName };
      }
      partUsage[part.partId].count += part.quantity;
    });
  });
  const topParts = Object.values(partUsage).sort((a, b) => b.count - a.count).slice(0, 5);

  // Average workflow duration (for completed workflows)
  const completedWithTime = workflows.filter(w => w.status === WorkflowStatus.COMPLETED && w.completedAt);
  const avgDuration = completedWithTime.length > 0
    ? completedWithTime.reduce((sum, w) => {
        const duration = (w.completedAt!.getTime() - w.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return sum + duration;
      }, 0) / completedWithTime.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2>Reports & Analytics</h2>
        <p className="text-gray-600 mt-1">Workshop performance insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{totalWorkflows}</div>
          </div>
          <div className="text-sm text-gray-600">Total Workflows</div>
          <div className="text-xs text-gray-500 mt-1">
            {completedWorkflows} completed, {inProgressWorkflows} in progress
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{completionRate.toFixed(1)}%</div>
          </div>
          <div className="text-sm text-gray-600">Completion Rate</div>
          <div className="text-xs text-gray-500 mt-1">
            Based on {totalWorkflows} total workflows
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-indigo-600">
              RM {(totalRevenue / 1000).toFixed(1)}k
            </div>
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-xs text-gray-500 mt-1">
            Profit: RM {(totalProfit / 1000).toFixed(1)}k ({overallMargin.toFixed(1)}%)
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600">{avgDuration.toFixed(1)}</div>
          </div>
          <div className="text-sm text-gray-600">Avg. Days to Complete</div>
          <div className="text-xs text-gray-500 mt-1">
            Based on {completedWithTime.length} workflows
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Workflow Status Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium">
                  {workflows.filter(w => w.status === WorkflowStatus.PENDING).length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full"
                  style={{ 
                    width: `${(workflows.filter(w => w.status === WorkflowStatus.PENDING).length / totalWorkflows) * 100}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Troubleshooting</span>
                <span className="text-sm font-medium">
                  {workflows.filter(w => w.status === WorkflowStatus.TROUBLESHOOTING).length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ 
                    width: `${(workflows.filter(w => w.status === WorkflowStatus.TROUBLESHOOTING).length / totalWorkflows) * 100}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Work Progress</span>
                <span className="text-sm font-medium">
                  {workflows.filter(w => w.status === WorkflowStatus.WORK_PROGRESS).length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ 
                    width: `${(workflows.filter(w => w.status === WorkflowStatus.WORK_PROGRESS).length / totalWorkflows) * 100}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium">
                  {workflows.filter(w => w.status === WorkflowStatus.COMPLETED).length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ 
                    width: `${(workflows.filter(w => w.status === WorkflowStatus.COMPLETED).length / totalWorkflows) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Parts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Most Used Parts</h3>
          <div className="space-y-3">
            {topParts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No parts data available</p>
            ) : (
              topParts.map((part, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{part.name}</div>
                    <div className="text-xs text-gray-500">{part.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-600">{part.count}</div>
                    <div className="text-xs text-gray-500">units</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold mb-4">Financial Summary (Completed Workflows)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Cost</div>
            <div className="text-2xl font-bold text-gray-900">RM {totalCost.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-indigo-600">RM {totalRevenue.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Profit</div>
            <div className="text-2xl font-bold text-green-600">RM {totalProfit.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Profit Margin</div>
            <div className="text-2xl font-bold text-purple-600">{overallMargin.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Recent Completed Workflows */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold">Recent Completed Workflows</h3>
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
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workflows
                .filter(w => w.status === WorkflowStatus.COMPLETED)
                .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
                .slice(0, 10)
                .map((workflow) => {
                  const parts = workflowParts[workflow.id] || [];
                  const revenue = parts.reduce((sum, part) => 
                    sum + (part.markupPrice || 0) * part.quantity, 0
                  );
                  const cost = parts.reduce((sum, part) => 
                    sum + (part.supplierPrice || 0) * part.quantity, 0
                  );
                  const profit = revenue - cost;

                  return (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">
                        RM {revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        RM {profit.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {workflow.completedAt?.toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              {workflows.filter(w => w.status === WorkflowStatus.COMPLETED).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No completed workflows yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
