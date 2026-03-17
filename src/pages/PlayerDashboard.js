import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import playerService from '../services/playerService';
import authService from '../services/authService';
import ProfileModal from '../components/ProfileModal';
import './PlayerDashboard.css';

/**
 * PlayerDashboard - Main player page with navbar tabs:
 *   Dashboard (tournaments), Results (quiz history), Leaderboard
 * Also includes editable profile via avatar click.
 */
function PlayerDashboard({ user, onLogout }) {
  const navigate = useNavigate();

  // Top-level view tabs
  const [activeView, setActiveView] = useState('dashboard');

  // Tournament data
  const [tournaments, setTournaments] = useState({ ongoing: [], upcoming: [], past: [], participated: [] });
  const [activeTab, setActiveTab] = useState('ongoing');
  const [loading, setLoading] = useState(true);

  // Results / History
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Profile modal
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await playerService.getTournamentsByStatus(currentUser.id);
      if (data.success) {
        setTournaments({ ongoing: data.ongoing || [], upcoming: data.upcoming || [], past: data.past || [], participated: data.participated || [] });
      }
    } catch (err) { console.error('Failed to fetch tournaments:', err); }
    finally { setLoading(false); }
  }, [currentUser.id]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await playerService.getHistory(currentUser.id);
      if (data.success) setHistory(data.history || []);
    } catch (err) { console.error('Failed to fetch history:', err); }
    finally { setHistoryLoading(false); }
  }, [currentUser.id]);

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const data = await playerService.getLeaderboard();
      if (data.success) setLeaderboard(data.leaderboard || []);
    } catch (err) { console.error('Failed to fetch leaderboard:', err); }
    finally { setLeaderboardLoading(false); }
  }, []);

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  useEffect(() => {
    if (activeView === 'results') fetchHistory();
    if (activeView === 'leaderboard') fetchLeaderboard();
  }, [activeView, fetchHistory, fetchLeaderboard]);

  const handleSignOut = async () => {
    try { await authService.logout(); } catch (err) {}
    onLogout();
    navigate('/');
  };

  const handleCardClick = (tournament) => {
    if (activeTab === 'ongoing') navigate(`/play/${tournament.id}`);
    else if (activeTab === 'participated') navigate(`/result/${tournament.id}`);
  };

  const handleLike = async (e, tournamentId) => {
    e.stopPropagation();
    try { await playerService.toggleLike(tournamentId, currentUser.id); fetchTournaments(); }
    catch (err) { console.error('Failed to toggle like:', err); }
  };

  const handleProfileUpdated = (updatedUser) => {
    setCurrentUser({ ...currentUser, ...updatedUser });
    // Update localStorage
    const stored = JSON.parse(localStorage.getItem('quizUser') || '{}');
    localStorage.setItem('quizUser', JSON.stringify({ ...stored, ...updatedUser }));
  };

  const currentTournaments = tournaments[activeTab] || [];

  const getCategoryColor = (cat) => {
    const colors = { 'General Knowledge':'#3b82f6','Entertainment: Books':'#8b5cf6','Entertainment: Film':'#ec4899','Entertainment: Music':'#f59e0b','Science & Nature':'#10b981','Science: Computers':'#06b6d4','Science: Mathematics':'#6366f1','Sports':'#ef4444','Geography':'#14b8a6','History':'#f97316','Art':'#d946ef','Animals':'#84cc16' };
    return colors[cat] || '#3b82f6';
  };
  const getDifficultyColor = (d) => { switch(d?.toLowerCase()){ case 'easy':return '#10b981'; case 'medium':return '#f59e0b'; case 'hard':return '#ef4444'; default:return '#6b7280'; } };
  const shortenCategory = (cat) => { const map={'General Knowledge':'GENERAL','Entertainment: Books':'BOOKS','Entertainment: Film':'FILM','Entertainment: Music':'MUSIC','Science & Nature':'SCIENCE','Science: Computers':'TECH','Science: Mathematics':'MATH','Sports':'SPORTS','Geography':'GEO','History':'HISTORY','Art':'ART','Animals':'ANIMALS'}; return map[cat]||cat?.toUpperCase()||''; };
  const formatDateRange = (s,e) => { if(!s||!e)return''; const opts={month:'short',day:'2-digit'}; return `${new Date(s).toLocaleDateString('en-US',opts)} – ${new Date(e).toLocaleDateString('en-US',opts)}`; };
  const formatDate = (d) => { if(!d)return''; return new Date(d).toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'}); };
  const getInitials = (f,l) => ((f?.[0]||'')+(l?.[0]||'')).toUpperCase();
  const getCardGradient = (i) => { const g=['linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0ea5e9 100%)','linear-gradient(135deg,#0f172a 0%,#312e81 50%,#7c3aed 100%)','linear-gradient(135deg,#0f172a 0%,#3f3f46 50%,#a1a1aa 100%)','linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#06b6d4 100%)','linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)','linear-gradient(135deg,#0f172a 0%,#4c1d95 50%,#a78bfa 100%)']; return g[i%g.length]; };
  const getScoreColor = (s) => { if(s>=9)return'#10b981'; if(s>=7)return'#06b6d4'; if(s>=5)return'#f59e0b'; return'#ef4444'; };

  return (
    <div className="player-container">
      {/* NAVBAR with view tabs */}
      <nav className="player-nav">
        <div className="player-nav-left">
          <div className="player-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#2563eb"/><path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="player-logo-text">Trivia Turf</span>
          </div>
          <div className="player-view-tabs">
            <button className={`view-tab ${activeView === 'dashboard' ? 'view-tab-active' : ''}`} onClick={() => setActiveView('dashboard')}>Dashboard</button>
            <button className={`view-tab ${activeView === 'results' ? 'view-tab-active' : ''}`} onClick={() => setActiveView('results')}>Results</button>
            <button className={`view-tab ${activeView === 'leaderboard' ? 'view-tab-active' : ''}`} onClick={() => setActiveView('leaderboard')}>Leaderboard</button>
          </div>
        </div>
        <div className="player-nav-right">
          <button className="btn-signout-player" onClick={handleSignOut}>Sign Out</button>
          <div className="player-avatar" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }} title="Edit Profile">
            {getInitials(currentUser.firstName, currentUser.lastName)}
          </div>
        </div>
      </nav>

      <div className="player-content">
        {/* ===== DASHBOARD VIEW ===== */}
        {activeView === 'dashboard' && (
          <>
            <div className="player-header">
              <h1 className="player-title">Tournament Arena</h1>
              <p className="player-subtitle">Discover, join, and dominate the latest quiz events.</p>
            </div>
            <div className="player-tabs">
              {['ongoing','upcoming','past','participated'].map((tab)=>(
                <button key={tab} className={`player-tab ${activeTab===tab?'tab-active':''}`} onClick={()=>setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase()+tab.slice(1)}
                  {tournaments[tab]?.length>0&&<span className="tab-count">{tournaments[tab].length}</span>}
                </button>
              ))}
            </div>
            <div className="tournament-cards-grid">
              {loading?(<div className="cards-loading">Loading tournaments...</div>):currentTournaments.length===0?(<div className="cards-empty">
                {activeTab==='ongoing'&&'No ongoing tournaments available right now.'}
                {activeTab==='upcoming'&&'No upcoming tournaments scheduled.'}
                {activeTab==='past'&&'No past tournaments to show.'}
                {activeTab==='participated'&&"You haven't participated in any tournaments yet."}
              </div>):(
                currentTournaments.map((tournament,index)=>(
                  <div key={tournament.id} className={`tournament-card ${(activeTab==='ongoing'||activeTab==='participated')?'card-clickable':''}`} onClick={()=>handleCardClick(tournament)}>
                    <div className="card-image" style={{background:getCardGradient(index)}}>
                      <button className={`card-like-btn ${tournament.likedByPlayer?'liked':''}`} onClick={(e)=>handleLike(e,tournament.id)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={tournament.likedByPlayer?'#ef4444':'none'} stroke={tournament.likedByPlayer?'#ef4444':'currentColor'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </button>
                      <span className="card-category-badge" style={{background:getCategoryColor(tournament.category)}}>{shortenCategory(tournament.category)}</span>
                    </div>
                    <div className="card-body">
                      <h3 className="card-title">{tournament.name}</h3>
                      <p className="card-creator">by {tournament.creator}</p>
                      <div className="card-meta">
                        <div className="card-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>{formatDateRange(tournament.startDate,tournament.endDate)}</span></div>
                        <div className="card-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg><span style={{color:getDifficultyColor(tournament.difficulty)}}>{tournament.difficulty?.charAt(0).toUpperCase()+tournament.difficulty?.slice(1)}</span></div>
                      </div>
                      {tournament.likeCount>0&&<div className="card-likes">❤️ {tournament.likeCount} {tournament.likeCount===1?'like':'likes'}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ===== RESULTS VIEW ===== */}
        {activeView === 'results' && (
          <>
            <div className="player-header">
              <h1 className="player-title">My Quiz Results</h1>
              <p className="player-subtitle">Track your performance across all tournaments.</p>
            </div>
            {historyLoading ? (
              <div className="cards-loading">Loading results...</div>
            ) : history.length === 0 ? (
              <div className="cards-empty">
                You haven't completed any quizzes yet. Go play some tournaments!
              </div>
            ) : (
              <div className="results-table-container">
                <div className="results-header-row">
                  <div>Tournament</div>
                  <div>Category</div>
                  <div>Difficulty</div>
                  <div>Score</div>
                  <div>Date</div>
                  <div>Status</div>
                </div>
                {history.map((h, i) => (
                  <div key={i} className="results-row"
                    onClick={() => navigate(`/result/${h.tournamentId}`)}>
                    <div className="results-name">{h.tournamentName || 'Unknown'}</div>
                    <div>
                      {h.category ? (
                        <span className="mini-badge"
                          style={{ background: getCategoryColor(h.category) }}>
                          {shortenCategory(h.category)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                      )}
                    </div>
                    <div>
                      {h.difficulty ? (
                        <span style={{ color: getDifficultyColor(h.difficulty), fontSize: '13px', fontWeight: 500 }}>
                          {h.difficulty.charAt(0).toUpperCase() + h.difficulty.slice(1)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                      )}
                    </div>
                    <div>
                      <span className="sb-score-badge"
                        style={{ background: getScoreColor(h.score || 0) }}>
                        {h.score || 0}/10
                      </span>
                    </div>
                    <div className="results-date">{formatDate(h.completedDate)}</div>
                    <div>
                      <span className={h.passed ? 'badge-pass-sm' : 'badge-fail-sm'}>
                        {h.passed ? '✓ Pass' : '✗ Fail'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== LEADERBOARD VIEW ===== */}
        {activeView === 'leaderboard' && (
          <>
            <div className="player-header">
              <h1 className="player-title">🏆 Global Leaderboard</h1>
              <p className="player-subtitle">Top players across all tournaments.</p>
            </div>
            {leaderboardLoading ? (
              <div className="cards-loading">Loading leaderboard...</div>
            ) : leaderboard.length === 0 ? (
              <div className="cards-empty">No leaderboard data yet.</div>
            ) : (
              <div className="results-table-container">
                <div className="leaderboard-header-row">
                  <div>Rank</div>
                  <div>Player</div>
                  <div>Total Score</div>
                  <div>Quizzes</div>
                  <div>Average</div>
                </div>
                {leaderboard.map((entry, i) => (
                  <div key={i} className="leaderboard-row">
                    <div className="rank-number">#{i + 1}</div>
                    <div className="results-name">{entry.playerName}</div>
                    <div>
                      <span className="sb-score-badge"
                        style={{ background: getScoreColor(entry.averageScore) }}>
                        {entry.totalScore}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {entry.tournamentsCompleted}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {entry.averageScore}/10
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal user={currentUser} onClose={() => setShowProfile(false)} onProfileUpdated={handleProfileUpdated} />
      )}
    </div>
  );
}

export default PlayerDashboard;