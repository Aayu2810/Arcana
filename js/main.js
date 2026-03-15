// ─── MAIN ─────────────────────────────────────────────────────────────────────

(async () => {
  // 1. Init layout
  Layout.resize();

  // 2. Init Three.js scene
  SceneModule.init();

  // 3. Init webcam
  const video = await WebcamModule.init();
  if (!video) {
    WebcamModule.setStatus('No camera — gestures disabled', false);
    return;
  }

  // 4. Init MediaPipe
  try {
    await MediaPipeModule.init(video);
  } catch (err) {
    WebcamModule.setStatus('Tracking error', false);
    console.error('MediaPipe init error:', err);
  }

  // 5. Mirror the webcam into the small preview canvas
  const preview = document.getElementById('cam-preview');
  const pCtx = preview.getContext('2d');
  function drawPreview() {
    requestAnimationFrame(drawPreview);
    if (video.readyState >= 2) {
      preview.width  = 160;
      preview.height = 120;
      pCtx.save();
      pCtx.translate(160, 0);
      pCtx.scale(-1, 1);
      pCtx.drawImage(video, 0, 0, 160, 120);
      pCtx.restore();
    }
  }
  drawPreview();

  // 6. Guide toggle
  const guide  = document.getElementById('gesture-guide');
  const toggle = document.getElementById('toggle-guide');
  toggle.addEventListener('click', () => {
    const hidden = guide.classList.toggle('hidden');
    toggle.textContent = hidden ? 'Show' : 'Hide';
  });
})();
