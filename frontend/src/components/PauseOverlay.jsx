/**
 * PauseOverlay — Shown when the player presses ESC during gameplay.
 * Options: Resume, Restart, Back to Menu
 */
function PauseOverlay({ onResume, onRestart, onMenu }) {
  return (
    <div className="pause-overlay">
      <div className="pause-panel glass-panel">
        <h2>⏸️ PAUSED</h2>

        <div className="pause-buttons">
          <button
            id="btn-resume"
            className="btn btn-primary btn-lg"
            onClick={onResume}
          >
            ▶️ Resume
          </button>

          <button
            id="btn-pause-restart"
            className="btn btn-secondary btn-lg"
            onClick={onRestart}
          >
            🔄 Restart Level
          </button>

          <button
            id="btn-pause-menu"
            className="btn btn-danger btn-lg"
            onClick={onMenu}
          >
            🏠 Back to Menu
          </button>
        </div>
      </div>
    </div>
  )
}

export default PauseOverlay
