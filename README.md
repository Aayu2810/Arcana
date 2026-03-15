# ✦ ARCANA — Shape the Unseen

> *Sculpt 3D magic with your bare hands. No wand required.*

A mystical WebGL hand-tracking playground built with **MediaPipe Hands** + **Three.js**.
Inspired by Leviosa — reimagined with expanded gestures, morphing shapes, and an arcane aesthetic.

---

## Quick Start

```bash
# Clone / download the project, then:
python -m http.server 8000
# or
npx serve .
```

Open `http://localhost:8000` — allow webcam access.

---

## Gestures

| Hand | Gesture | Action |
|------|---------|--------|
| ✊ Left | Fist | Cycle to next shape (with morph animation) |
| ☝️ Right | Point (index only) | Rotate object — move finger left/right |
| 🤏 Both | Pinch (thumb+index) | Stretch / scale — spread hands apart |
| 👋 Right | Wave (open palm, 3+ swings) | Explosion particle burst |
| 🤚 Right | Swipe left/right (open palm) | Swap material |
| ✊ Right | Fist | Randomise color |

---

## Shapes
TorusKnot · Icosahedron · Sphere · Box · Octahedron · Torus · Cone

## Materials
arcane · holographic · obsidian · crystal · ember

---

## Project Structure

```
index.html      — entry point
config.js       — all tuneable constants
style.css       — mystical dark theme

js/
  state.js      — shared mutable state
  layout.js     — canvas sizing
  webcam.js     — camera init + status
  gestures.js   — all gesture math (fist, pinch, wave, swipe, point)
  scene.js      — Three.js scene, materials, particles, animation
  mediapipe.js  — MediaPipe setup, landmark drawing
  main.js       — wires everything together
```

---

## Configuration (`config.js`)

All constants are in `CONFIG`. Key tunables:

- `gesture.fistThreshold` — how tight a fist must be (lower = stricter)
- `gesture.waveMinSwings` — how many direction changes = wave
- `gesture.swipeMinDx` — minimum horizontal travel for swipe
- `animation.morphDuration` — how long shape transitions take (ms)
- `particles.count` — explosion particle count

---

## Tech

- [Three.js r128](https://threejs.org/)
- [MediaPipe Hands](https://mediapipe.dev/)
- Vanilla JS · HTML5 · CSS3

## License

MIT
