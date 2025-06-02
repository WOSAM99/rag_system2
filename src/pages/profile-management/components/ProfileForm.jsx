import React, { useState, useEffect } from 'react';
import ValidationMessage from './ValidationMessage';
import ActionButton from './ActionButton';
import Icon from '../../../components/AppIcon';

const ProfileForm = ({ profile, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        description: profile.description || ''
      });
    }
  }, [profile]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Profile name is required';
        } else if (value.length > 50) {
          newErrors.name = 'Profile name must be 50 characters or less';
        } else {
          delete newErrors.name;
        }
        break;
      case 'description':
        if (value.length > 200) {
          newErrors.description = 'Description must be 200 characters or less';
        } else {
          delete newErrors.description;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      description: true
    });

    // Validate all fields
    const isNameValid = validateField('name', formData.name);
    const isDescriptionValid = validateField('description', formData.description);

    if (isNameValid && isDescriptionValid) {
      onSubmit(formData);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={handleKeyDown}>
      <div className="space-y-4">
        {/* Profile Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
            Profile Name <span className="text-error">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Enter profile name (e.g., Customer Support Agent)"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-colors ${
                errors.name && touched.name
                  ? 'border-error focus:ring-error' :'border-border-strong focus:border-primary'
              }`}
              maxLength={50}
              disabled={isLoading}
              aria-describedby={errors.name && touched.name ? 'name-error' : 'name-help'}
            />
            <div className="absolute right-3 top-3 text-text-tertiary text-sm">
              {formData.name.length}/50
            </div>
          </div>
          {errors.name && touched.name && (
            <ValidationMessage
              id="name-error"
              message={errors.name}
              type="error"
            />
          )}
          {!errors.name && (
            <p id="name-help" className="mt-1 text-sm text-text-secondary">
              Choose a descriptive name that reflects the profile's purpose
            </p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
            Description
          </label>
          <div className="relative">
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Describe the profile's role, expertise, and use cases..."
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-colors resize-none ${
                errors.description && touched.description
                  ? 'border-error focus:ring-error' :'border-border-strong focus:border-primary'
              }`}
              maxLength={200}
              disabled={isLoading}
              aria-describedby={errors.description && touched.description ? 'description-error' : 'description-help'}
            />
            <div className="absolute right-3 bottom-3 text-text-tertiary text-sm">
              {formData.description.length}/200
            </div>
          </div>
          {errors.description && touched.description && (
            <ValidationMessage
              id="description-error"
              message={errors.description}
              type="error"
            />
          )}
          {!errors.description && (
            <p id="description-help" className="mt-1 text-sm text-text-secondary">
              Optional: Provide details about the profile's capabilities and intended use
            </p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        <ActionButton
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={Object.keys(errors).length > 0 || !formData.name.trim()}
          icon={isLoading ? 'Loader2' : (profile?.id ? 'Save' : 'Plus')}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          {isLoading 
            ? (profile?.id ? 'Updating...' : 'Creating...') 
            : (profile?.id ? 'Update Profile' : 'Create Profile')
          }
        </ActionButton>
        
        <ActionButton
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          icon="X"
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          Cancel
        </ActionButton>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="text-xs text-text-tertiary flex items-center gap-1">
        <Icon name="Keyboard" size={12} />
        <span>Press Ctrl+Enter to submit</span>
      </div>
    </form>
  );
};

export default ProfileForm;