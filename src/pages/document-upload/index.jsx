import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import FileDropZone from './components/FileDropZone';
import UploadProgressIndicator from './components/UploadProgressIndicator';
import FileList from './components/FileList';
import ActionButton from './components/ActionButton';
import Icon from '../../components/AppIcon';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);

  // Mock profiles data - should match the dashboard data
  const mockProfiles = [
    {
      id: 1,
      name: "Research Assistant",
      description: "Specialized in academic research and paper analysis. Helps with literature reviews, citation management, and research methodology.",
      documentCount: 24,
      createdAt: "2024-01-15",
      lastUsed: "2024-01-20"
    },
    {
      id: 2,
      name: "Technical Writer",
      description: "Expert in creating technical documentation, API guides, and software manuals. Optimized for clear, concise technical communication.",
      documentCount: 18,
      createdAt: "2024-01-10",
      lastUsed: "2024-01-19"
    },
    {
      id: 3,
      name: "Legal Advisor",
      description: "Trained on legal documents and case studies. Assists with contract analysis, legal research, and compliance documentation.",
      documentCount: 32,
      createdAt: "2024-01-08",
      lastUsed: "2024-01-18"
    },
    {
      id: 4,
      name: "Marketing Strategist",
      description: "Focused on marketing campaigns, brand strategy, and customer engagement. Helps create compelling marketing content and strategies.",
      documentCount: 15,
      createdAt: "2024-01-12",
      lastUsed: "2024-01-17"
    }
  ];

  // Mock existing documents for each profile (simulate database)
  const mockDocuments = {
    1: [ // Research Assistant documents
      { id: 1, name: "machine_learning_principles.pdf", size: 2500000, uploadedAt: "2024-01-15", status: "completed" },
      { id: 2, name: "statistical_learning_intro.docx", size: 1800000, uploadedAt: "2024-01-16", status: "completed" },
      { id: 3, name: "research_methodology.txt", size: 500000, uploadedAt: "2024-01-17", status: "completed" }
    ],
    2: [ // Technical Writer documents
      { id: 4, name: "api_documentation_guide.pdf", size: 3200000, uploadedAt: "2024-01-10", status: "completed" },
      { id: 5, name: "software_architecture.docx", size: 2100000, uploadedAt: "2024-01-11", status: "completed" }
    ],
    3: [ // Legal Advisor documents
      { id: 6, name: "contract_analysis_2024.pdf", size: 4100000, uploadedAt: "2024-01-08", status: "completed" },
      { id: 7, name: "compliance_guidelines.docx", size: 2800000, uploadedAt: "2024-01-09", status: "completed" },
      { id: 8, name: "legal_precedents.txt", size: 1200000, uploadedAt: "2024-01-10", status: "completed" }
    ],
    4: [ // Marketing Strategist documents
      { id: 9, name: "marketing_strategy_2024.pdf", size: 1900000, uploadedAt: "2024-01-12", status: "completed" },
      { id: 10, name: "brand_guidelines.docx", size: 1500000, uploadedAt: "2024-01-13", status: "completed" }
    ]
  };

  const supportedFormats = ['pdf', 'docx', 'txt'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Read profile ID from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const profileParam = urlParams.get('profile');
    
    if (profileParam) {
      const selectedProfileId = parseInt(profileParam);
      const profile = mockProfiles.find(p => p.id === selectedProfileId);
      
      if (profile) {
        setProfileId(selectedProfileId);
        setCurrentProfile(profile);
        
        // Load existing documents for this profile
        const existingDocs = mockDocuments[selectedProfileId] || [];
        setFiles(existingDocs.map(doc => ({
          ...doc,
          profileId: selectedProfileId,
          file: null // Existing files don't have file objects
        })));
      } else {
        setError(`Profile with ID ${profileParam} not found.`);
      }
    } else {
      setError('No profile selected. Please select a profile from the dashboard.');
    }
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

  const handleFileSelection = (selectedFiles) => {
    if (!currentProfile) {
      setError('No profile selected. Cannot upload files.');
      return;
    }

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
          error: null,
          profileId: profileId, // Associate with current profile
          uploadedAt: new Date().toISOString().split('T')[0]
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
          error: validation.error,
          profileId: profileId
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

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading profile...</p>
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
                Upload documents to <span className="font-medium text-primary">{currentProfile.name}</span> profile
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                Profile ID: {profileId} • {currentProfile.description}
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
                onClick={() => navigate('/login-dashboard')}
                disabled={uploadingFiles.length > 0}
                className="flex-1"
              >
                <Icon name="Check" size={20} className="mr-2" />
                Complete Upload ({newlyUploadedFiles.filter(f => f.status === 'completed').length} files processed)
              </ActionButton>
              
              <ActionButton
                variant="secondary"
                onClick={() => setFiles(files.filter(f => f.file === null))} // Keep existing files, remove newly uploaded ones
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
                <li>• All uploads are associated with Profile ID: {profileId}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;