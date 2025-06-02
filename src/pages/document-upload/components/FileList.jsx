import React from 'react';
import Icon from '../../../components/AppIcon';

const FileList = ({ files, onDelete, onRetry }) => {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return { icon: 'CheckCircle', color: 'text-success' };
      case 'error':
        return { icon: 'XCircle', color: 'text-error' };
      case 'cancelled':
        return { icon: 'MinusCircle', color: 'text-text-tertiary' };
      default:
        return { icon: 'Clock', color: 'text-warning' };
    }
  };

  const completedFiles = files.filter(f => f.status === 'completed');
  const errorFiles = files.filter(f => f.status === 'error');
  const cancelledFiles = files.filter(f => f.status === 'cancelled');

  if (files.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            Uploaded Files ({files.length})
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            {completedFiles.length > 0 && (
              <span className="text-success">
                {completedFiles.length} completed
              </span>
            )}
            {errorFiles.length > 0 && (
              <span className="text-error">
                {errorFiles.length} failed
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {files.map((file) => {
          const statusInfo = getStatusIcon(file.status);
          
          return (
            <div key={file.id} className="p-4 hover:bg-surface transition-colors duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center">
                    <Icon name={getFileIcon(file.name)} size={20} className="text-text-secondary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-text-primary truncate pr-2">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Icon name={statusInfo.icon} size={16} className={statusInfo.color} />
                      <span className="text-xs text-text-tertiary whitespace-nowrap">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                  
                  {file.status === 'completed' && (
                    <p className="text-xs text-success">Upload completed successfully</p>
                  )}
                  
                  {file.status === 'error' && (
                    <p className="text-xs text-error">{file.error}</p>
                  )}
                  
                  {file.status === 'cancelled' && (
                    <p className="text-xs text-text-tertiary">Upload cancelled</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {file.status === 'error' && (
                    <button
                      onClick={() => onRetry(file.id)}
                      className="p-2 text-text-tertiary hover:text-primary hover:bg-primary-light rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-label="Retry upload"
                    >
                      <Icon name="RotateCcw" size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onDelete(file.id)}
                    className="p-2 text-text-tertiary hover:text-error hover:bg-error-light rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2"
                    aria-label="Delete file"
                  >
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileList;