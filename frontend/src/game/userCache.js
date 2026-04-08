/**
 * userCache.js — Anonymous identity system via localStorage.
 *
 * On first visit, generates a UUID. The display name is set
 * via the PlayerNameModal component. On subsequent visits,
 * the returning user is auto-detected.
 */

const STORAGE_KEY = 'goodgame_user'

/**
 * Generate a UUID v4 (browser-compatible).
 */
function generateUUID() {
  if (crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get the stored user object, or create a new one (without a name).
 * @returns {{ uuid: string, displayName: string|null, createdAt: string }}
 */
export function getOrCreateUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const user = JSON.parse(stored)
      if (user && user.uuid) {
        return user
      }
    }
  } catch (e) {
    // corrupt or unavailable
  }

  // Create new user (no name yet)
  const user = {
    uuid: generateUUID(),
    displayName: null,
    createdAt: new Date().toISOString()
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch (e) {}
  return user
}

/**
 * Get the stored user ID (UUID).
 * @returns {string}
 */
export function getUserId() {
  return getOrCreateUser().uuid
}

/**
 * Get the stored display name, or 'Player' as fallback.
 * @returns {string}
 */
export function getUserName() {
  const user = getOrCreateUser()
  return user.displayName || 'Player'
}

/**
 * Set the display name and persist it.
 * @param {string} name
 */
export function setUserName(name) {
  const user = getOrCreateUser()
  user.displayName = name
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch (e) {}
}

/**
 * Check if the user is a returning visitor (has a name set).
 * @returns {boolean}
 */
export function isReturningUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const user = JSON.parse(stored)
      return !!(user && user.displayName)
    }
  } catch (e) {}
  return false
}

/**
 * Clear all user data from localStorage.
 * Used by admin cache clear feature.
 */
export function clearUserCache() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('goodgame_progress')
  } catch (e) {}
}
