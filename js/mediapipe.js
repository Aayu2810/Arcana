// ─── MEDIAPIPE ────────────────────────────────────────────────────────────────

const MediaPipeModule = (() => {
  let handsModel;
  let camera;
  let lcCtx;

  function drawLandmarks(results) {
    const lc = document.getElementById('landmark-canvas');
    lcCtx = lcCtx || lc.getContext('2d');
    lcCtx.clearRect(0, 0, lc.width, lc.height);

    if (!results.multiHandLandmarks) return;

    results.multiHandLandmarks.forEach((landmarks, idx) => {
      const isLeft = results.multiHandedness[idx].label === 'Right'; // mirrored

      // Draw connectors
      const connectorColor = isLeft
        ? 'rgba(139,90,210,0.55)'
        : 'rgba(26,188,156,0.55)';

      // Simple manual connectors
      const connections = [
        [0,1],[1,2],[2,3],[3,4],       // thumb
        [0,5],[5,6],[6,7],[7,8],       // index
        [5,9],[9,10],[10,11],[11,12],  // middle
        [9,13],[13,14],[14,15],[15,16],// ring
        [13,17],[17,18],[18,19],[19,20],// pinky
        [0,17],                        // palm base
      ];

      lcCtx.strokeStyle = connectorColor;
      lcCtx.lineWidth = 2;
      lcCtx.shadowColor = isLeft ? '#9b59b6' : '#1abc9c';
      lcCtx.shadowBlur = 6;

      connections.forEach(([a, b]) => {
        const la = landmarks[a], lb = landmarks[b];
        lcCtx.beginPath();
        // Flip x because video is mirrored
        lcCtx.moveTo((1 - la.x) * lc.width, la.y * lc.height);
        lcCtx.lineTo((1 - lb.x) * lc.width, lb.y * lc.height);
        lcCtx.stroke();
      });

      // Draw landmark dots
      landmarks.forEach((lm, i) => {
        const x = (1 - lm.x) * lc.width;
        const y = lm.y * lc.height;
        const isTip = [4, 8, 12, 16, 20].includes(i);

        lcCtx.beginPath();
        lcCtx.arc(x, y, isTip ? 5 : 3, 0, Math.PI * 2);
        lcCtx.fillStyle = isTip
          ? (isLeft ? 'rgba(200,150,255,0.9)' : 'rgba(100,255,200,0.9)')
          : 'rgba(255,255,255,0.6)';
        lcCtx.shadowColor = isTip ? (isLeft ? '#9b59b6' : '#1abc9c') : 'transparent';
        lcCtx.shadowBlur = isTip ? 10 : 0;
        lcCtx.fill();
      });
    });
  }

  function onResults(results) {
    STATE.hands = results.multiHandLandmarks || [];
    drawLandmarks(results);
    GestureModule.update(results);
  }

  async function init(videoEl) {
    handsModel = new Hands({
      locateFile: file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    handsModel.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
    });

    handsModel.onResults(onResults);

    camera = new Camera(videoEl, {
      onFrame: async () => {
        await handsModel.send({ image: videoEl });
      },
      width: 640,
      height: 480,
    });

    await camera.start();
    WebcamModule.setStatus('Hands ready ✦', true);
  }

  return { init };
})();
