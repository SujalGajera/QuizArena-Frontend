import React, { useState, useEffect } from 'react';
import tournamentService from '../services/tournamentService';
import './TournamentQuestions.css';

/**
 * TournamentQuestions - Modal that displays all 10 questions for a tournament.
 * Shows question text, correct answer, and incorrect answers.
 * Appears when the admin clicks on a tournament name in the table.
 */
function TournamentQuestions({ tournamentId, tournamentName, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tournamentInfo, setTournamentInfo] = useState({});

  // Fetch questions when the component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await tournamentService.getTournamentQuestions(tournamentId);
        if (data.success) {
          setQuestions(data.questions || []);
          setTournamentInfo({
            category: data.tournamentCategory,
            difficulty: data.tournamentDifficulty
          });
        } else {
          setError(data.message || 'Failed to load questions');
        }
      } catch (err) {
        setError('Unable to fetch questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [tournamentId]);

  // Parse incorrect answers from JSON string
  const parseIncorrectAnswers = (incorrectStr) => {
    try {
      return JSON.parse(incorrectStr);
    } catch {
      return [incorrectStr];
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target.className === 'questions-backdrop') {
      onClose();
    }
  };

  return (
    <div className="questions-backdrop" onClick={handleBackdropClick}>
      <div className="questions-container">
        {/* Header */}
        <div className="questions-header">
          <div>
            <h2 className="questions-title">{tournamentName}</h2>
            <div className="questions-meta">
              {tournamentInfo.category && (
                <span className="questions-badge">{tournamentInfo.category}</span>
              )}
              {tournamentInfo.difficulty && (
                <span className="questions-badge questions-diff">
                  {tournamentInfo.difficulty.charAt(0).toUpperCase() + tournamentInfo.difficulty.slice(1)}
                </span>
              )}
              <span className="questions-count">{questions.length} Questions</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Content */}
        <div className="questions-body">
          {loading && <div className="questions-loading">Loading questions...</div>}
          {error && <div className="questions-error">{error}</div>}

          {!loading && !error && questions.map((q, index) => (
            <div key={q.id} className="question-item">
              {/* Question number and text */}
              <div className="question-number">Q{q.questionOrder || index + 1}</div>
              <div className="question-content">
                <p className="question-text">{q.questionText}</p>

                {/* Correct answer */}
                <div className="answer-correct">
                  <span className="answer-label">✓ Correct Answer:</span>
                  <span className="answer-value">{q.correctAnswer}</span>
                </div>

                {/* Incorrect answers */}
                <div className="answer-incorrect">
                  <span className="answer-label">✗ Incorrect Answers:</span>
                  <div className="incorrect-list">
                    {parseIncorrectAnswers(q.incorrectAnswers).map((ans, i) => (
                      <span key={i} className="incorrect-item">{ans}</span>
                    ))}
                  </div>
                </div>

                {/* Question type */}
                <span className="question-type-badge">
                  {q.type === 'multiple' ? 'Multiple Choice' : 'True / False'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TournamentQuestions;