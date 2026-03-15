// ─── ARCANA CONFIG ────────────────────────────────────────────────────────────

const CONFIG = {
  shapes: ['Sphere', 'Box', 'Icosahedron', 'Dodecahedron', 'Octahedron', 'Tetrahedron', 'Torus', 'Cone', 'Cylinder'],

  materials: ['arcane', 'holographic', 'obsidian', 'crystal', 'ember'],

  colors: [
    0xff00ff,   // Magenta
    0x00ffff,   // Cyan
    0xff6600,   // Neon Orange
    0x00ff66,   // Neon Green
    0xff0099,   // Neon Pink
    0xccff00,   // Lime
    0xff3300,   // Orange-Red
    0xffff00,   // Yellow
    0xff1493,   // Deep Pink
    0x7fff00,   // Chartreuse
    0x00bfff,   // Deep Sky Blue
    0xff69b4,   // Hot Pink
  ],

  animation: {
    baseRotationSpeed: 0.004,
    floatAmplitude: 0.18,
    floatFrequency: 0.0008,
    morphDuration: 600,             // ms for shape morph transition
    explosionDuration: 900,
  },

  gesture: {
    fistThreshold: 0.065,
    pinchThreshold: 0.12,      // increased — real-world pinch needs more range
    waveWindowMs: 1200,
    waveMinSwings: 3,
    swipeMinDx: 0.15,          // lowered — easier to trigger swipe
    swipeMaxDy: 0.18,          // increased — more vertical tolerance
    cooldownMs: 700,
  },

  particles: {
    count: 120,
    radius: 2.2,
    lifeMs: 900,
  },
};
