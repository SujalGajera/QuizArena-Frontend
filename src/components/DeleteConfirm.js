import React from 'react';
import './DeleteConfirm.css';

/**
 * DeleteConfirm - Small confirmation dialog that appears when admin clicks delete.
 * Shows a warning message with KEEP and DELETE buttons.
 * Design: Dark card with red accent, positioned as a floating dialog.
 */
function DeleteConfirm({ tournamentName, onKeep, onDelete }) {
  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target.className === 'delete-backdrop') {
      onKeep();
    }
  };

  return (
    <div className="delete-backdrop" onClick={handleBackdropClick}>
      <div className="delete-dialog">
        {/* Warning icon and title */}
        <div className="delete-header">
          <span className="delete-warning-icon">⚠️</span>
          <span className="delete-title">Delete Tournament?</span>
        </div>

        {/* Warning message */}
        <p className="delete-message">
          This action is permanent and will remove all participant rankings.
        </p>

        {/* Action buttons */}
        <div className="delete-actions">
          <button className="btn-keep" onClick={onKeep}>
            KEEP
          </button>
          <button className="btn-delete" onClick={onDelete}>
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirm;