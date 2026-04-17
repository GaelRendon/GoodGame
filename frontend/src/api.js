import axios from 'axios'

/**
 * API client for the Good Game backend.
 * Base URL defaults to localhost:8000 for development.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

/**
 * Register or update a player in the backend.
 * @param {{ uuid: string, display_name: string }} data
 * @returns {Object|null} player record
 */
export async function registerPlayer(data) {
  try {
    const response = await api.post('/api/players', data)
    return response.data
  } catch (error) {
    console.error('Failed to register player:', error)
    return null
  }
}

/**
 * Check if a player exists in the database by UUID.
 * @param {string} uuid
 * @returns {Object|null} player record or null if not found
 */
export async function checkPlayerExists(uuid) {
  try {
    const response = await api.get(`/api/players/${uuid}`)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null // Player not found
    }
    console.error('Failed to check player:', error)
    throw error
  }
}

/**
 * Save enriched game session statistics to the backend.
 * @param {Object} data — enriched session data with checkpoint events
 * @returns {Object|null} saved session record
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
 * Save sentiment survey response to the backend.
 * @param {Object} data — { session_id, player_uuid, emoji_mood, color_mood, word, skipped }
 * @returns {Object|null} saved sentiment record
 */
export async function saveSentiment(data) {
  try {
    const response = await api.post('/api/sentiment', data)
    return response.data
  } catch (error) {
    console.error('Failed to save sentiment:', error)
    return null
  }
}

/**
 * Fetch the leaderboard (top scores per level).
 * @param {number} limit — max entries per level
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
