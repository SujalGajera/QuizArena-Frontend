import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import tournamentService from '../services/tournamentService';
import './LoginPage.css';

/**
 * LoginPage - Landing page with sign-in form.
 * Left panel: Hero content with branding, stats, and category badges.
 * Right panel: Login form with email and password fields.
 * Design: Dark theme with purple accents matching Knowledge Arena style.
 */
function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  // Form fields
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Stats for the left panel (fetched from backend)
  const [stats, setStats] = useState({ players: 0, tournaments: 0 });

  // Try to fetch live stats from the backend on page load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await tournamentService.getDashboardStats();
        if (data.success) {
          setStats({
            players: data.totalPlayers || 0,
            tournaments: data.totalTournaments || 0
          });
        }
      } catch (err) {
        // Backend might not be running yet - show zeros
        setStats({ players: 0, tournaments: 0 });
      }
    };
    fetchStats();
  }, []);

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic front-end validation
    if (!emailOrUsername.trim()) {
      setError('Email or username is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(emailOrUsername, password);
      if (result.success) {
        onLogin(result.user);
        // Navigation handled by App.js redirect
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      // Handle error response from backend
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Invalid credentials');
      } else {
        setError('Unable to connect to server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* ===== LEFT PANEL - Hero Section ===== */}
      <div className="login-left">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="#7c3aed" />
              <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="logo-text">Knowledge Arena</span>
        </div>

        {/* Hero heading */}
        <div className="login-hero">
          <h1 className="hero-heading">
           Trivia Turf.<br />
            Quiz Arena.
          </h1>
          <p className="hero-subtitle">
            Compete in global trivia tournaments and prove
            your expertise across multiple domains. Join the
            elite community of thinkers.
          </p>

          {/* Stats boxes */}
          <div className="hero-stats">
            <div className="stat-box">
              <span className="stat-label">Players Online</span>
              <span className="stat-value">{stats.players.toLocaleString()}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Tournaments Today</span>
              <span className="stat-value">{stats.tournaments}</span>
            </div>
          </div>

          {/* Category badges */}
          <div className="hero-badges">
            <span className="category-badge">
              <span className="badge-dot" style={{ background: '#3fb950' }}></span>
              Science
            </span>
            <span className="category-badge">
              <span className="badge-dot" style={{ background: '#2563eb' }}></span>
              History
            </span>
            <span className="category-badge">
              <span className="badge-dot" style={{ background: '#7c3aed' }}></span>
              Tech
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer-text">
          © 2026 Trivia Turf. Built for champions.
        </div>
      </div>

      {/* ===== RIGHT PANEL - Login Form ===== */}
      <div className="login-right">
        <div className="login-form-card">
          <h2 className="form-title">Welcome back</h2>
          <p className="form-subtitle">Enter your credentials to access the arena</p>

          {/* Error message display */}
          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Email / Username field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="commander@arena.com"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
            </div>

            {/* Password field */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Password</label>
                <span className="forgot-link">Forgot password?</span>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Keep me signed in checkbox */}
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="keepSignedIn"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
              />
              <label htmlFor="keepSignedIn">Keep me signed in</label>
            </div>

            {/* Submit button */}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Enter the Arena  →'}
            </button>
          </form>

          {/* Register link */}
          <p className="form-footer">
            New to the arena?{' '}
            <span className="link-purple" onClick={() => navigate('/register')}>
              Create an account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;