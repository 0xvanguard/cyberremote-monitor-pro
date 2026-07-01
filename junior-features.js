/* ═══════════════════════════════════════════════════════════════
   CyberRemote Monitor — Junior Pro Features v2.0
   Features: #1 Onboarding modal · #2 Role roadmap+certs · #3 Role search
             #4 Mobile panel · #5 Tier badges · #6 Export CSV
═══════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────────
   FEATURE #1 — ONBOARDING MODAL + GLOSARIO
────────────────────────────────────────────────────────────── */
function initOnboarding() {
  if (localStorage.getItem('crm_onboarded')) return;
  const modal = document.getElementById('onboardingModal');
  if (modal) modal.classList.add('active');
}

function closeOnboarding(remember) {
  const modal = document.getElementById('onboardingModal');
  if (modal) modal.classList.remove('active');
  if (remember) localStorage.setItem('crm_onboarded', '1');
}

function openGlossary() {
  const gl = document.getElementById('glossaryDrawer');
  if (gl) gl.classList.add('active');
}

function closeGlossary() {
  const gl = document.getElementById('glossaryDrawer');
  if (gl) gl.classList.remove('active');
}

window.closeOnboarding = closeOnboarding;
window.openGlossary    = openGlossary;
window.closeGlossary   = closeGlossary;

/* ──────────────────────────────────────────────────────────────
   FEATURE #2 — ROLE ROADMAP + CERTIFICACIONES
────────────────────────────────────────────────────────────── */
const ROLE_CERTS = {
  'SOC Analyst':      { certs: ['CompTIA Security+', 'CompTIA CySA+', 'BTL1'],          time: '4–8 meses', platforms: ['TryHackMe', 'HackTheBox', 'LetsDefend'], level: 'Junior' },
  'SOC':              { certs: ['CompTIA Security+', 'CompTIA CySA+', 'BTL1'],          time: '4–8 meses', platforms: ['TryHackMe', 'LetsDefend'],              level: 'Junior' },
  'GRC':              { certs: ['ISO 27001 Lead Impl.', 'CISM', 'CompTIA Security+'],   time: '6–10 meses', platforms: ['Coursera', 'ISACA', 'Udemy'],            level: 'Junior/Mid' },
  'ISO 27001':        { certs: ['ISO 27001 Lead Impl.', 'CISM'],                        time: '6–10 meses', platforms: ['PECB', 'Coursera'],                     level: 'Junior/Mid' },
  'Pentester':        { certs: ['eJPT (INE)', 'PNPT (TCM)', 'CEH'],                    time: '6–12 meses', platforms: ['HackTheBox', 'TryHackMe', 'TCM Security'],level: 'Junior/Mid' },
  'Pentest':          { certs: ['eJPT (INE)', 'PNPT (TCM)', 'CEH'],                    time: '6–12 meses', platforms: ['HackTheBox', 'TCM Security'],            level: 'Junior/Mid' },
  'AppSec':           { certs: ['GWEB (GIAC)', 'OSCP', 'eWPT'],                        time: '8–14 meses', platforms: ['PortSwigger Web Academy', 'HackTheBox'], level: 'Mid' },
  'Cloud Security':   { certs: ['AWS Security Specialty', 'AZ-500', 'CCSP'],           time: '6–12 meses', platforms: ['AWS Training', 'A Cloud Guru', 'Udemy'],  level: 'Junior/Mid' },
  'Cloud':            { certs: ['AWS Security Specialty', 'AZ-500'],                    time: '6–10 meses', platforms: ['AWS Training', 'A Cloud Guru'],           level: 'Junior/Mid' },
  'OT':               { certs: ['GICSP (GIAC)', 'CompTIA Security+', 'ICS-CERT'],       time: '10–18 meses', platforms: ['SANS ICS', 'Dragos Academy'],            level: 'Mid/Senior' },
  'ICS':              { certs: ['GICSP (GIAC)', 'ICS-CERT'],                            time: '10–18 meses', platforms: ['SANS ICS', 'Dragos Academy'],            level: 'Mid/Senior' },
  'Blockchain':       { certs: ['Certified Blockchain Security Pro', 'OSCP'],           time: '8–14 meses', platforms: ['Consensys Academy', 'Cyfrin Updraft'],   level: 'Mid' },
  'Incident Response':{ certs: ['GCFE (GIAC)', 'BTL1', 'ECIH (EC-Council)'],           time: '6–10 meses', platforms: ['LetsDefend', 'BTLO', 'TryHackMe'],       level: 'Junior/Mid' },
  'Network Security': { certs: ['CompTIA Network+', 'CompTIA Security+', 'CCNA'],      time: '4–8 meses', platforms: ['CBT Nuggets', 'Cisco NetAcad', 'TryHackMe'],level: 'Junior' },
  'Threat Intelligence':{ certs: ['GCTI (GIAC)', 'CompTIA CySA+'],                     time: '6–10 meses', platforms: ['MISP Project', 'Coursera', 'TryHackMe'], level: 'Junior/Mid' },
  'DevSecOps':        { certs: ['CKS (Kubernetes)', 'AWS DevOps', 'CompTIA Security+'],time: '8–14 meses', platforms: ['A Cloud Guru', 'GitHub Learning Lab'],    level: 'Mid' },
  'Freelance':        { certs: ['CompTIA Security+', 'eJPT (INE)'],                    time: '3–6 meses',  platforms: ['Upwork', 'Fiverr', 'HackTheBox'],         level: 'Junior' },
  'IT Security':      { certs: ['CompTIA Security+', 'CompTIA A+'],                    time: '3–6 meses',  platforms: ['TryHackMe', 'CBT Nuggets'],                level: 'Junior' },
  'default':          { certs: ['CompTIA Security+'],                                   time: '3–6 meses',  platforms: ['TryHackMe'],                               level: 'Junior' }
};

