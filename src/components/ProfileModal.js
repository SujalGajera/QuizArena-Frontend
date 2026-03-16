import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import './ProfileModal.css';

/**
 * ProfileModal - Editable profile modal for both Admin and Player users.
 * Shows all required + optional attributes and allows updates.
 */
function ProfileModal({ user, onClose, onProfileUpdated }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load current user data into form
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDateOfBirth(user.dateOfBirth || '');
      setCity(user.city || '');
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await userService.updateProfile(user.id, {
        firstName, lastName, username, email, phone, dateOfBirth, city, profilePicture
      });
      if (result.success) {
        setSuccess('Profile updated successfully!');
        if (onProfileUpdated) onProfileUpdated(result.user);
        setTimeout(() => onClose(), 1200);
      } else {
        setError(result.message || 'Update failed');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Update failed');
      } else {
        setError('Unable to connect to server');
      }
    } finally { setLoading(false); }
  };

  const handleBackdropClick = (e) => {
    if (e.target.className === 'profile-backdrop') onClose();
  };

  return (
    <div className="profile-backdrop" onClick={handleBackdropClick}>
      <div className="profile-modal">
        <div className="profile-modal-header">
          <div>
            <h2 className="profile-modal-title">Edit Profile</h2>
            <p className="profile-modal-subtitle">Update your personal information</p>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="profile-success">{success}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">First Name *</label>
              <input type="text" className="modal-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
            </div>
            <div className="modal-field">
              <label className="modal-label">Last Name *</label>
              <input type="text" className="modal-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Username *</label>
              <input type="text" className="modal-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" />
            </div>
            <div className="modal-field">
              <label className="modal-label">Email *</label>
              <input type="email" className="modal-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Phone</label>
              <input type="text" className="modal-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="021 123 4567" />
            </div>
            <div className="modal-field">
              <label className="modal-label">Date of Birth</label>
              <input type="date" className="modal-input" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">City</label>
              <input type="text" className="modal-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Auckland" />
            </div>
            <div className="modal-field">
              <label className="modal-label">Profile Picture URL</label>
              <input type="text" className="modal-input" value={profilePicture} onChange={(e) => setProfilePicture(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="profile-role-badge">
            Role: <span className="role-tag">{user?.role}</span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-modal-save" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;