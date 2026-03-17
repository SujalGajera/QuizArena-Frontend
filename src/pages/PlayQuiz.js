import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import playerService from '../services/playerService';
import FinishWarning from '../components/FinishWarning';
import './PlayQuiz.css';

/**
 * PlayQuiz - Quiz playing interface with finish warning.
 * Shows warning if player tries to finish without answering all questions.
 */
function PlayQuiz({ user }) {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [tournamentName, setTournamentName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showFinishWarning, setShowFinishWarning] = useState(false);

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const data = await playerService.startQuiz(tournamentId, user.id);
        if (data.success) {
          setQuestions(data.questions || []);
          setTournamentName(data.tournamentName || 'Quiz');
        } else { setError(data.message || 'Unable to start quiz'); }
      } catch (err) {
        if (err.response && err.response.data) { setError(err.response.data.message || 'Unable to start quiz'); }
        else { setError('Unable to connect to server'); }
      } finally { setLoading(false); }
    };
    startQuiz();
  }, [tournamentId, user.id]);

  const handleSelectAnswer = (answer) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: answer });
  };

  const handleBack = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Last question - check if all answered
      const unanswered = questions.length - Object.keys(selectedAnswers).length;
      if (unanswered > 0) {
        setShowFinishWarning(true);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSkip = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleSubmit = async () => {
    setShowFinishWarning(false);
    setSubmitting(true);
    try {
      const answersArray = questions.map((_, index) => selectedAnswers[index] || '');
      const result = await playerService.submitAnswers(tournamentId, user.id, answersArray);
      if (result.success) {
        // Cache feedback locally since backend PlayerScore entity only saves the final score, not the answers
        if (result.feedback) {
          localStorage.setItem(`quiz_feedback_${user.id}_${tournamentId}`, JSON.stringify(result.feedback));
        }
        
        navigate(`/result/${tournamentId}`, {
          state: { result: result, tournamentName: tournamentName }
        });
      } else { setError(result.message || 'Failed to submit answers'); }
    } catch (err) {
      if (err.response && err.response.data) { setError(err.response.data.message || 'Failed to submit'); }
      else { setError('Unable to connect to server'); }
    } finally { setSubmitting(false); }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const currentQuestion = questions[currentIndex];
  const optionLabels = ['A', 'B', 'C', 'D'];

  if (loading) {
    return <div className="quiz-container"><div className="quiz-loading">Loading quiz questions...</div></div>;
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="quiz-error-page">
          <div className="quiz-error-card">
            <h2>Unable to Start Quiz</h2>
            <p>{error}</p>
            <button className="btn-back-dashboard" onClick={() => navigate('/player')}>← Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {/* NAVBAR */}
      <nav className="quiz-nav">
        <div className="quiz-nav-left">
          <div className="quiz-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#2563eb" />
              <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="quiz-logo-text">Trivia Turf</span>
          </div>
        </div>
        <div className="quiz-nav-center">
          <span className="quiz-category-badge">© {tournamentName}</span>
          <div className="quiz-dots">
            {questions.map((_, index) => (
              <span key={index} className={`quiz-dot ${index === currentIndex ? 'dot-current' : ''} ${selectedAnswers[index] ? 'dot-answered' : ''}`} />
            ))}
          </div>
          <span className="quiz-counter">{currentIndex + 1}/{questions.length}</span>
        </div>
        <div className="quiz-nav-right">
          <div className="player-avatar-small">{(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}</div>
        </div>
      </nav>

      {/* QUIZ CONTENT */}
      <div className="quiz-content">
        <div className="quiz-progress-section">
          <div className="progress-header">
            <span className="progress-label">Current Progress</span>
            <span className="progress-percentage">{progressPercent}% Completed</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="progress-question-label">QUESTION {currentIndex + 1} OF {questions.length}</span>
        </div>

        {currentQuestion && (
          <>
            <div className="question-display-card">
              <div className="question-visual">
                <div className="question-visual-inner">
                  <span className="visual-q-number">Q{currentIndex + 1}</span>
                </div>
              </div>
              <div className="question-text-section">
                <span className="question-category-label">{tournamentName.toUpperCase()}</span>
                <h2 className="question-main-text">{currentQuestion.questionText}</h2>
                <p className="question-instruction">Select the correct option below to proceed to the next round.</p>
              </div>
            </div>

            <div className="answer-options-grid">
              {currentQuestion.answers && currentQuestion.answers.map((answer, index) => (
                <button key={index} className={`answer-option ${selectedAnswers[currentIndex] === answer ? 'answer-selected' : ''}`}
                  onClick={() => handleSelectAnswer(answer)}>
                  <div className={`answer-label ${selectedAnswers[currentIndex] === answer ? 'label-selected' : ''}`}>
                    {optionLabels[index] || String.fromCharCode(65 + index)}
                  </div>
                  <div className="answer-content"><span className="answer-text">{answer}</span></div>
                  {selectedAnswers[currentIndex] === answer && (
                    <div className="answer-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="quiz-navigation">
              <button className="btn-quiz-back" onClick={handleBack} disabled={currentIndex === 0}>← Back</button>
              <div className="quiz-nav-right-btns">
                {currentIndex < questions.length - 1 && (
                  <button className="btn-quiz-skip" onClick={handleSkip}>Skip</button>
                )}
                <button className="btn-quiz-next" onClick={handleNext} disabled={submitting}>
                  {submitting ? 'Submitting...' : currentIndex === questions.length - 1 ? 'FINISH →' : 'NEXT →'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="quiz-footer-text">🔒 SECURE SESSION • ENCRYPTED PROGRESS</div>

      {/* Finish Warning */}
      {showFinishWarning && (
        <FinishWarning
          unansweredCount={questions.length - answeredCount}
          totalQuestions={questions.length}
          onCancel={() => setShowFinishWarning(false)}
          onFinish={handleSubmit}
        />
      )}
    </div>
  );
}

export default PlayQuiz;