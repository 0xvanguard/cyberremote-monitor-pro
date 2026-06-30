// ═══════════════════════════════════════════════════════════
//  CyberRemote Monitor — Globe 3D · Space View
//  Three.js r134 · WebGL globe with heatmap dots + atmosphere
//  v2.0 — Smart Filter System + Africa/LATAM expansion
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

  // ── Active Filters ────────────────────────────────────
  let activeFilters = {
    region: 'all',
    tier: 'all',
    scoreMin: 0,
    scoreMax: 100,
    entryFast: false,
    modality: 'all'   // 'all' | 'jobs' | 'freelance' | 'contract'
  };

  // ── Color helper ──────────────────────────────────────
  function heatColor(intensity) {
    if (intensity >= 90) return 0x16a34a;
    if (intensity >= 75) return 0x4ade80;
    if (intensity >= 60) return 0xf59e0b;
    if (intensity >= 45) return 0x0ea5e9;
    if (intensity >= 25) return 0x6366f1;
    return 0x334155;
  }

  function heatColorCSS(intensity) {
    if (intensity >= 90) return '#16a34a';
    if (intensity >= 75) return '#4ade80';
    if (intensity >= 60) return '#f59e0b';
    if (intensity >= 45) return '#0ea5e9';
    if (intensity >= 25) return '#6366f1';
    return '#334155';
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

  // ── Filter Logic ──────────────────────────────────────
  function passesFilter(code, d) {
    if (activeFilters.region !== 'all' && d.region !== activeFilters.region) return false;
    if (activeFilters.tier !== 'all' && d.tier !== parseInt(activeFilters.tier)) return false;
    if (d.intensity < activeFilters.scoreMin || d.intensity > activeFilters.scoreMax) return false;
    if (activeFilters.entryFast && !d.fastEntry) return false;
    if (activeFilters.modality === 'jobs'     && (!d.jobs     || d.jobs     < 1)) return false;
    if (activeFilters.modality === 'freelance'&& (!d.freelance|| d.freelance < 1)) return false;
    if (activeFilters.modality === 'contract' && (!d.contract || d.contract  < 1)) return false;
    return true;
  }

  // ── Apply filters — show/hide dots ───────────────────
  function applyFilters() {
    dots.forEach(({ mesh, glowMesh, ringMesh, code }) => {
      const d = mesh.userData.d;
      const visible = passesFilter(code, d);
      mesh.visible = visible;
      if (glowMesh) glowMesh.visible = visible;
      if (ringMesh) ringMesh.visible = visible;
    });
    updateFilterBadge();
  }

  function updateFilterBadge() {
    const visible = dots.filter(dot => dot.mesh.visible).length;
    const badge = document.getElementById('globeFilterBadge');
    if (badge) badge.textContent = visible + ' países visibles';
  }

  // ── Build scene ───────────────────────────────────────
  function buildScene(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x020817, 1);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    updateCameraPos();

    const ambient = new THREE.AmbientLight(0x1a2a3a, 2.5);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0x4488ff, 3.5);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x0ea5e9, 1.2);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    // Stars
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
      size: 0.045, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true
    }));
    scene.add(starField);

    // Globe
    const globeGeo = new THREE.SphereGeometry(RADIUS, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x0a1628, emissive: 0x030c1a, shininess: 18, specular: 0x0ea5e9
    });
    globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Grid
    const gridMat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.08 });
    for (let lat = -80; lat <= 80; lat += 20) {
      const pts = [];
      for (let lng = 0; lng <= 360; lng += 4) pts.push(latLngToVec3(lat, lng - 180, RADIUS + 0.002));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }
    for (let lng = 0; lng < 360; lng += 20) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 3) pts.push(latLngToVec3(lat, lng - 180, RADIUS + 0.002));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }

    // Atmosphere
    const atmoGeo = new THREE.SphereGeometry(RADIUS * 1.085, 64, 64);
    const atmoMat = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9, emissive: 0x062040, transparent: true, opacity: 0.13,
      side: THREE.FrontSide, depthWrite: false
    });
    atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmoMesh);
    const coronaGeo = new THREE.SphereGeometry(RADIUS * 1.16, 64, 64);
    const coronaMat = new THREE.MeshPhongMaterial({
      color: 0x0284c7, emissive: 0x020c18, transparent: true, opacity: 0.045,
      side: THREE.BackSide, depthWrite: false
    });
    scene.add(new THREE.Mesh(coronaGeo, coronaMat));

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
        color: col, emissive: col, emissiveIntensity: 0.6, shininess: 80
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData = { code, d };
      dotGroup.add(mesh);

      const glowGeo = new THREE.SphereGeometry(size * 2.4, 10, 10);
      const glowMat = new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0.18, depthWrite: false
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.copy(pos);
      glowGroup.add(glowMesh);

      let ringMesh = null;
      if (d.fastEntry) {
        const ringGeo = new THREE.RingGeometry(size * 2.2, size * 2.8, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b, transparent: true, opacity: 0.5,
          side: THREE.DoubleSide, depthWrite: false
        });
        ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos);
        ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
        ringMesh.userData.isPulse = true;
        glowGroup.add(ringMesh);
      }

      dots.push({ mesh, glowMesh, ringMesh, code, lat, lng });
    });

    applyFilters();
  }

  // ── Camera ────────────────────────────────────────────
  function updateCameraPos() {
    camera.position.set(
      camDist * Math.sin(spherical.phi) * Math.cos(spherical.theta),
      camDist * Math.cos(spherical.phi),
      camDist * Math.sin(spherical.phi) * Math.sin(spherical.theta)
    );
    camera.lookAt(0, 0, 0);
  }

  // ── Raycasting ────────────────────────────────────────
  function onCanvasClick(event) {
    const canvas = renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width)  * 2 - 1,
      -((event.clientY - rect.top)  / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const visibleMeshes = dots.filter(d => d.mesh.visible).map(d => d.mesh);
    const hits = raycaster.intersectObjects(visibleMeshes);
    if (hits.length > 0) {
      const { code, d } = hits[0].object.userData;
      showGlobePanel(code, d);
      const mat = hits[0].object.material;
      const orig = mat.emissiveIntensity;
      mat.emissiveIntensity = 2;
      setTimeout(() => { mat.emissiveIntensity = orig; }, 300);
    }
  }

  // ── Panel ─────────────────────────────────────────────
  function showGlobePanel(code, d) {
    const col = heatColorCSS(d.intensity);
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const show = (id) => { const el = document.getElementById(id); if (el) el.style.display = ''; };

    set('globeCountryName', d.name + (d.fastEntry ? ' ⚡' : ''));
    set('globeCountryRegion', d.region + ' · ' + (d.contractType || ''));
    show('globeIntensityWrap');
    set('globeIntensityVal', d.intensity + ' / 100');
    const fill = document.getElementById('globeIntensityFill');
    if (fill) { fill.style.width = d.intensity + '%'; fill.style.background = col; }

    // Tier badge
    const tierEl = document.getElementById('globeTierBadge');
    if (tierEl && d.tier) {
      const tierLabels = { 1: '🟢 Tier 1 — Demanda real', 2: '🟡 Tier 2 — Emergente', 3: '🔵 Tier 3 — Incipiente', 4: '🔴 Tier 4 — Sin mercado' };
      tierEl.textContent = tierLabels[d.tier] || '';
      tierEl.style.display = '';
    }

    show('globeKpiGrid');
    set('globeJobs',     d.jobs     || 0);
    set('globeFreelance',d.freelance|| 0);
    set('globeContract', d.contract || 0);
    set('globeSalary',   d.salary   || '—');

    if (d.topRoles && d.topRoles.length) {
      show('globeRolesWrap');
      const list = document.getElementById('globeRoleList');
      if (list) {
        list.innerHTML = d.topRoles.slice(0,6).map(r => {
          const rc = r.demand >= 85 ? '#16a34a' : r.demand >= 70 ? '#4ade80' : r.demand >= 55 ? '#f59e0b' : r.demand >= 35 ? '#0ea5e9' : '#6366f1';
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

    const platEl = document.getElementById('globePlatforms');
    if (platEl) { platEl.textContent = d.platforms || ''; platEl.style.display = d.platforms ? '' : 'none'; }
  }

  // ── Mouse/Touch ───────────────────────────────────────
  function onMouseDown(e) { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; rotVel = { x: 0, y: 0 }; }
  function onMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
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

  let lastTouchDist = 0;
  function onTouchStart(e) {
    if (e.touches.length === 1) { isDragging = true; prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
    if (e.touches.length === 2) { lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }
  }
  function onTouchMove(e) {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - prevMouse.x;
      const dy = e.touches[0].clientY - prevMouse.y;
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

  // ── Animation loop ────────────────────────────────────
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

  // ── Resize ────────────────────────────────────────────
  function onResize() {
    const canvas = renderer.domElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ── Public controls ───────────────────────────────────
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

  // ── Smart Filter Public API ───────────────────────────
  window.setGlobeFilter = function(key, value) {
    if (key === 'scoreRange') {
      const parts = value.split('-');
      activeFilters.scoreMin = parseInt(parts[0]) || 0;
      activeFilters.scoreMax = parseInt(parts[1]) || 100;
    } else if (key === 'entryFast') {
      activeFilters.entryFast = (value === 'true' || value === true);
    } else {
      activeFilters[key] = value;
    }
    applyFilters();
    // Sync UI
    const el = document.getElementById('globeFilter_' + key);
    if (el) el.value = value;
  };

  window.resetGlobeFilters = function() {
    activeFilters = { region: 'all', tier: 'all', scoreMin: 0, scoreMax: 100, entryFast: false, modality: 'all' };
    applyFilters();
    ['region','tier','scoreRange','modality'].forEach(k => {
      const el = document.getElementById('globeFilter_' + k);
      if (el) el.value = 'all';
    });
    const cb = document.getElementById('globeFilter_entryFast');
    if (cb) cb.checked = false;
  };

  window.getGlobeStats = function() {
    const visible = dots.filter(d => d.mesh.visible);
    return {
      total: dots.length,
      visible: visible.length,
      avgScore: visible.length ? Math.round(visible.reduce((s,d)=>s+d.mesh.userData.d.intensity,0)/visible.length) : 0
    };
  };

  // ── Filter panel builder ──────────────────────────────
  function buildFilterPanel() {
    const host = document.getElementById('globeFilterPanel');
    if (!host) return;

    // Collect all unique regions from dataset
    const regions = ['all', ...new Set(
      Object.values(window.dataset || {}).map(d => d.region).filter(Boolean).sort()
    )];

    host.innerHTML = `
<div class="gfp-inner">
  <div class="gfp-title">🎛️ Filtros inteligentes <span id="globeFilterBadge" class="gfp-badge">—</span></div>
  <div class="gfp-row">
    <label class="gfp-label">Región</label>
    <select id="globeFilter_region" class="gfp-select" onchange="setGlobeFilter('region',this.value)">
      ${regions.map(r => `<option value="${r}">${r === 'all' ? 'Todas las regiones' : r}</option>`).join('')}
    </select>
  </div>
  <div class="gfp-row">
    <label class="gfp-label">Tier</label>
    <select id="globeFilter_tier" class="gfp-select" onchange="setGlobeFilter('tier',this.value)">
      <option value="all">Todos los tiers</option>
      <option value="1">🟢 Tier 1 — Demanda real</option>
      <option value="2">🟡 Tier 2 — Emergente</option>
      <option value="3">🔵 Tier 3 — Incipiente</option>
      <option value="4">🔴 Tier 4 — Sin mercado</option>
    </select>
  </div>
  <div class="gfp-row">
    <label class="gfp-label">Score mínimo</label>
    <input type="range" id="globeFilter_scoreMin" class="gfp-range" min="0" max="100" value="0"
      oninput="activeFilters.scoreMin=+this.value;document.getElementById('gfp_scoreMinVal').textContent=this.value;applyFilters&&applyFilters()">
    <span id="gfp_scoreMinVal" class="gfp-range-val">0</span>
  </div>
  <div class="gfp-row">
    <label class="gfp-label">Score máximo</label>
    <input type="range" id="globeFilter_scoreMax" class="gfp-range" min="0" max="100" value="100"
      oninput="activeFilters.scoreMax=+this.value;document.getElementById('gfp_scoreMaxVal').textContent=this.value;applyFilters&&applyFilters()">
    <span id="gfp_scoreMaxVal" class="gfp-range-val">100</span>
  </div>
  <div class="gfp-row">
    <label class="gfp-label">Modalidad</label>
    <select id="globeFilter_modality" class="gfp-select" onchange="setGlobeFilter('modality',this.value)">
      <option value="all">Todas las modalidades</option>
      <option value="jobs">💼 Empleos</option>
      <option value="freelance">🛠️ Freelance</option>
      <option value="contract">📋 Contratos</option>
    </select>
  </div>
  <div class="gfp-row gfp-check-row">
    <label class="gfp-label">Solo entrada rápida ⚡</label>
    <input type="checkbox" id="globeFilter_entryFast" class="gfp-check"
      onchange="setGlobeFilter('entryFast',this.checked)">
  </div>
  <div class="gfp-row gfp-presets">
    <span class="gfp-preset-label">Accesos rápidos:</span>
    <button class="gfp-preset-btn" onclick="setGlobeFilter('region','África Oriental');setGlobeFilter('tier','1')">🌍 ÁfricaOr. T1</button>
    <button class="gfp-preset-btn" onclick="setGlobeFilter('tier','1')">🏆 Solo Tier 1</button>
    <button class="gfp-preset-btn" onclick="setGlobeFilter('entryFast',true);document.getElementById('globeFilter_entryFast').checked=true">⚡ Entrada rápida</button>
    <button class="gfp-preset-btn" onclick="activeFilters.scoreMin=45;activeFilters.scoreMax=100;document.getElementById('globeFilter_scoreMin').value=45;document.getElementById('gfp_scoreMinVal').textContent=45;applyFilters&&applyFilters()">📈 Score ≥ 45</button>
    <button class="gfp-preset-btn gfp-reset" onclick="resetGlobeFilters()">✖ Reset</button>
  </div>
</div>`;
  }

  // ── Init ──────────────────────────────────────────────
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
        buildFilterPanel();
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

  // Expose applyFilters for range inputs
  window.applyFilters = applyFilters;
  window.activeFilters = activeFilters;

})();
