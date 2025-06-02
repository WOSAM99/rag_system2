import React from 'react';
import Icon from '../../../components/AppIcon';

const SourceDocumentList = ({ messages, expandedSources, onToggleSource }) => {
  // Get all unique sources from messages
  const getAllSources = () => {
    const sourcesMap = new Map();
    
    messages.forEach(message => {
      if (message.sources) {
        message.sources.forEach(source => {
          if (!sourcesMap.has(source.id)) {
            sourcesMap.set(source.id, {
              ...source,
              messageIds: [message.id]
            });
          } else {
            const existingSource = sourcesMap.get(source.id);
            if (!existingSource.messageIds.includes(message.id)) {
              existingSource.messageIds.push(message.id);
            }
          }
        });
      }
    });
    
    return Array.from(sourcesMap.values());
  };

  const allSources = getAllSources();

  if (allSources.length === 0) {
    return null;
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-success';
    if (confidence >= 0.6) return 'bg-warning';
    return 'bg-error';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <>
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center">
          <Icon name="FileText" size={20} className="text-text-secondary mr-2" />
          <h3 className="text-lg font-semibold text-text-primary">Source Documents</h3>
          <span className="ml-2 px-2 py-1 bg-surface text-text-secondary text-sm rounded-full">
            {allSources.length}
          </span>
        </div>
        <p className="text-text-secondary text-sm mt-1">
          Documents referenced in this conversation
        </p>
      </div>

      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allSources.map((source) => (
            <div key={source.id} className="border border-border rounded-lg p-4 hover:border-border-strong transition-colors duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary text-sm line-clamp-2">
                    {source.title}
                  </h4>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-text-tertiary">Page {source.page}</span>
                    <span className="text-xs text-text-tertiary">•</span>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-1 ${getConfidenceColor(source.confidence)}`}></div>
                      <span className="text-xs text-text-tertiary">
                        {getConfidenceLabel(source.confidence)} confidence
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  className="ml-2 p-1 text-text-tertiary hover:text-text-primary transition-colors duration-200 focus:outline-none"
                  aria-label="View source details"
                >
                  <Icon name="ExternalLink" size={14} />
                </button>
              </div>

              <p className="text-text-secondary text-sm line-clamp-3 mb-3">
                {source.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xs text-text-tertiary mr-2">Confidence:</span>
                  <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getConfidenceColor(source.confidence)}`}
                      style={{ width: `${source.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-text-tertiary ml-1">
                    {Math.round(source.confidence * 100)}%
                  </span>
                </div>

                <div className="flex items-center text-xs text-text-tertiary">
                  <Icon name="MessageSquare" size={12} className="mr-1" />
                  <span>{source.messageIds.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">{allSources.length}</div>
              <div className="text-sm text-text-secondary">Total Sources</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">
                {allSources.filter(s => s.confidence >= 0.8).length}
              </div>
              <div className="text-sm text-text-secondary">High Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">
                {Math.round(allSources.reduce((acc, s) => acc + s.confidence, 0) / allSources.length * 100)}%
              </div>
              <div className="text-sm text-text-secondary">Avg Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">
                {Math.max(...allSources.map(s => s.page))}
              </div>
              <div className="text-sm text-text-secondary">Max Page</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SourceDocumentList;