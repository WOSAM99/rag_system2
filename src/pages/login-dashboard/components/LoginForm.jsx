import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import ActionButton from './ActionButton';

const LoginForm = ({ onLogin, isLoading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Mock credentials for demonstration
  const mockCredentials = {
    email: 'demo@ragSystem.com',
    password: 'demo123'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check mock credentials
    if (formData.email !== mockCredentials.email || formData.password !== mockCredentials.password) {
      setValidationErrors({
        general: `Invalid credentials. Use email: ${mockCredentials.email} and password: ${mockCredentials.password}`
      });
      return;
    }

    await onLogin(formData);
  };

  const handleDemoLogin = () => {
    setFormData(mockCredentials);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-border p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {(error || validationErrors.general) && (
          <div className="bg-error-light border border-error border-opacity-20 rounded-lg p-4 flex items-start">
            <Icon name="AlertCircle" size={20} className="text-error mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-error text-sm">{error || validationErrors.general}</span>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-colors ${
                validationErrors.email 
                  ? 'border-error focus:ring-error' :'border-border-strong focus:border-primary'
              }`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            <Icon 
              name="Mail" 
              size={20} 
              className="absolute right-3 top-3.5 text-text-tertiary" 
            />
          </div>
          {validationErrors.email && (
            <p className="mt-1 text-sm text-error">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-colors ${
                validationErrors.password 
                  ? 'border-error focus:ring-error' :'border-border-strong focus:border-primary'
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-text-tertiary hover:text-text-secondary focus:outline-none"
              disabled={isLoading}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>
          {validationErrors.password && (
            <p className="mt-1 text-sm text-error">{validationErrors.password}</p>
          )}
        </div>

        <div className="space-y-3">
          <ActionButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing In...
              </>
            ) : (
              <>
                <Icon name="LogIn" size={20} className="mr-2" />
                Sign In
              </>
            )}
          </ActionButton>

          <ActionButton
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            <Icon name="Zap" size={20} className="mr-2" />
            Use Demo Credentials
          </ActionButton>
        </div>

        <div className="text-center">
          <p className="text-sm text-text-secondary">
            Demo credentials: <span className="font-medium">{mockCredentials.email}</span> / <span className="font-medium">{mockCredentials.password}</span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;