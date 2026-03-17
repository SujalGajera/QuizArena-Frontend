import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import playerService from '../services/playerService';
import tournamentService from '../services/tournamentService';
import './QuizResult.css';

/**
 * QuizResult - Displays quiz results after completion or when reviewing past quizzes.
 * Shows:
 *  - Score out of 10 with pass/fail status
 *  - All questions with correct, incorrect, and skipped answer tracking
 *  - Works from both post-quiz navigation (with state) and Results tab click (fetches data)
 */
function QuizResult({ user, onLogout }) {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State from navigation (after completing quiz) or fetched from API
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(true);

  // Separately fetched tournament questions (for answer tracking)
  const [tournamentQuestions, setTournamentQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      // Check if result data was passed via navigation state (post-quiz)
      if (location.state && location.state.result) {
        setResultData(location.state.result);
        setLoading(false);
        return;
      }

      // Otherwise, fetch from API (clicking from Results tab)
      try {
        const data = await playerService.getPlayerScore(tournamentId, user.id);
        if (data.success) {
          setResultData(data);
        } else {
          setError(data.message || 'Unable to load results');
        }
      } catch (err) {
        if (err.response && err.response.data) {
          setError(err.response.data.message || 'Unable to load results');
        } else {
          setError('Unable to connect to server');
        }
      } finally {
        setLoading(false);
      }
    };
    loadResult();
  }, [tournamentId, user.id, location.state]);

  // Always fetch the tournament questions separately for answer tracking
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await tournamentService.getTournamentQuestions(tournamentId);
        if (data.success) {
          setTournamentQuestions(data.questions || []);
        }
      } catch (err) {
        console.error('Failed to fetch tournament questions:', err);
      } finally {
        setQuestionsLoading(false);
      }
    };
    fetchQuestions();
  }, [tournamentId]);

  // Parse incorrect answers from JSON string (same as TournamentQuestions component)
  const parseIncorrectAnswers = (incorrectStr) => {
    if (!incorrectStr) return [];
    try {
      return JSON.parse(incorrectStr);
    } catch {
      return [incorrectStr];
    }
  };

  // Helper functions
  const getInitials = (f, l) => ((f?.[0] || '') + (l?.[0] || '')).toUpperCase();

  const getScoreColor = (score) => {
    if (score >= 9) return '#10b981';
    if (score >= 7) return '#06b6d4';
    if (score >= 5) return '#f59e0b';
    return '#ef4444';
  };

  // Loading state
  if (loading) {
    return (
      <div className="result-container">
        <div className="quiz-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          Loading results...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="result-container">
        <nav className="result-nav">
          <div className="result-nav-left">
            <div className="result-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#2563eb" />
                <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="result-logo-text">Trivia Turf</span>
            </div>
          </div>
          <div className="result-nav-right">
            <div className="player-avatar-small">{getInitials(user.firstName, user.lastName)}</div>
          </div>
        </nav>
        <div className="result-main-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="quiz-error-card" style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ color: 'var(--accent-red)', marginBottom: '10px' }}>Unable to Load Results</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
            <button className="btn-back-to-dash" onClick={() => navigate('/player')}>← Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  // Extract result data
  const score = resultData?.score ?? 0;
  const totalQuestions = resultData?.totalQuestions ?? 10;
  const passed = resultData?.passed ?? false;
  const tournamentName = resultData?.tournamentName || location.state?.tournamentName || 'Quiz';
  const questions = resultData?.questions || [];
  const correctCount = resultData?.correctCount ?? score;
  const incorrectCount = resultData?.incorrectCount ?? (totalQuestions - score);

  // Calculate pass percentage for circle
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const circumference = 2 * Math.PI * 58;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="result-container">
      {/* NAVBAR */}
      <nav className="result-nav">
        <div className="result-nav-left">
          <div className="result-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#2563eb" />
              <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="result-logo-text">Trivia Turf</span>
          </div>
        </div>
        <div className="result-nav-right">
          <button className="btn-back-to-dash" onClick={() => navigate('/player')}>
            ← Back to Dashboard
          </button>
          <div className="player-avatar-small">{getInitials(user.firstName, user.lastName)}</div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="result-main-full">
        {/* Score Summary Card */}
        <div className="score-summary-card">
          {/* Score Circle */}
          <div className="score-circle-container">
            <svg className="score-circle-svg" width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle
                cx="70" cy="70" r="58" fill="none"
                stroke={passed ? 'var(--accent-green)' : 'var(--accent-red)'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="score-circle-progress"
                transform="rotate(-90 70 70)"
              />
            </svg>
            <div className="score-circle-text">
              <span className="score-big">{score}/{totalQuestions}</span>
            </div>
            <span className={`score-status-badge ${passed ? 'badge-pass' : 'badge-fail'}`}>
              {passed ? '✓ PASSED' : '✗ FAILED'}
            </span>
          </div>

          {/* Score Message */}
          <div className="score-message">
            <h2 className="score-message-title">
              {passed
                ? score >= 9 ? 'Outstanding Performance! 🏆' : 'Well Done! 🎉'
                : 'Better Luck Next Time 💪'}
            </h2>
            <p className="score-message-desc">
              {passed
                ? `You scored ${score} out of ${totalQuestions} in ${tournamentName}. Great work!`
                : `You scored ${score} out of ${totalQuestions} in ${tournamentName}. Keep practicing!`}
            </p>

            {/* Inline stats */}
            <div className="score-inline-stats">
              <div className="inline-stat">
                <span className="inline-stat-label">Correct</span>
                <span className="inline-stat-value" style={{ color: 'var(--accent-green)' }}>{correctCount}</span>
              </div>
              <div className="inline-stat">
                <span className="inline-stat-label">Wrong</span>
                <span className="inline-stat-value" style={{ color: 'var(--accent-red)' }}>{incorrectCount}</span>
              </div>
              <div className="inline-stat">
                <span className="inline-stat-label">Score</span>
                <span className="inline-stat-value">{percentage}%</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="score-message-actions">
              <button className="btn-back-to-dash" onClick={() => navigate('/player')}>
                ← Back to Dashboard
              </button>
              <button className="btn-review" onClick={() => setShowReview(!showReview)}>
                {showReview ? 'Hide Review' : 'Review Answers'}
              </button>
            </div>
          </div>
        </div>

        {/* Review Answers Section — from result data if available */}
        {showReview && questions.length > 0 && (
          <div className="review-answers-section">
            <h3 className="review-title">📋 Your Answers — {questions.length} Questions</h3>

            {questions.map((q, index) => {
              const playerAnswer = q.playerAnswer || q.selectedAnswer || '';
              const correctAnswer = q.correctAnswer || '';
              const isCorrect = q.correct ?? (playerAnswer === correctAnswer);
              const isSkipped = !playerAnswer || playerAnswer === '';

              return (
                <div key={q.id || index} className={`review-item ${isCorrect ? 'review-correct' : 'review-wrong'}`}>
                  <div className="review-q-number">{index + 1}</div>
                  <div className="review-q-content">
                    <p className="review-q-text">{q.questionText || q.question || `Question ${index + 1}`}</p>
                    <div className="review-answers-row">
                      <div className="review-answer-box ra-correct">
                        <span className="ra-label">✓ Correct Answer</span>
                        <span className="ra-value">{correctAnswer}</span>
                      </div>
                      <div className={`review-answer-box ${isCorrect ? 'ra-correct' : isSkipped ? 'ra-skipped' : 'ra-wrong'}`}>
                        <span className="ra-label">
                          {isSkipped ? '⊘ Your Answer' : isCorrect ? '✓ Your Answer' : '✗ Your Answer'}
                        </span>
                        <span className="ra-value">
                          {isSkipped ? 'Skipped' : playerAnswer}
                        </span>
                      </div>
                    </div>
                    <span className={`review-status ${isCorrect ? 'status-correct' : isSkipped ? 'status-skipped' : 'status-wrong'}`}>
                      {isCorrect ? '✓ Correct' : isSkipped ? '⊘ Skipped' : '✗ Incorrect'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Questions & Answers Section — always fetched from tournament */}
        {showReview && (
          <div className="review-answers-section">
            <h3 className="review-title">📖 Questions & Answers — {tournamentName}</h3>

            {questionsLoading ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Loading questions...</p>
            ) : tournamentQuestions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No questions available.</p>
            ) : (
              tournamentQuestions.map((q, index) => {
                const incorrectAnswers = parseIncorrectAnswers(q.incorrectAnswers);

                return (
                  <div key={q.id || index} className="review-item">
                    {/* Question number */}
                    <div className="review-q-number">{q.questionOrder || index + 1}</div>

                    {/* Question content */}
                    <div className="review-q-content">
                      <p className="review-q-text">{q.questionText}</p>

                      {/* Correct answer */}
                      <div className="review-answer-box ra-correct" style={{ marginBottom: '8px' }}>
                        <span className="ra-label">✓ Correct Answer</span>
                        <span className="ra-value">{q.correctAnswer}</span>
                      </div>

                      {/* Incorrect answers */}
                      {incorrectAnswers.length > 0 && (
                        <div className="review-answer-box ra-wrong">
                          <span className="ra-label">✗ Incorrect Answers</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                            {incorrectAnswers.map((ans, i) => (
                              <span key={i} style={{
                                padding: '4px 12px',
                                background: 'rgba(248, 81, 73, 0.08)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '13px',
                                color: 'var(--text-secondary)'
                              }}>{ans}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Question type */}
                      <span style={{
                        display: 'inline-block', marginTop: '10px', padding: '3px 10px',
                        background: 'var(--bg-input)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', fontSize: '11px', color: 'var(--text-muted)'
                      }}>
                        {q.type === 'multiple' ? 'Multiple Choice' : 'True / False'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="result-footer">
        © 2026 Trivia Turf. All rights reserved.
      </div>
    </div>
  );
}

export default QuizResult;