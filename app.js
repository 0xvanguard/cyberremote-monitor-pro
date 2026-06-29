let dataset = {};
let geoJsonLayer = null;
let markerLayer = null;
let map = null;
let activeFilter = 'all';

// Mapeo de nombres GeoJSON → código ISO-A2
const nameToCode = {
  'Germany':'DE','Spain':'ES','United Kingdom':'GB','United States of America':'US',
  'Canada':'CA','Colombia':'CO','Mexico':'MX','Brazil':'BR','India':'IN','Australia':'AU',
  'Netherlands':'NL','France':'FR','Poland':'PL','Romania':'RO','Ukraine':'UA',
  'Israel':'IL','Singapore':'SG','Japan':'JP','South Korea':'KR','Argentina':'AR',
  'Chile':'CL','Peru':'PE','South Africa':'ZA','Nigeria':'NG','Kenya':'KE',
  'United Arab Emirates':'AE','Portugal':'PT','Italy':'IT','Sweden':'SE','Norway':'NO',
  'Switzerland':'CH','New Zealand':'NZ','Philippines':'PH','Malaysia':'MY',
  'Costa Rica':'CR','Panama':'PA','Ecuador':'EC','Bolivia':'BO'
};

function getHeatColor(intensity) {
  if (intensity >= 90) return '#16a34a';
  if (intensity >= 75) return '#4ade80';
  if (intensity >= 60) return '#f59e0b';
  if (intensity >= 45) return '#0ea5e9';
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
  const code = feature.properties.iso_a2 || nameToCode[feature.properties.name];
  const data = dataset[code];
  const visible = shouldShow(data);
  return {
    fillColor: data && visible ? getHeatColor(data.intensity) : '#0d1b2a',
    weight: 0.8,
    opacity: 1,
    color: '#1e3a5f',
    fillOpacity: data && visible ? 0.78 : 0.15
  };
}

function onEachFeature(feature, layer) {
  const code = feature.properties.iso_a2 || nameToCode[feature.properties.name];
  const data = dataset[code];
  if (!data) return;
  const fast = data.fastEntry ? ' ⚡' : '';
  layer.bindTooltip(`<strong>${data.name}${fast}</strong> — Intensidad: ${data.intensity}`, { sticky: true });
  layer.on({
    click: () => updateCountryPanel(code),
    mouseover: e => { e.target.setStyle({ weight: 2, color: '#dbe7ff', fillOpacity: 0.95 }); },
    mouseout: () => { if (geoJsonLayer) geoJsonLayer.resetStyle(layer); }
  });
}

function renderMarkers() {
  markerLayer.clearLayers();
  Object.entries(dataset).forEach(([code, data]) => {
    if (!shouldShow(data)) return;
    const radius = Math.max(5, Math.min(14, 3 + Math.round(data.intensity / 10)));
    const m = L.circleMarker(data.latlng, {
      radius,
      color: '#dbe7ff',
      weight: 1.2,
      fillColor: getHeatColor(data.intensity),
      fillOpacity: 0.92
    }).bindTooltip(
      `<strong>${data.name}</strong>${data.fastEntry ? ' ⚡' : ''}<br>Intensidad: ${data.intensity}<br>${getBadges(data)}`,
      { direction: 'top' }
    );
    m.on('click', () => updateCountryPanel(code));
    markerLayer.addLayer(m);
  });
}

function getBadges(data) {
  const badges = [];
  if (data.jobs > 0) badges.push(`💼 ${data.jobs} empleo`);
  if (data.freelance > 0) badges.push(`🛠️ ${data.freelance} freelance`);
  if (data.contract > 0) badges.push(`📋 ${data.contract} contratos`);
  if (data.fastEntry) badges.push('⚡ Entrada rápida');
  return badges.join(' &bull; ');
}

