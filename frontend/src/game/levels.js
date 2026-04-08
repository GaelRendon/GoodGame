/**
 * levels.js — Level definitions for Good Game.
 *
 * 7 levels with themed color palettes:
 *   L1-2: blue  | L3-4: green  | L5: red (hardest)  | L6-7: purple
 *
 * Each level contains:
 *   - theme: color palette key
 *   - platforms: { x, y, width, height }
 *   - traps: { type, x, y, ...params }
 *   - checkpoints: { x, y }
 *   - goal: { x, y }
 *   - playerStart: { x, y }
 *   - worldWidth: total level width in pixels
 *
 * IMPORTANT: Ground segments are SPLIT at fake floor positions.
 * Fake floors fill the gap so they look like real ground.
 * When a fake floor collapses, there's nothing underneath.
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
  // LEVEL 1 — Blue theme (easy)
  // ===========================
  1: {
    name: 'Level 1',
    theme: 'blue',
    worldWidth: 4000,
    playerStart: { x: 50, y: 400 },
    goal: { x: 3850, y: 380 },

    platforms: [
      ground(0, 600),
      // gap 660-740 = fakeFloor
      ground(650, 10), ground(740, 310),
      ground(1100, 300),
      ground(1500, 200),
      ground(1750, 500),
      ground(2300, 300),
      // gap 2720-2820 = fakeFloor
      ground(2700, 20), ground(2820, 280),
      ground(3200, 300),
      ground(3600, 400),

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
      { type: 'fakeFloor', x: 660, y: GROUND_Y, width: 80, delay: 150 },
      { type: 'fallingBlock', x: 400, y: 100, width: 50, height: 50, triggerX: 380 },
      { type: 'fallingBlock', x: 900, y: 80, width: 60, height: 40, triggerX: 880 },
      { type: 'surpriseSpike', x: 1200, y: GROUND_Y - 30, triggerX: 1180 },
      { type: 'surpriseSpike', x: 1800, y: GROUND_Y - 30, triggerX: 1780 },
      { type: 'springLauncher', x: 2000, y: GROUND_Y - 15, triggerX: 1990 },
      { type: 'fakeFloor', x: 2720, y: GROUND_Y, width: 100, delay: 100 },
      { type: 'fallingCeiling', x: 3650, y: 0, width: 80, height: 60, triggerX: 3640 },
    ],

    checkpoints: [
      { x: 1100, y: 420 },
      { x: 2300, y: 420 },
    ]
  },

  // ===========================
  // LEVEL 2 — Blue theme (easy-med)
  // ===========================
  2: {
    name: 'Level 2',
    theme: 'blue',
    worldWidth: 5000,
    playerStart: { x: 50, y: 400 },
    goal: { x: 4850, y: 380 },

    platforms: [
      ground(0, 400),
      // gap 510-610 = fakeFloor
      ground(500, 10), ground(610, 190),
      ground(900, 200),
      ground(1200, 400),
      // gap 1700-1780 = fakeFloor
      ground(1780, 120),
      ground(2000, 300),
      ground(2400, 250),
      // gap 2760-2850 = fakeFloor
      ground(2750, 10), ground(2850, 250),
      ground(3200, 200),
      ground(3500, 300),
      ground(3900, 250),
      // gap 4260-4330 = fakeFloor
      ground(4250, 10), ground(4330, 120),
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
  // LEVEL 3 — Green theme (medium)
  // ===========================
  3: {
    name: 'Level 3',
    theme: 'green',
    worldWidth: 4500,
    playerStart: { x: 50, y: 400 },
    goal: { x: 4350, y: 380 },

    platforms: [
      ground(0, 500),
      // gap 590-680 = fakeFloor
      ground(580, 10), ground(680, 250),
      ground(1000, 250),
      ground(1350, 300),
      // gap 1760-1840 = fakeFloor
      ground(1750, 10), ground(1840, 110),
      ground(2050, 350),
      ground(2500, 250),
      // gap 2860-2940 = fakeFloor
      ground(2850, 10), ground(2940, 210),
      ground(3250, 200),
      ground(3550, 350),
      ground(3950, 200),
      ground(4200, 300),

      platform(300, 350, 90),
      platform(520, 280, 80),
      platform(750, 310, 80),
      platform(950, 240, 70),
      platform(1150, 320, 90),
      platform(1400, 260, 80),
      platform(1650, 340, 70),
      platform(1900, 280, 80),
      platform(2200, 300, 90),
      platform(2450, 230, 70),
      platform(2700, 340, 80),
      platform(2950, 260, 80),
      platform(3150, 310, 70),
      platform(3400, 280, 80),
      platform(3700, 240, 90),
      platform(3900, 320, 70),
      platform(4100, 280, 80),
    ],

    traps: [
      { type: 'fakeFloor', x: 590, y: GROUND_Y, width: 90, delay: 100 },
      { type: 'fakeFloor', x: 1760, y: GROUND_Y, width: 80, delay: 80 },
      { type: 'fakeFloor', x: 2860, y: GROUND_Y, width: 80, delay: 90 },

      { type: 'fallingBlock', x: 350, y: 70, width: 55, height: 45, triggerX: 330 },
      { type: 'fallingBlock', x: 1100, y: 50, width: 60, height: 50, triggerX: 1080 },
      { type: 'fallingBlock', x: 2300, y: 60, width: 50, height: 50, triggerX: 2280 },
      { type: 'fallingBlock', x: 3600, y: 45, width: 65, height: 50, triggerX: 3580 },

      { type: 'surpriseSpike', x: 700, y: GROUND_Y - 30, triggerX: 680 },
      { type: 'surpriseSpike', x: 1500, y: GROUND_Y - 30, triggerX: 1480 },
      { type: 'surpriseSpike', x: 2600, y: GROUND_Y - 30, triggerX: 2580 },
      { type: 'surpriseSpike', x: 3800, y: GROUND_Y - 30, triggerX: 3780 },

      { type: 'springLauncher', x: 1200, y: GROUND_Y - 15, triggerX: 1190 },
      { type: 'springLauncher', x: 2900, y: GROUND_Y - 15, triggerX: 2890 },

      { type: 'fallingCeiling', x: 1800, y: 0, width: 90, height: 55, triggerX: 1780 },
      { type: 'fallingCeiling', x: 4000, y: 0, width: 100, height: 60, triggerX: 3980 },
    ],

    checkpoints: [
      { x: 1350, y: 420 },
      { x: 2850, y: 420 },
    ]
  },

  // ===========================
  // LEVEL 4 — Green theme (medium-hard)
  // ===========================
  4: {
    name: 'Level 4',
    theme: 'green',
    worldWidth: 5200,
    playerStart: { x: 50, y: 400 },
    goal: { x: 5050, y: 380 },

    platforms: [
      ground(0, 400),
      // gap 490-570 = fakeFloor
      ground(480, 10), ground(570, 210),
      ground(880, 250),
      ground(1230, 300),
      // gap 1640-1710 = fakeFloor
      ground(1630, 10), ground(1710, 120),
      ground(1930, 350),
      ground(2380, 250),
      // gap 2740-2820 = fakeFloor
      ground(2730, 10), ground(2820, 210),
      ground(3130, 200),
      ground(3430, 250),
      // gap 3790-3860 = fakeFloor
      ground(3780, 10), ground(3860, 220),
      ground(4180, 200),
      // gap 4490-4570 = fakeFloor
      ground(4480, 10), ground(4570, 160),
      ground(4830, 400),

      platform(220, 340, 80),
      platform(420, 260, 80),
      platform(650, 300, 80),
      platform(830, 230, 70),
      platform(1050, 340, 80),
      platform(1280, 270, 70),
      platform(1480, 310, 80),
      platform(1730, 250, 70),
      platform(1980, 330, 80),
      platform(2200, 260, 80),
      platform(2430, 310, 70),
      platform(2630, 240, 80),
      platform(2880, 330, 80),
      platform(3080, 270, 70),
      platform(3300, 310, 80),
      platform(3530, 250, 80),
      platform(3730, 330, 70),
      platform(3950, 270, 80),
      platform(4150, 320, 70),
      platform(4380, 260, 80),
      platform(4630, 300, 80),
    ],

    traps: [
      { type: 'fakeFloor', x: 490, y: GROUND_Y, width: 80, delay: 90 },
      { type: 'fakeFloor', x: 1640, y: GROUND_Y, width: 70, delay: 70 },
      { type: 'fakeFloor', x: 2740, y: GROUND_Y, width: 80, delay: 80 },
      { type: 'fakeFloor', x: 3790, y: GROUND_Y, width: 70, delay: 60 },
      { type: 'fakeFloor', x: 4490, y: GROUND_Y, width: 80, delay: 70 },

      { type: 'fallingBlock', x: 280, y: 55, width: 55, height: 50, triggerX: 260 },
      { type: 'fallingBlock', x: 900, y: 45, width: 60, height: 50, triggerX: 880 },
      { type: 'fallingBlock', x: 1800, y: 60, width: 50, height: 50, triggerX: 1780 },
      { type: 'fallingBlock', x: 2900, y: 40, width: 65, height: 50, triggerX: 2880 },
      { type: 'fallingBlock', x: 4300, y: 50, width: 60, height: 50, triggerX: 4280 },

      { type: 'surpriseSpike', x: 550, y: GROUND_Y - 30, triggerX: 530 },
      { type: 'surpriseSpike', x: 1300, y: GROUND_Y - 30, triggerX: 1280 },
      { type: 'surpriseSpike', x: 2100, y: GROUND_Y - 30, triggerX: 2080 },
      { type: 'surpriseSpike', x: 3200, y: GROUND_Y - 30, triggerX: 3180 },
      { type: 'surpriseSpike', x: 4500, y: GROUND_Y - 30, triggerX: 4480 },

      { type: 'springLauncher', x: 760, y: GROUND_Y - 15, triggerX: 750 },
      { type: 'springLauncher', x: 2500, y: GROUND_Y - 15, triggerX: 2490 },
      { type: 'springLauncher', x: 3900, y: GROUND_Y - 15, triggerX: 3890 },

      { type: 'fallingCeiling', x: 1600, y: 0, width: 90, height: 55, triggerX: 1580 },
      { type: 'fallingCeiling', x: 3500, y: 0, width: 100, height: 60, triggerX: 3480 },
      { type: 'fallingCeiling', x: 4850, y: 0, width: 80, height: 65, triggerX: 4830 },
    ],

    checkpoints: [
      { x: 1230, y: 420 },
      { x: 2730, y: 420 },
      { x: 4180, y: 420 },
    ]
  },

  // ===========================
  // LEVEL 5 — Red theme (hardest)
  // ===========================
  5: {
    name: 'Level 5',
    theme: 'red',
    worldWidth: 6000,
    playerStart: { x: 50, y: 400 },
    goal: { x: 5850, y: 380 },

    platforms: [
      ground(0, 350),
      // gap 460-540 = fakeFloor
      ground(450, 10), ground(540, 160),
      ground(800, 200),
      // gap 1110-1200 = fakeFloor
      ground(1100, 10), ground(1200, 200),
      ground(1500, 200),
      // gap 1810-1880 = fakeFloor
      ground(1800, 10), ground(1880, 170),
      ground(2150, 200),
      ground(2450, 300),
      // gap 2860-2940 = fakeFloor
      ground(2850, 10), ground(2940, 110),
      ground(3150, 250),
      ground(3500, 200),
      // gap 3810-3910 = fakeFloor
      ground(3800, 10), ground(3910, 190),
      ground(4200, 200),
      ground(4500, 250),
      ground(4850, 200),
      ground(5150, 200),
      // gap 5460-5540 = fakeFloor
      ground(5450, 10), ground(5540, 160),
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
      { type: 'fakeFloor', x: 460, y: GROUND_Y, width: 80, delay: 80 },
      { type: 'fakeFloor', x: 1110, y: GROUND_Y, width: 90, delay: 60 },
      { type: 'fakeFloor', x: 1810, y: GROUND_Y, width: 70, delay: 100 },
      { type: 'fakeFloor', x: 2860, y: GROUND_Y, width: 80, delay: 70 },
      { type: 'fakeFloor', x: 3810, y: GROUND_Y, width: 100, delay: 50 },
      { type: 'fakeFloor', x: 5460, y: GROUND_Y, width: 80, delay: 60 },

      { type: 'fallingBlock', x: 200, y: 40, width: 60, height: 50, triggerX: 180 },
      { type: 'fallingBlock', x: 700, y: 50, width: 50, height: 50, triggerX: 680 },
      { type: 'fallingBlock', x: 1300, y: 30, width: 70, height: 50, triggerX: 1280 },
      { type: 'fallingBlock', x: 2000, y: 60, width: 60, height: 50, triggerX: 1980 },
      { type: 'fallingBlock', x: 2700, y: 40, width: 50, height: 50, triggerX: 2680 },
      { type: 'fallingBlock', x: 3600, y: 50, width: 60, height: 50, triggerX: 3580 },
      { type: 'fallingBlock', x: 4400, y: 30, width: 80, height: 50, triggerX: 4380 },
      { type: 'fallingBlock', x: 5200, y: 50, width: 60, height: 50, triggerX: 5180 },

      { type: 'surpriseSpike', x: 500, y: GROUND_Y - 30, triggerX: 480 },
      { type: 'surpriseSpike', x: 1150, y: GROUND_Y - 30, triggerX: 1130 },
      { type: 'surpriseSpike', x: 1600, y: GROUND_Y - 30, triggerX: 1580 },
      { type: 'surpriseSpike', x: 2300, y: GROUND_Y - 30, triggerX: 2280 },
      { type: 'surpriseSpike', x: 3200, y: GROUND_Y - 30, triggerX: 3180 },
      { type: 'surpriseSpike', x: 4050, y: GROUND_Y - 30, triggerX: 4030 },
      { type: 'surpriseSpike', x: 4700, y: GROUND_Y - 30, triggerX: 4680 },
      { type: 'surpriseSpike', x: 5500, y: GROUND_Y - 30, triggerX: 5480 },

      { type: 'springLauncher', x: 900, y: GROUND_Y - 15, triggerX: 890 },
      { type: 'springLauncher', x: 2500, y: GROUND_Y - 15, triggerX: 2490 },
      { type: 'springLauncher', x: 3900, y: GROUND_Y - 15, triggerX: 3890 },
      { type: 'springLauncher', x: 5100, y: GROUND_Y - 15, triggerX: 5090 },

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
  },

  // ===========================
  // LEVEL 6 — Purple theme (hard)
  // ===========================
  6: {
    name: 'Level 6',
    theme: 'purple',
    worldWidth: 5500,
    playerStart: { x: 50, y: 400 },
    goal: { x: 5350, y: 380 },

    platforms: [
      ground(0, 380),
      // gap 470-540 = fakeFloor
      ground(460, 10), ground(540, 200),
      ground(840, 220),
      // gap 1170-1250 = fakeFloor
      ground(1160, 10), ground(1250, 210),
      ground(1560, 200),
      // gap 1870-1940 = fakeFloor
      ground(1860, 10), ground(1940, 170),
      ground(2210, 200),
      ground(2510, 280),
      // gap 2900-2980 = fakeFloor
      ground(2890, 10), ground(2980, 110),
      ground(3190, 250),
      ground(3540, 200),
      // gap 3850-3920 = fakeFloor
      ground(3840, 10), ground(3920, 200),
      ground(4220, 200),
      ground(4520, 250),
      ground(4870, 200),
      ground(5170, 350),

      platform(220, 340, 70),
      platform(400, 260, 70),
      platform(620, 300, 70),
      platform(810, 230, 70),
      platform(1000, 340, 70),
      platform(1220, 270, 70),
      platform(1420, 300, 60),
      platform(1620, 240, 70),
      platform(1850, 320, 70),
      platform(2050, 250, 60),
      platform(2280, 340, 70),
      platform(2480, 260, 70),
      platform(2700, 300, 70),
      platform(2900, 230, 60),
      platform(3100, 310, 70),
      platform(3350, 260, 70),
      platform(3540, 320, 60),
      platform(3750, 250, 70),
      platform(3980, 340, 70),
      platform(4180, 270, 60),
      platform(4400, 300, 70),
      platform(4600, 240, 70),
      platform(4800, 320, 60),
      platform(5050, 270, 70),
    ],

    traps: [
      { type: 'fakeFloor', x: 470, y: GROUND_Y, width: 70, delay: 70 },
      { type: 'fakeFloor', x: 1170, y: GROUND_Y, width: 80, delay: 60 },
      { type: 'fakeFloor', x: 1870, y: GROUND_Y, width: 70, delay: 80 },
      { type: 'fakeFloor', x: 2900, y: GROUND_Y, width: 80, delay: 50 },
      { type: 'fakeFloor', x: 3850, y: GROUND_Y, width: 70, delay: 60 },

      { type: 'fallingBlock', x: 250, y: 45, width: 55, height: 50, triggerX: 230 },
      { type: 'fallingBlock', x: 750, y: 35, width: 60, height: 50, triggerX: 730 },
      { type: 'fallingBlock', x: 1350, y: 50, width: 50, height: 50, triggerX: 1330 },
      { type: 'fallingBlock', x: 2100, y: 40, width: 60, height: 50, triggerX: 2080 },
      { type: 'fallingBlock', x: 3000, y: 35, width: 55, height: 50, triggerX: 2980 },
      { type: 'fallingBlock', x: 3700, y: 45, width: 60, height: 50, triggerX: 3680 },
      { type: 'fallingBlock', x: 4600, y: 30, width: 65, height: 50, triggerX: 4580 },

      { type: 'surpriseSpike', x: 500, y: GROUND_Y - 30, triggerX: 480 },
      { type: 'surpriseSpike', x: 1100, y: GROUND_Y - 30, triggerX: 1080 },
      { type: 'surpriseSpike', x: 1700, y: GROUND_Y - 30, triggerX: 1680 },
      { type: 'surpriseSpike', x: 2400, y: GROUND_Y - 30, triggerX: 2380 },
      { type: 'surpriseSpike', x: 3300, y: GROUND_Y - 30, triggerX: 3280 },
      { type: 'surpriseSpike', x: 4100, y: GROUND_Y - 30, triggerX: 4080 },
      { type: 'surpriseSpike', x: 4900, y: GROUND_Y - 30, triggerX: 4880 },

      { type: 'springLauncher', x: 900, y: GROUND_Y - 15, triggerX: 890 },
      { type: 'springLauncher', x: 2600, y: GROUND_Y - 15, triggerX: 2590 },
      { type: 'springLauncher', x: 4300, y: GROUND_Y - 15, triggerX: 4290 },

      { type: 'fallingCeiling', x: 1500, y: 0, width: 100, height: 60, triggerX: 1480 },
      { type: 'fallingCeiling', x: 2800, y: 0, width: 90, height: 65, triggerX: 2780 },
      { type: 'fallingCeiling', x: 4000, y: 0, width: 100, height: 60, triggerX: 3980 },
      { type: 'fallingCeiling', x: 5200, y: 0, width: 110, height: 70, triggerX: 5180 },
    ],

    checkpoints: [
      { x: 1160, y: 420 },
      { x: 2510, y: 420 },
      { x: 3840, y: 420 },
    ]
  },

  // ===========================
  // LEVEL 7 — Purple theme (hard, final)
  // ===========================
  7: {
    name: 'Level 7',
    theme: 'purple',
    worldWidth: 5800,
    playerStart: { x: 50, y: 400 },
    goal: { x: 5650, y: 380 },

    platforms: [
      ground(0, 350),
      // gap 440-510 = fakeFloor
      ground(430, 10), ground(510, 170),
      ground(780, 200),
      // gap 1090-1170 = fakeFloor
      ground(1080, 10), ground(1170, 190),
      ground(1460, 200),
      // gap 1770-1840 = fakeFloor
      ground(1760, 10), ground(1840, 170),
      ground(2110, 200),
      ground(2410, 270),
      // gap 2790-2860 = fakeFloor
      ground(2780, 10), ground(2860, 120),
      ground(3080, 250),
      ground(3430, 200),
      // gap 3740-3820 = fakeFloor
      ground(3730, 10), ground(3820, 180),
      ground(4100, 200),
      ground(4400, 250),
      ground(4750, 200),
      // gap 5060-5130 = fakeFloor
      ground(5050, 10), ground(5130, 120),
      ground(5350, 250),
      ground(5650, 200),

      platform(180, 340, 70),
      platform(380, 260, 70),
      platform(580, 300, 65),
      platform(750, 220, 70),
      platform(950, 340, 65),
      platform(1150, 260, 70),
      platform(1350, 290, 60),
      platform(1550, 230, 65),
      platform(1800, 310, 70),
      platform(2000, 250, 60),
      platform(2200, 340, 65),
      platform(2450, 260, 70),
      platform(2650, 300, 65),
      platform(2850, 230, 60),
      platform(3050, 310, 70),
      platform(3280, 260, 65),
      platform(3480, 320, 60),
      platform(3700, 250, 65),
      platform(3930, 340, 70),
      platform(4150, 270, 60),
      platform(4350, 300, 65),
      platform(4550, 240, 70),
      platform(4780, 310, 60),
      platform(5000, 260, 65),
      platform(5250, 340, 70),
      platform(5500, 280, 65),
    ],

    traps: [
      { type: 'fakeFloor', x: 440, y: GROUND_Y, width: 70, delay: 60 },
      { type: 'fakeFloor', x: 1090, y: GROUND_Y, width: 80, delay: 50 },
      { type: 'fakeFloor', x: 1770, y: GROUND_Y, width: 70, delay: 70 },
      { type: 'fakeFloor', x: 2790, y: GROUND_Y, width: 70, delay: 50 },
      { type: 'fakeFloor', x: 3740, y: GROUND_Y, width: 80, delay: 40 },
      { type: 'fakeFloor', x: 5060, y: GROUND_Y, width: 70, delay: 50 },

      { type: 'fallingBlock', x: 200, y: 35, width: 55, height: 50, triggerX: 180 },
      { type: 'fallingBlock', x: 650, y: 40, width: 50, height: 50, triggerX: 630 },
      { type: 'fallingBlock', x: 1200, y: 30, width: 65, height: 50, triggerX: 1180 },
      { type: 'fallingBlock', x: 1900, y: 45, width: 55, height: 50, triggerX: 1880 },
      { type: 'fallingBlock', x: 2600, y: 35, width: 50, height: 50, triggerX: 2580 },
      { type: 'fallingBlock', x: 3500, y: 40, width: 60, height: 50, triggerX: 3480 },
      { type: 'fallingBlock', x: 4300, y: 30, width: 70, height: 50, triggerX: 4280 },
      { type: 'fallingBlock', x: 5100, y: 40, width: 55, height: 50, triggerX: 5080 },

      { type: 'surpriseSpike', x: 480, y: GROUND_Y - 30, triggerX: 460 },
      { type: 'surpriseSpike', x: 1000, y: GROUND_Y - 30, triggerX: 980 },
      { type: 'surpriseSpike', x: 1500, y: GROUND_Y - 30, triggerX: 1480 },
      { type: 'surpriseSpike', x: 2200, y: GROUND_Y - 30, triggerX: 2180 },
      { type: 'surpriseSpike', x: 3100, y: GROUND_Y - 30, triggerX: 3080 },
      { type: 'surpriseSpike', x: 3900, y: GROUND_Y - 30, triggerX: 3880 },
      { type: 'surpriseSpike', x: 4600, y: GROUND_Y - 30, triggerX: 4580 },
      { type: 'surpriseSpike', x: 5400, y: GROUND_Y - 30, triggerX: 5380 },

      { type: 'springLauncher', x: 800, y: GROUND_Y - 15, triggerX: 790 },
      { type: 'springLauncher', x: 2400, y: GROUND_Y - 15, triggerX: 2390 },
      { type: 'springLauncher', x: 3800, y: GROUND_Y - 15, triggerX: 3790 },
      { type: 'springLauncher', x: 5000, y: GROUND_Y - 15, triggerX: 4990 },

      { type: 'fallingCeiling', x: 1400, y: 0, width: 110, height: 60, triggerX: 1380 },
      { type: 'fallingCeiling', x: 2700, y: 0, width: 100, height: 70, triggerX: 2680 },
      { type: 'fallingCeiling', x: 4100, y: 0, width: 100, height: 60, triggerX: 4080 },
      { type: 'fallingCeiling', x: 5500, y: 0, width: 100, height: 75, triggerX: 5480 },
    ],

    checkpoints: [
      { x: 1080, y: 420 },
      { x: 2410, y: 420 },
      { x: 3730, y: 420 },
      { x: 5050, y: 420 },
    ]
  }
}
