import { useNavigate } from 'react-router-dom'

/**
 * MainMenu — Start screen with animated title and navigation buttons.
 * Options: Start Game, Instructions, Levels, Exit
 */
function MainMenu() {
  const navigate = useNavigate()

  return (
    <div className="menu-screen">
      <h1 className="menu-title">TRAP<br />RUNNER</h1>
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

        <button
          id="btn-exit"
          className="btn btn-danger btn-lg"
          onClick={() => window.close()}
        >
          🚪 Exit
        </button>
      </div>

      <p className="menu-footer">v1.0 — A game where everything is out to get you</p>
    </div>
  )
}

export default MainMenu
