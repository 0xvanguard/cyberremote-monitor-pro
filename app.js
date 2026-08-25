let dataset = {};
let geoJsonLayer = null;
let markerLayer = null;
let map = null;
let activeFilter = 'all';

const nameToCode = {
  // Americas
  'United States of America':'US','United States':'US',
  'Canada':'CA','Greenland':'GL',
  'Mexico':'MX','Colombia':'CO','Venezuela':'VE','Ecuador':'EC',
  'Peru':'PE','Bolivia':'BO','Brazil':'BR','Argentina':'AR',
  'Chile':'CL','Guatemala':'GT','Costa Rica':'CR',
  'Uruguay':'UY',
  'Guyana':'GY',
  'Suriname':'SR','Surinam':'SR',
  'French Guiana':'GF','Guyane':'GF','Guyane française':'GF',
  // batch3 — LATAM / Caribbean
  'Panama':'PA',
  'Nicaragua':'NI',
  'Honduras':'HN',
  'El Salvador':'SV',
  'Belize':'BZ',
  'Jamaica':'JM',
  'Trinidad and Tobago':'TT','Trinidad & Tobago':'TT',
  'Puerto Rico':'PR',
  'Haiti':'HT','Haïti':'HT',
  'Dominican Republic':'DO','República Dominicana':'DO',
  'Cuba':'CU',
  'The Bahamas':'BS','Bahamas':'BS',
  // batch3 — Europe
  'Iceland':'IS',
  'Lithuania':'LT',
  'Latvia':'LV',
  'Estonia':'EE',
  'Finland':'FI',
  'Belarus':'BY',
  // batch3 — Africa
  'Benin':'BJ','Bénin':'BJ',
  'Togo':'TG',
  'Ghana':'GH',
  'Burkina Faso':'BF',
  'Guinea':'GN',
  'Gambia':'GM','The Gambia':'GM',
  'Libya':'LY','Libyan Arab Jamahiriya':'LY',
  'Eritrea':'ER',
  'Rwanda':'RW',
  'Djibouti':'DJ',
  // batch3 — Middle East / Asia
  'Yemen':'YE',
  'Oman':'OM',
  'Qatar':'QA',
  'Kuwait':'KW',
  'Syria':'SY','Syrian Arab Republic':'SY',
  'Jordan':'JO',
  'Georgia':'GE',
  'Armenia':'AM',
  'Azerbaijan':'AZ',
  // Existing entries
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
  'Paraguay':'PY','Namibia':'NA','Botswana':'BW','Zimbabwe':'ZW',
  'Mozambique':'MZ','Zambia':'ZM','Malawi':'MW','Angola':'AO',
  'Democratic Republic of the Congo':'CD','DR Congo':'CD','Congo, Dem. Rep.':'CD',
  'Gabon':'GA','Cameroon':'CM','Tanzania':'TZ','Uganda':'UG',
  'Ethiopia':'ET','Somalia':'SO','South Sudan':'SS',
  'Central African Republic':'CF','C. African Rep.':'CF',
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

/* ──────────────────────────────────────────────────────────────
   BUSCADOR GLOBAL PAÍS / CIUDAD — funciona en mapa 2D y globo 3D
────────────────────────────────────────────────────────────── */
const CITY_COORDS = [
  // Américas
  { n:'New York', alt:['Nueva York'], cc:'US', ll:[40.71,-74.01] },
  { n:'Washington D.C.', alt:['Washington'], cc:'US', ll:[38.9,-77.04] },
  { n:'Austin', cc:'US', ll:[30.27,-97.74] },
  { n:'San Francisco', alt:['SF Bay Area'], cc:'US', ll:[37.77,-122.42] },
  { n:'Toronto', cc:'CA', ll:[43.65,-79.38] },
  { n:'Vancouver', cc:'CA', ll:[49.28,-123.12] },
  { n:'Ciudad de México', alt:['CDMX','Mexico City'], cc:'MX', ll:[19.43,-99.13] },
  { n:'Guadalajara', cc:'MX', ll:[20.66,-103.35] },
  { n:'Monterrey', cc:'MX', ll:[25.69,-100.32] },
  { n:'Bogotá', alt:['Bogota'], cc:'CO', ll:[4.61,-74.08] },
  { n:'Medellín', alt:['Medellin'], cc:'CO', ll:[6.24,-75.58] },
  { n:'Cali', cc:'CO', ll:[3.45,-76.53] },
  { n:'São Paulo', alt:['Sao Paulo'], cc:'BR', ll:[-23.55,-46.63] },
  { n:'Rio de Janeiro', alt:['Río de Janeiro'], cc:'BR', ll:[-22.91,-43.17] },
  { n:'Buenos Aires', cc:'AR', ll:[-34.60,-58.38] },
  { n:'Santiago', cc:'CL', ll:[-33.45,-70.67] },
  { n:'Lima', cc:'PE', ll:[-12.05,-77.04] },
  { n:'Quito', cc:'EC', ll:[-0.18,-78.47] },
  { n:'Montevideo', cc:'UY', ll:[-34.90,-56.16] },
  { n:'San José', alt:['San Jose CR'], cc:'CR', ll:[9.93,-84.08] },
  { n:'Panamá', alt:['Panama City'], cc:'PA', ll:[8.98,-79.52] },
  // Europa
  { n:'London', alt:['Londres'], cc:'GB', ll:[51.51,-0.13] },
  { n:'Madrid', cc:'ES', ll:[40.42,-3.70] },
  { n:'Barcelona', cc:'ES', ll:[41.39,2.17] },
  { n:'Lisboa', alt:['Lisbon'], cc:'PT', ll:[38.72,-9.14] },
  { n:'Paris', alt:['París'], cc:'FR', ll:[48.86,2.35] },
  { n:'Berlin', alt:['Berlín'], cc:'DE', ll:[52.52,13.41] },
  { n:'Munich', alt:['Múnich','München'], cc:'DE', ll:[48.14,11.58] },
  { n:'Amsterdam', alt:['Ámsterdam'], cc:'NL', ll:[52.37,4.90] },
  { n:'Brussels', alt:['Bruselas','Bruxelles'], cc:'BE', ll:[50.85,4.35] },
  { n:'Dublin', alt:['Dublín'], cc:'IE', ll:[53.35,-6.26] },
  { n:'Warsaw', alt:['Varsovia'], cc:'PL', ll:[52.23,21.01] },
  { n:'Prague', alt:['Praga'], cc:'CZ', ll:[50.08,14.44] },
  { n:'Bucharest', alt:['Bucarest'], cc:'RO', ll:[44.43,26.10] },
  { n:'Stockholm', alt:['Estocolmo'], cc:'SE', ll:[59.33,18.06] },
  { n:'Oslo', cc:'NO', ll:[59.91,10.75] },
  { n:'Zurich', alt:['Zúrich'], cc:'CH', ll:[47.37,8.54] },
  { n:'Milan', alt:['Milán'], cc:'IT', ll:[45.46,9.19] },
  { n:'Rome', alt:['Roma'], cc:'IT', ll:[41.90,12.50] },
  { n:'Kyiv', alt:['Kiev'], cc:'UA', ll:[50.45,30.52] },
  // Medio Oriente
  { n:'Dubai', alt:['Dubái'], cc:'AE', ll:[25.20,55.27] },
  { n:'Riyadh', alt:['Riad'], cc:'SA', ll:[24.71,46.68] },
  { n:'Tel Aviv', cc:'IL', ll:[32.09,34.78] },
  { n:'Istanbul', alt:['Estambul'], cc:'TR', ll:[41.01,28.98] },
  // Asia-Pacífico
  { n:'Singapore', alt:['Singapur'], cc:'SG', ll:[1.35,103.82] },
  { n:'Tokyo', alt:['Tokio'], cc:'JP', ll:[35.68,139.69] },
  { n:'Seoul', alt:['Seúl'], cc:'KR', ll:[37.57,126.98] },
  { n:'Bangalore', cc:'IN', ll:[12.97,77.59] },
  { n:'Mumbai', alt:['Bombay'], cc:'IN', ll:[19.08,72.88] },
  { n:'New Delhi', alt:['Nueva Delhi'], cc:'IN', ll:[28.61,77.21] },
  { n:'Sydney', alt:['Sídney'], cc:'AU', ll:[-33.87,151.21] },
  { n:'Melbourne', cc:'AU', ll:[-37.81,144.96] },
  { n:'Auckland', cc:'NZ', ll:[-36.85,174.76] },
  { n:'Jakarta', alt:['Yakarta'], cc:'ID', ll:[-6.21,106.85] },
  { n:'Bangkok', cc:'TH', ll:[13.76,100.50] },
  // África
  { n:'Cairo', alt:['El Cairo'], cc:'EG', ll:[30.04,31.24] },
  { n:'Casablanca', cc:'MA', ll:[33.57,-7.59] },
  { n:'Johannesburg', alt:['Johannesburgo'], cc:'ZA', ll:[-26.20,28.03] },
  { n:'Nairobi', cc:'KE', ll:[-1.29,36.82] },
  { n:'Lagos', cc:'NG', ll:[6.52,3.38] }
];

function normStr(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function escHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

let searchIndex = [];

function buildSearchIndex() {
  searchIndex = [];
  Object.entries(dataset).forEach(([code, d]) => {
    searchIndex.push({
      type: 'country', label: d.name, code,
      ll: d.latlng, intensity: d.intensity, region: d.region,
      hay: normStr(d.name + ' ' + code)
    });
  });
  CITY_COORDS.forEach(c => {
    const country = dataset[c.cc];
    if (!country) return;
    const names = [c.n].concat(c.alt || []);
    searchIndex.push({
      type: 'city', label: c.n, code: c.cc, ll: c.ll,
      intensity: country.intensity, region: country.name,
      hay: normStr(names.join(' ') + ' ' + country.name)
    });
  });
}

let msResults = [];
let msActive = -1;

function searchItems(q) {
  const nq = normStr(q.trim());
  if (!nq) return [];
  const scored = [];
  for (const item of searchIndex) {
    let score = -1;
    if (item.hay.startsWith(nq)) score = item.type === 'country' ? 100 : 90;
    else if (item.hay.includes(' ' + nq)) score = item.type === 'country' ? 80 : 70;
    else if (item.hay.includes(nq)) score = 50;
    if (score > 0) scored.push({ ...item, score });
  }
  return scored.sort((a, b) => b.score - a.score || b.intensity - a.intensity).slice(0, 8);
}

function renderMapSearch(q) {
  const wrap   = document.getElementById('mapSearch');
  const box    = document.getElementById('mapSearchResults');
  if (!box) return;
  wrap.classList.toggle('has-value', !!q.trim());
  msResults = searchItems(q);
  msActive  = -1;
  if (!q.trim()) { box.style.display = 'none'; return; }

  if (!msResults.length) {
    box.innerHTML = `<div class="ms-empty">Sin resultados para «${escHtml(q)}»</div>`;
    box.style.display = 'block';
    return;
  }
  const countries = msResults.filter(r => r.type === 'country');
  const cities    = msResults.filter(r => r.type === 'city');
  let html = '';
  const row = (r, i) => `
    <div class="ms-item${i === msActive ? ' active' : ''}" data-i="${i}" onmousedown="focusMapItem(${i})">
      <span class="ms-ico">${r.type === 'country' ? '🏳️' : '📍'}</span>
      <div class="ms-txt">
        <div class="ms-name">${escHtml(r.label)}</div>
        <div class="ms-sub">${r.type === 'country' ? escHtml(r.region || '') : '🏙️ ' + escHtml(r.region)}</div>
      </div>
      <span class="ms-score" style="color:${getHeatColor(r.intensity)}">${r.intensity}</span>
    </div>`;
  if (countries.length) html += `<div class="ms-group-title">Países</div>` + countries.map(r => row(r, msResults.indexOf(r))).join('');
  if (cities.length)    html += `<div class="ms-group-title">Ciudades</div>` + cities.map(r => row(r, msResults.indexOf(r))).join('');
  html += `<div class="ms-hint"><b>↑↓</b> navegar · <b>Enter</b> ir · <b>Esc</b> cerrar</div>`;
  box.innerHTML = html;
  box.style.display = 'block';
}

function closeMapSearch() {
  const box = document.getElementById('mapSearchResults');
  if (box) box.style.display = 'none';
}

function isGlobeMode() {
  return typeof currentView !== 'undefined' && currentView === '3d';
}

function highlightCountry2D(code) {
  if (!geoJsonLayer) return;
  geoJsonLayer.eachLayer(layer => {
    if (resolveCode(layer.feature) !== code) return;
    layer.setStyle({ weight: 2.5, color: '#0ea5e9', fillOpacity: 0.95 });
    setTimeout(() => geoJsonLayer.resetStyle(layer), 1800);
  });
}

function focusMapItem(i) {
  const r = msResults[i];
  if (!r) return;
  closeMapSearch();
  document.getElementById('mapSearchInput').value = '';
  document.getElementById('mapSearch').classList.remove('has-value');

  if (isGlobeMode() && typeof window.focusGlobeOn === 'function') {
    window.focusGlobeOn(r.ll, r.code);
  } else if (map && r.ll) {
    map.flyTo(r.ll, r.type === 'city' ? 6 : 4.5, { duration: 1.15 });
    highlightCountry2D(r.code);
  }
  if (typeof window.updateCountryPanel === 'function') window.updateCountryPanel(r.code);
}
window.focusMapItem = focusMapItem;
window.buildSearchIndex = buildSearchIndex;

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('mapSearchInput');
  const clearBtn = document.getElementById('mapSearchClear');
  if (!input) return;

  input.addEventListener('input', () => renderMapSearch(input.value));
  input.addEventListener('focus', () => { if (input.value.trim()) renderMapSearch(input.value); });
  input.addEventListener('keydown', e => {
    const box = document.getElementById('mapSearchResults');
    const open = box && box.style.display === 'block';
    if (e.key === 'ArrowDown' && open) {
      e.preventDefault();
      msActive = Math.min(msActive + 1, msResults.length - 1);
      box.querySelectorAll('.ms-item').forEach((el, i) => el.classList.toggle('active', i === msActive));
    } else if (e.key === 'ArrowUp' && open) {
      e.preventDefault();
      msActive = Math.max(msActive - 1, 0);
      box.querySelectorAll('.ms-item').forEach((el, i) => el.classList.toggle('active', i === msActive));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      focusMapItem(msActive >= 0 ? msActive : 0);
    } else if (e.key === 'Escape') {
      closeMapSearch();
      input.blur();
    }
  });
  document.addEventListener('click', e => {
    const wrap = document.getElementById('mapSearch');
    if (wrap && !wrap.contains(e.target)) closeMapSearch();
  });
  if (clearBtn) clearBtn.addEventListener('click', () => {
    input.value = '';
    document.getElementById('mapSearch').classList.remove('has-value');
    closeMapSearch();
    input.focus();
  });
});

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
  if (activeFilter === 'jobs')     return data.jobs > 0;
  if (activeFilter === 'freelance')return data.freelance > 0;
  if (activeFilter === 'contract') return data.contract > 0;
  if (activeFilter === 'training') return data.training > 0;
  if (activeFilter === 'fast')     return data.fastEntry === true;
  return true;
}

