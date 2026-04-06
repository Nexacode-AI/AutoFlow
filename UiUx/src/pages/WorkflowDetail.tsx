import { useParams, useNavigate } from 'react-router';
import { useWorkflow } from '../contexts/WorkflowContext';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Upload,
  FileText,
  History,
  Package
} from 'lucide-react';
import { WORKFLOW_STEPS, WorkflowStatus, StepStatus } from '../types';
import CustomerDetailsForm from '../components/workflow/CustomerDetailsForm';
import WhatsAppGroupStep from '../components/workflow/WhatsAppGroupStep';
import PhotoUploadStep from '../components/workflow/PhotoUploadStep';
import PartsSelectionStep from '../components/workflow/PartsSelectionStep';
import PartsPricingStep from '../components/workflow/PartsPricingStep';
import MarkupStep from '../components/workflow/MarkupStep';
import PartsConfirmationStep from '../components/workflow/PartsConfirmationStep';
import WorkProgressPhotos from '../components/workflow/WorkProgressPhotos';

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    workflows, 
    workflowSteps, 
    workflowParts,
    photos,
    documents,
    auditLogs,
    completeStep 
  } = useWorkflow();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'documents' | 'logs'>('details');

  const workflow = workflows.find(w => w.id === id);
  const steps = workflowSteps[id || ''] || [];
  const parts = workflowParts[id || ''] || [];
  const workflowPhotos = photos[id || ''] || [];
  const workflowDocuments = documents[id || ''] || [];
  const logs = auditLogs[id || ''] || [];

  if (!workflow) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Workflow not found</p>
        <button
          onClick={() => navigate('/workflows')}
          className="mt-4 text-indigo-600 hover:text-indigo-700"
        >
          Back to Workflows
        </button>
      </div>
    );
  }

  const currentStepData = steps.find(s => s.stepNumber === workflow.currentStep);
  const progressPercentage = ((workflow.currentStep - 1) / WORKFLOW_STEPS.length) * 100;

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
    }
  };

  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case StepStatus.COMPLETED:
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case StepStatus.IN_PROGRESS:
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const handleSimpleStepComplete = (stepNumber: number) => {
    if (confirm(`Mark Step ${stepNumber} as complete?`)) {
      completeStep(workflow.id, stepNumber);
    }
  };

  const renderStepAction = () => {
    const stepNumber = workflow.currentStep;

    // Step 2: Inspection Sheet
    if (stepNumber === 2) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Step 2: Inspection Sheet / Complaint Receive</h3>
          <p className="text-gray-600 mb-4">
            Service Advisor receives customer complaints and gets approval for inspection.
          </p>
          <button
            onClick={() => handleSimpleStepComplete(2)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Mark as Complete
          </button>
        </div>
      );
    }

    // Step 3: WhatsApp Group
    if (stepNumber === 3) {
      return <WhatsAppGroupStep workflowId={workflow.id} />;
    }

    // Step 4: Car Body Photo
    if (stepNumber === 4) {
      return (
        <PhotoUploadStep
          workflowId={workflow.id}
          stepNumber={4}
          photoType="BODY"
          title="Car Body Photo"
          description="Upload photos of the entire car body"
          onComplete={() => completeStep(workflow.id, 4)}
        />
      );
    }

    // Step 5: Chassis Number Photo
    if (stepNumber === 5) {
      return (
        <PhotoUploadStep
          workflowId={workflow.id}
          stepNumber={5}
          photoType="CHASSIS"
          title="Chassis Number Photo"
          description="Upload photo of the chassis number"
          onComplete={() => completeStep(workflow.id, 5)}
        />
      );
    }

    // Step 6: Customer Details
    if (stepNumber === 6) {
      return (
        <CustomerDetailsForm
          workflowId={workflow.id}
          currentDetails={workflow.details}
          onComplete={() => completeStep(workflow.id, 6)}
        />
      );
    }

    // Step 7: Troubleshooting (auto-completes with parts selection)
    if (stepNumber === 7) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Step 7: Troubleshooting</h3>
          <p className="text-gray-600 mb-4">
            Mechanics diagnose issues. This step will auto-complete when parts are selected in Step 8.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Status: TROUBLESHOOTING - Proceed to Step 8 to select parts
            </p>
          </div>
        </div>
      );
    }

    // Step 8: Spare Parts Needed
    if (stepNumber === 8) {
      return <PartsSelectionStep workflowId={workflow.id} />;
    }

    // Step 9: Spare Part Price/Availability
    if (stepNumber === 9) {
      return <PartsPricingStep workflowId={workflow.id} workflow={workflow} />;
    }

    // Step 10: Mark Up
    if (stepNumber === 10) {
      return <MarkupStep workflowId={workflow.id} onComplete={() => completeStep(workflow.id, 10)} />;
    }

    // Step 11: Spare Part Confirmation
    if (stepNumber === 11) {
      return <PartsConfirmationStep workflowId={workflow.id} />;
    }

    // Step 12: Quotation
    if (stepNumber === 12) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Step 12: Quotation</h3>
          <p className="text-gray-600 mb-4">
            Generate formal PDF quotation. This step is optional.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleSimpleStepComplete(12)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Skip Step
            </button>
            <button
              onClick={() => {
                // Generate quotation logic here
                alert('Quotation PDF generated!');
                handleSimpleStepComplete(12);
              }}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Generate Quotation
            </button>
          </div>
        </div>
      );
    }

    // Step 13: Spare Part Order
    if (stepNumber === 13) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Step 13: Spare Part Order</h3>
          <p className="text-gray-600 mb-4">
            Generate and send order message to suppliers.
          </p>
          <button
            onClick={() => {
              alert('Order message sent to suppliers!');
              handleSimpleStepComplete(13);
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Send Order & Mark Complete
          </button>
        </div>
      );
    }

    // Step 14: Spare Parts in Workshop
    if (stepNumber === 14) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Step 14: Spare Parts in Workshop</h3>
          <p className="text-gray-600 mb-4">
            Confirm that all ordered parts have been received.
          </p>
          <button
            onClick={() => handleSimpleStepComplete(14)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Confirm Parts Received
          </button>
        </div>
      );
    }

    // Step 15: Work Progress Photos
    if (stepNumber === 15) {
      return <WorkProgressPhotos workflowId={workflow.id} onComplete={() => completeStep(workflow.id, 15)} />;
    }

    // Step 16: Work Complete
    if (stepNumber === 16) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Step 16: Work Complete</h3>
          <p className="text-gray-600 mb-4">
            Mark the repair work as complete.
          </p>
          <button
            onClick={() => handleSimpleStepComplete(16)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Mark Work Complete
          </button>
        </div>
      );
    }

    // Step 17: QC
    if (stepNumber === 17) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Step 17: QC (Quality Control)</h3>
          <p className="text-gray-600 mb-4">
            Perform quality inspection on completed work.
          </p>
          <button
            onClick={() => handleSimpleStepComplete(17)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            QC Passed
          </button>
        </div>
      );
    }

    // Step 18: Car Wash
    if (stepNumber === 18) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Step 18: Car Wash</h3>
          <p className="text-gray-600 mb-4">
            Wash and clean the vehicle.
          </p>
          <button
            onClick={() => handleSimpleStepComplete(18)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Car Wash Complete
          </button>
        </div>
      );
    }

    // Step 19: Send Receipt
    if (stepNumber === 19) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Step 19: Send Receipt to Customer</h3>
          <p className="text-gray-600 mb-4">
            Send receipt to customer via PDF or hardcopy.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => alert('Digital receipt sent!')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Send Receipt (Digital)
            </button>
            <button
              onClick={() => alert('Receipt printed!')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Print Receipt
            </button>
            <button
              onClick={() => handleSimpleStepComplete(19)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Mark as Sent
            </button>
          </div>
        </div>
      );
    }

    // Step 20: Receive Payment
    if (stepNumber === 20) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Step 20: Receive Payment</h3>
          <p className="text-gray-600 mb-4">
            Confirm that payment has been received from customer.
          </p>
          <button
            onClick={() => handleSimpleStepComplete(20)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Payment Received
          </button>
        </div>
      );
    }

    // Step 21: Car Delivery
    if (stepNumber === 21) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Step 21: Car Delivery</h3>
          <p className="text-gray-600 mb-4">
            Deliver the vehicle to the customer. This will complete and close the workflow.
          </p>
          <button
            onClick={() => {
              if (confirm('Complete workflow and deliver car?')) {
                handleSimpleStepComplete(21);
                alert('Workflow completed! Summary PDF generated.');
              }
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Deliver Car & Complete Workflow
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold mb-4">Current Step</h3>
        <p className="text-gray-600">Step {stepNumber} actions will appear here.</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/workflows')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2>{workflow.uniqueCode}</h2>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
                {workflow.status}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              Plate: {workflow.plateNumber} | Step {workflow.currentStep} of {WORKFLOW_STEPS.length}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Steps Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Workflow Steps</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    step.stepNumber === workflow.currentStep
                      ? 'bg-indigo-50 border border-indigo-200'
                      : step.status === StepStatus.COMPLETED
                      ? 'bg-green-50'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        Step {step.stepNumber}
                      </span>
                      {step.status === StepStatus.COMPLETED && step.completedAt && (
                        <span className="text-xs text-gray-500">
                          {step.completedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{step.stepName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Step Action */}
          {workflow.status !== WorkflowStatus.COMPLETED && renderStepAction()}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Parts ({parts.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm ${
                    activeTab === 'photos'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Photos ({workflowPhotos.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm ${
                    activeTab === 'documents'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Documents ({workflowDocuments.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm ${
                    activeTab === 'logs'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Activity Log ({logs.length})
                  </div>
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'details' && (
                <div>
                  {parts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No parts selected yet</p>
                  ) : (
                    <div className="space-y-3">
                      {parts.map((part) => (
                        <div
                          key={part.id}
                          className={`p-4 rounded-lg border ${
                            part.confirmed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{part.partName}</div>
                              <div className="text-sm text-gray-600">{part.categoryName}</div>
                              <div className="text-sm text-gray-600 mt-1">Qty: {part.quantity}</div>
                            </div>
                            <div className="text-right">
                              {part.supplierPrice && (
                                <div className="text-sm text-gray-600">
                                  Cost: RM {part.supplierPrice.toFixed(2)}
                                </div>
                              )}
                              {part.markupPrice && (
                                <div className="font-medium text-indigo-600">
                                  Price: RM {part.markupPrice.toFixed(2)}
                                </div>
                              )}
                              {part.profitMargin && (
                                <div className="text-sm text-green-600">
                                  Margin: {part.profitMargin.toFixed(1)}%
                                </div>
                              )}
                            </div>
                          </div>
                          {part.confirmed && (
                            <div className="mt-2 text-sm text-green-700 font-medium">
                              ✓ Confirmed by Customer
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'photos' && (
                <div>
                  {workflowPhotos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No photos uploaded yet</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {workflowPhotos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={photo.url}
                            alt={photo.photoType}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 rounded-b-lg">
                            <div className="text-xs">{photo.photoType}</div>
                            <div className="text-xs text-gray-300">
                              {photo.uploadedAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div>
                  {workflowDocuments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No documents generated yet</p>
                  ) : (
                    <div className="space-y-3">
                      {workflowDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            <div>
                              <div className="font-medium">{doc.documentType}</div>
                              <div className="text-sm text-gray-600">
                                {doc.createdAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <button className="text-indigo-600 hover:text-indigo-700 text-sm">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'logs' && (
                <div>
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No activity yet</p>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div key={log.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium">{log.action}</span>
                            <span className="text-sm text-gray-500">
                              {log.createdAt.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">{log.userName}</div>
                          {log.details && (
                            <div className="text-sm text-gray-500 mt-2">
                              {JSON.stringify(log.details)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
