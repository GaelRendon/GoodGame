/**
 * GameScene.js — Main Phaser game scene for Good Game.
 *
 * Handles: player movement, level building, trap activation,
 * death/respawn, HUD (deaths, timer, score), camera, win condition,
 * enriched data tracking (jumps, checkpoints, score resets).
 *
 * This is a factory function that creates a scene class with callbacks
 * to communicate with the React wrapper (GameContainer).
 */

import Phaser from 'phaser'
import { levels } from './levels'
import { createTrap } from './traps'

/**
 * Theme color lookup for backgrounds and platforms.
 */
const THEME_COLORS = {
  blue: {
    skyTop: 0x0a0a2e, skyBottom: 0x1a1a4e,
    starTint: 0xffffff,
    mountainFill: 0x151540,
    groundFill: 0x3a3a5e, groundGrass: 0x4caf50, groundGrid: 0x2a2a4e,
    floatFill: 0x5a5a8a, floatTop: 0x7b7bbb, floatStroke: 0x4a4a6a,
  },
  green: {
    skyTop: 0x0a1a0a, skyBottom: 0x1a3a1a,
    starTint: 0xccffcc,
    mountainFill: 0x152015,
    groundFill: 0x3a4a3a, groundGrass: 0x66bb6a, groundGrid: 0x2a3a2a,
    floatFill: 0x5a7a5a, floatTop: 0x81c784, floatStroke: 0x4a6a4a,
  },
  red: {
    skyTop: 0x1a0a0a, skyBottom: 0x3a1a1a,
    starTint: 0xffcccc,
    mountainFill: 0x2a1010,
    groundFill: 0x4a2a2a, groundGrass: 0xf44336, groundGrid: 0x3a1a1a,
    floatFill: 0x7a4a4a, floatTop: 0xe57373, floatStroke: 0x6a3a3a,
  },
  purple: {
    skyTop: 0x0f0a1e, skyBottom: 0x2a1a3e,
    starTint: 0xeeccff,
    mountainFill: 0x1a1030,
    groundFill: 0x3a2a4e, groundGrass: 0xab47bc, groundGrid: 0x2a1a3e,
    floatFill: 0x6a5a8a, floatTop: 0xce93d8, floatStroke: 0x5a4a7a,
  },
}

/**
 * Creates a Phaser Scene class configured for a specific level.
 * @param {number} levelId — which level to load (1-7)
 * @param {Object} callbacks — { onDeath, onTimeUpdate, onGameOver, onPause }
 * @returns {Phaser.Scene} scene class
 */
