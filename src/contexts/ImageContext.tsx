import React, { createContext, useState, useContext, ReactNode } from 'react';

// Types for image and annotation state
interface ImageState {
  originalImage: string | null;
  processedImage: string | null;
  brightness: number;
  contrast: number;
  zoom: number;
  annotations: Annotation[];
}

interface Annotation {
  id: string;
  type: 'circle' | 'rectangle' | 'line' | 'angle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
}

interface ImageContextType {
  imageState: ImageState;
  updateImageState: (updates: Partial<ImageState>) => void;
  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (id: string) => void;
}

// Create the context
const ImageContext = createContext<ImageContextType | undefined>(undefined);

// Context Provider Component
export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [imageState, setImageState] = useState<ImageState>({
    originalImage: null,
    processedImage: null,
    brightness: 1,
    contrast: 1,
    zoom: 1,
    annotations: []
  });

  const updateImageState = (updates: Partial<ImageState>) => {
    setImageState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const addAnnotation = (annotation: Annotation) => {
    setImageState(prev => ({
      ...prev,
      annotations: [...prev.annotations, annotation]
    }));
  };

  const removeAnnotation = (id: string) => {
    setImageState(prev => ({
      ...prev,
      annotations: prev.annotations.filter(ann => ann.id !== id)
    }));
  };

  return (
    <ImageContext.Provider 
      value={{ 
        imageState, 
        updateImageState, 
        addAnnotation, 
        removeAnnotation 
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

// Custom hook for using the image context
export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return context;
};