import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Phaser from 'phaser'
import { createGameScene } from '../game/GameScene'
import { completeLevel, hasNextLevel, getMaxLevel } from '../game/levelProgress'
import GameOverOverlay from './GameOverOverlay'
import PauseOverlay from './PauseOverlay'
import SentimentSurvey from './SentimentSurvey'

/**
 * GameContainer — Mounts the Phaser canvas inside React.
 * Manages Phaser lifecycle, pause state, level progression,
 * sentiment survey flow, and last-level victory routing.
 */
function GameContainer() {
  const { levelId } = useParams()
  const navigate = useNavigate()
  const gameRef = useRef(null)
  const containerRef = useRef(null)

  const [gameState, setGameState] = useState({
    isGameOver: false,
    isWin: false,
    deaths: 0,
    time: 0,
    score: 0,
    totalJumps: 0,
    maxXReached: 0,
    scoreResets: 0,
    checkpointEvents: []
  })

  const [isPaused, setIsPaused] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [pendingAction, setPendingAction] = useState(null) // 'next' or 'victory'

  const currentLevel = parseInt(levelId) || 1
  const isLastLevel = currentLevel >= getMaxLevel()
  const isOddLevel = currentLevel % 2 === 1

  // Callback from Phaser scene on death
  const onDeath = useCallback((deaths) => {
    setGameState(prev => ({ ...prev, deaths }))
  }, [])

  // Callback from Phaser scene on time update
  const onTimeUpdate = useCallback((time) => {
    setGameState(prev => ({ ...prev, time }))
  }, [])

  // Callback from Phaser scene on game over (death or win)
  const onGameOver = useCallback((data) => {
    if (data.isWin) {
      completeLevel(currentLevel)
    }
    setGameState({
      isGameOver: true,
      isWin: data.isWin,
      deaths: data.deaths,
      time: data.time,
      score: data.score,
      totalJumps: data.totalJumps || 0,
      maxXReached: data.maxXReached || 0,
      scoreResets: data.scoreResets || 0,
      checkpointEvents: data.checkpointEvents || []
    })
  }, [currentLevel])

  // Callback from Phaser scene on pause (ESC key)
  const onPause = useCallback(() => {
    setIsPaused(true)
    if (gameRef.current) {
      gameRef.current.scene.scenes[0]?.scene.pause()
    }
  }, [])

  // Helper: create a new Phaser game instance
  const createGame = useCallback((level) => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 500,
      parent: containerRef.current,
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 800 },
          debug: false
        }
      },
      scene: createGameScene(level, { onDeath, onTimeUpdate, onGameOver, onPause })
    }
    gameRef.current = new Phaser.Game(config)
  }, [onDeath, onTimeUpdate, onGameOver, onPause])

  // Helper: destroy current game instance
  const destroyGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.destroy(true)
      gameRef.current = null
    }
  }, [])

  useEffect(() => {
    if (gameRef.current) return
    createGame(currentLevel)
    return () => destroyGame()
  }, [levelId, createGame, destroyGame, currentLevel])

  // Session saved callback — captures ID for survey linking
  const handleSessionSaved = (id) => {
    setSessionId(id)
  }

  // Resume game
  const handleResume = () => {
    setIsPaused(false)
    if (gameRef.current) {
      gameRef.current.scene.scenes[0]?.scene.resume()
    }
  }

  // Restart the current level
  const handleRestart = () => {
    setGameState({
      isGameOver: false, isWin: false, deaths: 0, time: 0, score: 0,
      totalJumps: 0, maxXReached: 0, scoreResets: 0, checkpointEvents: []
    })
    setIsPaused(false)
    setShowSurvey(false)
    setSessionId(null)
    setPendingAction(null)
    destroyGame()
    setTimeout(() => createGame(currentLevel), 100)
  }

  // Go back to main menu
  const handleBackToMenu = () => {
    destroyGame()
    navigate('/')
  }

  // "Next Level" / "Finish" button from GameOverOverlay
  const handleNextLevel = () => {
    // Determine what happens after clicking Next/Finish
    if (isOddLevel) {
      // Odd level → show survey first
      if (isLastLevel) {
        setPendingAction('victory')
      } else {
        setPendingAction('next')
      }
      setShowSurvey(true)
    } else {
      // Even level → go directly
      if (isLastLevel) {
        navigate('/victory')
      } else {
        proceedToNextLevel()
      }
    }
  }

  // After survey completes
  const handleSurveyComplete = () => {
    setShowSurvey(false)
    if (pendingAction === 'victory') {
      destroyGame()
      navigate('/victory')
    } else {
      proceedToNextLevel()
    }
  }

  // Navigate to the next level
  const proceedToNextLevel = () => {
    const nextLevel = currentLevel + 1
    setGameState({
      isGameOver: false, isWin: false, deaths: 0, time: 0, score: 0,
      totalJumps: 0, maxXReached: 0, scoreResets: 0, checkpointEvents: []
    })
    setIsPaused(false)
    setShowSurvey(false)
    setSessionId(null)
    setPendingAction(null)
    destroyGame()
    navigate(`/game/${nextLevel}`)
  }

  return (
    <div className="game-wrapper">
      <div ref={containerRef} className="game-canvas-container" id="phaser-game" />

      {isPaused && (
        <PauseOverlay
          onResume={handleResume}
          onRestart={handleRestart}
          onMenu={handleBackToMenu}
        />
      )}

      {gameState.isGameOver && !showSurvey && (
        <GameOverOverlay
          isWin={gameState.isWin}
          deaths={gameState.deaths}
          time={gameState.time}
          score={gameState.score}
          level={currentLevel}
          totalJumps={gameState.totalJumps}
          maxXReached={gameState.maxXReached}
          scoreResets={gameState.scoreResets}
          checkpointEvents={gameState.checkpointEvents}
          onRestart={handleRestart}
          onMenu={handleBackToMenu}
          onNextLevel={gameState.isWin ? handleNextLevel : null}
          isLastLevel={isLastLevel}
          onSessionSaved={handleSessionSaved}
        />
      )}

      {showSurvey && (
        <SentimentSurvey
          level={currentLevel}
          sessionId={sessionId}
          onComplete={handleSurveyComplete}
        />
      )}
    </div>
  )
}

export default GameContainer
