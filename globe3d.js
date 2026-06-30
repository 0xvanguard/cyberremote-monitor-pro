// ═══════════════════════════════════════════════════════════
//  CyberRemote Monitor — Globe 3D · Space View
//  Three.js r134 · Real Earth texture + reliable drag + pause
//  v3.1 — drag-to-rotate, click stops autorotate, pause/resume
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  const TEX = {
    day:      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    bump:     'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
    specular: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
    night:    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.png',
    clouds:   'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
  };

  let scene, camera, renderer, globe, cloudMesh, atmoMesh, starField;
  let dotGroup, glowGroup;
  let autoRotate  = true;   // starts rotating, user can pause
  let showAtmo    = true;
  let globeInited = false;
  const RADIUS    = 1.0;
  const GLOBE_H   = 640;

  // ─ Spherical camera state ────────────────────────────
  let sph    = { theta: 0, phi: Math.PI / 2 };  // current angle
  let camDist = 2.6;

  // ─ Drag state ───────────────────────────────────────
  let pointerDown  = false;   // pointer is pressed
  let dragged      = false;   // moved enough to be a drag (not a click)
  let lastPt       = { x: 0, y: 0 };
  let velX = 0, velY = 0;     // inertia velocity

  let dots = [];
  let activeFilters = {
    region: 'all', tier: 'all',
    scoreMin: 0, scoreMax: 100,
    entryFast: false, modality: 'all'
  };

  // ─ Helpers ──────────────────────────────────────
  function heatColor(i) {
    if (i >= 90) return 0x16a34a; if (i >= 75) return 0x4ade80;
    if (i >= 60) return 0xf59e0b; if (i >= 45) return 0x0ea5e9;
    if (i >= 25) return 0x6366f1; return 0x334155;
  }
  function latLngToVec3(lat, lng, r) {
    const phi   = (90 - lat)  * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }
  function getW(c) {
    return c.clientWidth || c.offsetWidth ||
           (c.parentElement ? c.parentElement.clientWidth : 0) || 800;
  }
  function clampPhi(v) { return Math.max(0.08, Math.min(Math.PI - 0.08, v)); }
  function updateCamera() {
    camera.position.set(
      camDist * Math.sin(sph.phi) * Math.cos(sph.theta),
      camDist * Math.cos(sph.phi),
      camDist * Math.sin(sph.phi) * Math.sin(sph.theta)
    );
    camera.lookAt(0, 0, 0);
  }
  function setAutoRotateBtn(on) {
    const btn = document.getElementById('btnAutoRotate');
    if (btn) {
      btn.textContent = on ? '⟳ Auto-rotar' : '⏸ Pausado';
      btn.classList.toggle('active', on);
    }
  }

  // ─ Filters ──────────────────────────────────────
  function passesFilter(code, d) {
    if (activeFilters.region !== 'all' && d.region !== activeFilters.region) return false;
    if (activeFilters.tier   !== 'all' && d.tier   !== parseInt(activeFilters.tier)) return false;
    if (d.intensity < activeFilters.scoreMin || d.intensity > activeFilters.scoreMax) return false;
    if (activeFilters.entryFast && !d.fastEntry) return false;
    if (activeFilters.modality === 'jobs'      && !(d.jobs      > 0)) return false;
    if (activeFilters.modality === 'freelance' && !(d.freelance > 0)) return false;
    if (activeFilters.modality === 'contract'  && !(d.contract  > 0)) return false;
    return true;
  }
  function applyFilters() {
    dots.forEach(({ mesh, glowMesh, ringMesh, code }) => {
      const vis = passesFilter(code, mesh.userData.d);
      mesh.visible = vis;
      if (glowMesh) glowMesh.visible = vis;
      if (ringMesh) ringMesh.visible = vis;
    });
  }

  // ─ Texture helpers ──────────────────────────────
  function makeFallbackTex() {
    const c = document.createElement('canvas');
    c.width = 4; c.height = 4;
    c.getContext('2d').fillStyle = '#0a1e3a';
    c.getContext('2d').fillRect(0, 0, 4, 4);
    return new THREE.CanvasTexture(c);
  }
  function loadTex(url, onLoad) {
    const ldr = new THREE.TextureLoader();
    ldr.crossOrigin = 'anonymous';
    ldr.load(url, onLoad, undefined, () => {});
  }

  // ─ Earth layers ─────────────────────────────────
  function buildEarth() {
    const mat = new THREE.MeshPhongMaterial({
      color: 0x1a3a5c, emissive: 0x050e1a, shininess: 25,
      specular: new THREE.Color(0x226688)
    });
    globe = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, 64, 64), mat);
    scene.add(globe);

    loadTex(TEX.day, tx => { tx.anisotropy = renderer.capabilities.getMaxAnisotropy(); mat.map = tx; mat.needsUpdate = true; });
    loadTex(TEX.bump,     tx => { mat.bumpMap = tx; mat.bumpScale = 0.015; mat.needsUpdate = true; });
    loadTex(TEX.specular, tx => { mat.specularMap = tx; mat.shininess = 42; mat.needsUpdate = true; });

    loadTex(TEX.night, tx => {
      scene.add(new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS + 0.001, 64, 64),
        new THREE.MeshBasicMaterial({ map: tx, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.55, depthWrite: false })
      ));
    });
    loadTex(TEX.clouds, tx => {
      cloudMesh = new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS + 0.008, 64, 64),
        new THREE.MeshPhongMaterial({ map: tx, transparent: true, opacity: 0.28, depthWrite: false })
      );
      scene.add(cloudMesh);
    });
  }

  // ─ Scene ─────────────────────────────────────────
  function buildScene(canvas) {
    const W = getW(canvas), H = GLOBE_H;
    canvas.width = W; canvas.height = H;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x020817, 1);

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    updateCamera();

    scene.add(new THREE.AmbientLight(0x111a26, 2.0));
    const sun  = new THREE.DirectionalLight(0xfff5e0, 4.0); sun.position.set(5, 3, 5);   scene.add(sun);
    const fill = new THREE.DirectionalLight(0x2266aa, 0.8); fill.position.set(-4, -2, -3); scene.add(fill);

    // Stars
    const N = 3000, sp = new Float32Array(N*3), sc = new Float32Array(N*3);
    for (let i = 0; i < N; i++) {
      const r = 20 + Math.random()*40, t = Math.random()*Math.PI*2, p = Math.acos(2*Math.random()-1);
      sp[i*3]=r*Math.sin(p)*Math.cos(t); sp[i*3+1]=r*Math.cos(p); sp[i*3+2]=r*Math.sin(p)*Math.sin(t);
      const v=Math.random(); sc[i*3]=.7+v*.3; sc[i*3+1]=.75+v*.25; sc[i*3+2]=.9+v*.1;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp,3));
    sg.setAttribute('color',    new THREE.BufferAttribute(sc,3));
    starField = new THREE.Points(sg, new THREE.PointsMaterial({ size:.04, vertexColors:true, transparent:true, opacity:.9 }));
    scene.add(starField);

    buildEarth();

    // Subtle grid
    const gm = new THREE.LineBasicMaterial({ color: 0x1e4060, transparent:true, opacity:.10 });
    for (let lat=-80; lat<=80; lat+=20) {
      const pts=[]; for (let lng=0; lng<=360; lng+=4) pts.push(latLngToVec3(lat,lng-180,RADIUS+.003));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gm));
    }
    for (let lng=0; lng<360; lng+=30) {
      const pts=[]; for (let lat=-90; lat<=90; lat+=3) pts.push(latLngToVec3(lat,lng-180,RADIUS+.003));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gm));
    }

    // Atmosphere
    atmoMesh = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS*1.09, 64, 64),
      new THREE.MeshPhongMaterial({ color:0x4fc3f7, emissive:0x062040, transparent:true, opacity:.10, side:THREE.FrontSide, depthWrite:false })
    ); scene.add(atmoMesh);
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS*1.18, 64, 64),
      new THREE.MeshPhongMaterial({ color:0x0284c7, emissive:0x010a14, transparent:true, opacity:.04, side:THREE.BackSide, depthWrite:false })
    ));

    dotGroup  = new THREE.Group(); scene.add(dotGroup);
    glowGroup = new THREE.Group(); scene.add(glowGroup);
  }

  // ─ Dots ──────────────────────────────────────────
  function buildDots(dataset) {
    dotGroup.clear(); glowGroup.clear(); dots = [];
    Object.entries(dataset).forEach(([code, d]) => {
      if (!d.latlng) return;
      const [lat, lng] = d.latlng;
      const pos  = latLngToVec3(lat, lng, RADIUS + 0.014);
      const col  = heatColor(d.intensity);
      const size = 0.013 + (d.intensity / 100) * 0.022;

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, 10, 10),
        new THREE.MeshPhongMaterial({ color:col, emissive:col, emissiveIntensity:.7, shininess:90 })
      );
      mesh.position.copy(pos); mesh.userData = { code, d }; dotGroup.add(mesh);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(size*2.6, 10, 10),
        new THREE.MeshBasicMaterial({ color:col, transparent:true, opacity:.20, depthWrite:false })
      );
      glow.position.copy(pos); glowGroup.add(glow);

      let ring = null;
      if (d.fastEntry) {
        ring = new THREE.Mesh(
          new THREE.RingGeometry(size*2.2, size*2.8, 24),
          new THREE.MeshBasicMaterial({ color:0xf59e0b, transparent:true, opacity:.55, side:THREE.DoubleSide, depthWrite:false })
        );
        ring.position.copy(pos); ring.lookAt(new THREE.Vector3(0,0,0));
        ring.userData.isPulse = true; glowGroup.add(ring);
      }
      dots.push({ mesh, glowMesh: glow, ringMesh: ring, code });
    });
    applyFilters();
  }

  // ─ Raycasting ─────────────────────────────────
  function doRaycast(clientX, clientY) {
    const canvas = renderer.domElement;
    const rect   = canvas.getBoundingClientRect();
    const mouse  = new THREE.Vector2(
      ((clientX - rect.left) / rect.width)  *  2 - 1,
      ((clientY - rect.top)  / rect.height) * -2 + 1
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(dots.filter(d => d.mesh.visible).map(d => d.mesh));
    if (hits.length) {
      const { code } = hits[0].object.userData;
      if (typeof window.updateCountryPanel === 'function') window.updateCountryPanel(code);
      const mat = hits[0].object.material;
      const orig = mat.emissiveIntensity;
      mat.emissiveIntensity = 2.5;
      setTimeout(() => { mat.emissiveIntensity = orig; }, 350);
    }
  }

  // ───────────────────────────────────────────
  //  POINTER EVENTS  —  unified mouse + touch
  //
  //  Rules:
  //  1. pointerdown → record start position
  //  2. pointermove  → if moved > DRAG_THRESHOLD px ⇒ dragged=true, rotate globe, stop autorotate
  //  3. pointerup    → if NOT dragged ⇒ raycast (click on country)
  //                    apply inertia
  // ───────────────────────────────────────────
  const DRAG_THRESHOLD = 4; // px

  function onPointerDown(e) {
    e.preventDefault();
    pointerDown = true;
    dragged     = false;
    velX = velY = 0;
    const pt = getPoint(e);
    lastPt = { x: pt.x, y: pt.y };
  }

  function onPointerMove(e) {
    if (!pointerDown) return;
    e.preventDefault();
    const pt = getPoint(e);
    const dx = pt.x - lastPt.x;
    const dy = pt.y - lastPt.y;

    if (!dragged && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      dragged = true;
    }
    if (dragged) {
      sph.theta += dx * 0.006;
      sph.phi    = clampPhi(sph.phi - dy * 0.006);
      velX = dx * 0.006;
      velY = dy * 0.006;
      updateCamera();
    }
    lastPt = { x: pt.x, y: pt.y };
  }

  function onPointerUp(e) {
    if (!pointerDown) return;
    pointerDown = false;
    if (!dragged) {
      // It was a tap/click — raycast
      const pt = getPoint(e);
      doRaycast(pt.x, pt.y);
    }
    // dragged — inertia handled in animate loop
  }

  function onPointerLeave() {
    pointerDown = false;
  }

  // Returns {x,y} in page coords for both mouse and touch
  function getPoint(e) {
    if (e.touches && e.touches.length > 0)
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches.length > 0)
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  // Pinch-to-zoom (touch only)
  let lastPinchDist = 0;
  function onTouchStart(e) {
    if (e.touches.length === 2) {
      lastPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }
  function onTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      camDist = Math.max(1.5, Math.min(5.5, camDist - (d - lastPinchDist) * 0.008));
      updateCamera(); lastPinchDist = d;
    }
  }

  function onWheel(e) {
    e.preventDefault();
    camDist = Math.max(1.5, Math.min(5.5, camDist + e.deltaY * 0.003));
    updateCamera();
  }

  // ─ Animate ───────────────────────────────────────
  const clock = { t: 0 };
  const INERTIA = 0.92;

  function animate() {
    requestAnimationFrame(animate);
    clock.t += 0.01;

    if (autoRotate && !pointerDown) {
      sph.theta += 0.0015;
      updateCamera();
    } else if (!pointerDown && (Math.abs(velX) > 0.0001 || Math.abs(velY) > 0.0001)) {
      // Inertia after drag release
      sph.theta += velX;
      sph.phi    = clampPhi(sph.phi - velY);
      velX *= INERTIA;
      velY *= INERTIA;
      updateCamera();
    }

    // Pulse rings
    glowGroup.children.forEach(m => {
      if (m.userData && m.userData.isPulse) {
        const s = 1 + 0.28 * Math.sin(clock.t*2.5 + m.position.x*5);
        m.scale.setScalar(s);
        m.material.opacity = 0.28 + 0.22 * Math.sin(clock.t*3);
      }
    });
    if (cloudMesh) cloudMesh.rotation.y += 0.00012;
    if (starField)  starField.rotation.y += 0.00007;
    renderer.render(scene, camera);
  }

  // ─ Resize ───────────────────────────────────────
  window.resizeGlobe = function () {
    if (!renderer) return;
    const cv = renderer.domElement;
    const W  = getW(cv), H = GLOBE_H;
    cv.width = W; cv.height = H;
    cv.style.width = W+'px'; cv.style.height = H+'px';
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', () => { if (renderer) window.resizeGlobe(); });

  // ─ Public controls ────────────────────────────
  window.toggleAutoRotate = function () {
    autoRotate = !autoRotate;
    setAutoRotateBtn(autoRotate);
  };
  window.resetGlobeView = function () {
    sph = { theta: 0, phi: Math.PI/2 }; camDist = 2.6;
    velX = velY = 0; updateCamera();
  };
  window.toggleAtmosphere = function () {
    showAtmo = !showAtmo;
    if (atmoMesh) atmoMesh.visible = showAtmo;
    const btn = document.getElementById('btnAtmo');
    if (btn) btn.classList.toggle('active', showAtmo);
  };
  window.setGlobeFilter = function (key, value) {
    if (key === 'entryFast') activeFilters.entryFast = (value === true || value === 'true');
    else activeFilters[key] = value;
    applyFilters();
  };
  window.resetGlobeFilters = function () {
    activeFilters = { region:'all', tier:'all', scoreMin:0, scoreMax:100, entryFast:false, modality:'all' };
    applyFilters();
  };

  // ─ Init ─────────────────────────────────────────
  window.initGlobe = function () {
    if (globeInited) return;
    const canvas = document.getElementById('globeCanvas');
    if (!canvas || typeof THREE === 'undefined') return;
    globeInited = true;

    buildScene(canvas);

    // Unified pointer events (mouse + touch drag handled through onPointerDown/Move/Up)
    canvas.addEventListener('mousedown',  onPointerDown, { passive: false });
    canvas.addEventListener('mousemove',  onPointerMove, { passive: false });
    canvas.addEventListener('mouseup',    onPointerUp,   { passive: false });
    canvas.addEventListener('mouseleave', onPointerLeave);
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    canvas.addEventListener('touchmove',  onPointerMove, { passive: false });
    canvas.addEventListener('touchend',   onPointerUp,   { passive: false });
    // Extra touch listeners for pinch-zoom
    canvas.addEventListener('touchstart', onTouchStart,  { passive: true });
    canvas.addEventListener('touchmove',  onTouchMove,   { passive: false });
    canvas.addEventListener('wheel',      onWheel,       { passive: false });

    setAutoRotateBtn(autoRotate);

    function waitForDataset(tries) {
      if (window.dataset && Object.keys(window.dataset).length > 0) {
        buildDots(window.dataset);
        animate();
        const first = Object.entries(window.dataset)
          .sort((a, b) => b[1].intensity - a[1].intensity)[0];
        if (first && typeof window.updateCountryPanel === 'function')
          window.updateCountryPanel(first[0]);
      } else if (tries > 0) {
        setTimeout(() => waitForDataset(tries - 1), 300);
      }
    }
    waitForDataset(30);
  };

  window.applyFilters  = applyFilters;
  window.activeFilters = activeFilters;

})();
