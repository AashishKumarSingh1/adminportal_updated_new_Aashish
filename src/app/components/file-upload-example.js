'use client';

import { useState } from 'react';
import FileUpload from './common/FileUpload';

export default function FileUploadExample() {
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleUploadComplete = (fileData) => {
    setUploadedFile(fileData);
    console.log('File upload completed:', fileData);
    // Here you can save the fileData.url and fileData.key to your database
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">File Upload Example</h2>
      
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Upload a file to AWS S3</h3>
        <FileUpload 
          onUploadComplete={handleUploadComplete}
          initialFile={uploadedFile}
          className="border border-gray-200 rounded-lg p-4"
        />
      </div>
      
      {uploadedFile && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-medium mb-2">File Information:</h3>
          <p><strong>URL:</strong> {uploadedFile.url}</p>
          <p><strong>Key:</strong> {uploadedFile.key}</p>
          <p className="text-sm text-gray-500 mt-2">
            You can store these values in your database to reference this file.
          </p>
        </div>
      )}
    </div>
  );
} 