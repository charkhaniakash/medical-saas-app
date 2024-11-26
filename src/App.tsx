import React, { useState } from 'react';
import { ImageProvider } from './contexts/ImageContext';
import { ImageViewer } from './components/ImageViewer';
import { useImageManipulation } from './hooks/useImageManipulation';
import { DicomMetadata } from './utils/dicomParser';
import { DicomUploader } from './components/DicomUploader';

const App: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<DicomMetadata | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);

  // Image manipulation hook
  const {
    processedImage,
    brightness,
    contrast,
    zoom,
    adjustBrightness,
    adjustContrast,
    zoomImage,
    resetImage
  } = useImageManipulation(currentImage);

  // Handle image file upload (DICOM or PNG/JPEG)
  const handleImageUpload = (imageData: string, fileMetadata?: DicomMetadata) => {
    setCurrentImage(imageData);
    setMetadata(fileMetadata || null);
    // Reset annotations when new image is uploaded
    setAnnotations([]);
  };

  // Add new annotation
  const handleAddAnnotation = (annotation: any) => {
    setAnnotations(prev => [...prev, annotation]);
  };

  return (
    <ImageProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white p-4 shadow-md overflow-y-auto">
          <DicomUploader onUpload={handleImageUpload} />
          
          {/* Image Manipulation Controls */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Image Adjustments</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Brightness
                </label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="2" 
                  step="0.1" 
                  value={brightness}
                  onChange={(e) => adjustBrightness(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contrast
                </label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="2" 
                  step="0.1" 
                  value={contrast}
                  onChange={(e) => adjustContrast(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Zoom
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  value={zoom}
                  onChange={(e) => zoomImage(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Image Viewer */}
        <div className="flex-1 p-4 overflow-auto">
          {currentImage ? (
            <ImageViewer 
              imageUrl={processedImage || currentImage}
              annotations={annotations}
              onAddAnnotation={handleAddAnnotation}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Upload a DICOM or image file to get started
            </div>
          )}
        </div>

        {/* Metadata Display (for DICOM files) */}
        {metadata && (
          <div className="w-64 bg-white p-4 shadow-md overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Image Metadata</h3>
            <ul className="space-y-2">
              {Object.entries(metadata).map(([key, value]) => (
                value && (
                  <li key={key} className="text-sm">
                    <span className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </span>{' '}
                    {value}
                  </li>
                )
              ))}
            </ul>
          </div>
        )}
      </div>
    </ImageProvider>
  );
};

export default App;