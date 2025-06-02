import React from 'react';

const ActionButton = ({ 
  children, 
  variant = 'primary', 
  disabled = false, 
  onClick, 
  className = '',
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-primary hover:bg-primary-hover text-white focus:ring-primary",
    secondary: "bg-surface hover:bg-border text-text-primary border border-border focus:ring-primary",
    danger: "bg-error hover:bg-red-700 text-white focus:ring-error"
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default ActionButton;