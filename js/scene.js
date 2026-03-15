// ─── SCENE ────────────────────────────────────────────────────────────────────

const SceneModule = (() => {
  let renderer, scene, camera;
  let mainMesh, wireMesh;
  let particles = [];
  let ambientParticles = [];
  let clock;
  let targetScale = 1;
  let currentScale = 1;
  let rotVelX = 0, rotVelY = 0;
  let morphProgress = 0;
  let isMorphing = false;
  let morphFromGeo = null;
  let morphToGeo   = null;
  let pointRotating = false;
  let pointLastX = 0;

  // ── Material definitions ────────────────────────────────────────────────────

  function makeMaterial(type, color) {
    switch (type) {
      case 'arcane':
        return new THREE.MeshPhongMaterial({
          color,
          emissive: new THREE.Color(color).multiplyScalar(0.3),
          shininess: 120,
          transparent: true,
          opacity: 0.92,
        });
      case 'holographic':
        return new THREE.MeshPhongMaterial({
          color,
          emissive: new THREE.Color(color).multiplyScalar(0.5),
          wireframe: false,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        });
      case 'obsidian':
        return new THREE.MeshStandardMaterial({
          color,
          metalness: 0.9,
          roughness: 0.15,
        });
      case 'crystal':
        return new THREE.MeshPhongMaterial({
          color,
          specular: 0xffffff,
          shininess: 200,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide,
        });
      case 'ember':
        return new THREE.MeshStandardMaterial({
          color,
          emissive: new THREE.Color(color),
          emissiveIntensity: 0.6,
          metalness: 0.3,
          roughness: 0.5,
        });
      default:
        return new THREE.MeshPhongMaterial({ color });
    }
  }

  function makeWire(color) {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(1.8),
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
  }

  // ── Geometry factory ────────────────────────────────────────────────────────

  function makeGeometry(name) {
    switch (name) {
      case 'Sphere':        return new THREE.SphereGeometry(1.0, 48, 48);
      case 'Box':           return new THREE.BoxGeometry(1.4, 1.4, 1.4);
      case 'Icosahedron':   return new THREE.IcosahedronGeometry(1.0, 1);
      case 'Dodecahedron':  return new THREE.DodecahedronGeometry(1.0, 0);
      case 'Octahedron':    return new THREE.OctahedronGeometry(1.1, 0);
      case 'Tetrahedron':   return new THREE.TetrahedronGeometry(1.2, 0);
      case 'Torus':         return new THREE.TorusGeometry(0.8, 0.35, 32, 80);
      case 'Cone':          return new THREE.ConeGeometry(0.85, 1.8, 32);
      case 'Cylinder':      return new THREE.CylinderGeometry(0.7, 0.7, 1.6, 32);
      default:              return new THREE.SphereGeometry(1.0, 48, 48);
    }
  }

  // ── Particle burst ──────────────────────────────────────────────────────────

  function spawnExplosion(color) {
    const count = CONFIG.particles.count;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const speed = 0.04 + Math.random() * 0.12;
      velocities.push(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed,
      );
      positions[i*3] = positions[i*3+1] = positions[i*3+2] = 0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size: 0.055,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    const born = performance.now();
    particles.push({ pts, velocities, born, positions });
  }

  function updateParticles() {
    const now = performance.now();
    particles = particles.filter(p => {
      const age = now - p.born;
      const life = CONFIG.particles.lifeMs;
      if (age > life) { scene.remove(p.pts); return false; }

      const t = age / life;
      p.pts.material.opacity = 1 - t;
      const pos = p.pts.geometry.attributes.position.array;
      const n = pos.length / 3;
      for (let i = 0; i < n; i++) {
        pos[i*3]   += p.velocities[i*3];
        pos[i*3+1] += p.velocities[i*3+1];
        pos[i*3+2] += p.velocities[i*3+2];
        p.velocities[i*3+1] -= 0.0008; // faint gravity
      }
      p.pts.geometry.attributes.position.needsUpdate = true;
      return true;
    });
  }

  // Ambient floating sparkles
  function buildAmbientParticles() {
    const count = 300;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 18;
      pos[i*3+1] = (Math.random() - 0.5) * 12;
      pos[i*3+2] = (Math.random() - 0.5) * 8 - 3;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xff00ff,
      size: 0.022,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return pts;
  }

  // ── Morph (lerp vertex positions) ───────────────────────────────────────────

  function startMorph(newShapeIndex) {
    if (isMorphing) return;
    const fromName = CONFIG.shapes[STATE.shapeIndex];
    const toName   = CONFIG.shapes[newShapeIndex];

    morphFromGeo = makeGeometry(fromName);
    morphToGeo   = makeGeometry(toName);

    // Normalise vertex count by sampling
    isMorphing = true;
    morphProgress = 0;
    STATE.morphing = true;
  }

  function updateMorph(dt) {
    if (!isMorphing) return;
    morphProgress += dt / CONFIG.animation.morphDuration;
    if (morphProgress >= 1) {
      morphProgress = 1;
      isMorphing = false;
      STATE.morphing = false;
      morphFromGeo = null;
      morphToGeo   = null;
    }
    // Ease in-out
    const t = morphProgress < 0.5
      ? 2 * morphProgress * morphProgress
      : -1 + (4 - 2 * morphProgress) * morphProgress;

    // Swap geometry directly for a clean pop when done — lerping full vertex
    // buffers is complex without equal vertex counts, so we scale + fade trick:
    mainMesh.scale.setScalar(currentScale * (1 - Math.abs(t - 0.5) * 0.3));
    if (morphProgress === 1) {
      const geo = makeGeometry(CONFIG.shapes[STATE.shapeIndex]);
      mainMesh.geometry.dispose();
      mainMesh.geometry = geo;
      wireMesh.geometry.dispose();
      wireMesh.geometry = geo.clone();
      mainMesh.scale.setScalar(currentScale);
    }
  }

  // ── Init ────────────────────────────────────────────────────────────────────

  function init() {
    const canvas = document.getElementById('three-canvas');
    const w = window.innerWidth, h = window.innerHeight;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    camera.position.z = 4.5;

    // Lighting — neon palette
    const ambient = new THREE.AmbientLight(0x110022, 0.8);
    scene.add(ambient);

    const point1 = new THREE.PointLight(0xff00ff, 3.0, 20); // magenta key
    point1.position.set(3, 3, 3);
    scene.add(point1);

    const point2 = new THREE.PointLight(0x00ffff, 2.2, 20); // cyan fill
    point2.position.set(-3, -2, 2);
    scene.add(point2);

    const point3 = new THREE.PointLight(0x00ff66, 1.2, 15); // green rim
    point3.position.set(0, -3, -2);
    scene.add(point3);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // Main object
    const geo = makeGeometry(CONFIG.shapes[STATE.shapeIndex]);
    const mat = makeMaterial(CONFIG.materials[STATE.materialIndex], STATE.color);
    mainMesh = new THREE.Mesh(geo, mat);
    scene.add(mainMesh);

    // Wireframe overlay
    const wireMat = makeWire(STATE.color);
    wireMesh = new THREE.Mesh(geo.clone(), wireMat);
    scene.add(wireMesh);

    // Ambient sparkles
    const ap = buildAmbientParticles();
    ambientParticles.push(ap);

    clock = new THREE.Clock();
    animate();
  }

  // ── Apply gesture results ────────────────────────────────────────────────────

  function applyGestures() {
    const g = STATE.gestures;
    const now = performance.now();
    const cd = CONFIG.gesture.cooldownMs;

    // Left fist → cycle shape
    if (g.leftFist && now - STATE.lastShapeChange > cd) {
      STATE.lastShapeChange = now;
      const prev = STATE.shapeIndex;
      STATE.shapeIndex = (STATE.shapeIndex + 1) % CONFIG.shapes.length;
      startMorph(prev);
      flashGesture('✦ ' + CONFIG.shapes[STATE.shapeIndex]);
      showShapeToast(CONFIG.shapes[STATE.shapeIndex]);
    }

    // Right fist → randomise color
    if (g.rightFist && now - STATE.lastColorChange > cd) {
      STATE.lastColorChange = now;
      STATE.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      updateColor();
      flashGesture('✦ Color shift');
    }

    // Right wave → explosion
    if (g.rightWaving && now - STATE.lastExplosion > 1500) {
      STATE.lastExplosion = now;
      spawnExplosion(STATE.color);
      pulseMainMesh();
      flashGesture('✦ Burst!');
    }

    // 👍 Thumbs up → grow
    if (g.thumbsUp) {
      targetScale = Math.min(targetScale + 0.012, 3.0);
      if (now - STATE.lastScaleFlash > 800) { flashGesture('✦ Grow'); STATE.lastScaleFlash = now; }
    }

    // 👎 Thumbs down → shrink
    if (g.thumbsDown) {
      targetScale = Math.max(targetScale - 0.012, 0.2);
      if (now - STATE.lastScaleFlash > 800) { flashGesture('✦ Shrink'); STATE.lastScaleFlash = now; }
    }

    // Both open palms → distance controls scale
    if (g.bothOpen) {
      targetScale = 0.3 + g.bothOpenDist * 2.8;
      if (now - STATE.lastScaleFlash > 1000) { flashGesture('✦ Scale'); STATE.lastScaleFlash = now; }
    }

    // Right point → rotate
    if (g.rightPointing) {
      const dx = g.pointX - pointLastX;
      if (pointRotating) rotVelY += dx * 8;
      pointLastX = g.pointX;
      pointRotating = true;
    } else {
      pointRotating = false;
    }
  }

  function updateColor() {
    if (mainMesh) {
      mainMesh.material.color.setHex(STATE.color);
      if (mainMesh.material.emissive) {
        mainMesh.material.emissive.setHex(STATE.color);
        mainMesh.material.emissive.multiplyScalar(0.3);
      }
      wireMesh.material.color.setHex(STATE.color);
    }
  }

  function updateMaterialType() {
    if (mainMesh) {
      mainMesh.material.dispose();
      mainMesh.material = makeMaterial(CONFIG.materials[STATE.materialIndex], STATE.color);
    }
  }

  let pulsing = false;
  function pulseMainMesh() {
    if (pulsing) return;
    pulsing = true;
    let t = 0;
    const interval = setInterval(() => {
      t += 0.05;
      mainMesh.scale.setScalar(currentScale * (1 + Math.sin(t * Math.PI) * 0.35));
      if (t >= 1) { clearInterval(interval); pulsing = false; }
    }, 16);
  }

  // ── Animation loop ──────────────────────────────────────────────────────────

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta() * 1000; // ms
    const elapsed = clock.getElapsedTime();

    applyGestures();

    // Smooth scale
    currentScale += (targetScale - currentScale) * 0.07;
    if (!isMorphing) {
      mainMesh.scale.setScalar(currentScale);
      wireMesh.scale.setScalar(currentScale);
    }

    // Rotation inertia
    rotVelX *= 0.94;
    rotVelY *= 0.94;
    rotVelX += CONFIG.animation.baseRotationSpeed;

    mainMesh.rotation.x += rotVelX;
    mainMesh.rotation.y += rotVelY;
    wireMesh.rotation.x = mainMesh.rotation.x;
    wireMesh.rotation.y = mainMesh.rotation.y;

    // Float
    const floatY = Math.sin(elapsed * CONFIG.animation.floatFrequency * 1000) * CONFIG.animation.floatAmplitude;
    mainMesh.position.y = floatY;
    wireMesh.position.y = floatY;

    // Morph
    if (isMorphing) updateMorph(dt);

    // Particles
    updateParticles();

    // Ambient sparkle drift
    if (ambientParticles[0]) {
      ambientParticles[0].rotation.y += 0.0003;
      ambientParticles[0].rotation.x += 0.0001;
    }

    renderer.render(scene, camera);
  }

  function onResize(w, h) {
    if (!camera || !renderer) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  // ── UI helpers ──────────────────────────────────────────────────────────────

  function flashGesture(text) {
    const el = document.getElementById('gesture-flash');
    if (!el) return;
    el.textContent = text;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  function showShapeToast(name) {
    const el = document.getElementById('shape-toast');
    if (!el) return;
    el.textContent = name;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  return { init, onResize };
})();
