import React from 'react';
import Icon from '../../../components/AppIcon';
import ActionButton from './ActionButton';

const EmptyState = ({ onCreateProfile }) => {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 bg-primary-light rounded-full flex items-center justify-center">
          <Icon name="Bot" size={48} className="text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold text-text-primary mb-3">
          No AI Profiles Yet
        </h3>
        
        <p className="text-text-secondary mb-8 leading-relaxed">
          Create your first AI profile to get started. Each profile can be specialized for different tasks and trained on specific documents to provide tailored assistance.
        </p>
        
        <div className="space-y-4">
          <ActionButton
            variant="primary"
            size="lg"
            onClick={onCreateProfile}
            className="w-full sm:w-auto"
          >
            <Icon name="Plus" size={20} className="mr-2" />
            Create Your First Profile
          </ActionButton>
          
          <div className="text-sm text-text-tertiary">
            <p>Get started in minutes with our guided setup</p>
          </div>
        </div>
        
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-surface rounded-lg p-4">
            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center mb-3">
              <Icon name="FileText" size={20} className="text-primary" />
            </div>
            <h4 className="font-medium text-text-primary mb-2">Upload Documents</h4>
            <p className="text-sm text-text-secondary">
              Add PDFs, documents, and files to train your AI
            </p>
          </div>
          
          <div className="bg-surface rounded-lg p-4">
            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center mb-3">
              <Icon name="Settings" size={20} className="text-primary" />
            </div>
            <h4 className="font-medium text-text-primary mb-2">Customize Behavior</h4>
            <p className="text-sm text-text-secondary">
              Set system prompts and configure AI responses
            </p>
          </div>
          
          <div className="bg-surface rounded-lg p-4">
            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center mb-3">
              <Icon name="MessageSquare" size={20} className="text-primary" />
            </div>
            <h4 className="font-medium text-text-primary mb-2">Start Chatting</h4>
            <p className="text-sm text-text-secondary">
              Interact with your specialized AI assistant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;