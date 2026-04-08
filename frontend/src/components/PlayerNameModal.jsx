import { useState } from 'react'
import { setUserName } from '../game/userCache'

/**
 * PlayerNameModal — First-time visitor modal to set a display name.
 * Appears on the Main Menu when no name is stored in localStorage.
 */
function PlayerNameModal({ onSubmit }) {
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length === 0) return
    setUserName(trimmed)
    onSubmit(trimmed)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel glass-panel">
        <h2 className="modal-title">👋 Welcome!</h2>
        <p className="modal-desc">Enter your name to get started</p>

        <form onSubmit={handleSubmit}>
          <input
            id="input-player-name"
            className="modal-input"
            type="text"
            placeholder="Your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <button
            id="btn-lets-go"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={name.trim().length === 0}
            style={{ width: '100%' }}
          >
            🚀 Let's Go
          </button>
        </form>
      </div>
    </div>
  )
}

export default PlayerNameModal
