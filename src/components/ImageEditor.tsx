import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import useImageManipulation from '../hooks/useImageManipulation';
import ImageToolbar from './ImageToolbar';
import Konva from 'konva';

const ImageEditor: React.FC = () => {
  const {
    imageState,
    loadImage,
    setZoom,
    setPosition,
    setBrightness,
    setContrast,
    setWindowLevel,
    setCropRegion,
    applyFilters,
  } = useImageManipulation();

  const stageRef = useRef<Konva.Stage | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    if (stageRef.current) {
      const stage = stageRef.current;
      const scaleBy = 1.05;
      stage.on('wheel', (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const oldScale = stage.scaleX();
        const { x: pointerX, y: pointerY } = stage.getPointerPosition() || { x: 0, y: 0 };
        const mousePointTo = {
          x: (pointerX - stage.x()) / oldScale,
          y: (pointerY - stage.y()) / oldScale,
        };
        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        setZoom(newScale);
        const newPos = {
          x: pointerX - mousePointTo.x * newScale,
          y: pointerY - mousePointTo.y * newScale,
        };
        setPosition(newPos);
      });
    }
  }, [setZoom, setPosition]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  const handleCropStart = () => {
    setIsCropping(true);
    setCropRegion({ x: 0, y: 0, width: 100, height: 100 });
  };

  const handleCropEnd = () => {
    setIsCropping(false);
    if (imageState.cropRegion && imageState.image) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = imageState.cropRegion.width;
        canvas.height = imageState.cropRegion.height;
        ctx.drawImage(
          imageState.image,
          imageState.cropRegion.x,
          imageState.cropRegion.y,
          imageState.cropRegion.width,
          imageState.cropRegion.height,
          0,
          0,
          imageState.cropRegion.width,
          imageState.cropRegion.height
        );
        canvas.toBlob((blob) => {
          if (blob) {
            const croppedImage = new window.Image();
            croppedImage.onload = () => {
              loadImage(new File([blob], 'cropped_image.png', { type: 'image/png' }));
            };
            croppedImage.src = URL.createObjectURL(blob);
          }
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input type="file" onChange={handleFileChange} className="mb-4" />
      <ImageToolbar
        brightness={imageState.brightness}
        contrast={imageState.contrast}
        windowWidth={imageState.windowWidth}
        windowCenter={imageState.windowCenter}
        onBrightnessChange={setBrightness}
        onContrastChange={setContrast}
        onWindowWidthChange={(width) => setWindowLevel(width, imageState.windowCenter)}
        onWindowCenterChange={(center) => setWindowLevel(imageState.windowWidth, center)}
        onCropStart={handleCropStart}
        onCropEnd={handleCropEnd}
        isCropping={isCropping}
      />
      <Stage
        width={800}
        height={600}
        ref={stageRef}
        draggable
        onDragEnd={(e) => setPosition(e.target.position())}
      >
        <Layer>
          {imageState.image && (
            <KonvaImage
              image={imageState.image}
              x={imageState.position.x}
              y={imageState.position.y}
              scaleX={imageState.zoom}
              scaleY={imageState.zoom}
              draggable
              onDragEnd={(e) => setPosition(e.target.position())}
              ref={(node) => {
                if (node && node instanceof Konva.Image) {
                  applyFilters(node);
                }
              }}
            />
          )}
          {isCropping && imageState.cropRegion && (
            <Rect
              x={imageState.cropRegion.x}
              y={imageState.cropRegion.y}
              width={imageState.cropRegion.width}
              height={imageState.cropRegion.height}
              stroke="white"
              strokeWidth={2}
              draggable
              onDragEnd={(e) => {
                setCropRegion({
                  ...imageState.cropRegion!,
                  x: e.target.x(),
                  y: e.target.y(),
                });
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default ImageEditor;

