// ═══════════════════════════════════════════════════════════
//  CyberRemote Monitor — Colombia Deep Drill Map
//  Leaflet · 32 departamentos + ciudades · Heatmap cyber jobs
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  let colMap = null;
  let colData = null;
  let cityMarkersLayer = null;
  let deptMarkersLayer = null;
  let colActiveView = 'departments'; // 'departments' | 'cities'

  // ── Heat color (same scale as main map) ──────────────────
  function hc(i) {
    if (i >= 80) return '#16a34a';
    if (i >= 65) return '#4ade80';
    if (i >= 50) return '#f59e0b';
    if (i >= 30) return '#0ea5e9';
    return '#1e3a5f';
  }

  // ── Build department markers ────────────────────────────
  function buildDeptMarkers() {
    deptMarkersLayer.clearLayers();
    Object.entries(colData.departments).forEach(([code, dept]) => {
      const radius = Math.max(8, Math.min(22, 6 + Math.round(dept.intensity / 5)));
      const color  = hc(dept.intensity);

      // Pulsing div icon for top departments
      const isPulse = dept.intensity >= 65;
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${radius*2}px;height:${radius*2}px;
          background:${color}22;
          border:2px solid ${color};
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:${Math.max(8,radius-4)}px;font-weight:700;color:${color};
          box-shadow:0 0 ${isPulse?'10':'4'}px ${color}88;
          cursor:pointer;
          ${isPulse ? 'animation:colPulse 2s infinite;' : ''}
        ">${dept.intensity}</div>`,
        iconSize: [radius*2, radius*2],
        iconAnchor: [radius, radius],
      });

      const marker = L.marker(dept.latlng, { icon })
        .bindTooltip(`<strong>${dept.name}</strong> (${dept.capital})<br>Score: ${dept.intensity}/100 · ${dept.jobs} empleos · ${dept.freelance} freelance`, { sticky: true })
        .on('click', () => showDeptPanel(code, dept));

      deptMarkersLayer.addLayer(marker);
    });
  }

  // ── Build city markers ──────────────────────────────────
  function buildCityMarkers() {
    cityMarkersLayer.clearLayers();
    Object.entries(colData.departments).forEach(([dcode, dept]) => {
      dept.cities.forEach(city => {
        const r = Math.max(5, Math.min(14, 3 + Math.round(city.intensity / 9)));
        const color = hc(city.intensity);
        const m = L.circleMarker(city.latlng, {
          radius: r,
          color: '#dbe7ff', weight: 1,
          fillColor: color, fillOpacity: 0.88
        })
        .bindTooltip(
          `<strong>${city.name}</strong> · ${dept.name}<br>Score: ${city.intensity}/100<br>💼 ${city.jobs} emp. · 🛠️ ${city.freelance} free.<br><em style="color:#94a3b8">${city.note}</em>`,
          { direction: 'top' }
        )
        .on('click', () => showCityPanel(city, dept));
        cityMarkersLayer.addLayer(m);
      });
    });
  }

  // ── Department panel ───────────────────────────────────
  function showDeptPanel(code, dept) {
    const el = document.getElementById('col-detail-panel');
    if (!el) return;
    const color = hc(dept.intensity);
    const rolesHtml = dept.topRoles.map(r => {
      const rc = r.demand >= 80 ? '#16a34a' : r.demand >= 65 ? '#4ade80' : r.demand >= 50 ? '#f59e0b' : '#0ea5e9';
      return `<div style="margin-bottom:7px">
        <div style="display:flex;justify-content:space-between;margin-bottom:2px">
          <span style="font-size:.78rem;color:#dbe7ff">${r.role}</span>
          <span style="font-size:.72rem;color:${rc};font-weight:700">${r.demand}</span>
        </div>
        <div style="background:#1e293b;border-radius:4px;height:5px">
          <div style="width:${r.demand}%;height:100%;background:${rc};border-radius:4px"></div>
        </div>
        <span style="font-size:.68rem;color:#64748b">${r.note}</span>
      </div>`;
    }).join('');
    const citiesHtml = dept.cities.map(c =>
      `<span onclick="colMap.setView([${c.latlng}],10)" style="cursor:pointer;padding:2px 8px;background:#0ea5e920;border:1px solid #0ea5e940;border-radius:12px;font-size:.72rem;color:#0ea5e9;margin:2px">${c.name}</span>`
    ).join('');
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:1.1rem;font-weight:800;color:#f1f5f9">🇨🇴 ${dept.name}</div>
          <div style="font-size:.78rem;color:#64748b">Capital: ${dept.capital} · ${dept.driver}</div>
        </div>
        <div style="background:${color}20;border:1px solid ${color}60;border-radius:8px;padding:6px 12px;text-align:center">
          <div style="font-size:1.4rem;font-weight:900;color:${color}">${dept.intensity}</div>
          <div style="font-size:.6rem;color:#64748b;text-transform:uppercase">Score</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:1.2rem;font-weight:800;color:#4ade80">${dept.jobs}</div>
          <div style="font-size:.62rem;color:#64748b">Empleos</div>
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:1.2rem;font-weight:800;color:#0ea5e9">${dept.freelance}</div>
          <div style="font-size:.62rem;color:#64748b">Freelance</div>
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:1.2rem;font-weight:800;color:#f59e0b">${dept.contract}</div>
          <div style="font-size:.62rem;color:#64748b">Contratos</div>
        </div>
      </div>

      <div style="font-size:.75rem;color:#94a3b8;margin-bottom:10px;line-height:1.5">${dept.note}</div>

      <div style="font-size:.7rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">📊 Demanda por rol</div>
      ${rolesHtml}

      <div style="font-size:.7rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;margin-top:10px">🏙️ Ciudades</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">${citiesHtml}</div>

      <div style="margin-top:10px;font-size:.7rem;color:#475569">
        <strong style="color:#94a3b8">Plataformas:</strong> ${dept.platforms}<br>
        <strong style="color:#94a3b8">Salario:</strong> ${dept.salary}
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">
        ${dept.signals.map(s => `<span style="background:#1e293b;color:#94a3b8;padding:2px 7px;border-radius:10px;font-size:.68rem">${s}</span>`).join('')}
      </div>
    `;
    el.parentElement && (el.parentElement.scrollTop = 0);
  }

  // ── City panel ─────────────────────────────────────────
  function showCityPanel(city, dept) {
    const el = document.getElementById('col-detail-panel');
    if (!el) return;
    const color = hc(city.intensity);
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:1.1rem;font-weight:800;color:#f1f5f9">🏙️ ${city.name}</div>
          <div style="font-size:.78rem;color:#64748b">${dept.name} · Colombia</div>
        </div>
        <div style="background:${color}20;border:1px solid ${color}60;border-radius:8px;padding:6px 12px;text-align:center">
          <div style="font-size:1.4rem;font-weight:900;color:${color}">${city.intensity}</div>
          <div style="font-size:.6rem;color:#64748b;text-transform:uppercase">Score</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:1.2rem;font-weight:800;color:#4ade80">${city.jobs}</div>
          <div style="font-size:.62rem;color:#64748b">Empleos</div>
        </div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:1.2rem;font-weight:800;color:#0ea5e9">${city.freelance}</div>
          <div style="font-size:.62rem;color:#64748b">Freelance</div>
        </div>
      </div>
      <div style="font-size:.78rem;color:#94a3b8;margin-bottom:10px;font-style:italic">${city.note}</div>
      <div style="background:#0ea5e910;border:1px solid #0ea5e930;border-radius:8px;padding:10px;font-size:.78rem;color:#94a3b8">
        📌 Dept. Completo: <strong style="color:#0ea5e9;cursor:pointer" onclick="showDeptPanel('${dept.name}')">${dept.name}</strong><br>
        💼 Plataformas: ${dept.platforms}<br>
        💰 Salario ref.: ${dept.salary}
      </div>
    `;
  }

  // ── Ranking ─────────────────────────────────────────────
  function buildRanking() {
    const el = document.getElementById('col-ranking');
    if (!el || !colData) return;
    const sorted = Object.entries(colData.departments)
      .sort((a, b) => b[1].intensity - a[1].intensity)
      .slice(0, 10);
    el.innerHTML = sorted.map(([code, d], i) => {
      const color = hc(d.intensity);
      return `<div class="col-rank-item" onclick="showDeptPanel_global('${code}')">
        <span class="col-rank-num" style="color:${i<3?'#f59e0b':'#475569'}">${i+1}</span>
        <div class="col-rank-info">
          <strong>${d.name}</strong>
          <small>${d.capital} · ${d.driver.split(' · ')[0]}</small>
        </div>
        <span style="font-size:.85rem;font-weight:800;color:${color}">${d.intensity}</span>
      </div>`;
    }).join('');
  }

  // ── KPI strip ──────────────────────────────────────────────
  function buildKpis() {
    const m = colData.meta;
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('col-kpi-depts', m.total_departments);
    set('col-kpi-cities', m.total_cities);
    set('col-kpi-jobs', m.total_jobs);
    set('col-kpi-freelance', m.total_freelance);
    set('col-kpi-contracts', m.total_contracts);
    set('col-kpi-score', m.national_intensity);
  }

  // ── Toggle departments / cities ─────────────────────────
  window.colToggleView = function (view) {
    colActiveView = view;
    document.querySelectorAll('.col-view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    if (view === 'departments') {
      deptMarkersLayer.addTo(colMap);
      colMap.removeLayer(cityMarkersLayer);
    } else {
      cityMarkersLayer.addTo(colMap);
      colMap.removeLayer(deptMarkersLayer);
    }
  };

  window.colJumpTo = function (lat, lng, zoom) {
    if (colMap) colMap.setView([lat, lng], zoom || 8);
  };

  window.showDeptPanel_global = function (code) {
    if (colData && colData.departments[code]) {
      showDeptPanel(code, colData.departments[code]);
      if (colMap) colMap.setView(colData.departments[code].latlng, 8);
    }
  };

  // ── Quick nav buttons ───────────────────────────────────
  const QUICK_JUMPS = [
    { label: '🇺🇸 País',         lat: 4.5, lng: -74.0, zoom: 5 },
    { label: '🟢 Bogotá',       lat: 4.71, lng: -74.07, zoom: 11 },
    { label: '🟢 Medellín',     lat: 6.24, lng: -75.58, zoom: 11 },
    { label: '🟡 Cali',           lat: 3.45, lng: -76.53, zoom: 11 },
    { label: '🔵 Barranquilla',   lat: 10.97, lng: -74.78, zoom: 11 },
    { label: '🔵 Cartagena',      lat: 10.39, lng: -75.48, zoom: 11 },
    { label: '🟡 Bucaramanga',    lat: 7.12, lng: -73.12, zoom: 11 },
    { label: '🟡 Pereira',        lat: 4.81, lng: -75.70, zoom: 11 },
    { label: '☁️ Amazonia',       lat: -1.5, lng: -71.5, zoom: 6 },
    { label: '⛅ Llanos',           lat: 5.0, lng: -72.0, zoom: 6 },
  ];

  function buildQuickNav() {
    const el = document.getElementById('col-quick-nav');
    if (!el) return;
    el.innerHTML = QUICK_JUMPS.map(j =>
      `<button class="col-nav-btn" onclick="colJumpTo(${j.lat},${j.lng},${j.zoom})">${j.label}</button>`
    ).join('');
  }

  // ── Init ─────────────────────────────────────────────────
  window.initColombiaMap = async function () {
    const canvasEl = document.getElementById('col-map');
    if (!canvasEl || typeof L === 'undefined') return;

    // Load data
    try {
      const res = await fetch('data/colombia.json');
      colData = await res.json();
    } catch (e) {
      console.error('[ColMap] Failed to load colombia.json', e);
      return;
    }

    // Init map
    colMap = L.map('col-map', { minZoom: 4, maxZoom: 14, zoomControl: true })
      .setView([4.5, -74.0], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '© CARTO © OSM',
      subdomains: 'abcd', maxZoom: 19
    }).addTo(colMap);

    // Inject keyframe animation
    if (!document.getElementById('colPulseStyle')) {
      const style = document.createElement('style');
      style.id = 'colPulseStyle';
      style.textContent = `
        @keyframes colPulse {
          0%,100% { box-shadow: 0 0 6px var(--pc,#4ade80)88; }
          50% { box-shadow: 0 0 18px var(--pc,#4ade80)cc; }
        }
        .col-rank-item { display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;transition:background .15s; }
        .col-rank-item:hover { background:#0ea5e910; }
        .col-rank-num { font-size:.85rem;font-weight:800;min-width:18px; }
        .col-rank-info { flex:1;display:flex;flex-direction:column; }
        .col-rank-info strong { font-size:.82rem;color:#f1f5f9; }
        .col-rank-info small { font-size:.68rem;color:#64748b; }
        .col-nav-btn { background:#1e293b;color:#94a3b8;border:1px solid #334155;border-radius:16px;padding:4px 10px;font-size:.7rem;cursor:pointer;transition:all .15s;white-space:nowrap; }
        .col-nav-btn:hover { background:#0ea5e920;color:#0ea5e9;border-color:#0ea5e950; }
        .col-view-btn { background:#1e293b;color:#94a3b8;border:1px solid #334155;border-radius:8px;padding:5px 12px;font-size:.75rem;cursor:pointer;transition:all .15s; }
        .col-view-btn.active { background:#0ea5e920;color:#0ea5e9;border-color:#0ea5e9; }
      `;
      document.head.appendChild(style);
    }

    // Layers
    deptMarkersLayer = L.layerGroup().addTo(colMap);
    cityMarkersLayer = L.layerGroup();

    buildDeptMarkers();
    buildCityMarkers();
    buildRanking();
    buildKpis();
    buildQuickNav();

    // Show top dept panel by default
    const topCode = colData.meta.top_department;
    if (colData.departments[topCode]) {
      showDeptPanel(topCode, colData.departments[topCode]);
    }

    setTimeout(() => colMap.invalidateSize(), 300);
  };

})();
