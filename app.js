let dataset = {};
let geoJsonLayer = null;
let markerLayer = null;
let map = null;
let activeFilter = 'all';

const countryNameToCode = {
  'Germany':'DE','Spain':'ES','United Kingdom':'GB','United States of America':'US',
  'Canada':'CA','Colombia':'CO','Mexico':'MX','Brazil':'BR','India':'IN','Australia':'AU'
};

function getFillColor(intensity){
  return intensity > 88 ? '#1f8f4f'
       : intensity > 75 ? '#3fa35a'
       : intensity > 65 ? '#f59e0b'
       : intensity > 55 ? '#0ea5e9'
       : '#1e2d40';
}

function shouldShow(data){
  if(!data) return false;
  if(activeFilter === 'all') return true;
  return data[activeFilter] > 0;
}

function styleFeature(feature){
  const code = feature.properties.iso_a2 || countryNameToCode[feature.properties.name];
  const data = dataset[code];
  const visible = shouldShow(data);
  return {
    fillColor: data && visible ? getFillColor(data.intensity) : '#101e30',
    weight: 1, opacity: 1, color: '#283a52',
    fillOpacity: data && visible ? 0.7 : 0.2
  };
}

function onEachFeature(feature, layer){
  const code = feature.properties.iso_a2 || countryNameToCode[feature.properties.name];
  const data = dataset[code];
  if(!data) return;
  layer.bindPopup(`
    <div class="popup-title">${data.name}</div>
    <div class="popup-text">
      Intensidad: <b>${data.intensity}</b><br>
      Empleo: ${data.jobs} &bull; Servicios: ${data.freelance} &bull; Training: ${data.training}<br>
      Ruta: ${data.route}
    </div>
  `);
  layer.on({
    click: () => updateCountryPanel(code),
    mouseover: e => { e.target.setStyle({weight:2,color:'#dbe7ff',fillOpacity:.9}); },
    mouseout: () => { if(geoJsonLayer) geoJsonLayer.resetStyle(layer); }
  });
}

function renderMarkers(){
  markerLayer.clearLayers();
  Object.entries(dataset).forEach(([code, data]) => {
    if(!shouldShow(data)) return;
    const m = L.circleMarker(data.latlng, {
      radius: Math.max(5, Math.min(13, 4 + data.jobs)),
      color:'#dbe7ff', weight:1.5,
      fillColor: getFillColor(data.intensity),
      fillOpacity:.9
    }).bindTooltip(`${data.name} — Intensidad: ${data.intensity}`, {direction:'top'});
    m.on('click', () => updateCountryPanel(code));
    markerLayer.addLayer(m);
  });
}

function updateCountryPanel(code){
  const d = dataset[code];
  if(!d) return;
  document.getElementById('countryBox').innerHTML = `
    <div class="country-name">${d.name} <span style="font-size:.85rem;font-weight:400;color:var(--muted)">${d.region}</span></div>
    <div class="muted-text">${d.note}</div>
    <div class="metrics">
      <div class="metric"><strong>Intensidad</strong><span>${d.intensity} / 100</span></div>
      <div class="metric"><strong>Ruta sugerida</strong><span>${d.route}</span></div>
      <div class="metric"><strong>Nivel de entrada</strong><span>${d.level}</span></div>
      <div class="metric"><strong>Señales</strong><span>Empleo ${d.jobs} &bull; Servicios ${d.freelance} &bull; Training ${d.training}</span></div>
      <div class="metric"><strong>Salario estimado</strong><span>${d.salary}</span></div>
    </div>
    <div class="tags">
      <span class="tag">${d.region}</span>
      ${d.signals.map(s => `<span class="tag">${s}</span>`).join('')}
    </div>
  `;
}

function renderRanking(){
  const sorted = Object.entries(dataset)
    .filter(([,d]) => shouldShow(d))
    .sort((a,b) => b[1].intensity - a[1].intensity)
    .slice(0,5);
  document.getElementById('ranking').innerHTML = sorted.map(([code,d],i) => `
    <div class="rank" onclick="updateCountryPanel('${code}')">
      <div class="rank-num">${i+1}</div>
      <div><strong>${d.name}</strong><small>${d.route}</small></div>
      <div class="score">${d.intensity}</div>
    </div>
  `).join('');
}

function renderFeed(){
  const entries = Object.values(dataset)
    .filter(shouldShow)
    .flatMap(d => d.signals.map(s => ({country:d.name, text:s, intensity:d.intensity})))
    .sort((a,b) => b.intensity - a.intensity)
    .slice(0,8);
  document.getElementById('feedList').innerHTML = entries.map(e => `
    <div class="feed-item">
      <strong>${e.country}</strong>
      <span>${e.text}</span>
    </div>
  `).join('');
}

function renderKpis(){
  const vals = Object.values(dataset).filter(shouldShow);
  const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  set('kpiEurope',  vals.filter(v=>v.region==='Europe').reduce((a,b)=>a+b.jobs,0));
  set('kpiLatam',   vals.filter(v=>v.region==='LATAM').reduce((a,b)=>a+b.jobs,0));
  set('kpiFreelance', vals.reduce((a,b)=>a+b.freelance,0));
  set('kpiTraining',  vals.reduce((a,b)=>a+b.training,0));
  set('statJobs',     vals.reduce((a,b)=>a+b.jobs,0));
  set('statServices', vals.reduce((a,b)=>a+b.freelance,0));
  set('statTraining', vals.reduce((a,b)=>a+b.training,0));
  set('statCountries', vals.length);
}

function refreshAll(){
  if(geoJsonLayer) geoJsonLayer.setStyle(styleFeature);
  renderMarkers();
  renderRanking();
  renderFeed();
  renderKpis();
}

async function loadGeoJson(){
  const res = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
  const world = await res.json();
  geoJsonLayer = L.geoJSON(world, {style:styleFeature, onEachFeature}).addTo(map);
}

function jumpRegion(region){
  const views = {
    World:[[18,5],2], Europe:[[52,10],4], LATAM:[[-12,-65],3],
    NorthAmerica:[[42,-100],3], Asia:[[25,90],3], Oceania:[[-25,135],4]
  };
  const v = views[region];
  if(v && map) map.setView(v[0], v[1]);
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

async function init(){
  const res = await fetch('data/countries.json');
  dataset = await res.json();
  map = L.map('map', {worldCopyJump:true, minZoom:2}).setView([18,5],2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
  await loadGeoJson();
  refreshAll();
  updateCountryPanel('US');
}

init();