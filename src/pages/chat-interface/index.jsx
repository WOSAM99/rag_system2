import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SystemPromptSelector from './components/SystemPromptSelector';
import ChatMessageList from './components/ChatMessageList';
import QueryInput from './components/QueryInput';
import SourceDocumentList from './components/SourceDocumentList';
import Icon from '../../components/AppIcon';

const ChatInterface = () => {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedSystemPrompt, setSelectedSystemPrompt] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const [expandedSources, setExpandedSources] = useState({});
  const messagesEndRef = useRef(null);

  // Mock data for profiles
  const mockProfiles = [
    {
      id: 1,
      name: "Research Assistant",
      description: "Academic research and analysis",
      documentCount: 15
    },
    {
      id: 2,
      name: "Technical Documentation",
      description: "Software development and API docs",
      documentCount: 8
    },
    {
      id: 3,
      name: "Legal Analysis",
      description: "Legal document review and analysis",
      documentCount: 23
    }
  ];

  // Mock data for system prompts
  const mockSystemPrompts = [
    {
      id: 1,
      name: "General Assistant",
      description: "Helpful, harmless, and honest responses",
      prompt: `You are a helpful AI assistant. Provide accurate, informative, and well-structured responses based on the provided context.`
    },
    {
      id: 2,
      name: "Research Analyst",
      description: "Academic and research-focused responses",
      prompt: `You are a research analyst. Provide detailed, evidence-based analysis with proper citations and academic rigor.`
    },
    {
      id: 3,
      name: "Technical Expert",
      description: "Technical documentation and code assistance",
      prompt: `You are a technical expert. Provide precise, actionable technical guidance with code examples and best practices.`
    }
  ];

  // Mock chat history
  const mockChatHistory = [
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
      content: `Machine learning is built on several fundamental principles:

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
          title: "Introduction to Statistical Learning",
          excerpt: "Statistical learning refers to a vast set of tools for understanding data...",
          page: 15,
          confidence: 0.92
        },
        {
          id: 2,
          title: "Pattern Recognition and Machine Learning",
          excerpt: "The goal of machine learning is to build computer systems that can adapt and learn from their experience...",
          page: 3,
          confidence: 0.88
        }
      ]
    }
  ];

  useEffect(() => {
    // Set default profile and system prompt
    if (mockProfiles.length > 0) {
      setSelectedProfile(mockProfiles[0]);
      setDocumentCount(mockProfiles[0].documentCount);
    }
    if (mockSystemPrompts.length > 0) {
      setSelectedSystemPrompt(mockSystemPrompts[0]);
    }
    
    // Load chat history
    setMessages(mockChatHistory);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleProfileChange = (profile) => {
    setSelectedProfile(profile);
    setDocumentCount(profile.documentCount);
    // Load chat history for selected profile
    const profileMessages = mockChatHistory.filter(msg => msg.profileId === profile.id);
    setMessages(profileMessages);
  };

  const handleSystemPromptChange = (prompt) => {
    setSelectedSystemPrompt(prompt);
  };

  const handleSendMessage = async (query) => {
    if (!query.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: query,
      timestamp: new Date(),
      profileId: selectedProfile?.id
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `Based on your query about "${query}", here's a comprehensive response:

This is a simulated response that would normally come from your RAG system. The system would analyze the uploaded documents in your "${selectedProfile?.name}" profile and provide contextually relevant information.

The response would include:
- Relevant information extracted from your documents
- Proper citations and source references
- Structured formatting for better readability
- Context-aware insights based on the selected system prompt: "${selectedSystemPrompt?.name}"`,
        timestamp: new Date(),
        profileId: selectedProfile?.id,
        sources: [
          {
            id: 1,
            title: "Document Analysis Results",
            excerpt: `Relevant excerpt from your uploaded documents related to: ${query}`,
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
              {selectedProfile && (
                <p className="text-text-secondary">
                  Profile: <span className="font-medium text-text-primary">{selectedProfile.name}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
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
          <SystemPromptSelector
            systemPrompts={mockSystemPrompts}
            selectedPrompt={selectedSystemPrompt}
            onPromptChange={handleSystemPromptChange}
          />
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
                  Start a conversation
                </h3>
                <p className="text-text-secondary max-w-md">
                  Ask questions about your uploaded documents. The AI will provide answers based on your selected profile and system prompt.
                </p>
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