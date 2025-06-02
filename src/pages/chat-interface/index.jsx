import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SystemPromptSelector from './components/SystemPromptSelector';
import ChatMessageList from './components/ChatMessageList';
import QueryInput from './components/QueryInput';
import SourceDocumentList from './components/SourceDocumentList';
import ActionButton from '../login-dashboard/components/ActionButton';
import Icon from '../../components/AppIcon';

const ChatInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedSystemPrompt, setSelectedSystemPrompt] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const [expandedSources, setExpandedSources] = useState({});
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Mock data for profiles - should match the dashboard data
  const mockProfiles = [
    {
      id: 1,
      name: "Research Assistant",
      description: "Specialized in academic research and paper analysis. Helps with literature reviews, citation management, and research methodology.",
      documentCount: 24,
      createdAt: "2024-01-15",
      lastUsed: "2024-01-20"
    },
    {
      id: 2,
      name: "Technical Writer", 
      description: "Expert in creating technical documentation, API guides, and software manuals. Optimized for clear, concise technical communication.",
      documentCount: 18,
      createdAt: "2024-01-10",
      lastUsed: "2024-01-19"
    },
    {
      id: 3,
      name: "Legal Advisor",
      description: "Trained on legal documents and case studies. Assists with contract analysis, legal research, and compliance documentation.",
      documentCount: 32,
      createdAt: "2024-01-08",
      lastUsed: "2024-01-18"
    },
    {
      id: 4,
      name: "Marketing Strategist",
      description: "Focused on marketing campaigns, brand strategy, and customer engagement. Helps create compelling marketing content and strategies.",
      documentCount: 15,
      createdAt: "2024-01-12",
      lastUsed: "2024-01-17"
    }
  ];

  // System prompts data - this should match the system-prompts page data
  const mockSystemPrompts = [
    {
      id: 1,
      name: "General Assistant",
      description: "Helpful, harmless, and honest responses for general queries",
      prompt: "You are a helpful AI assistant. Provide accurate, informative, and well-structured responses based on the provided context. Be concise yet comprehensive, and always cite your sources when referencing specific documents.",
      isActive: true
    },
    {
      id: 2,
      name: "Research Analyst",
      description: "Academic and research-focused responses with citations",
      prompt: "You are a research analyst with expertise in academic writing and analysis. Provide detailed, evidence-based analysis with proper citations and academic rigor. Structure your responses with clear methodology, findings, and conclusions. Always reference specific documents and page numbers when available.",
      isActive: true
    },
    {
      id: 3,
      name: "Technical Expert",
      description: "Technical documentation and code assistance",
      prompt: "You are a technical expert specializing in software development and system architecture. Provide precise, actionable technical guidance with code examples and best practices. Focus on practical implementation details and include relevant security considerations.",
      isActive: false
    },
    {
      id: 4,
      name: "Legal Advisor",
      description: "Legal document analysis and compliance guidance",
      prompt: "You are a legal advisor assistant. Analyze legal documents with attention to compliance, risks, and regulatory requirements. Provide structured analysis highlighting key clauses, potential issues, and recommendations. Always include disclaimers about seeking professional legal counsel.",
      isActive: true
    }
  ];

  // Filter only active system prompts for selection
  const activeSystemPrompts = mockSystemPrompts.filter(prompt => prompt.isActive);

  // Mock chat history per profile
  const mockChatHistory = {
    1: [ // Research Assistant chat history
      {
        id: 1,
        type: 'user',
        content: "What are the key principles of machine learning?",
        timestamp: new Date(Date.now() - 3600000),
        profileId: 1
      },
      {
        id: 2,
        type: 'assistant',
        content: `Based on the research documents in your Knowledge base, here are the key principles of machine learning:

**1. Data-Driven Learning**
Machine learning algorithms learn patterns from data rather than being explicitly programmed. The quality and quantity of data directly impact model performance.

**2. Generalization**
Models should perform well on unseen data, not just training data. This requires balancing model complexity to avoid overfitting or underfitting.

**3. Feature Engineering**
Selecting and transforming relevant features from raw data is crucial for model success. Good features make learning easier and more effective.

**4. Iterative Improvement**
ML development is iterative - involving data collection, model training, evaluation, and refinement cycles.`,
        timestamp: new Date(Date.now() - 3590000),
        profileId: 1,
        sources: [
          {
            id: 1,
            title: "machine_learning_principles.pdf",
            excerpt: "Statistical learning refers to a vast set of tools for understanding data...",
            page: 15,
            confidence: 0.92
          },
          {
            id: 2,
            title: "statistical_learning_intro.docx",
            excerpt: "The goal of machine learning is to build computer systems that can adapt and learn from their experience...",
            page: 3,
            confidence: 0.88
          }
        ]
      }
    ],
    2: [ // Technical Writer chat history
      {
        id: 3,
        type: 'user',
        content: "How should I structure API documentation?",
        timestamp: new Date(Date.now() - 7200000),
        profileId: 2
      },
      {
        id: 4,
        type: 'assistant',
        content: `Based on your technical documentation resources, here's how to structure effective API documentation:

**1. Overview Section**
- Brief description of the API's purpose
- Authentication requirements
- Base URL and versioning

**2. Endpoint Documentation**
- HTTP methods and URLs
- Request/response examples
- Parameter descriptions

**3. Error Handling**
- Standard error codes
- Error response formats
- Troubleshooting guides`,
        timestamp: new Date(Date.now() - 7190000),
        profileId: 2,
        sources: [
          {
            id: 3,
            title: "api_documentation_guide.pdf",
            excerpt: "Effective API documentation should include clear examples and comprehensive error handling...",
            page: 8,
            confidence: 0.94
          }
        ]
      }
    ],
    3: [], // Legal Advisor - no chat history yet
    4: []  // Marketing Strategist - no chat history yet
  };

  // Read profile ID from URL parameters and load profile data
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const profileParam = urlParams.get('profile');
    
    if (profileParam) {
      const selectedProfileId = parseInt(profileParam);
      const profile = mockProfiles.find(p => p.id === selectedProfileId);
      
      if (profile) {
        setSelectedProfile(profile);
        setDocumentCount(profile.documentCount);
        
        // Load chat history for this specific profile
        const profileMessages = mockChatHistory[selectedProfileId] || [];
        setMessages(profileMessages);
      } else {
        setError(`Profile with ID ${profileParam} not found.`);
      }
    } else {
      // No profile specified, show profile selection
      setError('No profile selected. Please select a profile from the dashboard.');
    }
  }, [location.search]);

  useEffect(() => {
    // Set default system prompt when component loads
    if (activeSystemPrompts.length > 0 && !selectedSystemPrompt) {
      setSelectedSystemPrompt(activeSystemPrompts[0]);
    }
  }, [activeSystemPrompts]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSystemPromptChange = (prompt) => {
    setSelectedSystemPrompt(prompt);
  };

  const handleSendMessage = async (query) => {
    if (!query.trim() || isLoading || !selectedProfile || !selectedSystemPrompt) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: query,
      timestamp: new Date(),
      profileId: selectedProfile.id
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API call with profile and system prompt context
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `**[Profile: ${selectedProfile.name} | System Prompt: ${selectedSystemPrompt.name}]**

Based on your query about "${query}", here's a comprehensive response:

This response is generated using the **${selectedSystemPrompt.name}** system prompt and analyzes documents from your **${selectedProfile.name}** knowledge base.

**System Prompt Behavior**: ${selectedSystemPrompt.description}

The AI would analyze the ${selectedProfile.documentCount} documents in this profile to provide:
- Relevant information extracted from your ${selectedProfile.name} documents
- Proper citations and source references
- Context-aware insights based on "${selectedProfile.description}"
- Response formatting according to the "${selectedSystemPrompt.name}" prompt

**Profile Context**: ${selectedProfile.description}

In a real implementation, this response would be generated by:
1. **Profile ID**: ${selectedProfile.id}
2. **System Prompt ID**: ${selectedSystemPrompt.id}
3. **User Query**: "${query}"
4. **Document Context**: From ${selectedProfile.documentCount} indexed documents`,
        timestamp: new Date(),
        profileId: selectedProfile.id,
        sources: [
          {
            id: 1,
            title: `Sample document from ${selectedProfile.name}`,
            excerpt: `Relevant excerpt from your ${selectedProfile.name} documents related to: ${query}`,
            page: Math.floor(Math.random() * 100) + 1,
            confidence: 0.85 + Math.random() * 0.15
          }
        ]
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleBackToDashboard = () => {
    navigate('/login-dashboard');
  };

  const handleManageSystemPrompts = () => {
    navigate('/system-prompts');
  };

  const handleUploadDocuments = () => {
    if (selectedProfile) {
      navigate(`/document-upload?profile=${selectedProfile.id}`);
    }
  };

  const toggleSourceExpansion = (messageId) => {
    setExpandedSources(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleRetryMessage = (messageId) => {
    // Find the user message that corresponds to this failed message
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      if (userMessage.type === 'user') {
        handleSendMessage(userMessage.content);
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="compact" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-error-light border border-error border-opacity-20 rounded-lg p-6 text-center">
            <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">Profile Not Found</h2>
            <p className="text-text-secondary mb-4">{error}</p>
            <ActionButton
              variant="primary"
              onClick={() => navigate('/login-dashboard')}
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Back to Dashboard
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="compact" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={handleBackToDashboard}
              className="mr-4 p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Back to dashboard"
            >
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Chat Interface</h1>
              <p className="text-text-secondary">
                Profile: <span className="font-medium text-text-primary">{selectedProfile.name}</span>
                <span className="text-text-tertiary ml-2">• ID: {selectedProfile.id}</span>
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                {selectedProfile.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleUploadDocuments}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-surface hover:bg-border text-text-secondary hover:text-text-primary rounded-lg transition-colors"
            >
              <Icon name="Upload" size={16} />
              Upload Docs
            </button>
            <div className="flex items-center bg-surface px-3 py-2 rounded-lg">
              <Icon name="FileText" size={16} className="text-text-secondary mr-2" />
              <span className="text-sm text-text-secondary">
                {documentCount} documents
              </span>
            </div>
          </div>
        </div>

        {/* System Prompt Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-text-primary">System Prompt</h3>
            <button
              onClick={handleManageSystemPrompts}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-surface hover:bg-border text-text-secondary hover:text-text-primary rounded-lg transition-colors"
            >
              <Icon name="Settings" size={16} />
              Manage Prompts
            </button>
          </div>
          
          {activeSystemPrompts.length === 0 ? (
            <div className="bg-warning-light border border-warning border-opacity-20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Icon name="AlertTriangle" size={20} className="text-warning" />
                <div>
                  <p className="font-medium text-text-primary">No active system prompts</p>
                  <p className="text-sm text-text-secondary">
                    You need at least one active system prompt to start chatting.{' '}
                    <button
                      onClick={handleManageSystemPrompts}
                      className="underline hover:no-underline"
                    >
                      Create or activate a system prompt
                    </button>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <SystemPromptSelector
              systemPrompts={activeSystemPrompts}
              selectedPrompt={selectedSystemPrompt}
              onPromptChange={handleSystemPromptChange}
            />
          )}
        </div>

        {/* Profile Information Banner */}
        <div className="mb-6 bg-gradient-to-r from-primary-light to-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-text-primary">Currently chatting with: {selectedProfile.name}</h4>
              <p className="text-sm text-text-secondary mt-1">
                This conversation will use documents and context from this profile only
              </p>
            </div>
            <div className="text-right text-sm text-text-tertiary">
              <div>Profile ID: {selectedProfile.id}</div>
              <div>{documentCount} indexed documents</div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg border border-border shadow-sm">
          {/* Chat Messages */}
          <div className="h-96 lg:h-[500px] overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
                  <Icon name="MessageSquare" size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Start a conversation with {selectedProfile.name}
                </h3>
                <p className="text-text-secondary max-w-md">
                  Ask questions about your uploaded documents. The AI will provide answers based on the {documentCount} documents in this profile and your selected system prompt.
                </p>
                {selectedSystemPrompt && (
                  <div className="mt-4 p-3 bg-surface rounded-lg max-w-md">
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Current behavior:</span> {selectedSystemPrompt.description}
                    </p>
                  </div>
                )}
                <div className="mt-6 space-y-2 text-sm text-text-tertiary">
                  <p><kbd className="px-2 py-1 bg-surface rounded text-xs">Ctrl + Enter</kbd> to send message</p>
                  <p><kbd className="px-2 py-1 bg-surface rounded text-xs">Esc</kbd> to clear input</p>
                </div>
              </div>
            ) : (
              <ChatMessageList
                messages={messages}
                isLoading={isLoading}
                expandedSources={expandedSources}
                onToggleSource={toggleSourceExpansion}
                onRetryMessage={handleRetryMessage}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Query Input */}
          <div className="border-t border-border p-4">
            <QueryInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              disabled={!selectedProfile || !selectedSystemPrompt}
            />
            {!selectedSystemPrompt && activeSystemPrompts.length > 0 && (
              <p className="mt-2 text-sm text-text-tertiary">
                Select a system prompt above to start chatting
              </p>
            )}
            {selectedProfile && selectedSystemPrompt && (
              <p className="mt-2 text-xs text-text-tertiary">
                Profile: {selectedProfile.name} (ID: {selectedProfile.id}) • System Prompt: {selectedSystemPrompt.name} (ID: {selectedSystemPrompt.id})
              </p>
            )}
          </div>
        </div>

        {/* Source Documents (if any message has sources) */}
        {messages.some(msg => msg.sources && msg.sources.length > 0) && (
          <div className="mt-6">
            <SourceDocumentList
              messages={messages.filter(msg => msg.sources && msg.sources.length > 0)}
              expandedSources={expandedSources}
              onToggleSource={toggleSourceExpansion}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;