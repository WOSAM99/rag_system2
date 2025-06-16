import React from 'react';
import Icon from '../AppIcon';
import Image from '../AppImage';

const Card = ({
  children,
  variant = 'standard',
  interactive = false,
  onClick,
  className = '',
  title,
  subtitle,
  image,
  avatar,
  actions,
  metadata,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg border border-border overflow-hidden';
  
  const variantClasses = {
    standard: 'p-6',
    interactive: 'p-6 cursor-pointer hover:shadow-md hover:border-border-strong transition-all duration-200',
    profile: 'p-6',
    document: 'p-4',
    chat: 'p-4',
  };

  const cardClasses = `${baseClasses} ${interactive ? variantClasses.interactive : variantClasses[variant]} ${className}`;

  const handleClick = (e) => {
    if (interactive && onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e) => {
    if (interactive && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  const renderProfileCard = () => (
    <div className="flex items-center space-x-4">
      {avatar && (
        <div className="flex-shrink-0">
          {typeof avatar === 'string' ? (
            <Image
              src={avatar}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={24} className="text-white" />
            </div>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-lg font-semibold text-text-primary truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-text-secondary truncate">
            {subtitle}
          </p>
        )}
        {metadata && (
          <div className="mt-2 flex items-center space-x-4 text-xs text-text-tertiary">
            {metadata.map((item, index) => (
              <span key={index} className="flex items-center">
                {item.icon && <Icon name={item.icon} size={14} className="mr-1" />}
                {item.label}
              </span>
            ))}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex-shrink-0 flex space-x-2">
          {actions}
        </div>
      )}
    </div>
  );

  const renderDocumentCard = () => (
    <div>
      {image && (
        <div className="mb-3">
          <Image
            src={image}
            alt={title || 'Document'}
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-base font-medium text-text-primary truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}
          {metadata && (
            <div className="mt-2 flex items-center space-x-3 text-xs text-text-tertiary">
              {metadata.map((item, index) => (
                <span key={index} className="flex items-center">
                  {item.icon && <Icon name={item.icon} size={12} className="mr-1" />}
                  {item.label}
                </span>
              ))}
            </div>
          )}
        </div>
        {actions && (
          <div className="ml-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  const renderChatCard = () => (
    <div className="flex space-x-3">
      {avatar && (
        <div className="flex-shrink-0">
          {typeof avatar === 'string' ? (
            <Image
              src={avatar}
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={16} className="text-white" />
            </div>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-text-primary">{title}</span>
            {metadata && metadata[0] && (
              <span className="text-xs text-text-tertiary">{metadata[0].label}</span>
            )}
          </div>
        )}
        <div className="text-sm text-text-primary">
          {children}
        </div>
        {actions && (
          <div className="mt-2 flex space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  const renderStandardCard = () => (
    <div>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-text-primary">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-text-secondary mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
      {actions && (
        <div className="mt-4 flex justify-end space-x-2">
          {actions}
        </div>
      )}
    </div>
  );

  const renderCardContent = () => {
    switch (variant) {
      case 'profile':
        return renderProfileCard();
      case 'document':
        return renderDocumentCard();
      case 'chat':
        return renderChatCard();
      default:
        return renderStandardCard();
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      {...props}
    >
      {renderCardContent()}
    </div>
  );
};

export default Card;