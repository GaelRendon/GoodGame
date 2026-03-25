/**
 * levels.js — Level definitions for the trap platformer.
 *
 * Each level contains:
 *   - platforms: { x, y, width, height } — solid ground/platforms
 *   - traps: { type, x, y, ...params } — hidden traps
 *   - checkpoints: { x, y } — respawn points
 *   - goal: { x, y } — level end flag
 *   - playerStart: { x, y } — spawn position
 *   - worldWidth: total level width in pixels
 *
 * Platform coordinate system: x,y is the TOP-LEFT corner.
 * Ground is at y=460 (bottom of 500px canvas, 40px tall).
 */

const GROUND_Y = 460
const GROUND_H = 40

// Helper: create a ground segment
const ground = (x, width) => ({ x, y: GROUND_Y, width, height: GROUND_H })

// Helper: create a floating platform
const platform = (x, y, width) => ({ x, y, width, height: 20 })

export const levels = {
  // ===========================
  // LEVEL 1 — "The Innocent Path"
  // Gentle-looking level with beginner traps
  // ===========================
  1: {
    name: 'The Innocent Path',
    worldWidth: 4000,
    playerStart: { x: 50, y: 400 },
    goal: { x: 3850, y: 380 },

    platforms: [
      // Ground with gaps
      ground(0, 600),
      ground(650, 400),
      ground(1100, 300),
      ground(1500, 200),
      ground(1750, 500),
      ground(2300, 300),
      ground(2700, 400),
      ground(3200, 300),
      ground(3600, 400),

      // Floating platforms
      platform(350, 340, 100),
      platform(550, 280, 80),
      platform(800, 320, 100),
      platform(1200, 300, 80),
      platform(1450, 350, 80),
      platform(1900, 300, 120),
      platform(2100, 250, 80),
      platform(2500, 320, 100),
      platform(2900, 280, 80),
      platform(3100, 340, 80),
      platform(3400, 300, 100),
    ],

    traps: [
      // Fake floor — looks like ground but collapses
      { type: 'fakeFloor', x: 660, y: GROUND_Y, width: 80, delay: 150 },

      // Falling block from above when walking past
      { type: 'fallingBlock', x: 400, y: 100, width: 50, height: 50, triggerX: 380 },
      { type: 'fallingBlock', x: 900, y: 80, width: 60, height: 40, triggerX: 880 },

      // Surprise spike pops up from ground
      { type: 'surpriseSpike', x: 1200, y: GROUND_Y - 30, triggerX: 1180 },
      { type: 'surpriseSpike', x: 1800, y: GROUND_Y - 30, triggerX: 1780 },

      // Spring launcher — flings player into the air unexpectedly
      { type: 'springLauncher', x: 2000, y: GROUND_Y - 15, triggerX: 1990 },

      // Fake floor near the end
      { type: 'fakeFloor', x: 2720, y: GROUND_Y, width: 100, delay: 100 },

      // Falling ceiling near goal
      { type: 'fallingCeiling', x: 3650, y: 0, width: 80, height: 60, triggerX: 3640 },
    ],

    checkpoints: [
      { x: 1100, y: 420 },
      { x: 2300, y: 420 },
    ]
  },

  // ===========================
  // LEVEL 2 — "Deceptive Forest"
  // More traps, trickier placement
  // ===========================
  2: {
    name: 'Deceptive Forest',
    worldWidth: 5000,
    playerStart: { x: 50, y: 400 },
    goal: { x: 4850, y: 380 },

    platforms: [
      ground(0, 400),
      ground(500, 300),
      ground(900, 200),
      ground(1200, 400),
      ground(1700, 200),
      ground(2000, 300),
      ground(2400, 250),
      ground(2750, 350),
      ground(3200, 200),
      ground(3500, 300),
      ground(3900, 250),
      ground(4250, 200),
      ground(4550, 450),

      platform(250, 340, 80),
      platform(450, 280, 100),
      platform(700, 300, 80),
      platform(950, 250, 80),
      platform(1350, 300, 100),
      platform(1550, 240, 80),
      platform(1800, 320, 80),
      platform(2150, 260, 100),
      platform(2500, 300, 80),
      platform(2650, 220, 80),
      platform(2900, 340, 80),
      platform(3050, 280, 80),
      platform(3350, 300, 100),
      platform(3600, 240, 80),
      platform(3800, 320, 80),
      platform(4100, 260, 100),
      platform(4350, 340, 80),
    ],

    traps: [
      { type: 'fakeFloor', x: 510, y: GROUND_Y, width: 100, delay: 100 },
      { type: 'fakeFloor', x: 1700, y: GROUND_Y, width: 80, delay: 80 },
      { type: 'fakeFloor', x: 2760, y: GROUND_Y, width: 90, delay: 120 },
      { type: 'fakeFloor', x: 4260, y: GROUND_Y, width: 70, delay: 80 },

      { type: 'fallingBlock', x: 300, y: 60, width: 60, height: 50, triggerX: 280 },
      { type: 'fallingBlock', x: 1000, y: 50, width: 70, height: 50, triggerX: 970 },
      { type: 'fallingBlock', x: 2200, y: 70, width: 50, height: 50, triggerX: 2180 },
      { type: 'fallingBlock', x: 3400, y: 40, width: 80, height: 50, triggerX: 3380 },

      { type: 'surpriseSpike', x: 600, y: GROUND_Y - 30, triggerX: 580 },
      { type: 'surpriseSpike', x: 1400, y: GROUND_Y - 30, triggerX: 1380 },
      { type: 'surpriseSpike', x: 2100, y: GROUND_Y - 30, triggerX: 2080 },
      { type: 'surpriseSpike', x: 3700, y: GROUND_Y - 30, triggerX: 3680 },

      { type: 'springLauncher', x: 800, y: GROUND_Y - 15, triggerX: 790 },
      { type: 'springLauncher', x: 2500, y: GROUND_Y - 15, triggerX: 2490 },

      { type: 'fallingCeiling', x: 1250, y: 0, width: 100, height: 60, triggerX: 1240 },
      { type: 'fallingCeiling', x: 3550, y: 0, width: 90, height: 50, triggerX: 3540 },
      { type: 'fallingCeiling', x: 4600, y: 0, width: 100, height: 70, triggerX: 4580 },
    ],

    checkpoints: [
      { x: 1200, y: 420 },
      { x: 2750, y: 420 },
      { x: 3900, y: 420 },
    ]
  },

  // ===========================
  // LEVEL 3 — "Chaos Castle"
  // Maximum trolling
  // ===========================
  3: {
    name: 'Chaos Castle',
    worldWidth: 6000,
    playerStart: { x: 50, y: 400 },
    goal: { x: 5850, y: 380 },

    platforms: [
      ground(0, 350),
      ground(450, 250),
      ground(800, 200),
      ground(1100, 300),
      ground(1500, 200),
      ground(1800, 250),
      ground(2150, 200),
      ground(2450, 300),
      ground(2850, 200),
      ground(3150, 250),
      ground(3500, 200),
      ground(3800, 300),
      ground(4200, 200),
      ground(4500, 250),
      ground(4850, 200),
      ground(5150, 200),
      ground(5450, 250),
      ground(5800, 200),

      platform(200, 340, 80),
      platform(400, 260, 80),
      platform(650, 300, 80),
      platform(850, 220, 80),
      platform(1050, 340, 80),
      platform(1250, 260, 80),
      platform(1450, 290, 60),
      platform(1650, 230, 80),
      platform(1900, 310, 80),
      platform(2050, 250, 60),
      platform(2250, 340, 80),
      platform(2600, 260, 80),
      platform(2800, 300, 80),
      platform(3000, 240, 80),
      platform(3300, 320, 80),
      platform(3500, 250, 60),
      platform(3700, 290, 80),
      platform(3950, 340, 80),
      platform(4100, 260, 60),
      platform(4350, 300, 80),
      platform(4600, 240, 80),
      platform(4800, 310, 80),
      platform(5050, 260, 60),
      platform(5300, 340, 80),
      platform(5600, 280, 80),
    ],

    traps: [
      // Fake floors — lots of them
      { type: 'fakeFloor', x: 460, y: GROUND_Y, width: 80, delay: 80 },
      { type: 'fakeFloor', x: 1110, y: GROUND_Y, width: 90, delay: 60 },
      { type: 'fakeFloor', x: 1810, y: GROUND_Y, width: 70, delay: 100 },
      { type: 'fakeFloor', x: 2860, y: GROUND_Y, width: 80, delay: 70 },
      { type: 'fakeFloor', x: 3810, y: GROUND_Y, width: 100, delay: 50 },
      { type: 'fakeFloor', x: 5460, y: GROUND_Y, width: 80, delay: 60 },

      // Falling blocks — from many directions
      { type: 'fallingBlock', x: 200, y: 40, width: 60, height: 50, triggerX: 180 },
      { type: 'fallingBlock', x: 700, y: 50, width: 50, height: 50, triggerX: 680 },
      { type: 'fallingBlock', x: 1300, y: 30, width: 70, height: 50, triggerX: 1280 },
      { type: 'fallingBlock', x: 2000, y: 60, width: 60, height: 50, triggerX: 1980 },
      { type: 'fallingBlock', x: 2700, y: 40, width: 50, height: 50, triggerX: 2680 },
      { type: 'fallingBlock', x: 3600, y: 50, width: 60, height: 50, triggerX: 3580 },
      { type: 'fallingBlock', x: 4400, y: 30, width: 80, height: 50, triggerX: 4380 },
      { type: 'fallingBlock', x: 5200, y: 50, width: 60, height: 50, triggerX: 5180 },

      // Surprise spikes
      { type: 'surpriseSpike', x: 500, y: GROUND_Y - 30, triggerX: 480 },
      { type: 'surpriseSpike', x: 1150, y: GROUND_Y - 30, triggerX: 1130 },
      { type: 'surpriseSpike', x: 1600, y: GROUND_Y - 30, triggerX: 1580 },
      { type: 'surpriseSpike', x: 2300, y: GROUND_Y - 30, triggerX: 2280 },
      { type: 'surpriseSpike', x: 3200, y: GROUND_Y - 30, triggerX: 3180 },
      { type: 'surpriseSpike', x: 4050, y: GROUND_Y - 30, triggerX: 4030 },
      { type: 'surpriseSpike', x: 4700, y: GROUND_Y - 30, triggerX: 4680 },
      { type: 'surpriseSpike', x: 5500, y: GROUND_Y - 30, triggerX: 5480 },

      // Spring launchers
      { type: 'springLauncher', x: 900, y: GROUND_Y - 15, triggerX: 890 },
      { type: 'springLauncher', x: 2500, y: GROUND_Y - 15, triggerX: 2490 },
      { type: 'springLauncher', x: 3900, y: GROUND_Y - 15, triggerX: 3890 },
      { type: 'springLauncher', x: 5100, y: GROUND_Y - 15, triggerX: 5090 },

      // Falling ceilings
      { type: 'fallingCeiling', x: 1500, y: 0, width: 120, height: 60, triggerX: 1480 },
      { type: 'fallingCeiling', x: 2850, y: 0, width: 100, height: 70, triggerX: 2830 },
      { type: 'fallingCeiling', x: 4200, y: 0, width: 110, height: 60, triggerX: 4180 },
      { type: 'fallingCeiling', x: 5700, y: 0, width: 100, height: 80, triggerX: 5680 },
    ],

    checkpoints: [
      { x: 1100, y: 420 },
      { x: 2450, y: 420 },
      { x: 3800, y: 420 },
      { x: 5150, y: 420 },
    ]
  }
}
