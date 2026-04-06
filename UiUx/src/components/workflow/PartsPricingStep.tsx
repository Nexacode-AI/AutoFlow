import { useState } from 'react';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { MessageSquare, ShieldCheck } from 'lucide-react';
import type { PartType } from '../../types';

const TYPE_BADGE: Record<PartType, string> = {
  ORI: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  OM:  'bg-amber-100 text-amber-800 border-amber-200',
};

interface PartsPricingStepProps {
  workflowId: string;
  workflow: any;
}

export default function PartsPricingStep({ workflowId, workflow }: PartsPricingStepProps) {
  const { workflowParts, updatePartPricing, createSupplierMessage, completeStep } = useWorkflow();
  const parts = workflowParts[workflowId] || [];
  const [supplierMessage, setSupplierMessage] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);

  const canCreateMessage = workflow.details.customerName && 
                          workflow.details.carModel &&
                          workflow.details.chassisNumber;

  const generateSupplierMessage = () => {
    if (!canCreateMessage) {
      alert('Please complete Step 6 (Customer Details) first!');
      return;
    }

    const message = `Workflow ID: ${workflow.uniqueCode}
Car Model: ${workflow.details.carModel}
Customer: ${workflow.details.customerName}

Required Parts:
${parts.map((part, index) => `${index + 1}. ${part.partName} (${part.categoryName}) - Qty: ${part.quantity}`).join('\n')}

Please provide prices and availability.`;

    setSupplierMessage(message);
    setShowMessageForm(true);
  };

  const handleSendMessage = () => {
    createSupplierMessage(workflowId, supplierMessage);
    alert('Supplier message created! Send this via WhatsApp to your suppliers.');
    setShowMessageForm(false);
    setSupplierMessage('');
  };

  const handlePriceUpdate = (partId: string, supplierPrice: number) => {
    // Default markup to achieve 60% margin
    const markupPrice = supplierPrice * 2.5; // 60% margin
    updatePartPricing(partId, supplierPrice, markupPrice);
  };

  const allPricesEntered = parts.every(p => p.supplierPrice && p.supplierPrice > 0);

  const handleComplete = () => {
    if (!allPricesEntered) {
      alert('Please enter supplier prices for all parts');
      return;
    }
    completeStep(workflowId, 9);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold mb-4">Step 9: Spare Part Price/Availability</h3>
      <p className="text-gray-600 mb-4">
        Create supplier inquiry messages and enter received prices.
      </p>

      {!canCreateMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Step 6 (Customer Details) must be completed before creating supplier messages.
          </p>
        </div>
      )}

      <button
        onClick={generateSupplierMessage}
        disabled={!canCreateMessage}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-6"
      >
        <MessageSquare className="w-5 h-5" />
        Generate Supplier Message
      </button>

      {/* Supplier Message Modal */}
      {showMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="font-semibold mb-4">Supplier Inquiry Message</h3>
            <textarea
              value={supplierMessage}
              onChange={(e) => setSupplierMessage(e.target.value)}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowMessageForm(false);
                  setSupplierMessage('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(supplierMessage);
                  alert('Message copied to clipboard!');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parts Pricing Table */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Enter Supplier Prices</h4>
        <div className="space-y-3">
          {parts.map((part) => (
            <div key={part.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium">{part.partName}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full border ${TYPE_BADGE[part.partType]}`}>
                      {part.partType}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" />{part.warranty}
                    </span>
                    <span className="text-xs text-gray-500">{part.categoryName} • Qty: {part.quantity}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">
                    Supplier Price (RM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={part.supplierPrice || ''}
                    onChange={(e) => handlePriceUpdate(part.id, parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                {part.markupPrice && (
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">
                      Markup Price (Auto)
                    </label>
                    <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium">
                      RM {part.markupPrice.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleComplete}
        disabled={!allPricesEntered}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Complete Step
      </button>
    </div>
  );
}
