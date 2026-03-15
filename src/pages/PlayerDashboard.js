import React from 'react';

function PlayerDashboard({ user, onLogout }) {
  return (
    <div style={{ padding: '40px', color: '#f0f6fc', background: '#0a0e17', minHeight: '100vh' }}>
      <h1>Player Dashboard</h1>
      <p>Welcome, {user.firstName}! This page will be built in the next batch.</p>
      <button onClick={onLogout} style={{ padding: '10px 20px', marginTop: '20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
        Sign Out
      </button>
    </div>
  );
}

export default PlayerDashboard;