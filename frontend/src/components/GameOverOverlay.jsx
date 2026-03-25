import { useEffect, useState } from 'react'
import { saveStats } from '../api'

/**
 * GameOverOverlay — Displays game results with stats and action buttons.
 * Shows "Next Level" button when the level is won and a next level exists.
 * Automatically saves stats to the backend on mount.
 */
function GameOverOverlay({ isWin, deaths, time, score, level, onRestart, onMenu, onNextLevel }) {
  const [saved, setSaved] = useState(false)

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Save stats to backend on mount
  useEffect(() => {
    const data = {
      player_name: 'Player',
      level,
      deaths,
      time_seconds: Math.round(time),
      score: Math.max(0, score)
    }
    saveStats(data).then((result) => {
      if (result) setSaved(true)
    })
  }, [deaths, time, score, level])

  return (
    <div className="game-over-overlay">
      <div className="game-over-panel glass-panel">
        <h2>{isWin ? '🎉 LEVEL CLEAR!' : '💀 GAME OVER'}</h2>
        <p className="result-label">
          {isWin ? 'You survived the madness!' : 'The traps got you...'}
        </p>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon">💀</div>
            <div className="stat-value">{deaths}</div>
            <div className="stat-label">Deaths</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{formatTime(time)}</div>
            <div className="stat-label">Time</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{Math.max(0, score)}</div>
            <div className="stat-label">Score</div>
          </div>
        </div>

        <div className="game-over-buttons">
          {/* Next Level button — only shown on win with a next level available */}
          {isWin && onNextLevel && (
            <button
              id="btn-next-level"
              className="btn btn-primary"
              onClick={onNextLevel}
            >
              ➡️ Next Level
            </button>
          )}

          <button
            id="btn-restart"
            className={`btn ${isWin && onNextLevel ? 'btn-secondary' : 'btn-primary'}`}
            onClick={onRestart}
          >
            🔄 Try Again
          </button>

          <button
            id="btn-back-to-menu"
            className="btn btn-secondary"
            onClick={onMenu}
          >
            🏠 Menu
          </button>
        </div>

        {saved && (
          <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#00e676' }}>
            ✓ Stats saved to server
          </p>
        )}
      </div>
    </div>
  )
}

export default GameOverOverlay
