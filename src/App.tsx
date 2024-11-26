import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import ImageEditor from './components/ImageEditor';
import DicomViewer from './components/DicomViewer';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<ImageEditor />} />
            <Route path="/dicom" element={<DicomViewer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

