/**
 * traps.js — Trap factory functions for the Phaser game scene.
 *
 * Each trap type creates game objects and defines their activation behavior.
 * Traps are invisible until triggered, then animate to surprise the player.
 */

/**
 * Creates a fake floor — a platform that looks normal but collapses on contact.
 * @param {Phaser.Scene} scene
 * @param {Object} trapDef — { x, y, width, delay }
 * @param {Phaser.GameObjects.Group} platforms — the platform group to add to
 * @returns {Object} trap controller
 */
export function createFakeFloor(scene, trapDef) {
  const { x, y, width, delay = 150 } = trapDef
  const height = 20

  // Draw a fake floor that looks like a regular platform
  const graphics = scene.add.graphics()
  graphics.fillStyle(0x4a4a6a, 1)
  graphics.fillRect(0, 0, width, height)
  graphics.lineStyle(1, 0x5a5a8a)
  graphics.strokeRect(0, 0, width, height)

  // Create texture from graphics
  const key = `fakeFloor_${x}_${y}`
  graphics.generateTexture(key, width, height)
  graphics.destroy()

  // Create as a static physics body (looks like part of the ground)
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
      body.enableBody(true, body.x, trapDef.y + height / 2, true, true)
      body.setAlpha(1)
    }
  }
}

/**
 * Creates a falling block — a block that drops from above when player passes a trigger point.
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

  // Create as a dynamic body but initially static (hidden above screen)
  const body = scene.physics.add.image(x + width / 2, y + height / 2, key)
  body.setDisplaySize(width, height)
  body.setImmovable(true)
  body.body.allowGravity = false
  body.setAlpha(0) // Hidden initially
  body.trapType = 'fallingBlock'

  let triggered = false

  return {
    body,
    type: 'fallingBlock',
    triggerX,
    /**
     * Check if player has crossed the trigger X position.
     */
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

      // Destroy after falling
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

  // Draw spike triangle
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

  // Physics body — sensor (overlaps but no collision push)
  const body = scene.physics.add.image(x + width / 2, y + height, key)
  body.setDisplaySize(width, height)
  body.body.allowGravity = false
  body.setImmovable(true)
  body.setAlpha(0) // Hidden underground
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
      // Pop up animation
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

  // Draw spring
  const graphics = scene.add.graphics()
  graphics.fillStyle(0x44ff44, 1)
  graphics.fillRect(0, 0, width, height)
  // Spring coil lines
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
  body.setAlpha(0) // Hidden
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
      // Animate spring expanding
      scene.tweens.add({
        targets: body,
        scaleY: 2,
        duration: 100,
        yoyo: true,
        ease: 'Bounce'
      })
    },
    /**
     * Apply launch force to player
     */
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
 * Similar to fallingBlock but wider and from the ceiling.
 * @param {Phaser.Scene} scene
 * @param {Object} trapDef — { x, y, width, height, triggerX }
 * @returns {Object} trap controller
 */
export function createFallingCeiling(scene, trapDef) {
  const { x, y, width, height, triggerX } = trapDef

  // Draw ceiling block with warning stripes
  const graphics = scene.add.graphics()
  graphics.fillStyle(0x666688, 1)
  graphics.fillRect(0, 0, width, height)
  // Warning stripes
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
  body.setAlpha(0) // Hidden
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
 */
export function createTrap(scene, trapDef) {
  switch (trapDef.type) {
    case 'fakeFloor': return createFakeFloor(scene, trapDef)
    case 'fallingBlock': return createFallingBlock(scene, trapDef)
    case 'surpriseSpike': return createSurpriseSpike(scene, trapDef)
    case 'springLauncher': return createSpringLauncher(scene, trapDef)
    case 'fallingCeiling': return createFallingCeiling(scene, trapDef)
    default:
      console.warn(`Unknown trap type: ${trapDef.type}`)
      return null
  }
}
