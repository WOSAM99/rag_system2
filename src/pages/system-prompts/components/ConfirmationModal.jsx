import React, { useEffect } from 'react';
import ActionButton from './ActionButton';
import Icon from '../../../components/AppIcon';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'AlertTriangle',
          iconColor: 'text-error',
          iconBg: 'bg-error-light',
          confirmButton: 'danger'
        };
      case 'warning':
        return {
          icon: 'AlertCircle',
          iconColor: 'text-warning',
          iconBg: 'bg-warning-light',
          confirmButton: 'warning'
        };
      case 'info':
        return {
          icon: 'Info',
          iconColor: 'text-info',
          iconBg: 'bg-info-light',
          confirmButton: 'primary'
        };
      default:
        return {
          icon: 'AlertTriangle',
          iconColor: 'text-error',
          iconBg: 'bg-error-light',
          confirmButton: 'danger'
        };
    }
  };

  if (!isOpen) return null;

  const variantStyles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full ${variantStyles.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon name={variantStyles.icon} size={24} className={variantStyles.iconColor} />
            </div>
            <div className="flex-1">
              <h3 id="modal-title" className="text-lg font-semibold text-text-primary">
                {title}
              </h3>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p id="modal-description" className="text-text-secondary leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <ActionButton
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              {cancelText}
            </ActionButton>
            <ActionButton
              variant={variantStyles.confirmButton}
              onClick={onConfirm}
              isLoading={isLoading}
              disabled={isLoading}
              icon={isLoading ? 'Loader2' : undefined}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isLoading ? 'Processing...' : confirmText}
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;