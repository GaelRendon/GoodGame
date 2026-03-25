import axios from 'axios'

/**
 * API client for the backend server.
 * Base URL defaults to localhost:8000 for development.
 */
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

/**
 * Save game session statistics to the backend.
 * @param {Object} data - { player_name, level, deaths, time_seconds, score }
 */
export async function saveStats(data) {
  try {
    const response = await api.post('/api/stats', data)
    return response.data
  } catch (error) {
    console.error('Failed to save stats:', error)
    return null
  }
}

/**
 * Fetch the leaderboard (top scores per level).
 * @param {number} limit - max entries per level
 */
export async function getLeaderboard(limit = 10) {
  try {
    const response = await api.get(`/api/stats/leaderboard?limit=${limit}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return []
  }
}

export default api
