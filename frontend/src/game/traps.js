/**
 * traps.js — Trap factory functions for the Good Game Phaser scene.
 *
 * Each trap type creates game objects and defines their activation behavior.
 * Traps are invisible until triggered, then animate to surprise the player.
 */

/**
 * Theme color lookup for fake floors to match ground platforms exactly.
 */
const THEME_GROUND_COLORS = {
  blue:   { fill: 0x3a3a5e, grass: 0x4caf50, grid: 0x2a2a4e },
  green:  { fill: 0x3a4a3a, grass: 0x66bb6a, grid: 0x2a3a2a },
  red:    { fill: 0x4a2a2a, grass: 0xf44336, grid: 0x3a1a1a },
  purple: { fill: 0x3a2a4e, grass: 0xab47bc, grid: 0x2a1a3e },
}

/**
 * Creates a fake floor — looks like ground but collapses when stepped on.
 * Height is 40px to match real ground segments.
 * Styled identically to ground with grass stripe + grid texture.
 *
 * @param {Phaser.Scene} scene
 * @param {Object} trapDef — { x, y, width, delay }
 * @param {string} theme — color theme key
 * @returns {Object} trap controller
 */
export function createFakeFloor(scene, trapDef, theme = 'blue') {
  const { x, y, width, delay = 150 } = trapDef
  const height = 40 // Match ground segments

  const colors = THEME_GROUND_COLORS[theme] || THEME_GROUND_COLORS.blue

  // Draw fake floor IDENTICALLY to ground platforms
  const graphics = scene.add.graphics()

  // Main fill
  graphics.fillStyle(colors.fill, 1)
  graphics.fillRect(0, 0, width, height)

  // Top grass stripe (same as ground)
  graphics.fillStyle(colors.grass, 1)
  graphics.fillRect(0, 0, width, 6)

  // Grid texture (same as ground)
  graphics.lineStyle(1, colors.grid, 0.5)
  for (let gx = 0; gx < width; gx += 20) {
    graphics.lineBetween(gx, 6, gx, height)
  }
  for (let gy = 6; gy < height; gy += 10) {
    graphics.lineBetween(0, gy, width, gy)
  }

  // Create texture from graphics
  const key = `fakeFloor_${x}_${y}`
  graphics.generateTexture(key, width, height)
  graphics.destroy()

  // Create as a static physics body (looks like ground)
  const body = scene.physics.add.staticImage(x + width / 2, y + height / 2, key)
  body.setDisplaySize(width, height)
  body.refreshBody()
  body.trapType = 'fakeFloor'

  let triggered = false

  return {
    body,
    type: 'fakeFloor',
    /**
     * Called when player stands on this floor.
     */
    trigger(player) {
      if (triggered) return
      triggered = true

      // Brief delay then collapse
      scene.time.delayedCall(delay, () => {
        // Shake and fade
        scene.tweens.add({
          targets: body,
          alpha: 0,
          y: body.y + 60,
          duration: 300,
          ease: 'Power2',
          onComplete: () => {
            body.disableBody(true, true)
          }
        })
      })
    },
    reset() {
      triggered = false
      body.enableBody(true, x + width / 2, trapDef.y + height / 2, true, true)
      body.setAlpha(1)
      body.refreshBody()
    }
  }
}

/**
 * Creates a falling block — drops from above when player passes a trigger point.
 * @param {Phaser.Scene} scene
 * @param {Object} trapDef — { x, y, width, height, triggerX }
 * @returns {Object} trap controller
 */
export function createFallingBlock(scene, trapDef) {
  const { x, y, width, height, triggerX } = trapDef

  // Draw block
  const graphics = scene.add.graphics()
  graphics.fillStyle(0x888888, 1)
  graphics.fillRect(0, 0, width, height)
  graphics.lineStyle(2, 0x666666)
  graphics.strokeRect(0, 0, width, height)
  // Danger markings
  graphics.fillStyle(0xff4444, 1)
  graphics.fillRect(4, 4, width - 8, 4)

  const key = `fallingBlock_${x}_${y}`
  graphics.generateTexture(key, width, height)
  graphics.destroy()

  const body = scene.physics.add.image(x + width / 2, y + height / 2, key)
  body.setDisplaySize(width, height)
  body.setImmovable(true)
  body.body.allowGravity = false
  body.setAlpha(0)
  body.trapType = 'fallingBlock'

  let triggered = false

  return {
    body,
    type: 'fallingBlock',
    triggerX,
    checkTrigger(playerX) {
      if (triggered) return
      if (playerX >= triggerX && playerX <= triggerX + 80) {
        this.trigger()
      }
    },
    trigger() {
      if (triggered) return
      triggered = true

      body.setAlpha(1)
      body.setImmovable(false)
      body.body.allowGravity = true
      body.body.setGravityY(600)

      scene.time.delayedCall(3000, () => {
        body.disableBody(true, true)
      })
    },
    reset() {
      triggered = false
      body.enableBody(true, x + width / 2, y + height / 2, true, true)
      body.setAlpha(0)
      body.setImmovable(true)
      body.body.allowGravity = false
      body.body.setGravityY(0)
      body.setVelocity(0, 0)
    }
  }
}

/**
 * Creates a surprise spike — hidden in the ground, pops up when player approaches.
 * @param {Phaser.Scene} scene
 * @param {Object} trapDef — { x, y, triggerX }
 * @returns {Object} trap controller
 */