function styleFeature(feature) {
  const code = resolveCode(feature);
  const data = dataset[code];
  if (data && shouldShow(data)) {
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
      click: () => window.updateCountryPanel(code),
      mouseover: e => { e.target.setStyle({ weight: 2, color: '#dbe7ff', fillOpacity: 0.95 }); },
      mouseout:  () => { if (geoJsonLayer) geoJsonLayer.resetStyle(layer); }
    });
  } else {
    const name = feature.properties.name || feature.properties.NAME || 'País';
    layer.bindTooltip(`<span style="color:#64748b">${name}</span> — Sin datos`, { sticky: true });
    layer.on({
      mouseover: e => { e.target.setStyle({ fillOpacity: 0.75, color: '#334155' }); },
      mouseout:  () => { if (geoJsonLayer) geoJsonLayer.resetStyle(layer); }
    });
  }
}

function markerGlowIcon(color, radius) {
  const s = radius * 2;
  // Glow con radial-gradient (sin filter:blur — mucho más barato de componer)
  const glow = `radial-gradient(circle, ${color}59 0%, ${color}26 45%, ${color}00 70%)`;
  return L.divIcon({
    className: 'cr-marker',
    html:
      `<span class="cr-glow" style="width:${s * 2.7}px;height:${s * 2.7}px;background:${glow}"></span>` +
      `<span class="cr-pulse" style="width:${s * 1.6}px;height:${s * 1.6}px;--c:${color}"></span>` +
      `<span class="cr-core" style="width:${s}px;height:${s}px;background:${color}"></span>`,
    iconSize: [s * 2.7, s * 2.7],
    iconAnchor: [s * 1.35, s * 1.35]
  });
}

