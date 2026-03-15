// ─── LAYOUT ───────────────────────────────────────────────────────────────────

const Layout = (() => {
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Three.js canvas
    const tc = document.getElementById('three-canvas');
    tc.width  = w;
    tc.height = h;

    // Landmark overlay
    const lc = document.getElementById('landmark-canvas');
    lc.width  = w;
    lc.height = h;

    if (window.SceneModule) SceneModule.onResize(w, h);
  }

  window.addEventListener('resize', resize);
  return { resize };
})();
