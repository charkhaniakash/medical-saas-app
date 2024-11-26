import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Medical Image Saa</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:underline">Image Editor</Link></li>
            <li><Link to="/dicom" className="hover:underline">DICOM Viewer</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

