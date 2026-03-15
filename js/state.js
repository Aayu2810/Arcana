// ─── SHARED STATE ─────────────────────────────────────────────────────────────

const STATE = {
  // Shape
  shapeIndex: 0,
  materialIndex: 0,
  color: CONFIG.colors[0],

  // Gesture results (written by gestures.js, read by scene.js)
  gestures: {
    leftFist:      false,
    rightFist:     false,
    rightPointing: false,
    rightWaving:   false,
    thumbsUp:      false,   // right hand — grow object
    thumbsDown:    false,   // right hand — shrink object
    bothOpen:      false,   // both open palms — distance controls scale
    bothOpenDist:  0,       // normalised 0–1
    pointX: 0,
    pointY: 0,
  },

  // Scene
  exploding: false,
  morphing: false,

  // Cooldowns (timestamps)
  lastShapeChange:    0,
  lastColorChange:    0,
  lastMaterialChange: 0,
  lastExplosion:      0,
  lastScaleFlash:     0,

  // Hand landmark arrays (raw mediapipe output)
  hands: [],
};
