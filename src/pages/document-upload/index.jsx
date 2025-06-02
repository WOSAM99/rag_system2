import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import FileDropZone from './components/FileDropZone';
import UploadProgressIndicator from './components/UploadProgressIndicator';
import FileList from './components/FileList';
import ActionButton from './components/ActionButton';
import Icon from '../../components/AppIcon';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState("Research Assistant");
  const [isDragOver, setIsDragOver] = useState(false);

  // Mock data for demonstration
  const mockProfiles = [
    { id: 1, name: "Research Assistant", documentCount: 12 },
    { id: 2, name: "Content Writer", documentCount: 8 },
    { id: 3, name: "Data Analyst", documentCount: 15 }
  ];

  const supportedFormats = ['pdf', 'docx', 'txt'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!supportedFormats.includes(fileExtension)) {
      return { valid: false, error: `Unsupported format. Please upload ${supportedFormats.join(', ').toUpperCase()} files only.` };
    }
    
    if (file.size > maxFileSize) {
      return { valid: false, error: 'File size exceeds 10MB limit.' };
    }
    
    return { valid: true };
  };

  const generateFileId = () => {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  };

  const handleFileSelection = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      const fileId = generateFileId();
      
      if (validation.valid) {
        const fileObj = {
          id: fileId,
          file: file,
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'uploading',
          error: null
        };
        validFiles.push(fileObj);
        simulateUpload(fileObj);
      } else {
        const errorFileObj = {
          id: fileId,
          file: file,
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'error',
          error: validation.error
        };
        validFiles.push(errorFileObj);
      }
    });

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const simulateUpload = (fileObj) => {
    const interval = setInterval(() => {
      setFiles(prevFiles => 
        prevFiles.map(f => {
          if (f.id === fileObj.id && f.status === 'uploading') {
            const newProgress = Math.min(f.progress + Math.random() * 15, 100);
            const newStatus = newProgress >= 100 ? 'completed' : 'uploading';
            return { ...f, progress: newProgress, status: newStatus };
          }
          return f;
        })
      );
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileObj.id ? { ...f, progress: 100, status: 'completed' } : f
        )
      );
    }, 3000 + Math.random() * 2000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelection(droppedFiles);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelection(e.target.files);
    }
  };

  const handleDeleteFile = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
  };

  const handleRetryUpload = (fileId) => {
    setFiles(prevFiles => 
      prevFiles.map(f => 
        f.id === fileId ? { ...f, progress: 0, status: 'uploading', error: null } : f
      )
    );
    
    const fileToRetry = files.find(f => f.id === fileId);
    if (fileToRetry) {
      simulateUpload(fileToRetry);
    }
  };

  const handleCancelUpload = (fileId) => {
    setFiles(prevFiles => 
      prevFiles.map(f => 
        f.id === fileId ? { ...f, status: 'cancelled' } : f
      )
    );
  };

  const completedFiles = files.filter(f => f.status === 'completed');
  const uploadingFiles = files.filter(f => f.status === 'uploading');

  return (
    <div className="min-h-screen bg-background">
      <Header variant="compact" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/login-dashboard')}
              className="flex items-center text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Back to Dashboard
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Document Upload</h1>
              <p className="text-text-secondary">
                Upload documents to <span className="font-medium text-primary">{currentProfile}</span> profile
              </p>
            </div>
            <div className="hidden sm:flex items-center bg-surface px-4 py-2 rounded-lg">
              <Icon name="FileText" size={20} className="text-primary mr-2" />
              <span className="text-sm text-text-secondary">
                {completedFiles.length} documents uploaded
              </span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-6">
          {/* File Drop Zone */}
          <FileDropZone
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            supportedFormats={supportedFormats}
            maxFileSize={maxFileSize}
          />

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Upload Progress Section */}
          {uploadingFiles.length > 0 && (
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Uploading Files ({uploadingFiles.length})
              </h3>
              <div className="space-y-3">
                {uploadingFiles.map(file => (
                  <UploadProgressIndicator
                    key={file.id}
                    file={file}
                    onCancel={() => handleCancelUpload(file.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <FileList
              files={files}
              onDelete={handleDeleteFile}
              onRetry={handleRetryUpload}
            />
          )}

          {/* Action Buttons */}
          {files.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <ActionButton
                variant="primary"
                onClick={() => navigate('/login-dashboard')}
                disabled={uploadingFiles.length > 0}
                className="flex-1"
              >
                <Icon name="Check" size={20} className="mr-2" />
                Complete Upload
              </ActionButton>
              
              <ActionButton
                variant="secondary"
                onClick={() => setFiles([])}
                className="flex-1"
              >
                <Icon name="X" size={20} className="mr-2" />
                Clear All
              </ActionButton>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-info-light border border-info border-opacity-20 rounded-lg p-6">
          <div className="flex items-start">
            <Icon name="Info" size={20} className="text-info mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-text-primary mb-2">Upload Guidelines</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Supported formats: PDF, DOCX, TXT</li>
                <li>• Maximum file size: 10MB per file</li>
                <li>• Multiple files can be uploaded simultaneously</li>
                <li>• Documents will be processed and indexed automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;