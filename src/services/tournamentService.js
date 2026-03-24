import axios from 'axios';

// Base URL for tournament endpoints
const API_URL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : 'http://localhost:8080/api';

/**
 * Tournament service - handles all admin tournament management API calls.
 */
const tournamentService = {

  // Create a new quiz tournament (admin only)
  createTournament: async (tournamentData) => {
    const response = await axios.post(`${API_URL}/admin/tournaments`, tournamentData);
    return response.data;
  },

  // Get all tournaments
  getAllTournaments: async () => {
    const response = await axios.get(`${API_URL}/admin/tournaments`);
    return response.data;
  },

  // Get a single tournament by ID
  getTournamentById: async (id) => {
    const response = await axios.get(`${API_URL}/admin/tournaments/${id}`);
    return response.data;
  },

  // Update a tournament
  updateTournament: async (id, data) => {
    const response = await axios.put(`${API_URL}/admin/tournaments/${id}`, data);
    return response.data;
  },

  // Delete a tournament
  deleteTournament: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/tournaments/${id}`);
    return response.data;
  },

  // Get questions for a tournament
  getTournamentQuestions: async (id) => {
    const response = await axios.get(`${API_URL}/admin/tournaments/${id}/questions`);
    return response.data;
  },

  // Get like count for a tournament
  getTournamentLikes: async (id) => {
    const response = await axios.get(`${API_URL}/admin/tournaments/${id}/likes`);
    return response.data;
  },

  // Get admin dashboard statistics
  getDashboardStats: async () => {
    const response = await axios.get(`${API_URL}/admin/dashboard`);
    return response.data;
  },

  // Search and filter tournaments
  searchTournaments: async (keyword, category, difficulty) => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    const response = await axios.get(`${API_URL}/admin/tournaments/search?${params.toString()}`);
    return response.data;
  },

  // Get available categories from OpenTDB
  getCategories: async () => {
    const response = await axios.get(`${API_URL}/admin/categories`);
    return response.data;
  }
};

export default tournamentService;