import { useState } from 'react';
import { useWorkflow } from '../../contexts/WorkflowContext';

interface CustomerDetailsFormProps {
  workflowId: string;
  currentDetails: any;
  onComplete: () => void;
}

export default function CustomerDetailsForm({ workflowId, currentDetails, onComplete }: CustomerDetailsFormProps) {
  const { updateWorkflowDetails } = useWorkflow();
  const [details, setDetails] = useState({
    customerName: currentDetails.customerName || '',
    contactNumber: currentDetails.contactNumber || '',
    carModel: currentDetails.carModel || '',
    mileage: currentDetails.mileage || '',
    chassisNumber: currentDetails.chassisNumber || ''
  });

  const [showAlert, setShowAlert] = useState(false);

  const isComplete = details.customerName && details.contactNumber && details.carModel && 
                     details.mileage && details.chassisNumber;

  const handleSave = () => {
    updateWorkflowDetails(workflowId, details);
    alert('Customer details saved successfully!');
  };

  const handleComplete = () => {
    if (!isComplete) {
      setShowAlert(true);
      return;
    }
    updateWorkflowDetails(workflowId, details);
    onComplete();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold mb-4">Step 6: Update Customer Details</h3>
      
      {showAlert && !isComplete && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800">
            ⚠️ All customer details are mandatory before proceeding to supplier messages (Step 7).
          </p>
          <button
            onClick={() => setShowAlert(false)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name *
          </label>
          <input
            type="text"
            value={details.customerName}
            onChange={(e) => setDetails({ ...details, customerName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter customer name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number *
          </label>
          <input
            type="tel"
            value={details.contactNumber}
            onChange={(e) => setDetails({ ...details, contactNumber: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="+60123456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Car Model *
          </label>
          <input
            type="text"
            value={details.carModel}
            onChange={(e) => setDetails({ ...details, carModel: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Honda Civic 2020"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mileage (km) *
          </label>
          <input
            type="number"
            value={details.mileage}
            onChange={(e) => setDetails({ ...details, mileage: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., 50000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chassis Number *
          </label>
          <input
            type="text"
            value={details.chassisNumber}
            onChange={(e) => setDetails({ ...details, chassisNumber: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter chassis/VIN number"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          Save Details
        </button>
        <button
          onClick={handleComplete}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Complete Step
        </button>
      </div>
    </div>
  );
}
