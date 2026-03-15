import React, { useState, useEffect } from 'react';
import tournamentService from '../services/tournamentService';
import './TournamentModal.css';

/**
 * TournamentModal - Modal form for creating or editing a tournament.
 * Used for both "Create Tournament" and "Edit Tournament" actions.
 * Fields: Creator, Tournament Name, Category, Difficulty, Dates, Min Passing Score.
 * Design matches the dark modal from the UI specs.
 */
function TournamentModal({ mode, tournament, onClose, onSaved, user }) {
  // Available categories from OpenTDB
  const categories = [
    'General Knowledge',
    'Entertainment: Books',
    'Entertainment: Film',
    'Entertainment: Music',
    'Science & Nature',
    'Science: Computers',
    'Science: Mathematics',
    'Sports',
    'Geography',
    'History',
    'Art',
    'Animals'
  ];

  // Difficulty options
  const difficulties = ['easy', 'medium', 'hard'];

  // Form state
  const [creator, setCreator] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPassingScore, setMinPassingScore] = useState(7);

  // Validation & UI
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Populate form fields if editing an existing tournament
  useEffect(() => {
    if (mode === 'edit' && tournament) {
      setCreator(tournament.creator || '');
      setName(tournament.name || '');
      setCategory(tournament.category || '');
      setDifficulty(tournament.difficulty || '');
      setStartDate(tournament.startDate || '');
      setEndDate(tournament.endDate || '');
      setMinPassingScore(tournament.minPassingScore || 7);
    } else {
      // Default creator to current admin user
      setCreator(user ? (user.firstName + ' ' + user.lastName) : '');
    }
  }, [mode, tournament, user]);

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    if (!creator.trim()) newErrors.creator = 'Creator is required';
    if (!name.trim()) newErrors.name = 'Tournament name is required';
    if (!category) newErrors.category = 'Category is required';
    if (!difficulty) newErrors.difficulty = 'Difficulty is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (minPassingScore < 0 || minPassingScore > 10) {
      newErrors.minPassingScore = 'Score must be between 0 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert min passing score from out-of-10 to percentage
      const passingPercentage = (minPassingScore / 10) * 100;

      const formData = {
        creator: creator.trim(),
        name: name.trim(),
        category,
        difficulty,
        startDate,
        endDate,
        minPassingScore: passingPercentage
      };

      let result;
      if (mode === 'edit') {
        // Only send updatable fields for edit
        result = await tournamentService.updateTournament(tournament.id, {
          name: formData.name,
          startDate: formData.startDate,
          endDate: formData.endDate
        });
      } else {
        result = await tournamentService.createTournament(formData);
      }

      if (result.success) {
        onSaved();
      } else {
        setServerError(result.message || 'Operation failed');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setServerError(err.response.data.message || 'Operation failed');
      } else {
        setServerError('Unable to connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking the backdrop
  const handleBackdropClick = (e) => {
    if (e.target.className === 'modal-backdrop') {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        {/* Modal header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {mode === 'edit' ? 'Edit Tournament' : 'Create Tournament'}
            </h2>
            <p className="modal-subtitle">
              {mode === 'edit' ? 'Update tournament details.' : 'Configure your new event parameters.'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Server error */}
        {serverError && <div className="modal-error">{serverError}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Row 1: Creator + Tournament Name */}
          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Creator</label>
              <div className="input-with-icon">
                <span className="input-icon-text">👤</span>
                <input
                  type="text"
                  className={`modal-input ${errors.creator ? 'modal-input-error' : ''}`}
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  placeholder="System Admin"
                  disabled={mode === 'edit'}
                />
              </div>
              {errors.creator && <span className="modal-field-error">{errors.creator}</span>}
            </div>
            <div className="modal-field">
              <label className="modal-label">Tournament Name</label>
              <input
                type="text"
                className={`modal-input ${errors.name ? 'modal-input-error' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Winter Clash 2024"
              />
              {errors.name && <span className="modal-field-error">{errors.name}</span>}
            </div>
          </div>

          {/* Row 2: Category + Difficulty */}
          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Category</label>
              <select
                className={`modal-select ${errors.category ? 'modal-input-error' : ''}`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={mode === 'edit'}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="modal-field-error">{errors.category}</span>}
            </div>
            <div className="modal-field">
              <label className="modal-label">Difficulty Level</label>
              <select
                className={`modal-select ${errors.difficulty ? 'modal-input-error' : ''}`}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={mode === 'edit'}
              >
                <option value="">Select difficulty</option>
                {difficulties.map((d) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
              {errors.difficulty && <span className="modal-field-error">{errors.difficulty}</span>}
            </div>
          </div>

          {/* Row 3: Tournament Dates + Min Passing Score */}
          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Tournament Dates</label>
              <div className="date-range">
                <input
                  type="date"
                  className={`modal-input date-input ${errors.startDate ? 'modal-input-error' : ''}`}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="date-separator">–</span>
                <input
                  type="date"
                  className={`modal-input date-input ${errors.endDate ? 'modal-input-error' : ''}`}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              {errors.startDate && <span className="modal-field-error">{errors.startDate}</span>}
              {errors.endDate && <span className="modal-field-error">{errors.endDate}</span>}
            </div>
            <div className="modal-field">
              <label className="modal-label">Min Passing Score (Out of 10 Questions)</label>
              <div className="input-with-icon">
                <span className="input-icon-text">📊</span>
                <input
                  type="number"
                  className={`modal-input ${errors.minPassingScore ? 'modal-input-error' : ''}`}
                  value={minPassingScore}
                  onChange={(e) => setMinPassingScore(parseInt(e.target.value) || 0)}
                  min="0"
                  max="10"
                  placeholder="7"
                />
              </div>
              {errors.minPassingScore && <span className="modal-field-error">{errors.minPassingScore}</span>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-modal-save" disabled={loading}>
              {loading
                ? (mode === 'edit' ? 'Saving...' : 'Creating...')
                : (mode === 'edit' ? 'Save Changes' : 'Save Tournament')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TournamentModal;