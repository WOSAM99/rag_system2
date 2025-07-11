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
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-border rounded-lg px-3 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 hover:border-text-tertiary"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {selectedPrompt ? (
                <div>
                  <div className="font-medium text-text-primary text-sm truncate">{selectedPrompt.name}</div>
                  <div className="text-xs text-text-secondary mt-0.5 line-clamp-2">{selectedPrompt.description}</div>
                </div>
              ) : (
                <div className="text-text-tertiary text-sm">Select a prompt...</div>
              )}
            </div>
            <Icon 
              name="ChevronDown" 
              size={16} 
              className={`text-text-secondary transition-transform duration-200 ml-2 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
            <div className="py-1">
              {systemPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptSelect(prompt)}
                  className={`w-full text-left px-3 py-2.5 hover:bg-surface transition-colors duration-150 ${
                    selectedPrompt?.id === prompt.id ? 'bg-primary-light text-primary' : 'text-text-primary'
                  }`}
                  role="option"
                  aria-selected={selectedPrompt?.id === prompt.id}
                >
                  <div className="font-medium text-sm">{prompt.name}</div>
                  <div className="text-xs text-text-secondary mt-0.5 line-clamp-2">{prompt.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedPrompt && (
        <div className="mt-3 p-3 bg-surface rounded-lg">
          <div className="flex items-start">
            <Icon name="Info" size={14} className="text-info mt-0.5 mr-2 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-text-primary mb-1">Current Prompt:</div>
              <div className="text-xs text-text-secondary line-clamp-3">{selectedPrompt.prompt}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemPromptSelector;