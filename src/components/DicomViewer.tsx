import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import useDicomParser from '../hooks/useDicomParser';

const DicomViewer: React.FC = () => {
  const { metadata, pixelData, parseDicom } = useDicomParser();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          parseDicom(e.target.result);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  useEffect(() => {
    if (pixelData && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = new ImageData(new Uint8ClampedArray(pixelData), 512, 512);
        ctx.putImageData(imageData, 0, 0);
      }
    }
  }, [pixelData]);

  return (
    <div className="flex flex-col items-center">
      <input type="file" onChange={handleFileChange} className="mb-4" />
      {metadata && (
        <div className="mb-4">
          <h2 className="text-xl font-bold">DICOM Metadata</h2>
          <p>Patient Name: {metadata.patientName}</p>
          <p>Study Date: {metadata.studyDate}</p>
          <p>Modality: {metadata.modality}</p>
        </div>
      )}
      {pixelData && (
        <Stage width={512} height={512}>
          <Layer>
            <Image image={canvasRef.current as any} />
          </Layer>
        </Stage>
      )}
      <canvas ref={canvasRef} width={512} height={512} style={{ display: 'none' }} />
    </div>
  );
};

export default DicomViewer;

