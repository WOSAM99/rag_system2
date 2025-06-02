import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Header = ({ variant = 'default' }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Dashboard', path: '/login-dashboard', icon: 'LayoutDashboard' },
    { name: 'System Prompts', path: '/system-prompts', icon: 'MessageSquare' },
    { name: 'Chat Interface', path: '/chat-interface', icon: 'MessageCircle' },
    { name: 'Document Upload', path: '/document-upload', icon: 'Upload' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleProfileMenuToggle = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    navigate('/login');
  };

  if (variant === 'compact') {
    return (
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={handleMobileMenuToggle}
                className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Open mobile menu"
              >
                <Icon name="Menu" size={24} />
              </button>
              <div className="ml-4 flex items-center">
                <Icon name="Zap" size={28} className="text-primary" />
                <span className="ml-2 text-xl font-bold text-text-primary">App</span>
              </div>
            </div>
            
            <div className="relative">
              <button
                onClick={handleProfileMenuToggle}
                className="flex items-center p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="User profile menu"
                aria-expanded={isProfileMenuOpen}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={18} className="text-white" />
                </div>
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-border z-50">
                  <div className="py-1">
                    <button
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-border bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? 'bg-primary-light text-primary' :'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
                >
                  <Icon name={item.icon} size={20} className="mr-3" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <Icon name="Zap" size={32} className="text-primary" />
              <span className="ml-2 text-2xl font-bold text-text-primary">App</span>
            </div>
            
            <nav className="hidden md:ml-10 md:flex md:space-x-8" role="navigation">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-light text-primary' :'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  <Icon name={item.icon} size={18} className="mr-2" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center">
            <button className="hidden md:block p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <Icon name="Bell" size={20} />
            </button>
            
            <div className="ml-3 relative">
              <button
                onClick={handleProfileMenuToggle}
                className="flex items-center p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="User profile menu"
                aria-expanded={isProfileMenuOpen}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={18} className="text-white" />
                </div>
                <Icon name="ChevronDown" size={16} className="ml-1" />
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-border z-50">
                  <div className="py-1">
                    <button
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
                    >
                      Account Settings
                    </button>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleMobileMenuToggle}
              className="md:hidden ml-3 p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Open mobile menu"
            >
              <Icon name="Menu" size={24} />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.path
                    ? 'bg-primary-light text-primary' :'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                <Icon name={item.icon} size={20} className="mr-3" />
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;