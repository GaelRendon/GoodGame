/**
 * levelProgress.js — Manages level unlock state via localStorage.
 *
 * Level 1 is always unlocked. Subsequent levels unlock
 * only when the previous level is completed.
 */

const STORAGE_KEY = 'traprunner_progress'
const MAX_LEVEL = 3

/**
 * Get the highest unlocked level (1-based).
 * @returns {number}
 */
export function getUnlockedLevel() {
  try {
    const val = localStorage.getItem(STORAGE_KEY)
    const parsed = parseInt(val)
    if (!isNaN(parsed) && parsed >= 1) {
      return Math.min(parsed, MAX_LEVEL)
    }
  } catch (e) {
    // localStorage not available
  }
  return 1
}

/**
 * Check if a specific level is unlocked.
 * @param {number} levelId
 * @returns {boolean}
 */
export function isLevelUnlocked(levelId) {
  return levelId <= getUnlockedLevel()
}

/**
 * Mark a level as completed, unlocking the next one.
 * @param {number} completedLevel
 */
export function completeLevel(completedLevel) {
  const current = getUnlockedLevel()
  const next = completedLevel + 1
  if (next > current && next <= MAX_LEVEL) {
    try {
      localStorage.setItem(STORAGE_KEY, next.toString())
    } catch (e) {
      // localStorage not available
    }
  }
  // If completing the last level, ensure it's marked
  if (completedLevel >= MAX_LEVEL && current < MAX_LEVEL) {
    try {
      localStorage.setItem(STORAGE_KEY, MAX_LEVEL.toString())
    } catch (e) {}
  }
}

/**
 * Check if there is a next level available.
 * @param {number} currentLevel
 * @returns {boolean}
 */
export function hasNextLevel(currentLevel) {
  return currentLevel < MAX_LEVEL
}

/**
 * Reset all progress (for debugging / testing).
 */
export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {}
}
