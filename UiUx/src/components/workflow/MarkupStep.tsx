import { useState } from 'react';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { AlertCircle } from 'lucide-react';

interface MarkupStepProps {
  workflowId: string;
  onComplete: () => void;
}

export default function MarkupStep({ workflowId, onComplete }: MarkupStepProps) {
  const { workflowParts, updatePartPricing, generateQuotation } = useWorkflow();
  const parts = workflowParts[workflowId] || [];
  const [showOverride, setShowOverride] = useState(false);

  const totalCost = parts.reduce((sum, part) => sum + (part.supplierPrice || 0) * part.quantity, 0);
  const totalPrice = parts.reduce((sum, part) => sum + (part.markupPrice || 0) * part.quantity, 0);
  const totalProfit = totalPrice - totalCost;
  const overallMargin = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  const handleMarkupChange = (partId: string, newMarkupPrice: number) => {
    const part = parts.find(p => p.id === partId);
    if (part && part.supplierPrice) {
      updatePartPricing(partId, part.supplierPrice, newMarkupPrice);
    }
  };

  const handleProceed = () => {
    if (overallMargin < 60 && !showOverride) {
      alert(`Total profit margin is ${overallMargin.toFixed(1)}%. Minimum 60% required.`);
      return;
    }

    // Generate quotation
    generateQuotation(workflowId);
    onComplete();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold mb-4">Step 10: Mark Up</h3>
      <p className="text-gray-600 mb-4">
        Apply markup to parts. Minimum 60% profit margin required.
      </p>

      {/* Profit Margin Alert */}
      {overallMargin < 60 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium mb-2">
              Profit margin is below 60% ({overallMargin.toFixed(1)}%)
            </p>
            {!showOverride && (
              <button
                onClick={() => setShowOverride(true)}
                className="text-sm text-red-700 underline hover:text-red-900"
              >
                Override with special approval
              </button>
            )}
          </div>
        </div>
      )}

      {/* Parts Markup Table */}
      <div className="mb-6">
        <div className="space-y-3">
          {parts.map((part) => {
            const partCost = (part.supplierPrice || 0) * part.quantity;
            const partPrice = (part.markupPrice || 0) * part.quantity;
            const partProfit = partPrice - partCost;
            const partMargin = partCost > 0 ? (partProfit / partCost) * 100 : 0;

            return (
              <div key={part.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium">{part.partName}</div>
                    <div className="text-sm text-gray-600">
                      {part.categoryName} • Qty: {part.quantity}
                    </div>
                  </div>
                  <div className={`text-sm font-medium px-2 py-1 rounded ${
                    partMargin >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {partMargin.toFixed(1)}% margin
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Cost per unit</label>
                    <div className="text-sm font-medium">
                      RM {(part.supplierPrice || 0).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Markup Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={part.markupPrice || ''}
                      onChange={(e) => handleMarkupChange(part.id, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Total</label>
                    <div className="text-sm font-medium text-indigo-600">
                      RM {partPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Cost</div>
            <div className="font-medium">RM {totalCost.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Price</div>
            <div className="font-medium text-indigo-600">RM {totalPrice.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Profit</div>
            <div className="font-medium text-green-600">RM {totalProfit.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Overall Margin</div>
            <div className={`font-bold ${overallMargin >= 60 ? 'text-green-600' : 'text-red-600'}`}>
              {overallMargin.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleProceed}
          disabled={overallMargin < 60 && !showOverride}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {overallMargin < 60 && showOverride ? 'Proceed with Override' : 'Generate Quotation & Complete'}
        </button>
        {showOverride && (
          <button
            onClick={() => setShowOverride(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel Override
          </button>
        )}
      </div>
    </div>
  );
}
