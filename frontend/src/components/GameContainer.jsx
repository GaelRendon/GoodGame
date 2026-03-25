import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Phaser from 'phaser'
import { createGameScene } from '../game/GameScene'
import { completeLevel, hasNextLevel } from '../game/levelProgress'
import GameOverOverlay from './GameOverOverlay'
import PauseOverlay from './PauseOverlay'

/**
 * GameContainer — Mounts the Phaser canvas inside React.
 * Manages Phaser lifecycle, pause state, and level progression.
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
    score: 0
  })

  const [isPaused, setIsPaused] = useState(false)

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
    // If win, mark level as completed to unlock the next one
    if (data.isWin) {
      const level = parseInt(levelId) || 1
      completeLevel(level)
    }
    setGameState({
      isGameOver: true,
      isWin: data.isWin,
      deaths: data.deaths,
      time: data.time,
      score: data.score
    })
  }, [levelId])

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
    const level = parseInt(levelId) || 1
    createGame(level)
    return () => destroyGame()
  }, [levelId, createGame, destroyGame])

  // Resume game
  const handleResume = () => {
    setIsPaused(false)
    if (gameRef.current) {
      gameRef.current.scene.scenes[0]?.scene.resume()
    }
  }

  // Restart the current level
  const handleRestart = () => {
    setGameState({ isGameOver: false, isWin: false, deaths: 0, time: 0, score: 0 })
    setIsPaused(false)
    destroyGame()
    setTimeout(() => {
      const level = parseInt(levelId) || 1
      createGame(level)
    }, 100)
  }

  // Go back to main menu
  const handleBackToMenu = () => {
    destroyGame()
    navigate('/')
  }

  // Load the next level automatically
  const handleNextLevel = () => {
    const currentLevel = parseInt(levelId) || 1
    const nextLevel = currentLevel + 1
    setGameState({ isGameOver: false, isWin: false, deaths: 0, time: 0, score: 0 })
    setIsPaused(false)
    destroyGame()
    // Navigate to the next level route (triggers re-mount)
    navigate(`/game/${nextLevel}`)
  }

  const currentLevel = parseInt(levelId) || 1

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

      {gameState.isGameOver && (
        <GameOverOverlay
          isWin={gameState.isWin}
          deaths={gameState.deaths}
          time={gameState.time}
          score={gameState.score}
          level={currentLevel}
          onRestart={handleRestart}
          onMenu={handleBackToMenu}
          onNextLevel={gameState.isWin && hasNextLevel(currentLevel) ? handleNextLevel : null}
        />
      )}
    </div>
  )
}

export default GameContainer
