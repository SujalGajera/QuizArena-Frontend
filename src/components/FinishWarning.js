import React from 'react';
import './FinishWarning.css';

/**
 * FinishWarning - Warning dialog shown when player tries to finish quiz
 * without answering all questions.
 */
function FinishWarning({ unansweredCount, totalQuestions, onCancel, onFinish }) {
  const handleBackdropClick = (e) => {
    if (e.target.className === 'finish-backdrop') onCancel();
  };

  return (
    <div className="finish-backdrop" onClick={handleBackdropClick}>
      <div className="finish-dialog">
        <div className="finish-icon">⚠️</div>
        <h3 className="finish-title">Not All Questions Answered</h3>
        <p className="finish-message">
          You have <strong>{unansweredCount}</strong> of <strong>{totalQuestions}</strong> questions
          unanswered. Unanswered questions will be marked as incorrect.
        </p>
        <p className="finish-confirm-text">Are you sure you want to finish?</p>
        <div className="finish-actions">
          <button className="btn-finish-cancel" onClick={onCancel}>Go Back</button>
          <button className="btn-finish-confirm" onClick={onFinish}>Finish Anyway</button>
        </div>
      </div>
    </div>
  );
}

export default FinishWarning;