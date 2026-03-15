// ─── GESTURES ─────────────────────────────────────────────────────────────────
// All gesture detection lives here. Writes into STATE.gestures.

const GestureModule = (() => {
  // Wave tracking
  let waveHistory = [];
  let wavePeaks = 0;
  let lastWaveDir = null;

  // ── helpers ──────────────────────────────────────────────────────────────────

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
  }

  // All 4 fingers curled below their PIP joints
  function isFist(lm) {
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    return tips.every((tip, i) => lm[tip].y > lm[pips[i]].y);
  }

  // Index finger only extended, rest curled
  function isPointing(lm) {
    const indexUp    = lm[8].y < lm[6].y;
    const middleCurl = lm[12].y > lm[10].y;
    const ringCurl   = lm[16].y > lm[14].y;
    const pinkyCurl  = lm[20].y > lm[18].y;
    return indexUp && middleCurl && ringCurl && pinkyCurl;
  }

  // All 4 fingers extended
  function isOpenPalm(lm) {
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    return tips.every((tip, i) => lm[tip].y < lm[pips[i]].y);
  }

  // ── Thumbs Up / Down ─────────────────────────────────────────────────────────
  function isThumbsUp(lm) {
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    const fingersCurled = tips.every((tip, i) => lm[tip].y > lm[pips[i]].y);
    const thumbUp = lm[4].y < lm[3].y && lm[3].y < lm[2].y;
    return fingersCurled && thumbUp;
  }

  function isThumbsDown(lm) {
    const tips = [8, 12, 16, 20];
    const pips = [6, 10, 14, 18];
    const fingersCurled = tips.every((tip, i) => lm[tip].y > lm[pips[i]].y);
    const thumbDown = lm[4].y > lm[3].y && lm[3].y > lm[2].y;
    return fingersCurled && thumbDown;
  }

  // ── Wave ─────────────────────────────────────────────────────────────────────

  function updateWave(x, t) {
    waveHistory.push({ x, t });
    waveHistory = waveHistory.filter(e => t - e.t < CONFIG.gesture.waveWindowMs);
    if (waveHistory.length < 2) return false;

    const recent = waveHistory[waveHistory.length - 1];
    const prev   = waveHistory[waveHistory.length - 2];
    const dir = recent.x > prev.x ? 'right' : 'left';

    if (dir !== lastWaveDir) {
      wavePeaks++;
      lastWaveDir = dir;
    }

    if (wavePeaks >= CONFIG.gesture.waveMinSwings) {
      wavePeaks = 0;
      waveHistory = [];
      lastWaveDir = null;
      return true;
    }
    return false;
  }

  // ── Main Update ──────────────────────────────────────────────────────────────

  function update(results) {
    const g = STATE.gestures;

    // Reset every frame
    g.leftFist       = false;
    g.rightFist      = false;
    g.rightPointing  = false;
    g.rightWaving    = false;
    g.thumbsUp       = false;
    g.thumbsDown     = false;
    g.bothOpen       = false;
    g.bothOpenDist   = 0;

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

    const t = performance.now();
    let leftLm  = null;
    let rightLm = null;

    results.multiHandLandmarks.forEach((lm, i) => {
      // MediaPipe mirrors labels: "Left" in feed = user's right hand
      const label = results.multiHandedness[i].label;
      if (label === 'Left')  rightLm = lm;
      if (label === 'Right') leftLm  = lm;
    });

    // ── Left hand ────────────────────────────────────────────────────────────
    if (leftLm) {
      g.leftFist = isFist(leftLm);
    }

    // ── Right hand ───────────────────────────────────────────────────────────
    if (rightLm) {
      g.rightFist = isFist(rightLm);

      if (isPointing(rightLm)) {
        g.rightPointing = true;
        g.pointX = rightLm[8].x;
        g.pointY = rightLm[8].y;
      }

      if (isOpenPalm(rightLm)) {
        g.rightWaving = updateWave(rightLm[0].x, t);
      }

      // Thumbs up/down — right hand only
      if (isThumbsUp(rightLm))   g.thumbsUp   = true;
      if (isThumbsDown(rightLm)) g.thumbsDown = true;
    }

    // ── Both hands open → distance controls scale ─────────────────────────
    if (leftLm && rightLm) {
      const lo = isOpenPalm(leftLm);
      const ro = isOpenPalm(rightLm);
      if (lo && ro) {
        g.bothOpen = true;
        const d = dist(leftLm[0], rightLm[0]);
        g.bothOpenDist = Math.min(Math.max((d - 0.1) / 0.8, 0), 1);
      }
    }
  }

  return { update };
})();
