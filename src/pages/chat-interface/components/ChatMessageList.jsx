import React from 'react';
import Icon from '../../../components/AppIcon';

const ChatMessageList = ({ messages, isLoading, expandedSources, onToggleSource, onRetryMessage }) => {
  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(timestamp));
  };

  const TypingIndicator = () => (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-text-tertiary rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-text-tertiary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-text-tertiary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span className="text-sm text-text-secondary ml-2">AI is thinking...</span>
    </div>
  );

  const MessageContent = ({ message }) => {
    const paragraphs = message.content.split('\n\n');
    
    return (
      <div className="prose prose-sm max-w-none">
        {paragraphs.map((paragraph, index) => {
          if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
            return (
              <h4 key={index} className="font-semibold text-text-primary mt-4 mb-2 first:mt-0">
                {paragraph.replace(/\*\*/g, '')}
              </h4>
            );
          }
          return (
            <p key={index} className="text-text-primary mb-3 last:mb-0 leading-relaxed">
              {paragraph}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
            {/* Message Header */}
            <div className={`flex items-center mb-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-center ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-primary ml-2' : 'bg-surface mr-2'
                }`}>
                  <Icon 
                    name={message.type === 'user' ? 'User' : 'Bot'} 
                    size={16} 
                    className={message.type === 'user' ? 'text-white' : 'text-text-secondary'} 
                  />
                </div>
                <div className={`text-sm ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className="font-medium text-text-primary">
                    {message.type === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div className="text-text-tertiary">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className={`rounded-lg px-4 py-3 ${
              message.type === 'user' ?'bg-primary text-white ml-10' :'bg-surface text-text-primary mr-10'
            }`}>
              {message.type === 'user' ? (
                <p className="text-white">{message.content}</p>
              ) : (
                <MessageContent message={message} />
              )}

              {/* Error State */}
              {message.error && (
                <div className="mt-3 flex items-center justify-between bg-error-light border border-error border-opacity-20 rounded-lg p-3">
                  <div className="flex items-center">
                    <Icon name="AlertCircle" size={16} className="text-error mr-2" />
                    <span className="text-sm text-error">Failed to send message</span>
                  </div>
                  <button
                    onClick={() => onRetryMessage(message.id)}
                    className="text-sm text-error hover:text-error font-medium focus:outline-none"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 mr-10">
                <button
                  onClick={() => onToggleSource(message.id)}
                  className="flex items-center text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 focus:outline-none"
                >
                  <Icon name="FileText" size={14} className="mr-1" />
                  <span>{message.sources.length} source{message.sources.length > 1 ? 's' : ''}</span>
                  <Icon 
                    name="ChevronDown" 
                    size={14} 
                    className={`ml-1 transition-transform duration-200 ${
                      expandedSources[message.id] ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedSources[message.id] && (
                  <div className="mt-2 space-y-2">
                    {message.sources.map((source) => (
                      <div key={source.id} className="bg-white border border-border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-text-primary text-sm">{source.title}</h4>
                            <p className="text-text-secondary text-sm mt-1">{source.excerpt}</p>
                            <div className="flex items-center mt-2 space-x-4">
                              <span className="text-xs text-text-tertiary">Page {source.page}</span>
                              <div className="flex items-center">
                                <span className="text-xs text-text-tertiary mr-1">Confidence:</span>
                                <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-success transition-all duration-300"
                                    style={{ width: `${source.confidence * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-text-tertiary ml-1">
                                  {Math.round(source.confidence * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-3xl">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center mr-2">
                <Icon name="Bot" size={16} className="text-text-secondary" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-text-primary">AI Assistant</div>
                <div className="text-text-tertiary">typing...</div>
              </div>
            </div>
            <div className="bg-surface rounded-lg px-4 py-3 mr-10">
              <TypingIndicator />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessageList;