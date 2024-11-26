import React, { useState } from 'react';
import { parseDicomFile, DicomMetadata } from '../utils/dicomParser';
interface ImageUploaderProps {
  onUpload: (imageData: string, metadata?: DicomMetadata) => void;
}

export const DicomUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Supported file types
    const supportedTypes = [
      'image/png', 
      'image/jpeg', 
      'image/tiff', 
      'application/dicom'
    ];

    try {
      // Validate file type
      if (!supportedTypes.includes(file.type)) {
        setError('Unsupported file type. Please upload PNG, JPEG, TIFF, or DICOM files.');
        return;
      }

      // Handle different file types
      if (file.type === 'application/dicom' || file.name.toLowerCase().endsWith('.dcm')) {
        // DICOM file handling
        const result = await parseDicomFile(file);
        onUpload(result.imageData, result.metadata);
      } else {
        // Standard image file handling
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          onUpload(imageData);
        };
        reader.onerror = () => {
          setError('Error reading file');
        };
        reader.readAsDataURL(file);
      }
      
      setError(null);
    } catch (err) {
      setError('Error processing file');
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <div className="mb-4">
        <label 
          htmlFor="image-upload" 
          className="block text-sm font-medium text-gray-700"
        >
          Upload Image (PNG, JPEG, DICOM)
        </label>
        <input 
          type="file" 
          id="image-upload"
          accept=".png,.jpg,.jpeg,.tiff,.dcm,image/png,image/jpeg,image/tiff,application/dicom"
          onChange={handleFileUpload}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}
    </div>
  );
};