function updateCountryPanel(code) {
  const d = dataset[code];
  if (!d) return;
  const fast = d.fastEntry ? '<span class="tag" style="background:#f59e0b;color:#000">⚡ Entrada rápida</span>' : '';
  document.getElementById('countryBox').innerHTML = `
    <div class="country-name">${d.name} <span style="font-size:.85rem;font-weight:400;color:var(--muted)">${d.region}</span></div>
    <div class="tags" style="margin-bottom:.5rem">${fast}<span class="tag">${d.contractType}</span></div>
    <div class="muted-text">${d.note}</div>
    <div class="metrics">
      <div class="metric"><strong>Intensidad heatmap</strong><span style="color:${getHeatColor(d.intensity)}">${d.intensity} / 100</span></div>
      <div class="metric"><strong>Tipo contratación</strong><span>${d.contractType}</span></div>
      <div class="metric"><strong>Ruta sugerida</strong><span>${d.route}</span></div>
      <div class="metric"><strong>Nivel de entrada</strong><span>${d.level}</span></div>
      <div class="metric"><strong>Señales activas</strong><span>${getBadges(d)}</span></div>
      <div class="metric"><strong>Salario / tarifa estimada</strong><span>${d.salary}</span></div>
      <div class="metric"><strong>Plataformas clave</strong><span>${d.platforms || 'LinkedIn, Upwork'}</span></div>
    </div>
    <div class="tags">
      <span class="tag">${d.region}</span>
      ${d.signals.map(s => `<span class="tag">${s}</span>`).join('')}
    </div>
  `;
}

function renderRanking() {
  const sorted = Object.entries(dataset)
    .filter(([, d]) => shouldShow(d))
    .sort((a, b) => b[1].intensity - a[1].intensity)
    .slice(0, 8);
  document.getElementById('ranking').innerHTML = sorted.map(([code, d], i) => `
    <div class="rank" onclick="updateCountryPanel('${code}')" style="cursor:pointer">
      <div class="rank-num">${i + 1}</div>
      <div><strong>${d.name}</strong>${d.fastEntry ? ' ⚡' : ''}<small>${d.contractType}</small></div>
      <div class="score" style="color:${getHeatColor(d.intensity)}">${d.intensity}</div>
    </div>
  `).join('');
}

function renderFeed() {
  const entries = Object.values(dataset)
    .filter(shouldShow)
    .flatMap(d => d.signals.map(s => ({ country: d.name, text: s, intensity: d.intensity, contract: d.contractType })))
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 10);
  document.getElementById('feedList').innerHTML = entries.map(e => `
    <div class="feed-item">
      <strong>${e.country}</strong> <span class="tag" style="font-size:.7rem">${e.contract}</span>
      <span>${e.text}</span>
    </div>
  `).join('');
}

function renderKpis() {
  const vals = Object.values(dataset).filter(shouldShow);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('kpiEurope', vals.filter(v => v.region === 'Europe').reduce((a, b) => a + b.jobs, 0));
  set('kpiLatam', vals.filter(v => v.region === 'LATAM').reduce((a, b) => a + b.jobs, 0));
  set('kpiNorthAm', vals.filter(v => v.region === 'North America').reduce((a, b) => a + b.jobs, 0));
  set('kpiAsia', vals.filter(v => v.region === 'Asia').reduce((a, b) => a + b.jobs, 0));
  set('kpiFreelance', vals.reduce((a, b) => a + b.freelance, 0));
  set('kpiContract', vals.reduce((a, b) => a + (b.contract || 0), 0));
  set('kpiJobs', vals.reduce((a, b) => a + b.jobs, 0));
  set('kpiFast', vals.filter(v => v.fastEntry).length);
  set('statJobs', vals.reduce((a, b) => a + b.jobs, 0));
  set('statServices', vals.reduce((a, b) => a + b.freelance, 0));
  set('statContracts', vals.reduce((a, b) => a + (b.contract || 0), 0));
  set('statCountries', vals.length);
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
    World: [[18, 5], 2],
    Europe: [[52, 15], 4],
    LATAM: [[-12, -65], 3],
    NorthAmerica: [[42, -100], 3],
    Asia: [[25, 90], 3],
    Oceania: [[-25, 135], 4],
    Africa: [[5, 20], 3],
    MiddleEast: [[25, 45], 4]
  };
  const v = views[region];
  if (v && map) map.setView(v[0], v[1]);
}
window.jumpRegion = jumpRegion;
window.updateCountryPanel = updateCountryPanel;

document.querySelectorAll('.chip[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chip[data-filter]').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    refreshAll();
  });
});

async function init() {
  const res = await fetch('data/countries.json');
  dataset = await res.json();

  map = L.map('map', {
    worldCopyJump: true,
    minZoom: 2,
    maxZoom: 8,
    zoomControl: true
  }).setView([20, 10], 2);

  // Tile oscuro compatible con el tema del dashboard
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OSM contributors',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);
  await loadGeoJson();
  refreshAll();
  updateCountryPanel('US');

  // FIX: forzar recálculo de tamaño tras render DOM
  setTimeout(() => map.invalidateSize(), 300);
}

init();
