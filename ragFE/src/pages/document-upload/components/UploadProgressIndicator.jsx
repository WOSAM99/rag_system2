import React from 'react';
import Icon from '../../../components/AppIcon';

const UploadProgressIndicator = ({ file, onCancel }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'FileText';
      case 'docx':
        return 'FileText';
      case 'txt':
        return 'FileText';
      default:
        return 'File';
    }
  };

  return (
    <div className="flex items-center p-4 bg-surface rounded-lg border border-border">
      <div className="flex-shrink-0 mr-4">
        <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
          <Icon name={getFileIcon(file.name)} size={20} className="text-primary" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-text-primary truncate pr-2">
            {file.name}
          </p>
          <span className="text-xs text-text-tertiary whitespace-nowrap">
            {formatFileSize(file.size)}
          </span>
        </div>
        
        <div className="flex items-center">
          <div className="flex-1 bg-border rounded-full h-2 mr-3">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${file.progress}%` }}
            />
          </div>
          <span className="text-xs text-text-secondary font-medium min-w-0">
            {Math.round(file.progress)}%
          </span>
        </div>
      </div>
      
      <button
        onClick={() => onCancel(file.id)}
        className="ml-4 p-2 text-text-tertiary hover:text-error hover:bg-error-light rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2"
        aria-label="Cancel upload"
      >
        <Icon name="X" size={16} />
      </button>
    </div>
  );
};

export default UploadProgressIndicator;