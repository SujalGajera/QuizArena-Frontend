import axios from 'axios';

// Base URL for user endpoints
const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/users` : 'http://localhost:8080/api/users';

/**
 * User service - handles profile viewing, updating, and score retrieval.
 */
const userService = {

  // Get a user's profile by ID
  getUserProfile: async (userId) => {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  },

  // Update a user's profile
  updateProfile: async (userId, profileData) => {
    const response = await axios.put(`${API_URL}/${userId}`, profileData);
    return response.data;
  },

  // Get scores for a specific tournament (scoreboard)
  getTournamentScores: async (tournamentId) => {
    const response = await axios.get(`${API_URL}/scores/${tournamentId}`);
    return response.data;
  }
};

export default userService;