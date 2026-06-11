import React from 'react';
import { PackageOpen } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({ title, description, icon: Icon = PackageOpen, actionText, onAction }) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 className="empty-state-title">{title || "No items found"}</h3>
      <p className="empty-state-desc">{description || "There are currently no records to display here."}</p>
      {actionText && onAction && (
        <button className="btn-primary empty-state-btn" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
