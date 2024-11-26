import { useState, useCallback } from 'react';

interface ImageManipulationOptions {
  brightness: number;
  contrast: number;
  zoom: number;
}

export const useImageManipulation = (initialImage: string | null) => {
  const [processedImage, setProcessedImage] = useState<string | null>(initialImage);
  const [options, setOptions] = useState<ImageManipulationOptions>({
    brightness: 1,
    contrast: 1,
    zoom: 1
  });

  const adjustBrightness = useCallback((value: number) => {
    setOptions(prev => ({ ...prev, brightness: value }));
    applyImageProcessing(value, options.contrast);
  }, []);

  const adjustContrast = useCallback((value: number) => {
    setOptions(prev => ({ ...prev, contrast: value }));
    applyImageProcessing(options.brightness, value);
  }, []);

  const zoomImage = useCallback((zoomLevel: number) => {
    setOptions(prev => ({ ...prev, zoom: zoomLevel }));
  }, []);

  const applyImageProcessing = useCallback((brightness: number, contrast: number) => {
    if (!initialImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        // Apply brightness and contrast
        ctx.filter = `brightness(${brightness * 100}%) contrast(${contrast * 100}%)`;
        ctx.drawImage(img, 0, 0);
        
        setProcessedImage(canvas.toDataURL());
      }
    };
    
    img.src = initialImage;
  }, [initialImage]);

  const resetImage = useCallback(() => {
    setProcessedImage(initialImage);
    setOptions({
      brightness: 1,
      contrast: 1,
      zoom: 1
    });
  }, [initialImage]);

  return {
    processedImage,
    brightness: options.brightness,
    contrast: options.contrast,
    zoom: options.zoom,
    adjustBrightness,
    adjustContrast,
    zoomImage,
    resetImage
  };
};