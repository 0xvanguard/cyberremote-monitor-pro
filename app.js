let dataset = {};
let geoJsonLayer = null;
let markerLayer = null;
let map = null;
let activeFilter = 'all';

const nameToCode = {
  'United States of America':'US','United States':'US',
  'Canada':'CA','Greenland':'GL',
  'Mexico':'MX','Colombia':'CO','Venezuela':'VE','Ecuador':'EC',
  'Peru':'PE','Bolivia':'BO','Brazil':'BR','Argentina':'AR',
  'Chile':'CL','Guatemala':'GT','Costa Rica':'CR','Panama':'PA',
  'United Kingdom':'GB','Germany':'DE','France':'FR','Spain':'ES',
  'Portugal':'PT','Italy':'IT','Belgium':'BE','Netherlands':'NL',
  'Poland':'PL','Czech Republic':'CZ','Czech Rep.':'CZ',
  'Romania':'RO','Ukraine':'UA','Sweden':'SE','Norway':'NO',
  'Switzerland':'CH','Ireland':'IE',
  'Israel':'IL','United Arab Emirates':'AE','Saudi Arabia':'SA',
  'Turkey':'TR','Türkiye':'TR',
  'Egypt':'EG','Morocco':'MA','Algeria':'DZ','Tunisia':'TN',
  'South Africa':'ZA','Nigeria':'NG','Kenya':'KE',
  'India':'IN','Singapore':'SG','Japan':'JP',
  'South Korea':'KR','Korea':'KR','Korea, Republic of':'KR',
  'Philippines':'PH','Malaysia':'MY',
  'China':'CN','Indonesia':'ID','Vietnam':'VN','Thailand':'TH',
  'Russia':'RU','Kazakhstan':'KZ','Mongolia':'MN',
  'Iran':'IR','Iran (Islamic Republic of)':'IR',
  'Iraq':'IQ','Laos':'LA',"Lao People's Democratic Republic":'LA',
  'Cambodia':'KH',
  'Australia':'AU','New Zealand':'NZ',
  // Africa-new & LATAM
  'Paraguay':'PY','Namibia':'NA','Botswana':'BW','Zimbabwe':'ZW',
  'Mozambique':'MZ','Zambia':'ZM','Malawi':'MW','Angola':'AO',
  'Democratic Republic of the Congo':'CD','DR Congo':'CD','Congo, Dem. Rep.':'CD',
  'Gabon':'GA','Cameroon':'CM','Tanzania':'TZ','Uganda':'UG',
  'Ethiopia':'ET','Somalia':'SO','South Sudan':'SS',
  'Central African Republic':'CF','C. African Rep.':'CF',
  // World expansion
  'Lesotho':'LS','Swaziland':'SZ','Eswatini':'SZ',
  'Madagascar':'MG','Fiji':'FJ','Papua New Guinea':'PG',
  'East Timor':'TL','Timor-Leste':'TL',
  'Pakistan':'PK','Afghanistan':'AF',
  'Turkmenistan':'TM','Uzbekistan':'UZ','Tajikistan':'TJ','Kyrgyzstan':'KG',
  'Burundi':'BI','Sudan':'SD','Chad':'TD',
  'Niger':'NE','Mali':'ML','Mauritania':'MR',
  'Senegal':'SN','Guinea-Bissau':'GW','Sierra Leone':'SL',
  'Liberia':'LR','Ivory Coast':'CI',"Côte d'Ivoire":'CI',"Cote d'Ivoire":'CI'
};

function resolveCode(feature) {
  const props = feature.properties;
  if (props.iso_a2 && props.iso_a2 !== '-99' && props.iso_a2 !== '') return props.iso_a2;
  return nameToCode[props.name] || nameToCode[props.NAME] || null;
}

function getHeatColor(intensity) {
  if (intensity >= 90) return '#16a34a';
  if (intensity >= 75) return '#4ade80';
  if (intensity >= 60) return '#f59e0b';
  if (intensity >= 45) return '#0ea5e9';
  if (intensity >= 25) return '#6366f1';
  return '#1e3a5f';
}

