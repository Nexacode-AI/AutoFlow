import { useWorkflow } from '../../contexts/WorkflowContext';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import type { PartType } from '../../types';

const TYPE_BADGE: Record<PartType, string> = {
  ORI: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  OM:  'bg-amber-100 text-amber-800 border-amber-200',
};

interface PartsConfirmationStepProps {
  workflowId: string;
}

export default function PartsConfirmationStep({ workflowId }: PartsConfirmationStepProps) {
  const { workflowParts, documents, confirmParts } = useWorkflow();
  const parts = workflowParts[workflowId] || [];
  const workflowDocuments = documents[workflowId] || [];
  const quotation = workflowDocuments.find(d => d.documentType === 'QUOTATION');

  const handleSimulateCustomerConfirmation = () => {
    if (confirm('Simulate customer confirmation via Google Form?')) {
      confirmParts(workflowId);
      alert('Customer has confirmed the parts! Receipt auto-generated.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold mb-4">Step 11: Spare Part Confirmation to Owner</h3>
      <p className="text-gray-600 mb-4">
        Customer reviews and confirms parts via Google Form. System auto-completes when form is received.
      </p>

      {/* Quotation Link */}
      {quotation && quotation.googleFormUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-2">Google Form Quotation</h4>
          <p className="text-sm text-gray-600 mb-3">
            Share this link with the customer to confirm parts.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={quotation.googleFormUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(quotation.googleFormUrl!);
                alert('Link copied to clipboard!');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Copy Link
            </button>
            <a
              href={quotation.googleFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}

      {/* Parts List */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Parts Awaiting Confirmation</h4>
        <div className="space-y-2">
          {parts.map((part) => (
            <div key={part.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
              <div>
                <div className="font-medium">{part.partName}</div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full border ${TYPE_BADGE[part.partType]}`}>
                    {part.partType}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" />{part.warranty}
                  </span>
                  <span className="text-xs text-gray-500">Qty: {part.quantity}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-indigo-600">
                  RM {((part.markupPrice || 0) * part.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-indigo-50 rounded-lg flex justify-between items-center">
          <span className="font-medium">Total</span>
          <span className="font-bold text-indigo-600">
            RM {parts.reduce((sum, part) => sum + (part.markupPrice || 0) * part.quantity, 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Demo Action */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800 mb-3">
          <strong>Demo Mode:</strong> In production, this step auto-completes when customer submits the Google Form.
        </p>
        <button
          onClick={handleSimulateCustomerConfirmation}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Simulate Customer Confirmation
        </button>
      </div>
    </div>
  );
}
