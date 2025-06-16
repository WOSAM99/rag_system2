import React from 'react';
import Icon from '../../../components/AppIcon';

const FileDropZone = ({ 
  isDragOver, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onClick, 
  supportedFormats, 
  maxFileSize 
}) => {
  const formatFileSize = (bytes) => {
    return `${bytes / (1024 * 1024)}MB`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        isDragOver
          ? 'border-primary bg-primary-light border-opacity-50' :'border-border hover:border-primary hover:bg-surface'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Click or drag files to upload"
    >
      <div className="flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-200 ${
          isDragOver ? 'bg-primary text-white' : 'bg-surface text-primary'
        }`}>
          <Icon name="Upload" size={32} />
        </div>
        
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {isDragOver ? 'Drop files here' : 'Click or drag files to upload'}
        </h3>
        
        <p className="text-text-secondary mb-4">
          Select multiple files or drag and drop them here
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-text-tertiary">
          <div className="flex items-center">
            <Icon name="FileText" size={16} className="mr-1" />
            {supportedFormats.map(format => format.toUpperCase()).join(', ')}
          </div>
          <div className="flex items-center">
            <Icon name="HardDrive" size={16} className="mr-1" />
            Max {formatFileSize(maxFileSize)}
          </div>
        </div>
      </div>
      
      {isDragOver && (
        <div className="absolute inset-0 bg-primary bg-opacity-10 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

export default FileDropZone;