function shouldShow(data) {
  if (!data) return false;
  if (activeFilter === 'all') return true;
  if (activeFilter === 'jobs') return data.jobs > 0;
  if (activeFilter === 'freelance') return data.freelance > 0;
  if (activeFilter === 'contract') return data.contract > 0;
  if (activeFilter === 'training') return data.training > 0;
  if (activeFilter === 'fast') return data.fastEntry === true;
  return true;
}

function styleFeature(feature) {
  const code = resolveCode(feature);
  const data = dataset[code];
  const visible = shouldShow(data);
  if (data && visible) {
    return { fillColor: getHeatColor(data.intensity), weight: 0.8, opacity: 1, color: '#1e3a5f', fillOpacity: 0.78 };
  }
  return { fillColor: '#1a2535', weight: 0.5, opacity: 0.6, color: '#253550', fillOpacity: 0.55 };
}

function onEachFeature(feature, layer) {
  const code = resolveCode(feature);
  const data = dataset[code];
  if (data) {
    const fast = data.fastEntry ? ' ⚡' : '';
    layer.bindTooltip(`<strong>${data.name}${fast}</strong> — Intensidad: ${data.intensity}`, { sticky: true });
    layer.on({
      click: () => updateCountryPanel(code),
      mouseover: e => { e.target.setStyle({ weight: 2, color: '#dbe7ff', fillOpacity: 0.95 }); },
      mouseout: () => { if (geoJsonLayer) geoJsonLayer.resetStyle(layer); }
    });
  } else {
    const name = feature.properties.name || feature.properties.NAME || 'País';
    layer.bindTooltip(`<span style="color:#64748b">${name}</span> — Sin datos disponibles`, { sticky: true });
    layer.on({
      mouseover: e => { e.target.setStyle({ fillOpacity: 0.75, color: '#334155' }); },
      mouseout: () => { if (geoJsonLayer) geoJsonLayer.resetStyle(layer); }
    });
  }
}

function renderMarkers() {
  if (!markerLayer) return;
  markerLayer.clearLayers();
  Object.entries(dataset).forEach(([code, data]) => {
    if (!shouldShow(data)) return;
    const radius = Math.max(5, Math.min(14, 3 + Math.round(data.intensity / 10)));
    const m = L.circleMarker(data.latlng, {
      radius, color: '#dbe7ff', weight: 1.2,
      fillColor: getHeatColor(data.intensity), fillOpacity: 0.92
    }).bindTooltip(
      `<strong>${data.name}</strong>${data.fastEntry ? ' ⚡' : ''}<br>Intensidad: ${data.intensity}<br>${getBadges(data)}`,
      { direction: 'top' }
    );
    m.on('click', () => updateCountryPanel(code));
    markerLayer.addLayer(m);
  });
}

function getBadges(data) {
  const b = [];
  if (data.jobs > 0) b.push(`💼 ${data.jobs} empleo`);
  if (data.freelance > 0) b.push(`🛠️ ${data.freelance} freelance`);
  if (data.contract > 0) b.push(`📋 ${data.contract} contratos`);
  if (data.fastEntry) b.push('⚡ Entrada rápida');
  return b.join(' &bull; ');
}

function getRoleBar(demand) {
  const color = demand >= 85 ? '#16a34a' : demand >= 70 ? '#4ade80' : demand >= 55 ? '#f59e0b' : demand >= 35 ? '#0ea5e9' : '#6366f1';
  return `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">
    <div style="flex:1;background:#1e3a5f;border-radius:4px;height:6px;overflow:hidden">
      <div style="width:${demand}%;height:100%;background:${color};border-radius:4px"></div>
    </div>
    <span style="font-size:.72rem;color:${color};min-width:26px;text-align:right">${demand}</span>
  </div>`;
}

