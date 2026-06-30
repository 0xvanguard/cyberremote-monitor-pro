// ═══════════════════════════════════════════════════════════
//  CyberRemote Monitor — Globe 3D · Space View
//  Three.js r134 · Real Earth texture (NASA Blue Marble)
//  v3.0 — Real world map: diffuse + bump + specular + night lights
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Texture URLs (all free / public domain CDNs) ──────────
  // Primary: unpkg-hosted three.js examples pack
  // Fallback A: raw GitHub three.js repo
  // Fallback B: plain blue-ocean solid color generated via canvas
  const TEX = {
    day:      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    bump:     'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
    specular: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
    night:    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.png',
    clouds:   'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
  };

  let scene, camera, renderer, globe, cloudMesh, atmoMesh, starField;
  let dotGroup, glowGroup;
  let autoRotate  = true;
  let showAtmo    = true;
  let isDragging  = false;
  let prevMouse   = { x: 0, y: 0 };
  let spherical   = { theta: 0, phi: Math.PI / 2 };
  let camDist     = 2.6;
  let dots        = [];
  let globeInited = false;
  const RADIUS    = 1.0;
  const GLOBE_H   = 640;

  let activeFilters = {
    region: 'all', tier: 'all',
    scoreMin: 0, scoreMax: 100,
    entryFast: false, modality: 'all'
  };

  // ── Helpers ─────────────────────────────────────────
  function heatColor(i) {
    if (i >= 90) return 0x16a34a; if (i >= 75) return 0x4ade80;
    if (i >= 60) return 0xf59e0b; if (i >= 45) return 0x0ea5e9;
    if (i >= 25) return 0x6366f1; return 0x334155;
  }
  function latLngToVec3(lat, lng, r) {
    const phi   = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }
  function getCanvasWidth(c) {
    return c.clientWidth || c.offsetWidth ||
           (c.parentElement ? c.parentElement.clientWidth : 0) || 800;
  }

  // ── Filters ─────────────────────────────────────
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

  // ── Fallback solid-color texture when CDN fails ───────
  function makeFallbackTexture() {
    const c = document.createElement('canvas');
    c.width = 4; c.height = 4;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0a1e3a'; ctx.fillRect(0, 0, 4, 4);
    return new THREE.CanvasTexture(c);
  }

  // ── Load texture with CORS + fallback ────────────────
  function loadTex(url, onLoad, onErr) {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(url, onLoad, undefined, onErr || (() => {}));
  }

  // ── Build Earth globe with textures ─────────────────
  function buildEarth() {
    const geo = new THREE.SphereGeometry(RADIUS, 64, 64);

    // Start with fallback material while textures load
    const mat = new THREE.MeshPhongMaterial({
      color:      0x1a3a5c,
      emissive:   0x050e1a,
      shininess:  25,
      specular:   new THREE.Color(0x226688)
    });
    globe = new THREE.Mesh(geo, mat);
    scene.add(globe);

    // Day texture (continents visible)
    loadTex(TEX.day, (tex) => {
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      mat.map = tex;
      mat.needsUpdate = true;
    }, () => { mat.map = makeFallbackTexture(); mat.needsUpdate = true; });

    // Bump map — gives 3D relief to mountains
    loadTex(TEX.bump, (tex) => {
      mat.bumpMap = tex; mat.bumpScale = 0.015; mat.needsUpdate = true;
    });

    // Specular map — oceans shine, land is matte
    loadTex(TEX.specular, (tex) => {
      mat.specularMap = tex; mat.shininess = 40; mat.needsUpdate = true;
    });

    // Night-lights layer (emissive, visible on dark side)
    loadTex(TEX.night, (nightTex) => {
      const nightMat = new THREE.MeshBasicMaterial({
        map: nightTex, blending: THREE.AdditiveBlending,
        transparent: true, opacity: 0.55, depthWrite: false
      });
      const nightMesh = new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS + 0.001, 64, 64), nightMat
      );
      scene.add(nightMesh);
    });

    // Cloud layer
    loadTex(TEX.clouds, (cloudTex) => {
      const cloudMat = new THREE.MeshPhongMaterial({
        map: cloudTex, transparent: true, opacity: 0.28, depthWrite: false
      });
      cloudMesh = new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS + 0.008, 64, 64), cloudMat
      );
      scene.add(cloudMesh);
    });
  }

  // ── Scene builder ────────────────────────────────
  function buildScene(canvas) {
    const W = getCanvasWidth(canvas);
    const H = GLOBE_H;
    canvas.width  = W; canvas.height = H;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x020817, 1);

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    updateCameraPos();

    // Lights — sun-like with soft blue fill
    scene.add(new THREE.AmbientLight(0x111a26, 2.0));
    const sun = new THREE.DirectionalLight(0xfff5e0, 4.0);
    sun.position.set(5, 3, 5); scene.add(sun);
    const fill = new THREE.DirectionalLight(0x2266aa, 0.8);
    fill.position.set(-4, -2, -3); scene.add(fill);

    // Stars
    const sc = 3000, sp = new Float32Array(sc * 3), sco = new Float32Array(sc * 3);
    for (let i = 0; i < sc; i++) {
      const r = 20 + Math.random() * 40, t = Math.random() * Math.PI * 2,
            p = Math.acos(2 * Math.random() - 1);
      sp[i*3]   = r*Math.sin(p)*Math.cos(t);
      sp[i*3+1] = r*Math.cos(p);
      sp[i*3+2] = r*Math.sin(p)*Math.sin(t);
      const v = Math.random();
      sco[i*3]   = 0.7+v*0.3;
      sco[i*3+1] = 0.75+v*0.25;
      sco[i*3+2] = 0.9+v*0.1;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    sg.setAttribute('color',    new THREE.BufferAttribute(sco, 3));
    starField = new THREE.Points(sg, new THREE.PointsMaterial({
      size: .04, vertexColors: true, transparent: true, opacity: .9
    }));
    scene.add(starField);

    // Earth with real textures
    buildEarth();

    // Thin latitude / longitude grid (very subtle)
    const gm = new THREE.LineBasicMaterial({ color: 0x1e4060, transparent: true, opacity: 0.12 });
    for (let lat = -80; lat <= 80; lat += 20) {
      const pts = [];
      for (let lng = 0; lng <= 360; lng += 4) pts.push(latLngToVec3(lat, lng-180, RADIUS+0.003));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gm));
    }
    for (let lng = 0; lng < 360; lng += 30) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 3) pts.push(latLngToVec3(lat, lng-180, RADIUS+0.003));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gm));
    }

    // Atmosphere glow
    atmoMesh = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.09, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x4fc3f7, emissive: 0x062040,
        transparent: true, opacity: 0.10,
        side: THREE.FrontSide, depthWrite: false
      })
    );
    scene.add(atmoMesh);
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.18, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x0284c7, emissive: 0x010a14,
        transparent: true, opacity: 0.04,
        side: THREE.BackSide, depthWrite: false
      })
    ));

    dotGroup  = new THREE.Group(); scene.add(dotGroup);
    glowGroup = new THREE.Group(); scene.add(glowGroup);
  }

  // ── Dots (heatmap pins) ───────────────────────────
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
        new THREE.MeshPhongMaterial({
          color: col, emissive: col, emissiveIntensity: 0.7, shininess: 90
        })
      );
      mesh.position.copy(pos); mesh.userData = { code, d }; dotGroup.add(mesh);

      const glowMesh = new THREE.Mesh(
        new THREE.SphereGeometry(size * 2.6, 10, 10),
        new THREE.MeshBasicMaterial({
          color: col, transparent: true, opacity: 0.20, depthWrite: false
        })
      );
      glowMesh.position.copy(pos); glowGroup.add(glowMesh);

      let ringMesh = null;
      if (d.fastEntry) {
        ringMesh = new THREE.Mesh(
          new THREE.RingGeometry(size * 2.2, size * 2.8, 24),
          new THREE.MeshBasicMaterial({
            color: 0xf59e0b, transparent: true, opacity: 0.55,
            side: THREE.DoubleSide, depthWrite: false
          })
        );
        ringMesh.position.copy(pos);
        ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
        ringMesh.userData.isPulse = true;
        glowGroup.add(ringMesh);
      }
      dots.push({ mesh, glowMesh, ringMesh, code, lat, lng });
    });
    applyFilters();
  }

  // ── Camera ─────────────────────────────────────
  function updateCameraPos() {
    camera.position.set(
      camDist * Math.sin(spherical.phi) * Math.cos(spherical.theta),
      camDist * Math.cos(spherical.phi),
      camDist * Math.sin(spherical.phi) * Math.sin(spherical.theta)
    );
    camera.lookAt(0, 0, 0);
  }

  // ── Raycasting ────────────────────────────────
  function onCanvasClick(e) {
    if (isDragging) return;
    const canvas = renderer.domElement;
    const rect   = canvas.getBoundingClientRect();
    const mouse  = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width)  * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(dots.filter(d => d.mesh.visible).map(d => d.mesh));
    if (hits.length) {
      const { code } = hits[0].object.userData;
      if (typeof window.updateCountryPanel === 'function') window.updateCountryPanel(code);
      const mat  = hits[0].object.material;
      const orig = mat.emissiveIntensity;
      mat.emissiveIntensity = 2.5;
      setTimeout(() => { mat.emissiveIntensity = orig; }, 350);
    }
  }
  let clickStart = { x: 0, y: 0 };

  // ── Mouse / Touch ──────────────────────────────
  function onMouseDown(e) {
    isDragging = false;
    clickStart = { x: e.clientX, y: e.clientY };
    prevMouse  = { x: e.clientX, y: e.clientY };
  }
  function onMouseMove(e) {
    const dx = e.clientX - prevMouse.x, dy = e.clientY - prevMouse.y;
    if (Math.hypot(dx, dy) > 2) isDragging = true;
    if (!isDragging) return;
    spherical.phi   = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.005));
    spherical.theta += dx * 0.005;
    updateCameraPos(); prevMouse = { x: e.clientX, y: e.clientY };
  }
  function onMouseUp() { setTimeout(() => { isDragging = false; }, 50); }
  function onWheel(e) {
    camDist = Math.max(1.5, Math.min(5.5, camDist + e.deltaY * 0.003));
    updateCameraPos(); e.preventDefault();
  }
  let lastTD = 0;
  function onTouchStart(e) {
    if (e.touches.length === 1) {
      isDragging = false; prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.touches.length === 2) {
      lastTD = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                          e.touches[0].clientY - e.touches[1].clientY);
    }
  }
  function onTouchMove(e) {
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - prevMouse.x, dy = e.touches[0].clientY - prevMouse.y;
      if (Math.hypot(dx, dy) > 2) isDragging = true;
      spherical.phi   = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.005));
      spherical.theta += dx * 0.005;
      updateCameraPos(); prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                           e.touches[0].clientY - e.touches[1].clientY);
      camDist = Math.max(1.5, Math.min(5.5, camDist - (d - lastTD) * 0.008));
      updateCameraPos(); lastTD = d;
    }
    e.preventDefault();
  }
  function onTouchEnd() { setTimeout(() => { isDragging = false; }, 50); }

  // ── Animate loop ─────────────────────────────────
  const clock = { t: 0 };
  function animate() {
    requestAnimationFrame(animate);
    clock.t += 0.01;
    if (autoRotate && !isDragging) {
      spherical.theta += 0.0015;
      updateCameraPos();
    }
    // Pulse rings
    glowGroup.children.forEach(m => {
      if (m.userData && m.userData.isPulse) {
        const s = 1 + 0.28 * Math.sin(clock.t * 2.5 + m.position.x * 5);
        m.scale.setScalar(s);
        m.material.opacity = 0.28 + 0.22 * Math.sin(clock.t * 3);
      }
    });
    // Slow cloud rotation
    if (cloudMesh) cloudMesh.rotation.y += 0.00012;
    if (starField)  starField.rotation.y += 0.00007;
    renderer.render(scene, camera);
  }

  // ── Public: resize ────────────────────────────────
  window.resizeGlobe = function () {
    if (!renderer) return;
    const canvas = renderer.domElement;
    const W = getCanvasWidth(canvas), H = GLOBE_H;
    canvas.width = W; canvas.height = H;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', () => { if (renderer) window.resizeGlobe(); });

  // ── Public controls ────────────────────────────
  window.toggleAutoRotate = function () {
    autoRotate = !autoRotate;
    const btn = document.getElementById('btnAutoRotate');
    if (btn) btn.classList.toggle('active', autoRotate);
  };
  window.resetGlobeView = function () {
    spherical = { theta: 0, phi: Math.PI / 2 }; camDist = 2.6; updateCameraPos();
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
    activeFilters = { region: 'all', tier: 'all', scoreMin: 0, scoreMax: 100, entryFast: false, modality: 'all' };
    applyFilters();
  };

  // ── Init ───────────────────────────────────────
  window.initGlobe = function () {
    if (globeInited) return;
    const canvas = document.getElementById('globeCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    buildScene(canvas);

    canvas.addEventListener('mousedown',  onMouseDown);
    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('mouseup',    onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('click',      onCanvasClick);
    canvas.addEventListener('wheel',      onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd);

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
    globeInited = true;
  };

  window.applyFilters   = applyFilters;
  window.activeFilters  = activeFilters;

})();
