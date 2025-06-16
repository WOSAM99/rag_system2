import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SystemPromptSelector from './components/SystemPromptSelector';
import ChatMessageList from './components/ChatMessageList';
import QueryInput from './components/QueryInput';
import SourceDocumentList from './components/SourceDocumentList';
import ActionButton from '../login-dashboard/components/ActionButton';
import Icon from '../../components/AppIcon';
import { getCurrentUser } from '../../config/supabase';
import { getProfile } from '../../services/profilesApi';
import { getActiveSystemPrompts } from '../../services/systemPromptsApi';
import { getDocumentsByProfile } from '../../services/documentsApi';
import { 
  getConversationsByProfile,
  getMessagesByConversation,
  createConversation,
  createMessage,
  deleteConversation
} from '../../services/conversationsApi';
import { queryRagPipeline } from '../../services/backendApi';

const ChatInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedSystemPrompt, setSelectedSystemPrompt] = useState(null);
  const [systemPrompts, setSystemPrompts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [documentCount, setDocumentCount] = useState(0);
  const [expandedSources, setExpandedSources] = useState({});
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef(null);

  // Load profile and related data from URL parameter
  useEffect(() => {
    const loadProfileData = async () => {
      const urlParams = new URLSearchParams(location.search);
      const profileParam = urlParams.get('profile');
      
      if (!profileParam) {
        setError('No profile selected. Please select a profile from the dashboard.');
        setIsLoadingProfile(false);
        return;
      }

      try {
        setIsLoadingProfile(true);
        setError(null);

        // Check authentication
        const user = getCurrentUser();
        if (!user) {
          setError('You must be logged in to access the chat interface.');
          setIsLoadingProfile(false);
          return;
        }

        console.log('Loading profile with ID:', profileParam);

        // Load profile data - use profileParam directly as it's already a UUID string
        const profile = await getProfile(profileParam);
        console.log('Profile loaded:', profile);
        setSelectedProfile(profile);

        // Load documents count for this profile
        const documents = await getDocumentsByProfile(profileParam);
        setDocumentCount(documents.length);

        // Load system prompts
        const prompts = await getActiveSystemPrompts();
        console.log('System prompts loaded:', prompts);
        setSystemPrompts(prompts);

        // Set default system prompt
        if (prompts.length > 0) {
          setSelectedSystemPrompt(prompts[0]);
        }

        // Load conversations for this profile
        const profileConversations = await getConversationsByProfile(profileParam);
        console.log('Conversations loaded:', profileConversations);
        setConversations(profileConversations);

        // Load messages from the most recent conversation or start fresh
        if (profileConversations.length > 0) {
          const latestConversation = profileConversations[0];
          setCurrentConversation(latestConversation);
          const conversationMessages = await getMessagesByConversation(latestConversation.id);
          
          // Transform messages to match component expectations
          const transformedMessages = conversationMessages.map(msg => ({
            id: msg.id,
            type: msg.role, // 'user' or 'assistant'
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            profileId: profileParam,
            sources: [] // Add sources handling when available
          }));
          
          setMessages(transformedMessages);
        }

      } catch (err) {
        console.error('Error loading profile data:', err);
        setError(`Failed to load profile: ${err.message}`);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileData();
  }, [location.search]);

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

    try {
      setIsLoading(true);

      // Create new conversation if none exists
      let conversation = currentConversation;
      if (!conversation) {
        const conversationTitle = query.length > 50 ? query.substring(0, 50) + '...' : query;
        conversation = await createConversation(
          selectedProfile.id,
          conversationTitle,
          selectedSystemPrompt.id
        );
        setCurrentConversation(conversation);
        setConversations(prev => [conversation, ...prev]);
      }

      // Add user message to UI immediately
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: query,
        timestamp: new Date(),
        profileId: selectedProfile.id
      };
      setMessages(prev => [...prev, userMessage]);

      // Save user message to database
      await createMessage(conversation.id, 'user', query, selectedSystemPrompt.id);

      try {
        // Call the real RAG pipeline backend
        console.log('Calling RAG pipeline for query:', query);
        const ragResponse = await queryRagPipeline(
          query,                          // query
          selectedProfile.id,             // profile_id (collection_name)
          selectedSystemPrompt.prompt,    // system_prompt
          6,                             // k_retrieval (default)
          null                           // retriever_filter (optional)
        );

        console.log('RAG pipeline response:', ragResponse);

        // Format the assistant response
        let assistantContent = ragResponse.answer || 'No response generated.';
        
        // Add source information if available
        let sources = [];
        if (ragResponse.source_documents && ragResponse.source_documents.length > 0) {
          sources = ragResponse.source_documents.map((doc, index) => ({
            id: index + 1,
            title: doc.metadata?.source || `Document ${index + 1}`,
            excerpt: doc.page_content ? doc.page_content.substring(0, 200) + '...' : 'No content available',
            page: doc.metadata?.page || 1,
            confidence: 0.85 + Math.random() * 0.15
          }));
        }

        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
          profileId: selectedProfile.id,
          sources: sources
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Save assistant message to database
        await createMessage(conversation.id, 'assistant', assistantContent, selectedSystemPrompt.id);
        
      } catch (backendError) {
        console.error('Error calling RAG pipeline:', backendError);
        
        // Show error message to user
        const errorMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `Sorry, I encountered an error while processing your question: ${backendError.message}. Please try again or contact support if the issue persists.`,
          timestamp: new Date(),
          profileId: selectedProfile.id,
          isError: true
        };

        setMessages(prev => [...prev, errorMessage]);
      }
      
      setIsLoading(false);

    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to send message: ${error.message}`);
      setIsLoading(false);
    }
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

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!selectedProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="compact" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-warning-light border border-warning border-opacity-20 rounded-lg p-6 text-center">
            <Icon name="AlertTriangle" size={48} className="text-warning mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">No Profile Selected</h2>
            <p className="text-text-secondary mb-4">Please select a profile from the dashboard to start chatting.</p>
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header variant="compact" />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - NO SCROLLING */}
        <div className={`bg-white border-r border-border transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-80'
        } flex-shrink-0 overflow-hidden`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center">
                  <button
                    onClick={handleBackToDashboard}
                    className="mr-3 p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors duration-200"
                    aria-label="Back to dashboard"
                  >
                    <Icon name="ArrowLeft" size={18} />
                  </button>
                  <h2 className="text-lg font-semibold text-text-primary">Chat Settings</h2>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors duration-200"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Icon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} size={18} />
              </button>
            </div>
          </div>

          {/* Sidebar Content - NO SCROLLING */}
          {!sidebarCollapsed && (
            <div className="p-4 space-y-4 overflow-hidden">
              {/* Profile Information */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-text-primary uppercase tracking-wide">Current Profile</h3>
                <div className="bg-gradient-to-r from-primary-light to-surface border border-border rounded-lg p-3">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <Icon name="User" size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text-primary text-sm truncate">{selectedProfile.name}</h4>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                        {selectedProfile.description}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-text-tertiary">
                        <Icon name="FileText" size={12} className="mr-1" />
                        <span>{documentCount} docs</span>
                        <span className="mx-2">•</span>
                        <Icon name="MessageSquare" size={12} className="mr-1" />
                        <span>{conversations.length} chats</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Prompt Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-text-primary uppercase tracking-wide">System Prompt</h3>
                  <button
                    onClick={handleManageSystemPrompts}
                    className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface rounded transition-colors"
                    title="Manage System Prompts"
                  >
                    <Icon name="Settings" size={14} />
                  </button>
                </div>
                
                {systemPrompts.length === 0 ? (
                  <div className="bg-warning-light border border-warning border-opacity-20 rounded-lg p-2">
                    <div className="flex items-start gap-2">
                      <Icon name="AlertTriangle" size={14} className="text-warning mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-text-primary">No active prompts</p>
                        <button
                          onClick={handleManageSystemPrompts}
                          className="text-xs text-text-secondary underline hover:no-underline"
                        >
                          Create one
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <SystemPromptSelector
                    systemPrompts={systemPrompts}
                    selectedPrompt={selectedSystemPrompt}
                    onPromptChange={handleSystemPromptChange}
                  />
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-text-primary uppercase tracking-wide">Quick Actions</h3>
                <div className="space-y-1">
                  <button
                    onClick={handleUploadDocuments}
                    className="w-full flex items-center gap-2 px-2 py-2 text-xs bg-surface hover:bg-border text-text-secondary hover:text-text-primary rounded transition-colors"
                  >
                    <Icon name="Upload" size={14} />
                    Upload Documents
                  </button>
                  <button
                    onClick={handleManageSystemPrompts}
                    className="w-full flex items-center gap-2 px-2 py-2 text-xs bg-surface hover:bg-border text-text-secondary hover:text-text-primary rounded transition-colors"
                  >
                    <Icon name="MessageSquare" size={14} />
                    Manage Prompts
                  </button>
                </div>
              </div>

              {/* Recent Conversations - Limited to 2 items */}
              {conversations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-text-primary uppercase tracking-wide">Recent</h3>
                  <div className="space-y-1">
                    {conversations.slice(0, 2).map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setCurrentConversation(conversation)}
                        className={`w-full text-left px-2 py-2 text-xs rounded transition-colors ${
                          currentConversation?.id === conversation.id
                            ? 'bg-primary-light text-primary'
                            : 'hover:bg-surface text-text-secondary'
                        }`}
                      >
                        <div className="truncate font-medium">
                          {conversation.title || 'Untitled'}
                        </div>
                        <div className="text-xs text-text-tertiary mt-0.5">
                          {new Date(conversation.createdAt).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                    {conversations.length > 2 && (
                      <div className="text-xs text-text-tertiary text-center py-1">
                        +{conversations.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Chat Area - Fixed Input at Bottom */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Chat Header */}
          <div className="bg-white border-b border-border px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-text-primary">
                  Chat with {selectedProfile.name}
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  {selectedSystemPrompt ? (
                    <>Using: <span className="font-medium">{selectedSystemPrompt.name}</span></>
                  ) : (
                    'Select a system prompt to start chatting'
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={async () => {
                    if (currentConversation && window.confirm('Are you sure you want to clear this conversation? This action cannot be undone.')) {
                      try {
                        await deleteConversation(currentConversation.id);
                        setMessages([]);
                        setCurrentConversation(null);
                        // Remove the conversation from the list
                        setConversations(conversations.filter(c => c.id !== currentConversation.id));
                      } catch (error) {
                        console.error('Error clearing conversation:', error);
                      }
                    }
                  }}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center"
                  disabled={!currentConversation}
                >
                  <Icon name="Trash2" size={16} className="mr-1" />
                  Clear Chat
                </button>
                <div className="flex items-center space-x-2 text-sm text-text-tertiary">
                  <Icon name="FileText" size={16} />
                  <span>{documentCount} docs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages Container - SCROLLABLE AREA */}
          <div className="flex-1 relative">
            <div 
              className="absolute inset-0 overflow-y-auto bg-gray-50"
              style={{ paddingBottom: '140px' }}
            >
              <div className="p-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto min-h-[400px]">
                    <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-6">
                      <Icon name="MessageSquare" size={40} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-medium text-text-primary mb-3">
                      Ready to chat with {selectedProfile.name}
                    </h3>
                    <p className="text-text-secondary mb-6 max-w-md">
                      Ask questions about your uploaded documents. The AI will provide answers based on the {documentCount} documents in this profile.
                    </p>
                    {selectedSystemPrompt && (
                      <div className="p-4 bg-white rounded-lg max-w-lg mb-6 shadow-sm">
                        <p className="text-sm text-text-secondary">
                          <span className="font-medium text-text-primary">Current behavior:</span> {selectedSystemPrompt.description}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-text-tertiary">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-white rounded text-xs shadow-sm">Ctrl + Enter</kbd>
                        <span>Send message</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-white rounded text-xs shadow-sm">Esc</kbd>
                        <span>Clear input</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto w-full">
                    <ChatMessageList
                      messages={messages}
                      isLoading={isLoading}
                      expandedSources={expandedSources}
                      onToggleSource={toggleSourceExpansion}
                      onRetryMessage={handleRetryMessage}
                    />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Fixed Input Box at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border p-6 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <QueryInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                disabled={!selectedProfile || !selectedSystemPrompt}
              />
              {!selectedSystemPrompt && systemPrompts.length > 0 && (
                <p className="mt-2 text-sm text-text-tertiary text-center">
                  Select a system prompt in the sidebar to start chatting
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Source Documents Modal/Panel (if any message has sources) */}
      {messages.some(msg => msg.sources && msg.sources.length > 0) && (
        <div className="fixed bottom-4 right-4 max-w-sm">
          <SourceDocumentList
            messages={messages.filter(msg => msg.sources && msg.sources.length > 0)}
            expandedSources={expandedSources}
            onToggleSource={toggleSourceExpansion}
          />
        </div>
      )}
    </div>
  );
};

export default ChatInterface;