import { useState, useCallback } from 'react';
import Konva from 'konva';

interface ImageState {
  image: HTMLImageElement | null;
  zoom: number;
  position: { x: number; y: number };
  brightness: number;
  contrast: number;
  windowWidth: number;
  windowCenter: number;
  cropRegion: { x: number; y: number; width: number; height: number } | null;
}

const useImageManipulation = () => {
  const [imageState, setImageState] = useState<ImageState>({
    image: null,
    zoom: 1,
    position: { x: 0, y: 0 },
    brightness: 0,
    contrast: 0,
    windowWidth: 255,
    windowCenter: 127,
    cropRegion: null,
  });

  const loadImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageState(prev => ({ 
          ...prev, 
          image: img,
          windowWidth: img.width,
          windowCenter: img.height / 2
        }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setImageState(prev => ({ ...prev, zoom }));
  }, []);

  const setPosition = useCallback((position: { x: number; y: number }) => {
    setImageState(prev => ({ ...prev, position }));
  }, []);

  const setBrightness = useCallback((brightness: number) => {
    setImageState(prev => ({ ...prev, brightness }));
  }, []);

  const setContrast = useCallback((contrast: number) => {
    setImageState(prev => ({ ...prev, contrast }));
  }, []);

  const setWindowLevel = useCallback((windowWidth: number, windowCenter: number) => {
    setImageState(prev => ({ ...prev, windowWidth, windowCenter }));
  }, []);

  const setCropRegion = useCallback((cropRegion: { x: number; y: number; width: number; height: number } | null) => {
    setImageState(prev => ({ ...prev, cropRegion }));
  }, []);

  const applyFilters = useCallback((node: Konva.Node) => {
    if (node instanceof Konva.Image) {
      node.cache();
      node.filters([
        Konva.Filters.Brighten,
        Konva.Filters.Contrast,
      ]);
      node.brightness(imageState.brightness);
      node.contrast(imageState.contrast);
      
      // Apply window leveling
      const canvas = node.getCanvas();
      const context = canvas.getContext();
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const { windowWidth, windowCenter } = imageState;
      
      for (let i = 0; i < data.length; i += 4) {
        const pixelValue = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const normalized = (pixelValue - windowCenter + 0.5 * windowWidth) / windowWidth;
        const windowedValue = Math.max(0, Math.min(255, normalized * 255));
        
        data[i] = windowedValue;
        data[i + 1] = windowedValue;
        data[i + 2] = windowedValue;
      }
      
      context.putImageData(imageData, 0, 0);
      node.draw();
    }
  }, [imageState.brightness, imageState.contrast, imageState.windowWidth, imageState.windowCenter]);

  return {
    imageState,
    loadImage,
    setZoom,
    setPosition,
    setBrightness,
    setContrast,
    setWindowLevel,
    setCropRegion,
    applyFilters,
  };
};

export default useImageManipulation;

