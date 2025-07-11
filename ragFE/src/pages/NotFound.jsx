import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/AppIcon';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/login-dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-primary-light rounded-full flex items-center justify-center">
            <Icon name="FileQuestion" size={48} className="text-primary" />
          </div>
          <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Page Not Found</h2>
          <p className="text-text-secondary mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Icon name="Home" size={20} />
            Go to Dashboard
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-surface hover:bg-border text-text-primary font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Icon name="ArrowLeft" size={20} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;