import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import tournamentService from '../services/tournamentService';
import authService from '../services/authService';
import TournamentModal from '../components/TournamentModal';
import DeleteConfirm from '../components/DeleteConfirm';
import TournamentQuestions from '../components/TournamentQuestions';
import ProfileModal from '../components/ProfileModal';
import logo from '../assets/Trivia Logo.png';
import './AdminDashboard.css';

/**
 * AdminDashboard - Main admin page for tournament management.
 */
function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();

  // ===== HELPER FUNCTIONS (defined first to avoid reference errors) =====

  function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  function getCategoryColor(category) {
    const colors = {
      'General Knowledge': '#3b82f6',
      'Entertainment: Books': '#8b5cf6',
      'Entertainment: Film': '#ec4899',
      'Entertainment: Music': '#f59e0b',
      'Science & Nature': '#10b981',
      'Science: Computers': '#06b6d4',
      'Science: Mathematics': '#6366f1',
      'Sports': '#ef4444',
      'Geography': '#14b8a6',
      'History': '#f97316',
      'Art': '#d946ef',
      'Animals': '#84cc16'
    };
    return colors[category] || '#3b82f6';
  }

  function getDifficultyColor(difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  }

  // ===== STATE =====

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tournamentsPerPage = 4;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);

  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  // ===== DATA FETCHING =====

  const fetchTournaments = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await tournamentService.getAllTournaments();
      if (data.success) {
        setTournaments(data.tournaments || []);
      }
    } catch (err) {
      console.error('Failed to fetch tournaments:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 15s for real-time like updates
  useEffect(() => {
    fetchTournaments();
    const interval = setInterval(() => fetchTournaments(true), 15000);
    return () => clearInterval(interval);
  }, [fetchTournaments]);

  // ===== HANDLERS =====

  const handleSignOut = async () => {
    try { await authService.logout(); } catch (err) { /* ignore */ }
    onLogout();
    navigate('/');
  };

  const filteredTournaments = tournaments.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term) ||
      t.creator.toLowerCase().includes(term) ||
      t.difficulty.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredTournaments.length / tournamentsPerPage);
  const startIndex = (currentPage - 1) * tournamentsPerPage;
  const paginatedTournaments = filteredTournaments.slice(
    startIndex,
    startIndex + tournamentsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEdit = (tournament) => {
    setSelectedTournament(tournament);
    setShowEditModal(true);
  };

  const handleViewQuestions = (tournament) => {
    setSelectedTournament(tournament);
    setShowQuestions(true);
  };

  const handleDeleteClick = (tournament) => {
    setSelectedTournament(tournament);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTournament) return;
    try {
      const result = await tournamentService.deleteTournament(selectedTournament.id);
      if (result.success) {
        setShowDeleteConfirm(false);
        setSelectedTournament(null);
        fetchTournaments();
      }
    } catch (err) {
      console.error('Failed to delete tournament:', err);
    }
  };

  const handleTournamentSaved = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedTournament(null);
    fetchTournaments();
  };

  const handleProfileUpdated = (updatedUser) => {
    setCurrentUser({ ...currentUser, ...updatedUser });
    const stored = JSON.parse(localStorage.getItem('quizUser') || '{}');
    localStorage.setItem('quizUser', JSON.stringify({ ...stored, ...updatedUser }));
  };

  // ===== RENDER =====

  return (
    <div className="admin-container">
      {/* NAV */}
      <nav className="admin-nav">
        <div className="admin-nav-left">
          <div className="admin-logo">
            <img src={logo} alt="Trivia Logo" className="admin-logo-icon" />
          </div>
        </div>
        <div className="admin-nav-right">
          <button className="btn-create-tournament" onClick={() => setShowCreateModal(true)}>
            <span className="btn-icon">+</span> Create Tournament
          </button>
          <button className="btn-signout" onClick={handleSignOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
          <div
            className="admin-avatar"
            onClick={() => setShowProfile(true)}
            style={{ cursor: 'pointer' }}
            title="Edit Profile"
          >
            {getInitials(currentUser.firstName + ' ' + currentUser.lastName)}
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="admin-content">
        <div className="admin-header">
          <div className="admin-header-left">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Central hub for tournament oversight and coordination</p>
          </div>
          <div className="admin-header-right">
            <div className="search-container">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="tournament-table-container">
          {loading ? (
            <div className="table-loading">Loading tournaments...</div>
          ) : (
            <>
              <div className="table-header-row">
                <div className="th-creator">CREATOR</div>
                <div className="th-name">TOURNAMENT NAME</div>
                <div className="th-category">CATEGORY</div>
                <div className="th-difficulty">DIFFICULTY</div>
                <div className="th-likes">LIKES</div>
                <div className="th-duration">DURATION</div>
                <div className="th-actions">ACTIONS</div>
              </div>

              {paginatedTournaments.length === 0 ? (
                <div className="table-empty">
                  {searchTerm
                    ? 'No tournaments match your search.'
                    : 'No tournaments yet. Create your first tournament!'}
                </div>
              ) : (
                paginatedTournaments.map((tournament) => (
                  <div key={tournament.id} className="table-row">
                    <div className="td-creator">
                      <div className="creator-avatar"
                        style={{ background: getCategoryColor(tournament.category) }}>
                        {getInitials(tournament.creator)}
                      </div>
                      <span className="creator-name">{tournament.creator}</span>
                    </div>
                    <div className="td-name">
                      <span className="tournament-name-link"
                        onClick={() => handleViewQuestions(tournament)}>
                        {tournament.name}
                      </span>
                    </div>
                    <div className="td-category">
                      <span className="category-tag"
                        style={{ background: getCategoryColor(tournament.category) }}>
                        {tournament.category.length > 18
                          ? tournament.category.substring(0, 18) + '...'
                          : tournament.category}
                      </span>
                    </div>
                    <div className="td-difficulty">
                      <span className="difficulty-tag"
                        style={{ background: getDifficultyColor(tournament.difficulty) }}>
                        {tournament.difficulty.charAt(0).toUpperCase() +
                          tournament.difficulty.slice(1)}
                      </span>
                    </div>
                    <div className="td-likes">
                      <span className="likes-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {tournament.likeCount || 0}
                      </span>
                    </div>
                    <div className="td-duration">
                      {formatDate(tournament.startDate)} — {formatDate(tournament.endDate)}
                    </div>
                    <div className="td-actions">
                      <button className="action-btn action-edit" title="Edit"
                        onClick={() => handleEdit(tournament)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="action-btn action-view" title="View Questions"
                        onClick={() => handleViewQuestions(tournament)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button className="action-btn action-delete" title="Delete"
                        onClick={() => handleDeleteClick(tournament)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}

              {filteredTournaments.length > 0 && (
                <div className="table-pagination">
                  <div className="pagination-info">
                    Showing {startIndex + 1} to{' '}
                    {Math.min(startIndex + tournamentsPerPage, filteredTournaments.length)} of{' '}
                    <span className="pagination-highlight">{filteredTournaments.length}</span>{' '}
                    tournaments
                  </div>
                  <div className="pagination-controls">
                    <button className="page-btn" disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}>&lt;</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i + 1}
                        className={`page-btn ${currentPage === i + 1 ? 'page-active' : ''}`}
                        onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                      </button>
                    ))}
                    <button className="page-btn" disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}>&gt;</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="admin-footer">
        <span>© 2026 Trivia Turf. All rights reserved.</span>
      </footer>

      {/* MODALS */}
      {showCreateModal && (
        <TournamentModal mode="create" onClose={() => setShowCreateModal(false)}
          onSaved={handleTournamentSaved} user={currentUser} />
      )}
      {showEditModal && selectedTournament && (
        <TournamentModal mode="edit" tournament={selectedTournament}
          onClose={() => { setShowEditModal(false); setSelectedTournament(null); }}
          onSaved={handleTournamentSaved} user={currentUser} />
      )}
      {showDeleteConfirm && selectedTournament && (
        <DeleteConfirm tournamentName={selectedTournament.name}
          onKeep={() => { setShowDeleteConfirm(false); setSelectedTournament(null); }}
          onDelete={handleDeleteConfirm} />
      )}
      {showQuestions && selectedTournament && (
        <TournamentQuestions tournamentId={selectedTournament.id}
          tournamentName={selectedTournament.name}
          onClose={() => { setShowQuestions(false); setSelectedTournament(null); }} />
      )}
      {showProfile && (
        <ProfileModal user={currentUser} onClose={() => setShowProfile(false)}
          onProfileUpdated={handleProfileUpdated} />
      )}
    </div>
  );
}

export default AdminDashboard;