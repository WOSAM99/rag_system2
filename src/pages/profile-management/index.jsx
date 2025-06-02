import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ProfileForm from './components/ProfileForm';

import ConfirmationModal from './components/ConfirmationModal';
import ActionButton from './components/ActionButton';
import Icon from '../../components/AppIcon';

const ProfileManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);

  // Mock profiles data
  const [profiles, setProfiles] = useState([
    {
      id: 1,
      name: "Customer Support Agent",
      description: "Specialized in handling customer inquiries, complaints, and providing technical support with empathy and efficiency.",
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: new Date(Date.now() - 86400000 * 2),
      isActive: true
    },
    {
      id: 2,
      name: "Technical Documentation Writer",
      description: "Expert in creating clear, comprehensive technical documentation, API guides, and user manuals for complex software systems.",
      createdAt: new Date(Date.now() - 86400000 * 10),
      updatedAt: new Date(Date.now() - 86400000 * 1),
      isActive: false
    },
    {
      id: 3,
      name: "Data Analysis Assistant",
      description: "Specialized in analyzing datasets, generating insights, creating visualizations, and providing data-driven recommendations.",
      createdAt: new Date(Date.now() - 86400000 * 15),
      updatedAt: new Date(Date.now() - 86400000 * 3),
      isActive: true
    }
  ]);

  // Check if we're in edit mode from URL params or state
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const editId = urlParams.get('edit');
    if (editId) {
      const profileToEdit = profiles.find(p => p.id === parseInt(editId));
      if (profileToEdit) {
        setEditingProfile(profileToEdit);
      }
    }
  }, [location.search, profiles]);

  const handleCreateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newProfile = {
        id: Date.now(),
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      setProfiles(prev => [newProfile, ...prev]);
      setNotification({
        type: 'success',
        message: 'Profile created successfully!'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to create profile. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProfiles(prev => prev.map(profile => 
        profile.id === editingProfile.id 
          ? { ...profile, ...profileData, updatedAt: new Date() }
          : profile
      ));
      
      setEditingProfile(null);
      navigate('/profile-management');
      
      setNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      });
      
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfiles(prev => prev.filter(profile => profile.id !== profileId));
      setShowDeleteModal(false);
      setProfileToDelete(null);
      
      setNotification({
        type: 'success',
        message: 'Profile deleted successfully!'
      });
      
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to delete profile. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    navigate(`/profile-management?edit=${profile.id}`);
  };

  const handleDeleteClick = (profile) => {
    setProfileToDelete(profile);
    setShowDeleteModal(true);
  };

  const handleCancelEdit = () => {
    setEditingProfile(null);
    navigate('/profile-management');
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
                {editingProfile ? 'Edit Profile' : 'Profile Management'}
              </h1>
              <p className="mt-2 text-text-secondary">
                {editingProfile 
                  ? 'Update your profile information and settings'
                  : 'Create and manage your AI assistant profiles for different use cases'
                }
              </p>
            </div>
            
            {!editingProfile && (
              <ActionButton
                variant="primary"
                onClick={() => setEditingProfile({})}
                icon="Plus"
                className="w-full sm:w-auto"
              >
                Create Profile
              </ActionButton>
            )}
          </div>
        </div>

        {/* Profile Form Section */}
        {editingProfile && (
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-border shadow-sm">
              <div className="p-6">
                <ProfileForm
                  profile={editingProfile.id ? editingProfile : null}
                  onSubmit={editingProfile.id ? handleUpdateProfile : handleCreateProfile}
                  onCancel={handleCancelEdit}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Profiles List Section */}
        {!editingProfile && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary">
                Your Profiles ({profiles.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Icon name="Info" size={16} />
                <span>Click on a profile to view details</span>
              </div>
            </div>

            {profiles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-border">
                <div className="w-16 h-16 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center">
                  <Icon name="Users" size={32} className="text-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">No profiles yet</h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  Create your first AI assistant profile to get started with personalized conversations.
                </p>
                <ActionButton
                  variant="primary"
                  onClick={() => setEditingProfile({})}
                  icon="Plus"
                >
                  Create Your First Profile
                </ActionButton>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            profile.isActive ? 'bg-success' : 'bg-text-tertiary'
                          }`} />
                          <h3 className="font-semibold text-text-primary text-lg">
                            {profile.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditProfile(profile)}
                            className="p-1 text-text-tertiary hover:text-primary transition-colors"
                            aria-label="Edit profile"
                          >
                            <Icon name="Edit2" size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(profile)}
                            className="p-1 text-text-tertiary hover:text-error transition-colors"
                            aria-label="Delete profile"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                        {profile.description}
                      </p>
                      
                      <div className="space-y-2 text-xs text-text-tertiary">
                        <div className="flex items-center gap-2">
                          <Icon name="Calendar" size={12} />
                          <span>Created: {formatDate(profile.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Clock" size={12} />
                          <span>Updated: {formatDate(profile.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            profile.isActive 
                              ? 'bg-success-light text-success' :'bg-surface text-text-tertiary'
                          }`}>
                            {profile.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <ActionButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditProfile(profile)}
                          >
                            Edit
                          </ActionButton>
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
      {showDeleteModal && profileToDelete && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setProfileToDelete(null);
          }}
          onConfirm={() => handleDeleteProfile(profileToDelete.id)}
          title="Delete Profile"
          message={`Are you sure you want to delete "${profileToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ProfileManagement;