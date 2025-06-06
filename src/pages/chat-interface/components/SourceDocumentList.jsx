import React from 'react';
import Icon from '../../../components/AppIcon';

const SourceDocumentList = ({ messages, expandedSources, onToggleSource }) => {
  // Get all unique sources from messages, grouped by document title
  const getAllSources = () => {
    const sourcesMap = new Map();
    
    messages.forEach(message => {
      if (message.sources) {
        message.sources.forEach(source => {
          const key = source.title; // Use document title as key
          if (!sourcesMap.has(key)) {
            sourcesMap.set(key, {
              title: source.title,
              chunks: [{
                id: source.id,
                page: source.page,
                confidence: source.confidence,
                excerpt: source.excerpt,
                messageId: message.id
              }],
              messageIds: [message.id],
              maxConfidence: source.confidence,
              uniquePages: new Set([source.page])
            });
          } else {
            const existingDoc = sourcesMap.get(key);
            existingDoc.chunks.push({
              id: source.id,
              page: source.page,
              confidence: source.confidence,
              excerpt: source.excerpt,
              messageId: message.id
            });
            if (!existingDoc.messageIds.includes(message.id)) {
              existingDoc.messageIds.push(message.id);
            }
            existingDoc.maxConfidence = Math.max(existingDoc.maxConfidence, source.confidence);
            existingDoc.uniquePages.add(source.page);
          }
        });
      }
    });
    
    // Convert the map to an array and sort by reference count (messageIds length)
    return Array.from(sourcesMap.values())
      .map(doc => ({
        ...doc,
        referenceCount: doc.messageIds.length,
        pageCount: doc.uniquePages.size,
        uniquePages: Array.from(doc.uniquePages).sort((a, b) => a - b)
      }))
      .sort((a, b) => b.referenceCount - a.referenceCount);
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
          <h3 className="text-lg font-semibold text-text-primary">Referenced Documents</h3>
          <span className="ml-2 px-2 py-1 bg-surface text-text-secondary text-sm rounded-full">
            {allSources.length}
          </span>
        </div>
        <p className="text-text-secondary text-sm mt-1">
          Documents referenced in this conversation, grouped by file
        </p>
      </div>

      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allSources.map((doc) => (
            <div key={doc.title} className="border border-border rounded-lg p-4 hover:border-border-strong transition-colors duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary text-sm line-clamp-2">
                    {doc.title}
                  </h4>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-text-tertiary">
                      {doc.pageCount} page{doc.pageCount > 1 ? 's' : ''} referenced
                    </span>
                    <span className="text-xs text-text-tertiary">•</span>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-1 ${getConfidenceColor(doc.maxConfidence)}`}></div>
                      <span className="text-xs text-text-tertiary">
                        {getConfidenceLabel(doc.maxConfidence)} relevance
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  className="ml-2 p-1 text-text-tertiary hover:text-text-primary transition-colors duration-200 focus:outline-none"
                  aria-label="View document details"
                >
                  <Icon name="ExternalLink" size={14} />
                </button>
              </div>

              {/* Show the most relevant chunk */}
              <div className="mb-3">
                <div className="text-xs text-text-tertiary mb-1">Most relevant excerpt:</div>
                <p className="text-text-secondary text-sm line-clamp-3">
                  {doc.chunks.sort((a, b) => b.confidence - a.confidence)[0].excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xs text-text-tertiary mr-2">Pages:</span>
                  <div className="flex items-center gap-1">
                    {doc.uniquePages.map((page, index) => (
                      <span key={page} className="px-1.5 py-0.5 bg-surface rounded text-xs text-text-secondary">
                        {page}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center text-xs text-text-tertiary">
                  <Icon name="MessageSquare" size={12} className="mr-1" />
                  <span>Referenced {doc.referenceCount} time{doc.referenceCount > 1 ? 's' : ''}</span>
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
              <div className="text-sm text-text-secondary">Unique Documents</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">
                {allSources.reduce((acc, doc) => acc + doc.chunks.length, 0)}
              </div>
              <div className="text-sm text-text-secondary">Total References</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">
                {allSources.reduce((acc, doc) => acc + doc.pageCount, 0)}
              </div>
              <div className="text-sm text-text-secondary">Pages Referenced</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">
                {Math.round(allSources.reduce((acc, doc) => acc + doc.maxConfidence, 0) / allSources.length * 100)}%
              </div>
              <div className="text-sm text-text-secondary">Avg Relevance</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SourceDocumentList;