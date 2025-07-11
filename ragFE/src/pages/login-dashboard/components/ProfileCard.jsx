import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import ActionButton from './ActionButton';

const ProfileCard = ({ profile, onChat, onUpload, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuAction = (action) => {
    setIsMenuOpen(false);
    action();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow duration-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-2">{profile.name}</h3>
          <p className="text-text-secondary text-sm line-clamp-3 mb-3">
            {profile.description}
          </p>
        </div>
        
        <div className="relative ml-4">
          <button
            onClick={handleMenuToggle}
            className="p-2 text-text-tertiary hover:text-text-secondary hover:bg-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Profile options"
          >
            <Icon name="MoreVertical" size={20} />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-border z-10">
              <div className="py-1">
                <button
                  onClick={() => handleMenuAction(onEdit)}
                  className="flex items-center w-full px-4 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
                >
                  <Icon name="Edit" size={16} className="mr-3" />
                  Edit Profile
                </button>
                <button
                  onClick={() => handleMenuAction(onDelete)}
                  className="flex items-center w-full px-4 py-2 text-sm text-error hover:bg-error-light"
                >
                  <Icon name="Trash2" size={16} className="mr-3" />
                  Delete Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-text-secondary">
          <Icon name="FileText" size={16} className="mr-2" />
          <span>{profile.documentCount} documents</span>
        </div>
        <div className="text-sm text-text-tertiary">
          Last used: {formatDate(profile.lastUsed)}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ActionButton
          variant="primary"
          size="sm"
          onClick={onChat}
          className="flex-1"
        >
          <Icon name="MessageSquare" size={16} className="mr-2" />
          Chat
        </ActionButton>
        
        <ActionButton
          variant="outline"
          size="sm"
          onClick={onUpload}
          className="flex-1"
        >
          <Icon name="Upload" size={16} className="mr-2" />
          Upload
        </ActionButton>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-text-tertiary">
          <span>Created: {formatDate(profile.createdAt)}</span>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
            <span>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;