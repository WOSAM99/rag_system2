import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Sidebar = ({ variant = 'expanded' }) => {
  const [isCollapsed, setIsCollapsed] = useState(variant === 'collapsed');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Dashboard', path: '/login-dashboard', icon: 'LayoutDashboard' },
    { name: 'System Prompts', path: '/system-prompts', icon: 'MessageSquare' },
    { name: 'Chat Interface', path: '/chat-interface', icon: 'MessageSquare' },
    { name: 'Document Upload', path: '/document-upload', icon: 'Upload' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  if (variant === 'mobile') {
    return (
      <>
        <button
          onClick={toggleMobile}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border border-border text-text-secondary hover:text-text-primary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Toggle mobile menu"
        >
          <Icon name="Menu" size={24} />
        </button>

        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={toggleMobile}
              aria-hidden="true"
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={toggleMobile}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  aria-label="Close sidebar"
                >
                  <Icon name="X" size={24} className="text-white" />
                </button>
              </div>
              
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <Icon name="Zap" size={32} className="text-primary" />
                  <span className="ml-2 text-xl font-bold text-text-primary">App</span>
                </div>
                <nav className="mt-5 px-2 space-y-1" role="navigation">
                  {navigationItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`group flex items-center w-full px-2 py-2 text-base font-medium rounded-md ${
                        location.pathname === item.path
                          ? 'bg-primary-light text-primary' :'text-text-secondary hover:bg-surface hover:text-text-primary'
                      }`}
                      aria-current={location.pathname === item.path ? 'page' : undefined}
                    >
                      <Icon name={item.icon} size={20} className="mr-4" />
                      {item.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} transition-all duration-300`}>
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-border">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Icon name="Zap" size={32} className="text-primary" />
            {!isCollapsed && (
              <span className="ml-2 text-xl font-bold text-text-primary">App</span>
            )}
          </div>
          
          <nav className="mt-5 flex-1 px-2 space-y-1" role="navigation">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-light text-primary' :'text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon name={item.icon} size={20} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
                {!isCollapsed && item.name}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-border p-4">
          <button
            onClick={toggleCollapse}
            className="group w-full flex items-center text-sm font-medium text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md p-2"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon 
              name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} 
              size={20} 
              className={isCollapsed ? 'mx-auto' : 'mr-3'} 
            />
            {!isCollapsed && 'Collapse'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;