import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import LoginForm from './components/LoginForm';
import ProfileCard from './components/ProfileCard';
import ActionButton from './components/ActionButton';
import EmptyState from './components/EmptyState';
import CreateProfileForm from './components/CreateProfileForm';
import Icon from '../../components/AppIcon';
import { ensureUserExists, getCurrentUser } from '../../config/supabase';
import { getProfiles, createProfile, updateProfile, deleteProfile } from '../../services/profilesApi';

const LoginDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setIsAuthenticated(true);
      loadProfiles();
    }
    setIsLoading(false);
  }, []);

  const loadProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      const profilesData = await getProfiles();
      setProfiles(profilesData);
      setError(null);
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError('Failed to load profiles. Please try again.');
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock JWT token
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocktoken';
      localStorage.setItem('jwt_token', mockToken);
      
      // Get current user info (this generates UUID if needed)
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('Failed to get user information');
      }
      
      // Ensure user exists in Supabase
      const userData = {
        id: currentUser.id,
        email: credentials.email || 'user@example.com'
      };
      
      console.log('Creating user with data:', userData); // Debug log
      const userResult = await ensureUserExists(userData);
      console.log('User creation result:', userResult); // Debug log
      
      if (!userResult) {
        throw new Error('Failed to create or verify user in database');
      }
      
      setIsAuthenticated(true);
      
      // Load profiles after user is confirmed to exist
      await loadProfiles();
      
    } catch (err) {
      console.error('Login error:', err);
      setError(`Login failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfile = () => {
    setShowCreateModal(true);
  };

  const handleCreateNewProfile = async (profileData) => {
    setIsCreatingProfile(true);
    try {
      console.log('Creating profile with data:', profileData); // Debug log
      const newProfile = await createProfile(profileData);
      console.log('Profile created successfully:', newProfile); // Debug log
      setProfiles(prev => [newProfile, ...prev]);
      setShowCreateModal(false);
      setError(null);
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(`Failed to create profile: ${err.message || 'Unknown error'}`);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleChatWithProfile = (profileId) => {
    navigate(`/chat-interface?profile=${profileId}`);
  };

  const handleUploadDocuments = (profileId) => {
    navigate(`/document-upload?profile=${profileId}`);
  };

  const handleEditProfile = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setEditingProfile(profile);
      setShowCreateModal(true);
    }
  };

  const handleUpdateProfile = async (profileData) => {
    setIsCreatingProfile(true);
    try {
      const updatedProfile = await updateProfile(editingProfile.id, profileData);
      setProfiles(prev => prev.map(profile => 
        profile.id === editingProfile.id ? updatedProfile : profile
      ));
      
      setShowCreateModal(false);
      setEditingProfile(null);
      setError(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      try {
        await deleteProfile(profileId);
        setProfiles(profiles.filter(profile => profile.id !== profileId));
      } catch (err) {
        console.error('Error deleting profile:', err);
        setError('Failed to delete profile. Please try again.');
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    if (isAuthenticated) {
      loadProfiles();
    }
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <Icon name="Zap" size={48} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome to RAG System</h1>
              <p className="text-text-secondary">Sign in to access your personalized AI profiles</p>
            </div>
            
            <LoginForm onLogin={handleLogin} isLoading={isLoading} error={error} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-error-light border border-error border-opacity-20 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Icon name="AlertCircle" size={20} className="text-error mr-3" />
              <span className="text-error font-medium">{error}</span>
            </div>
            <ActionButton
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="text-error hover:bg-error hover:bg-opacity-10"
            >
              <Icon name="RotateCcw" size={16} className="mr-1" />
              Retry
            </ActionButton>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Your AI Profiles</h1>
            <p className="text-text-secondary">
              Manage your specialized AI assistants and their knowledge bases
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <ActionButton
              variant="primary"
              onClick={handleCreateProfile}
              className="w-full sm:w-auto"
            >
              <Icon name="Plus" size={20} className="mr-2" />
              Create Profile
            </ActionButton>
          </div>
        </div>

        {isLoadingProfiles ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-surface rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-border rounded mb-3"></div>
                <div className="h-4 bg-border rounded mb-2"></div>
                <div className="h-4 bg-border rounded w-3/4 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-border rounded w-20"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-16 bg-border rounded"></div>
                    <div className="h-8 w-16 bg-border rounded"></div>
                    <div className="h-8 w-8 bg-border rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <EmptyState onCreateProfile={handleCreateProfile} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onChat={() => handleChatWithProfile(profile.id)}
                onUpload={() => handleUploadDocuments(profile.id)}
                onEdit={() => handleEditProfile(profile.id)}
                onDelete={() => handleDeleteProfile(profile.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Profile Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary">
                  {editingProfile ? 'Edit AI Profile' : 'Create New AI Profile'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingProfile(null);
                  }}
                  className="text-text-tertiary hover:text-text-secondary"
                  disabled={isCreatingProfile}
                >
                  <Icon name="X" size={24} />
                </button>
              </div>
              
              <CreateProfileForm
                onSubmit={editingProfile ? handleUpdateProfile : handleCreateNewProfile}
                onCancel={() => {
                  setShowCreateModal(false);
                  setEditingProfile(null);
                }}
                isLoading={isCreatingProfile}
                profile={editingProfile}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginDashboard;