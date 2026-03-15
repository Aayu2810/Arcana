// ─── WEBCAM ───────────────────────────────────────────────────────────────────

const WebcamModule = (() => {
  async function init() {
    const video = document.getElementById('webcam');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      video.srcObject = stream;
      await video.play();
      setStatus('Hands ready ✦', true);
      return video;
    } catch (err) {
      setStatus('Camera denied', false);
      console.error('Webcam error:', err);
      return null;
    }
  }

  function setStatus(msg, ok) {
    const dot  = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    if (text) text.textContent = msg;
    if (dot)  dot.className = ok ? 'active' : 'error';
  }

  return { init, setStatus };
})();
