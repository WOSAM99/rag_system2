import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SystemPromptSelector = ({ systemPrompts, selectedPrompt, onPromptChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePromptSelect = (prompt) => {
    onPromptChange(prompt);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-text-primary mb-2">
        System Prompt
      </label>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 hover:border-text-tertiary"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {selectedPrompt ? (
                <div>
                  <div className="font-medium text-text-primary">{selectedPrompt.name}</div>
                  <div className="text-sm text-text-secondary mt-1">{selectedPrompt.description}</div>
                </div>
              ) : (
                <div className="text-text-tertiary">Select a system prompt...</div>
              )}
            </div>
            <Icon 
              name="ChevronDown" 
              size={20} 
              className={`text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
            <div className="py-1">
              {systemPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptSelect(prompt)}
                  className={`w-full text-left px-4 py-3 hover:bg-surface transition-colors duration-150 ${
                    selectedPrompt?.id === prompt.id ? 'bg-primary-light text-primary' : 'text-text-primary'
                  }`}
                  role="option"
                  aria-selected={selectedPrompt?.id === prompt.id}
                >
                  <div className="font-medium">{prompt.name}</div>
                  <div className="text-sm text-text-secondary mt-1">{prompt.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedPrompt && (
        <div className="mt-3 p-3 bg-surface rounded-lg">
          <div className="flex items-start">
            <Icon name="Info" size={16} className="text-info mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-text-primary mb-1">Current Prompt:</div>
              <div className="text-sm text-text-secondary">{selectedPrompt.prompt}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemPromptSelector;