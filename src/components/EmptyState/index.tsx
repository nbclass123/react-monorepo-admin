import type { ReactNode } from "react";

import "./index.css";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ title, description, action }: EmptyStateProps): ReactNode => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="12" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
          <path d="M8 20h48" stroke="currentColor" strokeWidth="2" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
          <circle cx="22" cy="16" r="1.5" fill="currentColor" />
          <circle cx="28" cy="16" r="1.5" fill="currentColor" />
          <rect x="24" y="36" width="16" height="2" rx="1" fill="currentColor" opacity="0.4" />
          <rect x="20" y="42" width="24" height="2" rx="1" fill="currentColor" opacity="0.3" />
          <rect x="22" y="48" width="20" height="2" rx="1" fill="currentColor" opacity="0.2" />
        </svg>
      </div>
      {title && <div className="empty-state__title">{title}</div>}
      {description && <div className="empty-state__description">{description}</div>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
};

export default EmptyState;
