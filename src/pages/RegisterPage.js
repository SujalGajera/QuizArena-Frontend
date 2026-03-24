import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import logo from '../assets/Trivia Logo.png';
import './RegisterPage.css';

/**
 * RegisterPage - User registration with role selection.
 * Left panel: Visual branding with gradient effect.
 * Right panel: Registration form with validation.
 * "Creator" role maps to ADMIN, "Explorer" role maps to PLAYER.
 */
function RegisterPage({ onLogin }) {
  const navigate = useNavigate();

  // Form fields
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PLAYER'); // Default to Explorer (PLAYER)

  // Validation & UI state
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate all form fields - returns true if valid
  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Za-z0-9+_.-]+@(.+)$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Run validation first
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        username,
        firstName,
        lastName,
        email,
        password
      };

      // Call the appropriate registration endpoint based on selected role
      let result;
      if (role === 'ADMIN') {
        result = await authService.registerAdmin(userData);
      } else {
        result = await authService.register(userData);
      }

      if (result.success) {
        // Auto-login after successful registration
        onLogin(result.user);
      } else {
        setServerError(result.message || 'Registration failed');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setServerError(data.message || 'Registration failed');
        }
      } else {
        setServerError('Unable to connect to server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* ===== TOP NAVBAR ===== */}
      <nav className="register-nav">
        <div className="nav-logo" onClick={() => navigate('/')}>
          <img src={logo} alt="Trivia Logo" className="nav-logo-icon" style={{ height: '30px', width: 'auto' }} />
          <span>Trivia Turf</span>
        </div>
        <div className="nav-links">
          <span className="nav-link" onClick={() => navigate('/')}>Home</span>
          <button className="nav-signin-btn" onClick={() => navigate('/')}>Sign In</button>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <div className="register-content">
        {/* Left panel - Visual branding */}
        <div className="register-left">
          <div className="register-visual">
            {/* Abstract purple gradient visual */}
            <div className="visual-glow"></div>
            <div className="visual-shape"></div>
            <div className="visual-shape-2"></div>
          </div>
          <div className="register-left-text">
            <h2 className="register-heading">
              Dominate the<br />
              <span className="heading-purple">Leaderboard</span>
            </h2>
            <p className="register-subtitle">
              Join a community of curious minds. From pop culture to deep science,
              build your own challenges or explore thousands of community-made quizzes in our ever-evolving trivia universe.
            </p>
            <div className="feature-badges">
              <span className="feature-badge">
                Endless Knowledge
              </span>
              <span className="feature-badge">
                Compete with Friends
              </span>
            </div>
          </div>
        </div>

        {/* Right panel - Registration form */}
        <div className="register-right">
          <div className="register-form-card">
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">Fill in the details to register your new account</p>

            {/* Server error display */}
            {serverError && <div className="form-error">{serverError}</div>}

            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className={`form-input ${errors.username ? 'input-error' : ''}`}
                  placeholder="johndoe_99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && <span className="field-error">{errors.username}</span>}
              </div>

              {/* First Name + Last Name side by side */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className={`form-input ${errors.firstName ? 'input-error' : ''}`}
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className={`form-input ${errors.lastName ? 'input-error' : ''}`}
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                </div>
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <span className="field-error">● {errors.email}</span>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              {/* Role selector */}
              <div className="form-group">
                <label className="form-label">I am a...</label>
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-btn ${role === 'ADMIN' ? 'role-active' : ''}`}
                    onClick={() => setRole('ADMIN')}
                  >
                    Creator
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${role === 'PLAYER' ? 'role-active' : ''}`}
                    onClick={() => setRole('PLAYER')}
                  >
                    Explorer
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account  →'}
              </button>
            </form>

            {/* Terms text */}
            <p className="terms-text">
              By signing up, you agree to our <span className="link-purple">Terms of Service</span>
            </p>

            {/* Login link */}
            <p className="form-footer">
              Already have an account?{' '}
              <span className="link-purple" onClick={() => navigate('/')}>
                Sign In
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;