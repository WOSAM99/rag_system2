import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SystemPromptForm from './components/SystemPromptForm';
import ConfirmationModal from './components/ConfirmationModal';
import ActionButton from './components/ActionButton';
import Icon from '../../components/AppIcon';
import { 
  getSystemPrompts, 
  createSystemPrompt, 
  updateSystemPrompt, 
  deleteSystemPrompt, 
  toggleSystemPromptActive 
} from '../../services/systemPromptsApi';

const SystemPrompts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [systemPrompts, setSystemPrompts] = useState([]);

  // Load system prompts on component mount
  useEffect(() => {
    loadSystemPrompts();
  }, []);

  // Check if we're in edit mode from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const editId = urlParams.get('edit');
    if (editId && systemPrompts.length > 0) {
      const promptToEdit = systemPrompts.find(p => p.id === parseInt(editId));
      if (promptToEdit) {
        setEditingPrompt(promptToEdit);
      }
    }
  }, [location.search, systemPrompts]);

  const loadSystemPrompts = async () => {
    try {
      const prompts = await getSystemPrompts();
      setSystemPrompts(prompts);
    } catch (error) {
      console.error('Error loading system prompts:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load system prompts. Please try again.'
      });
    }
  };

  const handleCreatePrompt = async (promptData) => {
    setIsLoading(true);
    try {
      const newPrompt = await createSystemPrompt(promptData);
      setSystemPrompts(prev => [newPrompt, ...prev]);
      setNotification({
        type: 'success',
        message: 'System prompt created successfully!'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error('Error creating system prompt:', error);
      setNotification({
        type: 'error',
        message: 'Failed to create system prompt. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePrompt = async (promptData) => {
    setIsLoading(true);
    try {
      const updatedPrompt = await updateSystemPrompt(editingPrompt.id, promptData);
      setSystemPrompts(prev => prev.map(prompt => 
        prompt.id === editingPrompt.id ? updatedPrompt : prompt
      ));
      
      setEditingPrompt(null);
      navigate('/system-prompts');
      
      setNotification({
        type: 'success',
        message: 'System prompt updated successfully!'
      });
      
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error('Error updating system prompt:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update system prompt. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrompt = async (promptId) => {
    setIsLoading(true);
    try {
      await deleteSystemPrompt(promptId);
      setSystemPrompts(prev => prev.filter(prompt => prompt.id !== promptId));
      setShowDeleteModal(false);
      setPromptToDelete(null);
      
      setNotification({
        type: 'success',
        message: 'System prompt deleted successfully!'
      });
      
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error('Error deleting system prompt:', error);
      setNotification({
        type: 'error',
        message: 'Failed to delete system prompt. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    navigate(`/system-prompts?edit=${prompt.id}`);
  };

  const handleDeleteClick = (prompt) => {
    setPromptToDelete(prompt);
    setShowDeleteModal(true);
  };

  const handleToggleActive = async (promptId) => {
    try {
      const prompt = systemPrompts.find(p => p.id === promptId);
      if (!prompt) return;

      const updatedPrompt = await toggleSystemPromptActive(promptId, !prompt.isActive);
      setSystemPrompts(prev => prev.map(p => 
        p.id === promptId ? updatedPrompt : p
      ));
    } catch (error) {
      console.error('Error toggling prompt active status:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update prompt status. Please try again.'
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingPrompt(null);
    navigate('/system-prompts');
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg border ${
          notification.type === 'success' ?'bg-success-light border-success text-success' :'bg-error-light border-error text-error'
        } transition-all duration-300`}>
          <div className="flex items-center gap-2">
            <Icon 
              name={notification.type === 'success' ? 'CheckCircle' : 'AlertCircle'} 
              size={20} 
            />
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                {editingPrompt ? 'Edit System Prompt' : 'System Prompts'}
              </h1>
              <p className="mt-2 text-text-secondary">
                {editingPrompt 
                  ? 'Update your system prompt configuration and behavior'
                  : 'Create and manage AI system prompts that define how your assistant behaves and responds'
                }
              </p>
            </div>
            
            {!editingPrompt && (
              <ActionButton
                variant="primary"
                onClick={() => setEditingPrompt({})}
                icon="Plus"
                className="w-full sm:w-auto"
              >
                Create Prompt
              </ActionButton>
            )}
          </div>
        </div>

        {/* System Prompt Form Section */}
        {editingPrompt && (
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-border shadow-sm">
              <div className="p-6">
                <SystemPromptForm
                  prompt={editingPrompt.id ? editingPrompt : null}
                  onSubmit={editingPrompt.id ? handleUpdatePrompt : handleCreatePrompt}
                  onCancel={handleCancelEdit}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* System Prompts List Section */}
        {!editingPrompt && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary">
                Your System Prompts ({systemPrompts.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Icon name="Info" size={16} />
                <span>Click on a prompt to view and edit details</span>
              </div>
            </div>

            {systemPrompts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-border">
                <div className="w-16 h-16 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center">
                  <Icon name="MessageSquare" size={32} className="text-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">No system prompts yet</h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  Create your first system prompt to define how your AI assistant should behave and respond to queries.
                </p>
                <ActionButton
                  variant="primary"
                  onClick={() => setEditingPrompt({})}
                  icon="Plus"
                >
                  Create Your First Prompt
                </ActionButton>
              </div>
            ) : (
              <div className="grid gap-6">
                {systemPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-3 h-3 rounded-full ${
                            prompt.isActive ? 'bg-success' : 'bg-text-tertiary'
                          }`} />
                          <div className="flex-1">
                          <h3 className="font-semibold text-text-primary text-lg">
                              {prompt.name}
                          </h3>
                            <p className="text-text-secondary text-sm mt-1">
                              {prompt.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            onClick={() => handleToggleActive(prompt.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              prompt.isActive 
                                ? 'text-success hover:bg-success-light' 
                                : 'text-text-tertiary hover:bg-surface'
                            }`}
                            aria-label={prompt.isActive ? 'Deactivate prompt' : 'Activate prompt'}
                          >
                            <Icon name={prompt.isActive ? 'ToggleRight' : 'ToggleLeft'} size={20} />
                          </button>
                          <button
                            onClick={() => handleEditPrompt(prompt)}
                            className="p-2 text-text-tertiary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                            aria-label="Edit prompt"
                          >
                            <Icon name="Edit2" size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(prompt)}
                            className="p-2 text-text-tertiary hover:text-error hover:bg-error-light rounded-lg transition-colors"
                            aria-label="Delete prompt"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-surface rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-text-primary mb-2">Prompt Content:</h4>
                        <p className="text-text-secondary text-sm leading-relaxed line-clamp-4">
                          {prompt.prompt}
                      </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-text-tertiary">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                          <Icon name="Calendar" size={12} />
                            <span>Created: {formatDate(prompt.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon name="Clock" size={12} />
                            <span>Updated: {formatDate(prompt.updatedAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            prompt.isActive 
                              ? 'bg-success-light text-success' 
                              : 'bg-surface text-text-tertiary'
                          }`}>
                            {prompt.isActive ? 'Active' : 'Inactive'}
                          </span>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && promptToDelete && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setPromptToDelete(null);
          }}
          onConfirm={() => handleDeletePrompt(promptToDelete.id)}
          title="Delete System Prompt"
          message={`Are you sure you want to delete "${promptToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default SystemPrompts;