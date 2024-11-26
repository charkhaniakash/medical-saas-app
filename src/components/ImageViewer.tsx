import React, { useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';

interface ImageViewerProps {
  imageUrl: string;
  annotations?: any[];
  onAddAnnotation?: (annotation: any) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ 
  imageUrl, 
  annotations = [], 
  onAddAnnotation 
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [tool, setTool] = useState<'select' | 'circle' | 'rectangle'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState<any>(null);
  const stageRef = useRef(null);

  // Load image
  React.useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
    };
  }, [imageUrl]);

  // Handle drawing annotations
  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (tool !== 'select') {
      setIsDrawing(true);
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        setNewAnnotation({
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0
        });
      }
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;
    
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos && newAnnotation) {
      setNewAnnotation({
        ...newAnnotation,
        width: pos.x - newAnnotation.x,
        height: pos.y - newAnnotation.y
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && newAnnotation) {
      if (onAddAnnotation) {
        onAddAnnotation({
          ...newAnnotation,
          type: tool
        });
      }
      setIsDrawing(false);
      setNewAnnotation(null);
    }
  };

  // Zoom handling
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (stage) {
      const oldScale = scale;
      const pointer = stage.getPointerPosition();
      
      if (pointer) {
        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        setScale(newScale);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 left-2 z-10 bg-black/50 text-white p-2 rounded">
        <select 
          value={tool} 
          onChange={(e) => setTool(e.target.value as any)}
          className="bg-transparent"
        >
          <option value="select">Select</option>
          <option value="circle">Circle</option>
          <option value="rectangle">Rectangle</option>
        </select>
      </div>
      
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        ref={stageRef}
        scale={{ x: scale, y: scale }}
      >
        <Layer>
          {image && (
            <KonvaImage
              image={image}
              width={image.width}
              height={image.height}
            />
          )}
          
          {/* Existing Annotations */}
          {annotations.map((ann, index) => (
            ann.type === 'rectangle' ? (
              <Rect
                key={index}
                x={ann.x}
                y={ann.y}
                width={ann.width}
                height={ann.height}
                stroke="red"
                strokeWidth={2}
                fill="rgba(255,0,0,0.1)"
              />
            ) : ann.type === 'circle' ? (
              <Circle
                key={index}
                x={ann.x}
                y={ann.y}
                radius={Math.sqrt(ann.width ** 2 + ann.height ** 2)}
                stroke="blue"
                strokeWidth={2}
                fill="rgba(0,0,255,0.1)"
              />
            ) : null
          ))}
          
          {/* Drawing New Annotation */}
          {newAnnotation && (
            tool === 'rectangle' ? (
              <Rect
                x={newAnnotation.x}
                y={newAnnotation.y}
                width={newAnnotation.width}
                height={newAnnotation.height}
                stroke="green"
                strokeWidth={2}
                fill="rgba(0,255,0,0.1)"
              />
            ) : tool === 'circle' ? (
              <Circle
                x={newAnnotation.x}
                y={newAnnotation.y}
                radius={Math.sqrt(newAnnotation.width ** 2 + newAnnotation.height ** 2)}
                stroke="green"
                strokeWidth={2}
                fill="rgba(0,255,0,0.1)"
              />
            ) : null
          )}
        </Layer>
      </Stage>
    </div>
  );
};