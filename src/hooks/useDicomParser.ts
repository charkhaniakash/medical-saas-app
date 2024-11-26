import { useState, useCallback } from 'react';
import dicomParser from 'dicom-parser';

interface DicomMetadata {
  patientName: string;
  studyDate: string;
  modality: string;
}

const useDicomParser = () => {
  const [metadata, setMetadata] = useState<DicomMetadata | null>(null);
  const [pixelData, setPixelData] = useState<Uint8Array | null>(null);

  const parseDicom = useCallback((arrayBuffer: ArrayBuffer) => {
    try {
      const byteArray = new Uint8Array(arrayBuffer);
      const dataSet = dicomParser.parseDicom(byteArray);

      const patientName = dataSet.string('x00100010');
      const studyDate = dataSet.string('x00080020');
      const modality = dataSet.string('x00080060');

      if (patientName && studyDate && modality) {
        setMetadata({ patientName, studyDate, modality });
      } else {
        console.error('Missing required DICOM tags');
      }

      // Extract pixel data
      const pixelDataElement = dataSet.elements.x7fe00010;
      if (pixelDataElement) {
        setPixelData(new Uint8Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length));
      }
    } catch (error) {
      console.error('Error parsing DICOM file:', error);
    }
  }, []);

  return { metadata, pixelData, parseDicom };
};

export default useDicomParser;