let selectedMarkerEl = null;

function renderMarkers() {
  if (!markerLayer) return;
  markerLayer.clearLayers();
  selectedMarkerEl = null;
  Object.entries(dataset).forEach(([code, data]) => {
    if (!shouldShow(data)) return;
    const radius = Math.max(5, Math.min(14, 3 + Math.round(data.intensity / 10)));
    const m = L.marker(data.latlng, { icon: markerGlowIcon(getHeatColor(data.intensity), radius), keyboard: false })
      .bindTooltip(
        `<strong>${data.name}</strong>${data.fastEntry ? ' ⚡' : ''}<br>Intensidad: ${data.intensity}<br>${getBadges(data)}`,
        { direction: 'top', offset: [0, -radius] }
      );
    m.on('click', () => {
      if (selectedMarkerEl) selectedMarkerEl.classList.remove('selected');
      const el = m.getElement();
      if (el) { el.classList.add('selected'); selectedMarkerEl = el; }
      window.updateCountryPanel(code);
    });
    markerLayer.addLayer(m);
  });
}

function getBadges(data) {
  const b = [];
  if (data.jobs > 0)      b.push(`💼 ${data.jobs} empleo`);
  if (data.freelance > 0) b.push(`🛠️ ${data.freelance} freelance`);
  if (data.contract > 0)  b.push(`📋 ${data.contract} contratos`);
  if (data.fastEntry)     b.push('⚡ Entrada rápida');
  return b.join(' &bull; ');
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
    <div style="display:flex;align-items:center;gap:.5rem;padding:.35rem .2rem;cursor:pointer;border-bottom:1px solid #0f2540"
         onclick="updateCountryPanel('${code}')">
      <span style="font-size:.75rem;font-weight:800;color:#334155;min-width:16px">${i+1}</span>
      <div style="flex:1">
        <div style="font-size:.8rem;font-weight:700;color:#dbe7ff">${d.name}${d.fastEntry ? ' ⚡' : ''}</div>
        <div style="font-size:.65rem;color:#475569">${top ? '🔥 ' + top.role : d.contractType}</div>
      </div>
      <span style="font-size:.82rem;font-weight:800;color:${getHeatColor(d.intensity)}">${d.intensity}</span>
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
  const asiaR = ['Asia','Asia Oriental','Asia Meridional','Asia Occidental','Sudeste Asiatico','Asia Central','Pacífico'];
  const africaR= ['África Austral','África Oriental','África Central','África Septentrional','África Subsahariana','África Occidental','África del Norte'];
  set('kpiEurope',   vals.filter(v => v.region === 'Europe').reduce((a, b) => a + b.jobs, 0));
  set('kpiLatam',    vals.filter(v => v.region === 'LATAM').reduce((a, b) => a + b.jobs, 0));
  set('kpiNorthAm',  vals.filter(v => v.region === 'North America').reduce((a, b) => a + b.jobs, 0));
  set('kpiAsia',     vals.filter(v => asiaR.includes(v.region)).reduce((a, b) => a + b.jobs, 0));
  set('kpiAfrica',   vals.filter(v => africaR.includes(v.region)).reduce((a, b) => a + b.jobs, 0));
  set('kpiFreelance',vals.reduce((a, b) => a + b.freelance, 0));
  set('kpiContract', vals.reduce((a, b) => a + (b.contract || 0), 0));
  set('kpiJobs',     vals.reduce((a, b) => a + b.jobs, 0));
  set('kpiFast',     vals.filter(v => v.fastEntry).length);
  set('statJobs',    vals.reduce((a, b) => a + b.jobs, 0));
  set('statServices',vals.reduce((a, b) => a + b.freelance, 0));
  set('statContracts',vals.reduce((a, b) => a + (b.contract || 0), 0));
  set('statCountries',vals.length);
}

