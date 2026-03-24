import axios from 'axios';

// Base URL for authentication endpoints
const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/auth` : 'http://localhost:8080/api/auth';

/**
 * Auth service - handles login, registration, and logout API calls.
 */
const authService = {

  // Login with email/username and password
  login: async (usernameOrEmail, password) => {
    const response = await axios.post(`${API_URL}/login`, {
      usernameOrEmail,
      password
    });
    return response.data;
  },

  // Register a new player account
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },

  // Register a new admin account
  registerAdmin: async (userData) => {
    const response = await axios.post(`${API_URL}/register/admin`, userData);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await axios.post(`${API_URL}/reset-password`, { token, password });
    return response.data;
  },

  // Logout the current user
  logout: async () => {
    const response = await axios.post(`${API_URL}/logout`);
    return response.data;
  }
};

export default authService;