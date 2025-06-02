import React from 'react';
import Icon from '../../../components/AppIcon';

const ActionButton = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary hover:bg-primary-hover text-white border-primary focus:ring-primary';
      case 'secondary':
        return 'bg-surface hover:bg-border text-text-primary border-border-strong focus:ring-primary';
      case 'danger':
        return 'bg-error hover:bg-red-700 text-white border-error focus:ring-error';
      case 'warning':
        return 'bg-warning hover:bg-yellow-600 text-white border-warning focus:ring-warning';
      case 'ghost':
        return 'bg-transparent hover:bg-surface text-text-primary border-transparent focus:ring-primary';
      default:
        return 'bg-primary hover:bg-primary-hover text-white border-primary focus:ring-primary';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-3 text-sm';
      case 'lg':
        return 'px-6 py-4 text-base';
      default:
        return 'px-4 py-3 text-sm';
    }
  };

  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const iconName = isLoading ? 'Loader2' : icon;
  const iconClassName = isLoading ? 'animate-spin' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {iconName && (
        <Icon 
          name={iconName} 
          size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} 
          className={iconClassName}
        />
      )}
      {children}
    </button>
  );
};

export default ActionButton;