/* ─── Detalle por país — Regional Intelligence Board ─── */
const RIB_REGION_MAP = {
  'North America': r => r === 'North America',
  'Europe':        r => r === 'Europe',
  'LATAM':         r => r === 'LATAM',
  'Asia':          r => ['Asia', 'Asia Oriental', 'Asia Meridional', 'Asia Occidental', 'Sudeste Asiatico', 'Asia Central', 'Pacífico'].includes(r),
  'Middle East':   r => r === 'Middle East',
  'Africa':        r => ['África Austral', 'África Oriental', 'África Central', 'África Septentrional', 'África Subsahariana', 'África Occidental', 'África del Norte'].includes(r),
  'Oceania':       r => r === 'Oceania'
};

function renderRibCards(region) {
  const el = document.getElementById('ribCountries');
  if (!el || !Object.keys(dataset).length) return;
  const match = region === 'all' ? () => true : (RIB_REGION_MAP[region] || (() => false));
  const items = Object.entries(dataset)
    .filter(([, d]) => match(d.region))
    .sort((a, b) => b[1].intensity - a[1].intensity);
  if (!items.length) {
    el.innerHTML = '<div class="rc-empty">Sin países en esta región.</div>';
    return;
  }
  el.innerHTML = items.map(([code, d]) => `
    <div class="rc-card" onclick="updateCountryPanel('${code}');document.querySelector('.umap-section').scrollIntoView({behavior:'smooth'})">
      <div class="rc-top">
        <span class="rc-name">${d.name}${d.fastEntry ? ' ⚡' : ''}</span>
        <span class="rc-score" style="color:${getHeatColor(d.intensity)}">${d.intensity}</span>
      </div>
      <div class="rc-sub">${escHtml(d.region || '')} · Tier ${d.tier || '—'}</div>
      <div class="rc-stats">
        <span>💼 ${d.jobs || 0}</span>
        <span>🛠️ ${d.freelance || 0}</span>
        <span>📋 ${d.contract || 0}</span>
      </div>
      <div class="rc-salary">💰 ${escHtml(d.salary || '')}</div>
    </div>`).join('');
}