function updateCountryPanel(code) {
  const d = dataset[code];
  if (!d) return;
  const el = document.getElementById('countryBox');
  if (!el) return;
  const fast = d.fastEntry ? '<span class="tag" style="background:#f59e0b;color:#000">⚡ Entrada rápida</span>' : '';
  const topRole = d.topRoles ? d.topRoles.reduce((a, b) => a.demand > b.demand ? a : b) : null;
  const topRoleHtml = topRole
    ? `<div class="metric" style="background:rgba(22,163,74,.1);border-left:3px solid #16a34a;padding-left:8px;margin-bottom:6px">
        <strong>🔥 Rol más demandado</strong>
        <span style="color:#4ade80">${topRole.role} (${topRole.demand}/100)</span>
        <span style="font-size:.75rem;color:var(--muted)">${topRole.note}</span>
       </div>` : '';
  const tierLabels = { 1: '🟢 Tier 1', 2: '🟡 Tier 2', 3: '🔵 Tier 3', 4: '🔴 Tier 4' };
  const tierHtml = d.tier ? `<span class="tag" style="background:rgba(14,165,233,.12);border:1px solid rgba(14,165,233,.25);color:#7dd3fc">${tierLabels[d.tier] || ''}</span>` : '';
  const rolesHtml = d.topRoles ? d.topRoles.map(r => `
    <div style="margin-bottom:7px">
      <div style="display:flex;justify-content:space-between">
        <span style="font-size:.78rem;color:#dbe7ff">${r.role}</span>
      </div>
      ${getRoleBar(r.demand)}
      <span style="font-size:.68rem;color:var(--muted)">${r.note}</span>
    </div>
  `).join('') : '';
  el.innerHTML = `
    <div class="country-name">${d.name} <span style="font-size:.85rem;font-weight:400;color:var(--muted)">${d.region}</span></div>
    <div class="tags" style="margin-bottom:.5rem">${fast}${tierHtml}<span class="tag">${d.contractType}</span></div>
    <div class="muted-text" style="margin-bottom:.6rem">${d.note}</div>
    <div class="metrics">
      <div class="metric"><strong>Intensidad heatmap</strong><span style="color:${getHeatColor(d.intensity)}">${d.intensity} / 100</span></div>
      ${topRoleHtml}
      <div class="metric"><strong>Salario / tarifa</strong><span>${d.salary}</span></div>
      <div class="metric"><strong>Plataformas</strong><span>${d.platforms}</span></div>
      <div class="metric"><strong>Señales activas</strong><span>${getBadges(d)}</span></div>
    </div>
    <div style="margin-top:.8rem">
      <div class="side-title" style="font-size:.72rem;margin-bottom:.5rem">📊 DEMANDA POR ROL — ${d.name.toUpperCase()}</div>
      ${rolesHtml}
    </div>
    <div class="tags" style="margin-top:.5rem">
      <span class="tag">${d.region}</span>
      ${d.signals.map(s => `<span class="tag">${s}</span>`).join('')}
    </div>
  `;
}

function renderRanking() {
  const el = document.getElementById('ranking');
  if (!el) return;
  const sorted = Object.entries(dataset)
    .filter(([, d]) => shouldShow(d))
    .sort((a, b) => b[1].intensity - a[1].intensity)
    .slice(0, 8);
  el.innerHTML = sorted.map(([code, d], i) => {
    const top = d.topRoles ? d.topRoles.reduce((a, b) => a.demand > b.demand ? a : b) : null;
    return `
    <div class="rank" onclick="updateCountryPanel('${code}')" style="cursor:pointer">
      <div class="rank-num">${i + 1}</div>
      <div><strong>${d.name}</strong>${d.fastEntry ? ' ⚡' : ''}<small>${top ? '🔥 ' + top.role : d.contractType}</small></div>
      <div class="score" style="color:${getHeatColor(d.intensity)}">${d.intensity}</div>
    </div>`;
  }).join('');
}

function renderFeed() {
  const el = document.getElementById('feedList');
  if (!el) return;
  const entries = Object.values(dataset)
    .filter(shouldShow)
    .flatMap(d => d.signals.map(s => ({ country: d.name, text: s, intensity: d.intensity, contract: d.contractType })))
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 12);
  el.innerHTML = entries.map(e => `
    <div class="feed-item">
      <strong>${e.country}</strong> <span class="tag" style="font-size:.7rem">${e.contract}</span>
      <span>${e.text}</span>
    </div>
  `).join('');
}

