/**
 * remotive-feed.js
 * Integración en tiempo real con la API pública de Remotive.com
 * Enriquece el dataset global con empleos REALES de ciberseguridad.
 * Sin API key requerida. CORS-friendly desde el navegador.
 */

// ─── Configuración ────────────────────────────────────────────────────────────
const REMOTIVE_BASE = 'https://remotive.com/api/remote-jobs';

const CYBER_CATEGORIES = [
  'software-dev',       // incluye security engineers
  'devops-sysadmin',    // DevSecOps
];

const CYBER_KEYWORDS = [
  'security', 'cybersecurity', 'pentest', 'penetration',
  'soc analyst', 'devsecops', 'appsec', 'infosec',
  'oscp', 'cloud security', 'siem', 'threat', 'red team',
  'blue team', 'vulnerability', 'malware', 'forensic',
  'compliance', 'iam', 'zero trust', 'sast', 'dast'
];

// Mapa de país (nombre en inglés) → código ISO2 que usa tu dataset
const COUNTRY_TO_CODE = {
  'United States':        'US',
  'USA':                  'US',
  'United Kingdom':       'GB',
  'UK':                   'GB',
  'Germany':              'DE',
  'Canada':               'CA',
  'Australia':            'AU',
  'Netherlands':          'NL',
  'France':               'FR',
  'Spain':                'ES',
  'Portugal':             'PT',
  'Brazil':               'BR',
  'Colombia':             'CO',
  'Argentina':            'AR',
  'Mexico':               'MX',
  'India':                'IN',
  'Singapore':            'SG',
  'Poland':               'PL',
  'Romania':              'RO',
  'Ukraine':              'UA',
  'Israel':               'IL',
  'Ireland':              'IE',
  'Sweden':               'SE',
  'Norway':               'NO',
  'Denmark':              'DK',
  'Switzerland':          'CH',
  'Italy':                'IT',
  'Belgium':              'BE',
  'Czech Republic':       'CZ',
  'South Africa':         'ZA',
  'Nigeria':              'NG',
  'Kenya':                'KE',
  'Philippines':          'PH',
  'Japan':                'JP',
  'South Korea':          'KR',
  'Taiwan':               'TW',
  'New Zealand':          'NZ',
  'Turkey':               'TR',
  'UAE':                  'AE',
  'Saudi Arabia':         'SA',
  'Egypt':                'EG',
  'Pakistan':             'PK',
  'Bangladesh':           'BD',
  'Sri Lanka':            'LK',
  'Worldwide':            null,  // empleos 100% remotos globales
};

// ─── Utilidades ───────────────────────────────────────────────────────────────

function isCyberJob(job) {
  const text = `${job.title} ${job.tags?.join(' ') || ''} ${job.description?.slice(0, 300) || ''}`.toLowerCase();
  return CYBER_KEYWORDS.some(kw => text.includes(kw));
}

function extractCountryCode(job) {
  // candidate_required_location puede ser "Worldwide", "USA", "UK, Germany", etc.
  const loc = job.candidate_required_location || '';

  for (const [name, code] of Object.entries(COUNTRY_TO_CODE)) {
    if (loc.includes(name)) return code;
  }
  // Fallback: si dice "Worldwide" o está vacío → null (global)
  if (!loc || loc.toLowerCase().includes('worldwide') || loc.toLowerCase().includes('anywhere')) return null;
  return null;
}