function filterCards(region, btn) {
  document.querySelectorAll('.rib-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderRibCards(region);
}
window.filterCards = filterCards;

function refreshAll() {
  if (geoJsonLayer) geoJsonLayer.setStyle(styleFeature);
  renderMarkers();
  renderRanking();
  renderFeed();
  renderKpis();
  if (typeof renderCards === 'function') renderCards('all');
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

async function init() {
  try {
    const [r1, r2, r3, r4, r5] = await Promise.all([
      fetch('data/countries.json'),
      fetch('data/countries-extra.json'),
      fetch('data/africa-new.json'),
      fetch('data/world-expansion.json'),
      fetch('data/world-batch3.json')
    ]);
    if (!r1.ok) throw new Error('countries.json '      + r1.status);
    if (!r2.ok) throw new Error('countries-extra.json '+ r2.status);
    if (!r3.ok) throw new Error('africa-new.json '     + r3.status);
    if (!r4.ok) throw new Error('world-expansion.json '+ r4.status);
    if (!r5.ok) throw new Error('world-batch3.json '   + r5.status);

    const [main, extra, africaNew, worldExp, batch3] = await Promise.all([
      r1.json(), r2.json(), r3.json(), r4.json(), r5.json()
    ]);
    dataset = { ...main, ...extra, ...africaNew, ...worldExp, ...batch3 };
    window.dataset = dataset;
    buildSearchIndex();

    // Init 2D map — attach to #map2d
    // Sin arrastre ni paneo: solo zoom puro (centro fijo). La navegación
    // es vía buscador, marcadores, ranking y botones de región (flyTo/setView).
    map = L.map('map2d', {
      dragging: false,            // sin arrastre mouse/touch
      touchZoom: false,           // sin pinch (mueve el centro)
      scrollWheelZoom: 'center',  // zoom puro, centro fijo
      doubleClickZoom: 'center',  // zoom puro, centro fijo
      boxZoom: false,
      keyboard: false,            // sin paneo con flechas
      worldCopyJump: false,
      preferCanvas: true,         // GeoJSON en canvas — mucho más ligero que SVG
      minZoom: 2,
      maxZoom: 8
    }).setView([20, 10], 2);
    map.zoomControl.setPosition('bottomright');
    window._leafletMap = map;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OSM contributors',
      subdomains: 'abcd', maxZoom: 19
    }).addTo(map);
    // Capa de etiquetas (nombres de países y ciudades) sobre el mapa oscuro
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      attribution: '', subdomains: 'abcd', maxZoom: 19, opacity: 0.9
    }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);

    await loadGeoJson();
    refreshAll();
    renderRibCards('all');
    window.updateCountryPanel('US');
    setTimeout(() => map.invalidateSize(), 300);

  } catch (err) {
    console.error('[CyberRemote] init() failed:', err);
    const el = document.getElementById('map2d');
    if (el) el.innerHTML = `<div style="color:#f87171;padding:2rem;font-size:.85rem">⚠️ Error: ${err.message}</div>`;
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
