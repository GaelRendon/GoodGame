import { useNavigate } from 'react-router-dom'

/**
 * Instructions — Controls guide and gameplay tips.
 */
function Instructions() {
  const navigate = useNavigate()

  return (
    <div className="instructions-screen">
      <div className="instructions-panel glass-panel">
        <h2>How to Play</h2>

        <h3>🎮 Controls</h3>
        <ul>
          <li><span className="key-badge">←</span> <span className="key-badge">→</span> or <span className="key-badge">A</span> <span className="key-badge">D</span> — Move left / right</li>
          <li><span className="key-badge">↑</span> or <span className="key-badge">W</span> or <span className="key-badge">SPACE</span> — Jump</li>
        </ul>

        <h3>⚠️ Gameplay</h3>
        <ul>
          <li>Reach the goal flag at the end of each level</li>
          <li>Everything looks normal... but nothing is what it seems</li>
          <li>Platforms may disappear, blocks may fall, spikes may appear</li>
          <li>Memorize the traps and try again!</li>
        </ul>

        <h3>📊 Scoring</h3>
        <ul>
          <li>Base score for completing a level: 1000 points</li>
          <li>Each death: -50 points</li>
          <li>Time bonus: faster completion = more points</li>
        </ul>

        <button
          id="btn-back-from-instructions"
          className="btn btn-secondary"
          onClick={() => navigate('/')}
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  )
}

export default Instructions
