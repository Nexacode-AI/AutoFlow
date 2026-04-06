import { useState } from 'react';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { Upload, CheckCircle2 } from 'lucide-react';

interface WorkProgressPhotosProps {
  workflowId: string;
  onComplete: () => void;
}

const PHOTO_TYPES = [
  { value: 'AFTER_REMOVAL', label: 'After Removal' },
  { value: 'OLD_PART', label: 'Old Part' },
  { value: 'NEW_PART', label: 'New Part' },
  { value: 'AFTER_FIXED', label: 'After Fixed' }
];

export default function WorkProgressPhotos({ workflowId, onComplete }: WorkProgressPhotosProps) {
  const { workflowParts, photos, uploadPhoto } = useWorkflow();
  const parts = workflowParts[workflowId] || [];
  const confirmedParts = parts.filter(p => p.confirmed);
  const workflowPhotos = photos[workflowId] || [];
  const workProgressPhotos = workflowPhotos.filter(p => p.stepNumber === 15);

  const [selectedPart, setSelectedPart] = useState('');
  const [selectedPhotoType, setSelectedPhotoType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedPart || !selectedPhotoType || !selectedFile) {
      alert('Please select part, photo type, and file');
      return;
    }

    await uploadPhoto(workflowId, 15, selectedPhotoType, selectedFile, selectedPart);
    setSelectedFile(null);
    setPreview('');
    setSelectedPart('');
    setSelectedPhotoType('');
    alert('Photo uploaded successfully!');
  };

  const getPhotoCount = (partId: string, photoType: string) => {
    return workProgressPhotos.filter(p => p.partId === partId && p.photoType === photoType).length;
  };

  const checkCompleteness = () => {
    for (const part of confirmedParts) {
      for (const photoType of PHOTO_TYPES) {
        if (getPhotoCount(part.id, photoType.value) === 0) {
          return false;
        }
      }
    }
    return confirmedParts.length > 0;
  };

  const isComplete = checkCompleteness();

  const handleComplete = () => {
    if (!isComplete) {
      if (confirm('Not all required photos have been uploaded. Proceed anyway?')) {
        onComplete();
      }
    } else {
      onComplete();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold mb-4">Step 15: Work Progress Photos</h3>
      <p className="text-gray-600 mb-6">
        Upload 4 types of photos for each confirmed part: After Removal, Old Part, New Part, After Fixed
      </p>

      {/* Upload Form */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-3">Upload Photo</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Part *
            </label>
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose a part...</option>
              {confirmedParts.map((part) => (
                <option key={part.id} value={part.id}>
                  {part.partName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Type *
            </label>
            <select
              value={selectedPhotoType}
              onChange={(e) => setSelectedPhotoType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose type...</option>
              {PHOTO_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block w-full">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 cursor-pointer transition-colors">
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded" />
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to select photo</p>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedPart || !selectedPhotoType || !selectedFile}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Upload Photo
        </button>
      </div>

      {/* Progress Tracker */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Photo Progress</h4>
        <div className="space-y-4">
          {confirmedParts.map((part) => (
            <div key={part.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium mb-3">{part.partName}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PHOTO_TYPES.map((photoType) => {
                  const count = getPhotoCount(part.id, photoType.value);
                  return (
                    <div
                      key={photoType.value}
                      className={`p-2 rounded text-center text-sm ${
                        count > 0 ? 'bg-green-100 text-green-800' : 'bg-white text-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {count > 0 && <CheckCircle2 className="w-4 h-4" />}
                        <span>{photoType.label}</span>
                      </div>
                      <div className="text-xs">{count} photo(s)</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded Photos Gallery */}
      {workProgressPhotos.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">Uploaded Photos ({workProgressPhotos.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {workProgressPhotos.map((photo) => {
              const part = parts.find(p => p.id === photo.partId);
              return (
                <div key={photo.id} className="relative">
                  <img
                    src={photo.url}
                    alt={photo.photoType}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 rounded-b-lg">
                    <div className="text-xs">{photo.photoType}</div>
                    <div className="text-xs text-gray-300 truncate">{part?.partName}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Complete Button */}
      <div className="flex items-center justify-between">
        <div>
          {isComplete ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">All required photos uploaded</span>
            </div>
          ) : (
            <div className="text-sm text-orange-600">
              ⚠️ Some photos are missing. Complete all uploads before proceeding.
            </div>
          )}
        </div>
        <button
          onClick={handleComplete}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Complete Step
        </button>
      </div>
    </div>
  );
}
