import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import tournamentService from '../services/tournamentService';
import logo from '../assets/Trivia Logo.png';
import './LoginPage.css';

/**
 * LoginPage - Landing page with sign-in form.
 * Password toggle is inside the input field on the right side.
 */
function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ players: 0, tournaments: 0 });

  // Forgot password flow states
  const [viewMode, setViewMode] = useState('login'); // 'login', 'forgot', 'reset'
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

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
        setStats({ players: 0, tournaments: 0 });
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailOrUsername.trim()) { 
      setError('Username or email is required');
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
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Invalid credentials');
      } else {
        setError('Unable to connect to server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMessage('');
    if (!emailOrUsername.trim()) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const result = await authService.forgotPassword(emailOrUsername);
      if (result.success) {
        setForgotMessage('Password reset email sent. Please check your inbox.');
        setViewMode('reset');
      } else {
        setError(result.message || 'Forgot password failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMessage('');
    if (!resetToken.trim() || !newPassword.trim()) {
      setError('Please fill all fields');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const result = await authService.resetPassword(resetToken, newPassword);
      if (result.success) {
        setForgotMessage('Password successfully reset. You can now login.');
        setViewMode('login');
        setPassword('');
      } else {
        setError(result.message || 'Reset password failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT PANEL */}
      <div className="login-left">
        <div className="login-logo">
          <img src={logo} alt="Trivia Logo" className="logo-icon" style={{ height: '36px', width: 'auto' }} />
          <span className="logo-text">Trivia Turf</span>
        </div>

        <div className="login-hero">
          <h1 className="hero-heading">
            Trivia Turf.<br />Quiz Arena.
          </h1>
          <p className="hero-subtitle">
            Compete in global trivia tournaments and prove your expertise
            across multiple domains. Join the elite community of thinkers.
          </p>
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
          <div className="hero-badges">
            <span className="category-badge">
              <span className="badge-dot" style={{ background: '#3fb950' }}></span>Science
            </span>
            <span className="category-badge">
              <span className="badge-dot" style={{ background: '#2563eb' }}></span>History
            </span>
            <span className="category-badge">
              <span className="badge-dot" style={{ background: '#7c3aed' }}></span>Tech
            </span>
          </div>
        </div>

        <div className="login-footer-text">© 2026 Trivia Turf. Built for champions.</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-form-card">
          <h2 className="form-title">
            {viewMode === 'login' ? 'Welcome back' : viewMode === 'forgot' ? 'Reset Password' : 'New Password'}
          </h2>
          <p className="form-subtitle">
            {viewMode === 'login' ? 'Enter your credentials to access the arena' : viewMode === 'forgot' ? 'Enter your email to receive a reset token' : 'Enter your reset token and your new password'}
          </p>

          {error && <div className="form-error">{error}</div>}
          {forgotMessage && <div className="form-success" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{forgotMessage}</div>}

          {viewMode === 'login' && (
            <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <input
                type="text"
                className="form-input"
                placeholder="commander@arena.com"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Password</label>
                <span className="forgot-link" onClick={() => { setViewMode('forgot'); setError(''); setForgotMessage(''); }} style={{ cursor: 'pointer' }}>Forgot password?</span>
              </div>
              <div className="password-field-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45
                        18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5
                        18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* <div className="form-checkbox">
              <input
                type="checkbox"
                id="keepSignedIn"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
              />
              <label htmlFor="keepSignedIn">Keep me signed in</label>
            </div> */}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Enter the Arena  →'}
            </button>
          </form>
          )}

          {viewMode === 'forgot' && (
            <form onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="commander@arena.com"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ marginBottom: '15px' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => { setViewMode('login'); setError(''); setForgotMessage(''); }} style={{ width: '100%', padding: '12px', background: 'var(--bg-hover)', color: 'var(--text-primary)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', marginTop: '10px' }}>
                Back to Login
              </button>
            </form>
          )}

          {viewMode === 'reset' && (
            <form onSubmit={handleResetSubmit}>
              <div className="form-group">
                <label className="form-label">Reset Token</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Paste your token here"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ marginBottom: '15px' }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => { setViewMode('login'); setError(''); setForgotMessage(''); }} style={{ width: '100%', padding: '12px', background: 'var(--bg-hover)', color: 'var(--text-primary)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', marginTop: '10px' }}>
                Back to Login
              </button>
            </form>
          )}

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