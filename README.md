# ✦ Arcana

> *Sculpt 3D objects in real time — using just your hands.*

Arcana is a WebGL hand-tracking playground built with **MediaPipe Hands** + **Three.js**. No installs, no controllers — just your webcam and your hands against a neon dark backdrop.


## 🔴 Live Demo

👉 **[arcana live](https://aayu2810.github.io/Arcana)**

---

## ✦ Gestures

| Hand | Gesture | Action |
|------|---------|--------|
| ✊ Left | Fist | Cycle through shapes |
| ☝️ Right | Point (index only) | Rotate object left / right |
| 👍 Right | Thumbs up | Grow the object |
| 👎 Right | Thumbs down | Shrink the object |
| 🤲 Both | Open palms — spread apart | Scale object by distance |
| 👋 Right | Wave (open palm, 3+ swings) | Explosion particle burst |
| ✊ Right | Fist | Randomise color |

---

## ✦ Shapes

Sphere → Box → Icosahedron → Dodecahedron → Octahedron → Tetrahedron → Torus → Cone → Cylinder

## ✦ Materials

`arcane` · `holographic` · `obsidian` · `crystal` · `ember`

## ✦ Color Palette

Magenta · Cyan · Neon Orange · Neon Green · Neon Pink · Lime · Orange-Red · Yellow · Deep Pink · Chartreuse · Deep Sky Blue · Hot Pink

---

## ✦ Setup

```bash
git clone https://github.com/Aayu2810/Arcana
cd Arcana
python -m http.server 8080
```

Open `http://localhost:8080` in Chrome and allow camera access.

> ⚠️ Must be served over a local server — opening `index.html` directly won't work due to MediaPipe's module loading.

---

## ✦ Project Structure

```
index.html       — entry point + gesture guide UI
config.js        — shapes, colors, materials, animation & gesture thresholds
style.css        — neon dark theme (grid, scanlines, glow effects)

js/
  state.js       — shared app state
  layout.js      — canvas sizing and resize handling
  webcam.js      — webcam initialisation + status
  gestures.js    — all gesture detection (fist, point, thumbs, wave, open palm)
  scene.js       — Three.js scene, materials, particles, animation loop
  mediapipe.js   — MediaPipe setup and landmark drawing
  main.js        — entry point, wires everything together
```

---

## ✦ Configuration

Edit `config.js` to customise everything:

- `shapes` — list of 3D shapes to cycle through
- `colors` — neon color palette
- `materials` — material types for the object
- `animation` — rotation speed, float amplitude, morph duration
- `gesture` — detection thresholds and cooldowns
- `particles` — explosion particle count and lifetime

---

## ✦ Tech

- [Three.js r128](https://threejs.org/) — 3D rendering
- [MediaPipe Hands](https://mediapipe.dev/) — real-time hand tracking
- Vanilla JavaScript · HTML5 · CSS3

---

## ✦ License

MIT — see [LICENSE](LICENSE)

---

## ✦ Credits

Inspired by [threejs-handtracking-101](https://github.com/collidingScopes/threejs-handtracking-101) by Alan (collidingScopes), released under MIT License.
