import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

const Dropdown = ({
  trigger,
  children,
  variant = 'select',
  placeholder = 'Select an option',
  value,
  onChange,
  options = [],
  disabled = false,
  error,
  label,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(value || null);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option);
    }
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event, option = null) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (option) {
        handleOptionSelect(option);
      } else {
        toggleDropdown();
      }
    }
  };

  const renderSelectDropdown = () => {
    const selectedLabel = selectedOption 
      ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
      : placeholder;

    return (
      <div className="relative" ref={dropdownRef}>
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1">
            {label}
          </label>
        )}
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`relative w-full bg-white border rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
            error ? 'border-error' : 'border-border-strong'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-border-strong'} ${className}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={`block truncate ${selectedOption ? 'text-text-primary' : 'text-text-tertiary'}`}>
            {selectedLabel}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <Icon 
              name="ChevronDown" 
              size={16} 
              className={`text-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {options.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              const isSelected = selectedOption === optionValue || 
                (typeof selectedOption === 'object' && selectedOption.value === optionValue);

              return (
                <div
                  key={index}
                  onClick={() => handleOptionSelect(optionValue)}
                  onKeyDown={(e) => handleKeyDown(e, optionValue)}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-surface ${
                    isSelected ? 'bg-primary-light text-primary' : 'text-text-primary'
                  }`}
                  role="option"
                  tabIndex={0}
                  aria-selected={isSelected}
                >
                  <span className="block truncate">{optionLabel}</span>
                  {isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <Icon name="Check" size={16} className="text-primary" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <p className="mt-1 text-xs text-error">{error}</p>
        )}
      </div>
    );
  };

  const renderActionMenu = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`inline-flex items-center p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {trigger || <Icon name="MoreVertical" size={20} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-md shadow-lg border border-border py-1 focus:outline-none">
          {children}
        </div>
      )}
    </div>
  );

  const renderProfileMenu = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`flex items-center p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {trigger || (
          <>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={18} className="text-white" />
            </div>
            <Icon name="ChevronDown" size={16} className="ml-1" />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-md shadow-lg border border-border py-1 focus:outline-none">
          {children}
        </div>
      )}
    </div>
  );

  const renderSystemPromptSelector = () => {
    const selectedLabel = selectedOption 
      ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
      : 'Select system prompt';

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`inline-flex items-center px-3 py-2 border border-border-strong rounded-md bg-white text-sm font-medium text-text-primary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${className}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <Icon name="Settings" size={16} className="mr-2" />
          <span className="truncate">{selectedLabel}</span>
          <Icon 
            name="ChevronDown" 
            size={16} 
            className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-64 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {options.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              const optionDescription = typeof option === 'object' ? option.description : null;
              const isSelected = selectedOption === optionValue || 
                (typeof selectedOption === 'object' && selectedOption.value === optionValue);

              return (
                <div
                  key={index}
                  onClick={() => handleOptionSelect(optionValue)}
                  onKeyDown={(e) => handleKeyDown(e, optionValue)}
                  className={`cursor-pointer select-none relative px-3 py-2 hover:bg-surface ${
                    isSelected ? 'bg-primary-light text-primary' : 'text-text-primary'
                  }`}
                  role="option"
                  tabIndex={0}
                  aria-selected={isSelected}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="block font-medium">{optionLabel}</span>
                      {optionDescription && (
                        <span className="block text-xs text-text-secondary mt-1">
                          {optionDescription}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Icon name="Check" size={16} className="text-primary ml-2" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  switch (variant) {
    case 'action-menu':
      return renderActionMenu();
    case 'profile-menu':
      return renderProfileMenu();
    case 'system-prompt':
      return renderSystemPromptSelector();
    default:
      return renderSelectDropdown();
  }
};

export default Dropdown;