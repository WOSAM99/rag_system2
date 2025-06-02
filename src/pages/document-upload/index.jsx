import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import FileDropZone from './components/FileDropZone';
import UploadProgressIndicator from './components/UploadProgressIndicator';
import FileList from './components/FileList';
import ActionButton from './components/ActionButton';
import Icon from '../../components/AppIcon';
import { getCurrentUser } from '../../config/supabase';
import { getProfile } from '../../services/profilesApi';
import { 
  getDocumentsByProfile, 
  createDocument, 
  updateDocumentStatus 
} from '../../services/documentsApi';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState(null);

  const supportedFormats = ['pdf', 'docx', 'txt'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Load profile data from URL parameter
  useEffect(() => {
    const loadProfileData = async () => {
      const urlParams = new URLSearchParams(location.search);
      const profileParam = urlParams.get('profile');
      
      if (!profileParam) {
        setError('No profile selected. Please select a profile from the dashboard.');
        setIsLoadingProfile(false);
        return;
      }

      try {
        setIsLoadingProfile(true);
        setError(null);

        // Check authentication
        const user = getCurrentUser();
        if (!user) {
          setError('You must be logged in to upload documents.');
          setIsLoadingProfile(false);
          return;
        }

        console.log('Loading profile with ID:', profileParam);

        // Load profile data - use profileParam directly as it's already a UUID string
        const profile = await getProfile(profileParam);
        console.log('Profile loaded:', profile);
        
        setProfileId(profileParam);
        setCurrentProfile(profile);

        // Load existing documents for this profile
        const documents = await getDocumentsByProfile(profileParam);
        console.log('Existing documents loaded:', documents);
        
        // Transform documents to match component expectations
        const transformedDocuments = documents.map(doc => ({
          id: doc.id,
          name: doc.filename,
          size: doc.fileSize,
          uploadedAt: doc.createdAt,
          status: doc.processingStatus,
          profileId: profileParam,
          file: null, // Existing files don't have file objects
          progress: 100, // Existing files are already uploaded
          error: null
        }));
        
        setExistingDocuments(transformedDocuments);
        setFiles(transformedDocuments);

      } catch (err) {
        console.error('Error loading profile data:', err);
        setError(`Failed to load profile: ${err.message}`);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileData();
  }, [location.search]);

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

  const handleFileSelection = async (selectedFiles) => {
    if (!currentProfile || !profileId) {
      setError('No profile selected. Cannot upload files.');
      return;
    }

    const fileArray = Array.from(selectedFiles);
    const validFiles = [];

    for (const file of fileArray) {
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
          error: null,
          profileId: profileId,
          uploadedAt: new Date().toISOString().split('T')[0]
        };
        validFiles.push(fileObj);
      } else {
        const errorFileObj = {
          id: fileId,
          file: file,
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'error',
          error: validation.error,
          profileId: profileId
        };
        validFiles.push(errorFileObj);
      }
    }

    // Add new files to the UI immediately
    setFiles(prevFiles => [...prevFiles, ...validFiles]);

    // Process valid files
    for (const fileObj of validFiles) {
      if (fileObj.status === 'uploading') {
        await simulateUpload(fileObj);
      }
    }
  };

  const simulateUpload = async (fileObj) => {
    try {
      // Create document record in database first
      console.log('Creating document record for:', fileObj.name);
      const documentRecord = await createDocument(profileId, {
        filename: fileObj.name,
        fileType: fileObj.file.type || 'application/octet-stream',
        fileSize: fileObj.size
      });
      
      console.log('Document record created:', documentRecord);

      // Update file object with database ID
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileObj.id ? { ...f, databaseId: documentRecord.id } : f
        )
      );

      // Simulate upload progress
      const interval = setInterval(() => {
        setFiles(prevFiles => 
          prevFiles.map(f => {
            if (f.id === fileObj.id && f.status === 'uploading') {
              const newProgress = Math.min(f.progress + Math.random() * 15, 100);
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 200);

      // Complete upload after 3-5 seconds
      setTimeout(async () => {
        clearInterval(interval);
        
        try {
          // Update document status to completed in database
          if (documentRecord.id) {
            await updateDocumentStatus(documentRecord.id, 'completed');
          }
          
          setFiles(prevFiles => 
            prevFiles.map(f => 
              f.id === fileObj.id ? { 
                ...f, 
                progress: 100, 
                status: 'completed',
                uploadedAt: new Date().toISOString().split('T')[0]
              } : f
            )
          );
          
          console.log('Upload completed for:', fileObj.name);
        } catch (err) {
          console.error('Error updating document status:', err);
          setFiles(prevFiles => 
            prevFiles.map(f => 
              f.id === fileObj.id ? { 
                ...f, 
                status: 'error', 
                error: 'Failed to complete upload' 
              } : f
            )
          );
        }
      }, 3000 + Math.random() * 2000);

    } catch (err) {
      console.error('Error creating document record:', err);
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileObj.id ? { 
            ...f, 
            status: 'error', 
            error: 'Failed to create document record' 
          } : f
        )
      );
    }
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

  const handleDeleteFile = async (fileId) => {
    try {
      const fileToDelete = files.find(f => f.id === fileId);
      
      // If it's a database document, try to delete from database
      if (fileToDelete && fileToDelete.databaseId) {
        // Note: You might want to implement deleteDocument in documentsApi.js
        console.log('Would delete document from database:', fileToDelete.databaseId);
      }
      
      setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  const handleRetryUpload = async (fileId) => {
    const fileToRetry = files.find(f => f.id === fileId);
    if (fileToRetry && fileToRetry.file) {
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileId ? { ...f, progress: 0, status: 'uploading', error: null } : f
        )
      );
      
      await simulateUpload(fileToRetry);
    }
  };

  const handleCancelUpload = (fileId) => {
    setFiles(prevFiles => 
      prevFiles.map(f => 
        f.id === fileId ? { ...f, status: 'cancelled' } : f
      )
    );
  };

  const handleBackToDashboard = () => {
    navigate('/login-dashboard');
  };

  const handleBackToChat = () => {
    if (profileId) {
      navigate(`/chat-interface?profile=${profileId}`);
    } else {
      navigate('/login-dashboard');
    }
  };

  const completedFiles = files.filter(f => f.status === 'completed');
  const uploadingFiles = files.filter(f => f.status === 'uploading');
  const newlyUploadedFiles = files.filter(f => f.file !== null); // Files uploaded in this session

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="compact" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-error-light border border-error border-opacity-20 rounded-lg p-6 text-center">
            <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">Profile Not Found</h2>
            <p className="text-text-secondary mb-4">{error}</p>
            <ActionButton
              variant="primary"
              onClick={() => navigate('/login-dashboard')}
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Back to Dashboard
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="compact" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-warning-light border border-warning border-opacity-20 rounded-lg p-6 text-center">
            <Icon name="AlertTriangle" size={48} className="text-warning mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">No Profile Selected</h2>
            <p className="text-text-secondary mb-4">Please select a profile from the dashboard to upload documents.</p>
            <ActionButton
              variant="primary"
              onClick={() => navigate('/login-dashboard')}
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Back to Dashboard
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="compact" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                <Icon name="ArrowLeft" size={20} className="mr-2" />
                Dashboard
              </button>
              <span className="text-text-tertiary">•</span>
              <button
                onClick={handleBackToChat}
                className="flex items-center text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                <Icon name="MessageSquare" size={20} className="mr-2" />
                Chat
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Document Upload</h1>
              <p className="text-text-secondary">
                Upload documents to <span className="font-medium text-primary">{currentProfile.name}</span> profile
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                {currentProfile.description}
              </p>
            </div>
            <div className="hidden sm:flex items-center bg-surface px-4 py-2 rounded-lg">
              <Icon name="FileText" size={20} className="text-primary mr-2" />
              <span className="text-sm text-text-secondary">
                {completedFiles.length} total documents
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
            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  Documents in {currentProfile.name} ({files.length})
                </h3>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span>{completedFiles.length} completed</span>
                  {newlyUploadedFiles.length > 0 && (
                    <span className="text-success">{newlyUploadedFiles.filter(f => f.status === 'completed').length} newly uploaded</span>
                  )}
                </div>
              </div>
              <FileList
                files={files}
                onDelete={handleDeleteFile}
                onRetry={handleRetryUpload}
              />
            </div>
          )}

          {/* Action Buttons */}
          {newlyUploadedFiles.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <ActionButton
                variant="primary"
                onClick={handleBackToChat}
                disabled={uploadingFiles.length > 0}
                className="flex-1"
              >
                <Icon name="MessageSquare" size={20} className="mr-2" />
                Go to Chat ({newlyUploadedFiles.filter(f => f.status === 'completed').length} files ready)
              </ActionButton>
              
              <ActionButton
                variant="secondary"
                onClick={() => setFiles(existingDocuments)} // Keep existing files, remove newly uploaded ones
                className="flex-1"
              >
                <Icon name="X" size={20} className="mr-2" />
                Clear New Uploads
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
                <li>• Documents will be processed and indexed for this specific profile</li>
                <li>• All uploads are associated with the <strong>{currentProfile.name}</strong> profile</li>
                <li>• Use the chat interface to query your uploaded documents</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;