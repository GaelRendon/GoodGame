import { useNavigate } from 'react-router-dom'
import { getUnlockedLevel } from '../game/levelProgress'

/**
 * LevelSelect — Grid of 3 levels with progressive unlock system.
 * Locked levels are grayed out and not clickable.
 */
const LEVELS = [
  { id: 1, name: 'The Innocent Path', emoji: '🌱' },
  { id: 2, name: 'Deceptive Forest', emoji: '🌲' },
  { id: 3, name: 'Chaos Castle', emoji: '🏰' }
]

function LevelSelect() {
  const navigate = useNavigate()
  const unlockedLevel = getUnlockedLevel()

  const handleLevelClick = (levelId) => {
    if (levelId <= unlockedLevel) {
      navigate(`/game/${levelId}`)
    }
  }

  return (
    <div className="level-select-screen">
      <h2>Select Level</h2>

      <div className="level-grid">
        {LEVELS.map((level) => {
          const isUnlocked = level.id <= unlockedLevel
          return (
            <div
              key={level.id}
              className={`level-card glass-panel ${!isUnlocked ? 'locked' : ''}`}
              onClick={() => handleLevelClick(level.id)}
            >
              {isUnlocked ? (
                <>
                  <div className="level-number">{level.emoji}</div>
                  <div className="level-number">{level.id}</div>
                  <div className="level-name">{level.name}</div>
                </>
              ) : (
                <>
                  <div className="level-lock">🔒</div>
                  <div className="level-number">{level.id}</div>
                  <div className="level-name">Locked</div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <button
        id="btn-back-from-levels"
        className="btn btn-secondary"
        onClick={() => navigate('/')}
      >
        ← Back to Menu
      </button>
    </div>
  )
}

export default LevelSelect
