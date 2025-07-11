import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const QueryInput = ({ onSendMessage, isLoading, disabled }) => {
  const [query, setQuery] = useState('');
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);
  const maxChars = 2000;

  useEffect(() => {
    setCharCount(query.length);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeyDown);
      return () => textarea.removeEventListener('keydown', handleKeyDown);
    }
  }, [query]);

  const handleSend = () => {
    if (!query.trim() || isLoading || disabled || charCount > maxChars) return;
    
    onSendMessage(query.trim());
    setQuery('');
    setCharCount(0);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleClear = () => {
    setQuery('');
    setCharCount(0);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setQuery(value);
      
      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOverLimit = charCount > maxChars;
  const isNearLimit = charCount > maxChars * 0.8;

  return (
    <div className="space-y-3">
      {/* Input Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? "Select a profile and system prompt to start chatting..." : "Ask a question about your documents..."}
          disabled={disabled || isLoading}
          className={`w-full resize-none rounded-lg border px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 ${
            disabled 
              ? 'bg-surface border-border text-text-tertiary cursor-not-allowed' 
              : isOverLimit
                ? 'border-error focus:ring-error focus:border-error' :'border-border-strong hover:border-text-tertiary'
          }`}
          rows={1}
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        
        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!query.trim() || isLoading || disabled || isOverLimit}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            !query.trim() || isLoading || disabled || isOverLimit
              ? 'text-text-tertiary cursor-not-allowed' :'text-primary hover:bg-primary-light'
          }`}
          aria-label="Send message"
        >
          {isLoading ? (
            <Icon name="Loader2" size={20} className="animate-spin" />
          ) : (
            <Icon name="Send" size={20} />
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-text-tertiary">
          <span><kbd className="px-1.5 py-0.5 bg-surface rounded text-xs">Enter</kbd> to send</span>
          <span><kbd className="px-1.5 py-0.5 bg-surface rounded text-xs">Shift + Enter</kbd> for new line</span>
          <span><kbd className="px-1.5 py-0.5 bg-surface rounded text-xs">Ctrl + Enter</kbd> to force send</span>
          <span><kbd className="px-1.5 py-0.5 bg-surface rounded text-xs">Esc</kbd> to clear</span>
        </div>
        
        <div className={`font-medium ${
          isOverLimit 
            ? 'text-error' 
            : isNearLimit 
              ? 'text-warning' :'text-text-tertiary'
        }`}>
          {charCount}/{maxChars}
        </div>
      </div>

      {/* Character Limit Warning */}
      {isOverLimit && (
        <div className="flex items-center text-sm text-error">
          <Icon name="AlertCircle" size={16} className="mr-2" />
          <span>Message exceeds character limit. Please shorten your query.</span>
        </div>
      )}
    </div>
  );
};

export default QueryInput;