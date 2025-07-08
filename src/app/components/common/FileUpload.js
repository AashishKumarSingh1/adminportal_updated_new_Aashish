'use client';

import { useState } from 'react';
import axios from 'axios';

export default function FileUpload({ onUploadComplete, initialFile = null, className = '' }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(initialFile);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setProgress(0);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      setUploadedFile(response.data);
      setProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!uploadedFile?.key) return;

    try {
      await axios.delete(`/api/delete/s3-file?key=${uploadedFile.key}`);
      setUploadedFile(null);
      setFile(null);
      setProgress(0);
      
      if (onUploadComplete) {
        onUploadComplete(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setError(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className={`file-upload ${className}`}>
      <div className="flex items-center space-x-4 mb-2">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={uploading}
        />
        
        <button
          onClick={handleUpload}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          disabled={uploading || !file}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {uploadedFile && (
          <button
            onClick={handleDelete}
            className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700">
            Delete
          </button>
        )}
      </div>

      {(file || uploadedFile) && (
        <div className="mb-2 text-sm text-gray-600">
          {file && <p>Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
          {uploadedFile && <p>Uploaded file: {uploadedFile.key.split('-').slice(1).join('-')}</p>}
        </div>
      )}

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}></div>
          <p className="text-xs text-gray-600 mt-1">{progress}% uploaded</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {uploadedFile && (
        <div className="mt-2 text-sm">
          <p className="text-green-600">Upload successful!</p>
          <a 
            href={uploadedFile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline">
            View file
          </a>
        </div>
      )}
    </div>
  );
} 