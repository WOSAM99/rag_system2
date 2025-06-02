import React, { useState, forwardRef } from 'react';
import Icon from '../AppIcon';

const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  icon,
  iconPosition = 'left',
  variant = 'default',
  className = '',
  id,
  name,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    if (onChange) onChange(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseInputClasses = 'block w-full rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: `border-border-strong focus:border-primary focus:ring-primary ${error ? 'border-error focus:border-error focus:ring-error' : ''}`,
    search: 'border-border-strong focus:border-primary focus:ring-primary pl-10',
    floating: `border-border-strong focus:border-primary focus:ring-primary ${error ? 'border-error focus:border-error focus:ring-error' : ''}`,
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base',
  };

  const size = props.size || 'medium';
  const inputClasses = `${baseInputClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const renderInput = () => {
    const inputProps = {
      ref,
      id: inputId,
      name,
      type: type === 'password' ? (showPassword ? 'text' : 'password') : type,
      value,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      disabled,
      required,
      placeholder: variant === 'floating' ? ' ' : placeholder,
      className: inputClasses,
      ...props,
    };

    if (type === 'textarea') {
      return <textarea {...inputProps} rows={props.rows || 4} />;
    }

    return <input {...inputProps} />;
  };

  const renderIcon = (iconName, position) => {
    if (!iconName) return null;
    
    const iconClasses = `absolute top-1/2 transform -translate-y-1/2 text-text-tertiary ${
      position === 'left' ? 'left-3' : 'right-3'
    }`;
    
    return (
      <Icon name={iconName} size={18} className={iconClasses} />
    );
  };

  const renderPasswordToggle = () => {
    if (type !== 'password') return null;
    
    return (
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-secondary focus:outline-none"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
      </button>
    );
  };

  if (variant === 'floating') {
    return (
      <div className="relative">
        {renderInput()}
        {label && (
          <label
            htmlFor={inputId}
            className={`absolute left-3 transition-all duration-200 pointer-events-none ${
              isFocused || value
                ? 'top-0 text-xs bg-white px-1 text-primary transform -translate-y-1/2'
                : 'top-1/2 text-sm text-text-tertiary transform -translate-y-1/2'
            }`}
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        {icon && iconPosition === 'left' && renderIcon(icon, 'left')}
        {icon && iconPosition === 'right' && renderIcon(icon, 'right')}
        {renderPasswordToggle()}
        {(error || helperText) && (
          <p className={`mt-1 text-xs ${error ? 'text-error' : 'text-text-secondary'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'search') {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="Search" size={18} className="text-text-tertiary" />
        </div>
        {renderInput()}
        {(error || helperText) && (
          <p className={`mt-1 text-xs ${error ? 'text-error' : 'text-text-secondary'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary mb-1"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {renderInput()}
        {icon && iconPosition === 'left' && renderIcon(icon, 'left')}
        {icon && iconPosition === 'right' && renderIcon(icon, 'right')}
        {renderPasswordToggle()}
      </div>
      {(error || helperText) && (
        <p className={`mt-1 text-xs ${error ? 'text-error' : 'text-text-secondary'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;