import { useState } from 'react';
import { useWorkflow } from '../../contexts/WorkflowContext';

interface WhatsAppGroupStepProps {
  workflowId: string;
}

export default function WhatsAppGroupStep({ workflowId }: WhatsAppGroupStepProps) {
  const { updateWorkflowDetails, completeStep } = useWorkflow();
  const [groupLink, setGroupLink] = useState('');

  const handleComplete = () => {
    if (!groupLink) {
      alert('Please enter the WhatsApp group link');
      return;
    }
    updateWorkflowDetails(workflowId, { whatsappGroupLink: groupLink });
    completeStep(workflowId, 3);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold mb-4">Step 3: WhatsApp Group Creation</h3>
      <p className="text-gray-600 mb-4">
        Create a dedicated WhatsApp group for this job for centralized communication.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp Group Link
        </label>
        <input
          type="url"
          value={groupLink}
          onChange={(e) => setGroupLink(e.target.value)}
          placeholder="https://chat.whatsapp.com/..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <button
        onClick={handleComplete}
        disabled={!groupLink}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Save Link & Mark Complete
      </button>
    </div>
  );
}
