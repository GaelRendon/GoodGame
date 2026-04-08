import { useState } from 'react'
import { saveSentiment } from '../api'
import { getUserId } from '../game/userCache'

/**
 * SentimentSurvey — Step-by-step survey shown between levels.
 *
 * 3 sequential steps:
 *  1. Emoji mood (REQUIRED — must pick to proceed)
 *  2. Color mood (REQUIRED — must pick to proceed)
 *  3. One-word description (OPTIONAL — can skip or submit empty)
 *
 * Fires after level completion on odd-numbered levels (1, 3, 5, 7).
 *
 * When the word input is focused, WASD/arrow keys work as normal
 * text input (Phaser game is destroyed before this overlay appears).
 */

const EMOJIS = [
  { value: 1, emoji: '😡', label: 'Angry' },
  { value: 2, emoji: '😟', label: 'Frustrated' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Happy' },
  { value: 5, emoji: '😄', label: 'Delighted' },
]

const COLOR_SWATCHES = [
  { value: 'red', hex: '#e53935', label: 'Red' },
  { value: 'orange', hex: '#fb8c00', label: 'Orange' },
  { value: 'yellow', hex: '#fdd835', label: 'Yellow' },
  { value: 'green', hex: '#43a047', label: 'Green' },
  { value: 'blue', hex: '#1e88e5', label: 'Blue' },
]

function SentimentSurvey({ level, sessionId, onComplete }) {
  const [step, setStep] = useState(1)
  const [emojiMood, setEmojiMood] = useState(null)
  const [colorMood, setColorMood] = useState(null)
  const [word, setWord] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const doSubmit = async (skipped = false) => {
    if (submitting) return
    setSubmitting(true)

    // Guard: if sessionId is null (stats save failed), skip API call gracefully
    if (sessionId == null) {
      console.warn('SentimentSurvey: sessionId is null, skipping save')
      onComplete()
      return
    }

    await saveSentiment({
      session_id: sessionId,
      player_uuid: getUserId(),
      emoji_mood: skipped ? 0 : (emojiMood || 3),
      color_mood: skipped ? '' : (colorMood || 'blue'),
      word: skipped ? null : (word.trim() || null),
      skipped,
    })

    onComplete()
  }

  /**
   * Prevent game keys from being captured while typing.
   * Stop propagation so no parent listener intercepts WASD/arrows.
   */
  const handleKeyDown = (e) => {
    e.stopPropagation()
  }

  return (
    <div className="modal-overlay">
      <div className="sentiment-panel glass-panel">
        <h2 className="sentiment-title">How are you feeling?</h2>
        <p className="sentiment-subtitle">Quick check-in after Level {level}</p>

        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line" />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="step-line" />
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {/* Step 1: Emoji mood (REQUIRED) */}
        {step === 1 && (
          <div className="sentiment-step" key="step1">
            <p className="sentiment-label">Pick your mood</p>
            <div className="emoji-row">
              {EMOJIS.map((e) => (
                <button
                  key={e.value}
                  className={`emoji-btn ${emojiMood === e.value ? 'selected' : ''}`}
                  onClick={() => setEmojiMood(e.value)}
                  title={e.label}
                >
                  {e.emoji}
                </button>
              ))}
            </div>
            <div className="sentiment-buttons">
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
                disabled={emojiMood === null}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Color mood (REQUIRED) */}
        {step === 2 && (
          <div className="sentiment-step" key="step2">
            <p className="sentiment-label">Pick a color that matches your mood</p>
            <div className="color-row">
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c.value}
                  className={`color-swatch ${colorMood === c.value ? 'selected' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setColorMood(c.value)}
                  title={c.label}
                />
              ))}
            </div>
            <div className="sentiment-buttons">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep(3)}
                disabled={colorMood === null}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: One-word (OPTIONAL — can skip) */}
        {step === 3 && (
          <div className="sentiment-step" key="step3">
            <p className="sentiment-label">Describe this run in one word <span className="optional-tag">(optional)</span></p>
            <input
              className="sentiment-input"
              type="text"
              placeholder="e.g. intense, fun, painful..."
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={30}
              autoFocus
            />
            <div className="sentiment-buttons">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setStep(2)}
              >
                ← Back
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => doSubmit(false)}
                disabled={submitting}
              >
                Skip →
              </button>
              <button
                id="btn-sentiment-submit"
                className="btn btn-primary"
                onClick={() => doSubmit(false)}
                disabled={submitting}
              >
                ✅ Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SentimentSurvey
