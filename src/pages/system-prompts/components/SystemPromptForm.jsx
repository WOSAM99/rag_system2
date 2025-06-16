import React, { useState, useEffect } from 'react';
import ValidationMessage from './ValidationMessage';
import ActionButton from './ActionButton';
import Icon from '../../../components/AppIcon';

const SystemPromptForm = ({ prompt, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (prompt) {
      setFormData({
        name: prompt.name || '',
        description: prompt.description || '',
        prompt: prompt.prompt || ''
      });
    }
  }, [prompt]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'System prompt name is required';
        } else if (value.length > 50) {
          newErrors.name = 'Name must be 50 characters or less';
        } else {
          delete newErrors.name;
        }
        break;
      case 'description':
        if (!value.trim()) {
          newErrors.description = 'Description is required';
        } else if (value.length > 200) {
          newErrors.description = 'Description must be 200 characters or less';
        } else {
          delete newErrors.description;
        }
        break;
      case 'prompt':
        if (!value.trim()) {
          newErrors.prompt = 'Prompt content is required';
        } else if (value.length < 10) {
          newErrors.prompt = 'Prompt must be at least 10 characters';
        } else if (value.length > 2000) {
          newErrors.prompt = 'Prompt must be 2000 characters or less';
        } else {
          delete newErrors.prompt;
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
      description: true,
      prompt: true
    });

    // Validate all fields
    const isNameValid = validateField('name', formData.name);
    const isDescriptionValid = validateField('description', formData.description);
    const isPromptValid = validateField('prompt', formData.prompt);

    if (isNameValid && isDescriptionValid && isPromptValid) {
      onSubmit(formData);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  const insertTemplate = (template) => {
    const templates = {
      general: "You are a helpful AI assistant. Provide accurate, informative, and well-structured responses based on the provided context. Be concise yet comprehensive, and always cite your sources when referencing specific documents.",
      research: "You are a research analyst with expertise in academic writing and analysis. Provide detailed, evidence-based analysis with proper citations and academic rigor. Structure your responses with clear methodology, findings, and conclusions. Always reference specific documents and page numbers when available.",
      technical: "You are a technical expert specializing in software development and system architecture. Provide precise, actionable technical guidance with code examples and best practices. Focus on practical implementation details and include relevant security considerations.",
      legal: "You are a legal advisor assistant. Analyze legal documents with attention to compliance, risks, and regulatory requirements. Provide structured analysis highlighting key clauses, potential issues, and recommendations. Always include disclaimers about seeking professional legal counsel."
    };

    setFormData(prev => ({
      ...prev,
      prompt: templates[template]
    }));

    if (touched.prompt) {
      validateField('prompt', templates[template]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={handleKeyDown}>
      <div className="space-y-6">
        {/* System Prompt Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
            System Prompt Name <span className="text-error">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Enter system prompt name (e.g., Research Analyst, Technical Expert)"
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
              Choose a descriptive name that reflects the AI's role and expertise
            </p>
          )}
        </div>

        {/* Description Field */}
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
              onBlur={handleBlur}
              placeholder="Briefly describe the purpose and capabilities of this system prompt..."
              rows={3}
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
              Provide a clear description of what this prompt is designed to do
            </p>
          )}
        </div>

        {/* Prompt Content Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="prompt" className="block text-sm font-medium text-text-primary">
              Prompt Content <span className="text-error">*</span>
            </label>
            <div className="flex items-center gap-2">
              <Icon name="Lightbulb" size={14} className="text-text-tertiary" />
              <span className="text-xs text-text-tertiary">Use templates:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => insertTemplate('general')}
                  className="px-2 py-1 text-xs bg-surface hover:bg-border rounded transition-colors"
                  disabled={isLoading}
                >
                  General
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('research')}
                  className="px-2 py-1 text-xs bg-surface hover:bg-border rounded transition-colors"
                  disabled={isLoading}
                >
                  Research
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('technical')}
                  className="px-2 py-1 text-xs bg-surface hover:bg-border rounded transition-colors"
                  disabled={isLoading}
                >
                  Technical
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('legal')}
                  className="px-2 py-1 text-xs bg-surface hover:bg-border rounded transition-colors"
                  disabled={isLoading}
                >
                  Legal
                </button>
              </div>
            </div>
          </div>
          <div className="relative">
            <textarea
              id="prompt"
              name="prompt"
              value={formData.prompt}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Define how the AI should behave, respond, and what role it should take. Be specific about the tone, structure, and type of responses you want..."
              rows={8}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-colors resize-none font-mono text-sm ${
                errors.prompt && touched.prompt
                  ? 'border-error focus:ring-error' :'border-border-strong focus:border-primary'
              }`}
              maxLength={2000}
              disabled={isLoading}
              aria-describedby={errors.prompt && touched.prompt ? 'prompt-error' : 'prompt-help'}
            />
            <div className="absolute right-3 bottom-3 text-text-tertiary text-sm">
              {formData.prompt.length}/2000
            </div>
          </div>
          {errors.prompt && touched.prompt && (
            <ValidationMessage
              id="prompt-error"
              message={errors.prompt}
              type="error"
            />
          )}
          {!errors.prompt && (
            <div id="prompt-help" className="mt-2 p-3 bg-info-light border border-info border-opacity-20 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={16} className="text-info mt-0.5 flex-shrink-0" />
                <div className="text-sm text-text-secondary">
                  <p className="font-medium text-text-primary mb-1">Tips for effective system prompts:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Define the AI's role and expertise clearly</li>
                    <li>• Specify the desired response format and structure</li>
                    <li>• Include instructions for citing sources and references</li>
                    <li>• Set the tone and communication style</li>
                    <li>• Add any domain-specific guidelines or constraints</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
        <ActionButton
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={Object.keys(errors).length > 0 || !formData.name.trim() || !formData.description.trim() || !formData.prompt.trim()}
          icon={isLoading ? 'Loader2' : (prompt?.id ? 'Save' : 'Plus')}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          {isLoading 
            ? (prompt?.id ? 'Updating...' : 'Creating...') 
            : (prompt?.id ? 'Update System Prompt' : 'Create System Prompt')
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

export default SystemPromptForm;