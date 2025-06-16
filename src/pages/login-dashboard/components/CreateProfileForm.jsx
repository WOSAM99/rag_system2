import React, { useState, useEffect } from 'react';
import ActionButton from './ActionButton';
import Icon from '../../../components/AppIcon';

const CreateProfileForm = ({ onSubmit, onCancel, isLoading, profile }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        description: profile.description || ''
      });
    }
  }, [profile]);

  const profileTemplates = [
    {
      name: "Research Assistant",
      description: "Specialized in academic research and paper analysis. Helps with literature reviews, citation management, and research methodology."
    },
    {
      name: "Technical Writer",
      description: "Expert in creating technical documentation, API guides, and software manuals. Optimized for clear, concise technical communication."
    },
    {
      name: "Legal Advisor",
      description: "Trained on legal documents and case studies. Assists with contract analysis, legal research, and compliance documentation."
    },
    {
      name: "Content Creator",
      description: "Focused on creating engaging content, blog posts, and marketing materials. Helps with creative writing and content strategy."
    },
    {
      name: "Data Analyst",
      description: "Specialized in data analysis, statistical interpretation, and generating insights from complex datasets."
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTemplateSelect = (template) => {
    setFormData({
      name: template.name,
      description: template.description
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Profile name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Profile name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Profile name must be 50 characters or less';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 300) {
      newErrors.description = 'Description must be 300 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Template Selection */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Quick Templates (Optional)
        </label>
        <div className="grid grid-cols-1 gap-2">
          {profileTemplates.map((template, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleTemplateSelect(template)}
              className="text-left p-3 border border-border rounded-lg hover:bg-surface transition-colors"
              disabled={isLoading}
            >
              <div className="font-medium text-text-primary text-sm">{template.name}</div>
              <div className="text-text-secondary text-xs line-clamp-2">{template.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Name */}
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
            placeholder="Enter AI profile name (e.g., Research Assistant)"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-colors ${
              errors.name ? 'border-error focus:ring-error' : 'border-border-strong focus:border-primary'
            }`}
            maxLength={50}
            disabled={isLoading}
          />
          <div className="absolute right-3 top-2 text-text-tertiary text-xs">
            {formData.name.length}/50
          </div>
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-error">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
          Description <span className="text-error">*</span>
        </label>
        <div className="relative">
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what this AI profile specializes in and how it will be used..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-colors resize-none ${
              errors.description ? 'border-error focus:ring-error' : 'border-border-strong focus:border-primary'
            }`}
            maxLength={300}
            disabled={isLoading}
          />
          <div className="absolute right-3 bottom-2 text-text-tertiary text-xs">
            {formData.description.length}/300
          </div>
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-error">{errors.description}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <ActionButton
          type="submit"
          variant="primary"
          disabled={isLoading || !formData.name.trim() || !formData.description.trim()}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {profile ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Icon name={profile ? 'Save' : 'Plus'} size={16} className="mr-2" />
              {profile ? 'Update Profile' : 'Create Profile'}
            </>
          )}
        </ActionButton>
        
        <ActionButton
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Cancel
        </ActionButton>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-text-tertiary">
          After creating a profile, you can upload documents and start chatting with your AI assistant.
        </p>
      </div>
    </form>
  );
};

export default CreateProfileForm; 