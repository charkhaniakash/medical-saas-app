import React from 'react';

interface ImageToolbarProps {
  brightness: number;
  contrast: number;
  windowWidth: number;
  windowCenter: number;
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onWindowWidthChange: (value: number) => void;
  onWindowCenterChange: (value: number) => void;
  onCropStart: () => void;
  onCropEnd: () => void;
  isCropping: boolean;
}

const ImageToolbar: React.FC<ImageToolbarProps> = ({
  brightness,
  contrast,
  windowWidth,
  windowCenter,
  onBrightnessChange,
  onContrastChange,
  onWindowWidthChange,
  onWindowCenterChange,
  onCropStart,
  onCropEnd,
  isCropping,
}) => {
  return (
    <div className="bg-gray-200 p-4 rounded-lg mb-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="brightness" className="block text-sm font-medium text-gray-700">Brightness</label>
          <input
            type="range"
            id="brightness"
            min="-1"
            max="1"
            step="0.1"
            value={brightness}
            onChange={(e) => onBrightnessChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="contrast" className="block text-sm font-medium text-gray-700">Contrast</label>
          <input
            type="range"
            id="contrast"
            min="-100"
            max="100"
            value={contrast}
            onChange={(e) => onContrastChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={onCropStart}
          disabled={isCropping}
        >
          Start Crop
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={onCropEnd}
          disabled={!isCropping}
        >
          Apply Crop
        </button>
      </div>
    </div>
  );
};

export default ImageToolbar;

