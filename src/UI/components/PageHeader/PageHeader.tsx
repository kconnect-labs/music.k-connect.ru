import React from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}) => {
  return (
    <div className={`page-header ${className}`}>
      <div className="page-header-content">
        <div className="page-header-main">
          <h1 className="page-header-title">{title}</h1>
          {subtitle && (
            <p className="page-header-subtitle">{subtitle}</p>
          )}
          {children && (
            <div className="page-header-children">{children}</div>
          )}
        </div>
        {action && (
          <div className="page-header-action">{action}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;