function formatSalary(job) {
  if (job.salary) return job.salary;
  return 'Negotiable';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// ─── Fetcher principal ────────────────────────────────────────────────────────

/**
 * Descarga empleos de Remotive por categoría y filtra los de ciberseguridad.
 * @returns {Promise<Array>} Lista de empleos cyber con metadatos normalizados
 */
async function fetchCyberJobsFromRemotive() {
  const allJobs = [];

  for (const category of CYBER_CATEGORIES) {
    try {
      const url = `${REMOTIVE_BASE}?category=${category}&limit=100`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      const jobs = json.jobs || [];
      allJobs.push(...jobs);
    } catch (err) {
      console.warn(`[Remotive] Error fetching category ${category}:`, err.message);
    }
  }

  // Deduplicar por ID y filtrar solo empleos cyber
  const seen = new Set();
  return allJobs
    .filter(j => {
      if (seen.has(j.id)) return false;
      seen.add(j.id);
      return isCyberJob(j);
    })
    .map(j => ({
      id:          j.id,
      title:       j.title,
      company:     j.company_name,
      url:         j.url,
      countryCode: extractCountryCode(j),
      location:    j.candidate_required_location || 'Worldwide',
      salary:      formatSalary(j),
      tags:        j.tags || [],
      postedAt:    timeAgo(j.publication_date),
      rawDate:     j.publication_date,
      logo:        j.company_logo,
      isRemote:    true,
    }));
}

// ─── Enriquecedor de dataset ──────────────────────────────────────────────────

/**
 * Toma los empleos reales de Remotive e inyecta los conteos
 * en el dataset global que usa app.js.
 * @param {Object} dataset  — window.dataset de app.js
 * @param {Array}  cyberJobs — resultado de fetchCyberJobsFromRemotive()
 */
function enrichDatasetWithRemotive(dataset, cyberJobs) {
  // Conteo por país
  const countByCode = {};
  const jobsByCode  = {};

  cyberJobs.forEach(job => {
    const code = job.countryCode;
    if (!code) return; // empleos "Worldwide" se muestran en feed global

    countByCode[code] = (countByCode[code] || 0) + 1;
    if (!jobsByCode[code]) jobsByCode[code] = [];
    jobsByCode[code].push(job);
  });

  // Inyectar en dataset
  Object.entries(countByCode).forEach(([code, count]) => {
    if (dataset[code]) {
      // Enriquecer entrada existente
      dataset[code].liveJobs     = count;
      dataset[code].liveJobsList = jobsByCode[code];
      // Recalcular intensidad combinando datos estáticos + live
      const staticJobs = dataset[code].jobs || 0;
      const combined   = staticJobs + count;
      dataset[code].intensity = Math.min(99, Math.round(combined * 1.8));
      // Agregar señales al feed
      const topJob = jobsByCode[code][0];
      dataset[code].signals = [
        `🔴 LIVE: "${topJob.title}" @ ${topJob.company} (${topJob.postedAt})`,
        ...(dataset[code].signals || []).slice(0, 3)
      ];
    }
  });

  // Guardar referencia global para el panel lateral
  window.remotiveJobs   = cyberJobs;
  window.remotiveByCode = jobsByCode;

  console.log(`[Remotive] ✅ ${cyberJobs.length} cyber jobs cargados — ${Object.keys(countByCode).length} países activos`);
  return dataset;
}

// ─── Panel de empleos en sidebar ─────────────────────────────────────────────

/**
 * Renderiza la lista de empleos reales de Remotive para un país dado.
 * Llama esto desde updateCountryPanel() en index.html.
 * @param {string} countryCode — ISO2
 */
function renderRemotivePanel(countryCode) {
  const container = document.getElementById('remotiveJobsList');
  if (!container) return;

  const jobs = (window.remotiveByCode || {})[countryCode] || [];

  if (jobs.length === 0) {
    container.innerHTML = `
      <div style="color:#475569;font-size:.78rem;text-align:center;padding:1rem 0">
        No hay empleos live en este país.<br>
        <a href="https://remotive.com/remote-jobs/security" target="_blank"
           style="color:#38bdf8">Ver todos en Remotive →</a>
      </div>`;
    return;
  }

  container.innerHTML = jobs.slice(0, 6).map(job => `
    <a href="${job.url}" target="_blank" rel="noopener" class="remotive-job-card">
      <div class="rjc-header">
        ${job.logo
          ? `<img src="${job.logo}" class="rjc-logo" alt="${job.company}" onerror="this.style.display='none'">`
          : `<div class="rjc-logo-placeholder">🔐</div>`
        }
        <div class="rjc-info">
          <div class="rjc-title">${job.title}</div>
          <div class="rjc-company">${job.company}</div>
        </div>
        <span class="rjc-badge">LIVE</span>
      </div>
      <div class="rjc-meta">
        <span>💰 ${job.salary}</span>
        <span>📍 ${job.location}</span>
        <span>🕐 ${job.postedAt}</span>
      </div>
      ${job.tags.slice(0,4).map(t => `<span class="rjc-tag">${t}</span>`).join('')}
    </a>
  `).join('');
}

window.renderRemotivePanel = renderRemotivePanel;

// ─── CSS dinámico ─────────────────────────────────────────────────────────────

function injectRemotiveStyles() {
  if (document.getElementById('remotive-styles')) return;
  const style = document.createElement('style');
  style.id = 'remotive-styles';
  style.textContent = `
    .remotive-job-card {
      display: block;
      background: #0d1f33;
      border: 1px solid #1e3a5f;
      border-radius: 8px;
      padding: .65rem .75rem;
      margin-bottom: .5rem;
      text-decoration: none;
      color: inherit;
      transition: border-color .2s, background .2s;
    }
    .remotive-job-card:hover {
      border-color: #38bdf8;
      background: #0f2540;
    }
    .rjc-header {
      display: flex;
      align-items: center;
      gap: .5rem;
      margin-bottom: .4rem;
    }
    .rjc-logo {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      object-fit: contain;
      background: #1e3a5f;
    }
    .rjc-logo-placeholder {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      background: #1e3a5f;
      border-radius: 4px;
    }
    .rjc-info { flex: 1; min-width: 0; }
    .rjc-title {
      font-size: .78rem;
      font-weight: 700;
      color: #dbe7ff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rjc-company {
      font-size: .68rem;
      color: #64748b;
    }
    .rjc-badge {
      font-size: .6rem;
      font-weight: 800;
      color: #00ff88;
      background: #00ff8815;
      border: 1px solid #00ff8840;
      border-radius: 4px;
      padding: 1px 5px;
      letter-spacing: 1px;
      flex-shrink: 0;
    }
    .rjc-meta {
      display: flex;
      flex-wrap: wrap;
      gap: .35rem;
      font-size: .67rem;
      color: #64748b;
      margin-bottom: .35rem;
    }
    .rjc-tag {
      font-size: .62rem;
      background: #1e3a5f;
      color: #93c5fd;
      border-radius: 3px;
      padding: 1px 5px;
      display: inline-block;
      margin: 1px;
    }
  `;
  document.head.appendChild(style);
}

// ─── Inicialización pública ───────────────────────────────────────────────────

/**
 * Punto de entrada. Llamar después de que dataset esté cargado.
 * @param {Object} dataset — window.dataset
 * @returns {Promise<Array>} cyberJobs
 */
async function initRemotiveFeed(dataset) {
  injectRemotiveStyles();

  // Indicador de carga en UI
  const badge = document.getElementById('remotiveBadge');
  if (badge) badge.textContent = '⟳ Cargando...';

  const jobs = await fetchCyberJobsFromRemotive();
  enrichDatasetWithRemotive(dataset, jobs);

  // Actualizar badge con conteo real
  if (badge) {
    badge.textContent = `🔴 LIVE: ${jobs.length} empleos`;
    badge.style.color = '#00ff88';
  }

  return jobs;
}

window.initRemotiveFeed = initRemotiveFeed;
window.renderRemotivePanel = renderRemotivePanel;
