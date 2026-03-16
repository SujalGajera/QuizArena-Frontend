import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import playerService from '../services/playerService';
import './ScoreboardPage.css';

/**
 * ScoreboardPage - Standalone scoreboard page for a specific tournament.
 * Shows the same global scoreboard table from the result page,
 * but accessible from the player dashboard for participated tournaments.
 */
function ScoreboardPage({ user, onLogout }) {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

  const [scoreboard, setScoreboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);

  // Fetch tournament scoreboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoreData, leaderData] = await Promise.all([
          userService.getTournamentScores(tournamentId),
          playerService.getLeaderboard()
        ]);

        if (scoreData.success) setScoreboard(scoreData);
        if (leaderData.success) setLeaderboard(leaderData.leaderboard || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tournamentId]);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  // Score badge color
  const getScoreColor = (score) => {
    if (score >= 9) return '#10b981';
    if (score >= 7) return '#06b6d4';
    if (score >= 5) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="sb-page-container">
      {/* Navbar */}
      <nav className="result-nav">
        <div className="result-nav-left">
          <div className="result-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#2563eb" />
              <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="result-logo-text">QuizMaster</span>
          </div>
        </div>
        <div className="result-nav-right">
          <button className="btn-signout-player" onClick={() => navigate('/player')}>
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="sb-page-content">
        <h1 className="sb-page-title">
          {scoreboard?.tournamentName || 'Tournament'} — Scoreboard
        </h1>

        {loading ? (
          <div className="scoreboard-loading">Loading...</div>
        ) : scoreboard && scoreboard.scores?.length > 0 ? (
          <>
            {/* Summary stats */}
            <div className="sb-summary-row">
              <div className="sb-summary-card">
                <span className="sb-sum-label">Total Players</span>
                <span className="sb-sum-value">{scoreboard.totalPlayers}</span>
              </div>
              <div className="sb-summary-card">
                <span className="sb-sum-label">Average Score</span>
                <span className="sb-sum-value">{scoreboard.averageScore}/10</span>
              </div>
              <div className="sb-summary-card">
                <span className="sb-sum-label">Total Likes</span>
                <span className="sb-sum-value">♥ {scoreboard.likeCount}</span>
              </div>
            </div>

            {/* Scoreboard table (reuse styles from QuizResult) */}
            <div className="global-scoreboard">
              <div className="sb-header-row">
                <div className="sb-col-name">Player Name</div>
                <div className="sb-col-score">Score</div>
                <div className="sb-col-date">Date</div>
                <div className="sb-col-total">Passed</div>
              </div>
              {scoreboard.scores.map((entry, index) => (
                <div key={index} className="sb-row">
                  <div className="sb-col-name">
                    <div className="sb-player-avatar">{entry.playerName?.[0] || '?'}</div>
                    <span>{entry.playerName}</span>
                  </div>
                  <div className="sb-col-score">
                    <span className="sb-score-badge" style={{ background: getScoreColor(entry.score) }}>
                      {entry.score}/10
                    </span>
                  </div>
                  <div className="sb-col-date">{formatDate(entry.completedDate)}</div>
                  <div className="sb-col-total">
                    <span className={entry.passed ? 'badge-pass-sm' : 'badge-fail-sm'}>
                      {entry.passed ? '✓ Pass' : '✗ Fail'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="scoreboard-empty">No scores recorded for this tournament.</div>
        )}

        {/* Global leaderboard */}
        {leaderboard.length > 0 && (
          <div className="global-scoreboard" style={{ marginTop: '32px' }}>
            <div className="scoreboard-header">
              <h3 className="scoreboard-title">🏆 Global Leaderboard</h3>
            </div>
            <div className="sb-header-row">
              <div className="sb-col-name">Player</div>
              <div className="sb-col-score">Total Score</div>
              <div className="sb-col-date">Quizzes</div>
              <div className="sb-col-total">Avg Score</div>
            </div>
            {leaderboard.slice(0, 10).map((entry, index) => (
              <div key={index} className="sb-row">
                <div className="sb-col-name">
                  <div className="sb-player-avatar">{entry.playerName?.[0] || '?'}</div>
                  <span>{entry.playerName}</span>
                </div>
                <div className="sb-col-score">
                  <span className="sb-score-badge" style={{ background: getScoreColor(entry.averageScore) }}>
                    {entry.totalScore}
                  </span>
                </div>
                <div className="sb-col-date">{entry.tournamentsCompleted}</div>
                <div className="sb-col-total">{entry.averageScore}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScoreboardPage;