import * as dicomParser from 'dicom-parser';

export interface DicomMetadata {
  patientName?: string;
  patientID?: string;
  studyDate?: string;
  modality?: string;
  institutionName?: string;
}

export const parseDicomFile = (file: File): Promise<{
  metadata: DicomMetadata;
  imageData: string;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const byteArray = new Uint8Array(arrayBuffer);
        
        // Parse the DICOM file
        const dataSet = dicomParser.parseDicom(byteArray);
        
        // Extract metadata
        const metadata: DicomMetadata = {
          patientName: extractTag(dataSet, '00100010'),
          patientID: extractTag(dataSet, '00100020'),
          studyDate: extractTag(dataSet, '00080020'),
          modality: extractTag(dataSet, '00080060'),
          institutionName: extractTag(dataSet, '00080080')
        };
        
        // Convert pixel data to image
        const pixelDataElement = dataSet.elements.x7fe00010;
        if (pixelDataElement) {
          const imageData = convertPixelDataToImage(dataSet);
          resolve({ metadata, imageData });
        } else {
          reject(new Error('No pixel data found in DICOM file'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Helper function to extract DICOM tag values
const extractTag = (dataSet: any, tag: string): string | undefined => {
  try {
    const element = dataSet.elements[tag];
    return element ? dataSet.string(tag) : undefined;
  } catch {
    return undefined;
  }
};

// Convert DICOM pixel data to image
const convertPixelDataToImage = (dataSet: any): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Cannot create canvas context');
  
  const pixelDataElement = dataSet.elements.x7fe00010;
  const rows = dataSet.uint16('x00280010');
  const columns = dataSet.uint16('x00280011');
  const pixelData = dataSet.byteArray.subarray(
    pixelDataElement.dataOffset,
    pixelDataElement.dataOffset + pixelDataElement.length
  );
  
  canvas.width = columns;
  canvas.height = rows;
  
  const imageData = ctx.createImageData(columns, rows);
  
  // Basic conversion - may need more sophisticated handling for different DICOM photometric interpretations
  for (let i = 0; i < pixelData.length; i++) {
    imageData.data[i * 4] = pixelData[i];     // R
    imageData.data[i * 4 + 1] = pixelData[i]; // G
    imageData.data[i * 4 + 2] = pixelData[i]; // B
    imageData.data[i * 4 + 3] = 255;          // A
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};