import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiFile, FiX, FiCheck, FiLoader } from 'react-icons/fi';
import { apiService } from '../services/api';

const UploadPage = () => {
  const navigate = useNavigate();
  const [uploadState, setUploadState] = useState({
    file: null,
    uploading: false,
    progress: 0,
    result: null,
    error: null
  });
  const [clientInfo, setClientInfo] = useState({
    clientName: '',
    clientId: ''
  });

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setUploadState(prev => ({
        ...prev,
        error: 'Please upload a valid zip file (max 100MB)'
      }));
      return;
    }

    if (acceptedFiles.length > 0) {
      setUploadState(prev => ({
        ...prev,
        file: acceptedFiles[0],
        error: null
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-tar': ['.tar'],
      'application/gzip': ['.tar.gz', '.tgz']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false
  });

  const handleUpload = async () => {
    if (!uploadState.file) {
      setUploadState(prev => ({ ...prev, error: 'Please select a file first' }));
      return;
    }

    if (!clientInfo.clientName.trim()) {
      setUploadState(prev => ({ ...prev, error: 'Please enter your name' }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null
    }));

    try {
      const formData = new FormData();
      formData.append('codeArchive', uploadState.file);
      formData.append('clientName', clientInfo.clientName.trim());
      formData.append('clientId', clientInfo.clientId || `client_${Date.now()}`);

      const response = await apiService.uploadCode(formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadState(prev => ({ ...prev, progress }));
      });

      setUploadState(prev => ({
        ...prev,
        uploading: false,
        result: response.data,
        progress: 100
      }));

      // Auto-redirect to deployment page after successful upload
      setTimeout(() => {
        navigate(`/deployment/${response.data.data.projectId}`);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error.response?.data?.message || 'Upload failed. Please try again.'
      }));
    }
  };

  const removeFile = () => {
    setUploadState(prev => ({
      ...prev,
      file: null,
      error: null,
      result: null,
      progress: 0
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Upload Your Application
        </h1>
        <p className="text-xl text-gray-600">
          Upload your source code and let our system automatically containerize and deploy it
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Client Information */}
        <div className="bg-white p-6 rounded-xl card-shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Client Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={clientInfo.clientName}
                onChange={(e) => setClientInfo(prev => ({ ...prev, clientName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                disabled={uploadState.uploading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID (Optional)
              </label>
              <input
                type="text"
                value={clientInfo.clientId}
                onChange={(e) => setClientInfo(prev => ({ ...prev, clientId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Auto-generated if empty"
                disabled={uploadState.uploading}
              />
            </div>
          </div>
        </div>

        {/* Supported Runtimes */}
        <div className="bg-white p-6 rounded-xl card-shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Supported Runtimes
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Node.js', files: 'package.json, app.js, index.js' },
              { name: 'Python', files: 'requirements.txt, app.py, main.py' },
              { name: '.NET', files: '*.csproj, *.sln, Program.cs' },
              { name: 'Java', files: 'pom.xml, build.gradle, *.java' }
            ].map((runtime, index) => (
              <div key={index} className="flex items-start space-x-3">
                <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-800">{runtime.name}</div>
                  <div className="text-sm text-gray-600">{runtime.files}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="mt-8 bg-white p-6 rounded-xl card-shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Upload Source Code
        </h3>
        
        {!uploadState.file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <FiUpload className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-2">
              {isDragActive ? 'Drop your file here' : 'Drag & drop your zip file here'}
            </p>
            <p className="text-sm text-gray-500">
              or click to browse (Max 100MB)
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiFile className="text-2xl text-blue-600" />
                <div>
                  <div className="font-medium text-gray-800">
                    {uploadState.file.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatFileSize(uploadState.file.size)}
                  </div>
                </div>
              </div>
              {!uploadState.uploading && (
                <button
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <FiX className="text-xl" />
                </button>
              )}
            </div>

            {uploadState.uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Uploading...</span>
                  <span className="text-sm text-gray-600">{uploadState.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {uploadState.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{uploadState.error}</p>
          </div>
        )}

        {uploadState.result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FiCheck className="text-green-600" />
              <span className="font-medium text-green-800">Upload Successful!</span>
            </div>
            <p className="text-green-700 mb-2">
              Runtime detected: <strong>{uploadState.result.data.runtime}</strong>
            </p>
            <p className="text-green-700">
              Redirecting to deployment page...
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!uploadState.file || uploadState.uploading || !clientInfo.clientName.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            {uploadState.uploading ? (
              <>
                <FiLoader className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FiUpload />
                <span>Upload & Process</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;