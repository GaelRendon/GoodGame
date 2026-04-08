import { useEffect, useRef } from 'react'
import { saveStats } from '../api'
import { getUserId, getUserName } from '../game/userCache'

/**
 * GameOverOverlay — Displays game results with stats and action buttons.
 * Shows "Next Level" or "🏆 Finish" button when the level is won.
 * Automatically saves enriched stats to the backend on mount (once).
 */
function GameOverOverlay({
  isWin, deaths, time, score, level,
  totalJumps, maxXReached, scoreResets, checkpointEvents,
  onRestart, onMenu, onNextLevel, isLastLevel,
  onSessionSaved
}) {
  const hasSaved = useRef(false)

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Save stats to backend on mount (once)
  useEffect(() => {
    if (hasSaved.current) return
    hasSaved.current = true

    const data = {
      player_uuid: getUserId(),
      level,
      deaths,
      time_seconds: parseFloat(time.toFixed(2)),
      score: Math.max(0, score),
      total_jumps: totalJumps || 0,
      max_x_reached: parseFloat((maxXReached || 0).toFixed(2)),
      score_resets: scoreResets || 0,
      completed: isWin,
      checkpoint_events: checkpointEvents || []
    }

    saveStats(data).then((result) => {
      if (result && onSessionSaved) {
        onSessionSaved(result.id)
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          {isWin && onNextLevel && (
            <button
              id="btn-next-level"
              className="btn btn-primary"
              onClick={onNextLevel}
            >
              {isLastLevel ? '🏆 Finish' : '➡️ Next Level'}
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
      </div>
    </div>
  )
}

export default GameOverOverlay
