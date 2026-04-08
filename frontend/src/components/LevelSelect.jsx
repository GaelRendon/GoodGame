import { useNavigate } from 'react-router-dom'
import { getUnlockedLevel } from '../game/levelProgress'

/**
 * LevelSelect — Grid of 7 levels with progressive unlock system.
 * Each level card shows its theme-based border color.
 */
const LEVELS = [
  { id: 1, name: 'Level 1', theme: 'blue' },
  { id: 2, name: 'Level 2', theme: 'blue' },
  { id: 3, name: 'Level 3', theme: 'green' },
  { id: 4, name: 'Level 4', theme: 'green' },
  { id: 5, name: 'Level 5', theme: 'red' },
  { id: 6, name: 'Level 6', theme: 'purple' },
  { id: 7, name: 'Level 7', theme: 'purple' },
]

const THEME_EMOJIS = {
  blue: '🌙',
  green: '🌲',
  red: '🔥',
  purple: '🔮',
}

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
              className={`level-card glass-panel theme-${level.theme} ${!isUnlocked ? 'locked' : ''}`}
              onClick={() => handleLevelClick(level.id)}
            >
              {isUnlocked ? (
                <>
                  <div className="level-emoji">{THEME_EMOJIS[level.theme]}</div>
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
