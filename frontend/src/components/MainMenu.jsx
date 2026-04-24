import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrCreateUser, clearUserCache } from '../game/userCache'
import { checkPlayerExists, registerPlayer } from '../api'
import PlayerNameModal from './PlayerNameModal'

/**
 * MainMenu — Start screen with animated title and navigation buttons.
 * Options: Start Game, Levels, Instructions, Clear Data
 * Handles user identity: checks localStorage + DB validation.
 * Welcome banner shows as auto-dismissing toast notification.
 */
function MainMenu() {
  const navigate = useNavigate()
  const [showNameModal, setShowNameModal] = useState(false)
  const [welcomeName, setWelcomeName] = useState(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showClearMsg, setShowClearMsg] = useState(false)
  const [checkedOnce, setCheckedOnce] = useState(false)

  useEffect(() => {
    // Only check once per mount
    if (checkedOnce) return
    setCheckedOnce(true)

    async function checkUser() {
      const user = getOrCreateUser()

      if (user.displayName) {
        // User has a local name — validate against DB
        try {
          const dbPlayer = await checkPlayerExists(user.uuid)
          if (dbPlayer) {
            // DB has this user — show welcome toast
            setWelcomeName(dbPlayer.display_name)
            setShowWelcome(true)
            setLoading(false)
            // Auto-dismiss after 3 seconds
            setTimeout(() => setShowWelcome(false), 3000)
            return
          }
        } catch (e) {
          // Backend unreachable — trust local cache
          setWelcomeName(user.displayName)
          setShowWelcome(true)
          setLoading(false)
          setTimeout(() => setShowWelcome(false), 3000)
          return
        }

        // DB doesn't have this user — clear local and ask for name
        clearUserCache()
        setShowNameModal(true)
        setLoading(false)
      } else {
        // No local name — show name modal
        setShowNameModal(true)
        setLoading(false)
      }
    }

    checkUser()
  }, [checkedOnce])

  const handleNameSubmit = async (name) => {
    setShowNameModal(false)
    setWelcomeName(name)

    // Register in DB
    const user = getOrCreateUser()
    await registerPlayer({ uuid: user.uuid, display_name: name })
  }

  const handleClearData = () => {
    const confirmed = window.confirm(
      '🗑️ Clear all player data?\n\nThis will remove your name, level progress, and start fresh. This cannot be undone.'
    )
    if (confirmed) {
      clearUserCache()
      setShowClearMsg(true)
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  if (loading) {
    return (
      <div className="menu-screen">
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="menu-screen">
      {showNameModal && (
        <PlayerNameModal onSubmit={handleNameSubmit} />
      )}

      {/* Welcome toast — auto-dismisses */}
      {showWelcome && welcomeName && !showNameModal && (
        <div className="welcome-toast">
          Welcome back, {welcomeName}! 🎮
        </div>
      )}

      <h1 className="menu-title">GOOD<br />GAME</h1>
      <p className="menu-subtitle">Trust nothing</p>

      <div className="menu-buttons">
        <button
          id="btn-start-game"
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/game/1')}
        >
          🎮 Start Game
        </button>

        <button
          id="btn-levels"
          className="btn btn-secondary btn-lg"
          onClick={() => navigate('/levels')}
        >
          📋 Levels
        </button>

        <button
          id="btn-instructions"
          className="btn btn-secondary btn-lg"
          onClick={() => navigate('/instructions')}
        >
          📖 Instructions
        </button>

        {/* <button
          id="btn-clear-data"
          className="btn btn-secondary btn-sm clear-data-btn"
          onClick={handleClearData}
        >
          🗑️ Clear Data
        </button> */}
      </div>

      <p className="menu-footer">
        v2.0 — A game where everything is out to get you
      </p>

      {showClearMsg && (
        <p className="clear-msg">🗑️ Data cleared! Reloading...</p>
      )}
    </div>
  )
}

export default MainMenu
