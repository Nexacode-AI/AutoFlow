import { useState } from 'react';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { Upload, X } from 'lucide-react';

interface PhotoUploadStepProps {
  workflowId: string;
  stepNumber: number;
  photoType: string;
  title: string;
  description: string;
  onComplete: () => void;
}

export default function PhotoUploadStep({
  workflowId,
  stepNumber,
  photoType,
  title,
  description,
  onComplete
}: PhotoUploadStepProps) {
  const { uploadPhoto, photos } = useWorkflow();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const workflowPhotos = photos[workflowId] || [];
  const stepPhotos = workflowPhotos.filter(p => p.stepNumber === stepNumber);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one photo');
      return;
    }

    for (const file of selectedFiles) {
      await uploadPhoto(workflowId, stepNumber, photoType, file);
    }

    setSelectedFiles([]);
    setPreviews([]);
    alert('Photos uploaded successfully!');
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>

      {/* Uploaded Photos */}
      {stepPhotos.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Uploaded Photos ({stepPhotos.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stepPhotos.map((photo) => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.url}
                  alt="Uploaded"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload */}
      <div className="mb-4">
        <label className="block w-full">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 cursor-pointer transition-colors">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-1">Click to upload photos</p>
            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Preview Selected Files */}
      {previews.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs p-1 rounded">
                  {selectedFiles[index].name}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpload}
            className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Upload Selected Photos
          </button>
        </div>
      )}

      {/* Complete Step */}
      <div className="flex gap-3">
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
