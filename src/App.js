import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import PlayerDashboard from './pages/PlayerDashboard';
import PlayQuiz from './pages/PlayQuiz';
import QuizResult from './pages/QuizResult';
import ScoreboardPage from './pages/ScoreboardPage';

/**
 * Main App component - handles routing and user authentication state.
 * User data is stored in localStorage so it persists across page refreshes.
 */
function App() {
  // Load user from localStorage on initial render
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('quizUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('quizUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('quizUser');
    }
  }, [user]);

  // Called after successful login - stores user and triggers redirect
  const handleLogin = (userData) => {
    setUser(userData);
  };

  // Called when user clicks sign out
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('quizUser');
  };

  return (
    <Router>
      <Routes>
        {/* Login page - redirect to dashboard if already logged in */}
        <Route
          path="/"
          element={
            user ? (
              user.role === 'ADMIN' ? <Navigate to="/admin" /> : <Navigate to="/player" />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* Register page */}
        <Route
          path="/register"
          element={
            user ? (
              user.role === 'ADMIN' ? <Navigate to="/admin" /> : <Navigate to="/player" />
            ) : (
              <RegisterPage onLogin={handleLogin} />
            )
          }
        />

        {/* Admin dashboard - only accessible by ADMIN users */}
        <Route
          path="/admin"
          element={
            user && user.role === 'ADMIN' ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Player dashboard - only accessible by PLAYER users */}
        <Route
          path="/player"
          element={
            user && user.role === 'PLAYER' ? (
              <PlayerDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Play quiz page - only for players */}
        <Route
          path="/play/:tournamentId"
          element={
            user && user.role === 'PLAYER' ? (
              <PlayQuiz user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Quiz result page - only for players */}
        <Route
          path="/result/:tournamentId"
          element={
            user && user.role === 'PLAYER' ? (
              <QuizResult user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Scoreboard page - accessible by both roles */}
        <Route
          path="/scoreboard/:tournamentId"
          element={
            user ? (
              <ScoreboardPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;