function getRoleCerts(roleName) {
  for (const [key, val] of Object.entries(ROLE_CERTS)) {
    if (roleName.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return ROLE_CERTS.default;
}

function buildRoadmapHTML(role) {
  const info = getRoleCerts(role.role);
  const platforms = info.platforms.map(p => {
    const urls = {
      'TryHackMe': 'https://tryhackme.com',
      'HackTheBox': 'https://hackthebox.com',
      'LetsDefend': 'https://letsdefend.io',
      'PortSwigger Web Academy': 'https://portswigger.net/web-security',
      'Coursera': 'https://coursera.org',
      'Udemy': 'https://udemy.com',
      'TCM Security': 'https://tcm-sec.com',
      'AWS Training': 'https://aws.amazon.com/training',
      'A Cloud Guru': 'https://acloudguru.com',
      'BTLO': 'https://blueteamlabs.online',
      'SANS ICS': 'https://www.sans.org/ics',
      'Consensys Academy': 'https://consensys.io/academy',
      'Cyfrin Updraft': 'https://updraft.cyfrin.io',
      'PECB': 'https://pecb.com',
      'ISACA': 'https://isaca.org',
      'CBT Nuggets': 'https://cbtnuggets.com',
      'Cisco NetAcad': 'https://netacad.com',
      'GitHub Learning Lab': 'https://skills.github.com',
      'Dragos Academy': 'https://www.dragos.com/community',
      'Upwork': 'https://upwork.com'
    };
    const url = urls[p] || '#';
    return `<a href="${url}" target="_blank" rel="noreferrer" class="road-platform-link">${p}</a>`;
  }).join('');

  return `
  <div class="roadmap-card">
    <div class="road-header">
      <div>
        <div class="road-role-name">${role.role}</div>
        <div class="road-meta">⏱ ${info.time} &nbsp;·&nbsp; 🎯 Nivel: ${info.level}</div>
      </div>
      <div class="road-demand-badge" style="background:${getHCLocal(role.demand)}22;color:${getHCLocal(role.demand)};border:1px solid ${getHCLocal(role.demand)}44">${role.demand}/100</div>
    </div>
    <div class="road-section-lbl">📜 Certificaciones recomendadas</div>
    <div class="road-certs">${info.certs.map(c => `<span class="road-cert">${c}</span>`).join('')}</div>
    <div class="road-section-lbl">📚 Plataformas de práctica</div>
    <div class="road-platforms">${platforms}</div>
    ${role.note ? `<div class="road-note">💡 ${role.note}</div>` : ''}
  </div>`;
}

function getHCLocal(i) {
  if (i >= 90) return '#16a34a';
  if (i >= 75) return '#4ade80';
  if (i >= 60) return '#f59e0b';
  if (i >= 45) return '#0ea5e9';
  if (i >= 25) return '#6366f1';
  return '#475569';
}

/* ──────────────────────────────────────────────────────────────
   FEATURE #3 — BUSCADOR GLOBAL POR ROL
────────────────────────────────────────────────────────────── */
function initRoleSearch() {
  const input = document.getElementById('roleSearchInput');
  if (!input) return;
  input.addEventListener('input', debounce(handleRoleSearch, 220));
}

function handleRoleSearch(e) {
  const query = e.target.value.trim().toLowerCase();
  const resultsEl = document.getElementById('roleSearchResults');
  if (!resultsEl) return;

  if (!query || query.length < 2) {
    resultsEl.style.display = 'none';
    resultsEl.innerHTML = '';
    // reset map highlight
    if (window._leafletMap && window._geoJsonLayer) {
      window._geoJsonLayer.setStyle(window._styleFeature);
    }
    return;
  }

  const matches = [];
  if (window.dataset) {
    for (const [code, data] of Object.entries(window.dataset)) {
      if (!data.topRoles) continue;
      const matchedRoles = data.topRoles.filter(r =>
        r.role.toLowerCase().includes(query)
      );
      if (matchedRoles.length) {
        matches.push({ code, data, roles: matchedRoles });
      }
    }
  }

  matches.sort((a, b) => {
    const maxA = Math.max(...a.roles.map(r => r.demand));
    const maxB = Math.max(...b.roles.map(r => r.demand));
    return maxB - maxA;
  });

  if (!matches.length) {
    resultsEl.style.display = 'block';
    resultsEl.innerHTML = `<div class="rsr-empty">Sin resultados para "${query}"</div>`;
    return;
  }

  resultsEl.style.display = 'block';
  resultsEl.innerHTML = `
    <div class="rsr-header">${matches.length} países con rol "${query}"</div>
    ${matches.slice(0, 12).map(m => {
      const topDemand = Math.max(...m.roles.map(r => r.demand));
      const col = getHCLocal(topDemand);
      return `
      <div class="rsr-item" onclick="selectSearchResult('${m.code}')">
        <div class="rsr-country">${m.data.name}${m.data.fastEntry ? ' ⚡' : ''}</div>
        <div class="rsr-roles">${m.roles.map(r =>
          `<span style="color:${getHCLocal(r.demand)}">${r.role} (${r.demand})</span>`
        ).join(', ')}</div>
        <div class="rsr-badge" style="background:${col}22;color:${col}">${topDemand}/100</div>
      </div>`;
    }).join('')}
    ${matches.length > 12 ? `<div class="rsr-more">+${matches.length - 12} países más</div>` : ''}
  `;
}

function selectSearchResult(code) {
  const resultsEl = document.getElementById('roleSearchResults');
  if (resultsEl) resultsEl.style.display = 'none';
  document.getElementById('roleSearchInput').value = '';
  if (typeof window.updateCountryPanel === 'function') window.updateCountryPanel(code);
  const panel = document.getElementById('umapPanel');
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.selectSearchResult = selectSearchResult;

function debounce(fn, ms) {
  let t;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

/* ──────────────────────────────────────────────────────────────
   FEATURE #5 — TIER BADGES EN PANEL Y CARDS
────────────────────────────────────────────────────────────── */
const TIER_META = {
  1: { label: 'Tier 1', desc: 'Mercado maduro · Contratar ahora',        color: '#16a34a', bg: '#16a34a18', icon: '🟢' },
  2: { label: 'Tier 2', desc: 'Emergente · Prepararse 3–6 meses',       color: '#0ea5e9', bg: '#0ea5e918', icon: '🔵' },
  3: { label: 'Tier 3', desc: 'Incipiente · Freelance remoto viable',   color: '#f59e0b', bg: '#f59e0b18', icon: '🟡' },
  4: { label: 'Tier 4', desc: 'Sin mercado local · No recomendado',     color: '#f87171', bg: '#f8717118', icon: '🔴' }
};

function buildTierBadgeHTML(tier) {
  const t = TIER_META[tier] || TIER_META[3];
  return `<span class="tier-badge" style="background:${t.bg};color:${t.color};border:1px solid ${t.color}44">${t.icon} ${t.label} — ${t.desc}</span>`;
}

window.buildTierBadgeHTML = buildTierBadgeHTML;

/* ──────────────────────────────────────────────────────────────
   FEATURE #6 — EXPORT CSV / JSON
────────────────────────────────────────────────────────────── */
const exportList = new Set();

function toggleExportCountry(code) {
  if (exportList.has(code)) {
    exportList.delete(code);
  } else {
    exportList.add(code);
  }
  updateExportBtnState();
}

function updateExportBtnState() {
  const btn = document.getElementById('exportBtn');
  const counter = document.getElementById('exportCounter');
  if (!btn || !counter) return;
  const count = exportList.size;
  counter.textContent = count;
  btn.style.opacity   = count > 0 ? '1' : '0.5';
  btn.style.pointerEvents = count > 0 ? 'auto' : 'none';
}

function exportToCSV() {
  if (!window.dataset || !exportList.size) return;
  const rows = [[
    'Código', 'País', 'Región', 'Score', 'Tier', 'Empleos',
    'Freelance', 'Contratos', 'Salario', 'Sector líder',
    'Entrada rápida', 'Top Rol', 'Demanda top rol',
    'Certs sugeridas', 'Tiempo estimado', 'Plataformas'
  ]];

  for (const code of exportList) {
    const d = window.dataset[code];
    if (!d) continue;
    const topRole  = d.topRoles ? d.topRoles.reduce((a, b) => a.demand > b.demand ? a : b) : null;
    const certInfo = topRole ? getRoleCerts(topRole.role) : ROLE_CERTS.default;
    rows.push([
      code,
      d.name,
      d.region,
      d.intensity,
      d.tier || '—',
      d.jobs,
      d.freelance,
      d.contract || 0,
      `"${d.salary || ''}"`  ,
      `"${d.contractType || ''}"`,
      d.fastEntry ? 'Sí' : 'No',
      topRole ? `"${topRole.role}"` : '—',
      topRole ? topRole.demand : '—',
      `"${certInfo.certs.join(' | ')}"`,
      certInfo.time,
      `"${certInfo.platforms.join(' | ')}"`
    ]);
  }

  const csv  = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `cyberremote-plan-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToJSON() {
  if (!window.dataset || !exportList.size) return;
  const result = {};
  for (const code of exportList) {
    if (window.dataset[code]) result[code] = window.dataset[code];
  }
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `cyberremote-plan-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearExportList() {
  exportList.clear();
  updateExportBtnState();
  document.querySelectorAll('.export-check').forEach(el => el.classList.remove('active'));
}

window.toggleExportCountry = toggleExportCountry;
window.exportToCSV         = exportToCSV;
window.exportToJSON        = exportToJSON;
window.clearExportList     = clearExportList;

/* ──────────────────────────────────────────────────────────────
   PATCH updateCountryPanel — inject roadmap + tier badge
────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  /* Patch: wrap original showCountryPanel to inject extras */
  const _original = window.updateCountryPanel;
  window.updateCountryPanel = function(code) {
    if (_original) _original(code);
    const d = window.dataset && window.dataset[code];
    if (!d) return;

    /* — Tier badge — */
    let tierEl = document.getElementById('upTierBadge');
    if (!tierEl) {
      tierEl = document.createElement('div');
      tierEl.id = 'upTierBadge';
      tierEl.style.marginBottom = '.5rem';
      const iw = document.getElementById('upIntensityWrap');
      if (iw) iw.parentNode.insertBefore(tierEl, iw);
    }
    tierEl.innerHTML = d.tier ? buildTierBadgeHTML(d.tier) : '';

    /* — Roadmap cards — */
    let roadEl = document.getElementById('upRoadmap');
    if (!roadEl) {
      roadEl = document.createElement('div');
      roadEl.id = 'upRoadmap';
      const rw = document.getElementById('upRolesWrap');
      if (rw) rw.parentNode.insertBefore(roadEl, rw.nextSibling);
    }
    if (d.topRoles && d.topRoles.length) {
      roadEl.innerHTML = `
        <div class="up-section-title" style="margin-top:.6rem;margin-bottom:.5rem">🛣️ Roadmap al rol</div>
        <div class="roadmap-scroll">${d.topRoles.map(buildRoadmapHTML).join('')}</div>`;
    } else {
      roadEl.innerHTML = '';
    }

    /* — Export toggle button — */
    let expBtn = document.getElementById('upExportToggle');
    if (!expBtn) {
      expBtn = document.createElement('button');
      expBtn.id = 'upExportToggle';
      expBtn.className = 'export-check-btn';
      const tagsEl = document.getElementById('upTags');
      if (tagsEl) tagsEl.parentNode.insertBefore(expBtn, tagsEl);
    }
    const inList = exportList.has(code);
    expBtn.innerHTML = inList ? '✓ En mi lista de exportación' : '+ Añadir a mi lista';
    expBtn.className = 'export-check-btn' + (inList ? ' active' : '');
    expBtn.onclick = () => {
      toggleExportCountry(code);
      window.updateCountryPanel(code);
    };
  };

  /* Init all features */
  initOnboarding();
  initRoleSearch();

  /* Close search on outside click */
  document.addEventListener('click', e => {
    const wrap = document.getElementById('roleSearchWrap');
    const results = document.getElementById('roleSearchResults');
    if (wrap && results && !wrap.contains(e.target)) {
      results.style.display = 'none';
    }
  });
});