export function createGameScene(levelId, callbacks) {
  const { onDeath, onTimeUpdate, onGameOver, onPause } = callbacks

  class GameScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameScene' })
    }

    // ==========================================
    // INIT
    // ==========================================
    init() {
      this.levelData = levels[levelId] || levels[1]
      this.theme = this.levelData.theme || 'blue'
      this.colors = THEME_COLORS[this.theme] || THEME_COLORS.blue
      this.deaths = 0
      this.elapsedTime = 0
      this.scoreTimeOffset = 0 // For score reset feature
      this.score = 0
      this.isAlive = true
      this.isFinished = false
      this.currentCheckpoint = {
        x: this.levelData.playerStart.x,
        y: this.levelData.playerStart.y
      }
      this.currentCheckpointIndex = -1
      this.traps = []

      // Enriched tracking
      this.totalJumps = 0
      this.maxXReached = 0
      this.scoreResets = 0
      this.checkpointEvents = []
    }

    // ==========================================
    // CREATE
    // ==========================================
    create() {
      const { worldWidth } = this.levelData

      // -- World bounds --
      this.physics.world.setBounds(0, 0, worldWidth, 500)

      // -- Background layers (parallax feel) --
      this.createBackground(worldWidth)

      // -- Build platforms --
      this.platformGroup = this.physics.add.staticGroup()
      this.buildPlatforms()

      // -- Build traps (with theme) --
      this.buildTraps()

      // -- Create player --
      this.createPlayer()

      // -- Build goal flag --
      this.createGoal()

      // -- Build checkpoints --
      this.createCheckpoints()

      // -- Create death particle texture ONCE --
      if (!this.textures.exists('deathParticle')) {
        const pg = this.add.graphics()
        pg.fillStyle(0x00bcd4, 1)
        pg.fillCircle(4, 4, 4)
        pg.generateTexture('deathParticle', 8, 8)
        pg.destroy()
      }

      // -- Camera --
      this.cameras.main.setBounds(0, 0, worldWidth, 500)
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08)

      // -- Input --
      this.cursors = this.input.keyboard.createCursorKeys()
      this.wasd = {
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      }
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

      // -- Pause key (ESC) --
      this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
      this.escKey.on('down', () => {
        if (!this.isFinished && onPause) {
          onPause()
        }
      })

      // -- Collisions --
      this.physics.add.collider(this.player, this.platformGroup)

      // Collider with trap bodies
      this.traps.forEach(trap => {
        if (trap.type === 'fakeFloor') {
          this.physics.add.collider(this.player, trap.body, () => {
            trap.trigger(this.player)
          })
        } else if (trap.type === 'fallingBlock' || trap.type === 'fallingCeiling') {
          this.physics.add.overlap(this.player, trap.body, () => {
            if (trap.body.alpha > 0) this.killPlayer()
          })
        } else if (trap.type === 'surpriseSpike') {
          this.physics.add.overlap(this.player, trap.body, () => {
            if (trap.body.alpha > 0) this.killPlayer()
          })
        } else if (trap.type === 'springLauncher') {
          this.physics.add.overlap(this.player, trap.body, () => {
            if (trap.body.alpha > 0) trap.launchPlayer(this.player)
          })
        }
      })

      // -- HUD (fixed to camera) --
      this.createHUD()
    }

    // ==========================================
    // UPDATE (game loop)
    // ==========================================
    update(time, delta) {
      if (!this.isAlive || this.isFinished) return

      // -- Timer --
      this.elapsedTime += delta / 1000
      onTimeUpdate(this.elapsedTime)
      this.updateHUD()

      // -- Track max X --
      if (this.player.x > this.maxXReached) {
        this.maxXReached = this.player.x
      }

      // -- Player movement --
      const onGround = this.player.body.blocked.down || this.player.body.touching.down
      const speed = 220
      const jumpVelocity = -420

      if (this.cursors.left.isDown || this.wasd.left.isDown) {
        this.player.setVelocityX(-speed)
        this.playerEyes.setPosition(-4, -6)
      } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
        this.player.setVelocityX(speed)
        this.playerEyes.setPosition(4, -6)
      } else {
        this.player.setVelocityX(0)
      }

      if (onGround &&
        (this.cursors.up.isDown || this.wasd.up.isDown || this.spaceKey.isDown)) {
        this.player.setVelocityY(jumpVelocity)
        this.totalJumps++
      }

      // -- Check trap triggers (position-based) --
      this.traps.forEach(trap => {
        if (trap.checkTrigger) {
          trap.checkTrigger(this.player.x)
        }
      })

      // -- Fall off world = death --
      if (this.player.y > 520) {
        this.killPlayer()
      }
    }

    // ==========================================
    // BUILDERS
    // ==========================================

    /**
     * Draw themed parallax background.
     */
    createBackground(worldWidth) {
      const c = this.colors

      // Sky gradient
      const bg = this.add.graphics()
      bg.fillGradientStyle(c.skyTop, c.skyTop, c.skyBottom, c.skyBottom)
      bg.fillRect(0, 0, worldWidth, 500)

      // Stars
      for (let i = 0; i < 80; i++) {
        const x = Phaser.Math.Between(0, worldWidth)
        const y = Phaser.Math.Between(0, 300)
        const size = Phaser.Math.Between(1, 3)
        bg.fillStyle(c.starTint, Phaser.Math.FloatBetween(0.3, 0.8))
        bg.fillCircle(x, y, size)
      }

      // Distant mountains
      const mountains = this.add.graphics()
      mountains.fillStyle(c.mountainFill, 0.6)
      mountains.beginPath()
      mountains.moveTo(0, 500)
      for (let x = 0; x <= worldWidth; x += 200) {
        const h = 300 + Math.sin(x * 0.003) * 80 + Math.cos(x * 0.007) * 40
        mountains.lineTo(x, h)
      }
      mountains.lineTo(worldWidth, 500)
      mountains.closePath()
      mountains.fillPath()
    }

    /**
     * Build solid platforms from level data using theme colors.
     */
    buildPlatforms() {
      const c = this.colors

      this.levelData.platforms.forEach(p => {
        const g = this.add.graphics()

        if (p.height > 20) {
          // Ground block — themed
          g.fillStyle(c.groundFill, 1)
          g.fillRect(0, 0, p.width, p.height)
          g.fillStyle(c.groundGrass, 1)
          g.fillRect(0, 0, p.width, 6)
          g.lineStyle(1, c.groundGrid, 0.5)
          for (let x = 0; x < p.width; x += 20) {
            g.lineBetween(x, 6, x, p.height)
          }
          for (let y = 6; y < p.height; y += 10) {
            g.lineBetween(0, y, p.width, y)
          }
        } else {
          // Floating platform — themed
          g.fillStyle(c.floatFill, 1)
          g.fillRect(0, 0, p.width, p.height)
          g.fillStyle(c.floatTop, 1)
          g.fillRect(0, 0, p.width, 4)
          g.lineStyle(1, c.floatStroke)
          g.strokeRect(0, 0, p.width, p.height)
        }

        const key = `plat_${p.x}_${p.y}`
        g.generateTexture(key, p.width, p.height)
        g.destroy()

        const platBody = this.platformGroup.create(p.x + p.width / 2, p.y + p.height / 2, key)
        platBody.setDisplaySize(p.width, p.height)
        platBody.refreshBody()
      })
    }

    /**
     * Build traps from level data using the trap factory.
     * Passes theme for fake floor styling.
     */
    buildTraps() {
      this.traps = this.levelData.traps
        .map(td => createTrap(this, td, this.theme))
        .filter(Boolean)
    }

    /**
     * Create the player character.
     */
    createPlayer() {
      const pw = 28
      const ph = 36
      const { playerStart } = this.levelData

      const g = this.add.graphics()
      g.fillStyle(0x00bcd4, 1)
      g.fillRoundedRect(0, 0, pw, ph, 4)
      g.fillStyle(0x4dd0e1, 1)
      g.fillRoundedRect(4, ph * 0.5, pw - 8, ph * 0.35, 3)

      const key = 'player_body'
      g.generateTexture(key, pw, ph)
      g.destroy()

      this.player = this.physics.add.sprite(playerStart.x, playerStart.y, key)
      this.player.setDisplaySize(pw, ph)
      this.player.setCollideWorldBounds(false)
      this.player.setBounce(0.1)

      // Eyes
      const eyeContainer = this.add.container(0, 0)
      const eyeG = this.add.graphics()
      eyeG.fillStyle(0xffffff, 1)
      eyeG.fillCircle(-6, -6, 5)
      eyeG.fillStyle(0x000000, 1)
      eyeG.fillCircle(-4, -6, 2.5)
      eyeG.fillStyle(0xffffff, 1)
      eyeG.fillCircle(6, -6, 5)
      eyeG.fillStyle(0x000000, 1)
      eyeG.fillCircle(8, -6, 2.5)

      eyeContainer.add(eyeG)
      this.playerEyes = eyeContainer

      this.events.on('update', () => {
        if (this.player && this.player.active) {
          eyeContainer.setPosition(this.player.x, this.player.y)
        }
      })
    }

    /**
     * Create the goal flag at the end of the level.
     */
    createGoal() {
      const { goal } = this.levelData
      const flagG = this.add.graphics()

      flagG.fillStyle(0xcccccc, 1)
      flagG.fillRect(0, 0, 4, 80)
      flagG.fillStyle(0xffd700, 1)
      flagG.beginPath()
      flagG.moveTo(4, 0)
      flagG.lineTo(40, 15)
      flagG.lineTo(4, 30)
      flagG.closePath()
      flagG.fillPath()
      flagG.fillStyle(0xff3c7d, 1)
      flagG.fillCircle(20, 15, 6)

      const key = 'goal_flag'
      flagG.generateTexture(key, 44, 80)
      flagG.destroy()

      this.goalSprite = this.physics.add.image(goal.x, goal.y, key)
      this.goalSprite.setDisplaySize(44, 80)
      this.goalSprite.body.allowGravity = false
      this.goalSprite.setImmovable(true)

      this.physics.add.overlap(this.player, this.goalSprite, () => {
        this.winLevel()
      })

      this.tweens.add({
        targets: this.goalSprite,
        y: goal.y - 8,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    }

    /**
     * Create checkpoint markers.
     */
    createCheckpoints() {
      this.checkpointSprites = []
      this.levelData.checkpoints.forEach((cp, i) => {
        const g = this.add.graphics()
        g.fillStyle(0x888888, 1)
        g.fillRect(0, 0, 3, 40)
        g.fillStyle(0x2196f3, 1)
        g.beginPath()
        g.moveTo(3, 0)
        g.lineTo(20, 8)
        g.lineTo(3, 16)
        g.closePath()
        g.fillPath()

        const key = `checkpoint_${i}`
        g.generateTexture(key, 24, 40)
        g.destroy()

        const sprite = this.physics.add.image(cp.x, cp.y, key)
        sprite.setDisplaySize(24, 40)
        sprite.body.allowGravity = false
        sprite.setImmovable(true)

        this.physics.add.overlap(this.player, sprite, () => {
          if (this.currentCheckpoint.x < cp.x) {
            this.currentCheckpoint = { x: cp.x, y: cp.y }
            this.currentCheckpointIndex = i

            // Record checkpoint event (cumulative values)
            this.checkpointEvents.push({
              checkpointIndex: i,
              reachedAtSeconds: this.elapsedTime,
              deathsSoFar: this.deaths
            })

            // Visual feedback
            sprite.setTint(0x00e676)
            this.tweens.add({
              targets: sprite,
              scaleX: 1.3,
              scaleY: 1.3,
              duration: 200,
              yoyo: true
            })
          }
        })

        this.checkpointSprites.push(sprite)
      })
    }

    // ==========================================
    // HUD
    // ==========================================
    createHUD() {
      const style = {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '11px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }

      this.hudDeathText = this.add.text(10, 10, `💀 Deaths: 0`, style)
        .setScrollFactor(0).setDepth(100)

      this.hudTimeText = this.add.text(10, 30, `⏱️ 00:00`, style)
        .setScrollFactor(0).setDepth(100)

      this.hudScoreText = this.add.text(10, 50, `⭐ Score: 0`, style)
        .setScrollFactor(0).setDepth(100)

      this.hudLevelText = this.add.text(650, 10, `Level ${levelId}`, {
        ...style, fill: '#ffd700'
      }).setScrollFactor(0).setDepth(100)
    }

    updateHUD() {
      const m = Math.floor(this.elapsedTime / 60)
      const s = Math.floor(this.elapsedTime % 60)
      const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`

      this.hudDeathText.setText(`💀 Deaths: ${this.deaths}`)
      this.hudTimeText.setText(`⏱️ ${timeStr}`)

      // Calculate running score (−25 per death)
      const baseScore = 1000
      const deathPenalty = this.deaths * 25
      const effectiveTime = this.elapsedTime - this.scoreTimeOffset
      const timeBonus = Math.max(0, 500 - Math.floor(effectiveTime) * 2)
      this.score = Math.max(0, baseScore - deathPenalty + timeBonus)
      this.hudScoreText.setText(`⭐ Score: ${this.score}`)
    }

    // ==========================================
    // DEATH & RESPAWN
    // ==========================================
    killPlayer() {
      if (!this.isAlive || this.isFinished) return
      this.isAlive = false
      this.deaths++

      onDeath(this.deaths)

      // Check for score reset penalty
      const baseScore = 1000
      const deathPenalty = this.deaths * 25
      const effectiveTime = this.elapsedTime - this.scoreTimeOffset
      const timeBonus = Math.max(0, 500 - Math.floor(effectiveTime) * 2)
      const currentScore = Math.max(0, baseScore - deathPenalty + timeBonus)

      if (currentScore <= 0) {
        this.scoreResets++
        // Reset the score accumulation by adjusting time offset
        this.scoreTimeOffset = this.elapsedTime

        // Show score reset flash
        const resetText = this.add.text(400, 200, '⚠️ SCORE RESET!', {
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '16px',
          fill: '#ff4444',
          stroke: '#000000',
          strokeThickness: 4,
          align: 'center'
        }).setScrollFactor(0).setDepth(200).setOrigin(0.5)

        this.tweens.add({
          targets: resetText,
          alpha: 0,
          y: 170,
          duration: 2000,
          ease: 'Power2',
          onComplete: () => resetText.destroy()
        })
      }

      // Death flash effect
      this.cameras.main.shake(200, 0.01)
      this.cameras.main.flash(200, 255, 50, 50)

      // Death particles — create, explode, then auto-destroy after lifespan
      const particles = this.add.particles(this.player.x, this.player.y, 'deathParticle', {
        speed: { min: 50, max: 150 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.6, end: 0 },
        lifespan: 600,
        quantity: 8,
        emitting: false
      })
      particles.explode(8)
      // Destroy emitter after particles finish (prevents memory leak)
      this.time.delayedCall(700, () => particles.destroy())

      // Hide player
      this.player.setAlpha(0)
      this.player.setVelocity(0, 0)
      this.player.body.allowGravity = false

      // Respawn after delay
      this.time.delayedCall(800, () => {
        this.respawnPlayer()
      })
    }

    respawnPlayer() {
      // Reset all traps
      this.traps.forEach(trap => {
        if (trap.reset) trap.reset()
      })

      // Move player to checkpoint
      this.player.setPosition(this.currentCheckpoint.x, this.currentCheckpoint.y - 40)
      this.player.setVelocity(0, 0)
      this.player.body.allowGravity = true
      this.player.setAlpha(1)

      // Brief invincibility flash
      this.tweens.add({
        targets: this.player,
        alpha: { from: 0.3, to: 1 },
        duration: 100,
        repeat: 5,
        onComplete: () => {
          this.isAlive = true
        }
      })
    }

    // ==========================================
    // WIN
    // ==========================================
    winLevel() {
      if (this.isFinished) return
      this.isFinished = true

      // Celebration
      this.cameras.main.flash(500, 255, 215, 0)

      // Final score calculation (−25 per death)
      const baseScore = 1000
      const deathPenalty = this.deaths * 25
      const effectiveTime = this.elapsedTime - this.scoreTimeOffset
      const timeBonus = Math.max(0, 500 - Math.floor(effectiveTime) * 2)
      this.score = Math.max(0, baseScore - deathPenalty + timeBonus)

      // Stop player
      this.player.setVelocity(0, 0)
      this.player.body.allowGravity = false

      // Delay then trigger game over callback with enriched data
      this.time.delayedCall(1500, () => {
        onGameOver({
          isWin: true,
          deaths: this.deaths,
          time: this.elapsedTime,
          score: this.score,
          totalJumps: this.totalJumps,
          maxXReached: this.maxXReached,
          scoreResets: this.scoreResets,
          checkpointEvents: this.checkpointEvents.map(cp => ({
            checkpoint_index: cp.checkpointIndex,
            reached_at_seconds: parseFloat(cp.reachedAtSeconds.toFixed(2)),
            deaths_so_far: cp.deathsSoFar,
          }))
        })
      })
    }
  }

  return GameScene
}
