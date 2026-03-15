import axios from 'axios';

// Base URL for player endpoints
const API_URL = 'http://localhost:8080/api/player';

/**
 * Player service - handles quiz participation, scores, likes, and leaderboard.
 */
const playerService = {

  // Get tournaments categorized by status (ongoing, upcoming, past, participated)
  getTournamentsByStatus: async (playerId) => {
    const response = await axios.get(`${API_URL}/tournaments?playerId=${playerId}`);
    return response.data;
  },

  // Start a quiz - returns questions with shuffled answers
  startQuiz: async (tournamentId, playerId) => {
    const response = await axios.post(`${API_URL}/tournaments/${tournamentId}/start?playerId=${playerId}`);
    return response.data;
  },

  // Submit answers and get score
  submitAnswers: async (tournamentId, playerId, answers) => {
    const response = await axios.post(
      `${API_URL}/tournaments/${tournamentId}/submit?playerId=${playerId}`,
      { answers }
    );
    return response.data;
  },

  // Get player's score for a specific tournament
  getPlayerScore: async (tournamentId, playerId) => {
    const response = await axios.get(`${API_URL}/tournaments/${tournamentId}/score?playerId=${playerId}`);
    return response.data;
  },

  // Toggle like/unlike on a tournament
  toggleLike: async (tournamentId, playerId) => {
    const response = await axios.post(`${API_URL}/tournaments/${tournamentId}/like?playerId=${playerId}`);
    return response.data;
  },

  // Get player's quiz history
  getHistory: async (playerId) => {
    const response = await axios.get(`${API_URL}/history?playerId=${playerId}`);
    return response.data;
  },

  // Get the global leaderboard
  getLeaderboard: async () => {
    const response = await axios.get(`${API_URL}/leaderboard`);
    return response.data;
  }
};

export default playerService;