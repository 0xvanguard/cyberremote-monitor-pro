// ═══════════════════════════════════════════════════════════
//  CyberRemote Monitor — Globe 3D · Space View
//  Three.js r134 · WebGL globe with heatmap dots + atmosphere
// ═══════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ── State ──────────────────────────────────────────────
  let scene, camera, renderer, globe, atmoMesh, starField;
  let dotGroup, glowGroup;
  let autoRotate = true;
  let showAtmo = true;
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let rotVel = { x: 0, y: 0 };
  let spherical = { theta: 0, phi: Math.PI / 2 };
  let camDist = 2.6;
  let rafId = null;
  let dots = [];  // { mesh, code, lat, lng }
  const RADIUS = 1.0;

  // ── Color helper ──────────────────────────────────────
  function heatColor(intensity) {
    if (intensity >= 90) return 0x16a34a;
    if (intensity >= 75) return 0x4ade80;
    if (intensity >= 60) return 0xf59e0b;
    if (intensity >= 45) return 0x0ea5e9;
    return 0x1e3a5f;
  }

  function heatColorCSS(intensity) {
    if (intensity >= 90) return '#16a34a';
    if (intensity >= 75) return '#4ade80';
    if (intensity >= 60) return '#f59e0b';
    if (intensity >= 45) return '#0ea5e9';
    return '#1e3a5f';
  }

  // ── Lat/Lng → 3D position ─────────────────────────────
  function latLngToVec3(lat, lng, r) {
    const phi   = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  // ── Build scene ───────────────────────────────────────
  function buildScene(canvas) {
    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x020817, 1);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    updateCameraPos();

    // Lighting
    const ambient = new THREE.AmbientLight(0x1a2a3a, 2.5);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0x4488ff, 3.5);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x0ea5e9, 1.2);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    // ── Stars ──────────────────────────────────────────
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2800;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 18 + Math.random() * 32;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      starPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      starPos[i*3+1] = r * Math.cos(phi);
      starPos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
      const t = Math.random();
      starColors[i*3]   = 0.7 + t * 0.3;
      starColors[i*3+1] = 0.75 + t * 0.25;
      starColors[i*3+2] = 0.9 + t * 0.1;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color',    new THREE.BufferAttribute(starColors, 3));
    starField = new THREE.Points(starGeo, new THREE.PointsMaterial({
      size: 0.045, vertexColors: true, transparent: true, opacity: 0.85,
      sizeAttenuation: true
    }));
    scene.add(starField);

    // ── Globe sphere ──────────────────────────────────
    const globeGeo = new THREE.SphereGeometry(RADIUS, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x0a1628,
      emissive: 0x030c1a,
      shininess: 18,
      specular: 0x0ea5e9,
      transparent: false,
    });
    globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // ── Grid lines on globe (lat/lng lines) ───────────
    const gridMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.08 });
    for (let lat = -80; lat <= 80; lat += 20) {
      const pts = [];
      for (let lng = 0; lng <= 360; lng += 4) {
        pts.push(latLngToVec3(lat, lng - 180, RADIUS + 0.002));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      scene.add(new THREE.Line(geo, gridMat));
    }
    for (let lng = 0; lng < 360; lng += 20) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 3) {
        pts.push(latLngToVec3(lat, lng - 180, RADIUS + 0.002));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      scene.add(new THREE.Line(geo, gridMat));
    }

    // ── Atmosphere glow ──────────────────────────────
    const atmoGeo = new THREE.SphereGeometry(RADIUS * 1.085, 64, 64);
    const atmoMat = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      emissive: 0x062040,
      transparent: true,
      opacity: 0.13,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmoMesh);

    const coronaGeo = new THREE.SphereGeometry(RADIUS * 1.16, 64, 64);
    const coronaMat = new THREE.MeshPhongMaterial({
      color: 0x0284c7,
      emissive: 0x020c18,
      transparent: true,
      opacity: 0.045,
      side: THREE.BackSide,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(coronaGeo, coronaMat));

    // ── Dot groups ───────────────────────────────────
    dotGroup  = new THREE.Group();
    glowGroup = new THREE.Group();
    scene.add(dotGroup);
    scene.add(glowGroup);
  }

  // ── Build dots from dataset ──────────────────────────
  function buildDots(dataset) {
    dotGroup.clear();
    glowGroup.clear();
    dots = [];

    Object.entries(dataset).forEach(([code, d]) => {
      if (!d.latlng) return;
      const [lat, lng] = d.latlng;
      const pos = latLngToVec3(lat, lng, RADIUS + 0.012);
      const col = heatColor(d.intensity);

      const size = 0.012 + (d.intensity / 100) * 0.022;

      const geo = new THREE.SphereGeometry(size, 10, 10);
      const mat = new THREE.MeshPhongMaterial({
        color: col, emissive: col, emissiveIntensity: 0.6,
        shininess: 80, transparent: false
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData = { code, d };
      dotGroup.add(mesh);
      dots.push({ mesh, code, lat, lng });

      const glowGeo = new THREE.SphereGeometry(size * 2.4, 10, 10);
      const glowMat = new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0.18, depthWrite: false
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.copy(pos);
      glowGroup.add(glow);

      if (d.fastEntry) {
        const ringGeo = new THREE.RingGeometry(size * 2.2, size * 2.8, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b, transparent: true, opacity: 0.5,
          side: THREE.DoubleSide, depthWrite: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        ring.userData.isPulse = true;
        glowGroup.add(ring);
      }
    });
  }

  // ── Camera position from spherical ───────────────────
  function updateCameraPos() {
    camera.position.set(
      camDist * Math.sin(spherical.phi) * Math.cos(spherical.theta),
      camDist * Math.cos(spherical.phi),
      camDist * Math.sin(spherical.phi) * Math.sin(spherical.theta)
    );
    camera.lookAt(0, 0, 0);
  }

  // ── Raycasting for click ──────────────────────────────
  function onCanvasClick(event) {
    const canvas = renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width)  * 2 - 1,
      -((event.clientY - rect.top)  / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const meshes = dots.map(d => d.mesh);
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length > 0) {
      const { code, d } = hits[0].object.userData;
      showGlobePanel(code, d);
      const mat = hits[0].object.material;
      const orig = mat.emissiveIntensity;
      mat.emissiveIntensity = 2;
      setTimeout(() => { mat.emissiveIntensity = orig; }, 300);
    }
  }

  // ── Update side panel ─────────────────────────────────
  function showGlobePanel(code, d) {
    const col = heatColorCSS(d.intensity);
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const show = (id) => { const el = document.getElementById(id); if (el) el.style.display = ''; };

    set('globeCountryName', d.name + (d.fastEntry ? ' ⚡' : ''));
    set('globeCountryRegion', d.region + ' · ' + d.contractType);

    show('globeIntensityWrap');
    set('globeIntensityVal', d.intensity + ' / 100');
    const fill = document.getElementById('globeIntensityFill');
    if (fill) { fill.style.width = d.intensity + '%'; fill.style.background = col; }

    show('globeKpiGrid');
    set('globeJobs',     d.jobs);
    set('globeFreelance',d.freelance);
    set('globeContract', d.contract);
    set('globeSalary',   d.salary || '—');

    if (d.topRoles && d.topRoles.length) {
      show('globeRolesWrap');
      const list = document.getElementById('globeRoleList');
      if (list) {
        list.innerHTML = d.topRoles.slice(0,6).map(r => {
          const rc = r.demand >= 85 ? '#16a34a' : r.demand >= 70 ? '#4ade80' : r.demand >= 55 ? '#f59e0b' : '#0ea5e9';
          return `<div class="globe-role-item">
            <div class="globe-role-top">
              <span class="globe-role-name">${r.role}</span>
              <span style="font-size:.7rem;font-weight:700;color:${rc}">${r.demand}</span>
            </div>
            <div class="globe-role-bar-track">
              <div class="globe-role-bar-fill" style="width:${r.demand}%;background:${rc}"></div>
            </div>
            <span class="globe-role-note">${r.note}</span>
          </div>`;
        }).join('');
      }
    }

    const tagsEl = document.getElementById('globeTags');
    if (tagsEl && d.signals) {
      tagsEl.innerHTML = d.signals.map(s => `<span class="globe-tag">${s}</span>`).join('');
    }

    const noteEl = document.getElementById('globeNote');
    if (noteEl) noteEl.textContent = d.note || '';
  }

  // ── Mouse / touch drag ───────────────────────────────
  function onMouseDown(e) {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
    rotVel = { x: 0, y: 0 };
  }
  function onMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    // FIX: negate dy so dragging UP moves the globe UP (phi decreases = camera goes higher)
    spherical.phi   = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.005));
    spherical.theta += dx * 0.005;
    updateCameraPos();
    prevMouse = { x: e.clientX, y: e.clientY };
  }
  function onMouseUp() { isDragging = false; }
  function onWheel(e) {
    camDist = Math.max(1.5, Math.min(5.5, camDist + e.deltaY * 0.003));
    updateCameraPos();
    e.preventDefault();
  }

  // Touch
  let lastTouchDist = 0;
  function onTouchStart(e) {
    if (e.touches.length === 1) { isDragging = true; prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
    if (e.touches.length === 2) { lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }
  }
  function onTouchMove(e) {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - prevMouse.x;
      const dy = e.touches[0].clientY - prevMouse.y;
      // FIX: negate dy on touch as well
      spherical.phi   = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.005));
      spherical.theta += dx * 0.005;
      updateCameraPos();
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      camDist = Math.max(1.5, Math.min(5.5, camDist - (d - lastTouchDist) * 0.008));
      updateCameraPos();
      lastTouchDist = d;
    }
    e.preventDefault();
  }
  function onTouchEnd() { isDragging = false; }

  // ── Animation loop ───────────────────────────────────
  let clock = { t: 0 };
  function animate() {
    rafId = requestAnimationFrame(animate);
    clock.t += 0.01;

    if (autoRotate && !isDragging) {
      spherical.theta += 0.0018;
      updateCameraPos();
    }

    glowGroup.children.forEach(m => {
      if (m.userData && m.userData.isPulse) {
        const s = 1 + 0.25 * Math.sin(clock.t * 2.5 + m.position.x * 5);
        m.scale.setScalar(s);
        m.material.opacity = 0.3 + 0.2 * Math.sin(clock.t * 3);
      }
    });

    if (starField) starField.rotation.y += 0.00008;

    renderer.render(scene, camera);
  }

  // ── Resize handler ───────────────────────────────────
  function onResize() {
    const canvas = renderer.domElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ── Public controls ──────────────────────────────────
  window.toggleAutoRotate = function() {
    autoRotate = !autoRotate;
    const btn = document.getElementById('btnAutoRotate');
    if (btn) btn.classList.toggle('active', autoRotate);
  };
  window.resetGlobeView = function() {
    spherical = { theta: 0, phi: Math.PI / 2 };
    camDist = 2.6;
    updateCameraPos();
  };
  window.toggleAtmosphere = function() {
    showAtmo = !showAtmo;
    if (atmoMesh) atmoMesh.visible = showAtmo;
    const btn = document.getElementById('btnAtmo');
    if (btn) btn.classList.toggle('active', showAtmo);
  };

  // ── Init ─────────────────────────────────────────────
  function initGlobe() {
    const canvas = document.getElementById('globeCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width  || 800;
    canvas.height = 680;

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
    window.addEventListener('resize', onResize);

    function waitForDataset(tries) {
      if (window.dataset && Object.keys(window.dataset).length > 0) {
        buildDots(window.dataset);
        animate();
        const first = Object.entries(window.dataset).sort((a,b)=>b[1].intensity-a[1].intensity)[0];
        if (first) showGlobePanel(first[0], first[1]);
      } else if (tries > 0) {
        setTimeout(() => waitForDataset(tries - 1), 300);
      }
    }
    waitForDataset(25);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initGlobe, 800);
  });

})();
