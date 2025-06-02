import React from 'react';
import Icon from '../AppIcon';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
    secondary: 'border border-border-strong bg-white text-text-primary hover:bg-surface focus:ring-primary',
    tertiary: 'text-primary hover:text-primary-hover hover:bg-primary-light focus:ring-primary',
    destructive: 'bg-error text-white hover:bg-red-700 focus:ring-error',
    icon: 'text-text-secondary hover:text-text-primary hover:bg-surface focus:ring-primary',
  };

  const sizeClasses = {
    small: variant === 'icon' ? 'p-1' : 'px-3 py-1.5 text-sm',
    medium: variant === 'icon' ? 'p-2' : 'px-4 py-2 text-sm',
    large: variant === 'icon' ? 'p-3' : 'px-6 py-3 text-base',
  };

  const iconSizes = {
    small: 16,
    medium: 18,
    large: 20,
  };

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const renderIcon = (iconName, position) => {
    if (!iconName) return null;
    
    const iconSize = iconSizes[size];
    const iconClasses = variant === 'icon' ? '' : 
      position === 'left' ? 'mr-2' : 'ml-2';
    
    return (
      <Icon 
        name={iconName} 
        size={iconSize} 
        className={iconClasses}
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Icon name="Loader2" size={iconSizes[size]} className="animate-spin mr-2" />
          {variant !== 'icon' && (children || 'Loading...')}
        </>
      );
    }

    if (variant === 'icon') {
      return renderIcon(icon, 'left');
    }

    return (
      <>
        {icon && iconPosition === 'left' && renderIcon(icon, 'left')}
        {children}
        {icon && iconPosition === 'right' && renderIcon(icon, 'right')}
      </>
    );
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;