function renderKpis() {
  const vals = Object.values(dataset).filter(shouldShow);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const asiaRegions = ['Asia','Asia Oriental','Asia Meridional','Asia Occidental','Sudeste Asiatico','Asia Central','Pacífico'];
  const africaRegions = ['África Austral','África Oriental','África Central','África Septentrional','África Subsahariana','África Occidental','África del Norte'];
  set('kpiEurope',   vals.filter(v => v.region === 'Europe').reduce((a, b) => a + b.jobs, 0));
  set('kpiLatam',    vals.filter(v => v.region === 'LATAM').reduce((a, b) => a + b.jobs, 0));
  set('kpiNorthAm',  vals.filter(v => v.region === 'North America').reduce((a, b) => a + b.jobs, 0));
  set('kpiAsia',     vals.filter(v => asiaRegions.includes(v.region)).reduce((a, b) => a + b.jobs, 0));
  set('kpiAfrica',   vals.filter(v => africaRegions.includes(v.region)).reduce((a, b) => a + b.jobs, 0));
  set('kpiFreelance',vals.reduce((a, b) => a + b.freelance, 0));
  set('kpiContract', vals.reduce((a, b) => a + (b.contract || 0), 0));
  set('kpiJobs',     vals.reduce((a, b) => a + b.jobs, 0));
  set('kpiFast',     vals.filter(v => v.fastEntry).length);
  set('statJobs',    vals.reduce((a, b) => a + b.jobs, 0));
  set('statServices',vals.reduce((a, b) => a + b.freelance, 0));
  set('statContracts',vals.reduce((a, b) => a + (b.contract || 0), 0));
  set('statCountries',vals.length);
}

function refreshAll() {
  if (geoJsonLayer) geoJsonLayer.setStyle(styleFeature);
  renderMarkers();
  renderRanking();
  renderFeed();
  renderKpis();
}

async function loadGeoJson() {
  const res = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
  const world = await res.json();
  geoJsonLayer = L.geoJSON(world, { style: styleFeature, onEachFeature }).addTo(map);
}

function jumpRegion(region) {
  const views = {
    World:        [[18, 5],    2],
    Europe:       [[52, 15],   4],
    LATAM:        [[-12, -65], 3],
    NorthAmerica: [[42, -100], 3],
    Asia:         [[25, 90],   3],
    Oceania:      [[-25, 135], 4],
    Africa:       [[5, 20],    3],
    MiddleEast:   [[25, 45],   4],
    Arctic:       [[72, -42],  4]
  };
  const v = views[region];
  if (v && map) map.setView(v[0], v[1]);
}
window.jumpRegion = jumpRegion;
window.updateCountryPanel = updateCountryPanel;

async function init() {
  try {
    const [resMain, resExtra, resAfrica, resWorld] = await Promise.all([
      fetch('data/countries.json'),
      fetch('data/countries-extra.json'),
      fetch('data/africa-new.json'),
      fetch('data/world-expansion.json')
    ]);
    if (!resMain.ok)   throw new Error('countries.json HTTP '       + resMain.status);
    if (!resExtra.ok)  throw new Error('countries-extra.json HTTP ' + resExtra.status);
    if (!resAfrica.ok) throw new Error('africa-new.json HTTP '      + resAfrica.status);
    if (!resWorld.ok)  throw new Error('world-expansion.json HTTP ' + resWorld.status);

    const [main, extra, africaNew, worldExp] = await Promise.all([
      resMain.json(), resExtra.json(), resAfrica.json(), resWorld.json()
    ]);
    dataset = { ...main, ...extra, ...africaNew, ...worldExp };
    window.dataset = dataset;

    map = L.map('map', { worldCopyJump: true, minZoom: 2, maxZoom: 8 }).setView([20, 10], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OSM contributors',
      subdomains: 'abcd', maxZoom: 19
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);

    await loadGeoJson();
    refreshAll();
    updateCountryPanel('US');
    setTimeout(() => map.invalidateSize(), 300);
    if (typeof renderCards === 'function') renderCards('all');

  } catch (err) {
    console.error('[CyberRemote] init() failed:', err);
    const mapEl = document.getElementById('map');
    if (mapEl) mapEl.innerHTML =
      `<div style="color:#f87171;padding:2rem;font-size:.85rem">⚠️ Error cargando datos: ${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.chip[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip[data-filter]').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      refreshAll();
    });
  });
  init();
});