export function createSurpriseSpike(scene, trapDef) {
  const { x, y, triggerX } = trapDef
  const width = 24
  const height = 30

  const graphics = scene.add.graphics()
  graphics.fillStyle(0xff3333, 1)
  graphics.beginPath()
  graphics.moveTo(width / 2, 0)
  graphics.lineTo(width, height)
  graphics.lineTo(0, height)
  graphics.closePath()
  graphics.fillPath()

  const key = `spike_${x}_${y}`
  graphics.generateTexture(key, width, height)
  graphics.destroy()

  const body = scene.physics.add.image(x + width / 2, y + height, key)
  body.setDisplaySize(width, height)
  body.body.allowGravity = false
  body.setImmovable(true)
  body.setAlpha(0)
  body.trapType = 'surpriseSpike'
  body.isDeadly = true

  let triggered = false

  return {
    body,
    type: 'surpriseSpike',
    triggerX,
    checkTrigger(playerX) {
      if (triggered) return
      if (playerX >= triggerX && playerX <= triggerX + 60) {
        this.trigger()
      }
    },
    trigger() {
      if (triggered) return
      triggered = true

      body.setAlpha(1)
      scene.tweens.add({
        targets: body,
        y: y - 5,
        duration: 100,
        ease: 'Power4'
      })
    },
    reset() {
      triggered = false
      body.setAlpha(0)
      body.setPosition(x + width / 2, y + height)
    }
  }
}

/**
 * Creates a spring launcher — launches the player into the air unexpectedly.
 * @param {Phaser.Scene} scene
 * @param {Object} trapDef — { x, y, triggerX }
 * @returns {Object} trap controller
 */
export function createSpringLauncher(scene, trapDef) {
  const { x, y, triggerX } = trapDef
  const width = 30
  const height = 15

  const graphics = scene.add.graphics()
  graphics.fillStyle(0x44ff44, 1)
  graphics.fillRect(0, 0, width, height)
  graphics.lineStyle(2, 0x22aa22)
  for (let i = 5; i < width; i += 8) {
    graphics.lineBetween(i, 0, i, height)
  }

  const key = `spring_${x}_${y}`
  graphics.generateTexture(key, width, height)
  graphics.destroy()

  const body = scene.physics.add.image(x + width / 2, y + height / 2, key)
  body.setDisplaySize(width, height)
  body.body.allowGravity = false
  body.setImmovable(true)
  body.setAlpha(0)
  body.trapType = 'springLauncher'

  let triggered = false

  return {
    body,
    type: 'springLauncher',
    triggerX,
    checkTrigger(playerX) {
      if (triggered) return
      if (playerX >= triggerX && playerX <= triggerX + 40) {
        this.trigger()
      }
    },
    trigger() {
      if (triggered) return
      triggered = true

      body.setAlpha(1)
      scene.tweens.add({
        targets: body,
        scaleY: 2,
        duration: 100,
        yoyo: true,
        ease: 'Bounce'
      })
    },
    launchPlayer(player) {
      player.setVelocityY(-700)
    },
    reset() {
      triggered = false
      body.setAlpha(0)
      body.setScale(1)
    }
  }
}

/**
 * Creates a falling ceiling — drops from above when player walks under.
 * @param {Phaser.Scene} scene
 * @param {Object} trapDef — { x, y, width, height, triggerX }
 * @returns {Object} trap controller
 */
export function createFallingCeiling(scene, trapDef) {
  const { x, y, width, height, triggerX } = trapDef

  const graphics = scene.add.graphics()
  graphics.fillStyle(0x666688, 1)
  graphics.fillRect(0, 0, width, height)
  graphics.fillStyle(0xffaa00, 0.6)
  for (let i = 0; i < width; i += 20) {
    graphics.fillRect(i, height - 8, 10, 8)
  }

  const key = `ceiling_${x}_${y}`
  graphics.generateTexture(key, width, height)
  graphics.destroy()

  const body = scene.physics.add.image(x + width / 2, y + height / 2, key)
  body.setDisplaySize(width, height)
  body.setImmovable(true)
  body.body.allowGravity = false
  body.setAlpha(0)
  body.trapType = 'fallingCeiling'
  body.isDeadly = true

  let triggered = false

  return {
    body,
    type: 'fallingCeiling',
    triggerX,
    checkTrigger(playerX) {
      if (triggered) return
      if (playerX >= triggerX && playerX <= triggerX + 80) {
        this.trigger()
      }
    },
    trigger() {
      if (triggered) return
      triggered = true

      body.setAlpha(1)
      body.setImmovable(false)
      body.body.allowGravity = true
      body.body.setGravityY(800)
    },
    reset() {
      triggered = false
      body.enableBody(true, x + width / 2, y + height / 2, true, true)
      body.setAlpha(0)
      body.setImmovable(true)
      body.body.allowGravity = false
      body.body.setGravityY(0)
      body.setVelocity(0, 0)
    }
  }
}

/**
 * Factory: create a trap by type string.
 * @param {Phaser.Scene} scene
 * @param {Object} trapDef
 * @param {string} theme — level color theme
 */
export function createTrap(scene, trapDef, theme = 'blue') {
  switch (trapDef.type) {
    case 'fakeFloor': return createFakeFloor(scene, trapDef, theme)
    case 'fallingBlock': return createFallingBlock(scene, trapDef)
    case 'surpriseSpike': return createSurpriseSpike(scene, trapDef)
    case 'springLauncher': return createSpringLauncher(scene, trapDef)
    case 'fallingCeiling': return createFallingCeiling(scene, trapDef)
    default:
      console.warn(`Unknown trap type: ${trapDef.type}`)
      return null
  }
}
