import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import tournamentService from '../services/tournamentService';
import authService from '../services/authService';
import TournamentModal from '../components/TournamentModal';
import DeleteConfirm from '../components/DeleteConfirm';
import TournamentQuestions from '../components/TournamentQuestions';
import './AdminDashboard.css';

/**
 * AdminDashboard - Main admin page for tournament management.
 * Features:
 *   - Tournament table with Creator, Name, Category, Difficulty, Duration, Actions
 *   - Create Tournament button that opens a modal form
 *   - Edit, View Questions, Delete actions for each tournament
 *   - Search bar with filtering
 *   - Pagination for the table
 * Design matches the ARENA dark theme from the UI specs.
 */
function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();

  // Tournament data
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tournamentsPerPage = 4;

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);

  // Fetch all tournaments from the backend
  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tournamentService.getAllTournaments();
      if (data.success) {
        setTournaments(data.tournaments || []);
      }
    } catch (err) {
      console.error('Failed to fetch tournaments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tournaments on component mount
  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Logout even if API call fails
    }
    onLogout();
    navigate('/');
  };

  // Filter tournaments based on search term
  const filteredTournaments = tournaments.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term) ||
      t.creator.toLowerCase().includes(term) ||
      t.difficulty.toLowerCase().includes(term)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTournaments.length / tournamentsPerPage);
  const startIndex = (currentPage - 1) * tournamentsPerPage;
  const paginatedTournaments = filteredTournaments.slice(startIndex, startIndex + tournamentsPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Open edit modal with selected tournament data
  const handleEdit = (tournament) => {
    setSelectedTournament(tournament);
    setShowEditModal(true);
  };

  // Open view questions panel for selected tournament
  const handleViewQuestions = (tournament) => {
    setSelectedTournament(tournament);
    setShowQuestions(true);
  };

  // Open delete confirmation for selected tournament
  const handleDeleteClick = (tournament) => {
    setSelectedTournament(tournament);
    setShowDeleteConfirm(true);
  };

  // Confirm deletion - calls API and refreshes list
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

  // After creating or editing a tournament, refresh the list
  const handleTournamentSaved = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedTournament(null);
    fetchTournaments();
  };

  // Get initials from creator name for the avatar badge
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get a consistent color for category badges
  const getCategoryColor = (category) => {
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
  };

  // Get color for difficulty badge
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Format date as "Mon DD, YYYY"
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="admin-container">
      {/* ===== TOP NAVBAR ===== */}
      <nav className="admin-nav">
        <div className="admin-nav-left">
          <div className="admin-logo">
            <div className="admin-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#2563eb" />
                <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="admin-logo-text">ARENA</span>
          </div>
        </div>

        <div className="admin-nav-right">
          <button className="btn-create-tournament" onClick={() => setShowCreateModal(true)}>
            <span className="btn-icon">+</span>
            Create Tournament
          </button>
          <button className="btn-signout" onClick={handleSignOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
          <div className="admin-avatar">
            {getInitials(user.firstName + ' ' + user.lastName)}
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <div className="admin-content">
        {/* Dashboard header */}
        <div className="admin-header">
          <div className="admin-header-left">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Central hub for tournament oversight and coordination</p>
          </div>
          <div className="admin-header-right">
            <div className="search-container">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <button className="btn-filter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
              </svg>
            </button>
          </div>
        </div>

        {/* ===== TOURNAMENT TABLE ===== */}
        <div className="tournament-table-container">
          {loading ? (
            <div className="table-loading">Loading tournaments...</div>
          ) : (
            <>
              {/* Table header */}
              <div className="table-header-row">
                <div className="th-creator">CREATOR</div>
                <div className="th-name">TOURNAMENT NAME</div>
                <div className="th-category">CATEGORY</div>
                <div className="th-difficulty">DIFFICULTY</div>
                <div className="th-duration">DURATION</div>
                <div className="th-actions">ACTIONS</div>
              </div>

              {/* Table body */}
              {paginatedTournaments.length === 0 ? (
                <div className="table-empty">
                  {searchTerm ? 'No tournaments match your search.' : 'No tournaments yet. Create your first tournament!'}
                </div>
              ) : (
                paginatedTournaments.map((tournament) => (
                  <div key={tournament.id} className="table-row">
                    {/* Creator column */}
                    <div className="td-creator">
                      <div
                        className="creator-avatar"
                        style={{ background: getCategoryColor(tournament.category) }}
                      >
                        {getInitials(tournament.creator)}
                      </div>
                      <span className="creator-name">{tournament.creator}</span>
                    </div>

                    {/* Tournament name - clickable to view questions */}
                    <div className="td-name">
                      <span
                        className="tournament-name-link"
                        onClick={() => handleViewQuestions(tournament)}
                      >
                        {tournament.name}
                      </span>
                    </div>

                    {/* Category badge */}
                    <div className="td-category">
                      <span
                        className="category-tag"
                        style={{ background: getCategoryColor(tournament.category) }}
                      >
                        {tournament.category.length > 18
                          ? tournament.category.substring(0, 18) + '...'
                          : tournament.category}
                      </span>
                    </div>

                    {/* Difficulty badge */}
                    <div className="td-difficulty">
                      <span
                        className="difficulty-tag"
                        style={{ background: getDifficultyColor(tournament.difficulty) }}
                      >
                        {tournament.difficulty.charAt(0).toUpperCase() + tournament.difficulty.slice(1)}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="td-duration">
                      {formatDate(tournament.startDate)} — {formatDate(tournament.endDate)}
                    </div>

                    {/* Action buttons */}
                    <div className="td-actions">
                      <button
                        className="action-btn action-edit"
                        title="Edit Tournament"
                        onClick={() => handleEdit(tournament)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action-btn action-view"
                        title="View Questions"
                        onClick={() => handleViewQuestions(tournament)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        className="action-btn action-delete"
                        title="Delete Tournament"
                        onClick={() => handleDeleteClick(tournament)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Pagination */}
              {filteredTournaments.length > 0 && (
                <div className="table-pagination">
                  <div className="pagination-info">
                    Showing {startIndex + 1} to {Math.min(startIndex + tournamentsPerPage, filteredTournaments.length)} of{' '}
                    <span className="pagination-highlight">{filteredTournaments.length}</span> tournaments
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`page-btn ${currentPage === i + 1 ? 'page-active' : ''}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="admin-footer">
        <span>© 2024 ARENA Tournament Systems. All rights reserved.</span>
        <div className="footer-links">
          <span>Documentation</span>
          <span>API Access</span>
          <span>Support Portal</span>
        </div>
      </footer>

      {/* ===== MODALS ===== */}

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <TournamentModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSaved={handleTournamentSaved}
          user={user}
        />
      )}

      {/* Edit Tournament Modal */}
      {showEditModal && selectedTournament && (
        <TournamentModal
          mode="edit"
          tournament={selectedTournament}
          onClose={() => { setShowEditModal(false); setSelectedTournament(null); }}
          onSaved={handleTournamentSaved}
          user={user}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && selectedTournament && (
        <DeleteConfirm
          tournamentName={selectedTournament.name}
          onKeep={() => { setShowDeleteConfirm(false); setSelectedTournament(null); }}
          onDelete={handleDeleteConfirm}
        />
      )}

      {/* View Questions Panel */}
      {showQuestions && selectedTournament && (
        <TournamentQuestions
          tournamentId={selectedTournament.id}
          tournamentName={selectedTournament.name}
          onClose={() => { setShowQuestions(false); setSelectedTournament(null); }}
        />
      )}
    </div>
  );
}

export default AdminDashboard;