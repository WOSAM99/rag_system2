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
  createMessage
} from '../../services/conversationsApi';

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

      // Simulate AI response (in real implementation, this would call your backend)
      setTimeout(async () => {
        const assistantResponse = `**[Profile: ${selectedProfile.name} | System Prompt: ${selectedSystemPrompt.name}]**

Based on your query about "${query}", here's a comprehensive response:

This response is generated using the **${selectedSystemPrompt.name}** system prompt and analyzes documents from your **${selectedProfile.name}** knowledge base.

**System Prompt Behavior**: ${selectedSystemPrompt.description}

The AI would analyze the ${documentCount} documents in this profile to provide:
- Relevant information extracted from your ${selectedProfile.name} documents
- Proper citations and source references
- Context-aware insights based on "${selectedProfile.description}"
- Response formatting according to the "${selectedSystemPrompt.name}" prompt

**Profile Context**: ${selectedProfile.description}

In a real implementation, this response would be generated by:
1. **Profile ID**: ${selectedProfile.id}
2. **System Prompt ID**: ${selectedSystemPrompt.id}
3. **User Query**: "${query}"
4. **Document Context**: From ${documentCount} indexed documents

*Note: This is a demonstration response. In production, this would be replaced with actual AI processing using your documents and the selected system prompt.*`;

        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: assistantResponse,
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

        // Save assistant message to database
        await createMessage(conversation.id, 'assistant', assistantResponse, selectedSystemPrompt.id);
        
        setIsLoading(false);
      }, 2000);

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
                <span className="text-text-tertiary ml-2">• {documentCount} documents</span>
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
          
          {systemPrompts.length === 0 ? (
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
              systemPrompts={systemPrompts}
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
              <div>Conversations: {conversations.length}</div>
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
            {!selectedSystemPrompt && systemPrompts.length > 0 && (
              <p className="mt-2 text-sm text-text-tertiary">
                Select a system prompt above to start chatting
              </p>
            )}
            {selectedProfile && selectedSystemPrompt && (
              <p className="mt-2 text-xs text-text-tertiary">
                Profile: {selectedProfile.name} • System Prompt: {selectedSystemPrompt.name}
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