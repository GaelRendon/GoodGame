import { useNavigate } from 'react-router-dom'

/**
 * VictoryScreen — Shown after completing Level 7 and the final survey.
 * Full celebratory page with no stats — just the win message.
 */
function VictoryScreen() {
  const navigate = useNavigate()

  return (
    <div className="victory-screen">
      <div className="victory-content">
        <div className="victory-trophy">🏆</div>
        <h1 className="victory-title">YOU WIN!</h1>
        <p className="victory-subtitle">
          You conquered every level and survived every trap.
        </p>
        <p className="victory-subtitle victory-glow">
          Nothing could stop you!
        </p>

        <div className="victory-buttons">
          <button
            id="btn-play-again"
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/game/1')}
          >
            🔄 Play Again
          </button>

          <button
            id="btn-victory-menu"
            className="btn btn-secondary btn-lg"
            onClick={() => navigate('/')}
          >
            🏠 Back to Menu
          </button>
        </div>
      </div>

      {/* Floating particles animation */}
      <div className="victory-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="victory-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default VictoryScreen
