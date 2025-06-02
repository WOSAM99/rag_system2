import React from 'react';
import Icon from '../../../components/AppIcon';

const ValidationMessage = ({ id, message, type = 'error', className = '' }) => {
  const getIconAndStyles = () => {
    switch (type) {
      case 'error':
        return {
          icon: 'AlertCircle',
          className: 'text-error bg-error-light border-error'
        };
      case 'warning':
        return {
          icon: 'AlertTriangle',
          className: 'text-warning bg-warning-light border-warning'
        };
      case 'success':
        return {
          icon: 'CheckCircle',
          className: 'text-success bg-success-light border-success'
        };
      case 'info':
        return {
          icon: 'Info',
          className: 'text-info bg-info-light border-info'
        };
      default:
        return {
          icon: 'AlertCircle',
          className: 'text-error bg-error-light border-error'
        };
    }
  };

  const { icon, className: typeClassName } = getIconAndStyles();

  if (!message) return null;

  return (
    <div
      id={id}
      className={`mt-2 p-3 rounded-md border flex items-start gap-2 ${typeClassName} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <Icon name={icon} size={16} className="flex-shrink-0 mt-0.5" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default ValidationMessage;